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
              src={scroll.image} 
              alt={scroll.title} 
              className="w-full h-auto rounded-lg shadow-md"
            />
          </div>
          
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="font-playfair text-sacred-gray space-y-4"
          >
            {scroll.content.split('\n').map((paragraph, idx) => (
              <p key={idx} className="leading-relaxed">
                {paragraph}
              </p>
            ))}
          </motion.div>
          
          <div className="mt-8 text-center text-sacred-blue/80 italic font-playfair text-sm">
            "This scroll contains ancient wisdom from the Fourth Cycle. Meditate on its contents to unlock deeper understanding."
          </div>
        </div>
        
        <div className="flex justify-center">
          <Button 
            variant="outline" 
            onClick={onClose}
            className="font-cinzel border-sacred-blue/30 text-sacred-blue hover:bg-sacred-blue hover:text-sacred-white"
          >
            Close Scroll
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
