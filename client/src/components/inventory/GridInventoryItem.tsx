import React from "react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { InventoryItem } from "@/hooks/use-inventory";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { Button } from "@/components/ui/button";
import { Loader2, Info, ShieldCheck, Trash2 } from "lucide-react";

// Rarity levels
const RARITY_LEVELS = {
  COMMON: "common", 
  UNCOMMON: "uncommon",
  RARE: "rare",
  EPIC: "epic",
  LEGENDARY: "legendary",
  MYTHIC: "mythic",
  DIVINE: "divine"
};

// Function to get color based on rarity for both border and glow
function getRarityColors(rarity: string | null): { border: string; glow: string; bg: string } {
  switch (rarity) {
    case RARITY_LEVELS.COMMON:
      return { 
        border: "border-gray-400", 
        glow: "shadow-gray-400/40", 
        bg: "bg-gray-200 text-gray-800" 
      };
    case RARITY_LEVELS.UNCOMMON:
      return { 
        border: "border-green-500", 
        glow: "shadow-green-500/40", 
        bg: "bg-green-200 text-green-800" 
      };
    case RARITY_LEVELS.RARE:
      return { 
        border: "border-blue-500", 
        glow: "shadow-blue-500/40", 
        bg: "bg-blue-200 text-blue-800" 
      };
    case RARITY_LEVELS.EPIC:
      return { 
        border: "border-purple-500", 
        glow: "shadow-purple-500/40", 
        bg: "bg-purple-200 text-purple-800" 
      };
    case RARITY_LEVELS.LEGENDARY:
      return { 
        border: "border-amber-500", 
        glow: "shadow-amber-500/40", 
        bg: "bg-amber-200 text-amber-800" 
      };
    case RARITY_LEVELS.MYTHIC:
      return { 
        border: "border-red-500", 
        glow: "shadow-red-500/40", 
        bg: "bg-red-200 text-red-800" 
      };
    case RARITY_LEVELS.DIVINE:
      return { 
        border: "border-indigo-500", 
        glow: "shadow-indigo-500/40", 
        bg: "bg-indigo-200 text-indigo-800" 
      };
    default:
      return { 
        border: "border-gray-400", 
        glow: "shadow-gray-400/40", 
        bg: "bg-gray-200 text-gray-800" 
      };
  }
}

// Default placeholder image when no image is available
const defaultItemImage = "/assets/default_item.svg";

interface GridInventoryItemProps {
  item: InventoryItem;
  toggleEquip: (itemId: number, equip: boolean) => void;
  removeItem: (itemId: number) => void;
  isToggleEquipPending: boolean;
  isRemovePending: boolean;
  pendingItemId?: number;
}

export default function GridInventoryItem({ 
  item, 
  toggleEquip, 
  removeItem,
  isToggleEquipPending,
  isRemovePending,
  pendingItemId
}: GridInventoryItemProps) {
  const { border, glow, bg } = getRarityColors(item.rarity);
  const isPendingEquip = isToggleEquipPending && pendingItemId === item.id;
  const isPendingRemove = isRemovePending && pendingItemId === item.id;
  
  return (
    <HoverCard>
      <HoverCardTrigger asChild>
        <div 
          className={`
            relative aspect-square rounded-lg overflow-hidden 
            border-2 ${border} 
            transition duration-300 ease-in-out
            hover:scale-105 hover:shadow-lg hover:${glow}
            ${item.isEquipped ? 'ring-2 ring-sacred-blue ring-offset-1' : ''}
            bg-sacred-dark-lightest cursor-pointer
          `}
        >
          {/* Item Image */}
          <div className="w-full h-full flex items-center justify-center">
            <img 
              src={item.imageUrl || defaultItemImage} 
              alt={item.name}
              className="h-full w-full object-contain p-2" 
              onError={(e) => {
                (e.target as HTMLImageElement).src = defaultItemImage;
              }}
            />
          </div>
          
          {/* Equipped Indicator */}
          {item.isEquipped && (
            <div className="absolute top-1 left-1">
              <ShieldCheck className="h-5 w-5 text-sacred-blue drop-shadow" />
            </div>
          )}
          
          {/* Quantity Badge */}
          {item.quantity > 1 && (
            <div className="absolute bottom-1 right-1 bg-black/70 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
              {item.quantity}
            </div>
          )}
          
          {/* Rarity Badge */}
          <div className="absolute top-1 right-1">
            <Badge className={bg + " text-xs"}>
              {item.rarity ? item.rarity.charAt(0).toUpperCase() : "C"}
            </Badge>
          </div>
          
          {/* Name Tooltip on Hover */}
          <div className="absolute inset-x-0 bottom-0 px-2 py-1 bg-black/60 backdrop-blur-sm">
            <p className="text-xs text-white font-medium truncate">{item.name}</p>
          </div>
        </div>
      </HoverCardTrigger>
      
      {/* Detailed view on hover */}
      <HoverCardContent className="w-80 bg-sacred-dark-lightest border border-sacred-gold/30 text-sacred-white p-4">
        <div className="flex flex-col space-y-3">
          <div className="flex items-start">
            <div className="h-16 w-16 rounded overflow-hidden mr-3 flex-shrink-0">
              <img 
                src={item.imageUrl || defaultItemImage} 
                alt={item.name}
                className="h-full w-full object-contain" 
                onError={(e) => {
                  (e.target as HTMLImageElement).src = defaultItemImage;
                }}
              />
            </div>
            
            <div className="flex-1">
              <h4 className="text-lg font-serif font-medium text-sacred-gold">{item.name}</h4>
              <div className="flex items-center space-x-2 mt-1">
                <Badge className={bg}>
                  {item.rarity ? item.rarity.charAt(0).toUpperCase() + item.rarity.slice(1) : "Common"}
                </Badge>
                <span className="text-xs text-sacred-white/70">{item.type.charAt(0).toUpperCase() + item.type.slice(1)}</span>
              </div>
            </div>
          </div>
          
          <p className="text-sm text-sacred-white/80">{item.description}</p>
          
          {item.usesLeft !== null && item.usesLeft > 0 && (
            <div className="text-xs text-sacred-white/70">
              Uses remaining: <span className="font-medium">{item.usesLeft}</span>
            </div>
          )}
          
          <div className="flex space-x-2 pt-2">
            <Button 
              size="sm" 
              variant={item.isEquipped ? "default" : "outline"}
              onClick={() => toggleEquip(item.id, !item.isEquipped)}
              disabled={isPendingEquip || isPendingRemove}
              className={item.isEquipped 
                ? "bg-sacred-blue hover:bg-sacred-blue-light text-white flex-1" 
                : "hover:border-sacred-blue hover:text-sacred-blue flex-1"}
            >
              {isPendingEquip ? (
                <Loader2 className="h-4 w-4 mr-1 animate-spin" />
              ) : null}
              {item.isEquipped ? "Unequip" : "Equip"}
            </Button>
            
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => removeItem(item.id)}
              disabled={isPendingEquip || isPendingRemove}
              className="hover:bg-red-900/20 hover:text-red-400 hover:border-red-700/40"
            >
              {isPendingRemove ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </HoverCardContent>
    </HoverCard>
  );
}