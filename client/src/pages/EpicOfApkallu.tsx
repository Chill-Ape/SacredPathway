import React, { useState } from 'react';
import { useLocation, Link } from "wouter";
import { ArrowLeft, Sparkles, Key, Unlock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { Helmet } from "react-helmet";

import apkalluScrollImage from '@assets/2249d467-9b21-4ed9-930f-5f8fd7bf6aab.png';

export default function EpicOfApkallu() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [keyInput, setKeyInput] = useState("");
  const [isLocked, setIsLocked] = useState(false);
  const [isKeyDialogOpen, setIsKeyDialogOpen] = useState(false);
  
  const correctKey = "APKALLU";

  const handleUnlock = () => {
    if (keyInput.trim().toUpperCase() === correctKey) {
      setIsLocked(false);
      setIsKeyDialogOpen(false);
      toast({
        title: "Scroll Unlocked",
        description: "The ancient knowledge is now accessible to you.",
        variant: "default",
      });
    } else {
      toast({
        title: "Incorrect Key",
        description: "The key you provided is not correct.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen py-12">
      <Helmet>
        <title>The Epic of the Apkallu | Akashic Archive</title>
        <meta name="description" content="Discover the ancient wisdom of the seven sages who brought civilization to humanity before the Great Flood." />
      </Helmet>
      
      {/* Main content container */}
      <div className="container mx-auto px-4">
        {/* Navigation */}
        <div className="mb-6">
          <Button 
            variant="ghost" 
            className="flex items-center text-amber-700 hover:text-amber-900 hover:bg-amber-50"
            onClick={() => setLocation('/ark-books')}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Books
          </Button>
        </div>
        
        {/* Title section */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl md:text-4xl font-serif text-amber-900 mb-3">The Epic of the Apkallu</h1>
          <p className="text-amber-700 max-w-2xl mx-auto">
            An ancient Mesopotamian text chronicling the seven sages who brought wisdom and civilization to humanity before the Great Flood.
          </p>
        </div>
        
        {/* Scroll image */}
        <div className="max-w-2xl mx-auto mb-8 relative">
          <img 
            src={apkalluScrollImage} 
            alt="The Epic of the Apkallu" 
            className="w-full rounded-lg shadow-lg"
          />
          
          {/* Locked overlay */}
          {isLocked && (
            <div className="absolute inset-0 bg-amber-950/50 backdrop-blur-sm flex flex-col items-center justify-center rounded-lg">
              <div className="bg-amber-900/80 p-6 rounded-lg text-center max-w-md">
                <Unlock className="w-12 h-12 text-amber-200 mx-auto mb-3" />
                <h3 className="text-xl text-amber-100 font-medium mb-2">This ancient text is sealed</h3>
                <p className="text-amber-200/80 mb-4">
                  Enter the correct key to unlock this sacred knowledge.
                </p>
                <Button 
                  onClick={() => setIsKeyDialogOpen(true)}
                  className="bg-amber-200 text-amber-900 hover:bg-amber-100"
                >
                  <Key className="mr-2 h-4 w-4" />
                  Enter Key
                </Button>
              </div>
            </div>
          )}
        </div>
        
        {/* Content - only visible when unlocked */}
        {!isLocked && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="prose prose-amber mx-auto max-w-3xl"
          >
            <div className="bg-amber-50 border border-amber-200 p-6 md:p-8 rounded-lg">
              <h2 className="text-2xl font-serif text-amber-900 mb-4">The Seven Sages of Ancient Mesopotamia</h2>
              
              <p className="mb-4">
                Before the waters of the Great Flood swept across the lands of ancient Mesopotamia, seven divine sages known as the Apkallu walked among humanity. Sent by the god Enki, these half-fish, half-human beings emerged from the subterranean waters to share divine wisdom with mankind.
              </p>
              
              <p className="mb-4">
                Each of the seven Apkallu served as an advisor to a pre-flood king, teaching humanity the fundamental arts of civilization: writing, mathematics, agriculture, medicine, astronomy, architecture, and mystical arts. Their knowledge was said to be comprehensive and perfect, for it came directly from the divine realm.
              </p>
              
              <h3 className="text-xl font-serif text-amber-800 mt-6 mb-3">The First Apkallu: Uanna</h3>
              <p className="mb-4">
                The first and greatest of the sages was Uanna, also known as Adapa in some traditions. He rose from the waters during the reign of King Alulim of Eridu and brought the fundamental knowledge of all arts and crafts. Uanna taught humanity writing and established the first libraries to preserve knowledge.
              </p>
              
              <h3 className="text-xl font-serif text-amber-800 mt-6 mb-3">The Sacred Tablets</h3>
              <p className="mb-4">
                The Apkallu recorded their wisdom on tablets of clay and precious metals, creating the first sacred texts. These tablets contained not only practical knowledge but also the divine secrets of creation and the nature of reality itself. According to legend, these original tablets were preserved from the flood and became the foundation of all subsequent human knowledge.
              </p>
              
              <h3 className="text-xl font-serif text-amber-800 mt-6 mb-3">The Warning and the Flood</h3>
              <p className="mb-4">
                As humanity's power grew through the knowledge of the Apkallu, so too did their capacity for transgression. The gods, seeing that humans had misused the divine wisdom, decided to cleanse the world with a great flood. It is said that the seventh Apkallu, Utuabzu, foreseeing the coming catastrophe, ascended to heaven without experiencing death, taking with him the most sacred knowledge.
              </p>
              
              <h3 className="text-xl font-serif text-amber-800 mt-6 mb-3">Legacy of the Apkallu</h3>
              <p className="mb-4">
                After the flood, the divine sages no longer walked among humans in their original form. Instead, they appeared in dreams and visions to select individuals, guiding the rebirth of civilization. Their knowledge, preserved in fragments, became the foundation of Mesopotamian magic, science, and religion.
              </p>
              
              <p className="mb-4">
                The priests of ancient Mesopotamia considered themselves heirs to the Apkallu tradition, performing rituals while wearing fish-cloaked garments to channel the wisdom of these ancient sages. The title "Apkallu" became an honorific bestowed upon the wisest scholars and most skilled exorcists.
              </p>
              
              <div className="mt-8 p-4 bg-amber-100 rounded-lg border border-amber-300">
                <h4 className="text-lg font-medium text-amber-900 flex items-center mb-2">
                  <Sparkles className="h-5 w-5 mr-2 text-amber-700" />
                  Sacred Insight
                </h4>
                <p className="text-amber-800 italic">
                  "The seven sages laid the foundation stones of the temple of knowledge. Though the waters may rise and fall, and civilizations may crumble into dust, the cosmic wisdom they imparted remains eternal, preserved in the Akashic records for those with eyes to see and ears to hear."
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </div>
      
      {/* Key input dialog */}
      <Dialog open={isKeyDialogOpen} onOpenChange={setIsKeyDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Enter the Sacred Key</DialogTitle>
            <DialogDescription>
              Provide the correct key to unlock this ancient text.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Input
              placeholder="Enter key here..."
              value={keyInput}
              onChange={(e) => setKeyInput(e.target.value)}
              className="text-center uppercase"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsKeyDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUnlock}>
              Unlock
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}