import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";

// Floating particle component
const Particle = ({ delay, duration, size, left, top }: { delay: number, duration: number, size: number, left: string, top: string }) => {
  return (
    <motion.div
      className="absolute rounded-full bg-sacred-blue/20"
      style={{ 
        width: `${size}px`, 
        height: `${size}px`, 
        left, 
        top 
      }}
      initial={{ opacity: 0, y: 0 }}
      animate={{ 
        opacity: [0, 0.5, 0],
        y: -100,
        x: Math.random() > 0.5 ? 20 : -20,
      }}
      transition={{ 
        delay,
        duration, 
        repeat: Infinity, 
        ease: "easeInOut" 
      }}
    />
  );
};

// Ancient glyph component
const AncientGlyph = ({ symbol, left, top, size, rotation, delay }: 
  { symbol: string, left: string, top: string, size: number, rotation: number, delay: number }) => {
  return (
    <motion.div
      className="absolute text-sacred-blue/10 font-cinzel"
      style={{ 
        left, 
        top, 
        fontSize: `${size}px`,
        transform: `rotate(${rotation}deg)`,
      }}
      initial={{ opacity: 0 }}
      animate={{ 
        opacity: [0, 0.7, 0],
      }}
      transition={{ 
        delay,
        duration: 15, 
        repeat: Infinity, 
        ease: "easeInOut" 
      }}
    >
      {symbol}
    </motion.div>
  );
};

