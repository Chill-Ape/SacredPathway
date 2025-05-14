import { useEffect, useState } from "react";
import { useLocation, Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { ArrowLeft, Lock, Eye, KeyRound, Check } from "lucide-react";
import { Helmet } from "react-helmet";
import { Scroll } from "@shared/schema";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useAuth } from "@/hooks/use-auth";

const categories = {
  artifacts: {
    title: "Artifacts",
    description: "Ancient devices of mysterious origin and purpose, preserved from before the great cataclysm.",
    emptyMessage: "You do not have access. Acquire the Golden Key.",
    itemName: "artifact",
    titlePrefix: "The",
    customItems: [
      {
        id: "crystalline-resonator",
        title: "The Crystalline Resonator",
        description: "A remarkable crystal with unusual vibrational properties that appears to amplify certain frequencies.",
        isLocked: true,
        key: "CRYSTAL_FREQUENCY",
        image: "/assets/content-types/crystal_artifact.jpg"
      }
    ]
  },
  tablets: {
    title: "Tablets",
    description: "Stone and crystal tablets containing encoded knowledge from prehistoric civilizations.",
    emptyMessage: "No tablets have been discovered yet.",
    itemName: "tablet",
    titlePrefix: "The",
    customItems: [
      {
        id: "crystal-tablet-of-enki",
        title: "Crystal Tablet of Enki",
        description: "A transparent crystalline tablet containing vibration-encoded data from the antediluvian era.",
        isLocked: true,
        key: "ENKI",
        image: "/assets/tablets/crystal_tablet.png"
      },
      {
        id: "emerald-tablet-1",
        title: "Emerald Tablet of the 3rd Sage (Part 1)",
        description: "First fragment of the fabled emerald tablet, containing alchemical wisdom.",
        isLocked: true,
        key: "HERMES",
        image: "/assets/tablets/emerald_tablets.png"
      },
      {
        id: "clay-tablet-of-adam",
        title: "Clay Tablet of Adam",
        description: "Ancient tablet detailing the origin of consciousness in humanity.",
        isLocked: true,
        key: "GENESIS",
        image: "/assets/tablets/stone_tablet.png"
      }
    ]
  },
  scrolls: {
    title: "Scrolls",
    description: "Preserved parchments containing wisdom passed down through secret societies.",
    emptyMessage: "No scrolls have been discovered yet.",
    itemName: "scroll",
    titlePrefix: "",
    customItems: []
  },
  books: {
    title: "Books",
    description: "Ancient tomes documenting stories and teachings from various ages of humanity.",
    emptyMessage: "No books have been discovered yet.",
    itemName: "book",
    titlePrefix: "The",
    customItems: [
      {
        id: "age-of-leo",
        title: "A Tale from the Age of Leo",
        description: "Chronicles from the forgotten era when Leo ruled the celestial sphere.",
        isLocked: true,
        key: "LEO",
        image: "/assets/ChatGPT Image Apr 24, 2025, 06_05_26 PM.png"
      },
      {
        id: "age-of-taurus",
        title: "A Tale from the Age of Taurus",
        description: "Wisdom from the time when the Bull governed the cosmic order.",
        isLocked: true,
        key: "TAURUS",
        image: "/assets/ChatGPT Image Apr 24, 2025, 06_05_26 PM.png"
      },
      {
        id: "age-of-pisces",
        title: "A Tale from the Age of Pisces",
        description: "The story of the Fish and the transition to our current age.",
        isLocked: true,
        key: "PISCES",
        image: "/assets/ChatGPT Image Apr 24, 2025, 06_05_26 PM.png"
      },
      {
        id: "epic-of-flood",
        title: "The Epic of the Flood",
        description: "The definitive account of the great cataclysm that reshaped our world.",
        isLocked: true,
        key: "DELUGE",
        image: "/assets/ChatGPT Image Apr 24, 2025, 06_05_26 PM.png"
      },
      {
        id: "seven-sages",
        title: "The Seven Sages",
        description: "Biographies of the seven masters who preserved knowledge through the darkness.",
        isLocked: true,
        key: "SEVEN",
        image: "/assets/ChatGPT Image Apr 24, 2025, 06_05_26 PM.png"
      }
    ]
  }
};

