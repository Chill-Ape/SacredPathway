import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Book, Scroll, Tablet, Archive } from 'lucide-react';
import { Helmet } from 'react-helmet';

// Import assets
import tabletImage from '../assets/crystal_tablet.png';
import scrollImage from '../assets/scroll_1.jpg';
import bookImage from '../assets/book_1.png';
import artifactImage from '../assets/artifact_1.png';
import sacredSymbol from '../assets/sacred_symbol.png';

// Category card for the archive sections
const ArchiveCard = ({ 
  title, 
  icon, 
  path, 
  image,
  delay 
}: { 
  title: string; 
  icon: React.ReactNode; 
  path: string; 
  image: string;
  delay: number;
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
        className="group h-64 w-full md:h-80 md:w-56 lg:h-96 lg:w-64 perspective-1000 cursor-pointer"
        onClick={() => setLocation(path)}
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
            
            <motion.div 
              className="mt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <Button 
                variant="outline" 
                className="border-amber-600/40 text-amber-100/80 hover:bg-amber-900/20"
              >
                Access
              </Button>
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
      className="mt-16 md:mt-24 text-center opacity-70"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 3, duration: 1.2 }}
    >
      <h4 className="text-amber-100/70 text-sm tracking-widest mb-2">MEMORY FRAGMENTS RECOVERED</h4>
      <div className="w-full max-w-xs mx-auto h-2 bg-slate-800/60 rounded-full overflow-hidden">
        <motion.div 
          className="h-full bg-amber-500/60 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ delay: 3.2, duration: 1, ease: "easeOut" }}
        />
      </div>
      <p className="mt-1 text-xs text-amber-200/60">{progress}%</p>
    </motion.div>
  );
};

const TestHomePage = () => {
  const [isIntroOpen, setIsIntroOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [, setLocation] = useLocation();
  
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

  return (
    <>
      <Helmet>
        <title>Akashic Archive | Sacred Gateway to Ancient Knowledge</title>
        <meta name="description" content="Enter the Akashic Archive - an interactive digital simulation of antediluvian wisdom stored in the Ark. Explore tablets, scrolls, artifacts and unlock forgotten knowledge." />
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
      <Dialog open={isIntroOpen} onOpenChange={setIsIntroOpen}>
        <DialogContent className="sm:max-w-md border-amber-900/50 bg-slate-900/90 backdrop-blur-md">
          <DialogHeader>
            <DialogTitle className="text-amber-100 text-xl">The Ark Awaits</DialogTitle>
            <DialogDescription className="text-amber-200/70">
              Welcome to the Akashic Archive - a digital relic simulation of the Ark.
            </DialogDescription>
          </DialogHeader>
          
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
        <div className="container mx-auto px-4">
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
          
          {/* Archive category navigation */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 justify-items-center max-w-6xl mx-auto">
            <ArchiveCard 
              title="Tablets" 
              icon={<Tablet className="h-5 w-5" />} 
              path="/ark/tablets" 
              image={tabletImage}
              delay={1.5}
            />
            <ArchiveCard 
              title="Scrolls" 
              icon={<Scroll className="h-5 w-5" />} 
              path="/ark/scrolls" 
              image={scrollImage}
              delay={1.7}
            />
            <ArchiveCard 
              title="Books" 
              icon={<Book className="h-5 w-5" />} 
              path="/ark/books" 
              image={bookImage}
              delay={1.9}
            />
            <ArchiveCard 
              title="Artifacts" 
              icon={<Archive className="h-5 w-5" />} 
              path="/ark/artifacts" 
              image={artifactImage}
              delay={2.1}
            />
          </div>
          
          {/* Memory progress indicator */}
          <MemoryProgress />
          
          {/* Tier 1 Access CTA */}
          <motion.div 
            className="mt-12 md:mt-20 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 4, duration: 1 }}
          >
            <Button 
              variant="link" 
              className="text-amber-500/60 hover:text-amber-400/80 text-sm"
              onClick={() => setLocation('/initiate')}
            >
              Tier 1 Access Required for Sealed Content
            </Button>
          </motion.div>
        </div>
      </div>
    </>
  );
};

export default TestHomePage;