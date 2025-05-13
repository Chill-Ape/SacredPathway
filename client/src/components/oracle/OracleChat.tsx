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
    <div className="bg-sacred-white rounded-xl shadow-lg border border-sacred-blue/10 overflow-hidden">
      {/* Oracle header with mystical imagery */}
      <div className="relative h-48 overflow-hidden">
        <img 
          src="https://images.unsplash.com/photo-1501973801540-537f08ccae7b" 
          alt="Mystical starry sky representing the Oracle's cosmic wisdom" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-sacred-blue/40 to-sacred-blue/80 flex items-center justify-center">
          <div className="text-center text-sacred-white p-6">
            <h3 className="font-cinzel text-2xl md:text-3xl mb-2">The Voice of Ancient Wisdom</h3>
            <p className="font-raleway max-w-md mx-auto">Ask your question with reverence, and wisdom shall be revealed</p>
          </div>
        </div>
      </div>
      
      {/* Oracle chat interface */}
      <div className="p-6">
        <motion.div 
          className="bg-sacred-white rounded-lg p-4 h-80 overflow-y-auto mb-4 border border-sacred-blue/10"
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
              <div className="animate-pulse text-sacred-blue">
                <p className="font-playfair italic">The Oracle is connecting to ancient wisdom...</p>
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
            <ChatMessage
              isUser={false}
              message="The Oracle is communing with ancient wisdom..."
              loading={true}
            />
          )}
          
          <div ref={messagesEndRef} />
        </motion.div>
        
        <form onSubmit={handleSendMessage} className="flex items-center">
          <Input
            type="text"
            placeholder="Ask your question..."
            className="flex-grow bg-sacred-white border-sacred-blue/20 rounded-l-lg py-3 px-4 font-raleway text-sacred-gray focus:outline-none focus:ring-2 focus:ring-sacred-blue/30"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            disabled={sendMessageMutation.isPending}
          />
          <Button
            type="submit"
            className="bg-sacred-blue hover:bg-sacred-blue-light text-sacred-white font-cinzel tracking-wide py-6 rounded-r-lg transition-colors duration-300"
            disabled={sendMessageMutation.isPending || !message.trim()}
          >
            <Send className="h-5 w-5 mr-2" />
            Ask
          </Button>
        </form>
        
        <div className="mt-6 text-center">
          <p className="text-sm font-raleway text-sacred-gray/80 italic">The Oracle may unlock sacred scrolls based on the depth and sincerity of your inquiries.</p>
        </div>
      </div>
    </div>
  );
}
