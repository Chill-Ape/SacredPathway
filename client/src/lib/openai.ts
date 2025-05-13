import { apiRequest } from "./queryClient";

// Function to send message to the Oracle and get a response
export async function sendOracleMessage(userId: string, message: string) {
  try {
    const response = await apiRequest("POST", "/api/oracle/message", {
      userId,
      message,
      isUser: true
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to connect with the Oracle");
    }
    
    return response.json();
  } catch (error) {
    console.error("Error communicating with the Oracle:", error);
    throw error;
  }
}

// Function to attempt unlocking a scroll with a key
export async function attemptUnlockScroll(scrollId: number, key: string) {
  try {
    const response = await apiRequest("POST", `/api/scrolls/${scrollId}/unlock`, { key });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to unlock the scroll");
    }
    
    return response.json();
  } catch (error) {
    console.error("Error unlocking scroll:", error);
    throw error;
  }
}

// Function to check if a message might contain a key for unlocking scrolls
export function checkForUnlockPotential(message: string): boolean {
  // Check if the message contains potential key words related to the locked scrolls
  const keyTerms = [
    "flood", "deluge", "water", "cleanse",
    "celestial", "stars", "planets", "cosmos", "heavenly",
    "alchemy", "transmutation", "elements", "transformation"
  ];
  
  return keyTerms.some(term => message.toLowerCase().includes(term));
}
