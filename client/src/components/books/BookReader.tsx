import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, X, Home } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/hooks/use-toast";

// Type definitions for book content
export interface BookPage {
  pageNumber: number;
  title: string;
  content: string;
  image?: string;
}

export interface Book {
  bookId: string;
  title: string;
  author: string;
  coverImage: string;
  description: string;
  pages: BookPage[];
}

interface BookReaderProps {
  book: Book;
  onClose: () => void;
}

const BookReader = ({ book, onClose }: BookReaderProps) => {
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [direction, setDirection] = useState(0); // -1 for left, 1 for right
  const { toast } = useToast();
  
  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') {
        handleNextPage();
      } else if (e.key === 'ArrowLeft') {
        handlePrevPage();
      } else if (e.key === 'Escape') {
        onClose();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentPageIndex, book.pages.length]);
  
  const handleNextPage = () => {
    if (currentPageIndex < book.pages.length - 1) {
      setDirection(1);
      setCurrentPageIndex(prev => prev + 1);
    } else {
      toast({
        title: "End of Book",
        description: "You have reached the last page.",
      });
    }
  };
  
  const handlePrevPage = () => {
    if (currentPageIndex > 0) {
      setDirection(-1);
      setCurrentPageIndex(prev => prev - 1);
    } else {
      toast({
        title: "Beginning of Book",
        description: "You are on the first page.",
      });
    }
  };
  
  const currentPage = book.pages[currentPageIndex];
  
  // Page transition animations
  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0
    }),
    center: {
      x: 0,
      opacity: 1
    },
    exit: (direction: number) => ({
      x: direction < 0 ? 1000 : -1000,
      opacity: 0
    })
  };
  
  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center overflow-hidden">
      {/* Close button */}
      <Button 
        variant="ghost" 
        size="icon" 
        className="absolute top-4 right-4 text-amber-100 hover:bg-amber-900/20 z-10"
        onClick={onClose}
      >
        <X className="h-6 w-6" />
      </Button>
      
      {/* Return to book info */}
      <Button 
        variant="ghost" 
        size="icon" 
        className="absolute top-4 left-4 text-amber-100 hover:bg-amber-900/20 z-10"
        onClick={() => setCurrentPageIndex(0)}
      >
        <Home className="h-6 w-6" />
      </Button>
      
      {/* Page navigation */}
      <div className="absolute bottom-4 left-0 right-0 flex justify-center items-center gap-4 z-10">
        <Button 
          variant="ghost" 
          size="sm" 
          className="text-amber-100 hover:bg-amber-900/20"
          onClick={handlePrevPage}
          disabled={currentPageIndex === 0}
        >
          <ChevronLeft className="h-5 w-5 mr-1" />
          Previous Page
        </Button>
        
        <div className="text-amber-200 text-sm">
          Page {currentPage.pageNumber} of {book.pages.length}
        </div>
        
        <Button 
          variant="ghost" 
          size="sm" 
          className="text-amber-100 hover:bg-amber-900/20"
          onClick={handleNextPage}
          disabled={currentPageIndex === book.pages.length - 1}
        >
          Next Page
          <ChevronRight className="h-5 w-5 ml-1" />
        </Button>
      </div>
      
      {/* Page content with animation */}
      <div className="max-w-4xl w-full h-[80vh] mx-auto relative overflow-hidden">
        <AnimatePresence initial={false} custom={direction} mode="wait">
          <motion.div
            key={currentPageIndex}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ type: "tween", duration: 0.5 }}
            className="absolute inset-0 p-8"
          >
            <div className="bg-amber-50/95 border border-amber-200 rounded-lg shadow-xl h-full overflow-y-auto p-6 md:p-8">
              <h2 className="text-2xl md:text-3xl font-serif text-amber-900 mb-4">
                {currentPage.title}
              </h2>
              
              {currentPage.image && (
                <div className="mb-6 flex justify-center">
                  <img 
                    src={currentPage.image} 
                    alt={currentPage.title} 
                    className="max-h-64 rounded-lg shadow-md"
                  />
                </div>
              )}
              
              <div className="prose prose-amber max-w-none">
                {currentPage.content.split('\n\n').map((paragraph, idx) => (
                  <p key={idx} className="mb-4 text-amber-800 leading-relaxed font-serif">
                    {paragraph}
                  </p>
                ))}
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default BookReader;