import React, { useEffect, useState } from "react";
import { InventoryItem } from "@/hooks/use-inventory";
import GridInventoryItem from "./GridInventoryItem";

interface InventoryGridProps {
  items: InventoryItem[];
  toggleEquip: (itemId: number, equip: boolean) => void;
  removeItem: (itemId: number) => void;
  isToggleEquipPending: boolean;
  isRemovePending: boolean;
  pendingItemId?: number;
  emptyMessage?: string;
}

export default function InventoryGrid({
  items,
  toggleEquip,
  removeItem,
  isToggleEquipPending,
  isRemovePending,
  pendingItemId,
  emptyMessage = "Your inventory is empty. Seek out artifacts in your journey."
}: InventoryGridProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  
  // Simulate items loading in for visual effect
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 300);
    
    return () => clearTimeout(timer);
  }, []);
  
  // If no items, show stylized empty message
  if (!items || items.length === 0) {
    return (
      <div className="text-center py-12 border border-sacred-gold/20 rounded-lg bg-sacred-dark-lightest 
                      shadow-inner backdrop-blur-sm 
                      bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] 
                      from-sacred-dark-lightest via-sacred-dark to-sacred-dark">
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 mb-4 opacity-50">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="text-sacred-gold/50">
              <path d="M20 7h-4V4c0-1.1-.9-2-2-2h-4c-1.1 0-2 .9-2 2v3H4c-1.1 0-2 .9-2 2v11c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V9c0-1.1-.9-2-2-2zM10 4h4v3h-4V4zm6 14H8v-2h8v2zm0-4H8v-2h8v2z" />
            </svg>
          </div>
          <p className="text-sacred-gold/70 font-serif">{emptyMessage}</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="relative p-4 border border-sacred-gold/20 rounded-lg 
                    shadow-inner backdrop-blur-sm 
                    bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] 
                    from-sacred-dark-lightest via-sacred-dark to-sacred-dark">
      {/* Decorative corner accents */}
      <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-sacred-gold/40 rounded-tl-lg"></div>
      <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-sacred-gold/40 rounded-tr-lg"></div>
      <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-sacred-gold/40 rounded-bl-lg"></div>
      <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-sacred-gold/40 rounded-br-lg"></div>
      
      {/* Grid title */}
      <div className="text-center mb-6">
        <h3 className="text-sacred-gold font-serif text-xl">Arcane Repository</h3>
        <div className="w-32 h-0.5 bg-gradient-to-r from-transparent via-sacred-gold/50 to-transparent mx-auto mt-1"></div>
      </div>
      
      {/* Item grid with fade-in animation */}
      <div className={`
        grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5
        transition-opacity duration-700 ease-in-out
        ${isLoaded ? 'opacity-100' : 'opacity-0'}
      `}>
        {items.map((item, index) => (
          <div 
            key={item.id} 
            className="transition-all duration-500 ease-in-out"
            style={{ 
              animationDelay: `${index * 100}ms`,
              transform: isLoaded ? 'translateY(0)' : 'translateY(20px)',
              opacity: isLoaded ? 1 : 0,
              transition: `transform 500ms ${index * 50}ms, opacity 500ms ${index * 50}ms`
            }}
          >
            <GridInventoryItem
              item={item}
              toggleEquip={toggleEquip}
              removeItem={removeItem}
              isToggleEquipPending={isToggleEquipPending}
              isRemovePending={isRemovePending}
              pendingItemId={pendingItemId}
            />
          </div>
        ))}
      </div>
    </div>
  );
}