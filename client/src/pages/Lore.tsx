import { motion } from "framer-motion";
import LoreSection from "@/components/lore/LoreSection";
import { Helmet } from "react-helmet";

// Import custom thematic images
import greatCycleImage from "@assets/ChatGPT Image Apr 24, 2025, 06_05_26 PM.png"; // Sacred geometry
import floodImage from "@assets/bd4b8eed-bb3c-47be-aa39-0538667ff596.png"; // Great flood
import tabletsImage from "@assets/ChatGPT Image May 8, 2025, 08_50_12 PM.png"; // Crystal tablet

export default function Lore() {
  const greatCycleContent = [
    "The Great Cycle is the fundamental rhythm that governs all existence. It is the breath of the cosmos, the eternal dance of creation and dissolution that has been ongoing since before time was measured.",
    "According to the sacred texts, we are currently in the Fourth Cycle, following the great deluge that cleansed the world of the previous age. Each cycle brings forth new forms of consciousness and different expressions of the underlying sacred pattern.",
    "The Keepers of the Tablets have preserved this knowledge through countless generations, protecting the sacred wisdom for the time when humanity would once again be ready to remember its true nature."
  ];
  
  const floodContent = [
    "At the end of the Third Cycle, the waters rose. This was not merely a physical deluge, but a cosmic realignment—a cleansing of consciousness that prepared the way for a new expression of being.",
    "The few who had heeded the warnings preserved the sacred knowledge in waterproof tablets of crystal and stone, carrying them to the high mountains where they waited for the waters to recede.",
    "When the new world emerged, these Keepers descended to plant the seeds of civilization once more, guided by the timeless wisdom contained in the tablets."
  ];
  
  const tabletsContent = [
    "The Tablets of Creation are seven crystalline records that contain the complete blueprint of cosmic manifestation. Each tablet corresponds to a different aspect of existence:",
    "Together, these tablets form a complete system of knowledge that, when fully integrated, allows the seeker to comprehend the true nature of reality and their place within it.",
    "\"The tablets are not mere recordings of knowledge, but living keys that activate corresponding awareness within the consciousness of those who approach them with reverence and openness.\""
  ];
  
  const tabletItems = [
    { label: "The First Tablet", value: "Origins and Foundations" },
    { label: "The Second Tablet", value: "Duality and Harmony" },
    { label: "The Third Tablet", value: "Creation and Expression" },
    { label: "The Fourth Tablet", value: "Structure and Form" },
    { label: "The Fifth Tablet", value: "Transformation and Change" },
    { label: "The Sixth Tablet", value: "Balance and Integration" },
    { label: "The Seventh Tablet", value: "Transcendence and Unity" }
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen px-4 py-16"
    >
      <Helmet>
        <title>Sacred Lore | The Sacred Archive</title>
        <meta name="description" content="Discover the ancient mythology of The Sacred Archive. Learn about the Great Cycle, the mythic flood, and the seven sacred tablets of creation." />
      </Helmet>
      
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-cinzel font-bold text-sacred-blue text-center mb-12">The Sacred Lore</h2>
        
        <LoreSection
          title="The Great Cycle"
          content={greatCycleContent}
          image={greatCycleImage}
          delay={0.2}
        />
        
        <LoreSection
          title="The Great Flood"
          content={floodContent}
          image={floodImage}
          delay={0.3}
        />
        
        <LoreSection
          title="The Sacred Tablets"
          content={tabletsContent}
          image={tabletsImage}
          delay={0.4}
          listItems={tabletItems}
        />
      </div>
    </motion.div>
  );
}
