import React, { useEffect, useRef, useState } from 'react';

/**
 * Component that generates a peaceful ambient sound using the Web Audio API
 * This creates a gentle, calming background ambience for the landing page
 */
const PeacefulAmbience: React.FC<{ isPlaying: boolean; volume?: number }> = ({ 
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

  // Control sound playback
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
    
    // Base frequencies for peaceful ambient sound (in Hz)
    // These are chosen to be more gentle, peaceful frequencies
    const baseFrequencies = [
      174.0,  // F Natural - peaceful frequency
      285.0,  // D Natural - soothing
      396.0,  // G Natural - liberating frequency
      417.0,  // G# - facilitates change
      432.0,  // A Natural - Verdi's A, often considered more harmonious
      528.0,  // C Natural - healing frequency
      639.0   // E Natural - connection frequency
    ];
    
    // Create pads from these frequencies
    baseFrequencies.forEach((freq, index) => {
      // Each frequency gets multiple oscillators for richness
      for (let i = 0; i < 2; i++) {
        // Create oscillator
        const osc = ctx.createOscillator();
        
        // Use gentler waveforms
        if (i === 0) {
          osc.type = 'sine'; // Pure tone
        } else {
          osc.type = 'triangle'; // Gentle harmonic content
        }
        
        // Set frequency with very slight detuning for chorus effect
        const detune = (i === 0) ? 0 : (Math.random() * 8 - 4);
        osc.frequency.value = freq;
        osc.detune.value = detune;
        
        // Create gain node with very low volume
        const gainNode = ctx.createGain();
        gainNode.gain.value = 0; // Start silent
        
        // Connect oscillator to gain node and gain node to audio context
        osc.connect(gainNode);
        
        // Add reverb-like effect with delay
        if (i === 1) {
          const delay = ctx.createDelay();
          delay.delayTime.value = 0.1 + (Math.random() * 0.2);
          
          const delayGain = ctx.createGain();
          delayGain.gain.value = 0.1;
          
          gainNode.connect(delay);
          delay.connect(delayGain);
          delayGain.connect(ctx.destination);
        }
        
        gainNode.connect(ctx.destination);
        
        // Start the oscillator
        osc.start();
        
        // Fade in very slowly for a gentle start
        const baseVolume = volume * (0.05 - (index * 0.005)); // Very quiet, decreasing slightly for higher frequencies
        gainNode.gain.setValueAtTime(0, ctx.currentTime);
        gainNode.gain.linearRampToValueAtTime(baseVolume, ctx.currentTime + 4 + index);
        
        // Add extremely slow and gentle LFO modulation for breathing effect
        const lfo = ctx.createOscillator();
        lfo.type = 'sine';
        lfo.frequency.value = 0.05 + (Math.random() * 0.05); // Very slow modulation 0.05-0.1 Hz
        
        const lfoGain = ctx.createGain();
        lfoGain.gain.value = baseVolume * 0.2; // Gentle modulation depth
        
        lfo.connect(lfoGain);
        lfoGain.connect(gainNode.gain);
        lfo.start();
        
        newOscillators.push(osc, lfo);
        newGainNodes.push(gainNode);
      }
    });
    
    oscillatorsRef.current = newOscillators;
    gainNodesRef.current = newGainNodes;
  };

  const stopSound = () => {
    const ctx = audioContextRef.current;
    if (!ctx) return;
    
    // Fade out all oscillators
    gainNodesRef.current.forEach((gainNode) => {
      gainNode.gain.setValueAtTime(gainNode.gain.value, ctx.currentTime);
      gainNode.gain.linearRampToValueAtTime(0, ctx.currentTime + 2); // Slower fadeout
    });
    
    // Stop and disconnect oscillators after fade out
    setTimeout(() => {
      oscillatorsRef.current.forEach(osc => {
        try {
          osc.stop();
          osc.disconnect();
        } catch (e) {
          // Ignore errors
        }
      });
      oscillatorsRef.current = [];
      gainNodesRef.current = [];
    }, 2100);
  };

  // This component doesn't render anything visible
  return null;
};

export default PeacefulAmbience;