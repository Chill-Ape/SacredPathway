import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { motion } from "framer-motion";

export default function Hero() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-16 relative overflow-hidden">
      {/* Background sacred geometry pattern */}
      <div className="absolute inset-0 opacity-5 pointer-events-none">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <pattern id="heroPattern" x="0" y="0" width="120" height="120" patternUnits="userSpaceOnUse">
            <circle cx="60" cy="60" r="50" fill="none" stroke="currentColor" strokeWidth="0.5" />
            <path d="M60 10 L110 85 L10 85 Z" fill="none" stroke="currentColor" strokeWidth="0.5" />
            <path d="M25 40 L95 40 L60 90 Z" fill="none" stroke="currentColor" strokeWidth="0.5" />
          </pattern>
          <rect x="0" y="0" width="100%" height="100%" fill="url(#heroPattern)" />
        </svg>
      </div>
      
      {/* Animated light rays */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div 
          className="absolute top-0 left-1/2 -ml-[150px] w-[300px] h-[600px] bg-sacred-blue/5 blur-3xl"
          animate={{ 
            rotate: [0, 15, 0],
            opacity: [0.3, 0.7, 0.3]
          }}
          transition={{ 
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </div>
      
      <div className="max-w-4xl mx-auto text-center relative z-10">
        {/* Sacred geometric symbol */}
        <motion.div 
          className="w-52 h-52 mx-auto mb-8 relative"
          animate={{ y: [0, -10, 0] }}
          transition={{ 
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <div className="w-full h-full relative bg-white rounded-full shadow-lg flex items-center justify-center">
            <motion.svg 
              viewBox="0 0 100 100" 
              className="w-4/5 h-4/5"
              style={{ filter: "drop-shadow(0 4px 6px rgba(0, 0, 0, 0.1))" }}
              initial={{ rotate: 0 }}
              animate={{ rotate: 360 }}
              transition={{
                duration: 120,
                repeat: Infinity,
                ease: "linear"
              }}
            >
              {/* Outer circle */}
              <circle 
                cx="50" 
                cy="50" 
                r="45" 
                fill="none" 
                stroke="hsl(214, 60%, 24%)" 
                strokeWidth="0.5"
                strokeDasharray="1,3"
              />
              
              {/* Middle circle */}
              <circle 
                cx="50" 
                cy="50" 
                r="35" 
                fill="none" 
                stroke="hsl(214, 60%, 24%)" 
                strokeWidth="0.5"
              />
              
              {/* Inner triangle */}
              <polygon 
                points="50,15 10,85 90,85" 
                fill="none" 
                stroke="hsl(214, 60%, 24%)" 
                strokeWidth="2"
              />
              
              {/* Circle inside */}
              <circle 
                cx="50" 
                cy="50" 
                r="20" 
                fill="none" 
                stroke="hsl(214, 60%, 24%)" 
                strokeWidth="2"
              />
              
              {/* Sacred symbols around */}
              <g fill="hsl(214, 60%, 24%)" fontSize="7">
                <text x="47" y="13" textAnchor="middle">✧</text>
                <text x="92" y="85" textAnchor="middle">✧</text>
                <text x="8" y="85" textAnchor="middle">✧</text>
              </g>
              
              {/* Dot in center */}
              <circle 
                cx="50" 
                cy="50" 
                r="3" 
                fill="hsl(214, 60%, 24%)" 
              />
            </motion.svg>
          </div>
          <motion.div 
            className="absolute inset-0 bg-sacred-blue/10 rounded-full blur-md"
            animate={{ opacity: [0.6, 0.8, 0.6] }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        </motion.div>
        
        <motion.h1 
          className="text-4xl md:text-6xl font-cinzel font-bold text-sacred-blue mb-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
        >
          Discover Ancient Wisdom
        </motion.h1>
        
        {/* Sacred divider */}
        <div className="flex items-center justify-center max-w-md mx-auto mb-6">
          <div className="h-px bg-sacred-blue/20 flex-grow"></div>
          <div className="mx-3 text-sacred-blue/60">✧</div>
          <div className="h-px bg-sacred-blue/20 w-16"></div>
          <div className="mx-3 text-sacred-blue/60">✧</div>
          <div className="h-px bg-sacred-blue/20 flex-grow"></div>
        </div>
        
        <motion.p 
          className="text-lg md:text-xl font-raleway text-sacred-gray mb-8 max-w-2xl mx-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.3 }}
        >
          Welcome to The Sacred Archive, a repository of timeless knowledge that transcends the ages. 
          Journey through the sacred scrolls and uncover the mysteries of the Great Cycle.
        </motion.p>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.5 }}
          className="relative"
        >
          <Link href="/scrolls">
            <Button
              className="bg-sacred-blue hover:bg-sacred-blue-light text-sacred-white font-cinzel tracking-wider px-8 py-7 rounded border border-sacred-blue/30 shadow-lg transform hover:scale-105 transition-all duration-300"
              size="lg"
            >
              Begin the Journey
            </Button>
          </Link>
          
          {/* Button aura effect */}
          <motion.div 
            className="absolute -inset-4 bg-sacred-blue/5 rounded-full blur-md -z-10"
            animate={{ 
              scale: [1, 1.1, 1],
              opacity: [0.5, 0.7, 0.5] 
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        </motion.div>
      </div>
    </div>
  );
}
