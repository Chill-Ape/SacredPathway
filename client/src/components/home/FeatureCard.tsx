import { motion } from "framer-motion";

interface FeatureCardProps {
  title: string;
  description: string;
  image: string;
  delay: number;
  href: string;
}

export default function FeatureCard({ title, description, image, delay, href }: FeatureCardProps) {
  return (
    <motion.div
      className="bg-sacred-white p-6 rounded-lg shadow-md border border-sacred-blue/20 transform hover:-translate-y-1 transition-all duration-300 overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ scale: 1.02 }}
    >
      <a href={href} className="block relative">
        {/* Sacred geometry overlay pattern */}
        <div className="absolute inset-0 w-full h-40 opacity-30 pointer-events-none z-10 mix-blend-overlay">
          <svg viewBox="0 0 100 100" className="w-full h-full text-sacred-blue">
            <circle cx="50" cy="50" r="48" fill="none" stroke="currentColor" strokeWidth="0.5" />
            <circle cx="50" cy="50" r="36" fill="none" stroke="currentColor" strokeWidth="0.5" />
            <circle cx="50" cy="50" r="24" fill="none" stroke="currentColor" strokeWidth="0.5" />
            <circle cx="50" cy="50" r="12" fill="none" stroke="currentColor" strokeWidth="0.5" />
          </svg>
        </div>
        
        {/* Image with gradient overlay */}
        <div className="relative h-40 mb-4 rounded overflow-hidden">
          <img 
            src={image} 
            alt={title} 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-sacred-blue/40 to-transparent"></div>
        </div>
        
        {/* Sacred divider */}
        <div className="flex items-center justify-center mb-3">
          <div className="h-px bg-sacred-blue/20 w-8"></div>
          <div className="mx-2">
            <svg width="12" height="12" viewBox="0 0 100 100" className="text-sacred-blue/40">
              <circle cx="50" cy="50" r="50" fill="currentColor" />
            </svg>
          </div>
          <div className="h-px bg-sacred-blue/20 w-8"></div>
        </div>
        
        <h3 className="font-cinzel text-sacred-blue text-xl mb-2 text-center">{title}</h3>
        <p className="font-raleway text-sacred-gray text-center">{description}</p>
      </a>
    </motion.div>
  );
}
