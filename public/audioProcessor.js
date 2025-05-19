// public/audioProcessor.js

class AudioProcessor extends AudioWorkletProcessor {
  constructor(options) {
    super(options);
    this._buffer = [];
    // Use bufferSize from processorOptions if provided, otherwise default
    this._bufferSize = options?.processorOptions?.bufferSize ?? 4096;
    this._stopped = false; // Flag to indicate if stop has been requested

    this.port.onmessage = (event) => {
      if (event.data.command === 'stop') {
        this._stopped = true;
        this.flush(); // Send remaining buffer immediately on stop command
      }
      // Could add other commands here, e.g., changing buffer size
    };
  }

  process(inputs, outputs, parameters) {
    // If stopped, don't process further input
    if (this._stopped) {
      return false; // Indicate processor should be terminated
    }

    const input = inputs[0];
    // Process only if there's valid input data
    if (input && input.length > 0) {
      const channelData = input[0]; // Assuming mono input (channel 0)
      if (channelData) {
        // Add new data to the internal buffer
        this._buffer.push(...channelData);

        // Process buffer in chunks of defined size
        while (this._buffer.length >= this._bufferSize) {
          const chunk = new Float32Array(this._buffer.slice(0, this._bufferSize));
          // Post the chunk back to the main thread
          this.port.postMessage({ type: 'audioData', buffer: chunk });
          // Remove the processed chunk from the buffer
          this._buffer = this._buffer.slice(this._bufferSize);
        }
      }
    }
    // Keep processor alive until explicitly stopped or no longer needed
    return true;
  }

  // Method to send any remaining data in the buffer
  flush() {
    if (this._buffer.length > 0) {
      const chunk = new Float32Array(this._buffer);
      this.port.postMessage({ type: 'audioData', buffer: chunk });
      this._buffer = []; // Clear the buffer after flushing
    }
  }
}

// Register the processor with the name 'audio-processor'
try {
  registerProcessor('audio-processor', AudioProcessor);
} catch (e) {
  console.error("Failed to register AudioWorklet processor:", e);
  // Handle registration failure (e.g., if run in an environment without AudioWorklet support)
}
