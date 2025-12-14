'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'framer-motion';
import { GoogleGenAI, Modality } from '@google/genai';
import { Button } from '@/components/ui/button';
import { Mic, MicOff, Phone, PhoneOff, X, AlertCircle } from 'lucide-react';
import { useAppState } from '@/lib/contexts/StateContext';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface LiveLawyerWidgetProps {
  onClose?: () => void;
  className?: string;
}

interface SessionResumptionUpdate {
  resumable?: boolean;
  newHandle?: string;
}

interface GoAwayMessage {
  timeLeft?: string;
}

export function LiveLawyerWidget({ onClose, className }: LiveLawyerWidgetProps) {
  const { state } = useAppState();
  const { simplifiedContract } = state;
  const { toast } = useToast();
  
  const [isConnected, setIsConnected] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'connecting' | 'connected' | 'reconnecting' | 'error'>('idle');
  
  const sessionRef = useRef<{
    _playbackCleanup?: () => void;
    _audioProcessor?: AudioWorkletNode | ScriptProcessorNode | null;
    _inputAudioContext?: AudioContext | null;
    close: () => void;
    sendClientContent?: (content: { turns: string; turnComplete: boolean }) => void;
    sendRealtimeInput?: (input: {
      audio?: {
        data: string;
        mimeType: string;
      };
      audioStreamEnd?: boolean;
    }) => void;
  } | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const audioQueueRef = useRef<Uint8Array[]>([]);
  const isPlayingRef = useRef(false);
  const aiRef = useRef<GoogleGenAI | null>(null);
  const sessionHandleRef = useRef<string | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const retryCountRef = useRef(0);
  const maxRetries = 3;
  const playbackIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const currentSourceRef = useRef<AudioBufferSourceNode | null>(null);

  // Initialize audio context with error handling
  const initAudioContext = useCallback(() => {
    if (!audioContextRef.current || audioContextRef.current.state === 'closed') {
      try {
      const AudioContextClass = window.AudioContext || (window as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AudioContextClass) {
          throw new Error('AudioContext not supported in this browser');
      }
      // Use browser's default sample rate for better compatibility
      // We'll handle resampling in the playback function if needed
      audioContextRef.current = new AudioContextClass();
        
        // Resume audio context if suspended (required by some browsers)
        if (audioContextRef.current.state === 'suspended') {
          audioContextRef.current.resume().catch((err) => {
            console.warn('Failed to resume audio context:', err);
          });
        }
      } catch (err) {
        console.error('Error initializing audio context:', err);
        throw new Error('Audio playback not supported. Please use a modern browser.');
      }
    }
    return audioContextRef.current;
  }, []);

  // Get ephemeral token from server with retry logic
  const getEphemeralToken = useCallback(async (retryCount = 0): Promise<string> => {
    try {
      const response = await fetch('/api/live-lawyer/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}: Failed to get authentication token`);
      }

      const data = await response.json();
      if (!data.token) {
        throw new Error('Invalid token response from server');
      }
      
      // Reset retry count on success
      retryCountRef.current = 0;
      return data.token;
    } catch (err) {
      console.error('Error getting ephemeral token:', err);
      
      // Retry logic
      if (retryCount < 2) {
        await new Promise(resolve => setTimeout(resolve, 1000 * (retryCount + 1)));
        return getEphemeralToken(retryCount + 1);
      }
      
      throw new Error(err instanceof Error ? err.message : 'Failed to authenticate. Please try again.');
    }
  }, []);

  // Handle incoming messages with comprehensive error handling
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
      turnComplete?: boolean;
      generationComplete?: boolean;
    };
    sessionResumptionUpdate?: SessionResumptionUpdate;
    goAway?: GoAwayMessage;
    usageMetadata?: {
      totalTokenCount?: number;
    };
  }): void => {
    try {
      // Handle audio data
    if (message.serverContent?.modelTurn?.parts) {
      for (const part of message.serverContent.modelTurn.parts) {
        if (part.inlineData?.data) {
            try {
          // Decode base64 audio data more efficiently
          const binaryString = atob(part.inlineData.data);
          const audioData = new Uint8Array(binaryString.length);
          for (let i = 0; i < binaryString.length; i++) {
            audioData[i] = binaryString.charCodeAt(i);
          }
          // Only add non-empty chunks to prevent issues
          if (audioData.length > 0) {
            audioQueueRef.current.push(audioData);
          }
            } catch (err) {
              console.error('Error decoding audio data:', err);
            }
        }
      }
    }

      // Handle interruptions - clear queue and stop playback
    if (message.serverContent?.interrupted) {
      audioQueueRef.current = [];
        if (currentSourceRef.current) {
          try {
            currentSourceRef.current.stop();
          } catch {
            // Ignore errors when stopping (may already be stopped)
          }
          currentSourceRef.current = null;
        }
        isPlayingRef.current = false;
      }

      // Handle session resumption updates
      if (message.sessionResumptionUpdate) {
        const update = message.sessionResumptionUpdate;
        if (update.resumable && update.newHandle) {
          sessionHandleRef.current = update.newHandle;
          console.log('Session resumption handle updated:', update.newHandle);
        }
      }

      // Handle GoAway message (connection will close soon)
      if (message.goAway) {
        const timeLeft = message.goAway.timeLeft;
        console.warn('GoAway received, time left:', timeLeft);
        toast({
          title: 'Connection Warning',
          description: 'Connection will close soon. Reconnecting...',
          variant: 'default',
        });
        // Set flag for reconnection (handled in onclose callback)
        setConnectionStatus('reconnecting');
      }

      // Handle generation complete
      if (message.serverContent?.generationComplete) {
        console.log('Generation complete');
      }
    } catch (err) {
      console.error('Error handling message:', err);
    }
  }, [toast]);

  // Cleanup audio processor
  const cleanupAudioProcessor = useCallback(() => {
    if (sessionRef.current?._audioProcessor) {
      try {
        const processor = sessionRef.current._audioProcessor;
        processor.disconnect();
        // Close port if it's an AudioWorkletNode
        if (processor instanceof AudioWorkletNode && processor.port) {
          processor.port.close();
        }
      } catch (err) {
        console.warn('Error disconnecting audio processor:', err);
      }
      sessionRef.current._audioProcessor = null;
    }

    if (sessionRef.current?._inputAudioContext) {
      try {
        if (sessionRef.current._inputAudioContext.state !== 'closed') {
          sessionRef.current._inputAudioContext.close();
        }
      } catch (err) {
        console.warn('Error closing input audio context:', err);
      }
      sessionRef.current._inputAudioContext = undefined;
    }
  }, []);

  // Start microphone capture with comprehensive error handling
  const startMicrophone = useCallback(async (session: {
    sendRealtimeInput: (input: {
      audio?: {
        data: string;
        mimeType: string;
      };
      audioStreamEnd?: boolean;
    }) => void;
  }) => {
    try {
      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: 16000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      mediaStreamRef.current = stream;

      // Handle stream end events
      stream.getAudioTracks().forEach(track => {
        track.onended = () => {
          console.log('Microphone track ended');
          if (session && isConnected) {
            try {
              session.sendRealtimeInput({ audioStreamEnd: true });
            } catch {
              console.error('Error sending audio stream end');
            }
          }
        };
      });

      const AudioContextClass = window.AudioContext || (window as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AudioContextClass) {
        throw new Error('AudioContext not supported');
      }
      
      const audioContext = new AudioContextClass({
        sampleRate: 16000,
      });
      
      // Store for cleanup
      if (sessionRef.current) {
        sessionRef.current._inputAudioContext = audioContext;
      }

      const source = audioContext.createMediaStreamSource(stream);
      
      // Use AudioWorkletNode for audio processing (replaces deprecated ScriptProcessorNode)
      try {
        // Load the AudioWorklet processor
        await audioContext.audioWorklet.addModule('/audio-processor.js');
        
        // Create AudioWorkletNode
        const processor = new AudioWorkletNode(audioContext, 'audio-processor', {
          numberOfInputs: 1,
          numberOfOutputs: 1,
          channelCount: 1,
        });
        
        // Store for cleanup
        if (sessionRef.current) {
          sessionRef.current._audioProcessor = processor;
        }

        // Handle messages from the worklet processor
        processor.port.onmessage = (e) => {
          if (!isMuted && session && isConnected && audioContext.state === 'running') {
            if (e.data.type === 'audioData') {
              try {
                // Convert ArrayBuffer to base64 (worklet sends raw PCM data)
                const uint8Array = new Uint8Array(e.data.data);
                const base64 = btoa(
                  String.fromCharCode.apply(null, Array.from(uint8Array))
                );
                
                session.sendRealtimeInput({
                  audio: {
                    data: base64,
                    mimeType: 'audio/pcm;rate=16000',
                  },
                });
              } catch (err) {
                console.error('Error sending audio data:', err);
              }
            }
          }
        };

        source.connect(processor);
        // Don't connect processor to destination - we only need to capture input, not play it back
      } catch (workletError) {
        // Fallback to ScriptProcessorNode if AudioWorklet is not supported
        console.warn('AudioWorklet not supported, falling back to ScriptProcessorNode:', workletError);
        
      // Use larger buffer size (8192) for better performance and less choppy audio
      const processor = audioContext.createScriptProcessor(8192, 1, 1);
        
        // Store for cleanup
        if (sessionRef.current) {
          sessionRef.current._audioProcessor = processor;
        }

      processor.onaudioprocess = (e) => {
          if (!isMuted && session && isConnected && audioContext.state === 'running') {
            try {
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

              // Convert to base64 efficiently
              const uint8Array = new Uint8Array(pcmData.buffer);
          const base64 = btoa(
                String.fromCharCode.apply(null, Array.from(uint8Array))
          );

          session.sendRealtimeInput({
            audio: {
              data: base64,
              mimeType: 'audio/pcm;rate=16000',
            },
          });
            } catch (err) {
              console.error('Error processing audio:', err);
            }
        }
      };

      source.connect(processor);
      // Don't connect processor to destination - we only need to capture input, not play it back
      }
    } catch (err) {
      console.error('Error accessing microphone:', err);
      const errorMessage = err instanceof Error 
        ? err.message.includes('Permission denied') || err.message.includes('NotAllowedError')
          ? 'Microphone access denied. Please enable microphone permissions in your browser settings.'
          : err.message.includes('NotFoundError')
          ? 'No microphone found. Please connect a microphone and try again.'
          : err.message
        : 'Failed to access microphone';
      
      setError(errorMessage);
      toast({
        title: 'Microphone Error',
        description: errorMessage,
        variant: 'destructive',
      });
      throw err;
    }
  }, [isMuted, isConnected, toast]);

  // Start audio playback with robust error handling
  const startAudioPlayback = useCallback(() => {
    const audioContext = initAudioContext();
    const inputSampleRate = 24000; // Live API output sample rate
    const outputSampleRate = audioContext.sampleRate;

    // Combine multiple small chunks into larger buffers for smoother playback
    const combineChunks = (): Uint8Array | null => {
      if (audioQueueRef.current.length === 0) return null;
      
      // Collect chunks until we have at least 4800 samples (200ms at 24kHz)
      // or use all available chunks if queue is getting large
      const minSamples = 4800;
      const chunks: Uint8Array[] = [];
      let totalLength = 0;
      
      while (audioQueueRef.current.length > 0 && (totalLength < minSamples * 2 || chunks.length < 3)) {
        const chunk = audioQueueRef.current.shift();
        if (chunk) {
          chunks.push(chunk);
          totalLength += chunk.length;
        }
      }
      
      if (chunks.length === 0) return null;
      
      // Combine chunks into single buffer
      const combined = new Uint8Array(totalLength);
      let offset = 0;
      for (const chunk of chunks) {
        combined.set(chunk, offset);
        offset += chunk.length;
      }
      
      return combined;
    };

    const playAudio = async () => {
      if (isPlayingRef.current) {
        return; // Already playing
      }

      const audioData = combineChunks();
      if (!audioData) {
        isPlayingRef.current = false;
        return;
      }

      isPlayingRef.current = true;

      try {
        // Ensure audio context is running
        if (audioContext.state === 'suspended') {
          await audioContext.resume();
        }

        // Convert PCM data to AudioBuffer
        // Live API returns 24kHz, 16-bit PCM, mono
        const length = audioData.length / 2; // 16-bit = 2 bytes per sample
        
        if (length === 0) {
          isPlayingRef.current = false;
          playAudio(); // Try next chunk
          return;
        }

        // Create buffer at input sample rate first
        const inputBuffer = audioContext.createBuffer(1, length, inputSampleRate);
        const channelData = inputBuffer.getChannelData(0);

        // Convert Int16 PCM to Float32 (-1 to 1)
        const int16Array = new Int16Array(audioData.buffer, audioData.byteOffset, length);
        for (let i = 0; i < length; i++) {
          const sample = int16Array[i];
          if (sample !== undefined) {
            // Clamp to prevent clipping
            channelData[i] = Math.max(-1, Math.min(1, sample / 32768.0));
          }
        }

        // Resample if needed (browser will handle this, but we create buffer at correct rate)
        let audioBuffer = inputBuffer;
        if (inputSampleRate !== outputSampleRate) {
          // Create output buffer with resampled length
          const outputLength = Math.round(length * outputSampleRate / inputSampleRate);
          const outputBuffer = audioContext.createBuffer(1, outputLength, outputSampleRate);
          const outputData = outputBuffer.getChannelData(0);
          
          // Simple linear resampling
          for (let i = 0; i < outputLength; i++) {
            const srcIndex = (i * inputSampleRate) / outputSampleRate;
            const srcIndexFloor = Math.floor(srcIndex);
            const srcIndexCeil = Math.min(srcIndexFloor + 1, length - 1);
            const fraction = srcIndex - srcIndexFloor;
            
            // Ensure indices are within bounds
            const floorIndex = Math.max(0, Math.min(srcIndexFloor, length - 1));
            const ceilIndex = Math.max(0, Math.min(srcIndexCeil, length - 1));
            const floorValue = channelData[floorIndex] ?? 0;
            const ceilValue = channelData[ceilIndex] ?? 0;
            
            outputData[i] = floorValue * (1 - fraction) + ceilValue * fraction;
          }
          audioBuffer = outputBuffer;
        }

        const source = audioContext.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(audioContext.destination);

        // Store current source for interruption handling
        currentSourceRef.current = source;

        source.onended = () => {
          currentSourceRef.current = null;
          isPlayingRef.current = false;
          // Continue playing next chunk immediately
          requestAnimationFrame(() => playAudio());
        };

        source.start(0);
      } catch (err) {
        console.error('Error playing audio:', err);
        currentSourceRef.current = null;
        isPlayingRef.current = false;
        // Try next chunk after short delay
        setTimeout(() => playAudio(), 5);
      }
    };

    // Start playback loop - check more frequently for smoother playback
    playbackIntervalRef.current = setInterval(() => {
      if (!isPlayingRef.current && audioQueueRef.current.length > 0) {
        playAudio();
      }
    }, 10); // Reduced from 50ms to 10ms for more responsive playback

    // Cleanup function
    return () => {
      if (playbackIntervalRef.current) {
        clearInterval(playbackIntervalRef.current);
        playbackIntervalRef.current = null;
      }
      if (currentSourceRef.current) {
        try {
          currentSourceRef.current.stop();
        } catch {
          // Ignore errors
        }
        currentSourceRef.current = null;
      }
      isPlayingRef.current = false;
    };
  }, [initAudioContext]);

  // Reconnect function ref (will be set after connect is defined)
  const reconnectWithResumptionRef = useRef<((useResumption: boolean) => Promise<void>) | null>(null);

  // Connect to Live API with comprehensive error handling
  const connect = useCallback(async (useResumption = false) => {
    if (isConnecting) {
      return; // Prevent multiple simultaneous connection attempts
    }

    try {
      setIsConnecting(true);
      setError(null);
      setConnectionStatus('connecting');
      
      // Get ephemeral token from server
      const ephemeralToken = await getEphemeralToken();
      // IMPORTANT: Must use v1alpha API version for ephemeral tokens
      const ai = new GoogleGenAI({ 
        apiKey: ephemeralToken,
        httpOptions: { apiVersion: 'v1alpha' }
      });
      aiRef.current = ai;

      // Build system instruction with contract context
      let systemInstruction = 'You are a helpful legal AI assistant specializing in music industry contracts. Your role is to help users understand their contracts by answering questions, explaining terms, and providing recommendations. ';
      if (simplifiedContract) {
        // Truncate contract if too long (keep it reasonable for context)
        const contractPreview = simplifiedContract.length > 5000 
          ? simplifiedContract.substring(0, 5000) + '...'
          : simplifiedContract;
        systemInstruction += `The user has a contract that has been analyzed. Here is the simplified version: ${contractPreview} `;
      }
      systemInstruction += 'When the conversation starts, introduce yourself as their Live Lawyer AI assistant and let them know you are ready to help answer questions about their contract. Provide clear, concise answers about contract terms, rights, obligations, and recommendations. Always remember: you are the AI assistant, and the user is the person asking questions.';

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
        // Enable context window compression for longer sessions
        contextWindowCompression: {
          slidingWindow: {},
        },
        // Enable session resumption for reconnection
        sessionResumption: useResumption && sessionHandleRef.current
          ? { handle: sessionHandleRef.current }
          : {},
      };

      const session = await ai.live.connect({
        model,
        config,
        callbacks: {
          onopen: () => {
            console.log('Live API connected');
            setIsConnected(true);
            setIsListening(true);
            setConnectionStatus('connected');
            retryCountRef.current = 0; // Reset retry count on successful connection
          },
          onmessage: handleMessage,
          onerror: (e: { message?: string; reason?: string; code?: number }) => {
            console.error('Live API error:', e);
            const errorMsg = e.message || e.reason || 'Connection error';
            setError(errorMsg);
            setIsConnected(false);
            setIsListening(false);
            setConnectionStatus('error');
            
            // Attempt reconnection for certain errors
            if (e.code !== 400 && e.code !== 401 && e.code !== 403) {
              if (retryCountRef.current < maxRetries && reconnectWithResumptionRef.current) {
                setTimeout(() => reconnectWithResumptionRef.current?.(true), 2000);
              }
            }
            
            toast({
              title: 'Connection Error',
              description: errorMsg,
              variant: 'destructive',
            });
          },
          onclose: (e: { reason?: string; code?: number }) => {
            console.log('Live API closed:', e.reason, e.code);
            setIsConnected(false);
            setIsListening(false);
            
            // Attempt reconnection if not a normal close
            if (e.code !== 1000 && retryCountRef.current < maxRetries && reconnectWithResumptionRef.current) {
              setConnectionStatus('reconnecting');
              setTimeout(() => reconnectWithResumptionRef.current?.(true), 1000);
            } else {
              setConnectionStatus('idle');
            }
          },
        },
      });

      sessionRef.current = session;

      // Send initial greeting to start the conversation
      // Send a simple "Hello" from the user, and the AI will respond with its introduction
      try {
        session.sendClientContent({
          turns: "Hello",
          turnComplete: true,
        });
      } catch (err) {
        console.warn('Error sending initial greeting:', err);
        // Non-critical error, continue anyway
      }

      // Start microphone capture
      await startMicrophone(session);

      // Start audio playback loop
      const playbackCleanup = startAudioPlayback();
      
      // Store cleanup function
      const sessionWithCleanup = session as { _playbackCleanup?: () => void };
      sessionWithCleanup._playbackCleanup = playbackCleanup;
    } catch (err) {
      console.error('Error connecting to Live API:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to connect';
      setError(errorMessage);
      setConnectionStatus('error');
      setIsConnected(false);
      setIsListening(false);
      
      toast({
        title: 'Connection Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsConnecting(false);
    }
  }, [simplifiedContract, getEphemeralToken, toast, handleMessage, startMicrophone, startAudioPlayback, isConnecting]);

  // Disconnect with comprehensive cleanup (defined before reconnect to avoid dependency issues)
  const disconnect = useCallback((clearSessionHandle = true) => {
    // Clear reconnection timeout
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    // Cleanup session
    if (sessionRef.current) {
      try {
        // Cleanup playback
      const session = sessionRef.current as { _playbackCleanup?: () => void; close: () => void };
      if (session._playbackCleanup) {
        session._playbackCleanup();
      }
        
        // Close session
        try {
      session.close();
        } catch (err) {
          console.warn('Error closing session:', err);
        }
      } catch (err) {
        console.warn('Error during session cleanup:', err);
      }
      sessionRef.current = null;
    }

    // Cleanup audio processor
    cleanupAudioProcessor();

    // Cleanup media stream
    if (mediaStreamRef.current) {
      try {
        mediaStreamRef.current.getTracks().forEach((track) => {
          track.stop();
          track.onended = null; // Clear event handlers
        });
      } catch (err) {
        console.warn('Error stopping media stream:', err);
      }
      mediaStreamRef.current = null;
    }

    // Cleanup audio contexts
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      try {
      audioContextRef.current.close();
      } catch (err) {
        console.warn('Error closing audio context:', err);
      }
      audioContextRef.current = null;
    }

    // Clear playback interval
    if (playbackIntervalRef.current) {
      clearInterval(playbackIntervalRef.current);
      playbackIntervalRef.current = null;
    }

    // Clear audio queue
    audioQueueRef.current = [];
    isPlayingRef.current = false;
    currentSourceRef.current = null;

    // Clear session handle if requested
    if (clearSessionHandle) {
      sessionHandleRef.current = null;
    }

    setIsConnected(false);
    setIsListening(false);
    setConnectionStatus('idle');
  }, [cleanupAudioProcessor]);

  // Reconnect with session resumption (defined after connect and disconnect)
  const reconnectWithResumption = useCallback(async (useResumption = true): Promise<void> => {
    if (retryCountRef.current >= maxRetries) {
      setError('Max reconnection attempts reached. Please refresh the page.');
      setConnectionStatus('error');
      return;
    }

    retryCountRef.current++;
    setConnectionStatus('reconnecting');
    
    try {
      disconnect(false); // Disconnect without clearing session handle
      await new Promise(resolve => setTimeout(resolve, 1000));
      await connect(useResumption); // Connect with resumption
    } catch (err) {
      console.error('Reconnection failed:', err);
      if (retryCountRef.current < maxRetries) {
        reconnectTimeoutRef.current = setTimeout(() => {
          reconnectWithResumption(useResumption);
        }, 2000 * retryCountRef.current);
      } else {
        setError('Failed to reconnect. Please try starting a new call.');
        setConnectionStatus('error');
      }
    }
  }, [connect, disconnect]);

  // Store reconnect function in ref
  useEffect(() => {
    reconnectWithResumptionRef.current = reconnectWithResumption;
  }, [reconnectWithResumption]);

  // Toggle mute
  const toggleMute = useCallback(() => {
    setIsMuted((prev) => !prev);
  }, []);

  // Handle connect/disconnect
  const handleToggleConnection = useCallback(() => {
    if (isConnected || isConnecting) {
      disconnect();
    } else {
      connect();
    }
  }, [isConnected, isConnecting, connect, disconnect]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  // Track if we're on the client side for portal rendering
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Only show widget if contract is analyzed
  if (!simplifiedContract) {
    return null;
  }

  const getStatusText = () => {
    switch (connectionStatus) {
      case 'connecting':
        return 'Connecting...';
      case 'reconnecting':
        return 'Reconnecting...';
      case 'connected':
        return isListening ? 'Listening...' : 'Connected';
      case 'error':
        return 'Connection Error';
      default:
        return 'Ask questions about your contract';
    }
  };

  const widgetContent = (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className={cn(
        'fixed bottom-6 right-6 z-[9999] w-80 bg-white rounded-lg shadow-2xl border border-gray-200 overflow-hidden',
        className
      )}
      style={{ zIndex: 9999 }}
    >
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-4 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-lg">Live Lawyer</h3>
            <p className="text-sm text-purple-100">
              {getStatusText()}
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
          <div className="p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-700 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="font-medium">Error</p>
              <p className="text-xs mt-1">{error}</p>
            </div>
          </div>
        )}

        <div className="flex items-center justify-center gap-4">
          <Button
            onClick={handleToggleConnection}
            disabled={isConnecting || connectionStatus === 'reconnecting'}
            variant={isConnected ? 'destructive' : 'default'}
            size="lg"
            className="flex items-center gap-2"
          >
            {isConnected ? (
              <>
                <PhoneOff className="w-5 h-5" />
                End Call
              </>
            ) : isConnecting ? (
              <>
                <Phone className="w-5 h-5 animate-pulse" />
                Connecting...
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

        {!isConnected && !isConnecting && (
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

  // Render to portal on client side to ensure it's always on top
  if (!isMounted) {
    return null;
  }

  return createPortal(widgetContent, document.body);
}
