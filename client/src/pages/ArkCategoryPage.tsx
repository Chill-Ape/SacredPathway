import { useEffect, useState } from "react";
import { useLocation, Link } from "wouter";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { Helmet } from "react-helmet";
import { Scroll } from "@shared/schema";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";

const categories = {
  artifacts: {
    title: "Artifacts",
    description: "Ancient devices of mysterious origin and purpose, preserved from before the great cataclysm.",
    emptyMessage: "You do not have access. Acquire the Golden Key."
  },
  tablets: {
    title: "Tablets",
    description: "Stone and crystal tablets containing encoded knowledge from prehistoric civilizations.",
    emptyMessage: "No tablets have been discovered yet."
  },
  scrolls: {
    title: "Scrolls",
    description: "Preserved parchments containing wisdom passed down through secret societies.",
    emptyMessage: "No scrolls have been discovered yet."
  },
  books: {
    title: "Books",
    description: "Ancient tomes documenting stories and teachings from various ages of humanity.",
    emptyMessage: "No books have been discovered yet."
  }
};

type CategoryItem = {
  id: number;
  title: string;
  image: string;
  isLocked: boolean;
  type: string;
};

export default function ArkCategoryPage({ category }: { category: "artifacts" | "tablets" | "scrolls" | "books" }) {
  const [, setLocation] = useLocation();
  const [items, setItems] = useState<CategoryItem[]>([]);
  
  const { isLoading, data: scrollsData } = useQuery<Scroll[]>({
    queryKey: ["/api/scrolls"],
    staleTime: 60000,
  });

  useEffect(() => {
    if (scrollsData) {
      // Filter scrolls by the specified category type
      const filteredItems = scrollsData
        .filter(scroll => {
          // Handle null type by using a default
          const scrollType = scroll.type || 'scroll';
          return scrollType === category.slice(0, -1);
        })
        .map(scroll => ({
          id: scroll.id,
          title: scroll.title,
          image: scroll.image,
          isLocked: scroll.isLocked,
          type: scroll.type || 'scroll' // Provide default if null
        }));
      setItems(filteredItems);
    }
  }, [scrollsData, category]);

  const contentVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        staggerChildren: 0.1,
        delayChildren: 0.2,
      }
    }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  const seoTitle = `${categories[category].title} | Ark Contents`;
  const seoDescription = `Explore ancient ${categories[category].title.toLowerCase()} containing forgotten wisdom and cosmic secrets.`;

  return (
    <div className="min-h-screen bg-[url('/assets/parchment_dark.jpg')] bg-cover">
      <Helmet>
        <title>{seoTitle}</title>
        <meta name="description" content={seoDescription} />
      </Helmet>
      <div className="container mx-auto px-4 py-10">
        <div className="mb-8">
          <Button
            variant="ghost"
            className="mb-4 text-amber-100 hover:text-amber-200 hover:bg-black/20"
            onClick={() => setLocation("/ark")}
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Ark Contents
          </Button>
          <h1 className="text-5xl font-serif text-amber-100 mb-2">{categories[category].title}</h1>
          <p className="text-amber-200/80 text-lg max-w-3xl">
            {categories[category].description}
          </p>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-amber-200" />
          </div>
        ) : category === "artifacts" ? (
          <div className="flex flex-col items-center justify-center h-64 border border-amber-800/30 rounded-lg bg-black/40 backdrop-blur-sm">
            <p className="text-amber-200 text-xl font-serif text-center px-4">
              {categories[category].emptyMessage}
            </p>
          </div>
        ) : (
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12"
            variants={contentVariants}
            initial="hidden"
            animate="visible"
          >
            {items.length > 0 ? (
              items.map((item) => (
                <motion.div key={item.id} variants={itemVariants}>
                  <Link href={`/scrolls/${item.id}`}>
                    <Card className="cursor-pointer h-full bg-card/30 backdrop-blur-sm border-[#493e2d]/60 overflow-hidden group relative">
                      <div className="overflow-hidden p-2 h-48 relative">
                        <img 
                          src={item.image} 
                          alt={item.title}
                          className="w-full h-full object-cover object-center rounded-md transition-transform duration-500 group-hover:scale-105"
                        />
                        {item.isLocked && (
                          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                            <span className="text-amber-100 text-lg font-serif">Locked</span>
                          </div>
                        )}
                      </div>
                      <CardContent className="text-center p-4 bg-gradient-to-b from-[#1a1a1a]/50 to-[#000]/50">
                        <h3 className="text-amber-100 font-serif text-xl tracking-wide">{item.title}</h3>
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>
              ))
            ) : (
              <div className="col-span-full flex flex-col items-center justify-center h-64 border border-amber-800/30 rounded-lg bg-black/40 backdrop-blur-sm">
                <p className="text-amber-200 text-xl font-serif text-center px-4">
                  {categories[category].emptyMessage}
                </p>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}