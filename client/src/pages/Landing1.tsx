import React, { useEffect } from 'react';
import { Link } from 'wouter';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet';
import '../styles/landing1.css';

const Landing1 = () => {
  // Create particle elements
  useEffect(() => {
    const createParticle = () => {
      const particles = document.getElementById('particles');
      if (!particles) return;
      
      const particle = document.createElement('div');
      particle.classList.add('particle');
      
      // Random position
      const posX = Math.random() * 100;
      const posY = Math.random() * 100;
      particle.style.left = `${posX}%`;
      particle.style.top = `${posY}%`;
      
      // Random size
      const size = Math.random() * 3 + 1;
      particle.style.width = `${size}px`;
      particle.style.height = `${size}px`;
      
      // Random opacity
      const opacity = Math.random() * 0.5 + 0.2;
      particle.style.opacity = opacity.toString();
      
      // Random animation duration
      const duration = Math.random() * 20 + 10;
      particle.style.animation = `float ${duration}s linear infinite`;
      
      particles.appendChild(particle);
      
      // Remove particle after some time
      setTimeout(() => {
        if (particles.contains(particle)) {
          particles.removeChild(particle);
        }
      }, duration * 1000);
    };
    
    // Create initial particles
    for (let i = 0; i < 30; i++) {
      createParticle();
    }
    
    // Continue creating particles
    const interval = setInterval(() => {
      createParticle();
    }, 1000);
    
    return () => {
      clearInterval(interval);
    };
  }, []);

  return (
    <>
      <Helmet>
        <title>The Archive Awaits | Akashic Archive</title>
        <meta name="description" content="Enter the gate. Awaken the memory. The Akashic Archive awaits those who seek ancient wisdom." />
      </Helmet>
      
      <div className="landing-container">
        <div id="particles" className="particles-container"></div>
        
        <div className="ambient-light"></div>
        
        <div className="content-container">
          <motion.div 
            className="sacred-symbol"
            animate={{ 
              boxShadow: ["0 0 20px 5px rgba(255, 215, 0, 0.3)", "0 0 40px 10px rgba(255, 215, 0, 0.5)", "0 0 20px 5px rgba(255, 215, 0, 0.3)"]
            }}
            transition={{ 
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            <svg viewBox="0 0 100 100" className="symbol-svg">
              <motion.g
                animate={{ 
                  opacity: [0.8, 1, 0.8],
                  scale: [1, 1.05, 1]
                }}
                transition={{ 
                  duration: 5,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                {/* Triangle */}
                <motion.path 
                  d="M50 10 L90 80 L10 80 Z" 
                  fill="none" 
                  stroke="rgba(255, 215, 0, 0.9)" 
                  strokeWidth="2"
                  animate={{ 
                    stroke: ["rgba(255, 215, 0, 0.9)", "rgba(255, 225, 0, 1)", "rgba(255, 215, 0, 0.9)"]
                  }}
                  transition={{ 
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />
                
                {/* Circle */}
                <motion.circle 
                  cx="50" 
                  cy="55" 
                  r="20" 
                  fill="none" 
                  stroke="rgba(255, 215, 0, 0.9)" 
                  strokeWidth="2"
                  animate={{ 
                    stroke: ["rgba(255, 215, 0, 0.9)", "rgba(255, 225, 0, 1)", "rgba(255, 215, 0, 0.9)"]
                  }}
                  transition={{ 
                    duration: 4,
                    delay: 0.5,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />
                
                {/* Dot above */}
                <motion.circle 
                  cx="50" 
                  cy="10" 
                  r="4" 
                  fill="rgba(255, 215, 0, 0.9)"
                  animate={{ 
                    fill: ["rgba(255, 215, 0, 0.9)", "rgba(255, 225, 0, 1)", "rgba(255, 215, 0, 0.9)"],
                    r: [4, 4.5, 4]
                  }}
                  transition={{ 
                    duration: 4,
                    delay: 1,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />
              </motion.g>
            </svg>
            
            <motion.div 
              className="glow"
              animate={{ 
                opacity: [0.4, 0.7, 0.4],
                scale: [1, 1.2, 1]
              }}
              transition={{ 
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            ></motion.div>
          </motion.div>
          
          <motion.div 
            className="message-container"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ 
              duration: 1.5,
              delay: 0.8,
              ease: "easeOut"
            }}
          >
            <h1 className="primary-message">If you're here, the Archive has already found you</h1>
            <h2 className="secondary-message">Enter the Gate. Awaken the memory?</h2>
            
            <Link to="/">
              <motion.button 
                className="enter-button"
                whileHover={{ 
                  scale: 1.05,
                  boxShadow: "0 0 25px 8px rgba(255, 215, 0, 0.3)"
                }}
                whileTap={{ scale: 0.98 }}
                animate={{
                  boxShadow: ["0 0 15px 3px rgba(255, 215, 0, 0.3)", "0 0 20px 5px rgba(255, 215, 0, 0.5)", "0 0 15px 3px rgba(255, 215, 0, 0.3)"]
                }}
                transition={{
                  boxShadow: {
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }
                }}
              >
                Open the Portal
              </motion.button>
            </Link>
          </motion.div>
        </div>
      </div>
    </>
  );
};

export default Landing1;