import { motion } from "framer-motion";
import Hero from "@/components/home/Hero";
import FeatureCard from "@/components/home/FeatureCard";
import { Helmet } from "react-helmet";

// Import custom images
import ancientTabletDark from "@assets/ChatGPT Image May 10, 2025, 05_25_40 PM.png";
import keeperImage from "@assets/ChatGPT Image Apr 24, 2025, 06_22_14 PM.png";
import loreImage from "@assets/ChatGPT Image Apr 24, 2025, 06_05_26 PM.png";
import simulationImage from "@assets/ChatGPT Image May 10, 2025, 05_27_25 PM.png";

export default function Home() {
  const features = [
    {
      title: "Ark Contents",
      description: "Explore the collection of sacred artifacts, tablets, scrolls, and books containing forgotten wisdom.",
      image: ancientTabletDark, // Ancient tablet with engraved text
      href: "/ark-contents",
      delay: 0.7
    },
    {
      title: "The Oracle",
      description: "Seek guidance from the mystical Oracle, connected to the cosmic memory of all that was and will be.",
      image: keeperImage, // Using the same image for now
      href: "/oracle",
      delay: 0.9
    },
    {
      title: "Sacred Lore",
      description: "Learn about the Great Cycle, the mythic flood, and the tablets of creation.",
      image: loreImage, // Sacred geometry symbol
      href: "/lore",
      delay: 1.1
    },
    {
      title: "The Simulation",
      description: "Enter a real-time memory interface where you can gather Mana through sacred rituals and quests.",
      image: simulationImage, // Simulation interface image
      href: "/simulation",
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
        <title>The Akashic Archive | Ancient Wisdom & Mystical Knowledge</title>
        <meta name="description" content="Explore The Akashic Archive - a repository of timeless wisdom connecting past, present, and future through ancient teachings preserved since the dawn of consciousness." />
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
        
        <div className="mt-16 mb-24 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto px-4 relative z-10">
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
