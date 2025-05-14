import { useState, useEffect } from "react";
import { useLocation, Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { Helmet } from "react-helmet";
// Import images directly using relative paths
// @ts-ignore
import ancientTabletImage from '../assets/ancient_tablet_dark.png';
// @ts-ignore
import artifactImage from '../assets/artifact_1.png';
// @ts-ignore
import scrollImage from '../assets/scroll_1.jpg';
// @ts-ignore
import bookImage from '../assets/book_1.png';

type CategoryCardProps = { 
  id: string;
  title: string; 
  imagePath: string; 
  description: string; 
  linkTo: string; 
  glyphPath: string;
  poeticDescription: string;
  delay: number;
};

const CategoryCard: React.FC<CategoryCardProps> = ({ 
  id, title, imagePath, description, linkTo, glyphPath, poeticDescription, delay
}) => {
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay }}
      className="h-full"
    >
      <Link href={linkTo}>
        <motion.div
          className="cursor-pointer h-full"
          onHoverStart={() => setIsHovered(true)}
          onHoverEnd={() => setIsHovered(false)}
          whileHover={{ 
            scale: 1.03,
            transition: { duration: 0.2 }
          }}
        >
          {/* Card styled similarly to BookCard */}
          <div className="h-full bg-amber-50 border border-amber-200 shadow-md overflow-hidden rounded-lg relative group">
            {/* Golden glow on hover - similar to book style */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none bg-gradient-to-r from-amber-100/20 via-amber-100/30 to-amber-100/20"></div>
            
            {/* Background glyph symbol - very faint by default */}
            <motion.div 
              className="absolute inset-0 opacity-5 pointer-events-none z-0 flex items-center justify-center"
              animate={{
                opacity: isHovered ? 0.12 : 0.05
              }}
              transition={{ duration: 1.2 }}
            >
              <img 
                src={glyphPath} 
                alt="Sacred glyph" 
                className="w-3/4 h-3/4 object-contain"
              />
            </motion.div>

            {/* Image container - styled like BookCard */}
            <div className="overflow-hidden aspect-[4/3] relative">
              <img 
                src={imagePath} 
                alt={title}
                className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
                onError={(e) => {
                  console.log("Setting fallback image for:", title);
                  e.currentTarget.src = "/assets/sacred_symbol.svg"; // Fallback image
                }}
              />
              
              {/* Enhanced glowing border effects */}
              <motion.div 
                className="absolute inset-0 pointer-events-none"
                animate={{ 
                  boxShadow: isHovered ? 
                    'inset 0 0 30px rgba(193, 145, 30, 0.2), 0 0 20px rgba(193, 145, 30, 0.15)' : 
                    'inset 0 0 10px rgba(193, 145, 30, 0.1), 0 0 5px rgba(193, 145, 30, 0.1)'
                }}
                transition={{ duration: 0.8 }}
              />

              {/* Pulsing glow effect */}
              <motion.div 
                className="absolute inset-0 pointer-events-none"
                animate={{ 
                  boxShadow: isHovered ? 
                    'inset 0 0 15px rgba(193, 145, 30, 0.25), 0 0 10px rgba(193, 145, 30, 0.2)' : 
                    'inset 0 0 5px rgba(193, 145, 30, 0.1), 0 0 2px rgba(193, 145, 30, 0.1)'
                }}
                transition={{ 
                  duration: 2, 
                  repeat: Infinity, 
                  repeatType: "reverse",
                  ease: "easeInOut" 
                }}
              />
            </div>
            
            {/* Content area - styled similarly to BookCard */}
            <div className="p-4">
              <h3 className="text-xl font-serif text-amber-800 mb-2 tracking-wide group-hover:text-amber-900 transition-colors">{title}</h3>
              <motion.p 
                className="text-amber-700/80 text-sm font-serif line-clamp-2"
                initial={{ opacity: 0.8 }}
                animate={{ opacity: isHovered ? 1 : 0.8 }}
                transition={{ duration: 0.3 }}
              >
                {poeticDescription}
              </motion.p>
            </div>
            
            {/* Footer area similar to BookCard */}
            <div className="px-4 pb-4 pt-0 flex justify-between items-center">
              <div className="text-xs text-amber-600/80 font-serif italic">
                Explore
              </div>
              <motion.div 
                className="text-amber-700 p-0 w-8 h-8 flex items-center justify-center"
                whileHover={{ scale: 1.1 }}
              >
                <Eye className="w-4 h-4" />
              </motion.div>
            </div>
          </div>
        </motion.div>
      </Link>
    </motion.div>
  );
};

