import React, { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { InventoryItem } from "@/hooks/use-inventory";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { Button } from "@/components/ui/button";
import { Loader2, ShieldCheck, Trash2, Sparkles } from "lucide-react";

// Import frame assets directly
import stoneFrameSrc from "@/assets/stone-frame.svg";
import itemFrameSrc from "@/assets/item-frame.svg";
import arcaneFrameSrc from "@/assets/arcane-frame.svg";
import parchmentBgSrc from "@/assets/parchment-bg.svg";
import equippedRingSrc from "@/assets/equipped-ring.svg";
import lockedItemSrc from "@/assets/locked-item.svg";

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

// Item frames by rarity
const RARITY_FRAMES = {
  [RARITY_LEVELS.COMMON]: stoneFrameSrc,
  [RARITY_LEVELS.UNCOMMON]: stoneFrameSrc,
  [RARITY_LEVELS.RARE]: itemFrameSrc,
  [RARITY_LEVELS.EPIC]: itemFrameSrc,
  [RARITY_LEVELS.LEGENDARY]: arcaneFrameSrc,
  [RARITY_LEVELS.MYTHIC]: arcaneFrameSrc,
  [RARITY_LEVELS.DIVINE]: arcaneFrameSrc,
};

// Function to get color based on rarity for both border and glow
function getRarityColors(rarity: string | null): { border: string; glow: string; bg: string; halo: string; shadow: string } {
  switch (rarity) {
    case RARITY_LEVELS.COMMON:
      return { 
        border: "border-gray-400", 
        glow: "shadow-gray-400/40", 
        bg: "bg-gray-200 text-gray-800",
        halo: "bg-gray-400/20",
        shadow: "drop-shadow-[0_0_3px_rgba(160,160,160,0.6)]"
      };
    case RARITY_LEVELS.UNCOMMON:
      return { 
        border: "border-green-500", 
        glow: "shadow-green-500/40", 
        bg: "bg-green-200 text-green-800",
        halo: "bg-green-400/20",
        shadow: "drop-shadow-[0_0_5px_rgba(74,222,128,0.6)]"
      };
    case RARITY_LEVELS.RARE:
      return { 
        border: "border-blue-500", 
        glow: "shadow-blue-500/40", 
        bg: "bg-blue-200 text-blue-800",
        halo: "bg-blue-400/20",
        shadow: "drop-shadow-[0_0_5px_rgba(96,165,250,0.7)]"
      };
    case RARITY_LEVELS.EPIC:
      return { 
        border: "border-purple-500", 
        glow: "shadow-purple-500/60", 
        bg: "bg-purple-200 text-purple-800",
        halo: "bg-purple-400/30",
        shadow: "drop-shadow-[0_0_8px_rgba(168,85,247,0.7)]"
      };
    case RARITY_LEVELS.LEGENDARY:
      return { 
        border: "border-amber-500", 
        glow: "shadow-amber-500/60", 
        bg: "bg-amber-200 text-amber-800",
        halo: "bg-amber-400/30",
        shadow: "drop-shadow-[0_0_10px_rgba(245,158,11,0.8)]"
      };
    case RARITY_LEVELS.MYTHIC:
      return { 
        border: "border-red-500", 
        glow: "shadow-red-500/60", 
        bg: "bg-red-200 text-red-800",
        halo: "bg-red-400/30",
        shadow: "drop-shadow-[0_0_12px_rgba(239,68,68,0.8)]"
      };
    case RARITY_LEVELS.DIVINE:
      return { 
        border: "border-indigo-500", 
        glow: "shadow-indigo-500/60", 
        bg: "bg-indigo-200 text-indigo-800",
        halo: "bg-indigo-400/30",
        shadow: "drop-shadow-[0_0_15px_rgba(129,140,248,0.9)]"
      };
    default:
      return { 
        border: "border-gray-400", 
        glow: "shadow-gray-400/40", 
        bg: "bg-gray-200 text-gray-800",
        halo: "bg-gray-400/20",
        shadow: "drop-shadow-[0_0_3px_rgba(160,160,160,0.6)]"
      };
  }
}

// Default placeholder image when no image is available
const defaultItemImage = "/assets/default_item.svg";
const equippedRingImage = equippedRingSrc;
const lockedItemImage = lockedItemSrc;
const parchmentBg = parchmentBgSrc;

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
  const { border, glow, bg, halo, shadow } = getRarityColors(item.rarity);
  const isPendingEquip = isToggleEquipPending && pendingItemId === item.id;
  const isPendingRemove = isRemovePending && pendingItemId === item.id;
  const [isHovering, setIsHovering] = useState(false);
  
  // Get the appropriate frame based on rarity
  const itemFrame = RARITY_FRAMES[item.rarity as keyof typeof RARITY_FRAMES] || RARITY_FRAMES.common;
  
  // Determine if this is a high-rarity item (epic or above)
  const isHighRarity = item.rarity === RARITY_LEVELS.EPIC || 
                       item.rarity === RARITY_LEVELS.LEGENDARY || 
                       item.rarity === RARITY_LEVELS.MYTHIC || 
                       item.rarity === RARITY_LEVELS.DIVINE;
  
  return (
    <HoverCard openDelay={100} closeDelay={100}>
      <HoverCardTrigger asChild>
        <div 
          className={`
            relative w-full aspect-square overflow-hidden cursor-pointer
            transition-all duration-300 ease-in-out
            ${isHovering ? 'scale-[1.03] z-10' : 'scale-100 z-0'}
            ${shadow}
          `}
          style={{
            backgroundImage: `url(${itemFrame})`,
            backgroundSize: '100% 100%',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
          }}
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
        >
          {/* Item Background */}
          <div className="absolute inset-[8px] overflow-hidden"
            style={{
              backgroundImage: `url(${parchmentBg})`,
              backgroundSize: '100% 100%',
            }}
          />
          
          {/* Item Image */}
          <div className="absolute inset-[8px] flex items-center justify-center overflow-hidden">
            <img 
              src={item.imageUrl || defaultItemImage} 
              alt={item.name}
              className={`
                h-full w-full object-contain p-2 transition-all duration-300
                ${isHighRarity ? 'filter drop-shadow-md' : ''}
                ${isHovering ? 'scale-110' : 'scale-100'}
              `}
              onError={(e) => {
                (e.target as HTMLImageElement).src = defaultItemImage;
              }}
            />
          </div>
          
          {/* Rarity Halo/Glow - visible on hover */}
          <div 
            className={`
              absolute inset-0 opacity-0 transition-opacity duration-300
              ${isHovering ? 'opacity-100' : ''}
              ${halo}
              pointer-events-none
            `}
          />
          
          {/* Equipped Indicator with fancy ring */}
          {item.isEquipped && (
            <div className="absolute inset-0 pointer-events-none">
              <img 
                src={equippedRingImage} 
                alt="Equipped"
                className="h-full w-full object-contain" 
              />
            </div>
          )}
          
          {/* Quantity Badge */}
          {item.quantity > 1 && (
            <div className="absolute bottom-1 right-1 bg-black/70 backdrop-blur-sm text-white text-[10px] md:text-xs font-bold rounded-full 
                            w-5 h-5 md:w-6 md:h-6 flex items-center justify-center border border-sacred-gold/30 shadow-md z-10">
              {item.quantity}
            </div>
          )}
          
          {/* Rarity Indicator */}
          <div className="absolute top-1 right-1 z-10">
            <Badge className={`${bg} text-[10px] md:text-xs font-bold px-1.5 md:px-2 py-0 md:py-0.5 shadow-md`}>
              {item.rarity ? item.rarity.charAt(0).toUpperCase() : "C"}
            </Badge>
          </div>
          
          {/* Mythic/Divine special sparkle effect */}
          {(item.rarity === RARITY_LEVELS.MYTHIC || item.rarity === RARITY_LEVELS.DIVINE) && (
            <div className="absolute top-1 left-1 z-10">
              <Sparkles className={`
                h-4 w-4 md:h-5 md:w-5
                ${item.rarity === RARITY_LEVELS.MYTHIC ? 'text-red-400' : 'text-indigo-400'} 
                animate-pulse
              `} />
            </div>
          )}
          
          {/* Name label */}
          <div className="absolute inset-x-0 bottom-0 px-1 md:px-2 py-0.5 md:py-1 bg-black/60 backdrop-blur-sm z-10">
            <p className="text-[10px] md:text-xs text-white font-medium truncate font-serif">{item.name}</p>
          </div>
        </div>
      </HoverCardTrigger>
      
      {/* Enhanced detailed view on hover */}
      <HoverCardContent 
        className="w-80 bg-sacred-dark-lightest border border-sacred-gold/30 text-sacred-white p-4 shadow-2xl backdrop-blur-sm"
        style={{
          backgroundImage: 'radial-gradient(circle at center, rgba(30, 20, 10, 0.95), rgba(10, 5, 0, 0.98))',
        }}
      >
        <div className="flex flex-col space-y-3">
          <div className="flex items-start">
            <div 
              className="h-16 w-16 mr-3 flex-shrink-0 relative overflow-hidden rounded-md"
              style={{
                backgroundImage: `url(${itemFrame})`,
                backgroundSize: '100% 100%',
              }}
            >
              <div className="absolute inset-[3px] overflow-hidden rounded-md"
                style={{
                  backgroundImage: `url(${parchmentBg})`,
                  backgroundSize: '100% 100%',
                }}
              />
              <img 
                src={item.imageUrl || defaultItemImage} 
                alt={item.name}
                className="absolute inset-0 h-full w-full object-contain p-1" 
                onError={(e) => {
                  (e.target as HTMLImageElement).src = defaultItemImage;
                }}
              />
            </div>
            
            <div className="flex-1">
              <h4 className="text-lg font-serif font-medium text-sacred-gold">{item.name}</h4>
              <div className="flex items-center space-x-2 mt-1">
                <Badge className={bg + " font-medium"}>
                  {item.rarity ? item.rarity.charAt(0).toUpperCase() + item.rarity.slice(1) : "Common"}
                </Badge>
                <span className="text-xs text-sacred-white/70 font-serif">{item.type.charAt(0).toUpperCase() + item.type.slice(1)}</span>
              </div>
            </div>
          </div>
          
          <p className="text-sm text-sacred-white/90 font-serif leading-relaxed">{item.description}</p>
          
          {item.usesLeft !== null && item.usesLeft > 0 && (
            <div className="text-xs text-sacred-white/70 font-serif">
              Uses remaining: <span className="font-medium text-sacred-gold">{item.usesLeft}</span>
            </div>
          )}
          
          <div className="flex space-x-2 pt-2">
            <Button 
              size="sm" 
              variant={item.isEquipped ? "default" : "outline"}
              onClick={() => toggleEquip(item.id, !item.isEquipped)}
              disabled={isPendingEquip || isPendingRemove}
              className={item.isEquipped 
                ? "bg-sacred-blue hover:bg-sacred-blue/80 text-white flex-1 font-serif" 
                : "hover:border-sacred-blue hover:text-sacred-blue flex-1 font-serif"}
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
              className="hover:bg-red-900/20 hover:text-red-400 hover:border-red-700/40 font-serif"
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