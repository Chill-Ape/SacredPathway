import { motion } from "framer-motion";
import { useState, useEffect, useRef } from "react";

interface ChatMessageProps {
  isUser: boolean;
  message: string;
  loading?: boolean;
}

export default function ChatMessage({ isUser, message, loading = false }: ChatMessageProps) {
  const [displayedText, setDisplayedText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const typingSpeed = 40; // ms per character
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  useEffect(() => {
    // Only do typewriter effect for Oracle messages, not user messages
    if (isUser) {
      setDisplayedText(message);
      return;
    }
    
    // Initialize audio for typewriter sound
    if (!audioRef.current) {
      audioRef.current = new Audio("/sounds/typewriter.mp3");
      audioRef.current.volume = 0.2;
    }
    
    let currentIndex = 0;
    setIsTyping(true);
    
    // Progressively reveal text with typewriter effect
    const interval = setInterval(() => {
      if (currentIndex < message.length) {
        setDisplayedText(message.substring(0, currentIndex + 1));
        currentIndex++;
        
        // Play typewriter sound
        if (audioRef.current) {
          // Reset and play for better sound effect continuity
          const clone = audioRef.current.cloneNode() as HTMLAudioElement;
          clone.volume = 0.1;
          clone.play().catch(e => console.log("Audio play prevented:", e));
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
  }, [message, isUser]);
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
          ? 'bg-oracle-navy/40 shadow-sm border border-oracle-gold/20' 
          : 'bg-oracle-deep-purple/30 border border-oracle-gold/30'
        } rounded-lg py-3 px-4 max-w-xs md:max-w-md ${!isUser && !loading ? 'animate-oracle-breathe' : ''}`}>
        <p className={`${
          isUser 
            ? 'font-garamond text-oracle-soft-gold/90' 
            : 'font-garamond text-oracle-gold'
          } ${loading ? 'animate-pulse' : ''} ${isTyping && !isUser ? 'oracle-typing' : ''}`}
          style={{ fontFamily: "'Cormorant Garamond', serif" }}
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
