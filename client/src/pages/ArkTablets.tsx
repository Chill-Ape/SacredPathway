import { useEffect, useState } from "react";
import { useLocation, Link } from "wouter";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { ArrowLeft, Lock, Eye, KeyRound } from "lucide-react";
import { Helmet } from "react-helmet";
import { Scroll } from "@shared/schema";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

// Import tablet images directly using Vite's asset handling via @assets alias
import clayTabletImage from '@assets/IMG_8635.jpg';  
import emeraldTabletImage from '@assets/ChatGPT Image May 8, 2025, 08_50_12 PM.png';
import crystalTabletImage from '@assets/bb62b636-4bad-4fb7-9e5a-d44b96a91dab.png';

// Simple component for a tablet item card
const TabletCard = ({ 
  title, 
  description,
  imagePath,
  isLocked,
  onClick 
}: { 
  title: string; 
  description: string;
  imagePath: string;
  isLocked: boolean;
  onClick: () => void;
}) => {
  return (
    <motion.div
      whileHover={{ 
        scale: 1.03,
        boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)"
      }}
      transition={{ duration: 0.3 }}
      className="cursor-pointer"
      onClick={onClick}
    >
      <Card className="h-full border-amber-200 bg-amber-50/90 overflow-hidden">
        <div className="aspect-video relative overflow-hidden">
          <img
            src={imagePath}
            alt={title}
            className="object-cover w-full h-full transition-transform duration-500 hover:scale-110"
            onError={(e) => {
              console.error("Image failed to load:", imagePath);
              e.currentTarget.src = 'https://placehold.co/600x400/e2e8f0/1e293b?text=Tablet+Image';
            }}
          />
          {isLocked && (
            <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
              <Lock className="h-12 w-12 text-white opacity-90" />
            </div>
          )}
        </div>
        <CardContent className="p-4">
          <h3 className="text-lg font-serif text-amber-900 font-semibold mb-2">{title}</h3>
          <p className="text-amber-700/80 text-sm font-serif">{description}</p>
        </CardContent>
        <CardFooter className="p-4 pt-0 flex justify-between">
          {isLocked ? (
            <Button 
              variant="default"
              size="sm"
              className="w-full bg-amber-700/80 text-white hover:bg-amber-800"
            >
              <KeyRound className="h-4 w-4 mr-2" />
              <span>Unlock</span>
            </Button>
          ) : (
            <Button 
              variant="default"
              size="sm"
              className="w-full bg-amber-700/80 text-white hover:bg-amber-800"
            >
              <Eye className="h-4 w-4 mr-2" />
              <span>Read</span>
            </Button>
          )}
        </CardFooter>
      </Card>
    </motion.div>
  );
};

