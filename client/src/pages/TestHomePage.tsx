import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Book, Scroll, Tablet, Archive, Volume2, VolumeX } from 'lucide-react';
import { Helmet } from 'react-helmet';
import { Slider } from '@/components/ui/slider';

// Import assets using public paths for better performance
const tabletImage = '/assets/crystal_tablet.png';
const scrollImage = '/assets/scroll_1.jpg';
const bookImage = '/assets/book_1.png';
const artifactImage = '/assets/artifact_1.png';
const sacredSymbol = '/assets/sacred_symbol.png';

// Category card for the archive sections
const ArchiveCard = ({ 
  title, 
  icon, 
  path, 
  image,
  delay,
  isLocked = false,
  completionPercentage = 0
}: { 
  title: string; 
  icon: React.ReactNode; 
  path: string; 
  image: string;
  delay: number;
  isLocked?: boolean;
  completionPercentage?: number;
}) => {
  const [, setLocation] = useLocation();
  
  return (
    <motion.div
      className="relative"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, delay }}
    >
      <div 
        className={`group h-64 w-full md:h-80 md:w-56 lg:h-96 lg:w-64 perspective-1000 cursor-pointer ${isLocked ? 'item-locked' : ''}`}
        onClick={() => !isLocked && setLocation(path)}
      >
        <div className="relative h-full w-full transform-style-3d transition-transform duration-700 group-hover:rotate-y-10">
          <div className="relic-card absolute inset-0 flex flex-col items-center justify-center rounded-lg border border-amber-900/30 bg-slate-900/40 p-4 text-center backdrop-blur-sm">
            <div className="mb-3 h-36 w-36 md:h-40 md:w-40 lg:h-48 lg:w-48 overflow-hidden rounded-md">
              <img 
                src={image} 
                alt={title} 
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" 
              />
            </div>
            
            <div className="relic-glow absolute inset-0 opacity-0 rounded-lg transition-opacity duration-500 group-hover:opacity-40"></div>
            
            <h3 className="mt-4 text-2xl font-semibold text-amber-100/80">{title}</h3>
            
            <div className="mt-2 text-amber-500/70">{icon}</div>
            
            {/* Completion percentage */}
            {!isLocked && completionPercentage > 0 && (
              <div className="mt-3 w-full max-w-[80%]">
                <div className="text-xs text-amber-100/60 text-left mb-1">
                  {completionPercentage}% Recovered
                </div>
                <div className="w-full h-1 bg-slate-800/60 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-amber-500/60 rounded-full" 
                    style={{ width: `${completionPercentage}%` }}
                  />
                </div>
              </div>
            )}
            
            <motion.div 
              className="mt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              {isLocked ? (
                <Button 
                  variant="outline" 
                  className="border-amber-600/40 text-amber-100/80 hover:bg-amber-900/20"
                  onClick={(e) => {
                    e.stopPropagation();
                    setLocation('/initiate');
                  }}
                >
                  Unlock Tier
                </Button>
              ) : (
                <Button 
                  variant="outline" 
                  className="border-amber-600/40 text-amber-100/80 hover:bg-amber-900/20"
                >
                  Access
                </Button>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// Memory progress indicator (placeholder for future use)
const MemoryProgress = () => {
  // This would be calculated based on user progress data
  const progress = 15; // percentage
  
  return (
    <motion.div 
      className="mt-16 md:mt-24 text-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 3, duration: 1.2 }}
    >
      <h4 className="text-amber-100/80 text-sm tracking-widest font-medium mb-3 flex items-center justify-center">
        <span className="inline-block w-8 h-0.5 bg-amber-500/50 mr-3"></span>
        MEMORY FRAGMENTS RECOVERED
        <span className="inline-block w-8 h-0.5 bg-amber-500/50 ml-3"></span>
      </h4>
      
      <div className="relative w-full max-w-md mx-auto">
        <div className="w-full h-2 bg-slate-800/60 rounded-full overflow-hidden border border-amber-800/20">
          <motion.div 
            className="h-full bg-gradient-to-r from-amber-700/60 to-amber-500/70 rounded-full relative"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ delay: 3.2, duration: 1, ease: "easeOut" }}
          >
            <span className="absolute top-0 right-0 h-full w-1 bg-amber-300/60 rounded-full filter blur-[1px]"></span>
          </motion.div>
        </div>
        
        <div className="mt-4 flex items-center justify-between text-xs text-amber-200/70 font-medium">
          <span>0%</span>
          <span className="flex flex-col items-center">
            <span className="text-amber-400/90 text-base">{progress}%</span>
            <span className="mt-1 text-[10px] opacity-80">Current Recovery</span>
          </span>
          <span>100%</span>
        </div>
      </div>
      
      <div className="mt-6 text-xs text-amber-200/60 max-w-md mx-auto">
        <p>Continue exploring the Archive to recover more memory fragments</p>
      </div>
    </motion.div>
  );
};

