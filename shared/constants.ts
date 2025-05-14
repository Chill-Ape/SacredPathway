// Item types for the inventory system
export const ITEM_TYPES = {
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
} as const;

// Rarity levels for inventory items
export const RARITY_LEVELS = {
  COMMON: "common", 
  UNCOMMON: "uncommon",
  RARE: "rare",
  EPIC: "epic",
  LEGENDARY: "legendary",
  MYTHIC: "mythic",
  DIVINE: "divine"
} as const;

// Common resources
export const RESOURCES = {
  MANA_CRYSTAL: "mana_crystal",
  ANCIENT_DUST: "ancient_dust",
  SACRED_OIL: "sacred_oil",
  ETHEREAL_ESSENCE: "ethereal_essence",
  COSMIC_SHARD: "cosmic_shard"
} as const;