import { useState } from "react";
import { motion } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import ScrollCard from "@/components/scrolls/ScrollCard";
import { Scroll } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Helmet } from "react-helmet";
import { useAuth } from "@/hooks/use-auth";
import { useUserScrolls } from "@/hooks/use-user-scrolls";

export default function Scrolls() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { unlockScroll, isUnlocking } = useUserScrolls();
  
  // Fetch all scrolls
  const { data: scrolls = [], isLoading } = useQuery<Scroll[]>({ 
    queryKey: ["/api/scrolls"]
  });
  
  const handleUnlockScroll = async (scrollId: number, key: string): Promise<boolean> => {
    try {
      // We now only allow authenticated users to unlock scrolls
      // The UI has been updated to prompt users to create an account
      if (user) {
        unlockScroll({ scrollId, key });
        return true;
      } else {
        // Redirect non-authenticated users to auth page (handled in UI)
        toast({
          title: "Authentication Required",
          description: "You must create an account to unlock scrolls and track your progress.",
        });
        return false;
      }
    } catch (error: any) {
      toast({
        title: "Unlocking Failed",
        description: error.message || "Failed to unlock scroll",
        variant: "destructive",
      });
      return false;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen px-4 py-16"
    >
      <Helmet>
        <title>Ark Contents | The Akashic Archive</title>
        <meta name="description" content="Explore ancient tablets, artifacts, scrolls, and books containing wisdom from ages past. Discover accessible knowledge and unlock sealed mysteries in The Akashic Archive." />
      </Helmet>
      
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-cinzel font-bold text-sacred-blue text-center mb-12">Ark Contents</h2>
        
        <div className="mb-8 font-raleway text-sacred-gray text-center max-w-2xl mx-auto">
          <p>Explore the ancient artifacts, tablets, scrolls, and books containing wisdom from ages past. Some items are available to all seekers, while others will be revealed only to those who have proven their dedication to the path.</p>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-pulse font-cinzel text-sacred-blue">
              <p>Retrieving ark contents...</p>
            </div>
          </div>
        ) : (
          <div className="space-y-16">
            {/* Tablets Section */}
            <div>
              <h3 className="text-2xl font-cinzel text-sacred-blue mb-6 border-b border-sacred-blue/20 pb-2">Ancient Tablets</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {scrolls && [...scrolls]
                  .filter(item => item.type === 'tablet')
                  .sort((a, b) => {
                    // Sort by locked status (unlocked first)
                    if (a.isLocked && !b.isLocked) return 1;
                    if (!a.isLocked && b.isLocked) return -1;
                    // Then by title
                    return a.title.localeCompare(b.title);
                  })
                  .map((scroll) => (
                    <ScrollCard 
                      key={scroll.id} 
                      scroll={scroll} 
                      onUnlock={handleUnlockScroll} 
                    />
                  ))
                }
                {scrolls.filter(item => item.type === 'tablet').length === 0 && (
                  <div className="col-span-full text-center text-sacred-gray py-8">
                    <p>No tablets discovered yet. Continue your journey to uncover more.</p>
                  </div>
                )}
              </div>
            </div>
            
            {/* Artifacts Section */}
            <div>
              <h3 className="text-2xl font-cinzel text-sacred-blue mb-6 border-b border-sacred-blue/20 pb-2">Sacred Artifacts</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {scrolls && [...scrolls]
                  .filter(item => item.type === 'artifact')
                  .sort((a, b) => {
                    // Sort by locked status (unlocked first)
                    if (a.isLocked && !b.isLocked) return 1;
                    if (!a.isLocked && b.isLocked) return -1;
                    // Then by title
                    return a.title.localeCompare(b.title);
                  })
                  .map((scroll) => (
                    <ScrollCard 
                      key={scroll.id} 
                      scroll={scroll} 
                      onUnlock={handleUnlockScroll} 
                    />
                  ))
                }
                {scrolls.filter(item => item.type === 'artifact').length === 0 && (
                  <div className="col-span-full text-center text-sacred-gray py-8">
                    <p>No artifacts discovered yet. Continue your journey to uncover more.</p>
                  </div>
                )}
              </div>
            </div>
            
            {/* Scrolls Section */}
            <div>
              <h3 className="text-2xl font-cinzel text-sacred-blue mb-6 border-b border-sacred-blue/20 pb-2">Ancient Scrolls</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {scrolls && [...scrolls]
                  .filter(item => item.type === 'scroll')
                  .sort((a, b) => {
                    // Welcome to the Archive always first
                    if (a.title === "Welcome to the Archive") return -1;
                    if (b.title === "Welcome to the Archive") return 1;
                    // Then sort by locked status (unlocked first)
                    if (a.isLocked && !b.isLocked) return 1;
                    if (!a.isLocked && b.isLocked) return -1;
                    // Then by title
                    return a.title.localeCompare(b.title);
                  })
                  .map((scroll) => (
                    <ScrollCard 
                      key={scroll.id} 
                      scroll={scroll} 
                      onUnlock={handleUnlockScroll} 
                    />
                  ))
                }
                {scrolls.filter(item => item.type === 'scroll').length === 0 && (
                  <div className="col-span-full text-center text-sacred-gray py-8">
                    <p>No scrolls discovered yet. Continue your journey to uncover more.</p>
                  </div>
                )}
              </div>
            </div>
            
            {/* Books Section */}
            <div>
              <h3 className="text-2xl font-cinzel text-sacred-blue mb-6 border-b border-sacred-blue/20 pb-2">Mystical Books</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {scrolls && [...scrolls]
                  .filter(item => item.type === 'book')
                  .sort((a, b) => {
                    // Sort by locked status (unlocked first)
                    if (a.isLocked && !b.isLocked) return 1;
                    if (!a.isLocked && b.isLocked) return -1;
                    // Then by title
                    return a.title.localeCompare(b.title);
                  })
                  .map((scroll) => (
                    <ScrollCard 
                      key={scroll.id} 
                      scroll={scroll} 
                      onUnlock={handleUnlockScroll} 
                    />
                  ))
                }
                {scrolls.filter(item => item.type === 'book').length === 0 && (
                  <div className="col-span-full text-center text-sacred-gray py-8">
                    <p>No books discovered yet. Continue your journey to uncover more.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
