import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Lock, Eye, KeyRound } from "lucide-react";
import { Helmet } from "react-helmet";
import { useToast } from "@/hooks/use-toast";

// Import book images directly using Vite's asset handling 
import firstCodexImage from '@assets/ChatGPT Image Apr 27, 2025, 06_09_01 PM.png';
import akashicCompendiumImage from '@assets/ChatGPT Image Apr 24, 2025, 07_12_38 PM.png';
// Using public path instead of direct import for better performance
const epicOfApkalluImage = '/assets/epic_of_apkallu.jpg';
// For Book of Thoth, importing from client assets directly
// @ts-ignore
import bookOfThothImage from '../assets/ancient_tablet_dark.png';

// Completely static version of the page with NO DATA FETCHING to eliminate refresh issues
export default function ArkBooks() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  // Static book data
  const books = [
    {
      id: "book-of-thoth",
      title: "The Book of Thoth",
      description: "A legendary text attributed to the Egyptian deity of wisdom, containing powerful knowledge of astral realms.",
      isLocked: true,
      image: bookOfThothImage
    },
    {
      id: "epic-of-apkallu",
      title: "The Epic of the Apkallu",
      description: "An ancient Mesopotamian text chronicling the seven sages who brought wisdom and civilization to humanity before the Great Flood.",
      isLocked: false,
      image: epicOfApkalluImage
    },
    {
      id: "first-codex",
      title: "The First Codex",
      description: "Believed to be the earliest written account of the journey of consciousness through the cosmos.",
      isLocked: true,
      image: firstCodexImage
    },
    {
      id: "akashic-compendium",
      title: "Akashic Compendium Vol. I",
      description: "The first volume of the complete cosmic record, detailing the earliest eras of manifested reality.",
      isLocked: true,
      image: akashicCompendiumImage
    }
  ];

  const handleBookClick = (bookId: string) => {
    if (bookId === "epic-of-apkallu") {
      setLocation("/epic-of-apkallu");
    } else {
      toast({
        title: "Book page under construction",
        description: "This book's detailed page is coming soon."
      });
    }
  };

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
      
      {/* Grid of books - STATIC DATA ONLY */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {books.map(book => (
          <div
            key={book.id}
            className={`cursor-pointer h-full bg-amber-50 border border-amber-200 shadow-md overflow-hidden relative group rounded-lg
                      transition-all duration-300 hover:scale-[1.02] hover:shadow-lg ${book.isLocked ? 'opacity-85' : 'opacity-100'}`}
            onClick={() => handleBookClick(book.id)}
          >
            {/* Golden glow on hover */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none bg-gradient-to-r from-amber-100/20 via-amber-100/30 to-amber-100/20"></div>
            
            {/* Image container */}
            <div className="overflow-hidden aspect-[4/3] relative">
              <img 
                src={book.image} 
                alt={book.title}
                className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
                onError={(e) => {
                  // Fallback for missing images
                  e.currentTarget.src = "/assets/default_scroll.svg"; 
                }}
              />
              
              {/* Locked overlay */}
              {book.isLocked && (
                <div className="absolute inset-0 bg-amber-950/50 flex items-center justify-center">
                  <div className="w-12 h-12 rounded-full bg-amber-900/60 flex items-center justify-center">
                    <Lock className="w-5 h-5 text-amber-100" />
                  </div>
                </div>
              )}
            </div>
            
            {/* Content */}
            <div className="p-4">
              <h3 className="text-xl font-serif text-amber-800 mb-2 tracking-wide group-hover:text-amber-900 transition-colors">
                {book.title}
              </h3>
              <p className="text-amber-700/80 text-sm font-serif line-clamp-2">
                {book.description}
              </p>
            </div>
            
            <div className="px-4 pb-4 pt-0 flex justify-between items-center">
              <div className="text-xs text-amber-600/80 font-serif italic">
                {book.isLocked ? 'Locked' : 'Accessible'}
              </div>
              <div className="text-amber-700 p-0 w-8 h-8 flex items-center justify-center">
                {book.isLocked ? 
                  <KeyRound className="w-4 h-4" /> : 
                  <Eye className="w-4 h-4" />
                }
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}