import { Scroll } from "@shared/schema";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogClose
} from "@/components/ui/dialog";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Link } from "wouter";

// Import scroll images directly
import welcomeScrollImage from "@assets/ChatGPT Image Apr 24, 2025, 06_04_06 PM.png";
import ancientCivilizationImage from "@assets/ChatGPT Image Apr 24, 2025, 07_12_38 PM.png";
import greatFloodImage from "@assets/ChatGPT Image Apr 24, 2025, 07_12_19 PM.png";
import crystalTabletImage from "@assets/ChatGPT Image Apr 24, 2025, 07_23_59 PM.png";
import pathImage from "@assets/ChatGPT Image Apr 27, 2025, 06_09_01 PM.png";

// Map image paths to imported assets
const imageMap: Record<string, string> = {
  "/assets/welcome_scroll.png": welcomeScrollImage,
  "/assets/ancient_civilization.png": ancientCivilizationImage,
  "/assets/great_flood.png": greatFloodImage,
  "/assets/crystal_tablet.png": crystalTabletImage,
  "/assets/flood_scroll.png": greatFloodImage,
  "/assets/ancient_tablet_dark.png": ancientCivilizationImage,
  "/assets/pillars_scroll.png": pathImage,
};

interface ScrollDialogProps {
  scroll: Scroll;
  isOpen: boolean;
  onClose: () => void;
}

export default function ScrollDialog({ scroll, isOpen, onClose }: ScrollDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-cinzel text-sacred-blue">{scroll.title}</DialogTitle>
          <DialogClose className="absolute right-4 top-4 text-sacred-gray hover:text-sacred-blue">
            <X className="h-5 w-5" />
          </DialogClose>
        </DialogHeader>
        
        <div className="py-4">
          <div className="w-full max-w-md mx-auto mb-6">
            <img 
              src={imageMap[scroll.image] || scroll.image}
              alt={scroll.title} 
              className="w-full h-auto rounded-lg shadow-md object-contain bg-gray-100 p-2"
            />
          </div>
          
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="font-playfair text-sacred-gray space-y-4"
          >
            {/* Show only first few paragraphs (preview mode) */}
            {scroll.content.split('\n\n').slice(0, 2).map((paragraph, idx) => (
              <p key={idx} className="leading-relaxed">
                {paragraph}
              </p>
            ))}
            
            {/* Show "read more" message */}
            <p className="text-sacred-blue italic mt-6 text-center">
              Continue reading the full scroll for more ancient wisdom...
            </p>
          </motion.div>
          
          <div className="mt-8 text-center text-sacred-blue/80 italic font-playfair text-sm">
            "This scroll contains ancient wisdom from the Fourth Cycle. Meditate on its contents to unlock deeper understanding."
          </div>
        </div>
        
        <div className="flex justify-center gap-4">
          <Button 
            variant="outline" 
            onClick={onClose}
            className="font-cinzel border-sacred-blue/30 text-sacred-blue hover:bg-sacred-blue hover:text-sacred-white"
          >
            Close Preview
          </Button>
          
          <Link to={`/scrolls/${scroll.id}`}>
            <Button 
              className="font-cinzel bg-sacred-blue text-sacred-white hover:bg-sacred-blue-light"
            >
              View Full Scroll
            </Button>
          </Link>
        </div>
      </DialogContent>
    </Dialog>
  );
}
