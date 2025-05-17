import { motion } from "framer-motion";
import { useState } from "react";

interface FeatureCardProps {
  title: string;
  description: string;
  image: string;
  delay: number;
  href: string;
}

export default function FeatureCard({ title, description, image, delay, href }: FeatureCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <motion.div
      className="relative group rounded-lg overflow-hidden bg-white shadow-md border border-theme-border transform transition-all duration-300"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        transformOrigin: "center bottom"
      }}
    >
      <a href={href} className="block">
        {/* Card content wrapper */}
        <div className={`transition-all duration-500 ${isHovered ? "scale-[1.05]" : "scale-100"}`}>
          {/* Image section */}
          <div className="relative h-56 overflow-hidden">
            {/* Main image */}
            <img 
              src={image} 
              alt={title} 
              className="w-full h-full object-cover"
            />
            
            {/* Overlay with gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
            
            {/* Sacred geometry overlay */}
            <div className={`absolute inset-0 opacity-0 transition-opacity duration-500 ${isHovered ? "opacity-25" : ""}`}>
              <svg viewBox="0 0 100 100" className="w-full h-full text-theme-gold">
                <circle cx="50" cy="50" r="48" fill="none" stroke="currentColor" strokeWidth="0.5" />
                <circle cx="50" cy="50" r="36" fill="none" stroke="currentColor" strokeWidth="0.5" />
                <circle cx="50" cy="50" r="24" fill="none" stroke="currentColor" strokeWidth="0.5" />
                <circle cx="50" cy="50" r="12" fill="none" stroke="currentColor" strokeWidth="0.5" />
              </svg>
            </div>
          </div>
          
          {/* Text content section */}
          <div className="p-5 relative">
            {/* Golden divider */}
            <div className="absolute -top-3 left-0 right-0 flex items-center justify-center">
              <div className="h-px bg-theme-gold w-16"></div>
              <div className="mx-2 bg-theme-gold rounded-full w-2 h-2"></div>
              <div className="h-px bg-theme-gold w-16"></div>
            </div>
            
            {/* Title */}
            <h3 className="text-theme-text-dark text-xl font-bold mb-2 text-center">{title}</h3>
            
            {/* Description */}
            <p className="text-theme-text-secondary text-center">{description}</p>
          </div>
        </div>
        
        {/* Hover effect overlay */}
        <div className={`absolute inset-0 border-2 border-theme-gold opacity-0 rounded transition-opacity duration-300 ${isHovered ? "opacity-100" : ""}`}></div>
      </a>
    </motion.div>
  );
}
