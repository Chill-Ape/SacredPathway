import { useState } from "react";
import { useLocation, Link } from "wouter";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { Helmet } from "react-helmet";

const CategoryCard = ({ 
  title, 
  imagePath, 
  description, 
  linkTo 
}: { 
  title: string; 
  imagePath: string; 
  description: string; 
  linkTo: string; 
}) => {
  return (
    <motion.div
      whileHover={{ 
        scale: 1.05,
        boxShadow: "0 0 15px rgba(168, 170, 245, 0.7)"
      }}
      className="h-full"
    >
      <Link href={linkTo}>
        <Card className="cursor-pointer h-full bg-card/30 backdrop-blur-sm border-[#493e2d]/60 overflow-hidden relative group">
          <div className="absolute inset-0 bg-gradient-to-br from-[#ead7aa]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <div className="overflow-hidden p-2 h-56 relative">
            <img 
              src={imagePath} 
              alt={title}
              className="w-full h-full object-cover object-center rounded-md transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end p-3">
              <span className="text-white font-serif text-lg">{description}</span>
            </div>
          </div>
          <CardContent className="text-center p-4 bg-gradient-to-b from-[#1a1a1a]/50 to-[#000]/50">
            <h3 className="text-amber-100 font-serif text-2xl tracking-wide mb-1">{title}</h3>
          </CardContent>
        </Card>
      </Link>
    </motion.div>
  );
};

export default function ArkContents() {
  const [, setLocation] = useLocation();

  const categories = [
    {
      id: "artifacts",
      title: "Artifacts",
      description: "Ancient devices of mysterious origin",
      imagePath: "/assets/content-types/crystal_artifact.jpg", 
      linkTo: "/ark/artifacts"
    },
    {
      id: "tablets",
      title: "Tablets",
      description: "Stone records of forbidden knowledge",
      imagePath: "/assets/content-types/ancient_tablet.png",
      linkTo: "/ark/tablets"
    },
    {
      id: "scrolls",
      title: "Scrolls",
      description: "Parchments containing arcane wisdom",
      imagePath: "/assets/content-types/enchanted_scroll.jpg",
      linkTo: "/ark/scrolls"
    },
    {
      id: "books",
      title: "Books",
      description: "Tomes of collected mystical teachings",
      imagePath: "/assets/ChatGPT Image Apr 24, 2025, 06_05_26 PM.png",
      linkTo: "/ark/books"
    }
  ];

  return (
    <div className="min-h-screen bg-[url('/assets/parchment_dark.jpg')] bg-cover">
      <Helmet>
        <title>Ark Contents | Akashic Archive</title>
        <meta name="description" content="Explore the Ark Contents - ancient artifacts, tablets, scrolls, and books containing forgotten wisdom and cosmic secrets." />
      </Helmet>
      
      <div className="container mx-auto px-4 py-10">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <Button
              variant="ghost"
              className="mb-4 text-amber-100 hover:text-amber-200 hover:bg-black/20"
              onClick={() => setLocation("/")}
            >
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Home
            </Button>
            <h1 className="text-5xl md:text-6xl text-amber-100 font-serif mb-2">Ark Contents</h1>
            <p className="text-amber-200/80 text-lg md:text-xl max-w-2xl">
              The Ark safeguards remnants of antediluvian wisdom in various forms. Select a category to explore.
            </p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {categories.map((category) => (
            <CategoryCard
              key={category.id}
              title={category.title}
              imagePath={category.imagePath}
              description={category.description}
              linkTo={category.linkTo}
            />
          ))}
        </div>
      </div>
    </div>
  );
}