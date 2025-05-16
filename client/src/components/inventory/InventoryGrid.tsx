import React from "react";
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
  // If no items, show empty message
  if (!items || items.length === 0) {
    return (
      <div className="text-center py-12 border border-sacred-gold/10 rounded-lg bg-sacred-dark-lightest">
        <p className="text-sacred-white/70">{emptyMessage}</p>
      </div>
    );
  }
  
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
      {items.map((item) => (
        <GridInventoryItem
          key={item.id}
          item={item}
          toggleEquip={toggleEquip}
          removeItem={removeItem}
          isToggleEquipPending={isToggleEquipPending}
          isRemovePending={isRemovePending}
          pendingItemId={pendingItemId}
        />
      ))}
    </div>
  );
}