// Type for items from database
type CategoryItem = {
  id: number;
  title: string;
  image: string;
  isLocked: boolean;
  type: string;
  content?: string;
  key?: string | null;
};

// Type for custom (hardcoded) items
type CustomItem = {
  id: string;
  title: string;
  description: string;
  image: string;
  isLocked: boolean;
  key: string;
  content?: string;
};

// Combined type
type DisplayItem = CategoryItem | CustomItem;

// Schema for unlock form
const unlockSchema = z.object({
  key: z.string().min(1, "Please enter a key phrase"),
});

// Detailed content dialog component
const ContentDialog = ({ 
  item, 
  isOpen, 
  onClose,
  onUnlock
}: { 
  item: DisplayItem | null; 
  isOpen: boolean; 
  onClose: () => void;
  onUnlock: (key: string) => void;
}) => {
  const [showUnlockForm, setShowUnlockForm] = useState(false);
  const { user } = useAuth();
  const form = useForm<z.infer<typeof unlockSchema>>({
    resolver: zodResolver(unlockSchema),
    defaultValues: {
      key: "",
    },
  });

  // Reset form when dialog opens/closes
  useEffect(() => {
    if (!isOpen) {
      form.reset();
      setShowUnlockForm(false);
    }
  }, [isOpen, form]);

  // Handle unlock submission
  const onSubmit = (values: z.infer<typeof unlockSchema>) => {
    onUnlock(values.key);
  };

  if (!item) return null;

  const isDbItem = 'type' in item;
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-2xl bg-black/95 border-amber-900/30 text-amber-100">
        <DialogHeader>
          <DialogTitle className="text-2xl font-serif text-amber-100 text-center">
            {item.title}
          </DialogTitle>
          <DialogDescription className="text-amber-200/80 text-center">
            {isDbItem ? 'Ancient wisdom awaits...' : item.description}
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex flex-col space-y-4">
          <div className="relative mx-auto w-full max-w-sm h-64 overflow-hidden rounded-md">
            <img 
              src={item.image} 
              alt={item.title} 
              className="w-full h-full object-cover object-center"
            />
            {item.isLocked && (
              <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center">
                <Lock className="w-10 h-10 text-amber-300/70 mb-2" />
                <p className="text-amber-200 text-center px-4">
                  This {isDbItem ? item.type : categories[item.id.includes('tablet') ? 'tablets' : 
                               item.id.includes('scroll') ? 'scrolls' : 
                               item.id.includes('book') ? 'books' : 'artifacts'].itemName} is sealed.
                </p>
              </div>
            )}
          </div>
          
          {item.isLocked ? (
            <>
              {showUnlockForm ? (
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="key"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <div className="flex items-center space-x-2">
                              <Input 
                                placeholder="Enter the key phrase..." 
                                className="bg-black/50 border-amber-900/50 text-amber-100 focus-visible:ring-amber-500/50"
                                {...field} 
                              />
                              <Button 
                                type="submit" 
                                className="bg-amber-900/80 hover:bg-amber-800 text-amber-100"
                              >
                                <KeyRound className="w-4 h-4 mr-2" />
                                Unlock
                              </Button>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </form>
                </Form>
              ) : (
                <div className="flex justify-center space-x-2">
                  {user ? (
                    <Button 
                      onClick={() => setShowUnlockForm(true)}
                      className="bg-amber-900/80 hover:bg-amber-800 text-amber-100"
                    >
                      <KeyRound className="w-4 h-4 mr-2" />
                      Enter Key Phrase
                    </Button>
                  ) : (
                    <Link href="/auth">
                      <Button 
                        className="bg-amber-900/80 hover:bg-amber-800 text-amber-100"
                      >
                        <KeyRound className="w-4 h-4 mr-2" />
                        Sign In to Unlock
                      </Button>
                    </Link>
                  )}
                </div>
              )}
            </>
          ) : (
            <div className="flex justify-center">
              <Link href={isDbItem ? `/scrolls/${item.id}` : `/ark/${item.id}`}>
                <Button className="bg-amber-900/80 hover:bg-amber-800 text-amber-100">
                  <Eye className="w-4 h-4 mr-2" />
                  View Full Content
                </Button>
              </Link>
            </div>
          )}
          
          {!item.isLocked && isDbItem && item.content && (
            <div className="mt-4 p-4 bg-black/40 rounded-md border border-amber-900/30 max-h-60 overflow-y-auto">
              <p className="text-amber-200/90 text-sm font-serif leading-relaxed">
                {item.content.slice(0, 300)}...
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

// Category item card component
const CategoryItemCard = ({ 
  item, 
  categoryType,
  onClick 
}: { 
  item: DisplayItem; 
  categoryType: string;
  onClick: () => void;
}) => {
  return (
    <motion.div
      whileHover={{ 
        scale: 1.03,
        transition: { duration: 0.2 }
      }}
      className="h-full"
    >
      <Card 
        className="cursor-pointer h-full bg-black/40 backdrop-blur-sm border border-amber-900/30 overflow-hidden relative group"
        onClick={onClick}
      >
        {/* Golden glow on hover */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none bg-gradient-to-r from-amber-500/5 via-amber-500/10 to-amber-500/5"></div>
        
        {/* Image container */}
        <div className="overflow-hidden aspect-[4/3] relative">
          <img 
            src={item.image} 
            alt={item.title}
            className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
          />
          
          {/* Locked overlay */}
          {item.isLocked && (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
              <div className="w-12 h-12 rounded-full bg-black/60 flex items-center justify-center">
                <Lock className="w-5 h-5 text-amber-300/80" />
              </div>
            </div>
          )}
        </div>
        
        {/* Content */}
        <CardContent className="p-4">
          <h3 className="text-xl font-serif text-amber-100 mb-2 tracking-wide group-hover:text-amber-200 transition-colors">{item.title}</h3>
          <p className="text-amber-200/70 text-sm font-serif line-clamp-2">
            {'description' in item ? item.description : 'Ancient wisdom awaits...'}
          </p>
        </CardContent>
        
        <CardFooter className="px-4 pb-4 pt-0 flex justify-between items-center">
          <div className="text-xs text-amber-500/70 font-serif italic">
            {item.isLocked ? 'Locked' : 'Accessible'}
          </div>
          <Button variant="ghost" size="sm" className="text-amber-200 hover:text-amber-100 hover:bg-amber-950/40 p-0 w-8 h-8">
            {item.isLocked ? 
              <KeyRound className="w-4 h-4" /> : 
              <Eye className="w-4 h-4" />
            }
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
};

export default function ArkCategoryPage({ category }: { category: "artifacts" | "tablets" | "scrolls" | "books" }) {
  const [, setLocation] = useLocation();
  const [dbItems, setDbItems] = useState<CategoryItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<DisplayItem | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Get database items 
  const { isLoading, data: scrollsData } = useQuery<Scroll[]>({
    queryKey: ["/api/scrolls"],
    staleTime: 60000,
  });

  // Get user's unlocked scrolls
  const { data: userScrolls } = useQuery<Scroll[]>({
    queryKey: ["/api/user/scrolls"],
    staleTime: 60000,
    enabled: !!user,
  });

  // Check if a scroll is unlocked by the user
  const isScrollUnlocked = (scrollId: number) => {
    if (!userScrolls) return false;
    return userScrolls.some(scroll => scroll.id === scrollId);
  };

  // Unlock mutation
  const unlockMutation = useMutation({
    mutationFn: async ({ 
      itemId, 
      key, 
      isDbItem 
    }: { 
      itemId: number | string; 
      key: string;
      isDbItem: boolean;
    }) => {
      if (isDbItem && typeof itemId === 'number') {
        const res = await apiRequest("POST", `/api/scrolls/${itemId}/unlock`, { key });
        return await res.json();
      } else {
        // Custom handling for non-DB items
        // For now, just check if key matches (in real app would verify on server)
        const customItem = getCustomItems().find(item => item.id === itemId);
        if (!customItem || customItem.key !== key) {
          throw new Error("Incorrect key phrase");
        }
        return { success: true };
      }
    },
    onSuccess: () => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ["/api/user/scrolls"] });
      queryClient.invalidateQueries({ queryKey: ["/api/scrolls"] });
      
      // If selected item is a DB item, update its locked status
      if (selectedItem && 'type' in selectedItem) {
        setSelectedItem({
          ...selectedItem,
          isLocked: false,
        });
      } else if (selectedItem) {
        // For custom items
        setSelectedItem({
          ...selectedItem,
          isLocked: false,
        });
      }
      
      toast({
        title: "Success!",
        description: "You have unlocked this content.",
        variant: "default",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Unlock failed",
        description: error.message || "Incorrect key phrase. Try again.",
        variant: "destructive",
      });
    },
  });

  // Handle unlock attempt
  const handleUnlock = (key: string) => {
    if (!selectedItem) return;
    
    const isDbItem = 'type' in selectedItem;
    unlockMutation.mutate({ 
      itemId: selectedItem.id, 
      key,
      isDbItem 
    });
  };

  // Process DB items
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
          content: scroll.content,
          image: scroll.image,
          isLocked: user ? !isScrollUnlocked(scroll.id) : scroll.isLocked,
          type: scroll.type || 'scroll', // Provide default if null
          key: scroll.key
        }));
      setDbItems(filteredItems);
    }
  }, [scrollsData, category, userScrolls, user]);

  // Get custom items for the current category
  const getCustomItems = (): CustomItem[] => {
    if (category === "artifacts" && categories.artifacts.customItems) {
      return categories.artifacts.customItems;
    } else if (category === "tablets" && categories.tablets.customItems) {
      return categories.tablets.customItems;
    } else if (category === "scrolls" && categories.scrolls.customItems) {
      return categories.scrolls.customItems;
    } else if (category === "books" && categories.books.customItems) {
      return categories.books.customItems;
    }
    return [];
  };

  // All items to display (DB + custom)
  const allItems: DisplayItem[] = [...dbItems, ...getCustomItems()];

  // Animation variants
  const contentVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.1,
        delayChildren: 0.2,
      }
    }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6 }
    }
  };

  const seoTitle = `${categories[category].title} | Ark Contents`;
  const seoDescription = `Explore ancient ${categories[category].title.toLowerCase()} containing forgotten wisdom and cosmic secrets.`;

  return (
    <div className="min-h-screen bg-[url('/assets/ark-background.jpg')] bg-cover bg-fixed">
      <Helmet>
        <title>{seoTitle}</title>
        <meta name="description" content={seoDescription} />
      </Helmet>
      
      {/* Background overlay */}
      <div className="absolute inset-0 bg-black/60 z-0"></div>
      
      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 py-10">
        <div className="mb-12 text-center">
          <Button
            variant="ghost"
            className="mb-6 text-amber-100 hover:text-amber-200 hover:bg-black/20 mx-auto flex items-center px-4 py-2 rounded-full border border-amber-900/30 bg-black/30 backdrop-blur-sm"
            onClick={() => setLocation("/ark")}
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Return to Ark Contents
          </Button>
          
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-5xl font-cormorant text-amber-100 mb-4 tracking-wider"
          >
            {categories[category].title}
          </motion.h1>
          
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.8 }}  
            className="h-[1px] w-20 bg-gradient-to-r from-transparent via-amber-500/70 to-transparent mx-auto mb-6"
          />
          
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="text-amber-200/80 text-lg max-w-3xl mx-auto font-cormorant"
          >
            {categories[category].description}
          </motion.p>
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
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 mb-12"
            variants={contentVariants}
            initial="hidden"
            animate="visible"
          >
            {allItems.length > 0 ? (
              allItems.map((item, index) => (
                <motion.div key={'type' in item ? item.id : item.id} variants={itemVariants}>
                  <CategoryItemCard 
                    item={item} 
                    categoryType={category}
                    onClick={() => {
                      setSelectedItem(item);
                      setIsDialogOpen(true);
                    }}
                  />
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
      
      {/* Detail dialog */}
      <ContentDialog 
        item={selectedItem} 
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onUnlock={handleUnlock}
      />
    </div>
  );
}