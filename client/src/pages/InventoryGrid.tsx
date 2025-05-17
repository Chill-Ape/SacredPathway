import React, { useState, useEffect } from "react";
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
import { Loader2, Grid, ListIcon, Scroll, ShieldCheck, Sparkles } from "lucide-react";
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

// Import game UI assets
import inventoryFrameSrc from "@/assets/inventory-frame.svg";
import inventoryBgSrc from "@/assets/inventory-bg.svg";
import ornateDividerSrc from "@/assets/ornate-divider.svg";

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
        <title>Arcane Repository | Akashic Archive</title>
        <meta name="description" content="Browse your mystical artifacts and relics in the Akashic Archive" />
      </Helmet>
      
      {/* Page-specific background with texture */}
      <div 
        className="min-h-[calc(100vh-64px)] py-4 md:py-8 px-0 overflow-x-hidden"
        style={{
          backgroundImage: `url(${inventoryBgSrc})`,
          backgroundSize: '200px 200px',
          backgroundRepeat: 'repeat',
          backgroundAttachment: 'fixed'
        }}
      >
        {/* Game-like inventory frame */}
        <div 
          className={`
            relative container mx-auto px-2 sm:px-4 md:px-6 py-4 md:py-6 max-w-7xl
            transition-all duration-1000 ease-in-out 
            ${isPageLoaded ? 'opacity-100 transform-none' : 'opacity-0 translate-y-10'}
          `}
        >
          {/* Main ornate frame */}
          <div className="absolute inset-0" style={{ 
            backgroundImage: `url(${inventoryFrameSrc})`,
            backgroundSize: '100% 100%',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            pointerEvents: 'none',
            zIndex: 5
          }}></div>
          
          {/* Inner content area - significantly inset to stay within the frame */}
          <div className="relative z-10 py-4 px-4 mx-4 my-4 md:mx-10 md:my-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 md:mb-6 gap-3 px-3 md:px-6">
              <div className="relative px-2 py-1">
                <h1 className="text-2xl md:text-3xl font-bold font-serif text-sacred-gold mb-1 drop-shadow-[0_2px_3px_rgba(0,0,0,0.5)]">
                  Arcane Repository
                </h1>
                <p className="text-xs md:text-sm text-sacred-white/70 font-serif italic">
                  Manage your sacred artifacts and mystical relics
                </p>
                
                {/* Ornate divider */}
                <div className="relative h-5 md:h-6 w-40 md:w-48 mt-1 md:mt-2">
                  <img src={ornateDividerSrc} alt="" className="absolute h-full w-full object-contain" />
                </div>
                
                {/* Inventory stats */}
                <div className="flex flex-wrap gap-2 md:gap-4 mt-3 text-xs text-sacred-white/70 font-serif">
                  <div className="flex items-center">
                    <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-sacred-gold/10 mr-1">
                      <Scroll className="h-3 w-3 text-sacred-gold/80" />
                    </span>
                    <span>Items: <span className="text-sacred-gold font-medium">{items?.length || 0}</span></span>
                  </div>
                  <div className="flex items-center">
                    <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-sacred-blue/10 mr-1">
                      <ShieldCheck className="h-3 w-3 text-sacred-blue/80" />
                    </span>
                    <span>Equipped: <span className="text-sacred-blue font-medium">{equippedItems?.length || 0}</span></span>
                  </div>
                  <div className="flex items-center">
                    <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-purple-500/10 mr-1">
                      <Sparkles className="h-3 w-3 text-purple-400/80" />
                    </span>
                    <span>Rare+: <span className="text-purple-400 font-medium">
                      {items?.filter((item: InventoryItem) => 
                        item.rarity === RARITY_LEVELS.RARE || 
                        item.rarity === RARITY_LEVELS.EPIC || 
                        item.rarity === RARITY_LEVELS.LEGENDARY || 
                        item.rarity === RARITY_LEVELS.MYTHIC || 
                        item.rarity === RARITY_LEVELS.DIVINE
                      ).length || 0}
                    </span></span>
                  </div>
                </div>
              </div>
              
              <div className="flex space-x-3 self-center md:self-end mt-2 md:mt-0 mb-1 md:mb-2 z-10">
                <Button 
                  onClick={() => setIsAddItemDialogOpen(true)}
                  className="bg-gradient-to-r from-sacred-gold/90 to-amber-600/90
                            hover:from-sacred-gold hover:to-amber-600
                            text-sacred-dark font-serif font-medium shadow-md hover:shadow-sacred-gold/20
                            text-sm md:text-base"
                >
                  Add New Artifact
                </Button>
              </div>
            </div>
            
            <AddItemForm 
              isOpen={isAddItemDialogOpen} 
              onClose={() => setIsAddItemDialogOpen(false)} 
            />
            
            {/* Main inventory container - reduced margins to contain within frame */}
            <div className="relative bg-black/40 backdrop-blur-sm rounded-lg mt-2 mb-2 md:mb-4 overflow-hidden"
                style={{ 
                  boxShadow: 'inset 0 0 30px rgba(0,0,0,0.6), 0 0 10px rgba(0,0,0,0.4)'
                }}
            >
              {/* Ornate corners */}
              <div className="absolute top-0 left-0 w-10 h-10 md:w-16 md:h-16 border-t-2 border-l-2 border-sacred-gold/40 rounded-tl-lg"></div>
              <div className="absolute top-0 right-0 w-10 h-10 md:w-16 md:h-16 border-t-2 border-r-2 border-sacred-gold/40 rounded-tr-lg"></div>
              <div className="absolute bottom-0 left-0 w-10 h-10 md:w-16 md:h-16 border-b-2 border-l-2 border-sacred-gold/40 rounded-bl-lg"></div>
              <div className="absolute bottom-0 right-0 w-10 h-10 md:w-16 md:h-16 border-b-2 border-r-2 border-sacred-gold/40 rounded-br-lg"></div>
              
              {/* Magic ambient glows */}
              <div className="absolute top-1/3 left-1/4 w-40 md:w-64 h-40 md:h-64 rounded-full radial-pulse bg-purple-800/5 blur-3xl"></div>
              <div className="absolute bottom-1/3 right-1/4 w-40 md:w-64 h-40 md:h-64 rounded-full radial-pulse bg-blue-800/5 blur-3xl"></div>
              
              <Tabs defaultValue="all" className="w-full relative z-10 p-2 md:p-4">
                {/* Inventory type tabs */}
                <div className="overflow-x-auto max-w-full pb-2 md:pb-4">
                  <div className="relative w-full">
                    <TabsList className="bg-sacred-dark-lightest/50 border border-sacred-gold/20 p-1.5 md:p-2 rounded-lg 
                                       shadow-inner backdrop-blur-sm w-full flex flex-nowrap md:flex-wrap justify-start overflow-x-auto">
                      <TabsTrigger 
                        value="all" 
                        className="data-[state=active]:bg-sacred-gold/30 data-[state=active]:text-sacred-gold
                                  data-[state=active]:shadow-lg rounded-md font-serif py-1.5 md:py-2 px-3 md:px-4 mr-1 md:mr-2
                                  border border-sacred-gold/20 shadow-md backdrop-blur-sm
                                  transition-all duration-300 flex-none"
                      >
                        <span className="flex items-center whitespace-nowrap">
                          <span className="mr-1 md:mr-1.5 text-base md:text-lg">⦿</span>
                          <span className="text-xs md:text-sm">All Items ({items?.length || 0})</span>
                        </span>
                      </TabsTrigger>
                      <TabsTrigger 
                        value="equipped"
                        className="data-[state=active]:bg-sacred-blue/30 data-[state=active]:text-sacred-blue
                                  data-[state=active]:shadow-lg rounded-md font-serif py-1.5 md:py-2 px-3 md:px-4 mr-1 md:mr-2
                                  border border-sacred-blue/20 shadow-md backdrop-blur-sm
                                  transition-all duration-300 flex-none"
                      >
                        <span className="flex items-center whitespace-nowrap">
                          <ShieldCheck className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-1.5" />
                          <span className="text-xs md:text-sm">Equipped ({equippedItems?.length || 0})</span>
                        </span>
                      </TabsTrigger>
                      {Object.values(ITEM_TYPES).map((type: string) => {
                        const count = items?.filter((item: InventoryItem) => item.type === type).length || 0;
                        if (count === 0) return null;
                        return (
                          <TabsTrigger 
                            key={type} 
                            value={type}
                            className="data-[state=active]:bg-sacred-secondary/30 data-[state=active]:text-sacred-secondary
                                      data-[state=active]:shadow-lg rounded-md font-serif py-1.5 md:py-2 px-3 md:px-4 mr-1 md:mr-2 md:mb-2
                                      border border-sacred-secondary/20 shadow-md backdrop-blur-sm
                                      transition-all duration-300 flex-none"
                          >
                            <span className="flex items-center whitespace-nowrap">
                              <span className="mr-1 md:mr-1.5 text-base md:text-lg">◈</span>
                              <span className="text-xs md:text-sm">{getItemTypeDisplayName(type)} ({count})</span>
                            </span>
                          </TabsTrigger>
                        );
                      })}
                    </TabsList>
                  </div>
                </div>
                
                {/* Tab content - All items */}
                <TabsContent value="all" className="pt-2 transition-opacity duration-300 ease-in-out">
                  <InventoryGridComponent
                    items={items || []}
                    toggleEquip={handleToggleEquip}
                    removeItem={handleRemoveItem}
                    isToggleEquipPending={isToggleEquipPending}
                    isRemovePending={isRemovePending}
                    pendingItemId={pendingItemId}
                  />
                </TabsContent>
                
                {/* Tab content - Equipped items */}
                <TabsContent value="equipped" className="pt-2 transition-opacity duration-300 ease-in-out">
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
                    <TabsContent key={type} value={type} className="pt-2 transition-opacity duration-300 ease-in-out">
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
        </div>
      </div>
    </>
  );
}