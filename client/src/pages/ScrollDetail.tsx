import { useState, useEffect } from "react";
import { useRoute, useLocation, Link } from "wouter";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { Scroll } from "@shared/schema";
import { Helmet } from "react-helmet";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

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

export default function ScrollDetail() {
  // Use wouter's useRoute hook to get the scroll ID from the URL
  const [match, params] = useRoute('/scrolls/:id');
  const scrollId = match ? parseInt(params.id, 10) : 0;
  const [, navigate] = useLocation();
  
  // Fetch the specific scroll by ID
  const { data: scrolls = [], isLoading } = useQuery<Scroll[]>({ 
    queryKey: ["/api/scrolls"]
  });
  
  const scroll = scrolls.find(s => s.id === scrollId);
  
  // If scroll doesn't exist or is locked, redirect
  useEffect(() => {
    if (!isLoading && (!scroll || scroll.isLocked)) {
      navigate("/scrolls");
    }
  }, [scroll, isLoading, navigate]);
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-pulse font-cinzel text-sacred-blue">
          <p>Retrieving ancient knowledge...</p>
        </div>
      </div>
    );
  }
  
  if (!scroll) {
    return null; // Will redirect via useEffect
  }
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen px-4 py-16 bg-sacred-white"
    >
      <Helmet>
        <title>{scroll.title} | The Akashic Archive</title>
        <meta 
          name="description" 
          content={`Read the ancient scroll of ${scroll.title} and discover its wisdom. Part of The Akashic Archive collection.`} 
        />
      </Helmet>
      
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <Link to="/scrolls">
            <Button variant="outline" className="flex items-center font-cinzel text-sacred-blue">
              <ChevronLeft className="mr-1 h-4 w-4" />
              Return to Ark Contents
            </Button>
          </Link>
        </div>
        
        <div className="bg-white rounded-lg shadow-lg p-8 border border-sacred-blue/10">
          <div className="text-center mb-10">
            <h1 className="text-3xl md:text-4xl font-cinzel font-bold text-sacred-blue mb-3">{scroll.title}</h1>
            <div className="w-32 h-1 bg-sacred-blue/20 mx-auto"></div>
          </div>
          
          <div className="flex flex-col md:flex-row gap-10">
            <div className="w-full md:w-1/3">
              <div className="sticky top-24">
                <img 
                  src={imageMap[scroll.image] || scroll.image}
                  alt={scroll.title} 
                  className="w-full h-auto rounded-lg shadow-md object-contain bg-gray-100 p-2 mb-6"
                />
                
                <div className="text-center text-sacred-blue/80 italic font-playfair text-sm border-t border-sacred-blue/10 pt-4 mt-4">
                  "This sacred text contains wisdom from the Fourth Cycle of the Akashic Records."
                </div>
              </div>
            </div>
            
            <div className="w-full md:w-2/3">
              <div className="prose prose-stone max-w-none font-playfair text-sacred-gray space-y-6">
                {scroll.content.split('\n\n').map((paragraph, idx) => (
                  <p key={idx} className="leading-relaxed">
                    {paragraph}
                  </p>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}