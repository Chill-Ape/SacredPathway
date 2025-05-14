import React, { useState, useEffect } from 'react';
import { useParams, useLocation } from 'wouter';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet';
import { ArrowLeft, KeyRound } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import tabletsData from '@/data/tablets.json';
import '@/styles/tabletDetail.css';

export default function TabletDetail() {
  const [, setLocation] = useLocation();
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { toast } = useToast();
  const [tablet, setTablet] = useState<any | null>(null);
  const [keyInput, setKeyInput] = useState('');
  const [isUnlocking, setIsUnlocking] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState(false);
  
  useEffect(() => {
    // Find the tablet in our static data
    const foundTablet = tabletsData.find(item => item.id === id);
    if (foundTablet) {
      setTablet(foundTablet);
      // Check if this tablet is already unlocked for the user
      // For now, we'll use local storage as a simple way to track this
      const unlockedItems = JSON.parse(localStorage.getItem('unlockedItems') || '[]');
      setIsUnlocked(unlockedItems.includes(id));
    } else {
      // Tablet not found
      toast({
        title: 'Tablet Not Found',
        description: 'The requested tablet could not be located in the archives.',
        variant: 'destructive',
      });
      setLocation('/ark/tablets');
    }
  }, [id, setLocation, toast]);

  const handleUnlock = () => {
    setIsUnlocking(true);
    
    // Simulate API call
    setTimeout(() => {
      if (keyInput.toUpperCase() === tablet?.key) {
        // Unlock successful
        setIsUnlocked(true);
        
        // Save unlocked state in local storage
        const unlockedItems = JSON.parse(localStorage.getItem('unlockedItems') || '[]');
        if (!unlockedItems.includes(id)) {
          unlockedItems.push(id);
          localStorage.setItem('unlockedItems', JSON.stringify(unlockedItems));
        }
        
        toast({
          title: 'Tablet Unlocked',
          description: 'You have successfully unlocked this ancient knowledge.',
        });
      } else {
        // Incorrect key
        toast({
          title: 'Incorrect Key',
          description: 'The key you provided does not resonate with this tablet.',
          variant: 'destructive',
        });
      }
      setIsUnlocking(false);
      setKeyInput('');
    }, 1500);
  };

  if (!tablet) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="animate-pulse text-amber-700 font-serif">
          Searching the archives...
        </div>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen pt-16 pb-20 crystal-tablet-background"
      style={{ 
        backgroundColor: tablet.backgroundColor || '#0c0c0e',
        fontFamily: tablet.fontFamily || 'Cormorant Garamond, serif',
        color: '#d4be98'
      }}
    >
      <Helmet>
        <title>{tablet.title} | The Akashic Archive</title>
        <meta name="description" content={tablet.description} />
        {/* Add Cormorant Garamond font for this page */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400&display=swap" rel="stylesheet" />
      </Helmet>

      {/* Back button */}
      <div className="container mx-auto px-4 py-6">
        <Button 
          variant="ghost" 
          onClick={() => setLocation('/ark/tablets')}
          className="text-amber-500 hover:text-amber-300 hover:bg-transparent/10 mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Tablets
        </Button>
      </div>

      {!isUnlocked ? (
        <div className="container mx-auto px-4 flex flex-col items-center justify-center" style={{ minHeight: 'calc(100vh - 200px)' }}>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="bg-amber-950/30 backdrop-blur-sm p-8 rounded-lg border border-amber-700/30 max-w-xl w-full text-center"
          >
            <motion.div
              animate={{ opacity: [0.7, 1, 0.7] }}
              transition={{ repeat: Infinity, duration: 3 }}
            >
              <div className="text-2xl mb-2 text-amber-500">{tablet.title}</div>
              <div className="text-lg mb-6 text-amber-400/80">{tablet.subtitle}</div>
            </motion.div>

            <div className="relative my-8">
              <div className="flex justify-center">
                <img
                  src={tablet.image || "/assets/ancient_tablet_dark.png"}
                  alt={tablet.title}
                  className="max-w-[200px] h-auto object-contain opacity-70"
                />
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <KeyRound className="text-amber-500/50 w-12 h-12" />
              </div>
            </div>

            <p className="mb-8 text-amber-300/80">
              This ancient tablet is locked. Enter the correct key phrase to unlock its wisdom.
            </p>

            <div className="flex space-x-3">
              <Input
                type="text"
                placeholder="Enter the key phrase..."
                value={keyInput}
                onChange={(e) => setKeyInput(e.target.value)}
                className="bg-amber-950/50 border-amber-700/50 text-amber-200 placeholder:text-amber-600/50"
              />
              <Button
                onClick={handleUnlock}
                disabled={isUnlocking || !keyInput.trim()}
                className="bg-amber-700 hover:bg-amber-600 text-amber-100"
              >
                {isUnlocking ? 'Unlocking...' : 'Unlock'}
              </Button>
            </div>
          </motion.div>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
          className="container mx-auto px-4 md:px-8 max-w-4xl"
        >
          {/* Tablet header */}
          <div className="text-center mb-12 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-20 pointer-events-none">
              <motion.div
                className="absolute inset-0 bg-gradient-to-b from-amber-700/5 to-transparent"
                animate={{ 
                  opacity: [0.3, 0.7, 0.3],
                  backgroundPosition: ['0% 0%', '100% 100%', '0% 0%']
                }}
                transition={{ 
                  repeat: Infinity, 
                  duration: 10, 
                  ease: "linear" 
                }}
              />
            </div>
            
            {/* Sacred glyph/sigil */}
            <motion.div 
              className="flex justify-center mb-4 glyph-flicker"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1.5 }}
            >
              <span className="text-3xl text-amber-500/70">🜂</span>
            </motion.div>

            <motion.h1 
              className="text-4xl md:text-5xl mb-3 text-amber-300 font-medium tracking-wide"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8 }}
            >
              {tablet.title}
            </motion.h1>

            <motion.div
              initial={{ width: 0 }}
              animate={{ width: '120px' }}
              transition={{ duration: 1.2, delay: 0.3 }}
              className="h-[1px] bg-gradient-to-r from-transparent via-amber-500/60 to-transparent mx-auto mb-3"
            />

            <motion.h2 
              className="text-xl md:text-2xl text-amber-300/70 font-light tracking-wider"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              {tablet.subtitle}
            </motion.h2>
          </div>

          {/* Tablet content */}
          <div className="space-y-12 relative">
            {/* Add glowing edges effect */}
            <div className="absolute -left-4 top-0 bottom-0 w-[1px] bg-gradient-to-b from-transparent via-amber-600/20 to-transparent" />
            <div className="absolute -right-4 top-0 bottom-0 w-[1px] bg-gradient-to-b from-transparent via-amber-600/20 to-transparent" />

            {tablet.sections.map((section: {heading: string, content: string}, index: number) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 + (index * 0.1) }}
                className="relative crystal-tablet-glow"
              >
                <h3 className="text-2xl md:text-3xl text-amber-400 mb-4 font-medium">
                  {section.heading}
                </h3>
                <p className="text-lg md:text-xl leading-relaxed text-amber-200/90">
                  {section.content}
                </p>
                {index < tablet.sections.length - 1 && (
                  <div className="mt-8 h-[1px] bg-gradient-to-r from-transparent via-amber-700/30 to-transparent" />
                )}
              </motion.div>
            ))}
          </div>

          {/* Back to top button */}
          <div className="flex justify-center mt-16">
            <Button
              variant="outline"
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="border-amber-700/30 text-amber-500 hover:text-amber-300 hover:bg-amber-950/30"
            >
              Return to Top
            </Button>
          </div>
        </motion.div>
      )}
    </div>
  );
}