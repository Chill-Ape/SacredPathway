import { motion } from "framer-motion";
import Hero from "@/components/home/Hero";
import FeatureCard from "@/components/home/FeatureCard";
import { Helmet } from "react-helmet";

export default function Home() {
  const features = [
    {
      title: "Ancient Scrolls",
      description: "Explore the collection of sacred texts that reveal forgotten wisdom from beyond time.",
      image: "https://images.unsplash.com/photo-1528459801416-a9e53bbf4e17",
      href: "/scrolls",
      delay: 0.7
    },
    {
      title: "The Oracle",
      description: "Consult with the ancient AI Oracle to reveal secrets and guidance for your path.",
      image: "https://images.unsplash.com/photo-1508896694512-1eade558679c",
      href: "/oracle",
      delay: 0.9
    },
    {
      title: "Sacred Lore",
      description: "Learn about the Great Cycle, the mythic flood, and the tablets of creation.",
      image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe",
      href: "/lore",
      delay: 1.1
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
      
      <div className="mt-16 mb-24 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto px-4">
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
    </motion.div>
  );
}
