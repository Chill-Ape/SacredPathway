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

// Create context
const InventoryContext = createContext<any>(null);

// Create provider
export function InventoryProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const { user } = useAuth();
  
  // Fetch inventory items
  const {
    data: items,
    error,
    isLoading
  } = useQuery({
    queryKey: ['/api/user/inventory'],
    enabled: !!user,
  });
  
  // Fetch equipped items
  const { data: equippedItems } = useQuery({
    queryKey: ['/api/user/inventory/equipped'],
    enabled: !!user,
  });
  
  // Add new item mutation
  const addItemMutation = useMutation({
    mutationFn: async (newItem: any) => {
      const res = await apiRequest('POST', '/api/user/inventory', newItem);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/user/inventory'] });
      toast({
        title: "Item added",
        description: "The item has been added to your inventory",
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
      toast({
        title: "Item removed",
        description: "The item has been removed from your inventory",
      });
    },
  });
  
  // Toggle equip mutation
  const toggleEquipMutation = useMutation({
    mutationFn: async ({ itemId, isEquipped }: any) => {
      const res = await apiRequest('PATCH', `/api/user/inventory/${itemId}/equip`, { isEquipped });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/user/inventory'] });
      toast({
        title: "Equipment status updated",
        description: "The item's equipment status has been updated",
      });
    },
  });
  
  const value = {
    items,
    equippedItems,
    isLoading,
    error,
    addItemMutation,
    removeItemMutation,
    toggleEquipMutation,
  };
  
  return (
    <InventoryContext.Provider value={value}>
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