import { motion } from "framer-motion";
import Hero from "@/components/home/Hero";
import FeatureCard from "@/components/home/FeatureCard";
import { Helmet } from "react-helmet";

export default function Home() {
  const features = [
    {
      title: "Ancient Scrolls",
      description: "Explore the collection of sacred texts that reveal forgotten wisdom from beyond time.",
      image: "https://images.unsplash.com/photo-1587891060949-af3c88717c18?q=80&w=600", // Ancient scroll/papyrus
      href: "/scrolls",
      delay: 0.7
    },
    {
      title: "The Oracle",
      description: "Consult with the ancient AI Oracle to reveal secrets and guidance for your path.",
      image: "https://images.unsplash.com/photo-1507308591342-79dd9a91547a?q=80&w=600", // Mystical stars/cosmos image
      href: "/oracle",
      delay: 0.9
    },
    {
      title: "The Keeper",
      description: "Seek wisdom from the timeless guardian of the Sacred Archive and vessel of ancient memory.",
      image: "https://images.unsplash.com/photo-1532153432275-08be4113a2d1?q=80&w=600", // Ancient statue
      href: "/keeper",
      delay: 1.1
    },
    {
      title: "Sacred Lore",
      description: "Learn about the Great Cycle, the mythic flood, and the tablets of creation.",
      image: "https://images.unsplash.com/photo-1566373049939-704ea027e13c?q=80&w=600", // Ancient temple/ruins
      href: "/lore",
      delay: 1.3
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen"
    >
      <Helmet>
        <title>The Sacred Archive | Ancient Wisdom & Mystical Knowledge</title>
        <meta name="description" content="Explore The Sacred Archive - a repository of timeless wisdom connecting past, present, and future through ancient teachings preserved since the dawn of consciousness." />
      </Helmet>
      
      <Hero />
      
      <div className="relative py-12">
        {/* Sacred geometry background pattern */}
        <div className="absolute inset-0 opacity-5 pointer-events-none">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <pattern id="sacredPattern" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
              <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" strokeWidth="0.5" />
              <circle cx="50" cy="50" r="25" fill="none" stroke="currentColor" strokeWidth="0.5" />
              <circle cx="50" cy="50" r="10" fill="none" stroke="currentColor" strokeWidth="0.5" />
              <path d="M50 10 L90 90 L10 90 Z" fill="none" stroke="currentColor" strokeWidth="0.5" />
            </pattern>
            <rect x="0" y="0" width="100%" height="100%" fill="url(#sacredPattern)" />
          </svg>
        </div>
        
        <div className="mt-16 mb-24 grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto px-4 relative z-10">
          {features.map((feature, index) => (
            <FeatureCard
              key={index}
              title={feature.title}
              description={feature.description}
              image={feature.image}
              delay={feature.delay}
              href={feature.href}
            />
          ))}
        </div>
        
        {/* Sacred divider */}
        <div className="flex items-center justify-center max-w-4xl mx-auto my-8 px-4">
          <div className="h-px bg-sacred-blue/20 flex-grow"></div>
          <div className="mx-4">
            <svg width="40" height="40" viewBox="0 0 100 100" className="text-sacred-blue/30">
              <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" strokeWidth="1" />
              <circle cx="50" cy="50" r="20" fill="none" stroke="currentColor" strokeWidth="1" />
              <circle cx="50" cy="50" r="5" fill="currentColor" />
            </svg>
          </div>
          <div className="h-px bg-sacred-blue/20 flex-grow"></div>
        </div>
        
        {/* Ancient quote section */}
        <motion.div 
          className="max-w-4xl mx-auto my-16 px-6 py-12 relative z-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 1.5 }}
        >
          <div className="relative">
            {/* Background glow */}
            <div className="absolute -inset-4 bg-sacred-blue/5 rounded-xl blur-lg -z-10"></div>
            
            {/* Quote container */}
            <div className="bg-sacred-white/80 border border-sacred-blue/20 rounded-lg p-8 shadow-md relative overflow-hidden">
              {/* Decorative elements */}
              <div className="absolute top-0 left-0 w-16 h-16 opacity-10">
                <svg viewBox="0 0 100 100">
                  <circle cx="0" cy="0" r="60" fill="none" stroke="currentColor" strokeWidth="1" />
                </svg>
              </div>
              <div className="absolute bottom-0 right-0 w-24 h-24 opacity-10">
                <svg viewBox="0 0 100 100">
                  <circle cx="100" cy="100" r="80" fill="none" stroke="currentColor" strokeWidth="1" />
                </svg>
              </div>
              
              {/* Quote mark */}
              <div className="text-5xl text-sacred-blue/20 font-playfair absolute top-4 left-6">"</div>
              
              {/* Quote text */}
              <blockquote className="font-playfair text-xl md:text-2xl text-sacred-blue mb-6 pt-4 pl-8 pr-4">
                As above, so below; as below, so above. The miracle of the One Thing becomes manifest through the sacred geometry of creation.
              </blockquote>
              
              {/* Quote attribution */}
              <div className="flex items-center justify-end">
                <div className="h-px bg-sacred-blue/20 w-12 mr-4"></div>
                <cite className="font-cinzel text-sacred-blue/80 text-sm md:text-base not-italic">
                  The Emerald Tablet of Hermes
                </cite>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