export default function ArkContents() {
  const [, setLocation] = useLocation();
  const [isLoaded, setIsLoaded] = useState(false);
  
  useEffect(() => {
    // Simulate the vault door opening effect
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 800);
    
    return () => clearTimeout(timer);
  }, []);

  const categories = [
    {
      id: "artifacts",
      title: "Artifacts",
      description: "Ancient devices of mysterious origin",
      poeticDescription: "Remnants of impossible technology. Echoes of forgotten stars.",
      // Using the imported artifact image
      imagePath: artifactImage,
      glyphPath: "/assets/sacred_symbol.svg", 
      linkTo: "/ark/artifacts",
      delay: 0.4
    },
    {
      id: "tablets",
      title: "Tablets",
      description: "Stone records of forbidden knowledge",
      poeticDescription: "Inscribed in crystal. Memory carved in vibration.",
      // Using the imported ancient tablet image
      imagePath: ancientTabletImage,
      glyphPath: "/assets/sacred_geometry.svg",
      linkTo: "/ark/tablets",
      delay: 0.6
    },
    {
      id: "scrolls",
      title: "Scrolls",
      description: "Parchments containing arcane wisdom",
      poeticDescription: "Unfurled secrets. Language of the keepers.",
      // Using the imported scroll image
      imagePath: scrollImage,
      glyphPath: "/assets/sacred_geometry_2.svg",
      linkTo: "/ark/scrolls",
      delay: 0.8
    },
    {
      id: "books",
      title: "Books",
      description: "Tomes of collected mystical teachings",
      poeticDescription: "Bound chronicles. Whispers from the ages.",
      // Using the imported book image
      imagePath: bookImage,
      glyphPath: "/assets/sacred_geometry_3.svg",
      linkTo: "/ark/books",
      delay: 1.0
    }
  ];

  return (
    <div 
      className="min-h-screen w-full bg-gradient-to-b from-white to-amber-50/50 relative overflow-hidden"
    >
      <Helmet>
        <title>Sacred Vault | Akashic Archive</title>
        <meta name="description" content="Explore the Sacred Vault - ancient artifacts, tablets, scrolls, and books containing forgotten wisdom and cosmic secrets." />
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600;700&display=swap" />
      </Helmet>
      
      {/* Enhanced sacred glyph background pattern with subtle animation */}
      <div className="absolute inset-0 z-0">
        <motion.div 
          className="absolute top-0 left-0 w-full h-full bg-repeat opacity-10" 
          style={{backgroundImage: "url('/assets/sacred_symbol.svg')", backgroundSize: "300px"}}
          animate={{
            backgroundPosition: ["0px 0px", "20px 20px", "0px 0px"],
          }}
          transition={{
            duration: 20,
            ease: "linear",
            repeat: Infinity,
            repeatType: "loop"
          }}
        >
        </motion.div>
      </div>
      
      {/* Subtle radial gradient overlay */}
      <div className="absolute inset-0 z-0 bg-radial-gradient from-transparent to-amber-50/30"></div>
      
      {/* Content container */}
      <div className="relative z-10 container mx-auto px-4 py-8 md:py-16">
        {/* Entrance animation */}
        <AnimatePresence>
          {isLoaded && (
            <>
              {/* Enhanced header section with reveal animation */}
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="mb-16 md:mb-20 text-center"
              >
                <motion.button
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3, duration: 0.5 }}
                  className="mb-10 text-amber-800 hover:text-amber-900 hover:bg-amber-100 px-5 py-2 rounded-full border border-amber-300 bg-amber-50/80 shadow-md backdrop-blur-sm flex items-center justify-center mx-auto group transition-all duration-300"
                  onClick={() => setLocation("/")}
                >
                  <ArrowLeft className="mr-2 h-4 w-4 group-hover:translate-x-[-3px] transition-transform" /> 
                  <span className="font-cormorant text-lg tracking-wide">Return to Gateway</span>
                </motion.button>
                
                {/* Decorative symbol above title */}
                <motion.div 
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2, duration: 1, ease: "easeOut" }}
                  className="mb-5 flex justify-center"
                >
                  <div className="w-12 h-12 opacity-70 relative">
                    <div className="absolute inset-0 rounded-full border border-amber-700/30"></div>
                    <div className="absolute inset-2 rounded-full border border-amber-700/40"></div>
                    <div className="absolute inset-4 rounded-full border border-amber-700/50"></div>
                    <div className="absolute inset-0 w-full h-full flex items-center justify-center">
                      <div className="w-1 h-1 bg-amber-800 rounded-full"></div>
                    </div>
                  </div>
                </motion.div>
                
                <motion.h1 
                  className="text-5xl md:text-6xl text-amber-800 font-serif mb-6 tracking-wider font-cormorant" 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8 }}
                >
                  The Sacred Vault
                </motion.h1>
                
                <motion.div
                  initial={{ opacity: 0, width: "0%" }}
                  animate={{ opacity: 1, width: "80px" }}
                  transition={{ delay: 0.2, duration: 1.2 }}
                  className="h-[1px] bg-gradient-to-r from-transparent via-amber-700 to-transparent mx-auto mb-6"
                />
                
                <motion.p 
                  className="text-amber-700/90 text-lg md:text-xl max-w-2xl mx-auto font-cormorant leading-relaxed"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3, duration: 0.8 }}
                >
                  Preserved within these walls lie the sacred remnants of antediluvian wisdom. 
                  Choose a path to illuminate the hidden knowledge.
                </motion.p>
              </motion.div>
              
              {/* Card grid styled similar to ArkBooks layout */}
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 md:gap-10 max-w-7xl mx-auto px-2 md:px-6">
                {categories.map((category) => (
                  <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ 
                      duration: 0.7, 
                      delay: category.delay * 1.2,
                      ease: "easeOut"
                    }}
                    key={category.id}
                    className="transform hover:z-10 h-full"
                  >
                    <CategoryCard
                      id={category.id}
                      title={category.title}
                      imagePath={category.imagePath}
                      description={category.description}
                      poeticDescription={category.poeticDescription}
                      glyphPath={category.glyphPath}
                      linkTo={category.linkTo}
                      delay={0} // We're handling the delay in the parent motion.div
                    />
                  </motion.div>
                ))}
              </div>
            </>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}