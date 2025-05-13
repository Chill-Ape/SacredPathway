import { useState, useEffect, useRef } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { v4 as uuidv4 } from "uuid";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PaperPlaneIcon, Loader2 } from "lucide-react";
import KeeperMessage from "./KeeperMessage";

// Define message types
interface Message {
  id: string;
  content: string;
  isUser: boolean;
}

// Create a session ID for the user
type SessionState = {
  sessionId: string;
};

export default function KeeperChat() {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [session, setSession] = useState<SessionState>(() => {
    // Check if we have a session ID in localStorage
    const savedSession = localStorage.getItem("keeper_session");
    if (savedSession) {
      return JSON.parse(savedSession);
    }
    // Create a new session ID
    const newSession = { sessionId: uuidv4() };
    localStorage.setItem("keeper_session", JSON.stringify(newSession));
    return newSession;
  });

  // Fetch conversation history
  const { data: conversationData, isLoading: isLoadingConversation } = useQuery({
    queryKey: ["/api/keeper", session.sessionId],
    enabled: !!session.sessionId
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      return apiRequest(
        "/api/keeper/message",
        "POST",
        { userId: session.sessionId, content }
      );
    },
    onSuccess: (data) => {
      if (data) {
        // Add the assistant's response to messages
        setMessages(prev => [
          ...prev, 
          { 
            id: uuidv4(), 
            content: data.assistantMessage.content, 
            isUser: false 
          }
        ]);
      }
      
      // Invalidate the conversation query to refresh the history
      queryClient.invalidateQueries({ queryKey: ["/api/keeper", session.sessionId] });
    }
  });

  // Scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Set initial message when conversation loads
  useEffect(() => {
    if (!isLoadingConversation && conversationData) {
      // If we have messages in the history, use those
      if (conversationData.length > 0) {
        setMessages(
          conversationData.map((msg: any) => ({
            id: uuidv4(),
            content: msg.content,
            isUser: msg.isUser
          }))
        );
      } else {
        // Otherwise, set the initial greeting
        setMessages([
          {
            id: uuidv4(),
            content: "Welcome, Seeker. The Archive stirs. What would you know?",
            isUser: false
          }
        ]);
      }
    }
  }, [isLoadingConversation, conversationData]);

  // Handle sending a message
  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    if (!message.trim() || sendMessageMutation.isPending) return;
    
    // Add user message to the chat
    const userMessage = {
      id: uuidv4(),
      content: message.trim(),
      isUser: true
    };
    
    setMessages(prev => [...prev, userMessage]);
    setMessage("");
    
    // Focus the input after sending
    setTimeout(() => {
      inputRef.current?.focus();
    }, 0);
    
    // Send message to API
    await sendMessageMutation.mutateAsync(userMessage.content);
  };

  return (
    <div className="flex flex-col h-[600px] md:h-[700px]">
      {/* Chat messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {messages.map((msg) => (
          <KeeperMessage
            key={msg.id}
            isUser={msg.isUser}
            message={msg.content}
          />
        ))}
        
        {/* Show loading indicator when sending message */}
        {sendMessageMutation.isPending && (
          <KeeperMessage
            isUser={false}
            loading={true}
            message=""
          />
        )}
        
        {/* Empty div for scrolling to bottom */}
        <div ref={messagesEndRef} />
      </div>
      
      {/* Message input */}
      <div className="border-t border-gray-200 p-4 bg-white">
        <form onSubmit={handleSendMessage} className="flex space-x-2">
          <Input
            ref={inputRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Ask The Keeper a question..."
            className="flex-1 focus-visible:ring-primary"
            disabled={sendMessageMutation.isPending}
          />
          <Button 
            type="submit" 
            disabled={!message.trim() || sendMessageMutation.isPending}
            className="bg-primary hover:bg-primary/90"
          >
            {sendMessageMutation.isPending ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <PaperPlaneIcon className="h-5 w-5" />
            )}
            <span className="sr-only">Send</span>
          </Button>
        </form>
      </div>
    </div>
  );
}