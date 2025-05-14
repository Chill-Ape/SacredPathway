import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { Scroll } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

export function useUserScrolls() {
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Get all scrolls unlocked by the user
  const scrollsQuery = useQuery<Scroll[]>({
    queryKey: ["/api/user/scrolls"],
    enabled: !!user,
  });

  // Check if a specific scroll is unlocked for the user
  const checkScrollUnlockedStatus = (scrollId: number) => {
    return useQuery<{ isUnlocked: boolean }>({
      queryKey: ["/api/user/scrolls", scrollId],
      enabled: !!user,
    });
  };

  // Attempt to unlock a scroll
  const unlockScrollMutation = useMutation({
    mutationFn: async ({ scrollId, key }: { scrollId: number; key: string }) => {
      const res = await apiRequest("POST", `/api/scrolls/${scrollId}/unlock`, { key });
      return await res.json();
    },
    onSuccess: (data, variables) => {
      // Invalidate both the specific scroll query and the user scrolls list
      queryClient.invalidateQueries({ queryKey: ["/api/user/scrolls", variables.scrollId] });
      queryClient.invalidateQueries({ queryKey: ["/api/user/scrolls"] });
      queryClient.invalidateQueries({ queryKey: ["/api/scrolls", variables.scrollId] });
      
      toast({
        title: "Item Unlocked!",
        description: "You've successfully unlocked this sacred item.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to unlock item",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return {
    userScrolls: scrollsQuery.data || [],
    isLoadingScrolls: scrollsQuery.isLoading,
    checkScrollUnlockedStatus,
    unlockScroll: unlockScrollMutation.mutate,
    isUnlocking: unlockScrollMutation.isPending,
  };
}