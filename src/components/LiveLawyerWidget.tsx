'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { GoogleGenAI, Modality } from '@google/genai';
import { Button } from '@/components/ui/button';
import { Mic, MicOff, Phone, PhoneOff, X } from 'lucide-react';
import { useAppState } from '@/lib/contexts/StateContext';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface LiveLawyerWidgetProps {
  onClose?: () => void;
  className?: string;
}

export function LiveLawyerWidget({ onClose, className }: LiveLawyerWidgetProps) {
  const { state } = useAppState();
  const { simplifiedContract } = state;
  const { toast } = useToast();
  
  const [isConnected, setIsConnected] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const sessionRef = useRef<{
    _playbackCleanup?: () => void;
    close: () => void;
  } | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const audioQueueRef = useRef<Uint8Array[]>([]);
  const isPlayingRef = useRef(false);
  const aiRef = useRef<GoogleGenAI | null>(null);

  // Initialize audio context
  const initAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      const AudioContextClass = window.AudioContext || (window as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AudioContextClass) {
        throw new Error('AudioContext not supported');
      }
      audioContextRef.current = new AudioContextClass({
        sampleRate: 24000, // Live API output sample rate
      });
    }
    return audioContextRef.current;
  }, []);

  // Get API key from server (more secure than client-side)
  const getApiKey = useCallback(async (): Promise<string> => {
    try {
      const response = await fetch('/api/live-lawyer/token', {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to get API credentials');
      }

      const data = await response.json();
      return data.apiKey || data.token;
    } catch (err) {
      console.error('Error getting API credentials:', err);
      throw new Error('Failed to authenticate. Please try again.');
    }
  }, []);

  // Handle incoming messages
  const handleMessage = useCallback((message: {
    serverContent?: {
      modelTurn?: {
        parts?: Array<{
          inlineData?: {
            data?: string;
          };
        }>;
      };
      interrupted?: boolean;
    };
  }): void => {
    if (message.serverContent?.modelTurn?.parts) {
      for (const part of message.serverContent.modelTurn.parts) {
        if (part.inlineData?.data) {
          // Decode base64 audio data
          const audioData = Uint8Array.from(
            atob(part.inlineData.data),
            (c) => c.charCodeAt(0)
          );
          audioQueueRef.current.push(audioData);
        }
      }
    }

    // Handle interruptions
    if (message.serverContent?.interrupted) {
      // Clear audio queue on interruption
      audioQueueRef.current = [];
      if (isPlayingRef.current) {
        isPlayingRef.current = false;
      }
    }
  }, []);

  // Start microphone capture
  const startMicrophone = useCallback(async (session: {
    sendRealtimeInput: (input: {
      audio: {
        data: string;
        mimeType: string;
      };
    }) => void;
  }) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: 16000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
        },
      });

      mediaStreamRef.current = stream;

      const AudioContextClass = window.AudioContext || (window as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AudioContextClass) {
        throw new Error('AudioContext not supported');
      }
      const audioContext = new AudioContextClass({
        sampleRate: 16000,
      });

      const source = audioContext.createMediaStreamSource(stream);
      const processor = audioContext.createScriptProcessor(4096, 1, 1);

      processor.onaudioprocess = (e) => {
        if (!isMuted && session && isConnected) {
          const inputData = e.inputBuffer.getChannelData(0);
          // Convert Float32Array to Int16Array (16-bit PCM)
          const pcmData = new Int16Array(inputData.length);
          for (let i = 0; i < inputData.length; i++) {
            const sample = inputData[i];
            if (sample !== undefined) {
              const s = Math.max(-1, Math.min(1, sample));
              pcmData[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
            }
          }

          // Convert to base64
          const base64 = btoa(
            String.fromCharCode(...new Uint8Array(pcmData.buffer))
          );

          session.sendRealtimeInput({
            audio: {
              data: base64,
              mimeType: 'audio/pcm;rate=16000',
            },
          });
        }
      };

      source.connect(processor);
      processor.connect(audioContext.destination);
    } catch (err) {
      console.error('Error accessing microphone:', err);
      setError('Microphone access denied. Please enable microphone permissions.');
      toast({
        title: 'Microphone Error',
        description: 'Please allow microphone access to use Live Lawyer.',
        variant: 'destructive',
      });
    }
  }, [isMuted, isConnected, toast]);

  // Start audio playback
  const startAudioPlayback = useCallback(() => {
    const audioContext = initAudioContext();

    const playAudio = async () => {
      if (audioQueueRef.current.length === 0) {
        isPlayingRef.current = false;
        return;
      }

      isPlayingRef.current = true;
      const audioData = audioQueueRef.current.shift();
      if (!audioData) {
        isPlayingRef.current = false;
        return;
      }

      try {
        // Convert PCM data to AudioBuffer
        // Live API returns 24kHz, 16-bit PCM, mono
        const sampleRate = 24000;
        const length = audioData.length / 2; // 16-bit = 2 bytes per sample
        const audioBuffer = audioContext.createBuffer(1, length, sampleRate);
        const channelData = audioBuffer.getChannelData(0);

        // Convert Int16 PCM to Float32 (-1 to 1)
        const int16Array = new Int16Array(audioData.buffer);
        for (let i = 0; i < length; i++) {
          const sample = int16Array[i];
          if (sample !== undefined) {
            channelData[i] = sample / 32768.0;
          }
        }

        const source = audioContext.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(audioContext.destination);

        source.onended = () => {
          playAudio();
        };

        source.start(0);
      } catch (err) {
        console.error('Error playing audio:', err);
        isPlayingRef.current = false;
        // Try next chunk
        setTimeout(() => playAudio(), 10);
      }
    };

    // Start playback loop
    const interval = setInterval(() => {
      if (!isPlayingRef.current && audioQueueRef.current.length > 0) {
        playAudio();
      }
    }, 50);

    // Cleanup on disconnect
    return () => {
      clearInterval(interval);
    };
  }, [initAudioContext]);

  // Connect to Live API
  const connect = useCallback(async () => {
    try {
      setError(null);
      
      const token = await getApiKey();
      const ai = new GoogleGenAI({ apiKey: token });
      aiRef.current = ai;

      // Build system instruction with contract context
      let systemInstruction = 'You are a helpful legal AI assistant specializing in music industry contracts. ';
      if (simplifiedContract) {
        systemInstruction += `The user has a contract that has been analyzed. You can reference the analysis to answer questions. `;
      }
      systemInstruction += 'Provide clear, concise answers about contract terms, rights, obligations, and recommendations.';

      const model = 'gemini-2.5-flash-native-audio-preview-12-2025';
      const config = {
        responseModalities: [Modality.AUDIO],
        systemInstruction,
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: {
              voiceName: 'Kore', // Professional voice
            },
          },
        },
      };

      const session = await ai.live.connect({
        model,
        config,
        callbacks: {
          onopen: () => {
            console.log('Live API connected');
            setIsConnected(true);
            setIsListening(true);
          },
          onmessage: handleMessage,
          onerror: (e: { message?: string; reason?: string }) => {
            console.error('Live API error:', e);
            const errorMsg = e.message || e.reason || 'Connection error';
            setError(errorMsg);
            setIsConnected(false);
            setIsListening(false);
            toast({
              title: 'Connection Error',
              description: errorMsg,
              variant: 'destructive',
            });
          },
          onclose: (e: { reason?: string }) => {
            console.log('Live API closed:', e.reason);
            setIsConnected(false);
            setIsListening(false);
          },
        },
      });

      sessionRef.current = session;

      // Start microphone capture
      await startMicrophone(session);

      // Start audio playback loop
      const playbackCleanup = startAudioPlayback();
      
      // Store cleanup function
      const sessionWithCleanup = session as { _playbackCleanup?: () => void };
      sessionWithCleanup._playbackCleanup = playbackCleanup;
    } catch (err) {
      console.error('Error connecting to Live API:', err);
      setError(err instanceof Error ? err.message : 'Failed to connect');
      toast({
        title: 'Connection Error',
        description: 'Failed to connect to Live Lawyer. Please try again.',
        variant: 'destructive',
      });
    }
  }, [simplifiedContract, getApiKey, toast, handleMessage, startMicrophone, startAudioPlayback]);

  // Disconnect
  const disconnect = useCallback(() => {
    if (sessionRef.current) {
      // Cleanup playback if exists
      const session = sessionRef.current as { _playbackCleanup?: () => void; close: () => void };
      if (session._playbackCleanup) {
        session._playbackCleanup();
      }
      session.close();
      sessionRef.current = null;
    }

    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }

    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }

    audioQueueRef.current = [];
    isPlayingRef.current = false;
    setIsConnected(false);
    setIsListening(false);
  }, []);

  // Toggle mute
  const toggleMute = useCallback(() => {
    setIsMuted((prev) => !prev);
  }, []);

  // Handle connect/disconnect
  const handleToggleConnection = useCallback(() => {
    if (isConnected) {
      disconnect();
    } else {
      connect();
    }
  }, [isConnected, connect, disconnect]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  // Only show widget if contract is analyzed
  if (!simplifiedContract) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className={cn(
        'fixed bottom-6 right-6 z-50 w-80 bg-white rounded-lg shadow-2xl border border-gray-200 overflow-hidden',
        className
      )}
    >
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-4 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-lg">Live Lawyer</h3>
            <p className="text-sm text-purple-100">
              {isConnected
                ? isListening
                  ? 'Listening...'
                  : 'Connected'
                : 'Ask questions about your contract'}
            </p>
          </div>
          {onClose && (
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/20"
              onClick={onClose}
            >
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>

      <div className="p-4 space-y-4">
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="flex items-center justify-center gap-4">
          <Button
            onClick={handleToggleConnection}
            variant={isConnected ? 'destructive' : 'default'}
            size="lg"
            className="flex items-center gap-2"
          >
            {isConnected ? (
              <>
                <PhoneOff className="w-5 h-5" />
                End Call
              </>
            ) : (
              <>
                <Phone className="w-5 h-5" />
                Start Call
              </>
            )}
          </Button>

          {isConnected && (
            <Button
              onClick={toggleMute}
              variant="outline"
              size="lg"
              className="flex items-center gap-2"
            >
              {isMuted ? (
                <>
                  <MicOff className="w-5 h-5" />
                  Unmute
                </>
              ) : (
                <>
                  <Mic className="w-5 h-5" />
                  Mute
                </>
              )}
            </Button>
          )}
        </div>

        {isConnected && (
          <div className="text-center text-sm text-gray-600">
            <p>Speak naturally to ask questions about your contract.</p>
            <p className="mt-2 text-xs text-gray-500">
              The AI can reference your contract analysis to provide answers.
            </p>
          </div>
        )}

        {!isConnected && (
          <div className="text-center text-sm text-gray-600">
            <p>Click &quot;Start Call&quot; to begin a real-time conversation with an AI lawyer about your contract.</p>
          </div>
        )}
      </div>

      {isListening && (
        <div className="px-4 pb-4">
          <div className="flex items-center justify-center gap-2 text-purple-600">
            <div className="w-2 h-2 bg-purple-600 rounded-full animate-pulse" />
            <span className="text-xs font-medium">Listening...</span>
          </div>
        </div>
      )}
    </motion.div>
  );
}
