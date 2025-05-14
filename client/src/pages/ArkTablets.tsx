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
        transition: { duration: 0.2 }
      }}
      className="h-full"
    >
      <Card 
        className="cursor-pointer h-full bg-amber-50 border border-amber-200 shadow-md overflow-hidden relative group"
        onClick={onClick}
      >
        {/* Golden glow on hover */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none bg-gradient-to-r from-amber-100/20 via-amber-100/30 to-amber-100/20"></div>
        
        {/* Image container */}
        <div className="overflow-hidden aspect-[4/3] relative">
          <img 
            src={imagePath} 
            alt={title}
            className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
            onError={(e) => {
              // Use a try-catch to prevent any errors during fallback handling
              try {
                console.error("Image failed to load:", imagePath);
                // Ensure we use a fallback image that definitely exists
                e.currentTarget.src = "/assets/sacred_geometry.svg"; 
                console.log("Setting fallback image for:", title);
              } catch (err) {
                console.error("Error setting fallback image:", err);
              }
            }}
          />
          
          {/* Locked overlay */}
          {isLocked && (
            <div className="absolute inset-0 bg-amber-950/50 flex items-center justify-center">
              <div className="w-12 h-12 rounded-full bg-amber-900/60 flex items-center justify-center">
                <Lock className="w-5 h-5 text-amber-100" />
              </div>
            </div>
          )}
        </div>
        
        {/* Content */}
        <CardContent className="p-4">
          <h3 className="text-xl font-serif text-amber-800 mb-2 tracking-wide group-hover:text-amber-900 transition-colors">{title}</h3>
          <p className="text-amber-700/80 text-sm font-serif line-clamp-2">
            {description}
          </p>
        </CardContent>
        
        <CardFooter className="px-4 pb-4 pt-0 flex justify-between items-center">
          <div className="text-xs text-amber-600/80 font-serif italic">
            {isLocked ? 'Locked' : 'Accessible'}
          </div>
          <Button variant="ghost" size="sm" className="text-amber-700 hover:text-amber-800 hover:bg-amber-100 p-0 w-8 h-8">
            {isLocked ? 
              <KeyRound className="w-4 h-4" /> : 
              <Eye className="w-4 h-4" />
            }
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
};

// Main component for tablets page
export default function ArkTablets() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  
  // Custom items specific to tablets
  const tablets = [
    {
      id: "crystal-tablet-of-enki",
      title: "Crystal Tablet of Enki",
      description: "A transparent crystalline tablet containing vibration-encoded data from the antediluvian era.",
      isLocked: true,
      key: "ENKI",
      image: "/assets/crystal_tablet.png"
    },
    {
      id: "emerald-tablet-1",
      title: "Emerald Tablet of the 3rd Sage (Part 1)",
      description: "First fragment of the fabled emerald tablet, containing alchemical wisdom.",
      isLocked: true,
      key: "HERMES",
      image: "/assets/clay_tablet_3.png"
    },
    {
      id: "clay-tablet-of-adam",
      title: "Clay Tablet of Adam",
      description: "Ancient tablet detailing the origin of consciousness in humanity.",
      isLocked: true,
      key: "GENESIS",
      image: "/assets/clay_tablet_1.png"
    }
  ];

  // Get database items 
  const { isLoading, data: scrollsData } = useQuery<Scroll[]>({
    queryKey: ["/api/scrolls"],
    staleTime: 60000,
  });

  // Get user's unlocked scrolls
  const { data: userScrolls } = useQuery<Scroll[]>({
    queryKey: ["/api/user/scrolls"],
    staleTime: 60000,
    enabled: !!user,
  });

  // Filtered items from database
  const [dbItems, setDbItems] = useState<Scroll[]>([]);

  // Process DB items
  useEffect(() => {
    if (scrollsData) {
      // Filter scrolls by "tablet" type
      const filteredItems = scrollsData
        .filter(scroll => {
          const scrollType = scroll.type || 'scroll';
          return scrollType === 'tablet';
        });
      setDbItems(filteredItems);
    }
  }, [scrollsData]);

  return (
    <div className="container mx-auto px-4 py-8">
      <Helmet>
        <title>Ancient Tablets | Akashic Archive</title>
        <meta name="description" content="Explore stone and crystal tablets containing encoded knowledge from prehistoric civilizations." />
      </Helmet>
      
      {/* Header with back button */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <div className="flex items-center mb-2">
            <Button 
              variant="ghost" 
              size="sm" 
              className="mr-2 text-amber-700 hover:text-amber-900 hover:bg-amber-100/50 -ml-2"
              onClick={() => setLocation('/ark-contents')}
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back
            </Button>
            <h1 className="text-3xl font-serif font-medium text-amber-900">Tablets</h1>
          </div>
          <p className="text-amber-800/70 font-serif">
            Stone and crystal tablets containing encoded knowledge from prehistoric civilizations.
          </p>
        </div>
      </div>
      
      {/* Loading state */}
      {isLoading && (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="w-10 h-10 text-amber-700 animate-spin" />
        </div>
      )}
      
      {/* Grid of items */}
      {!isLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Custom tablets */}
          {tablets.map((tablet, index) => (
            <TabletCard
              key={tablet.id}
              title={tablet.title}
              description={tablet.description}
              imagePath={tablet.image}
              isLocked={tablet.isLocked}
              onClick={() => console.log("Selected tablet:", tablet.id)}
            />
          ))}
          
          {/* Database tablets */}
          {dbItems.map((item) => (
            <TabletCard
              key={item.id}
              title={item.title}
              description={item.content?.slice(0, 100) + "..." || "Ancient wisdom awaits..."}
              imagePath={item.image || "/assets/sacred_geometry.svg"}
              isLocked={user ? !userScrolls?.some(scroll => scroll.id === item.id) : true}
              onClick={() => console.log("Selected database item:", item.id)}
            />
          ))}
        </div>
      )}
      
      {/* Empty state */}
      {!isLoading && tablets.length === 0 && dbItems.length === 0 && (
        <div className="text-center py-20">
          <p className="text-amber-800/70 font-serif text-lg">
            No tablets have been discovered yet.
          </p>
        </div>
      )}
    </div>
  );
}