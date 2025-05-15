import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useCrafting } from "@/hooks/use-crafting";
import { useInventory } from "@/hooks/use-inventory";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { motion } from "framer-motion";
import { Loader2, AlertCircle } from "lucide-react";
import { format } from "date-fns";

export default function Crafting() {
  const { user } = useAuth();
  const { items } = useInventory();
  const {
    allRecipes,
    queueItems,
    isLoading,
    isFetchingQueue,
    startCrafting,
    claimCraftedItem,
    checkIngredients,
    refreshCraftingQueue
  } = useCrafting();

  const [selectedRecipe, setSelectedRecipe] = useState<number | null>(null);
  const [recipeDetailOpen, setRecipeDetailOpen] = useState(false);
  const [craftingStatus, setCraftingStatus] = useState<"idle" | "checking" | "crafting" | "claiming">("idle");
  const [ingredientCheck, setIngredientCheck] = useState<{
    hasIngredients: boolean;
    missingItems?: string[];
  } | null>(null);

  // Auto-refresh the crafting queue every 30 seconds
  useEffect(() => {
    if (!user) return;
    
    const interval = setInterval(() => {
      refreshCraftingQueue();
    }, 30000);
    
    return () => clearInterval(interval);
  }, [user, refreshCraftingQueue]);

  const handleOpenRecipeDetail = async (recipeId: number) => {
    setSelectedRecipe(recipeId);
    setRecipeDetailOpen(true);
    
    // Reset states
    setCraftingStatus("idle");
    setIngredientCheck(null);
  };

  const handleCheckIngredients = async () => {
    if (!selectedRecipe) return;
    
    setCraftingStatus("checking");
    try {
      const result = await checkIngredients(selectedRecipe);
      setIngredientCheck(result);
    } catch (error) {
      console.error("Failed to check ingredients:", error);
    } finally {
      setCraftingStatus("idle");
    }
  };

  const handleStartCrafting = async () => {
    if (!selectedRecipe) return;
    
    setCraftingStatus("crafting");
    try {
      await startCrafting(selectedRecipe);
      setRecipeDetailOpen(false);
    } catch (error) {
      console.error("Failed to start crafting:", error);
    } finally {
      setCraftingStatus("idle");
    }
  };

  const handleClaimItem = async (queueId: number) => {
    setCraftingStatus("claiming");
    try {
      await claimCraftedItem(queueId);
    } catch (error) {
      console.error("Failed to claim item:", error);
    } finally {
      setCraftingStatus("idle");
    }
  };

  const selectedRecipeData = selectedRecipe
    ? allRecipes.find(recipe => recipe.id === selectedRecipe)
    : null;

  // Function to check if an item is ready to claim
  const isItemReady = (item: any) => {
    if (item.isCompleted) return true;
    const now = new Date();
    const completesAt = new Date(item.completesAt);
    return now >= completesAt;
  };

  // Calculate time remaining for a queue item
  const getTimeRemaining = (completesAt: string | Date) => {
    const now = new Date();
    const completeTime = new Date(completesAt);
    const diff = completeTime.getTime() - now.getTime();
    
    if (diff <= 0) return "Ready to claim";
    
    const minutes = Math.floor(diff / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    
    return `${minutes}m ${seconds}s remaining`;
  };
  
  // Get appropriate rarity color
  const getRarityColor = (rarity: string) => {
    switch (rarity?.toLowerCase()) {
      case 'common': return 'bg-slate-200 text-slate-800';
      case 'uncommon': return 'bg-green-200 text-green-800';
      case 'rare': return 'bg-blue-200 text-blue-800';
      case 'epic': return 'bg-purple-200 text-purple-800';
      case 'legendary': return 'bg-amber-200 text-amber-800';
      default: return 'bg-slate-200 text-slate-800';
    }
  };

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-6">Sacred Crafting Chamber</h1>
      <p className="text-lg mb-8 text-muted-foreground">
        Combine sacred materials to create powerful artifacts and ritual items.
      </p>

      <Tabs defaultValue="recipes" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="recipes">Crafting Recipes</TabsTrigger>
          <TabsTrigger value="queue">Crafting Queue</TabsTrigger>
        </TabsList>

        <TabsContent value="recipes" className="space-y-4">
          {isLoading ? (
            <div className="flex items-center justify-center h-40">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {allRecipes
                .filter(recipe => recipe.isPublic || recipe.isDiscovered)
                .map((recipe) => (
                  <motion.div
                    key={recipe.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    whileHover={{ scale: 1.02 }}
                    className="transition-all"
                  >
                    <Card className="overflow-hidden h-full flex flex-col border-t-4 hover:shadow-md" 
                          style={{ borderTopColor: recipe.resultItemRarity === 'legendary' ? '#FFD700' : 
                                                recipe.resultItemRarity === 'epic' ? '#9B59B6' : 
                                                recipe.resultItemRarity === 'rare' ? '#3498DB' : 
                                                recipe.resultItemRarity === 'uncommon' ? '#2ECC71' : '#A0AEC0' }}>
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                          <CardTitle className="text-xl">{recipe.name}</CardTitle>
                          <Badge className={getRarityColor(recipe.resultItemRarity)}>
                            {recipe.resultItemRarity}
                          </Badge>
                        </div>
                        <CardDescription>{recipe.description}</CardDescription>
                      </CardHeader>
                      <CardContent className="flex-grow">
                        <div className="mt-2">
                          <h4 className="font-semibold mb-1">Creates: {recipe.resultItemName}</h4>
                          <p className="text-sm text-muted-foreground mb-3">
                            {recipe.resultItemDescription.substring(0, 80)}
                            {recipe.resultItemDescription.length > 80 ? "..." : ""}
                          </p>
                        </div>
                        <div className="mt-3">
                          <h4 className="font-semibold text-sm mb-1">Required Materials:</h4>
                          <div className="space-y-1">
                            {recipe.ingredients.map((ingredient, idx) => (
                              <div key={idx} className="text-sm flex justify-between">
                                <span>{ingredient.itemName}</span>
                                <span>x{ingredient.quantity}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </CardContent>
                      <CardFooter className="pt-0">
                        <Button 
                          onClick={() => handleOpenRecipeDetail(recipe.id)}
                          className="w-full"
                          variant="default"
                        >
                          Begin Crafting
                        </Button>
                      </CardFooter>
                    </Card>
                  </motion.div>
                ))}
            </div>
          )}
          
          {allRecipes.filter(recipe => recipe.isPublic || recipe.isDiscovered).length === 0 && !isLoading && (
            <Card className="p-6">
              <div className="text-center py-8">
                <AlertCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-medium mb-2">No Recipes Discovered Yet</h3>
                <p className="text-muted-foreground mb-4">
                  Explore the Archive to discover crafting recipes or seek knowledge from the Oracle.
                </p>
              </div>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="queue">
          {isFetchingQueue ? (
            <div className="flex items-center justify-center h-40">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="space-y-4">
              {queueItems.length > 0 ? (
                queueItems.map((item) => (
                  <Card key={item.id} className="overflow-hidden">
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-center">
                        <CardTitle className="text-lg">
                          {item.recipe?.name || "Unknown Recipe"}
                        </CardTitle>
                        <Badge 
                          variant={item.isClaimed ? "outline" : (isItemReady(item) ? "default" : "secondary")}
                        >
                          {item.isClaimed 
                            ? "Claimed" 
                            : (isItemReady(item) ? "Ready to claim" : "In progress")}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm text-muted-foreground">Started: {format(new Date(item.startedAt), "MMM d, h:mm a")}</span>
                        <span className="text-sm font-medium">
                          {!item.isClaimed && getTimeRemaining(item.completesAt)}
                        </span>
                      </div>
                      
                      {!item.isClaimed && isItemReady(item) && (
                        <Button 
                          onClick={() => handleClaimItem(item.id)}
                          className="w-full mt-3"
                          disabled={craftingStatus === "claiming"}
                        >
                          {craftingStatus === "claiming" ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Claiming...
                            </>
                          ) : (
                            "Claim Item"
                          )}
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                ))
              ) : (
                <Card className="p-6">
                  <div className="text-center py-8">
                    <AlertCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-lg font-medium mb-2">No Active Crafting</h3>
                    <p className="text-muted-foreground mb-4">
                      You have no items currently being crafted. Start crafting something from the recipes tab.
                    </p>
                  </div>
                </Card>
              )}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Recipe Detail Dialog */}
      <Dialog open={recipeDetailOpen} onOpenChange={setRecipeDetailOpen}>
        <DialogContent className="sm:max-w-md">
          {selectedRecipeData && (
            <>
              <DialogHeader>
                <DialogTitle>{selectedRecipeData.name}</DialogTitle>
                <DialogDescription>
                  {selectedRecipeData.description}
                </DialogDescription>
              </DialogHeader>
              
              <div className="py-4">
                <h4 className="font-semibold mb-2">Result: {selectedRecipeData.resultItemName}</h4>
                <p className="text-sm text-muted-foreground mb-4">
                  {selectedRecipeData.resultItemDescription}
                </p>
                
                <div className="flex items-center gap-2 mb-3">
                  <Badge className={getRarityColor(selectedRecipeData.resultItemRarity)}>
                    {selectedRecipeData.resultItemRarity}
                  </Badge>
                  <span className="text-sm">Quantity: {selectedRecipeData.resultItemQuantity}</span>
                  <span className="text-sm">Crafting Time: {selectedRecipeData.craftingTimeMinutes} min</span>
                </div>
                
                <Separator className="my-4" />
                
                <h4 className="font-semibold mb-2">Required Materials:</h4>
                <div className="space-y-2">
                  {selectedRecipeData.ingredients.map((ingredient, idx) => (
                    <div key={idx} className="flex justify-between items-center">
                      <span>{ingredient.itemName}</span>
                      <div className="flex items-center gap-2">
                        <span>x{ingredient.quantity}</span>
                        {ingredientCheck && (
                          <Badge variant={
                            ingredientCheck.missingItems?.includes(ingredient.itemName) 
                              ? "destructive" 
                              : "outline"
                          }>
                            {ingredientCheck.missingItems?.includes(ingredient.itemName) 
                              ? "Missing" 
                              : "Available"}
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                
                {ingredientCheck && !ingredientCheck.hasIngredients && (
                  <div className="mt-4 p-3 bg-red-50 text-red-800 rounded-md text-sm">
                    You're missing some required ingredients. Gather them first before crafting.
                  </div>
                )}
              </div>
              
              <DialogFooter className="sm:justify-between">
                {ingredientCheck ? (
                  <Button
                    variant="default"
                    onClick={handleStartCrafting}
                    disabled={!ingredientCheck.hasIngredients || craftingStatus === "crafting"}
                  >
                    {craftingStatus === "crafting" ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Crafting...
                      </>
                    ) : (
                      "Start Crafting"
                    )}
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    onClick={handleCheckIngredients}
                    disabled={craftingStatus === "checking"}
                  >
                    {craftingStatus === "checking" ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Checking...
                      </>
                    ) : (
                      "Check Ingredients"
                    )}
                  </Button>
                )}
                <Button variant="secondary" onClick={() => setRecipeDetailOpen(false)}>
                  Cancel
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}