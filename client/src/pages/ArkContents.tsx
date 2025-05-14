import { useState, useEffect } from "react";
import { useLocation, Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { Helmet } from "react-helmet";

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
      className="relative"
    >
      <Link href={linkTo}>
        <motion.div
          className="cursor-pointer relative"
          onHoverStart={() => setIsHovered(true)}
          onHoverEnd={() => setIsHovered(false)}
          whileHover={{ scale: 1.03 }}
        >
          {/* Base relic container */}
          <div className="relative overflow-hidden rounded-lg aspect-square bg-amber-50 shadow-md border border-amber-200">
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

            {/* Item image */}
            <div className="absolute inset-0 flex items-center justify-center p-6 transition-opacity">
              <img 
                src={imagePath} 
                alt={title}
                className="w-full h-full object-contain rounded-md transition-all duration-700 drop-shadow-lg"
                onError={(e) => {
                  console.error("Image failed to load:", imagePath);
                  e.currentTarget.src = "/assets/sacred_symbol.svg"; // Fallback image
                }}
              />
            </div>

            {/* Glowing border - initially subtle, brighter on hover */}
            <motion.div 
              className="absolute inset-0 pointer-events-none"
              initial={{ opacity: 0.1 }}
              animate={{ 
                opacity: isHovered ? 0.8 : 0.3,
                boxShadow: isHovered ? 
                  'inset 0 0 30px rgba(193, 145, 30, 0.2), 0 0 20px rgba(193, 145, 30, 0.15)' : 
                  'inset 0 0 10px rgba(193, 145, 30, 0.1), 0 0 5px rgba(193, 145, 30, 0.1)'
              }}
              transition={{ duration: 0.8 }}
            />

            {/* Pulsing glow effect */}
            <motion.div 
              className="absolute inset-0 border border-amber-400/10 rounded-lg pointer-events-none"
              animate={{ 
                boxShadow: isHovered ? 
                  ['0 0 10px rgba(193, 145, 30, 0.2)', '0 0 15px rgba(193, 145, 30, 0.3)', '0 0 10px rgba(193, 145, 30, 0.2)'] : 
                  ['0 0 5px rgba(193, 145, 30, 0.05)', '0 0 10px rgba(193, 145, 30, 0.1)', '0 0 5px rgba(193, 145, 30, 0.05)']
              }}
              transition={{ 
                duration: 3, 
                repeat: Infinity, 
                ease: "easeInOut" 
              }}
            />

            {/* Title and poetic description - slide up on hover */}
            <motion.div 
              className="absolute bottom-0 left-0 right-0 px-4 py-4 bg-gradient-to-t from-amber-50/95 via-amber-50/80 to-transparent"
              initial={{ y: 0 }}
              animate={{ y: isHovered ? -15 : 0 }}
              transition={{ duration: 0.5 }}
            >
              <h3 className="text-amber-800 font-serif text-2xl text-center tracking-wider mb-1">{title}</h3>
              <motion.p
                className="text-xs md:text-sm text-amber-700/90 italic text-center font-serif mt-1"
                initial={{ opacity: 0 }}
                animate={{ opacity: isHovered ? 1 : 0 }}
                transition={{ duration: 0.3 }}
              >
                {poeticDescription}
              </motion.p>
            </motion.div>
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
      imagePath: "/assets/content-types/crystal_artifact.jpg", 
      glyphPath: "/assets/sacred_symbol.svg", 
      linkTo: "/ark/artifacts",
      delay: 0.4
    },
    {
      id: "tablets",
      title: "Tablets",
      description: "Stone records of forbidden knowledge",
      poeticDescription: "Inscribed in crystal. Memory carved in vibration.",
      imagePath: "/assets/tablets/stone_tablet.png",
      glyphPath: "/assets/sacred_geometry.svg",
      linkTo: "/ark/tablets",
      delay: 0.6
    },
    {
      id: "scrolls",
      title: "Scrolls",
      description: "Parchments containing arcane wisdom",
      poeticDescription: "Unfurled secrets. Language of the keepers.",
      imagePath: "/assets/content-types/enchanted_scroll.jpg",
      glyphPath: "/assets/sacred_geometry_2.svg",
      linkTo: "/ark/scrolls",
      delay: 0.8
    },
    {
      id: "books",
      title: "Books",
      description: "Tomes of collected mystical teachings",
      poeticDescription: "Bound chronicles. Whispers from the ages.",
      imagePath: "/assets/ChatGPT Image Apr 24, 2025, 06_05_26 PM.png",
      glyphPath: "/assets/sacred_geometry_3.svg",
      linkTo: "/ark/books",
      delay: 1.0
    }
  ];

  return (
    <div 
      className="min-h-screen w-full bg-white relative overflow-hidden"
    >
      <Helmet>
        <title>Ark Contents | Akashic Archive</title>
        <meta name="description" content="Explore the Ark Contents - ancient artifacts, tablets, scrolls, and books containing forgotten wisdom and cosmic secrets." />
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600;700&display=swap" />
      </Helmet>
      
      {/* Subtle sacred glyph background pattern */}
      <div className="absolute inset-0 z-0 opacity-5">
        <div className="absolute top-0 left-0 w-full h-full bg-repeat opacity-20" 
             style={{backgroundImage: "url('/assets/sacred_symbol.svg')", backgroundSize: "300px"}}>
        </div>
      </div>
      
      {/* Content container */}
      <div className="relative z-10 container mx-auto px-4 py-8 md:py-16">
        {/* Entrance animation */}
        <AnimatePresence>
          {isLoaded && (
            <>
              {/* Header section with reveal animation */}
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="mb-12 md:mb-16 text-center"
              >
                <motion.button
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3, duration: 0.5 }}
                  className="mb-8 text-amber-800 hover:text-amber-900 hover:bg-amber-100 px-4 py-2 rounded-full border border-amber-300 bg-amber-50 shadow-sm flex items-center justify-center mx-auto group"
                  onClick={() => setLocation("/")}
                >
                  <ArrowLeft className="mr-2 h-4 w-4 group-hover:translate-x-[-3px] transition-transform" /> 
                  <span className="font-cormorant text-lg">Return to Gateway</span>
                </motion.button>
                
                <motion.h1 
                  className="text-5xl md:text-6xl text-amber-800 font-serif mb-6 tracking-wider font-cormorant" 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8 }}
                >
                  The Sacred Vault
                </motion.h1>
                
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2, duration: 0.8 }}
                  className="h-[1px] w-20 bg-gradient-to-r from-transparent via-amber-700 to-transparent mx-auto mb-6"
                />
                
                <motion.p 
                  className="text-amber-700/90 text-lg md:text-xl max-w-2xl mx-auto font-cormorant"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3, duration: 0.8 }}
                >
                  Preserved within these walls lie the sacred remnants of antediluvian wisdom. 
                  Choose a path to illuminate the hidden knowledge.
                </motion.p>
              </motion.div>
              
              {/* Grid layout */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 max-w-6xl mx-auto">
                {categories.map((category) => (
                  <CategoryCard
                    key={category.id}
                    id={category.id}
                    title={category.title}
                    imagePath={category.imagePath}
                    description={category.description}
                    poeticDescription={category.poeticDescription}
                    glyphPath={category.glyphPath}
                    linkTo={category.linkTo}
                    delay={category.delay}
                  />
                ))}
              </div>
            </>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}