import { Scroll } from "@shared/schema";
import { motion } from "framer-motion";
import { useState } from "react";
import { Lock, Unlock } from "lucide-react";
import { Button } from "@/components/ui/button";
import ScrollDialog from "@/components/scrolls/ScrollDialog";

interface ScrollCardProps {
  scroll: Scroll;
  onUnlock?: (scrollId: number, key: string) => Promise<boolean>;
}

export default function ScrollCard({ scroll, onUnlock }: ScrollCardProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isUnlocking, setIsUnlocking] = useState(false);
  const [unlockAttempted, setUnlockAttempted] = useState(false);
  const [unlockKey, setUnlockKey] = useState("");
  
  const handleReadScroll = () => {
    setIsDialogOpen(true);
  };
  
  const handleUnlockAttempt = async () => {
    if (!onUnlock || !unlockKey.trim()) return;
    
    setIsUnlocking(true);
    const success = await onUnlock(scroll.id, unlockKey);
    setIsUnlocking(false);
    setUnlockAttempted(true);
    
    if (success) {
      setIsDialogOpen(true);
    }
  };

  return (
    <>
      <motion.div 
        className="bg-sacred-white rounded-lg overflow-hidden shadow-md border border-sacred-blue/10 hover:shadow-lg transition-all duration-300"
        whileHover={{ y: -5 }}
        layout
      >
        <img 
          src={scroll.image} 
          alt={scroll.title} 
          className={`w-full h-52 object-cover ${scroll.isLocked ? 'filter grayscale' : ''}`}
        />
        <div className="p-5">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-cinzel text-sacred-blue text-xl">{scroll.title}</h3>
            <span 
              className={`text-sm font-medium flex items-center ${
                scroll.isLocked ? 'text-sacred-lock' : 'text-sacred-unlock'
              }`}
            >
              {scroll.isLocked ? (
                <>
                  <Lock className="mr-1 h-4 w-4" /> Locked
                </>
              ) : (
                <>
                  <Unlock className="mr-1 h-4 w-4" /> Accessible
                </>
              )}
            </span>
          </div>
          
          <p className="font-raleway text-sacred-gray mb-4">
            {scroll.content.substring(0, 100)}...
          </p>
          
          {scroll.isLocked ? (
            <>
              {!unlockAttempted ? (
                <div className="space-y-2">
                  <input
                    type="text"
                    value={unlockKey}
                    onChange={(e) => setUnlockKey(e.target.value)}
                    placeholder="Enter key to unlock"
                    className="w-full p-2 text-sm border border-sacred-blue/20 rounded"
                  />
                  <Button
                    className="w-full bg-sacred-blue hover:bg-sacred-blue-light text-sacred-white font-cinzel tracking-wide py-2 rounded transition-colors duration-300"
                    onClick={handleUnlockAttempt}
                    disabled={isUnlocking}
                  >
                    {isUnlocking ? "Attempting to unlock..." : "Unlock Scroll"}
                  </Button>
                </div>
              ) : (
                <Button
                  className="w-full bg-sacred-gray/50 cursor-not-allowed text-sacred-white font-cinzel tracking-wide py-2 rounded transition-colors duration-300"
                  disabled
                >
                  Requires Oracle Insight
                </Button>
              )}
            </>
          ) : (
            <Button
              className="w-full bg-sacred-blue hover:bg-sacred-blue-light text-sacred-white font-cinzel tracking-wide py-2 rounded transition-colors duration-300"
              onClick={handleReadScroll}
            >
              Read Scroll
            </Button>
          )}
        </div>
      </motion.div>
      
      {!scroll.isLocked && (
        <ScrollDialog 
          scroll={scroll} 
          isOpen={isDialogOpen} 
          onClose={() => setIsDialogOpen(false)} 
        />
      )}
    </>
  );
}
