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
      // If the user is authenticated, use the user-specific unlock method
      if (user) {
        unlockScroll({ scrollId, key });
        return true;
      } else {
        // For non-authenticated users, use the regular unlock method
        const response = await apiRequest("POST", `/api/scrolls/${scrollId}/unlock`, { key });
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Failed to unlock scroll");
        }
        
        // Refresh the scrolls list
        queryClient.invalidateQueries({ queryKey: ["/api/scrolls"] });
        
        toast({
          title: "Scroll Unlocked",
          description: "The ancient knowledge has been revealed to you. Create an account to save your progress!",
        });
        
        return true;
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
        <title>Sacred Scrolls | The Sacred Archive</title>
        <meta name="description" content="Explore the ancient scrolls containing the wisdom of ages past. Discover accessible texts and unlock sealed secrets in The Sacred Archive." />
      </Helmet>
      
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-cinzel font-bold text-sacred-blue text-center mb-12">The Sacred Scrolls</h2>
        
        <div className="mb-8 font-raleway text-sacred-gray text-center max-w-2xl mx-auto">
          <p>Explore the ancient scrolls that contain the wisdom of ages past. Some scrolls are available to all seekers, while others will be revealed only to those who have proven their dedication to the path.</p>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-pulse font-cinzel text-sacred-blue">
              <p>Retrieving ancient scrolls...</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {scrolls && scrolls.map((scroll) => (
              <ScrollCard 
                key={scroll.id} 
                scroll={scroll} 
                onUnlock={handleUnlockScroll} 
              />
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}
