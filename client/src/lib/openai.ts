import { apiRequest } from "./queryClient";

export async function sendOracleMessage(userId: string, message: string) {
  return apiRequest("/api/oracle/message", "POST", {
    userId,
    message,
    isUser: true
  });
}

export async function getOracleMessages(userId: string) {
  return apiRequest(`/api/oracle/${userId}`, "GET");
}

export async function sendKeeperMessage(userId: string, content: string) {
  return apiRequest("/api/keeper/message", "POST", {
    userId,
    content,
    isUser: true
  });
}

export async function getKeeperMessages(userId: string) {
  return apiRequest(`/api/keeper/${userId}`, "GET");
}

export async function attemptUnlockScroll(scrollId: number, key: string) {
  try {
    const response = await apiRequest(`/api/scrolls/${scrollId}/unlock`, "POST", { key });
    return !!response;
  } catch (error) {
    console.error("Error unlocking scroll:", error);
    return false;
  }
}

export function checkForUnlockPotential(message: string): boolean {
  const lowerMessage = message.toLowerCase();
  // Check for keywords that might indicate the user is trying to unlock a scroll
  return ['unlock', 'key', 'open', 'reveal', 'password', 'secret'].some(keyword => 
    lowerMessage.includes(keyword)
  );
}