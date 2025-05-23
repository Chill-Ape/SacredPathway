import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Grid, ListIcon } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useInventory, InventoryItem } from "@/hooks/use-inventory";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Helmet } from "react-helmet";
import InventoryGridComponent from "@/components/inventory/InventoryGrid";
import { Link } from "wouter";

// Constants for item types and rarities
const ITEM_TYPES = {
  ARTIFACT: "artifact",
  KEY: "key",
  RESOURCE: "resource",
  RELIC: "relic",
  SCROLL: "scroll",
  BOOK: "book",
  AMULET: "amulet",
  ELIXIR: "elixir",
  WISDOM: "wisdom",
  CODEX: "codex",
  TABLET: "tablet",
  OTHER: "other"
};

const RARITY_LEVELS = {
  COMMON: "common", 
  UNCOMMON: "uncommon",
  RARE: "rare",
  EPIC: "epic",
  LEGENDARY: "legendary",
  MYTHIC: "mythic",
  DIVINE: "divine"
};

// Function to get a friendly display name for item type
function getItemTypeDisplayName(type: string): string {
  return type.charAt(0).toUpperCase() + type.slice(1).replace("_", " ");
}

// Add Item Form Component
function AddItemForm({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { addItemMutation } = useInventory();
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    type: ITEM_TYPES.ARTIFACT,
    rarity: RARITY_LEVELS.COMMON,
    imageUrl: "",
    quantity: 1,
    usesLeft: 0,
    isEquipped: false,
    attributes: null
  });
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };
  
  const handleSelectChange = (name: string, value: string) => {
    setFormData({
      ...formData,
      [name]: value
    });
  };
  
  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: parseInt(e.target.value)
    });
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addItemMutation.mutate(formData, {
      onSuccess: () => {
        onClose();
        setFormData({
          name: "",
          description: "",
          type: ITEM_TYPES.ARTIFACT,
          rarity: RARITY_LEVELS.COMMON,
          imageUrl: "",
          quantity: 1,
          usesLeft: 0,
          isEquipped: false,
          attributes: null
        });
      }
    });
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-sacred-dark border-sacred-gold/30">
        <DialogHeader>
          <DialogTitle className="text-sacred-gold">Add New Item</DialogTitle>
          <DialogDescription className="text-sacred-white/70">
            Add a new item to your inventory
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name" className="text-sacred-white">Name</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="bg-sacred-dark-lighter border-sacred-gold/20 text-sacred-white"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description" className="text-sacred-white">Description</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                className="bg-sacred-dark-lighter border-sacred-gold/20 text-sacred-white"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="type" className="text-sacred-white">Type</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) => handleSelectChange("type", value)}
                >
                  <SelectTrigger className="bg-sacred-dark-lighter border-sacred-gold/20 text-sacred-white">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent className="bg-sacred-dark border-sacred-gold/20">
                    {Object.values(ITEM_TYPES).map((type) => (
                      <SelectItem key={type} value={type} className="text-sacred-white">
                        {getItemTypeDisplayName(type)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="rarity" className="text-sacred-white">Rarity</Label>
                <Select
                  value={formData.rarity}
                  onValueChange={(value) => handleSelectChange("rarity", value)}
                >
                  <SelectTrigger className="bg-sacred-dark-lighter border-sacred-gold/20 text-sacred-white">
                    <SelectValue placeholder="Select rarity" />
                  </SelectTrigger>
                  <SelectContent className="bg-sacred-dark border-sacred-gold/20">
                    {Object.values(RARITY_LEVELS).map((rarity: string) => (
                      <SelectItem key={rarity} value={rarity} className="text-sacred-white">
                        {rarity.charAt(0).toUpperCase() + rarity.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="imageUrl" className="text-sacred-white">Image URL</Label>
              <Input
                id="imageUrl"
                name="imageUrl"
                value={formData.imageUrl}
                onChange={handleChange}
                placeholder="Enter image URL (optional)"
                className="bg-sacred-dark-lighter border-sacred-gold/20 text-sacred-white"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="quantity" className="text-sacred-white">Quantity</Label>
                <Input
                  id="quantity"
                  name="quantity"
                  type="number"
                  min="1"
                  value={formData.quantity}
                  onChange={handleNumberChange}
                  className="bg-sacred-dark-lighter border-sacred-gold/20 text-sacred-white"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="usesLeft" className="text-sacred-white">Uses Left</Label>
                <Input
                  id="usesLeft"
                  name="usesLeft"
                  type="number"
                  min="0"
                  value={formData.usesLeft}
                  onChange={handleNumberChange}
                  className="bg-sacred-dark-lighter border-sacred-gold/20 text-sacred-white"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="border-sacred-gold/30 text-sacred-gold hover:bg-sacred-gold/10"
            >
              Cancel
            </Button>
            <Button 
              type="submit"
              disabled={addItemMutation.isPending}
              className="bg-sacred-gold hover:bg-sacred-gold/90 text-sacred-dark"
            >
              {addItemMutation.isPending && (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              )}
              Add Item
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// Main inventory content component
export default function InventoryGrid() {
  const { user } = useAuth();
  const { 
    items, 
    equippedItems, 
    isLoading, 
    error, 
    toggleEquipMutation, 
    removeItemMutation 
  } = useInventory();
  
  const [isAddItemDialogOpen, setIsAddItemDialogOpen] = useState(false);
  
  // Check pending states and get the item id being processed
  const isToggleEquipPending = toggleEquipMutation.isPending;
  const isRemovePending = removeItemMutation.isPending;
  const pendingItemId = isToggleEquipPending 
    ? (toggleEquipMutation.variables as any)?.itemId
    : isRemovePending 
      ? (removeItemMutation.variables as any)
      : undefined;
  
  // Helper functions for handling item actions
  const handleToggleEquip = (itemId: number, equip: boolean) => {
    toggleEquipMutation.mutate({
      itemId,
      isEquipped: equip
    });
  };
  
  const handleRemoveItem = (itemId: number) => {
    if (confirm("Are you sure you want to remove this item from your inventory?")) {
      removeItemMutation.mutate(itemId);
    }
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-sacred-gold" />
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="text-center py-8 text-red-600">
        <p>Error loading inventory: {error.message}</p>
      </div>
    );
  }
  
  return (
    <>
      <Helmet>
        <title>Inventory | Akashic Archive</title>
        <meta name="description" content="Manage your sacred artifacts and items in the Akashic Archive" />
      </Helmet>
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div className="z-10 relative">
            <h1 className="text-3xl font-bold font-serif text-sacred-gold mb-1">
              Arcane Repository
              <span className="absolute -top-3 -right-4 text-xs text-amber-400/80 font-normal rotate-12 italic">Grid View</span>
            </h1>
            <p className="text-sm text-sacred-white/70 font-serif italic">
              Manage your sacred artifacts and mystical relics
            </p>
            
            {/* Decorative underline */}
            <div className="h-0.5 w-48 mt-2 bg-gradient-to-r from-transparent via-sacred-gold/70 to-transparent"></div>
          </div>
          
          <div className="flex space-x-3 z-10">
            <Link href="/inventory">
              <Button 
                variant="outline"
                className="border-sacred-gold/30 text-sacred-gold hover:bg-sacred-gold/10 font-serif 
                          shadow-md hover:shadow-sacred-gold/20"
              >
                <ListIcon className="h-4 w-4 mr-2" />
                Scroll View
              </Button>
            </Link>
            <Button 
              onClick={() => setIsAddItemDialogOpen(true)}
              className="bg-gradient-to-r from-sacred-gold/90 to-amber-600/90
                        hover:from-sacred-gold hover:to-amber-600
                        text-sacred-dark font-serif font-medium shadow-md hover:shadow-sacred-gold/20"
            >
              Add New Artifact
            </Button>
          </div>
        </div>
        
        <AddItemForm 
          isOpen={isAddItemDialogOpen} 
          onClose={() => setIsAddItemDialogOpen(false)} 
        />
        
        {/* Stylized container with border glints */}
        <div className="relative bg-gradient-to-r from-sacred-dark to-sacred-dark-lighter 
                      p-8 rounded-xl shadow-xl mb-8 border border-sacred-gold/30
                      overflow-hidden">
          {/* Corner decorative elements */}
          <div className="absolute top-0 left-0 w-16 h-16 border-t-2 border-l-2 border-sacred-gold/40 rounded-tl-xl opacity-70"></div>
          <div className="absolute top-0 right-0 w-16 h-16 border-t-2 border-r-2 border-sacred-gold/40 rounded-tr-xl opacity-70"></div>
          <div className="absolute bottom-0 left-0 w-16 h-16 border-b-2 border-l-2 border-sacred-gold/40 rounded-bl-xl opacity-70"></div>
          <div className="absolute bottom-0 right-0 w-16 h-16 border-b-2 border-r-2 border-sacred-gold/40 rounded-br-xl opacity-70"></div>
          
          {/* Magical ambient elements */}
          <div className="absolute -top-20 -right-20 w-40 h-40 rounded-full bg-purple-500/5 blur-3xl"></div>
          <div className="absolute -bottom-20 -left-20 w-40 h-40 rounded-full bg-amber-500/5 blur-3xl"></div>
          
          <Tabs defaultValue="all" className="w-full relative z-10">
            <div className="overflow-x-auto pb-2">
              <TabsList className="mb-6 bg-sacred-dark-lighter/70 border border-sacred-gold/20 p-1 rounded-lg shadow-inner backdrop-blur-sm">
                <TabsTrigger 
                  value="all" 
                  className="data-[state=active]:bg-sacred-gold/10 data-[state=active]:text-sacred-gold
                            data-[state=active]:shadow-md rounded-md font-serif"
                >
                  All Items ({items?.length || 0})
                </TabsTrigger>
                <TabsTrigger 
                  value="equipped"
                  className="data-[state=active]:bg-sacred-blue/10 data-[state=active]:text-sacred-blue
                            data-[state=active]:shadow-md rounded-md font-serif"
                >
                  Equipped ({equippedItems?.length || 0})
                </TabsTrigger>
                {Object.values(ITEM_TYPES).map((type: string) => {
                  const count = items?.filter((item: InventoryItem) => item.type === type).length || 0;
                  if (count === 0) return null;
                  return (
                    <TabsTrigger 
                      key={type} 
                      value={type}
                      className="data-[state=active]:bg-sacred-secondary/10 data-[state=active]:text-sacred-secondary
                                data-[state=active]:shadow-md rounded-md font-serif"
                    >
                      {getItemTypeDisplayName(type)} ({count})
                    </TabsTrigger>
                  );
                })}
              </TabsList>
            </div>
            
            <TabsContent value="all">
              <InventoryGridComponent
                items={items || []}
                toggleEquip={handleToggleEquip}
                removeItem={handleRemoveItem}
                isToggleEquipPending={isToggleEquipPending}
                isRemovePending={isRemovePending}
                pendingItemId={pendingItemId}
              />
            </TabsContent>
            
            <TabsContent value="equipped">
              <InventoryGridComponent
                items={equippedItems || []}
                toggleEquip={handleToggleEquip}
                removeItem={handleRemoveItem}
                isToggleEquipPending={isToggleEquipPending}
                isRemovePending={isRemovePending}
                pendingItemId={pendingItemId}
                emptyMessage="You have no equipped items. Equip items to enhance your abilities."
              />
            </TabsContent>
            
            {/* Tabs for each item type */}
            {Object.values(ITEM_TYPES).map((type: string) => {
              const typeItems = items?.filter((item: InventoryItem) => item.type === type) || [];
              if (typeItems.length === 0) return null;
              
              return (
                <TabsContent key={type} value={type}>
                  <InventoryGridComponent
                    items={typeItems}
                    toggleEquip={handleToggleEquip}
                    removeItem={handleRemoveItem}
                    isToggleEquipPending={isToggleEquipPending}
                    isRemovePending={isRemovePending}
                    pendingItemId={pendingItemId}
                    emptyMessage={`No ${getItemTypeDisplayName(type).toLowerCase()} items found.`}
                  />
                </TabsContent>
              );
            })}
          </Tabs>
        </div>
      </div>
    </>
  );
}