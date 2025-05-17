import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Scroll, ShieldCheck, Sparkles } from "lucide-react";
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

// Import minimal divider
import ornateDividerSrc from "@/assets/ornate-divider.svg";

// Import custom styles for white background
import "./styles/inventory-white.css";

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

// Main inventory content component with simplified design
export default function InventoryGrid() {
  // Define state hooks before any conditional returns
  const [isAddItemDialogOpen, setIsAddItemDialogOpen] = useState(false);
  const [isPageLoaded, setIsPageLoaded] = useState(false);
  
  // Animation effect when page loads
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsPageLoaded(true);
    }, 300);
    
    return () => clearTimeout(timer);
  }, []);
  
  const { user } = useAuth();
  const { 
    items, 
    equippedItems, 
    isLoading, 
    error, 
    toggleEquipMutation, 
    removeItemMutation 
  } = useInventory();
  
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
      <div className="flex justify-center items-center min-h-[50vh]">
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
        <title>Arcane Repository | Akashic Archive</title>
        <meta name="description" content="Browse your mystical artifacts and relics in the Akashic Archive" />
      </Helmet>
      
      {/* Container with white background */}
      <div className="inventory-page">
        <div className="container mx-auto p-4 max-w-6xl">
          {/* Header */}
          <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold font-serif text-sacred-gold">
                Arcane Repository
              </h1>
              <p className="text-sm text-gray-700 font-serif italic mt-1">
                Manage your sacred artifacts and mystical relics
              </p>
              
              {/* Simple ornate divider */}
              <div className="relative h-4 w-40 mt-2">
                <img src={ornateDividerSrc} alt="" className="h-full w-full object-contain" />
              </div>
            </div>
            
            <Button 
              onClick={() => setIsAddItemDialogOpen(true)}
              className="mt-4 sm:mt-0 bg-sacred-gold hover:bg-sacred-gold/90 text-sacred-dark font-serif"
            >
              Add New Artifact
            </Button>
          </div>
          
          {/* Stats bar */}
          <div className="flex flex-wrap gap-3 mb-6">
            <div className="bg-gray-100 rounded px-3 py-1 flex items-center border border-sacred-gold/30">
              <Scroll className="h-4 w-4 text-sacred-gold mr-2" />
              <span className="text-gray-700 text-sm">
                Items: <span className="text-sacred-gold font-medium">{items?.length || 0}</span>
              </span>
            </div>
            <div className="bg-gray-100 rounded px-3 py-1 flex items-center border border-sacred-gold/30">
              <ShieldCheck className="h-4 w-4 text-sacred-blue mr-2" />
              <span className="text-gray-700 text-sm">
                Equipped: <span className="text-sacred-blue font-medium">{equippedItems?.length || 0}</span>
              </span>
            </div>
            <div className="bg-gray-100 rounded px-3 py-1 flex items-center border border-sacred-gold/30">
              <Sparkles className="h-4 w-4 text-purple-400 mr-2" />
              <span className="text-gray-700 text-sm">
                Rare+: <span className="text-purple-400 font-medium">
                  {items?.filter(item => 
                    ['rare', 'epic', 'legendary', 'mythic', 'divine'].includes(item.rarity)
                  ).length || 0}
                </span>
              </span>
            </div>
          </div>
          
          {/* Add item dialog */}
          <AddItemForm 
            isOpen={isAddItemDialogOpen} 
            onClose={() => setIsAddItemDialogOpen(false)} 
          />
          
          {/* Main content with tabs - simplified version */}
          <div className={`
            transition-opacity duration-500 
            ${isPageLoaded ? 'opacity-100' : 'opacity-0'}
          `}>
            <Tabs defaultValue="all" className="w-full">
              {/* Tabs list */}
              <TabsList className="w-full bg-gray-100 mb-6 p-1 border border-sacred-gold/30 rounded-lg flex flex-wrap">
                <TabsTrigger 
                  value="all" 
                  className="data-[state=active]:bg-sacred-gold/20 data-[state=active]:text-sacred-gold
                            font-serif px-4 py-2 rounded-md border border-gray-200 text-black"
                >
                  All Items
                </TabsTrigger>
                <TabsTrigger 
                  value="equipped" 
                  className="data-[state=active]:bg-sacred-blue/20 data-[state=active]:text-sacred-blue
                            font-serif px-4 py-2 rounded-md border border-gray-200 text-black"
                >
                  Equipped
                </TabsTrigger>
                <TabsTrigger 
                  value="artifacts" 
                  className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-400
                            font-serif px-4 py-2 rounded-md border border-gray-200 text-black"
                >
                  Artifacts
                </TabsTrigger>
                <TabsTrigger 
                  value="keys" 
                  className="data-[state=active]:bg-green-500/20 data-[state=active]:text-green-400
                            font-serif px-4 py-2 rounded-md border border-gray-200 text-black"
                >
                  Keys
                </TabsTrigger>
                <TabsTrigger 
                  value="resources" 
                  className="data-[state=active]:bg-amber-500/20 data-[state=active]:text-amber-400
                            font-serif px-4 py-2 rounded-md border border-gray-200 text-black"
                >
                  Resources
                </TabsTrigger>
              </TabsList>
              
              {/* Tab content */}
              <div className="bg-gray-50 p-4 rounded-lg border border-sacred-gold/30 shadow-sm">
                <TabsContent value="all" className="m-0">
                  <InventoryGridComponent 
                    items={items || []}
                    toggleEquip={handleToggleEquip}
                    removeItem={handleRemoveItem}
                    isToggleEquipPending={isToggleEquipPending}
                    isRemovePending={isRemovePending}
                    pendingItemId={pendingItemId}
                  />
                </TabsContent>
                <TabsContent value="equipped" className="m-0">
                  <InventoryGridComponent 
                    items={equippedItems || []}
                    toggleEquip={handleToggleEquip}
                    removeItem={handleRemoveItem}
                    isToggleEquipPending={isToggleEquipPending}
                    isRemovePending={isRemovePending}
                    pendingItemId={pendingItemId}
                    emptyMessage="You have no equipped items. Equip artifacts to enhance your powers."
                  />
                </TabsContent>
                <TabsContent value="artifacts" className="m-0">
                  <InventoryGridComponent 
                    items={(items || []).filter(item => item.type === ITEM_TYPES.ARTIFACT)}
                    toggleEquip={handleToggleEquip}
                    removeItem={handleRemoveItem}
                    isToggleEquipPending={isToggleEquipPending}
                    isRemovePending={isRemovePending}
                    pendingItemId={pendingItemId}
                    emptyMessage="No artifact items found. Discover sacred relics on your journey."
                  />
                </TabsContent>
                <TabsContent value="keys" className="m-0">
                  <InventoryGridComponent 
                    items={(items || []).filter(item => item.type === ITEM_TYPES.KEY)}
                    toggleEquip={handleToggleEquip}
                    removeItem={handleRemoveItem}
                    isToggleEquipPending={isToggleEquipPending}
                    isRemovePending={isRemovePending}
                    pendingItemId={pendingItemId}
                    emptyMessage="No key items found. Seek out keys to unlock hidden knowledge."
                  />
                </TabsContent>
                <TabsContent value="resources" className="m-0">
                  <InventoryGridComponent 
                    items={(items || []).filter(item => item.type === ITEM_TYPES.RESOURCE)}
                    toggleEquip={handleToggleEquip}
                    removeItem={handleRemoveItem}
                    isToggleEquipPending={isToggleEquipPending}
                    isRemovePending={isRemovePending}
                    pendingItemId={pendingItemId}
                    emptyMessage="No resources found. Gather mystical components for crafting."
                  />
                </TabsContent>
              </div>
            </Tabs>
          </div>
        </div>
      </div>
    </>
  );
}