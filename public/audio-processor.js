// AudioWorklet processor for converting audio to PCM format
// This replaces the deprecated ScriptProcessorNode

class AudioProcessor extends AudioWorkletProcessor {
  process(inputs, outputs, parameters) {
    const input = inputs[0];

    if (input.length > 0) {
      const inputChannel = input[0];

      if (inputChannel.length > 0) {
        // Convert Float32Array to Int16Array (16-bit PCM)
        const pcmData = new Int16Array(inputChannel.length);
        for (let i = 0; i < inputChannel.length; i++) {
          const sample = inputChannel[i];
          const s = Math.max(-1, Math.min(1, sample));
          pcmData[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
        }

        // Send raw PCM data to main thread (base64 encoding happens there)
        // Transfer the array buffer to avoid copying
        this.port.postMessage(
          {
            type: 'audioData',
            data: pcmData.buffer,
          },
          [pcmData.buffer]
        );
      }
    }

    // Return true to keep processor alive
    return true;
  }
}

registerProcessor('audio-processor', AudioProcessor);
