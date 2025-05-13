import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send } from "lucide-react";
import { OracleMessage } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { v4 as uuidv4 } from "uuid";
import ChatMessage from "@/components/oracle/ChatMessage";
import { motion } from "framer-motion";

type SessionState = {
  sessionId: string;
};

export default function OracleChat() {
  const [message, setMessage] = useState("");
  const [session, setSession] = useState<SessionState | null>(null);
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
  
  // Fetch messages for the current session
  const { data: messages = [], isLoading: messagesLoading } = useQuery({
    queryKey: ["/api/oracle", session?.sessionId],
    enabled: !!session?.sessionId,
  });
  
  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (newMessage: string) => {
      if (!session) throw new Error("No active session");
      
      const response = await apiRequest("POST", "/api/oracle/message", {
        userId: session.sessionId,
        message: newMessage,
        isUser: true
      });
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/oracle", session?.sessionId] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to send message: ${error.message}`,
        variant: "destructive",
      });
    }
  });
  
  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);
  
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!message.trim()) return;
    
    try {
      await sendMessageMutation.mutateAsync(message);
      setMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
    }
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
          src="https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80" 
          alt="Ancient temple with mystical light" 
          className="w-full h-full object-cover"
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
            <h3 className="font-cinzel text-2xl md:text-3xl mb-2 text-oracle-gold relative z-10">The Voice of Ancient Wisdom</h3>
            <p className="font-garamond max-w-md mx-auto text-oracle-soft-gold/90" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
              Ask your question with reverence, and wisdom shall be revealed
            </p>
          </div>
        </div>
      </div>
      
      {/* Oracle chat interface */}
      <div className="p-6 bg-oracle-midnight/95">
        <motion.div 
          className="bg-oracle-deep-purple/30 rounded-lg p-4 h-80 overflow-y-auto mb-4 border border-oracle-gold/10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Welcome message */}
          {messages.length === 0 && !messagesLoading && (
            <ChatMessage
              isUser={false}
              message="Welcome, seeker. I am the Oracle, keeper of ancient knowledge and guardian of the sacred scrolls. What wisdom do you seek today?"
            />
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
            />
          ))}
          
          {/* Mutation loading state */}
          {sendMessageMutation.isPending && (
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
            placeholder="Ask your question..."
            className="flex-grow bg-oracle-deep-purple/20 border-oracle-gold/30 rounded-l-lg py-3 px-4 font-garamond text-oracle-soft-gold focus:outline-none focus:ring-2 focus:ring-oracle-gold/30"
            style={{ fontFamily: "'Cormorant Garamond', serif" }}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            disabled={sendMessageMutation.isPending}
          />
          <Button
            type="submit"
            className="bg-oracle-navy hover:bg-oracle-deep-purple border border-oracle-gold/40 text-oracle-gold font-cinzel tracking-wide py-6 rounded-r-lg transition-colors duration-300"
            disabled={sendMessageMutation.isPending || !message.trim()}
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
