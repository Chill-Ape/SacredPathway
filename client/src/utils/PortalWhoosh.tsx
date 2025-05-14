import React, { useEffect, useRef } from 'react';

/**
 * Component that generates a portal whooshing sound effect using Web Audio API
 * Creates the sound of being sucked into a portal/vortex
 */
const PortalWhoosh: React.FC<{ 
  play: boolean; 
  volume?: number;
  onComplete?: () => void;
}> = ({ 
  play, 
  volume = 0.5,
  onComplete 
}) => {
  const audioContextRef = useRef<AudioContext | null>(null);
  interface AudioNodes {
    oscillators: (OscillatorNode | AudioBufferSourceNode)[],
    filters: BiquadFilterNode[],
    gains: GainNode[]
  }
  
  const nodesRef = useRef<AudioNodes>({
    oscillators: [],
    filters: [],
    gains: []
  });
  
  // Handle the sound effect when play prop changes
  useEffect(() => {
    if (play) {
      playWhooshEffect();
    }
    
    return () => {
      // Clean up any ongoing sounds if component unmounts during playback
      cleanupSound();
    };
  }, [play]);
  
  const playWhooshEffect = () => {
    // Create AudioContext if it doesn't exist
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    
    const ctx = audioContextRef.current;
    cleanupSound(); // Clean up any previous sounds
    
    // Create a wind-like noise source with white noise
    const bufferSize = 2 * ctx.sampleRate;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    
    // Fill the buffer with white noise
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }
    
    // Create noise sources
    const noise1 = ctx.createBufferSource();
    noise1.buffer = noiseBuffer;
    noise1.loop = true;
    
    const noise2 = ctx.createBufferSource();
    noise2.buffer = noiseBuffer;
    noise2.loop = true;
    
    // Create filters for the wind effect
    const filter1 = ctx.createBiquadFilter();
    filter1.type = 'bandpass';
    filter1.frequency.value = 800;
    filter1.Q.value = 0.5;
    
    const filter2 = ctx.createBiquadFilter();
    filter2.type = 'highpass';
    filter2.frequency.value = 1200;
    filter2.Q.value = 0.7;
    
    // Create gains for volume control
    const gain1 = ctx.createGain();
    gain1.gain.value = 0;
    
    const gain2 = ctx.createGain();
    gain2.gain.value = 0;
    
    // Create master gain for overall volume control
    const masterGain = ctx.createGain();
    masterGain.gain.value = volume;
    
    // Connect nodes
    noise1.connect(filter1);
    filter1.connect(gain1);
    gain1.connect(masterGain);
    
    noise2.connect(filter2);
    filter2.connect(gain2);
    gain2.connect(masterGain);
    
    masterGain.connect(ctx.destination);
    
    // Add a deep whooshing oscillator
    const whoosh = ctx.createOscillator();
    whoosh.type = 'sine';
    whoosh.frequency.value = 100;
    
    const whooshFilter = ctx.createBiquadFilter();
    whooshFilter.type = 'lowpass';
    whooshFilter.frequency.value = 400;
    
    const whooshGain = ctx.createGain();
    whooshGain.gain.value = 0;
    
    whoosh.connect(whooshFilter);
    whooshFilter.connect(whooshGain);
    whooshGain.connect(masterGain);
    
    // Store all nodes for later cleanup
    nodesRef.current.oscillators = [noise1, noise2, whoosh];
    nodesRef.current.filters = [filter1, filter2, whooshFilter];
    nodesRef.current.gains = [gain1, gain2, whooshGain, masterGain];
    
    // Schedule the sound effect
    const now = ctx.currentTime;
    
    // Initial build-up (0-0.5s)
    whoosh.frequency.setValueAtTime(100, now);
    whoosh.frequency.exponentialRampToValueAtTime(400, now + 0.5);
    whooshGain.gain.setValueAtTime(0, now);
    whooshGain.gain.linearRampToValueAtTime(0.15, now + 0.5);
    
    gain1.gain.setValueAtTime(0, now);
    gain1.gain.linearRampToValueAtTime(0.2, now + 0.5);
    
    gain2.gain.setValueAtTime(0, now);
    gain2.gain.linearRampToValueAtTime(0.15, now + 0.3);
    
    filter1.frequency.setValueAtTime(800, now);
    filter1.frequency.exponentialRampToValueAtTime(2000, now + 0.5);
    
    // Main whoosh (0.5-1.5s)
    whoosh.frequency.exponentialRampToValueAtTime(800, now + 1.5);
    whooshGain.gain.linearRampToValueAtTime(0.3, now + 1.0);
    whooshGain.gain.linearRampToValueAtTime(0.5, now + 1.5);
    
    gain1.gain.linearRampToValueAtTime(0.4, now + 1.0);
    gain1.gain.linearRampToValueAtTime(0.6, now + 1.5);
    
    gain2.gain.linearRampToValueAtTime(0.3, now + 1.0);
    gain2.gain.linearRampToValueAtTime(0.5, now + 1.5);
    
    filter1.frequency.exponentialRampToValueAtTime(3000, now + 1.5);
    filter2.frequency.exponentialRampToValueAtTime(3000, now + 1.5);
    
    // Final intensity (1.5-2.0s)
    whoosh.frequency.exponentialRampToValueAtTime(1200, now + 2.0);
    filter1.frequency.exponentialRampToValueAtTime(5000, now + 2.0);
    
    // Fade out (2.0-2.5s)
    whooshGain.gain.linearRampToValueAtTime(0, now + 2.5);
    gain1.gain.linearRampToValueAtTime(0, now + 2.5);
    gain2.gain.linearRampToValueAtTime(0, now + 2.5);
    
    // Start the sources
    noise1.start();
    noise2.start();
    whoosh.start();
    
    // Stop and cleanup after effect is complete
    setTimeout(() => {
      cleanupSound();
      if (onComplete) onComplete();
    }, 2600);
  };
  
  const cleanupSound = () => {
    if (!audioContextRef.current) return;
    
    // Stop all oscillators
    nodesRef.current.oscillators.forEach(osc => {
      try {
        osc.stop();
        osc.disconnect();
      } catch (e) {
        // Ignore errors if already stopped
      }
    });
    
    // Disconnect all nodes
    [...nodesRef.current.filters, ...nodesRef.current.gains].forEach(node => {
      try {
        node.disconnect();
      } catch (e) {
        // Ignore errors
      }
    });
    
    // Reset references
    nodesRef.current = {
      oscillators: [],
      filters: [],
      gains: []
    };
  };
  
  // This component doesn't render anything visible
  return null;
};

export default PortalWhoosh;