export default function ArkTablets() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  
  // Custom items specific to tablets
  const tablets = [
    {
      id: "crystal-tablet-of-enki",
      title: "🜂 The Crystal Tablet of Enki",
      description: "A transparent crystalline tablet containing vibration-encoded data from the antediluvian era.",
      isLocked: true,
      key: "ENKI",
      image: crystalTabletImage
    },
    {
      id: "emerald-tablet-1",
      title: "Emerald Tablet of the 3rd Sage (Part 1)",
      description: "First fragment of the fabled emerald tablet, containing alchemical wisdom.",
      isLocked: true,
      key: "HERMES",
      image: emeraldTabletImage
    },
    {
      id: "clay-tablet-of-adam",
      title: "Clay Tablet of Adam",
      description: "Ancient tablet detailing the origin of consciousness in humanity.",
      isLocked: true,
      key: "GENESIS",
      image: clayTabletImage
    }
  ];

  // Get database items 
  const { isLoading, data: scrollsData } = useQuery<Scroll[]>({
    queryKey: ["/api/scrolls"],
    refetchOnWindowFocus: false
  });

  // Filter to tablets from the server data
  const dbTablets = scrollsData?.filter(scroll => scroll.contentType === "tablet") || [];
  
  // State for the currently selected tablet
  const [selectedTablet, setSelectedTablet] = useState<string | null>(null);
  const [keyAttempt, setKeyAttempt] = useState("");
  
  // Handler for tablet selection
  const handleTabletClick = (tabletId: string) => {
    console.log("Selected tablet:", tabletId);
    
    // For the Crystal Tablet of Enki, navigate to the dedicated tablet detail page
    if (tabletId === "crystal-tablet-of-enki") {
      setLocation(`/ark/tablets/${tabletId}`);
      return;
    }
    
    // For other tablets, show the modal view
    setSelectedTablet(tabletId);
  };
  
  // Handler for the back button
  const handleBack = () => {
    setSelectedTablet(null);
  };
  
  // Get the selected tablet data
  const getSelectedTabletData = () => {
    const staticTablet = tablets.find(t => t.id === selectedTablet);
    if (staticTablet) return staticTablet;
    
    const dbTablet = dbTablets.find(t => t.id.toString() === selectedTablet);
    if (dbTablet) {
      return {
        id: dbTablet.id.toString(),
        title: dbTablet.title,
        description: dbTablet.description || "",
        isLocked: !dbTablet.isUnlocked,
        key: dbTablet.unlockKey || "UNKNOWN",
        image: dbTablet.image || "/assets/sacred_geometry_2.svg"
      };
    }
    
    return null;
  };
  
  // Selected tablet data
  const selectedTabletData = getSelectedTabletData();
  
  if (isLoading) {
    return (
      <div className="container mx-auto py-12 flex justify-center items-center">
        <Loader2 className="h-8 w-8 animate-spin text-amber-700" />
      </div>
    );
  }
  
  return (
    <div className="container mx-auto py-12">
      <Helmet>
        <title>Ancient Tablets | Akashic Archive</title>
        <meta name="description" content="Explore ancient clay and crystal tablets containing encoded knowledge from prehistoric civilizations in the Akashic Archive." />
      </Helmet>
      
      {selectedTablet === null ? (
        <>
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-serif text-amber-900 mb-4">Ancient Tablets</h1>
            <p className="text-amber-700/80 font-serif max-w-2xl mx-auto">
              Stone and crystal tablets containing encoded knowledge from prehistoric civilizations. 
              These artifacts preserved vital information through countless millennia.
            </p>
          </div>
          
          {/* Static Tablets */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {tablets.map((tablet) => (
              <TabletCard
                key={tablet.id}
                title={tablet.title}
                description={tablet.description}
                imagePath={tablet.image}
                isLocked={tablet.isLocked}
                onClick={() => handleTabletClick(tablet.id)}
              />
            ))}
          </div>
          
          {/* Database Tablets */}
          {dbTablets.length > 0 && (
            <>
              <h2 className="text-2xl font-serif text-amber-900 mb-4 mt-8 text-center">Additional Tablets</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {dbTablets.map((tablet) => (
                  <TabletCard
                    key={tablet.id}
                    title={tablet.title}
                    description={tablet.description || ""}
                    imagePath={tablet.image || "/assets/sacred_geometry_2.svg"}
                    isLocked={!tablet.isUnlocked}
                    onClick={() => handleTabletClick(tablet.id.toString())}
                  />
                ))}
              </div>
            </>
          )}
        </>
      ) : (
        // Detailed view for a selected tablet
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <Button
              variant="ghost"
              className="text-amber-700 hover:text-amber-900 hover:bg-amber-100"
              onClick={handleBack}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Tablets
            </Button>
          </div>
          
          {selectedTabletData && (
            <div className="bg-sacred-white p-6 rounded-lg shadow-md">
              <div className="aspect-video mb-6 relative overflow-hidden rounded-md">
                <img
                  src={selectedTabletData.image}
                  alt={selectedTabletData.title}
                  className="object-cover w-full h-full"
                  onError={(e) => {
                    console.error("Image failed to load:", selectedTabletData.image);
                    e.currentTarget.src = 'https://placehold.co/600x400/e2e8f0/1e293b?text=Tablet+Image';
                  }}
                />
                {selectedTabletData.isLocked && (
                  <div className="absolute inset-0 bg-black bg-opacity-40 flex flex-col items-center justify-center">
                    <Lock className="h-16 w-16 text-white opacity-90 mb-4" />
                    <span className="text-white text-lg font-serif">This tablet requires a key to unlock</span>
                  </div>
                )}
              </div>
              
              <h1 className="text-2xl font-serif text-amber-900 mb-4">{selectedTabletData.title}</h1>
              
              <div className="prose prose-amber max-w-none font-serif mb-6">
                <p className="text-amber-700">{selectedTabletData.description}</p>
                
                {!selectedTabletData.isLocked && (
                  <div className="mt-6 p-6 bg-amber-50 rounded-md border border-amber-200">
                    <p className="text-amber-800">
                      [Tablet content would be displayed here when unlocked]
                    </p>
                  </div>
                )}
              </div>
              
              {selectedTabletData.isLocked && (
                <div className="mt-6 p-6 bg-amber-50 rounded-md border border-amber-200">
                  <h3 className="text-lg font-serif text-amber-900 mb-4">Unlock this Tablet</h3>
                  
                  {user ? (
                    <div className="space-y-4">
                      <p className="text-amber-700">Enter the key phrase to access this ancient knowledge:</p>
                      
                      <div className="flex items-center space-x-2">
                        <input
                          type="text"
                          value={keyAttempt}
                          onChange={(e) => setKeyAttempt(e.target.value)}
                          placeholder="Enter key phrase..."
                          className="flex-1 border border-amber-300 rounded p-2 bg-amber-50/50 text-amber-900 placeholder:text-amber-400"
                        />
                        <Button 
                          variant="default"
                          className="bg-amber-700 hover:bg-amber-800 text-white"
                        >
                          <KeyRound className="mr-2 h-4 w-4" />
                          Unlock
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center">
                      <p className="text-amber-700 mb-4">You must be logged in to unlock this tablet.</p>
                      <Button 
                        variant="default"
                        className="bg-amber-700 hover:bg-amber-800 text-white"
                        onClick={() => setLocation("/auth")}
                      >
                        Log In or Register
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}