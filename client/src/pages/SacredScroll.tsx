import { useState, useEffect } from "react";
import { useRoute, useLocation, Link } from "wouter";
import { motion } from "framer-motion";
import { Helmet } from "react-helmet";
import { ChevronLeft, ChevronRight, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ScrollData {
  title: string;
  pages: {
    title: string;
    content: string;
  }[];
}

export default function SacredScroll() {
  const [match, params] = useRoute('/scrolls/:id');
  const scrollId = match ? parseInt(params.id, 10) : 0;
  const [, navigate] = useLocation();
  
  const [scrollData, setScrollData] = useState<ScrollData | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  
  // Fetch the scroll data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // For "Legacy of the Lost Age" (id 34), we'll use our special sacred-scroll.json
        if (scrollId === 34) {
          const response = await fetch('/data/sacred-scroll.json');
          if (!response.ok) {
            throw new Error("Failed to fetch sacred scroll data");
          }
          const data = await response.json();
          setScrollData(data);
        } else {
          // For other scrolls, we'd fetch from API
          // This is a placeholder - in a real scenario we'd fetch from the server
          navigate('/scrolls');
          return;
        }
      } catch (error) {
        console.error("Error fetching scroll data:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [scrollId, navigate]);
  
  const goToNextPage = () => {
    if (scrollData && currentPage < scrollData.pages.length - 1) {
      setCurrentPage(currentPage + 1);
      // Scroll to top when changing pages
      window.scrollTo(0, 0);
    }
  };
  
  const goToPrevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
      // Scroll to top when changing pages
      window.scrollTo(0, 0);
    }
  };
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-sacred-light">
        <div className="w-12 h-12 border-4 border-sacred-blue rounded-full border-t-transparent animate-spin"></div>
      </div>
    );
  }
  
  if (!scrollData) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-sacred-light">
        <h1 className="text-2xl font-cinzel text-sacred-blue mb-4">Scroll Not Found</h1>
        <p className="text-sacred-gray mb-6">The sacred text you seek may be hidden in deeper chambers.</p>
        <Link to="/scrolls">
          <Button variant="outline" className="font-cinzel">
            Return to Scrolls
          </Button>
        </Link>
      </div>
    );
  }
  
  const currentPageData = scrollData.pages[currentPage];
  
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.7 }}
      className="min-h-screen py-8 px-4 bg-sacred-light"
    >
      <Helmet>
        <title>{scrollData.title} | Page {currentPage + 1} of {scrollData.pages.length} | The Akashic Archive</title>
        <meta name="description" content={`Reading ${scrollData.title}: ${currentPageData.title}. An ancient scroll from the Akashic Archives.`} />
      </Helmet>
      
      <div className="max-w-4xl mx-auto">
        {/* Back button */}
        <Link to="/scrolls" className="inline-flex items-center text-sacred-blue hover:text-sacred-blue-dark mb-6 transition-colors">
          <ArrowLeft className="mr-2 h-4 w-4" />
          <span className="font-cinzel">Return to Scrolls</span>
        </Link>
        
        {/* Scroll container with parchment background */}
        <div 
          className="relative rounded-lg overflow-hidden shadow-xl mb-8"
          style={{ 
            backgroundImage: "url('/images/parchment-bg.jpg')", 
            backgroundSize: "cover",
            backgroundPosition: "center"
          }}
        >
          {/* Overlay for better text readability */}
          <div className="absolute inset-0 bg-sacred-gold/5"></div>
          
          {/* Content */}
          <div className="relative p-8 md:p-12">
            {/* Main title (shown only on first page) */}
            {currentPage === 0 && (
              <motion.h1 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="text-3xl md:text-4xl font-cinzel text-sacred-blue text-center mb-8"
              >
                {scrollData.title}
              </motion.h1>
            )}
            
            {/* Page title */}
            <motion.h2 
              key={`title-${currentPage}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="text-xl md:text-2xl font-cinzel text-sacred-blue-dark mb-6"
            >
              {currentPageData.title}
            </motion.h2>
            
            {/* Page content */}
            <motion.div 
              key={`content-${currentPage}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="prose prose-lg max-w-none font-serif text-sacred-gray-dark"
            >
              {currentPageData.content.split('\n\n').map((paragraph, idx) => (
                <p key={idx} className="mb-4 leading-relaxed">
                  {paragraph}
                </p>
              ))}
            </motion.div>
            
            {/* Page number indicator */}
            <div className="text-center mt-8 font-cinzel text-sacred-blue-light">
              Page {currentPage + 1} of {scrollData.pages.length}
            </div>
          </div>
        </div>
        
        {/* Navigation buttons */}
        <div className="flex justify-between items-center mb-12">
          <Button 
            variant="outline"
            onClick={goToPrevPage}
            disabled={currentPage === 0}
            className="font-cinzel border-sacred-blue/30 text-sacred-blue hover:bg-sacred-blue hover:text-sacred-white"
          >
            <ChevronLeft className="mr-2 h-4 w-4" />
            Previous Page
          </Button>
          
          <Button 
            variant="outline"
            onClick={goToNextPage}
            disabled={currentPage === scrollData.pages.length - 1}
            className="font-cinzel border-sacred-blue/30 text-sacred-blue hover:bg-sacred-blue hover:text-sacred-white"
          >
            Next Page
            <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </motion.div>
  );
}