import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import ScrollCard from "@/components/scrolls/ScrollCard";
import { Helmet } from "react-helmet";
import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";
import { Scroll } from "@shared/schema";

export default function MyScrolls() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  
  const { 
    data: scrolls = [] as Scroll[], 
    isLoading, 
    error
  } = useQuery<Scroll[]>({
    queryKey: [`/api/user/scrolls`],
    enabled: !!user,
  });
  
  const filteredScrolls = scrolls.filter((scroll: Scroll) => 
    scroll.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center w-full min-h-[70vh]">
        <Loader2 className="h-12 w-12 animate-spin text-sacred-blue" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl text-sacred-blue font-cinzel mb-4">Error Loading Scrolls</h2>
        <p className="text-sacred-gray">Please try again later.</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.5 }}
      className="container mx-auto px-4 py-12"
    >
      <Helmet>
        <title>My Unlocked Scrolls | The Akashic Archive</title>
        <meta name="description" content="View your unlocked sacred scrolls from the Akashic Archive. Access ancient wisdom and hidden knowledge from your personal collection." />
      </Helmet>
      
      <h1 className="text-4xl md:text-5xl font-cinzel text-sacred-blue text-center mb-3">
        My Unlocked Scrolls
      </h1>
      
      <p className="text-center text-sacred-gray mb-8 max-w-3xl mx-auto">
        These scrolls have been unlocked for your study and contemplation. 
        The wisdom they contain is now part of your personal journey through the Archive.
      </p>
      
      <div className="max-w-md mx-auto mb-10">
        <input
          type="text"
          placeholder="Search your scrolls..."
          className="w-full p-3 border border-sacred-blue/20 rounded-lg font-raleway focus:outline-none focus:ring-2 focus:ring-sacred-blue/50"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      
      {filteredScrolls.length === 0 ? (
        <div className="text-center py-12 bg-sacred-blue/5 rounded-xl max-w-2xl mx-auto">
          <h2 className="text-2xl text-sacred-blue font-cinzel mb-4">
            {searchTerm ? "No matching scrolls found" : "No scrolls unlocked yet"}
          </h2>
          <p className="text-sacred-gray max-w-lg mx-auto">
            {searchTerm 
              ? "Try different search terms or browse all scrolls to find what you're looking for." 
              : "As you explore the Archive, you'll unlock scrolls containing ancient wisdom. Return here to access your personal collection."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredScrolls.map((scroll: Scroll) => (
            <ScrollCard key={scroll.id} scroll={scroll} />
          ))}
        </div>
      )}
    </motion.div>
  );
}