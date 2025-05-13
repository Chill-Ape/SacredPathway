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
    queryFn: () => apiRequest(`/api/keeper/${sessionId}`),
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
  const { mutate: sendMessage, isPending } = useMutation({
    mutationFn: (content: string) =>
      apiRequest("/api/keeper/message", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: sessionId,
          content,
        }),
      }),
    onSuccess: (data: KeeperResponse) => {
      // Add the user message and assistant response to the chat
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
      
      // Clear the input field
      setMessageInput("");
      
      // Invalidate the query to refetch the message history
      queryClient.invalidateQueries({ queryKey: ["/api/keeper", sessionId] });
    },
  });

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!messageInput.trim() || isPending) return;
    
    // Optimistically add user message to UI
    const tempId = `temp-${Date.now()}`;
    const userMessage: Message = {
      id: tempId,
      content: messageInput,
      isUser: true,
    };
    
    setMessages((prevMessages) => [...prevMessages, userMessage]);
    
    // Send the message to the API
    sendMessage(messageInput);
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