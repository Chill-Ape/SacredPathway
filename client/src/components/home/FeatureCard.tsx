import { motion } from "framer-motion";
import { useState } from "react";
import { Eye } from "lucide-react";

interface FeatureCardProps {
  title: string;
  description: string;
  image: string;
  delay: number;
  href: string;
}

export default function FeatureCard({ title, description, image, delay, href }: FeatureCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  
  // Generate a poetic version of the description (shorter, more mystical)
  const poeticDescription = description;
  
  // Random selection of sacred geometry SVG paths for background glyphs
  const glyphSvgs = [
    "/assets/sacred_symbol.svg",
    "/assets/sacred_geometry.svg",
    "/assets/sacred_geometry_2.svg",
    "/assets/sacred_geometry_3.svg"
  ];
  
  // Select a random glyph path
  const randomGlyphIndex = Math.floor(Math.random() * glyphSvgs.length);
  const glyphPath = glyphSvgs[randomGlyphIndex];
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay }}
      className="h-full"
    >
      <a href={href}>
        <motion.div
          className="cursor-pointer h-full"
          onHoverStart={() => setIsHovered(true)}
          onHoverEnd={() => setIsHovered(false)}
          whileHover={{ 
            scale: 1.03,
            transition: { duration: 0.2 }
          }}
        >
          {/* Card styled similarly to ArkContents CategoryCard */}
          <div className="h-full bg-amber-50 border border-amber-200 shadow-md overflow-hidden rounded-lg relative group">
            {/* Golden glow on hover */}
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
                onError={(e) => {
                  // Fallback if the SVG fails to load
                  e.currentTarget.style.display = 'none';
                }}
              />
            </motion.div>

            {/* Image container with hover effects */}
            <div className="overflow-hidden aspect-[4/3] relative">
              <img 
                src={image} 
                alt={title}
                className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
                onError={(e) => {
                  // Use a default sacred image if this fails
                  e.currentTarget.src = "/assets/sacred_symbol.svg";
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
            
            {/* Content area */}
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
            
            {/* Footer area */}
            <div className="px-4 pb-4 pt-0 flex justify-between items-center">
              <div className="text-xs text-amber-600/80 font-serif italic">
                Explore
              </div>
              <motion.div 
                className="text-amber-700 p-0 w-8 h-8 flex items-center justify-center"
                whileHover={{ scale: 1.1 }}
              >
                <Eye size={16} />
              </motion.div>
            </div>
          </div>
        </motion.div>
      </a>
    </motion.div>
  );
}
