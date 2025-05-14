import React from 'react';
import { Link } from 'wouter';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { BookOpen, Scroll, Database, FlaskConical } from 'lucide-react';

// Use direct paths to public assets that we know exist
const tabletImage = '/assets/test/tablet.jpg';
const scrollImage = '/assets/test/scroll.jpg';
const bookImage = '/assets/test/book.png';
const artifactImage = '/assets/test/artifact.png';

// Create a simple card component for each category
const CategoryCard = ({ 
  title, 
  description, 
  icon: Icon, 
  image, 
  href 
}: { 
  title: string;
  description: string;
  icon: React.ElementType;
  image: string;
  href: string;
}) => {
  return (
    <motion.div
      whileHover={{ scale: 1.03 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="h-full overflow-hidden border-amber-200 bg-amber-50/80">
        <div className="aspect-[16/9] w-full overflow-hidden">
          <img 
            src={image} 
            alt={title} 
            className="h-full w-full object-cover transition-all duration-300 hover:scale-105"
            onError={(e) => {
              console.error("Image failed to load:", image);
              e.currentTarget.src = 'https://placehold.co/600x400/e2e8f0/1e293b?text=Image+Unavailable';
            }} 
          />
        </div>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Icon className="h-5 w-5 text-amber-700" />
            <CardTitle className="text-xl font-serif text-amber-800">{title}</CardTitle>
          </div>
          <CardDescription className="text-amber-700/80 font-serif">{description}</CardDescription>
        </CardHeader>
        <CardFooter>
          <Button 
            variant="default" 
            className="w-full bg-amber-700 hover:bg-amber-800"
            asChild
          >
            <Link href={href}>
              <span>Explore</span>
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
};

export default function ArkContentsTest() {
  const categories = [
    {
      title: "Ancient Tablets",
      description: "Stone and crystal tablets containing encoded knowledge from prehistoric civilizations.",
      icon: Database,
      image: tabletImage,
      href: "/ark/tablets",
    },
    {
      title: "Sacred Scrolls",
      description: "Preserved parchments containing wisdom passed down through secret societies.",
      icon: Scroll,
      image: scrollImage,
      href: "/ark/scrolls",
    },
    {
      title: "Forgotten Books",
      description: "Bound manuscripts detailing cosmic principles and histories of lost civilizations.",
      icon: BookOpen,
      image: bookImage,
      href: "/ark/books",
    },
    {
      title: "Arcane Artifacts",
      description: "Physical objects of unknown origin, potentially exhibiting metaphysical properties.",
      icon: FlaskConical,
      image: artifactImage,
      href: "/ark/artifacts",
    },
  ];

  return (
    <div className="container mx-auto py-12 px-4 md:px-6">
      <Helmet>
        <title>The Ark Contents | Akashic Archive</title>
        <meta name="description" content="Browse the collections of tablets, scrolls, books, and artifacts containing ancient wisdom from beyond recorded history." />
      </Helmet>
      <div className="mb-12 text-center">
        <h1 className="text-4xl font-serif font-medium text-amber-900 mb-4">The Ark Contents</h1>
        <p className="text-amber-700/80 font-serif max-w-3xl mx-auto">
          Browse the collections of tablets, scrolls, books, and artifacts containing ancient wisdom from beyond recorded history.
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {categories.map((category, index) => (
          <CategoryCard 
            key={index}
            title={category.title}
            description={category.description}
            icon={category.icon}
            image={category.image}
            href={category.href}
          />
        ))}
      </div>
    </div>
  );
}