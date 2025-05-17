import { motion } from "framer-motion";
import { useState, useEffect, useRef } from "react";

interface ChatMessageProps {
  isUser: boolean;
  message: string;
  loading?: boolean;
  isNew?: boolean; // Flag to indicate if this is a newly added message that needs animation
}

export default function ChatMessage({ isUser, message, loading = false, isNew = false }: ChatMessageProps) {
  const [displayedText, setDisplayedText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const typingSpeed = 30; // ms per character - even faster but still has a mystical feel
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  useEffect(() => {
    // For user messages, just display them immediately
    if (isUser) {
      setDisplayedText(message);
      return;
    }
    
    // For older Oracle messages on page reload, display them immediately without animation
    if (!isNew) {
      setDisplayedText(message);
      setIsTyping(false);
      return;
    }
    
    // Initialize audio for typewriter sound
    if (!audioRef.current) {
      audioRef.current = new Audio("/sounds/typewriter-key.mp3");
      audioRef.current.volume = 0.4;
    }
    
    let currentIndex = 0;
    setIsTyping(true);
    
    // Progressively reveal text with typewriter effect (only for new messages)
    const interval = setInterval(() => {
      if (currentIndex < message.length) {
        setDisplayedText(message.substring(0, currentIndex + 1));
        currentIndex++;
        
        // Play sound only for new messages
        if (audioRef.current) {
          const clone = audioRef.current.cloneNode() as HTMLAudioElement;
          clone.volume = 0.3;
          
          try {
            // Only play sound every 2-3 characters for more authentic typing rhythm
            if (currentIndex % 3 === 0 || currentIndex % 2 === 0) {
              clone.volume = 0.5;
              clone.play().catch(e => console.log("Audio play prevented:", e));
              clone.playbackRate = 0.8 + Math.random() * 0.4; // Between 0.8 and 1.2
            }
          } catch (error) {
            console.log("Error playing sound:", error);
          }
        }
      } else {
        clearInterval(interval);
        setIsTyping(false);
      }
    }, typingSpeed);
    
    return () => {
      clearInterval(interval);
      setIsTyping(false);
    };
  }, [message, isUser, isNew]);
  return (
    <motion.div 
      className={`flex items-start mb-4 ${isUser ? 'justify-end' : ''}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {!isUser && (
        <div className={`w-8 h-8 rounded-full bg-oracle-deep-purple flex items-center justify-center text-oracle-gold mr-3 flex-shrink-0 ${!loading ? 'animate-oracle-pulse' : ''}`}>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <circle cx="12" cy="12" r="4" />
            <line x1="4.93" y1="4.93" x2="9.17" y2="9.17" />
            <line x1="14.83" y1="14.83" x2="19.07" y2="19.07" />
            <line x1="14.83" y1="9.17" x2="19.07" y2="4.93" />
            <line x1="14.83" y1="9.17" x2="18.36" y2="5.64" />
            <line x1="4.93" y1="19.07" x2="9.17" y2="14.83" />
          </svg>
        </div>
      )}
      
      <div className={`${
        isUser 
          ? 'bg-oracle-navy/60 shadow-sm border border-oracle-gold/20' 
          : 'bg-oracle-deep-purple/75 border-2 border-oracle-gold/40'
        } rounded-lg py-3 px-4 max-w-xs md:max-w-md ${!isUser && !loading ? 'animate-oracle-breathe' : ''}`}>
        <p className={`${
          isUser 
            ? 'font-garamond text-white font-medium text-base' 
            : 'font-garamond text-oracle-soft-gold font-medium text-lg'
          } ${loading ? 'animate-pulse' : ''} ${isTyping && !isUser ? 'oracle-typing' : ''}`}
          style={{ fontFamily: "'Cormorant Garamond', serif", textShadow: isUser ? '0 0 1px rgba(255,255,255,0.8)' : '0 0 2px rgba(255,215,0,0.8)', letterSpacing: '0.02em' }}
        >
          {isUser ? message : displayedText}
          {isTyping && !isUser && <span className="oracle-cursor">|</span>}
        </p>
      </div>
      
      {isUser && (
        <div className="w-8 h-8 rounded-full bg-oracle-navy border border-oracle-gold/30 flex items-center justify-center text-oracle-soft-gold ml-3 flex-shrink-0">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
        </div>
      )}
    </motion.div>
  );
}
