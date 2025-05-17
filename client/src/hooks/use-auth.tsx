import { createContext, ReactNode, useContext, useState, useEffect } from "react";
import {
  useQuery,
  useMutation,
  UseMutationResult,
} from "@tanstack/react-query";
import { insertUserSchema, User } from "@shared/schema";
import { getQueryFn, apiRequest, queryClient } from "../lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import WelcomeModal from "@/components/mana/WelcomeModal";

// Define UserType for consistent use throughout the hook
type UserType = { 
  id: number; 
  username: string; 
  profilePicture?: string;
};

type AuthContextType = {
  user: UserType | null;
  isLoading: boolean;
  error: Error | null;
  loginMutation: UseMutationResult<{ user: UserType }, Error, LoginData>;
  logoutMutation: UseMutationResult<void, Error, void>;
  registerMutation: UseMutationResult<{ user: UserType, welcomeBonus?: number }, Error, RegisterData>;
  showWelcomeModal: boolean;
  setShowWelcomeModal: (show: boolean) => void;
};

type LoginData = {
  username: string;
  password?: string;
};

// Create a schema with required password based on insertUserSchema properties
const registerSchema = z.object({
  username: z.string().min(1, "Username is required"),
  email: z.string().email("Invalid email format"),
  phone: z.string().optional(),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type RegisterData = z.infer<typeof registerSchema>;

export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  const [newUsername, setNewUsername] = useState<string>("");
  
  // Try to get user from localStorage if available
  const [localUser, setLocalUser] = useState<UserType | null>(() => {
    try {
      const storedUser = localStorage.getItem('akashic_user');
      return storedUser ? JSON.parse(storedUser) : null;
    } catch (e) {
      return null;
    }
  });
  
  const {
    data: userData,
    error,
    isLoading,
  } = useQuery<{ user: UserType } | undefined, Error>({
    queryKey: ["/api/user"],
    queryFn: getQueryFn({ on401: "returnNull" }),
    staleTime: 1000 * 60 * 5, // Keep data fresh for 5 minutes
    gcTime: 1000 * 60 * 10, // Cache data for 10 minutes (was cacheTime in v4)
    refetchOnWindowFocus: false, // Don't refetch when window regains focus
    retry: false, // Don't retry failed requests automatically
  });

  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginData) => {
      const res = await apiRequest("POST", "/api/login", credentials);
      return await res.json();
    },
    onSuccess: (data) => {
      console.log("Login successful, setting user data:", data);
      
      // Store user in localStorage immediately to prevent UI flicker
      localStorage.setItem('akashic_user', JSON.stringify(data.user));
      
      // Update query cache
      queryClient.setQueryData(["/api/user"], data);
      
      toast({
        title: "Login successful",
        description: `Welcome back, ${data.user.username}!`,
      });
      
      // Add a small delay before forcing a navigation
      setTimeout(() => {
        window.location.href = '/';
      }, 500);
    },
    onError: (error: Error) => {
      toast({
        title: "Login failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (userData: RegisterData) => {
      // First register the user
      const registerRes = await apiRequest("POST", "/api/register", userData);
      const registerData = await registerRes.json();
      
      // Then immediately log them in with the same credentials
      const loginPayload = {
        username: userData.username,
        password: userData.password
      };
      const loginRes = await apiRequest("POST", "/api/login", loginPayload);
      const loginData = await loginRes.json();
      
      // Return combined data
      return {
        ...registerData,
        loginData
      };
    },
    onSuccess: (data) => {
      console.log("Registration and auto-login successful:", data);
      
      // Store user in localStorage immediately
      localStorage.setItem('akashic_user', JSON.stringify(data.user));
      
      // Update query cache with the user data
      queryClient.setQueryData(["/api/user"], { user: data.user });
      
      // Force refetch of mana balance to show the welcome bonus
      queryClient.invalidateQueries({ queryKey: ['/api/user/mana'] });
      
      // Store the new username for welcome modal
      setNewUsername(data.user.username);
      
      // Log welcome bonus for debugging
      console.log("Welcome bonus amount:", data.welcomeBonus);
      
      toast({
        title: "Registration successful",
        description: `Welcome, ${data.user.username}! You've received 50 Mana as a welcome bonus.`,
      });
      
      // Show the welcome modal first
      setShowWelcomeModal(true);
      
      // No automatic redirection - we'll let the modal handle it
    },
    onError: (error: Error) => {
      toast({
        title: "Registration failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/logout");
    },
    onSuccess: () => {
      // Clear user data from localStorage
      localStorage.removeItem('akashic_user');
      setLocalUser(null);
      
      // Clear user data from the cache
      queryClient.setQueryData(["/api/user"], null);
      
      // Invalidate all queries to force refetch
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      
      toast({
        title: "Logged out",
        description: "You have been successfully logged out.",
      });
      
      console.log("Auth provider: User logged out, cleared cache and localStorage");
    },
    onError: (error: Error) => {
      toast({
        title: "Logout failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Update local user when userData changes
  useEffect(() => {
    if (userData?.user) {
      setLocalUser(userData.user);
    }
  }, [userData]);
  
  // For debugging
  console.log('Auth provider - userData:', userData, 'localUser:', localUser);
  
  // Use API data if available, otherwise fall back to localStorage
  const user = userData?.user || localUser;
  
  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        error,
        loginMutation,
        logoutMutation,
        registerMutation,
        showWelcomeModal,
        setShowWelcomeModal,
      }}
    >
      {/* Render welcome modal if it's visible */}
      {showWelcomeModal && user && (
        <WelcomeModal 
          isOpen={showWelcomeModal} 
          onClose={() => setShowWelcomeModal(false)}
          username={newUsername || user.username}
        />
      )}
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}