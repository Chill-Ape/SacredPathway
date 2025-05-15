import { createContext, ReactNode, useContext } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";

// Define types for Crafting
export interface CraftingRecipe {
  id: number;
  name: string;
  description: string;
  resultItemName: string;
  resultItemType: string;
  resultItemRarity: string;
  resultItemDescription: string;
  resultItemImageUrl: string | null;
  resultItemQuantity: number;
  resultItemAttributes: any;
  ingredients: {itemName: string, quantity: number}[];
  requiredLevel: number;
  craftingTimeMinutes: number;
  manaPrice: number;
  isPublic: boolean;
  isDiscovered: boolean | null;
  createdAt: string | Date;
}

export interface CraftingQueueItem {
  id: number;
  userId: number;
  recipeId: number;
  startedAt: string | Date;
  completesAt: string | Date;
  isCompleted: boolean;
  isClaimed: boolean;
  recipe?: CraftingRecipe;
}

export interface IngredientCheckResult {
  hasIngredients: boolean;
  missingItems?: string[];
}

// Create context
type CraftingContextType = {
  allRecipes: CraftingRecipe[];
  discoveredRecipes: CraftingRecipe[];
  queueItems: CraftingQueueItem[];
  isLoading: boolean;
  isFetchingQueue: boolean;
  startCrafting: (recipeId: number) => Promise<void>;
  claimCraftedItem: (queueId: number) => Promise<void>;
  checkIngredients: (recipeId: number) => Promise<IngredientCheckResult>;
  discoverRecipe: (recipeId: number) => Promise<void>;
  refreshCraftingQueue: () => void;
};

const CraftingContext = createContext<CraftingContextType | undefined>(undefined);

export function CraftingProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const { user } = useAuth();
  
  // Get all recipes (with discovery state if user is authenticated)
  const { 
    data: allRecipes = [], 
    isLoading 
  } = useQuery<CraftingRecipe[]>({
    queryKey: ['/api/crafting/recipes'],
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: true, // Always fetch recipes
  });
  
  // Get only discovered recipes (for authenticated users)
  const {
    data: discoveredRecipes = [],
  } = useQuery<CraftingRecipe[]>({
    queryKey: ['/api/user/crafting/recipes'],
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!user, // Only fetch if user is authenticated
  });
  
  // Get crafting queue
  const {
    data: queueItems = [],
    isLoading: isFetchingQueue,
    refetch: refreshCraftingQueue
  } = useQuery<CraftingQueueItem[]>({
    queryKey: ['/api/user/crafting/queue'],
    staleTime: 30 * 1000, // 30 seconds
    enabled: !!user, // Only fetch if user is authenticated
  });
  
  // Mutation to start crafting
  const startCraftingMutation = useMutation({
    mutationFn: async (recipeId: number) => {
      const res = await apiRequest('POST', '/api/user/crafting/start', { recipeId });
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Crafting Started",
        description: "Your item is being crafted. You can check its progress in the crafting queue.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/user/crafting/queue'] });
      queryClient.invalidateQueries({ queryKey: ['/api/user/inventory'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Crafting Failed",
        description: error.message || "Failed to start crafting process.",
        variant: "destructive",
      });
    }
  });
  
  // Mutation to claim a crafted item
  const claimItemMutation = useMutation({
    mutationFn: async (queueId: number) => {
      const res = await apiRequest('POST', `/api/user/crafting/claim/${queueId}`);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Item Claimed",
        description: "The crafted item has been added to your inventory.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/user/crafting/queue'] });
      queryClient.invalidateQueries({ queryKey: ['/api/user/inventory'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Claim Failed",
        description: error.message || "Failed to claim the crafted item.",
        variant: "destructive",
      });
    }
  });
  
  // Mutation to check ingredients
  const checkIngredientsMutation = useMutation({
    mutationFn: async (recipeId: number) => {
      const res = await apiRequest('GET', `/api/user/crafting/check-ingredients/${recipeId}`);
      return await res.json() as IngredientCheckResult;
    },
    onError: (error: Error) => {
      toast({
        title: "Ingredient Check Failed",
        description: error.message || "Failed to check ingredient availability.",
        variant: "destructive",
      });
    }
  });
  
  // Mutation to discover a recipe
  const discoverRecipeMutation = useMutation({
    mutationFn: async (recipeId: number) => {
      const res = await apiRequest('POST', `/api/user/crafting/discover/${recipeId}`);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Recipe Discovered",
        description: "You've learned a new crafting recipe!",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/crafting/recipes'] });
      queryClient.invalidateQueries({ queryKey: ['/api/user/crafting/recipes'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Discovery Failed",
        description: error.message || "Failed to discover the recipe.",
        variant: "destructive",
      });
    }
  });
  
  // Define context methods
  const startCrafting = async (recipeId: number) => {
    await startCraftingMutation.mutateAsync(recipeId);
  };
  
  const claimCraftedItem = async (queueId: number) => {
    await claimItemMutation.mutateAsync(queueId);
  };
  
  const checkIngredients = async (recipeId: number): Promise<IngredientCheckResult> => {
    return await checkIngredientsMutation.mutateAsync(recipeId);
  };
  
  const discoverRecipe = async (recipeId: number) => {
    await discoverRecipeMutation.mutateAsync(recipeId);
  };
  
  return (
    <CraftingContext.Provider
      value={{
        allRecipes,
        discoveredRecipes,
        queueItems,
        isLoading,
        isFetchingQueue,
        startCrafting,
        claimCraftedItem,
        checkIngredients,
        discoverRecipe,
        refreshCraftingQueue
      }}
    >
      {children}
    </CraftingContext.Provider>
  );
}

export function useCrafting() {
  const context = useContext(CraftingContext);
  if (!context) {
    throw new Error("useCrafting must be used within a CraftingProvider");
  }
  return context;
}