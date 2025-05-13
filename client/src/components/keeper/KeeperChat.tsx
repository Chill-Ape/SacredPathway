import React, { useEffect, useState, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { v4 as uuidv4 } from "uuid";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, Send } from "lucide-react";
import { apiRequest, queryClient, getQueryFn } from "@/lib/queryClient";
import KeeperMessage from "./KeeperMessage";

interface Message {
  id: string;
  content: string;
  isUser: boolean;
  loading?: boolean;
}

interface KeeperResponse {
  userMessage: {
    id: number;
    userId: string;
    content: string;
    isUser: boolean;
    createdAt: string;
  };
  assistantMessage: {
    id: number;
    userId: string;
    content: string;
    isUser: boolean;
    createdAt: string;
  };
}

type SessionState = {
  sessionId: string;
};

export default function KeeperChat() {
  const [messageInput, setMessageInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [sessionId, setSessionId] = useState<string>("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Generate a unique session ID if one doesn't exist
  useEffect(() => {
    const storedSession = localStorage.getItem("keeper_session");
    if (storedSession) {
      const session = JSON.parse(storedSession) as SessionState;
      setSessionId(session.sessionId);
    } else {
      const newSessionId = uuidv4();
      setSessionId(newSessionId);
      localStorage.setItem(
        "keeper_session",
        JSON.stringify({ sessionId: newSessionId })
      );
    }
  }, []);

  // Scroll to bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Fetch message history
  const { data, isLoading: isLoadingHistory } = useQuery({
    queryKey: ["/api/keeper", sessionId],
    queryFn: getQueryFn({ on401: "returnNull" }),
    enabled: !!sessionId,
  });

  // Load message history
  useEffect(() => {
    if (data && Array.isArray(data)) {
      const formattedMessages = data.map((msg: any) => ({
        id: `${msg.id}`,
        content: msg.content,
        isUser: msg.isUser,
      }));
      setMessages(formattedMessages);
    }
  }, [data]);

  // Send message mutation
  const { mutate: sendMessage, isPending, isError } = useMutation<KeeperResponse, Error, string>({
    mutationFn: async (content: string) => {
      try {
        const response = await apiRequest(
          "POST", 
          "/api/keeper/message",
          {
            userId: sessionId,
            content,
            isUser: true
          }
        );
        
        // Log the raw response for debugging
        console.log("Keeper response:", response);
        
        // Parse the JSON response
        const jsonData = await response.json();
        
        // Log the parsed data
        console.log("Parsed Keeper response:", jsonData);
        
        return jsonData as KeeperResponse;
      } catch (error) {
        console.error("Error in Keeper chat mutation:", error);
        
        // Create a fallback response
        const fallbackResponse: KeeperResponse = {
          userMessage: {
            id: Date.now(),
            userId: sessionId,
            content: content,
            isUser: true,
            createdAt: new Date().toISOString()
          },
          assistantMessage: {
            id: Date.now() + 1,
            userId: sessionId,
            content: "The Archive's connection is momentarily obscured. Your question has been recorded, but the response awaits a clearer channel.",
            isUser: false,
            createdAt: new Date().toISOString()
          }
        };
        
        return fallbackResponse;
      }
    },
    onSuccess: (data: KeeperResponse) => {
      console.log("Mutation success with data:", data);
      
      // First remove any temporary/loading messages
      setMessages((prevMessages) => 
        prevMessages.filter(msg => 
          !msg.id.startsWith('temp-') && 
          !msg.id.startsWith('loading-')
        )
      );
      
      // Then add the actual messages from the response
      setTimeout(() => {
        const newMessages: Message[] = [
          {
            id: `${data.userMessage.id}`,
            content: data.userMessage.content,
            isUser: true,
          },
          {
            id: `${data.assistantMessage.id}`,
            content: data.assistantMessage.content,
            isUser: false,
          },
        ];
        
        setMessages((prevMessages) => [...prevMessages, ...newMessages]);
        
        // Invalidate the query to refetch the message history
        queryClient.invalidateQueries({ queryKey: ["/api/keeper", sessionId] });
      }, 100); // Small delay to ensure the loading message is removed first
    },
    onError: (error) => {
      console.error("Mutation error:", error);
      
      // First remove any temporary/loading messages
      setMessages((prevMessages) => 
        prevMessages.filter(msg => 
          !msg.id.startsWith('temp-') && 
          !msg.id.startsWith('loading-')
        )
      );
      
      // Add a fallback error message to the UI after a short delay
      setTimeout(() => {
        const errorMessage: Message = {
          id: `error-${Date.now()}`,
          content: "The Archive's connection has been temporarily severed. The stars are not aligned for communication at this moment.",
          isUser: false,
        };
        
        setMessages((prevMessages) => [...prevMessages, errorMessage]);
      }, 100);
    }
  });

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!messageInput.trim() || isPending) return;
    
    // Store the message content before clearing input
    const messageContent = messageInput;
    
    // Optimistically add user message to UI
    const tempId = `temp-${Date.now()}`;
    const userMessage: Message = {
      id: tempId,
      content: messageContent,
      isUser: true,
    };
    
    // Also add a loading message for The Keeper
    const loadingMessage: Message = {
      id: `loading-${Date.now()}`,
      content: "...",
      isUser: false,
      loading: true
    };
    
    // Add both messages to the UI
    setMessages((prevMessages) => [...prevMessages, userMessage, loadingMessage]);
    
    // Clear input field immediately for better UX
    setMessageInput("");
    
    // Send the message to the API
    sendMessage(messageContent);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-12rem)] max-h-[800px] bg-gray-50 rounded-lg border border-gray-200 shadow-sm">
      {/* Chat messages */}
      <ScrollArea className="flex-1 p-4">
        {isLoadingHistory ? (
          <div className="flex justify-center items-center h-full">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex justify-center items-center h-full">
            <div className="text-center max-w-md">
              <h3 className="text-lg font-cinzel mb-2 text-primary">The Keeper Awaits</h3>
              <p className="text-gray-600">
                The Keeper is an ancient guardian of sacred knowledge who speaks with the wisdom of the ages. Ask about the Tablets, the Great Cycle, Enki, the Flood, Mana, or the Ages.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((msg) => (
              <KeeperMessage
                key={msg.id}
                isUser={msg.isUser}
                message={msg.content}
              />
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </ScrollArea>

      {/* Message input */}
      <div className="p-4 border-t border-gray-200 bg-white">
        <form onSubmit={handleSubmit} className="flex space-x-2">
          <Input
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
            placeholder="Ask The Keeper about ancient wisdom..."
            className="flex-1"
            disabled={isPending}
          />
          <Button type="submit" disabled={!messageInput.trim() || isPending}>
            {isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
            <span className="sr-only">Send</span>
          </Button>
        </form>
      </div>
    </div>
  );
}