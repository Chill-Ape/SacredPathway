import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { motion } from "framer-motion";

export default function Hero() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-16">
      <div className="max-w-4xl mx-auto text-center">
        {/* Sacred geometric symbol */}
        <motion.div 
          className="w-40 h-40 mx-auto mb-8 relative"
          animate={{ y: [0, -10, 0] }}
          transition={{ 
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <div className="w-full h-full relative bg-white rounded-full shadow-lg flex items-center justify-center">
            <svg 
              viewBox="0 0 100 100" 
              className="w-4/5 h-4/5"
              style={{ filter: "drop-shadow(0 4px 6px rgba(0, 0, 0, 0.1))" }}
            >
              {/* Triangle */}
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
              {/* Dot in center */}
              <circle 
                cx="50" 
                cy="50" 
                r="3" 
                fill="hsl(214, 60%, 24%)" 
              />
            </svg>
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
        >
          <Link href="/scrolls">
            <Button
              className="bg-sacred-blue hover:bg-sacred-blue-light text-sacred-white font-cinzel tracking-wider px-8 py-7 rounded border border-sacred-blue/30 shadow-lg transform hover:scale-105 transition-all duration-300"
              size="lg"
            >
              Begin the Journey
            </Button>
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
