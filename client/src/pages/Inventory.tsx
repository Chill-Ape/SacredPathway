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
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Grid } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { InventoryProvider, useInventory, InventoryItem } from "@/hooks/use-inventory";
import { Link } from "wouter";
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

// Function to get color based on rarity
function getRarityColor(rarity: string | null): string {
  switch (rarity) {
    case RARITY_LEVELS.COMMON:
      return "bg-gray-200 text-gray-800";
    case RARITY_LEVELS.UNCOMMON:
      return "bg-green-200 text-green-800";
    case RARITY_LEVELS.RARE:
      return "bg-blue-200 text-blue-800";
    case RARITY_LEVELS.EPIC:
      return "bg-purple-200 text-purple-800";
    case RARITY_LEVELS.LEGENDARY:
      return "bg-amber-200 text-amber-800";
    case RARITY_LEVELS.MYTHIC:
      return "bg-red-200 text-red-800";
    case RARITY_LEVELS.DIVINE:
      return "bg-indigo-200 text-indigo-800";
    default:
      return "bg-gray-200 text-gray-800";
  }
}

// Function to get a friendly display name for item type
function getItemTypeDisplayName(type: string): string {
  return type.charAt(0).toUpperCase() + type.slice(1).replace("_", " ");
}

// Item card component
function InventoryItemCard({ item }: { item: InventoryItem }) {
  const { toggleEquipMutation, removeItemMutation } = useInventory();
  
  const handleToggleEquip = () => {
    toggleEquipMutation.mutate({
      itemId: item.id,
      isEquipped: !item.isEquipped
    });
  };
  
  const handleRemove = () => {
    if (confirm("Are you sure you want to remove this item from your inventory?")) {
      removeItemMutation.mutate(item.id);
    }
  };
  
  // Determine the glow effect based on rarity
  const getGlowEffect = (rarity: string | null) => {
    switch(rarity) {
      case RARITY_LEVELS.COMMON:
        return "hover:shadow-md";
      case RARITY_LEVELS.UNCOMMON:
        return "hover:shadow-md hover:shadow-green-200";
      case RARITY_LEVELS.RARE:
        return "hover:shadow-md hover:shadow-blue-300";
      case RARITY_LEVELS.EPIC:
        return "hover:shadow-md hover:shadow-purple-300";
      case RARITY_LEVELS.LEGENDARY:
        return "hover:shadow-md hover:shadow-amber-300";
      case RARITY_LEVELS.MYTHIC:
        return "hover:shadow-md hover:shadow-red-300";
      case RARITY_LEVELS.DIVINE:
        return "hover:shadow-md hover:shadow-indigo-300";
      default:
        return "hover:shadow-md";
    }
  };
  
  return (
    <Card className={`h-full flex flex-col transition-all duration-300 ${getGlowEffect(item.rarity)} ${item.isEquipped ? 'border-sacred-blue' : ''}`}>
      <div className="relative">
        {item.imageUrl && (
          <div className="overflow-hidden rounded-t-lg">
            <img
              src={item.imageUrl}
              alt={item.name}
              className="w-full h-40 object-cover transform hover:scale-105 transition-transform duration-500"
            />
          </div>
        )}
        <Badge className={`${getRarityColor(item.rarity)} absolute top-2 right-2`}>
          {item.rarity ? item.rarity.charAt(0).toUpperCase() + item.rarity.slice(1) : "Common"}
        </Badge>
        {item.isEquipped && (
          <div className="absolute top-2 left-2 bg-sacred-blue text-white text-xs px-2 py-1 rounded-full">
            Equipped
          </div>
        )}
      </div>
      
      <CardHeader className="pb-2 pt-3">
        <CardTitle className="text-lg font-serif">{item.name}</CardTitle>
        <CardDescription className="flex justify-between items-center">
          <span>{getItemTypeDisplayName(item.type)}</span>
          {item.quantity > 1 && (
            <Badge variant="outline" className="ml-auto">
              x{item.quantity}
            </Badge>
          )}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="flex-grow">
        <p className="text-sm text-muted-foreground">{item.description}</p>
        {item.usesLeft !== null && item.usesLeft > 0 && (
          <div className="mt-2 text-xs">
            <span className="text-muted-foreground">Uses remaining: </span>
            <span className="font-medium">{item.usesLeft}</span>
          </div>
        )}
      </CardContent>
      
      <CardFooter className="flex justify-between pt-2 pb-3">
        <Button 
          variant={item.isEquipped ? "default" : "outline"} 
          size="sm"
          onClick={handleToggleEquip}
          disabled={toggleEquipMutation.isPending}
          className={item.isEquipped 
            ? "bg-sacred-blue hover:bg-sacred-blue-light text-white" 
            : "hover:border-sacred-blue hover:text-sacred-blue"}
        >
          {toggleEquipMutation.isPending && item.id === (toggleEquipMutation.variables as any)?.itemId ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : null}
          {item.isEquipped ? "Unequip" : "Equip"}
        </Button>
        <Button 
          variant="outline" 
          size="sm"
          onClick={handleRemove}
          disabled={removeItemMutation.isPending}
          className="hover:bg-red-50 hover:text-red-600 hover:border-red-200"
        >
          {removeItemMutation.isPending && item.id === (removeItemMutation.variables as any) ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : null}
          Remove
        </Button>
      </CardFooter>
    </Card>
  );
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
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Item</DialogTitle>
          <DialogDescription>
            Add a new item to your inventory
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="type">Type</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) => handleSelectChange("type", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.values(ITEM_TYPES).map((type) => (
                      <SelectItem key={type} value={type}>
                        {getItemTypeDisplayName(type)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="rarity">Rarity</Label>
                <Select
                  value={formData.rarity}
                  onValueChange={(value) => handleSelectChange("rarity", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select rarity" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.values(RARITY_LEVELS).map((rarity) => (
                      <SelectItem key={rarity} value={rarity}>
                        {rarity.charAt(0).toUpperCase() + rarity.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="imageUrl">Image URL</Label>
              <Input
                id="imageUrl"
                name="imageUrl"
                value={formData.imageUrl}
                onChange={handleChange}
                placeholder="Enter image URL (optional)"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="quantity">Quantity</Label>
                <Input
                  id="quantity"
                  name="quantity"
                  type="number"
                  min="1"
                  value={formData.quantity}
                  onChange={handleNumberChange}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="usesLeft">Uses Left</Label>
                <Input
                  id="usesLeft"
                  name="usesLeft"
                  type="number"
                  min="0"
                  value={formData.usesLeft}
                  onChange={handleNumberChange}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button 
              type="submit"
              disabled={addItemMutation.isPending}
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
function InventoryContent() {
  const { user } = useAuth();
  const { items, equippedItems, isLoading, error } = useInventory();
  const [isAddItemDialogOpen, setIsAddItemDialogOpen] = useState(false);
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
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
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold font-serif text-sacred-gold mb-1">Akashic Inventory</h1>
          <p className="text-sm text-muted-foreground">Manage your sacred artifacts and mystical items</p>
        </div>
        <div className="flex space-x-3">
          <Link href="/inventory-grid">
            <Button 
              variant="outline"
              className="border-sacred-gold/30 text-sacred-gold hover:bg-sacred-gold/10"
            >
              <Grid className="h-4 w-4 mr-2" />
              Grid View
            </Button>
          </Link>
          <Button 
            onClick={() => setIsAddItemDialogOpen(true)}
            className="bg-sacred-gold hover:bg-sacred-gold/90 text-sacred-dark"
          >
            Add New Item
          </Button>
        </div>
      </div>
      
      <AddItemForm 
        isOpen={isAddItemDialogOpen} 
        onClose={() => setIsAddItemDialogOpen(false)} 
      />
      
      <div className="bg-gradient-to-r from-sacred-dark-light to-sacred-dark-lighter p-6 rounded-xl shadow-lg mb-8">
        <Tabs defaultValue="all" className="w-full">
          <div className="overflow-x-auto pb-2">
            <TabsList className="mb-6 bg-sacred-dark-lightest border border-sacred-gold/20">
              <TabsTrigger 
                value="all" 
                className="data-[state=active]:bg-sacred-gold/10 data-[state=active]:text-sacred-gold"
              >
                All Items ({items?.length || 0})
              </TabsTrigger>
              <TabsTrigger 
                value="equipped"
                className="data-[state=active]:bg-sacred-blue/10 data-[state=active]:text-sacred-blue"
              >
                Equipped ({equippedItems?.length || 0})
              </TabsTrigger>
              {Object.values(ITEM_TYPES).map((type) => {
                const count = items?.filter((item: InventoryItem) => item.type === type).length || 0;
                if (count === 0) return null;
                return (
                  <TabsTrigger 
                    key={type} 
                    value={type}
                    className="data-[state=active]:bg-sacred-secondary/10 data-[state=active]:text-sacred-secondary"
                  >
                    {getItemTypeDisplayName(type)} ({count})
                  </TabsTrigger>
                );
              })}
            </TabsList>
          </div>
          
          <TabsContent value="all">
            {items && items.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {items.map((item: InventoryItem) => (
                  <InventoryItemCard key={item.id} item={item} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 border border-sacred-gold/10 rounded-lg bg-sacred-dark-lightest">
                <p className="text-sacred-white/70">Your inventory is empty. Seek out artifacts in your journey.</p>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="equipped">
            {equippedItems && equippedItems.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {equippedItems.map((item: InventoryItem) => (
                  <InventoryItemCard key={item.id} item={item} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 border border-sacred-gold/10 rounded-lg bg-sacred-dark-lightest">
                <p className="text-sacred-white/70">You have no equipped items. Equip items to enhance your abilities.</p>
              </div>
            )}
          </TabsContent>
          
          {Object.values(ITEM_TYPES).map((type) => (
            <TabsContent key={type} value={type}>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {items?.filter((item: InventoryItem) => item.type === type).map((item: InventoryItem) => (
                  <InventoryItemCard key={item.id} item={item} />
                ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  );
}

// Inventory page with provider
export default function InventoryPage() {
  const { user, isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }
  
  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-3xl font-bold mb-4">Inventory Access</h1>
        <p className="mb-6">Please log in to view your inventory.</p>
        <Button 
          onClick={() => window.location.href = "/auth"}
          className="bg-sacred-blue hover:bg-sacred-blue-light text-sacred-white"
        >
          Log In
        </Button>
      </div>
    );
  }
  
  return (
    <InventoryProvider>
      <InventoryContent />
    </InventoryProvider>
  );
}