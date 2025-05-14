import { createContext, ReactNode, useContext } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";

// Define types for Inventory Items
export interface InventoryItem {
  id: number;
  userId: number;
  name: string;
  description: string;
  type: string;
  imageUrl: string | null;
  rarity: string | null;
  quantity: number;
  isEquipped: boolean;
  usesLeft: number | null;
  createdAt: string | Date;
  attributes: any | null;
}

export type NewInventoryItem = Omit<InventoryItem, 'id' | 'userId' | 'createdAt'>;

// Define context type
type InventoryContextType = {
  items: InventoryItem[] | undefined;
  equippedItems: InventoryItem[] | undefined;
  isLoading: boolean;
  error: Error | null;
  addItemMutation: ReturnType<typeof useMutation>;
  removeItemMutation: ReturnType<typeof useMutation>;
  updateItemMutation: ReturnType<typeof useMutation>;
  toggleEquipMutation: ReturnType<typeof useMutation>;
  updateQuantityMutation: ReturnType<typeof useMutation>;
};

// Create context
export const InventoryContext = createContext<InventoryContextType | null>(null);

// Create provider
export function InventoryProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const { user } = useAuth();
  
  // Fetch inventory items
  const {
    data: items,
    error,
    isLoading
  } = useQuery<InventoryItem[], Error>({
    queryKey: ['/api/user/inventory'],
    enabled: !!user,
    staleTime: 10000, // 10 seconds
  });
  
  // Fetch equipped items
  const { data: equippedItems } = useQuery<InventoryItem[], Error>({
    queryKey: ['/api/user/inventory/equipped'],
    enabled: !!user,
    staleTime: 10000, // 10 seconds
  });
  
  // Add new item mutation
  const addItemMutation = useMutation({
    mutationFn: async (newItem: NewInventoryItem) => {
      const res = await apiRequest('POST', '/api/user/inventory', newItem);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/user/inventory'] });
      queryClient.invalidateQueries({ queryKey: ['/api/user/inventory/equipped'] });
      toast({
        title: "Item added",
        description: "The item has been added to your inventory",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to add item",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Remove item mutation
  const removeItemMutation = useMutation({
    mutationFn: async (itemId: number) => {
      const res = await apiRequest('DELETE', `/api/user/inventory/${itemId}`);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/user/inventory'] });
      queryClient.invalidateQueries({ queryKey: ['/api/user/inventory/equipped'] });
      toast({
        title: "Item removed",
        description: "The item has been removed from your inventory",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to remove item",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Update item mutation
  const updateItemMutation = useMutation({
    mutationFn: async ({ 
      itemId, 
      updates 
    }: { 
      itemId: number; 
      updates: Partial<NewInventoryItem>; 
    }) => {
      const res = await apiRequest('PATCH', `/api/user/inventory/${itemId}`, updates);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/user/inventory'] });
      queryClient.invalidateQueries({ queryKey: ['/api/user/inventory/equipped'] });
      toast({
        title: "Item updated",
        description: "The item has been updated",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to update item",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Toggle equip mutation
  const toggleEquipMutation = useMutation({
    mutationFn: async ({ 
      itemId, 
      isEquipped 
    }: { 
      itemId: number; 
      isEquipped: boolean; 
    }) => {
      const res = await apiRequest('PATCH', `/api/user/inventory/${itemId}/equip`, { isEquipped });
      return await res.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['/api/user/inventory'] });
      queryClient.invalidateQueries({ queryKey: ['/api/user/inventory/equipped'] });
      toast({
        title: variables.isEquipped ? "Item equipped" : "Item unequipped",
        description: variables.isEquipped 
          ? "The item has been equipped"
          : "The item has been unequipped",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to toggle equipment status",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Update quantity mutation
  const updateQuantityMutation = useMutation({
    mutationFn: async ({ 
      itemId, 
      quantity 
    }: { 
      itemId: number; 
      quantity: number; 
    }) => {
      const res = await apiRequest('PATCH', `/api/user/inventory/${itemId}/quantity`, { quantity });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/user/inventory'] });
      queryClient.invalidateQueries({ queryKey: ['/api/user/inventory/equipped'] });
      toast({
        title: "Quantity updated",
        description: "The item quantity has been updated",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to update quantity",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  return (
    <InventoryContext.Provider
      value={{
        items,
        equippedItems,
        isLoading,
        error,
        addItemMutation,
        removeItemMutation,
        updateItemMutation,
        toggleEquipMutation,
        updateQuantityMutation,
      }}
    >
      {children}
    </InventoryContext.Provider>
  );
}

// Create hook
export function useInventory() {
  const context = useContext(InventoryContext);
  if (!context) {
    throw new Error("useInventory must be used within an InventoryProvider");
  }
  return context;
}