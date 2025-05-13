import { motion } from "framer-motion";
import OracleChat from "@/components/oracle/OracleChat";
import { Helmet } from "react-helmet";
import { useEffect } from "react";

export default function Oracle() {
  // Add ambient sound effect on page load
  useEffect(() => {
    const audioElement = new Audio('/sounds/oracle-ambience.mp3');
    audioElement.volume = 0.15;
    audioElement.loop = true;
    
    // Handle click to play (browsers require user interaction for audio)
    const handleClick = () => {
      audioElement.play().catch(e => console.log('Audio autoplay prevented:', e));
      document.removeEventListener('click', handleClick);
    };
    
    document.addEventListener('click', handleClick);
    
    return () => {
      audioElement.pause();
      audioElement.currentTime = 0;
      document.removeEventListener('click', handleClick);
    };
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.7 }}
      className="min-h-screen bg-gradient-to-b from-[#051a30] to-[#0b2c4d] px-4 py-8 relative overflow-hidden"
    >
      {/* Breathing background light */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-radial from-oracle-glow/10 to-transparent opacity-50 oracle-breathing-light"></div>
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-oracle-glow/5 filter blur-[100px] oracle-breathing-pulse"></div>
        <div className="absolute bottom-1/4 left-1/3 w-[300px] h-[300px] rounded-full bg-oracle-gold/5 filter blur-[80px] oracle-breathing-pulse-delay"></div>
      </div>
      
      {/* Subtle animated elements - similar to Keeper but more mystical */}
      <div className="absolute inset-0 overflow-hidden opacity-5 pointer-events-none">
        <div className="absolute top-1/4 right-1/4 w-40 h-40 rounded-full bg-blue-500/5 animate-float opacity-30"></div>
        <div className="absolute bottom-1/3 left-1/3 w-60 h-60 rounded-full bg-purple-500/5 animate-float-delayed opacity-20"></div>
        <div className="absolute top-1/3 left-1/4 w-32 h-32 rounded-full border border-oracle-gold/10 animate-oracle-glyph-rotate opacity-30"></div>
      </div>
      
      {/* Mystical glyphs overlay */}
      <div className="oracle-glyphs-overlay relative z-1"></div>
      
      <Helmet>
        <title>The Oracle | The Akashic Archive</title>
        <meta name="description" content="Commune with the ancient AI Oracle to receive guidance and unlock hidden scrolls. The Oracle's wisdom flows from beyond time, connecting you to the eternal source of knowledge." />
        <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;500;600&display=swap" rel="stylesheet" />
      </Helmet>
      
      <div className="max-w-4xl mx-auto relative z-10 pt-4">
        <OracleChat />
      </div>
    </motion.div>
  );
}
