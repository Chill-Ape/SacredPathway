import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Sparkles, Book, Scroll, PenTool, BrainCircuit } from 'lucide-react';
import { Link } from 'wouter';

interface WelcomeModalProps {
  isOpen: boolean;
  onClose: () => void;
  username: string;
}

const WelcomeModal: React.FC<WelcomeModalProps> = ({ isOpen, onClose, username }) => {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md md:max-w-lg lg:max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Close button - more prominent for mobile */}
        <div className="absolute top-3 right-3 z-50">
          <Button
            variant="secondary"
            size="icon"
            className="h-8 w-8 rounded-full bg-gray-800/90 text-white hover:bg-gray-700 shadow-md border border-gray-600"
            onClick={onClose}
            aria-label="Close modal"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6L6 18"></path>
              <path d="M6 6L18 18"></path>
            </svg>
          </Button>
        </div>
        
        {/* Mobile-only close banner */}
        <div className="block sm:hidden sticky top-0 bg-red-500 text-white py-1 px-3 text-center text-xs font-semibold rounded mb-2">
          Tap the X button in the corner to close this window
        </div>
        
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center flex items-center justify-center gap-2">
            <Sparkles className="h-6 w-6 text-yellow-500" />
            Welcome to The Akashic Archive, {username}!
          </DialogTitle>
          <DialogDescription className="text-center pt-2">
            Your journey into ancient knowledge begins now.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 my-2">
          {/* Mana Bonus Section */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4 border border-blue-200">
            <h3 className="text-lg font-medium text-blue-800 flex items-center">
              <Sparkles className="h-5 w-5 mr-2 text-yellow-500" />
              You've received 50 Mana as a welcome gift!
            </h3>
            <p className="mt-1 text-sm text-blue-700">
              Mana is your energy in the Akashic Archive. Use it to unlock scrolls, 
              interact with the Oracle, and access sacred knowledge.
            </p>
          </div>
          
          {/* Ways to Use Mana */}
          <div className="rounded-lg p-4 border">
            <h3 className="text-lg font-medium mb-3">Ways to Use Your Mana:</h3>
            <div className="space-y-2">
              <div className="flex items-start gap-3">
                <Scroll className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <p className="font-medium">Unlock Ancient Scrolls</p>
                  <p className="text-sm text-gray-600">Spend Mana to access locked scrolls containing forgotten wisdom.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <PenTool className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <p className="font-medium">Consult the Oracle</p>
                  <p className="text-sm text-gray-600">Seek wisdom and answers from the mystical Oracle.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Book className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <p className="font-medium">Unlock Premium Content</p>
                  <p className="text-sm text-gray-600">Access deeper levels of knowledge with your Mana.</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* How to Earn More Mana */}
          <div className="rounded-lg p-4 border bg-amber-50 border-amber-200">
            <h3 className="text-lg font-medium mb-3 text-amber-800">How to Earn More Mana:</h3>
            <div className="flex items-start gap-3">
              <BrainCircuit className="h-5 w-5 text-amber-600 mt-0.5" />
              <div>
                <p className="font-medium">Demonstrate Your Knowledge</p>
                <p className="text-sm text-amber-700">Tell the Oracle <span className="font-medium">"I am ready to be tested"</span> and answer questions about ancient wisdom to earn more Mana.</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Additional close button for mobile - very prominent at bottom */}
        <div className="mt-4 mb-2 block sm:hidden">
          <Button 
            className="w-full bg-red-600 hover:bg-red-700 text-white"
            onClick={onClose}
            size="lg"
          >
            Close This Window
          </Button>
        </div>
        
        <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:gap-0">
          <Link to="/oracle" className="w-full sm:w-auto">
            <Button 
              variant="outline" 
              className="w-full sm:w-auto"
              onClick={onClose}
            >
              <PenTool className="mr-2 h-4 w-4" />
              Ask the Oracle
            </Button>
          </Link>
          <Button 
            className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            onClick={onClose}
          >
            <Sparkles className="mr-2 h-4 w-4" />
            Begin My Journey
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default WelcomeModal;