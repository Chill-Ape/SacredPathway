import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Sparkles } from "lucide-react";
import { OracleMessage } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { v4 as uuidv4 } from "uuid";
import ChatMessage from "@/components/oracle/ChatMessage";
import useSound from "use-sound";
import { motion } from "framer-motion";

type SessionState = {
  sessionId: string;
};

// Constants for Oracle usage
const ORACLE_COST = 5; // Mana cost per Oracle query
const FREE_DAILY_QUERIES = 3; // Number of free queries for non-authenticated users

interface RemainingQueries {
  count: number;
  isAuthenticated: boolean;
}

export default function OracleChat() {
  const [message, setMessage] = useState("");
  const [session, setSession] = useState<SessionState | null>(null);
  const [loadedPreviously, setLoadedPreviously] = useState<boolean>(false); // Track if messages have loaded before
  const [remainingQueries, setRemainingQueries] = useState<RemainingQueries>({
    count: FREE_DAILY_QUERIES,
    isAuthenticated: false
  });
  const { user } = useAuth();
  const { toast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();
  
  // Create or retrieve session ID
  useEffect(() => {
    const storedSession = localStorage.getItem("oracleSession");
    if (storedSession) {
      setSession(JSON.parse(storedSession));
    } else {
      const newSession = { sessionId: uuidv4() };
      localStorage.setItem("oracleSession", JSON.stringify(newSession));
      setSession(newSession);
    }
  }, []);
  
  // Fetch messages for the current session using a custom queryFn to handle the session ID
  const { data: messages = [], isLoading: messagesLoading } = useQuery<OracleMessage[]>({
    queryKey: ["/api/oracle", session?.sessionId],
    queryFn: async () => {
      if (!session?.sessionId) {
        return [];
      }
      const res = await fetch(`/api/oracle/${session.sessionId}`);
      if (!res.ok) {
        throw new Error("Failed to fetch messages");
      }
      // When messages are loaded for the first time, don't animate them
      const messages = await res.json();
      if (!loadedPreviously) {
        // This is the initial load - mark for next time but don't animate
        setLoadedPreviously(false);
      }
      return messages;
    },
    enabled: !!session?.sessionId,
    staleTime: 1000 * 60 * 60, // Keep data fresh for 1 hour
    refetchOnWindowFocus: false, // Don't refetch when window gets focus
  });
  
  // Send message mutation
  const { mutate: sendMessage, isPending } = useMutation({
    mutationFn: async (newMessage: string) => {
      if (!session) throw new Error("No active session");
      
      const response = await apiRequest("POST", "/api/oracle/message", {
        userId: session.sessionId,
        message: newMessage,
        isUser: true
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        
        // Handle special case of Mana requirements
        if (response.status === 403 && errorData.requiresMana) {
          throw new Error(errorData.message || "Insufficient Mana");
        }
        
        throw new Error("Failed to contact the Oracle");
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      // Mark that new messages have been added - these need animation
      setLoadedPreviously(true);
      
      queryClient.invalidateQueries({ queryKey: ["/api/oracle", session?.sessionId] });
    },
    onError: (error: any) => {
      // Check if it's a limit-related error for anonymous users
      if (error.response?.data?.requiresMana && !user) {
        toast({
          title: "Oracle Access Limited",
          description: "You have reached your daily limit of 3 free Oracle consultations. Create an account to continue your journey with the Oracle.",
          variant: "default",
          action: (
            <a href="/auth">
              <Button variant="default" className="bg-gradient-to-r from-blue-600 to-purple-600">
                Sign Up / Login
              </Button>
            </a>
          ),
        });
      }
      // Check if it's a Mana-related error for authenticated users
      else if (user && error.message.includes("Mana")) {
        toast({
          title: "Oracle Access Limited",
          description: error.message,
          variant: "default",
          action: (
            <a href="/mana">
              <Button variant="default" className="bg-gradient-to-r from-blue-600 to-purple-600">
                Get Mana
              </Button>
            </a>
          ),
        });
      } else {
        toast({
          title: "Error",
          description: `Failed to send message: ${error.message}`,
          variant: "destructive",
        });
      }
    }
  });
  
  // Update remaining queries count based on message count and authentication status
  useEffect(() => {
    if (user) {
      // For authenticated users, check if they have a balance (this would require a separate query)
      setRemainingQueries({
        count: 0, // Not applicable for auth users
        isAuthenticated: true
      });
    } else if (session && messages) {
      // For anonymous users, count their messages to track usage
      // In a real implementation, this would be more accurate with a dedicated endpoint
      const userMessageCount = messages.filter(msg => msg.isUser).length;
      const remainingCount = Math.max(0, FREE_DAILY_QUERIES - userMessageCount);
      
      setRemainingQueries({
        count: remainingCount,
        isAuthenticated: false
      });
    }
  }, [user, session, messages]);
  
  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);
  
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!message.trim()) return;
    
    sendMessage(message);
    setMessage("");
  };
  
  if (!session) {
    return (
      <div className="text-center py-8">
        <p>Initializing connection to the Oracle...</p>
      </div>
    );
  }

  return (
    <div className="bg-oracle-deep-purple/95 rounded-xl shadow-2xl border border-oracle-gold/20 overflow-hidden animate-oracle-breathe">
      {/* Oracle header with mystical imagery */}
      <div className="relative h-48 overflow-hidden">
        <img 
          src="/assets/oracle_header.jpg" 
          alt="Ancient temple with mystical light" 
          className="w-full h-full object-cover"
          onError={(e) => {
            e.currentTarget.src = 'https://images.unsplash.com/photo-1507181080368-cc2195abcde1?q=80&w=1200';
            e.currentTarget.alt = 'Mystical night sky with stars';
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-oracle-navy/40 to-oracle-midnight/90 flex items-center justify-center">
          <div className="text-center text-oracle-soft-gold p-6 relative">
            {/* Animated sacred symbol overlay */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 opacity-10 animate-oracle-glyph-rotate">
              <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" className="text-oracle-gold">
                <circle cx="50" cy="50" r="45" strokeWidth="0.5" />
                <circle cx="50" cy="50" r="35" strokeWidth="0.5" />
                <circle cx="50" cy="50" r="25" strokeWidth="0.5" />
                <path d="M50 5 L50 95 M5 50 L95 50 M26 26 L74 74 M26 74 L74 26" strokeWidth="0.5" />
              </svg>
            </div>
          </div>
        </div>
      </div>
      
      {/* Oracle chat interface */}
      <div className="p-6 bg-white rounded-lg shadow-md">
        {/* Info about Oracle usage costs */}
        <div className="mb-2 flex justify-between items-center">
          {!user && remainingQueries.count <= 1 && (
            <div className="inline-flex items-center">
              <a href="/auth">
                <Button variant="outline" className="text-sm border-amber-300 text-amber-800 hover:bg-amber-50">
                  <span className="mr-1.5">✨</span> Sign Up for Unlimited Access
                </Button>
              </a>
            </div>
          )}
          
          <div className={`inline-flex items-center py-1 px-3 rounded-full ${
            !user && remainingQueries.count <= 1 
              ? "bg-amber-50 text-amber-700 border border-amber-200" 
              : "bg-blue-50 text-blue-600 border border-blue-200"
          } text-sm ${!user && remainingQueries.count <= 1 ? "ml-auto" : ""}`}>
            <Sparkles className={`h-3.5 w-3.5 mr-1.5 ${
              !user && remainingQueries.count <= 1 ? "text-amber-500" : "text-blue-500"
            }`} />
            {user ? (
              <span>Each inquiry costs <strong>{ORACLE_COST} Mana</strong></span>
            ) : (
              <span><strong>{remainingQueries.count}</strong> free inquir{remainingQueries.count === 1 ? "y" : "ies"} remaining today</span>
            )}
          </div>
        </div>
        
        <motion.div 
          className={`bg-gradient-to-t from-[#0a2a45] to-[#184772] rounded-lg p-4 h-[500px] overflow-y-auto mb-4 border-2 border-oracle-gold/30 shadow-lg ${isPending ? 'oracle-chatbox-glow-active' : 'oracle-chatbox-glow'}`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Welcome message */}
          {messages.length === 0 && !messagesLoading && (
            <ChatMessage
              isUser={false}
              message="Welcome to the Akashic Archive. I am here to assist with your questions about ancient knowledge, history, and mysteries. What would you like to know?"
            />
          )}
          
          {/* No remaining free queries message */}
          {!user && remainingQueries.count === 0 && !messagesLoading && (
            <div className="bg-amber-50 border border-amber-200 text-amber-700 p-4 rounded-lg mb-4">
              <h4 className="font-bold text-amber-800 mb-2">You've reached your free limit</h4>
              <p className="mb-3">You have used all your free Oracle consultations for today. Create an account to continue your journey.</p>
              <a href="/auth">
                <Button className="bg-oracle-gold hover:bg-oracle-gold/90 text-white">
                  Sign Up / Login
                </Button>
              </a>
            </div>
          )}
          
          {/* Loading state */}
          {messagesLoading && (
            <div className="flex justify-center items-center h-full">
              <div className="text-oracle-gold">
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 rounded-full bg-oracle-gold/50 animate-oracle-thinking-1"></div>
                  <div className="w-4 h-4 rounded-full bg-oracle-gold/50 animate-oracle-thinking-2"></div>
                  <div className="w-4 h-4 rounded-full bg-oracle-gold/50 animate-oracle-thinking-3"></div>
                </div>
                <p className="font-garamond italic mt-2 text-oracle-soft-gold" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                  The Oracle is reaching into the void between worlds...
                </p>
              </div>
            </div>
          )}
          
          {/* Message history */}
          {messages.map((msg: OracleMessage) => (
            <ChatMessage
              key={msg.id}
              isUser={msg.isUser}
              message={msg.message}
              isNew={msg.id === messages[messages.length - 1]?.id && !messages[messages.length - 1]?.isUser} // Only animate the last Oracle message
            />
          ))}
          
          {/* Mutation loading state */}
          {isPending && (
            <div className="flex items-start mb-4">
              <div className="w-8 h-8 rounded-full bg-oracle-deep-purple flex items-center justify-center text-oracle-gold mr-3 flex-shrink-0 animate-oracle-pulse">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <circle cx="12" cy="12" r="4" />
                </svg>
              </div>
              
              <div className="bg-oracle-deep-purple/40 rounded-lg py-3 px-4 max-w-xs md:max-w-md">
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-oracle-gold rounded-full animate-oracle-thinking-1"></span>
                  <span className="w-2 h-2 bg-oracle-gold rounded-full animate-oracle-thinking-2"></span>
                  <span className="w-2 h-2 bg-oracle-gold rounded-full animate-oracle-thinking-3"></span>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </motion.div>
        
        <form onSubmit={handleSendMessage} className="flex items-center">
          <Input
            type="text"
            placeholder={!user && remainingQueries.count === 0 ? "You've reached your free limit..." : "Ask your question..."}
            className={`flex-grow bg-white border-oracle-gold/40 rounded-l-lg py-3 px-4 font-garamond text-oracle-deep-purple placeholder:${!user && remainingQueries.count === 0 ? "text-amber-400" : "text-oracle-navy/60"} focus:outline-none focus:ring-2 focus:ring-oracle-gold/40`}
            style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.05rem" }}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            disabled={isPending || (!user && remainingQueries.count === 0)}
          />
          <Button
            type="submit"
            className="bg-oracle-navy hover:bg-oracle-deep-purple border border-oracle-gold/40 text-oracle-gold font-cinzel tracking-wide py-6 rounded-r-lg transition-colors duration-300"
            disabled={isPending || !message.trim() || (!user && remainingQueries.count === 0)}
          >
            <Send className="h-5 w-5 mr-2" />
            Ask
          </Button>
        </form>
        
        <div className="mt-6 text-center">
          <p className="text-sm font-garamond text-oracle-soft-gold/70 italic" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
            The Oracle may reveal hidden knowledge and unlock sacred scrolls to those who ask with depth and sincerity.
          </p>
        </div>
      </div>
    </div>
  );
}
