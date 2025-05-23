import React, { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Helmet } from "react-helmet";
import { Volume2, VolumeX } from "lucide-react";
import PeacefulAmbience from "../utils/PeacefulAmbience";
import PortalWhoosh from "../utils/PortalWhoosh";
import "../styles/landing1.css";

const Landing1 = () => {
  const [, navigate] = useLocation();
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [playWhoosh, setPlayWhoosh] = useState(false);

  // Handle transition to home page with enhanced animation
  const handleBeginJourney = () => {
    setIsTransitioning(true);

    // Play the portal whooshing sound immediately
    setPlayWhoosh(true);

    // Gradually fade out the peaceful ambient sound
    setTimeout(() => {
      setSoundEnabled(false);
    }, 500);

    // Navigate after the animation sequence finishes
    setTimeout(() => {
      navigate("/");
    }, 2500); // Increased to match the combined CSS animation sequence duration
  };

  // Enable sound by default when component mounts
  useEffect(() => {
    // Set sound enabled by default
    setSoundEnabled(true);

    return () => {
      // Make sure sound is turned off when component unmounts
      setSoundEnabled(false);
    };
  }, []);

  // Create particle elements for the starry background
  useEffect(() => {
    const createParticle = () => {
      const particles = document.getElementById("particles");
      if (!particles) return;

      const particle = document.createElement("div");
      particle.classList.add("particle");

      // Random position
      const posX = Math.random() * 100;
      const posY = Math.random() * 100;
      particle.style.left = `${posX}%`;
      particle.style.top = `${posY}%`;

      // Random size
      const size = Math.random() * 2 + 0.5;
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
    for (let i = 0; i < 50; i++) {
      createParticle();
    }

    // Continue creating particles
    const interval = setInterval(() => {
      createParticle();
    }, 2000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  return (
    <>
      <Helmet>
        <title>The Archive | Akashic Archive</title>
        <meta
          name="description"
          content="Enter the gate. Awaken the memory. The Akashic Archive awaits those who seek ancient wisdom."
        />
      </Helmet>

      {/* Peaceful ambient background sound */}
      <PeacefulAmbience isPlaying={soundEnabled} volume={0.25} />

      {/* Portal whoosh sound effect for transition */}
      <PortalWhoosh
        play={playWhoosh}
        volume={0.6}
        onComplete={() => setPlayWhoosh(false)}
      />

      {/* Sound toggle button */}
      <button
        className={`sound-toggle ${soundEnabled ? "" : "muted"}`}
        onClick={() => setSoundEnabled(!soundEnabled)}
        aria-label={
          soundEnabled ? "Mute ambient sound" : "Enable ambient sound"
        }
      >
        {soundEnabled ? <Volume2 /> : <VolumeX />}
      </button>

      <div className={`light-transition ${isTransitioning ? "active" : ""}`}>
        <div className="transition-grid"></div>
        <div className="light-beams">
          <div className="beam beam-1"></div>
          <div className="beam beam-2"></div>
          <div className="beam beam-3"></div>
          <div className="beam beam-4"></div>
        </div>
      </div>

      <div className="landing-container">
        <div id="particles" className="particles-container"></div>

        <div className="ambient-light"></div>

        {/* Additional ambient flowing lights */}
        <div className="flowing-lights">
          <div className="flowing-light light-1"></div>
          <div className="flowing-light light-2"></div>
          <div className="flowing-light light-3"></div>
          <div className="flowing-light light-4"></div>
          <div className="flowing-light light-5"></div>
          <div className="flowing-light light-6"></div>
          <div className="flowing-light light-7"></div>
          <div className="flowing-light light-8"></div>
          <div className="flowing-light light-9"></div>
          <div className="flowing-light light-10"></div>
          <div className="flowing-light light-bright-1"></div>
          <div className="flowing-light light-bright-2"></div>
          <div className="flowing-light light-bright-3"></div>
        </div>

        <div className="content-container">
          <motion.div className="sacred-symbol">
            <svg viewBox="0 0 100 100" className="symbol-svg">
              <motion.g
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1 }}
                filter="none"
              >
                {/* Sacred geometry - triangle with refined dimensions */}
                <motion.path
                  d="M50 20 L15 75 L85 75 Z"
                  fill="none"
                  stroke="rgba(25, 95, 145, 0.95)"
                  strokeWidth="3.5"
                  animate={{
                    stroke: [
                      "rgba(25, 95, 145, 0.95)",
                      "rgba(40, 110, 160, 1)",
                      "rgba(25, 95, 145, 0.95)",
                    ],
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />

                {/* Circle aligned to touch the triangle sides properly */}
                <motion.circle
                  cx="50"
                  cy="56"
                  r="16.5"
                  fill="none"
                  stroke="rgba(25, 95, 145, 0.95)"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  animate={{
                    stroke: [
                      "rgba(25, 95, 145, 0.95)",
                      "rgba(40, 110, 160, 1)",
                      "rgba(25, 95, 145, 0.95)",
                    ],
                  }}
                  transition={{
                    duration: 4,
                    delay: 0.5,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />

                {/* Line underneath - precise position */}
                <motion.line
                  x1="10"
                  y1="90"
                  x2="90"
                  y2="90"
                  stroke="rgba(25, 95, 145, 0.95)"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  animate={{
                    stroke: [
                      "rgba(25, 95, 145, 0.95)",
                      "rgba(40, 110, 160, 1)",
                      "rgba(25, 95, 145, 0.95)",
                    ],
                  }}
                  transition={{
                    duration: 4,
                    delay: 0.7,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />

                {/* Dot above the triangle - perfect size */}
                <motion.circle
                  cx="50"
                  cy="10"
                  r="3.5"
                  fill="rgba(25, 95, 145, 0.95)"
                  animate={{
                    fill: [
                      "rgba(25, 95, 145, 0.95)",
                      "rgba(40, 110, 160, 1)",
                      "rgba(25, 95, 145, 0.95)",
                    ],
                  }}
                  transition={{
                    duration: 4,
                    delay: 1,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />
              </motion.g>
            </svg>

            <motion.div
              className="glow"
              animate={{
                opacity: [0.4, 0.8, 0.4],
                scale: [1, 1.3, 1],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            ></motion.div>
          </motion.div>

          <motion.div
            className="message-container"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 1.5,
              delay: 1.2,
              ease: "easeOut",
            }}
          >
            <motion.h1
              className="primary-message"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{
                duration: 2,
                delay: 1.5,
              }}
            >
              THE ARCHIVE REMEMBERS.
              <br />
              DO YOU?
            </motion.h1>

            <motion.h2
              className="secondary-message"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{
                duration: 2,
                delay: 2.2,
              }}
            >
              ENTER THE GATE.
              <br />
              AWAKEN THE MEMORY.
            </motion.h2>

            <motion.button
              className="enter-button"
              initial={{ opacity: 0 }}
              animate={{
                opacity: 1,
                boxShadow: [
                  "0 0 15px 3px rgba(255, 215, 0, 0.3)",
                  "0 0 20px 5px rgba(255, 215, 0, 0.5)",
                  "0 0 15px 3px rgba(255, 215, 0, 0.3)",
                ],
              }}
              whileHover={{
                scale: 1.05,
                boxShadow: "0 0 25px 8px rgba(255, 215, 0, 0.4)",
              }}
              whileTap={{ scale: 0.98 }}
              onClick={handleBeginJourney}
              transition={{
                opacity: {
                  duration: 1.5,
                  delay: 3,
                },
                boxShadow: {
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 3,
                },
              }}
            >
              Open Portal
            </motion.button>
          </motion.div>
        </div>
      </div>
    </>
  );
};

export default Landing1;
