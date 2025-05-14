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

// Import book images directly using Vite's asset handling 
import firstCodexImage from '@assets/ChatGPT Image Apr 27, 2025, 06_09_01 PM.png';
import akashicCompendiumImage from '@assets/ChatGPT Image Apr 24, 2025, 07_12_38 PM.png';
// For Book of Thoth, importing from client assets directly
// @ts-ignore
import bookOfThothImage from '../assets/ancient_tablet_dark.png';

// Simple component for a book item card
const BookCard = ({ 
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

// Main component for books page
export default function ArkBooks() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  
  // Custom items specific to books
  const books = [
    {
      id: "book-of-thoth",
      title: "The Book of Thoth",
      description: "A legendary text attributed to the Egyptian deity of wisdom, containing powerful knowledge of astral realms.",
      isLocked: true,
      key: "THOTH",
      image: bookOfThothImage
    },
    {
      id: "first-codex",
      title: "The First Codex",
      description: "Believed to be the earliest written account of the journey of consciousness through the cosmos.",
      isLocked: true,
      key: "CODEX",
      image: firstCodexImage
    },
    {
      id: "akashic-compendium",
      title: "Akashic Compendium Vol. I",
      description: "The first volume of the complete cosmic record, detailing the earliest eras of manifested reality.",
      isLocked: true,
      key: "AKASHA",
      image: akashicCompendiumImage
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
      // Filter scrolls by "book" type
      const filteredItems = scrollsData
        .filter(scroll => {
          const scrollType = scroll.type || 'scroll';
          return scrollType === 'book';
        });
      setDbItems(filteredItems);
    }
  }, [scrollsData]);

  return (
    <div className="container mx-auto px-4 py-8">
      <Helmet>
        <title>Ancient Books | Akashic Archive</title>
        <meta name="description" content="Explore ancient books containing arcane wisdom and mystical treatises from the early scribes." />
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
            <h1 className="text-3xl font-serif font-medium text-amber-900">Books</h1>
          </div>
          <p className="text-amber-800/70 font-serif">
            Ancient books containing arcane wisdom and mystical treatises from the early scribes.
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
          {/* Custom books */}
          {books.map((book, index) => (
            <BookCard
              key={book.id}
              title={book.title}
              description={book.description}
              imagePath={book.image}
              isLocked={book.isLocked}
              onClick={() => console.log("Selected book:", book.id)}
            />
          ))}
          
          {/* Database books */}
          {dbItems.map((item) => (
            <BookCard
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
      {!isLoading && books.length === 0 && dbItems.length === 0 && (
        <div className="text-center py-20">
          <p className="text-amber-800/70 font-serif text-lg">
            No books have been discovered yet.
          </p>
        </div>
      )}
    </div>
  );
}