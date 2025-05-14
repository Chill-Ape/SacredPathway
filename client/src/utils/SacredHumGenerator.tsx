import React, { useEffect, useRef, useState } from 'react';

/**
 * Component that generates a sacred hum ambient sound using the Web Audio API
 * This is used to create a mystical ambient background sound for the landing page
 */
const SacredHumGenerator: React.FC<{ isPlaying: boolean; volume?: number }> = ({ 
  isPlaying, 
  volume = 0.2 
}) => {
  const audioContextRef = useRef<AudioContext | null>(null);
  const oscillatorsRef = useRef<OscillatorNode[]>([]);
  const gainNodesRef = useRef<GainNode[]>([]);
  const [audioInitialized, setAudioInitialized] = useState(false);

  // Initialize the audio context
  useEffect(() => {
    // Create audio context on first user interaction (for browsers that require it)
    const handleFirstInteraction = () => {
      if (!audioInitialized) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        setAudioInitialized(true);
        
        // Remove event listeners after initialization
        document.removeEventListener('click', handleFirstInteraction);
        document.removeEventListener('touchstart', handleFirstInteraction);
      }
    };

    document.addEventListener('click', handleFirstInteraction);
    document.addEventListener('touchstart', handleFirstInteraction);

    return () => {
      document.removeEventListener('click', handleFirstInteraction);
      document.removeEventListener('touchstart', handleFirstInteraction);
      
      // Clean up oscillators when component unmounts
      stopSound();
    };
  }, [audioInitialized]);

  // Generate the sacred hum when isPlaying changes
  useEffect(() => {
    if (audioInitialized) {
      if (isPlaying) {
        startSound();
      } else {
        stopSound();
      }
    }
    
    return () => {
      if (audioInitialized) {
        stopSound();
      }
    };
  }, [isPlaying, audioInitialized]);

  // Adjust volume when volume prop changes
  useEffect(() => {
    if (audioInitialized && gainNodesRef.current.length > 0) {
      gainNodesRef.current.forEach(gainNode => {
        gainNode.gain.value = volume;
      });
    }
  }, [volume, audioInitialized]);

  const startSound = () => {
    if (!audioContextRef.current) return;
    
    stopSound(); // Stop any existing sound
    
    const ctx = audioContextRef.current;
    const newOscillators: OscillatorNode[] = [];
    const newGainNodes: GainNode[] = [];
    
    // Base frequencies for the sacred hum (in Hz)
    // These frequencies are chosen to create a mystical, peaceful ambient sound
    const baseFrequencies = [
      55,    // Very low base hum 
      110,   // Low hum
      195,   // Om frequency (close to 196 Hz)
      285,   // Soft mid frequency
      417,   // Solfeggio frequency
      528,   // Another Solfeggio frequency
      639    // Another Solfeggio frequency
    ];
    
    // Create oscillators for each frequency
    baseFrequencies.forEach((freq, index) => {
      // Create oscillator
      const osc = ctx.createOscillator();
      osc.type = index % 2 === 0 ? 'sine' : 'triangle'; // Alternate between sine and triangle waves
      osc.frequency.value = freq;
      
      // Add slight detuning for a richer sound
      osc.detune.value = Math.random() * 10 - 5;
      
      // Create gain node (volume control)
      const gainNode = ctx.createGain();
      gainNode.gain.value = 0; // Start silent
      
      // Connect oscillator to gain node and gain node to audio context
      osc.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      // Start the oscillator
      osc.start();
      
      // Fade in
      const baseVolume = volume * (0.15 - (index * 0.02)); // Decreasing volume for higher frequencies
      gainNode.gain.setValueAtTime(0, ctx.currentTime);
      gainNode.gain.linearRampToValueAtTime(baseVolume, ctx.currentTime + 2 + index * 0.5);
      
      // Add slight volume modulation for a breathing effect
      const lfo = ctx.createOscillator();
      lfo.type = 'sine';
      lfo.frequency.value = 0.1 + (Math.random() * 0.2); // Random slow modulation 0.1-0.3 Hz
      
      const lfoGain = ctx.createGain();
      lfoGain.gain.value = baseVolume * 0.2; // Modulation depth
      
      lfo.connect(lfoGain);
      lfoGain.connect(gainNode.gain);
      lfo.start();
      
      newOscillators.push(osc, lfo);
      newGainNodes.push(gainNode);
    });
    
    oscillatorsRef.current = newOscillators;
    gainNodesRef.current = newGainNodes;
  };

  const stopSound = () => {
    const ctx = audioContextRef.current;
    if (!ctx) return;
    
    // Fade out all oscillators
    gainNodesRef.current.forEach((gainNode, i) => {
      gainNode.gain.setValueAtTime(gainNode.gain.value, ctx.currentTime);
      gainNode.gain.linearRampToValueAtTime(0, ctx.currentTime + 1);
    });
    
    // Stop and disconnect oscillators after fade out
    setTimeout(() => {
      oscillatorsRef.current.forEach(osc => {
        try {
          osc.stop();
          osc.disconnect();
        } catch (e) {
          // Ignore errors when stopping oscillators that might already be stopped
        }
      });
      oscillatorsRef.current = [];
      gainNodesRef.current = [];
    }, 1100);
  };

  // This component doesn't render anything visible
  return null;
};

export default SacredHumGenerator;