import React from "react";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

interface KeeperMessageProps {
  isUser: boolean;
  message: string;
  loading?: boolean;
}

export default function KeeperMessage({ isUser, message, loading = false }: KeeperMessageProps) {
  return (
    <div
      className={cn(
        "flex",
        isUser ? "justify-end" : "justify-start"
      )}
    >
      <div
        className={cn(
          "rounded-lg p-4 max-w-[80%] shadow-sm",
          isUser
            ? "bg-primary text-white"
            : "bg-white border border-gray-200"
        )}
      >
        {loading ? (
          <div className="flex items-center justify-center h-6">
            <Loader2 className="h-4 w-4 animate-spin text-gray-500" />
          </div>
        ) : (
          <div className="prose prose-sm">
            {message.split("\n").map((paragraph, index) => (
              <p key={index} className={cn(
                "m-0",
                index > 0 && "mt-2",
                !isUser && "font-cinzel text-gray-800 leading-relaxed"
              )}>
                {paragraph}
              </p>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}