const TestHomePage = () => {
  const [isIntroOpen, setIsIntroOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [audioVolume, setAudioVolume] = useState(0);
  const [, setLocation] = useLocation();
  
  const audioRef = React.useRef<HTMLAudioElement | null>(null);
  
  // Initialize and handle ambient audio
  // Note: Audio feature is prepared but will be enabled when audio file is added to public directory
  // Updated for deployment: May 14, 2025
  useEffect(() => {
    // Simulate audio behavior without actually using the real audio file yet
    const simulateAudio = () => {
      // This function simulates audio playback while waiting for actual audio files
      console.log("Audio playback simulation initiated");
      setIsAudioPlaying(true);
      setAudioVolume(0.2);
    };
    
    const simulationTimer = setTimeout(() => {
      if (!isLoading) {
        simulateAudio();
      }
    }, 3000);
    
    return () => {
      clearTimeout(simulationTimer);
      setAudioVolume(0);
    };
    
    /* 
    // Actual audio implementation - uncomment when audio file is available
    // Create audio element for ambient sound
    const ambientAudio = new Audio('/ambient-mystical.mp3');
    ambientAudio.loop = true;
    ambientAudio.volume = 0;
    audioRef.current = ambientAudio;
    
    // Fade in audio over 3 seconds
    let volume = 0;
    const targetVolume = 0.2; // Keep volume low so it's not distracting
    
    // Only start playing after loading completes
    const startAudio = () => {
      if (!isLoading) {
        ambientAudio.play().then(() => {
          setIsAudioPlaying(true);
          
          // Gradually increase volume
          const fadeInterval = setInterval(() => {
            volume = Math.min(volume + 0.01, targetVolume);
            ambientAudio.volume = volume;
            setAudioVolume(volume);
            
            if (volume >= targetVolume) {
              clearInterval(fadeInterval);
            }
          }, 100);
        }).catch(err => {
          console.log("Audio autoplay prevented:", err);
        });
      }
    };
    
    // Start audio after a small delay to ensure everything is loaded
    const audioTimer = setTimeout(startAudio, 2000);
    
    // Cleanup function: stop audio when component unmounts
    return () => {
      clearTimeout(audioTimer);
      
      // Fade out audio before stopping
      const fadeOutInterval = setInterval(() => {
        if (ambientAudio && ambientAudio.volume > 0.01) {
          ambientAudio.volume = Math.max(0, ambientAudio.volume - 0.05);
        } else {
          clearInterval(fadeOutInterval);
          ambientAudio.pause();
        }
      }, 50);
      
      // Ensure audio stops if component unmounts during fade
      setTimeout(() => {
        ambientAudio.pause();
      }, 1000);
    };
    */
  }, [isLoading]);
  
  // Simulate loading and show intro modal
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
      // Only show intro if user hasn't dismissed it before
      const hasSeenIntro = localStorage.getItem('hasSeenIntro');
      if (!hasSeenIntro) {
        setIsIntroOpen(true);
      }
    }, 1500);
    
    return () => clearTimeout(timer);
  }, []);
  
  // Handle intro completion
  const handleCloseIntro = () => {
    setIsIntroOpen(false);
    localStorage.setItem('hasSeenIntro', 'true');
  };

  // Toggle audio function
  const toggleAudio = () => {
    if (!audioRef.current) return;
    
    if (isAudioPlaying) {
      // Fade out and pause
      let vol = audioRef.current.volume;
      const fadeOutInterval = setInterval(() => {
        vol = Math.max(0, vol - 0.05);
        if (audioRef.current) audioRef.current.volume = vol;
        setAudioVolume(vol);
        
        if (vol <= 0.01) {
          clearInterval(fadeOutInterval);
          if (audioRef.current) audioRef.current.pause();
          setIsAudioPlaying(false);
        }
      }, 50);
    } else {
      // Start playing and fade in
      audioRef.current.play().then(() => {
        setIsAudioPlaying(true);
        
        let vol = 0;
        const targetVol = 0.2;
        const fadeInInterval = setInterval(() => {
          vol = Math.min(vol + 0.01, targetVol);
          if (audioRef.current) audioRef.current.volume = vol;
          setAudioVolume(vol);
          
          if (vol >= targetVol) {
            clearInterval(fadeInInterval);
          }
        }, 50);
      });
    }
  };
  
  // Handle volume change
  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0];
    setAudioVolume(newVolume);
    // Audio volume will be applied when the actual audio is implemented
    console.log("Volume changed to:", newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  };

  return (
    <>
      <Helmet>
        <title>Akashic Archive | Sacred Gateway to Ancient Knowledge</title>
        <meta name="description" content="Enter the Akashic Archive - an interactive digital simulation of antediluvian wisdom stored in the Ark. Explore tablets, scrolls, artifacts and unlock forgotten knowledge." />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;0,700;1,300;1,400;1,500;1,600;1,700&display=swap" rel="stylesheet" />
      </Helmet>

      {/* Full page loading animation */}
      <AnimatePresence>
        {isLoading && (
          <motion.div 
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900"
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="relative"
            >
              <img src={sacredSymbol} alt="Sacred Symbol" className="w-16 h-16" />
              <div className="absolute inset-0 bg-amber-500/20 blur-xl rounded-full"></div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Introduction Modal */}
      <Dialog open={isIntroOpen} onOpenChange={(open) => {
        setIsIntroOpen(open);
        if (!open) handleCloseIntro();
      }}>
        <DialogContent className="sm:max-w-md border-amber-900/50 bg-slate-900/90 backdrop-blur-md">
          <DialogHeader>
            <DialogTitle className="text-amber-100 text-xl">The Ark Awaits</DialogTitle>
            <DialogDescription className="text-amber-200/70">
              Welcome to the Akashic Archive - a digital relic simulation of the Ark.
            </DialogDescription>
          </DialogHeader>
          
          <div className="absolute top-3 right-3">
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-6 w-6 rounded-full bg-slate-800/50 text-slate-300 hover:bg-slate-700"
              onClick={handleCloseIntro}
              aria-label="Close"
            >
              <span className="sr-only">Close</span>
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 6L6 18"></path>
                <path d="M6 6L18 18"></path>
              </svg>
            </Button>
          </div>
          
          <div className="py-4 space-y-3 text-amber-100/80">
            <p>This archive contains fragments of ancient knowledge from before the Great Flood.</p>
            <p>You will explore sacred tablets, decipher scrolls, examine artifacts, and recover lost memories.</p>
            <p>Some knowledge is freely accessible. Other wisdom must be unlocked through your journey.</p>
          </div>
          
          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            <Button 
              variant="outline" 
              className="text-xs border-amber-700/30 text-amber-300/70"
              onClick={handleCloseIntro}
            >
              I already remember
            </Button>
            <Button 
              className="bg-amber-700/80 hover:bg-amber-600/80 text-amber-50"
              onClick={handleCloseIntro}
            >
              Begin Your Journey
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Main content */}
      <div className="min-h-screen sacred-simulation-bg py-12 md:py-16">
        {/* Audio controls */}
        <motion.div 
          className="fixed bottom-4 right-4 z-50 flex items-center gap-2 bg-slate-900/80 backdrop-blur-sm p-2 rounded-lg border border-amber-600/30"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 4, duration: 0.5 }}
        >
          <button
            onClick={toggleAudio}
            className="p-2 text-amber-500/70 hover:text-amber-400 transition-colors"
            aria-label={isAudioPlaying ? "Mute ambient sound" : "Play ambient sound"}
          >
            {isAudioPlaying ? (
              <Volume2 size={18} />
            ) : (
              <VolumeX size={18} />
            )}
          </button>
          
          {isAudioPlaying && (
            <div className="w-24">
              <Slider
                defaultValue={[audioVolume]}
                max={0.5}
                step={0.01}
                value={[audioVolume]}
                onValueChange={handleVolumeChange}
                className="cursor-pointer"
              />
            </div>
          )}
        </motion.div>
        
        {/* Floating particles */}
        <div className="mystical-particles">
          <div className="particle"></div>
          <div className="particle"></div>
          <div className="particle"></div>
          <div className="particle"></div>
          <div className="particle"></div>
          <div className="particle"></div>
          <div className="particle"></div>
          <div className="particle"></div>
          <div className="particle"></div>
          <div className="particle"></div>
          <div className="particle"></div>
          <div className="particle"></div>
          <div className="particle"></div>
          <div className="particle"></div>
          <div className="particle"></div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          {/* Sacred symbol at the top */}
          <div className="text-center mb-8">
            <motion.div
              className="sacred-symbol mx-auto"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1.2 }}
            >
              <img src={sacredSymbol} alt="Sacred Symbol" className="w-16 h-16 mx-auto" />
            </motion.div>
          </div>
          
          {/* Animated runes */}
          <div className="text-center mb-6">
            <span className="ancient-rune" data-symbol="ᚨ">ᚨ</span>
            <span className="ancient-rune" data-symbol="ᚱ">ᚱ</span>
            <span className="ancient-rune" data-symbol="ᚲ">ᚲ</span>
            <span className="ancient-rune" data-symbol="ᛇ">ᛇ</span>
            <span className="ancient-rune" data-symbol="ᚹ">ᚹ</span>
          </div>
          
          {/* Intro text with animation */}
          <motion.div 
            className="text-center max-w-3xl mx-auto mb-16 md:mb-24"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.5, delay: 0.5 }}
          >
            <motion.h1 
              className="text-4xl md:text-5xl lg:text-6xl text-amber-100/90 font-light leading-tight mb-8"
              initial={{ y: 20 }}
              animate={{ y: 0 }}
              transition={{ duration: 0.8, delay: 1 }}
            >
              The Akashic Archive
            </motion.h1>
            
            <div className="space-y-4 text-lg md:text-xl text-amber-200/70 font-light">
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 1.3 }}
              >
                You stand at the threshold of the Archive.
              </motion.p>
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 1.8 }}
              >
                The Ark has been unearthed. Its memory is fractured — scattered across crystal tablets, forgotten scrolls, and sealed artifacts.
              </motion.p>
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 2.3 }}
              >
                Some of it is ready to be remembered. The rest… awaits you.
              </motion.p>
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 2.8 }}
                className="italic"
              >
                This is not a story. It is a simulation. And it has begun.
              </motion.p>
            </div>
          </motion.div>
          
          {/* Main Action Buttons */}
          <motion.div 
            className="flex flex-col md:flex-row gap-4 justify-center mb-16 max-w-xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 3.5 }}
          >
            <Button 
              className="bg-amber-700/80 hover:bg-amber-600/80 text-amber-50 text-lg py-6 shadow-lg shadow-amber-900/20 relative overflow-hidden group"
              onClick={() => setLocation('/ark/contents')}
            >
              <span className="relative z-10">Begin the Journey</span>
              <span className="absolute inset-0 bg-gradient-to-r from-amber-600/0 via-amber-600/20 to-amber-600/0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 transform -translate-x-full group-hover:translate-x-0 ease-out"></span>
            </Button>
            
            <Button 
              variant="outline" 
              className="border-amber-600/40 text-amber-100/80 hover:bg-amber-900/20 text-lg py-6"
              onClick={() => setLocation('/oracle')}
            >
              Ask the Oracle
            </Button>
          </motion.div>

          {/* Archive category navigation */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 justify-items-center max-w-6xl mx-auto">
            <ArchiveCard 
              title="Tablets" 
              icon={<Tablet className="h-5 w-5" />} 
              path="/ark/tablets" 
              image={tabletImage}
              delay={1.5}
              completionPercentage={25}
            />
            <ArchiveCard 
              title="Scrolls" 
              icon={<Scroll className="h-5 w-5" />} 
              path="/ark/scrolls" 
              image={scrollImage}
              delay={1.7}
              completionPercentage={10}
            />
            <ArchiveCard 
              title="Books" 
              icon={<Book className="h-5 w-5" />} 
              path="/ark/books" 
              image={bookImage}
              delay={1.9}
              isLocked={true}
            />
            <ArchiveCard 
              title="Artifacts" 
              icon={<Archive className="h-5 w-5" />} 
              path="/ark/artifacts" 
              image={artifactImage}
              delay={2.1}
              isLocked={true}
            />
          </div>
          
          {/* Memory progress indicator */}
          <MemoryProgress />
          
          {/* Achievements section */}
          <motion.div
            className="mt-16 md:mt-24 max-w-md mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 3.7, duration: 1 }}
          >
            <h3 className="text-center text-amber-100/70 text-sm tracking-widest mb-4">RECENT ACHIEVEMENTS</h3>
            
            <div className="space-y-3">
              <div className="achievement">
                <div className="flex justify-between">
                  <div className="text-amber-100/90">Crystal Seer</div>
                  <div className="text-amber-500/80 text-sm">5 XP</div>
                </div>
                <div className="text-amber-200/50 text-xs mt-1">Viewed the Crystal Tablet of Enki</div>
                <div className="achievement-progress">
                  <div className="achievement-progress-bar" style={{ width: '100%' }}></div>
                </div>
              </div>
              
              <div className="achievement achievement-locked">
                <div className="flex justify-between">
                  <div className="text-amber-100/90">Scroll Keeper</div>
                  <div className="text-amber-500/80 text-sm">15 XP</div>
                </div>
                <div className="text-amber-200/50 text-xs mt-1">Unlock 5 Ancient Scrolls</div>
                <div className="achievement-progress">
                  <div className="achievement-progress-bar" style={{ width: '40%' }}></div>
                </div>
              </div>
              
              <div className="achievement achievement-locked">
                <div className="flex justify-between">
                  <div className="text-amber-100/90">Arcane Decipherer</div>
                  <div className="text-amber-500/80 text-sm">25 XP</div>
                </div>
                <div className="text-amber-200/50 text-xs mt-1">Decode the Emerald Cypher</div>
                <div className="achievement-progress">
                  <div className="achievement-progress-bar" style={{ width: '0%' }}></div>
                </div>
              </div>
            </div>
          </motion.div>
          
          {/* Tier 1 Access CTA */}
          <motion.div 
            className="mt-12 md:mt-20 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 4, duration: 1 }}
          >
            <h3 className="text-amber-100/80 text-xl mb-3">What Will You Unlock?</h3>
            <Button 
              variant="link" 
              className="text-amber-500/80 hover:text-amber-400/90 text-base group flex items-center gap-2"
              onClick={() => setLocation('/initiate')}
            >
              <span className="transition-transform duration-500 group-hover:translate-x-1">Tier 1 Access Required for Sealed Content</span>
              <motion.span
                initial={{ x: 0 }}
                animate={{ x: [0, 5, 0] }}
                transition={{ repeat: Infinity, duration: 2, repeatDelay: 1 }}
              >→</motion.span>
            </Button>
          </motion.div>
        </div>
      </div>
    </>
  );
};

export default TestHomePage;