export default function Hero() {
  // Removed custom cursor effects that were causing mouse visibility issues
  // Declare isHovering state for backward compatibility
  const [isHovering, setIsHovering] = useState(false);

  // Generate particles
  const particles = Array.from({ length: 15 }).map((_, i) => ({
    id: i,
    delay: Math.random() * 10,
    duration: 5 + Math.random() * 10,
    size: 3 + Math.random() * 8,
    left: `${10 + Math.random() * 80}%`,
    top: `${20 + Math.random() * 50}%`
  }));
  
  // Generate ancient glyphs
  const glyphs = [
    { symbol: "ᛟ", left: "10%", top: "20%", size: 24, rotation: 15, delay: 2 },
    { symbol: "ᛏ", left: "85%", top: "30%", size: 28, rotation: -10, delay: 5 },
    { symbol: "ᚠ", left: "20%", top: "70%", size: 32, rotation: 5, delay: 8 },
    { symbol: "ᚹ", left: "75%", top: "65%", size: 26, rotation: -5, delay: 12 },
    { symbol: "ᚦ", left: "15%", top: "40%", size: 30, rotation: 20, delay: 15 },
    { symbol: "ᛉ", left: "80%", top: "80%", size: 22, rotation: -15, delay: 18 },
  ];

  return (
    <motion.div 
      className="min-h-screen flex flex-col items-center justify-center px-4 py-16 relative overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1.5 }}
    >
      {/* Custom cursor effect removed to fix mouse visibility issues */}
      
      {/* Animated background with subtle movement */}
      <div className="absolute inset-0 opacity-10 pointer-events-none overflow-hidden">
        <motion.div
          className="absolute w-[200%] h-[200%] -left-1/4 -top-1/4"
          animate={{
            rotate: [0, 360]
          }}
          transition={{
            duration: 240,
            repeat: Infinity,
            ease: "linear",
          }}
        >
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <pattern id="heroPattern" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
              <path d="M50 0 L100 50 L50 100 L0 50 Z" fill="none" stroke="currentColor" strokeWidth="0.3" />
              <circle cx="50" cy="50" r="30" fill="none" stroke="currentColor" strokeWidth="0.3" />
              <circle cx="50" cy="50" r="15" fill="none" stroke="currentColor" strokeWidth="0.3" />
            </pattern>
            <rect x="0" y="0" width="100%" height="100%" fill="url(#heroPattern)" />
          </svg>
        </motion.div>
      </div>
      
      {/* Floating particles */}
      {particles.map(particle => (
        <Particle key={particle.id} {...particle} />
      ))}
      
      {/* Ancient glyphs */}
      {glyphs.map((glyph, index) => (
        <AncientGlyph key={index} {...glyph} />
      ))}
      
      {/* Light rays effect */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div 
          className="absolute top-0 left-1/4 -ml-[150px] w-[300px] h-[150vh] bg-sacred-blue/5 blur-3xl"
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
        <motion.div 
          className="absolute top-0 right-1/4 -mr-[150px] w-[300px] h-[150vh] bg-sacred-blue/5 blur-3xl"
          animate={{ 
            rotate: [0, -15, 0],
            opacity: [0.3, 0.7, 0.3]
          }}
          transition={{ 
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </div>
      
      <div className="max-w-4xl mx-auto text-center relative z-10">
        {/* Sacred geometric symbol with enhanced effects */}
        <motion.div 
          className="w-64 h-64 md:w-80 md:h-80 mx-auto mb-12 relative"
          animate={{ y: [0, -10, 0] }}
          transition={{ 
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          /* Mouse hover effects removed as part of cursor fix */
        >
          {/* Pulsing aura */}
          <motion.div 
            className="absolute inset-0 bg-sacred-blue/5 rounded-full blur-xl"
            animate={{ 
              scale: [1, 1.2, 1],
              opacity: [0.5, 0.8, 0.5] 
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          
          <div className="w-full h-full relative bg-white/80 rounded-full shadow-lg flex items-center justify-center backdrop-blur-sm">
            {/* Rotating outer ring */}
            <motion.div
              className="absolute inset-0 rounded-full border-2 border-sacred-blue/10"
              animate={{ rotate: 360 }}
              transition={{
                duration: 60,
                repeat: Infinity,
                ease: "linear"
              }}
            >
              {Array.from({ length: 12 }).map((_, i) => (
                <div 
                  key={i} 
                  className="absolute w-1.5 h-1.5 bg-sacred-blue/30 rounded-full"
                  style={{
                    top: '50%',
                    left: '50%',
                    transform: `rotate(${i * 30}deg) translateY(-48%) translateX(-50%)`,
                    transformOrigin: 'center'
                  }}
                />
              ))}
            </motion.div>
            
            {/* Spinning elements */}
            <motion.svg 
              viewBox="0 0 100 100" 
              className="absolute inset-0 w-full h-full"
              initial={{ rotate: 0 }}
              animate={{ rotate: 360 }}
              transition={{
                duration: 120,
                repeat: Infinity,
                ease: "linear"
              }}
            >
              <circle 
                cx="50" 
                cy="50" 
                r="48" 
                fill="none" 
                stroke="hsl(214, 60%, 24%, 0.2)" 
                strokeWidth="0.5"
                strokeDasharray="1,3"
              />
            </motion.svg>
            
            {/* The sacred symbol */}
            <svg 
              viewBox="0 0 200 200" 
              className="relative w-3/4 h-3/4 z-10" 
              style={{ 
                filter: "drop-shadow(0 0 10px rgba(0, 100, 255, 0.2))"
              }}
            >
              {/* Outer glow for the symbol - animated */}
              <motion.g
                initial={{ opacity: 0.3 }}
                animate={{ opacity: [0.3, 0.6, 0.3] }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                {/* Dot above */}
                <circle 
                  cx="100" 
                  cy="30" 
                  r="12" 
                  fill="none"
                  stroke="hsl(214, 70%, 50%, 0.3)" 
                  strokeWidth="4"
                  className="blur-sm"
                />
                
                {/* Triangle */}
                <path 
                  d="M100 55 L25 165 L175 165 Z" 
                  fill="none" 
                  stroke="hsl(214, 70%, 50%, 0.3)" 
                  strokeWidth="10"
                  className="blur-sm"
                />
                
                {/* Circle inside - adjusted to fit within triangle */}
                <circle 
                  cx="100" 
                  cy="120" 
                  r="28" 
                  fill="none" 
                  stroke="hsl(214, 70%, 50%, 0.3)" 
                  strokeWidth="10"
                  className="blur-sm"
                />
                
                {/* Line below */}
                <line 
                  x1="20" 
                  y1="185" 
                  x2="180" 
                  y2="185" 
                  stroke="hsl(214, 70%, 50%, 0.3)" 
                  strokeWidth="10"
                  className="blur-sm"
                />
              </motion.g>
              
              {/* Actual symbol */}
              <g>
                {/* Dot above */}
                <circle 
                  cx="100" 
                  cy="30" 
                  r="10" 
                  fill="hsl(214, 80%, 24%)" 
                />
                
                {/* Triangle */}
                <path 
                  d="M100 55 L25 165 L175 165 Z" 
                  fill="none" 
                  stroke="hsl(214, 80%, 24%)" 
                  strokeWidth="8"
                />
                
                {/* Circle inside - adjusted to fit within triangle */}
                <circle 
                  cx="100" 
                  cy="120" 
                  r="28" 
                  fill="none" 
                  stroke="hsl(214, 80%, 24%)" 
                  strokeWidth="8"
                />
                
                {/* Line below */}
                <line 
                  x1="20" 
                  y1="185" 
                  x2="180" 
                  y2="185" 
                  stroke="hsl(214, 80%, 24%)" 
                  strokeWidth="8"
                />
              </g>
            </svg>
            
            {/* Inner pulsing light */}
            <motion.div 
              className="absolute inset-[20%] bg-sacred-blue/5 rounded-full blur-md"
              animate={{ 
                scale: [1, 1.2, 1],
                opacity: [0.3, 0.7, 0.3] 
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
          </div>
        </motion.div>
        
        <motion.h1 
          className="text-4xl md:text-7xl font-cinzel font-bold text-sacred-blue mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.3 }}
        >
          The Akashic Archive
        </motion.h1>
        
        {/* Sacred divider with animation */}
        <motion.div 
          className="flex items-center justify-center max-w-md mx-auto mb-8"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          <div className="h-px bg-sacred-blue/20 flex-grow"></div>
          <motion.div 
            className="mx-3 text-sacred-blue/60"
            animate={{ rotate: [0, 180, 360], scale: [1, 1.2, 1] }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          >✧</motion.div>
          <div className="h-px bg-sacred-blue/20 w-16"></div>
          <motion.div 
            className="mx-3 text-sacred-blue/60"
            animate={{ rotate: [0, -180, -360], scale: [1, 1.2, 1] }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          >✧</motion.div>
          <div className="h-px bg-sacred-blue/20 flex-grow"></div>
        </motion.div>
        
        <motion.p 
          className="text-lg md:text-xl font-garamond text-sacred-gray mb-12 max-w-2xl mx-auto leading-relaxed"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.9 }}
        >
          A repository of timeless wisdom that transcends the ages.<br /> 
          Journey through sacred knowledge and uncover the mysteries of existence.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 1.2 }}
          className="relative"
          /* Mouse hover effects removed as part of cursor fix */
        >
          <Link href="/ark-contents">
            <Button
              className="bg-sacred-blue hover:bg-sacred-blue-light text-sacred-white font-cinzel tracking-widest text-lg px-10 py-8 rounded-md border border-sacred-blue/30 shadow-lg transform hover:scale-105 transition-all duration-500"
              size="lg"
            >
              Begin the Journey
            </Button>
          </Link>
          
          {/* Enhanced button aura effect */}
          <motion.div 
            className="absolute -inset-4 bg-sacred-blue/10 rounded-full blur-xl -z-10"
            animate={{ 
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.7, 0.3] 
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        </motion.div>
      </div>
      
      {/* Corner decorative elements */}
      <div className="absolute top-6 left-6 text-sacred-blue/20 text-2xl opacity-50">⟁</div>
      <div className="absolute top-6 right-6 text-sacred-blue/20 text-2xl opacity-50">⟁</div>
      <div className="absolute bottom-6 left-6 text-sacred-blue/20 text-2xl opacity-50 rotate-180">⟁</div>
      <div className="absolute bottom-6 right-6 text-sacred-blue/20 text-2xl opacity-50 rotate-180">⟁</div>
    </motion.div>
  );
}
