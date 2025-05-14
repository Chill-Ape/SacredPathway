import { pgTable, text, serial, integer, boolean, timestamp, primaryKey, jsonb, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Define tables first

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  phone: text("phone"),
  password: text("password").notNull(),
  manaBalance: integer("mana_balance").notNull().default(0),
  stripeCustomerId: text("stripe_customer_id"),
  profilePicture: text("profile_picture").default("/assets/default_avatar.svg"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const scrolls = pgTable("scrolls", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  image: text("image").notNull(), // URL to image
  isLocked: boolean("is_locked").notNull().default(true),
  key: text("key"), // Key phrase to unlock the scroll
  type: text("type").default("scroll"), // Type can be: tablet, artifact, scroll, book
});

// Define userScrolls relation table - using forward references
export const userScrolls = pgTable("user_scrolls", {
  userId: integer("user_id").notNull(),
  scrollId: integer("scroll_id").notNull(),
  unlockedAt: timestamp("unlocked_at").notNull().defaultNow(),
}, (t) => ({
  pk: primaryKey({ columns: [t.userId, t.scrollId] }),
}));

// Define relationships

// Inventory Items Table
export const inventoryItems = pgTable("inventory_items", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  name: text("name").notNull(),
  description: text("description").notNull(),
  type: text("type").notNull(), // artifact, key, resource, relic, scroll, book, etc.
  imageUrl: text("image_url"),
  rarity: text("rarity").default("common"),
  quantity: integer("quantity").default(1),
  isEquipped: boolean("is_equipped").default(false),
  usesLeft: integer("uses_left").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  attributes: jsonb("attributes"), // Flexible attributes as JSON
});

export const scrollsRelations = relations(scrolls, ({ many }) => ({
  unlockedBy: many(userScrolls),
}));

export const inventoryItemsRelations = relations(inventoryItems, ({ one }) => ({
  user: one(users, {
    fields: [inventoryItems.userId],
    references: [users.id],
  }),
}));

export const userScrollsRelations = relations(userScrolls, ({ one }) => ({
  user: one(users, {
    fields: [userScrolls.userId],
    references: [users.id],
  }),
  scroll: one(scrolls, {
    fields: [userScrolls.scrollId],
    references: [scrolls.id],
  }),
}));

// Define insert schemas

// User insert schema with required email, password, optional phone, and manaBalance
export const insertUserSchema = createInsertSchema(users)
  .pick({
    username: true,
    email: true,
    phone: true,
    password: true,
    manaBalance: true,
  })
  .partial({
    phone: true,
    manaBalance: true,  // Make manaBalance optional with default value of 0 in the database
  })
  // Add explicit validation for password (ensure it's required)
  .refine((data) => !!data.password, {
    message: "Password is required",
    path: ["password"],
  });

export const insertScrollSchema = createInsertSchema(scrolls).pick({
  title: true,
  content: true,
  image: true,
  isLocked: true,
  key: true,
  type: true,
});

export const updateScrollSchema = createInsertSchema(scrolls).pick({
  image: true,
});

export const oracleMessages = pgTable("oracle_messages", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(), // Session ID or user ID
  message: text("message").notNull(),
  isUser: boolean("is_user").notNull(), // true if user, false if oracle
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertOracleMessageSchema = createInsertSchema(oracleMessages).pick({
  userId: true,
  message: true,
  isUser: true,
});

export const contactMessages = pgTable("contact_messages", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  subject: text("subject").notNull(),
  message: text("message").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertContactMessageSchema = createInsertSchema(contactMessages).pick({
  name: true,
  email: true,
  subject: true,
  message: true,
});

// Oracle usage tracking for session-based limits
export const oracleUsage = pgTable("oracle_usage", {
  id: serial("id").primaryKey(),
  sessionId: text("session_id").notNull(),
  date: text("date").notNull(), // Stored as YYYY-MM-DD
  count: integer("count").notNull().default(1),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const keeperMessages = pgTable("keeper_messages", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(), // Session ID or user ID
  content: text("content").notNull(),
  isUser: boolean("is_user").notNull(), // true if user, false if Keeper
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertKeeperMessageSchema = createInsertSchema(keeperMessages).pick({
  userId: true,
  content: true,
  isUser: true,
});

// Mana-related tables
export const manaTransactions = pgTable("mana_transactions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  amount: integer("amount").notNull(), // positive for purchases, negative for expenditures
  description: text("description").notNull(),
  transactionType: text("transaction_type").notNull(), // "purchase", "scroll_unlock", "test", "reveal"
  referenceId: text("reference_id"), // optional reference to related entity (scroll ID, test ID, etc.)
  stripePaymentIntentId: text("stripe_payment_intent_id"), // for purchases only
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const manaPackages = pgTable("mana_packages", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  amount: integer("amount").notNull(), // amount of mana
  price: integer("price").notNull(), // price in cents
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Define relationships for mana transactions
export const manaTransactionsRelations = relations(manaTransactions, ({ one }) => ({
  user: one(users, {
    fields: [manaTransactions.userId],
    references: [users.id],
  }),
}));

// Mana transactions insert schema
export const insertManaTransactionSchema = createInsertSchema(manaTransactions).pick({
  userId: true,
  amount: true,
  description: true,
  transactionType: true,
  referenceId: true,
  stripePaymentIntentId: true,
});

// Mana packages insert schema
export const insertManaPackageSchema = createInsertSchema(manaPackages).pick({
  name: true,
  description: true,
  amount: true,
  price: true,
  isActive: true,
});

// Type exports
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Scroll = typeof scrolls.$inferSelect;
export type InsertScroll = z.infer<typeof insertScrollSchema>;

export type UserScroll = typeof userScrolls.$inferSelect;
export const insertUserScrollSchema = createInsertSchema(userScrolls).pick({
  userId: true,
  scrollId: true,
});

export type OracleMessage = typeof oracleMessages.$inferSelect;
export type InsertOracleMessage = z.infer<typeof insertOracleMessageSchema>;

export type ContactMessage = typeof contactMessages.$inferSelect;
export type InsertContactMessage = z.infer<typeof insertContactMessageSchema>;

export type KeeperMessage = typeof keeperMessages.$inferSelect;
export type InsertKeeperMessage = z.infer<typeof insertKeeperMessageSchema>;

export type ManaTransaction = typeof manaTransactions.$inferSelect;
export type InsertManaTransaction = z.infer<typeof insertManaTransactionSchema>;

export type ManaPackage = typeof manaPackages.$inferSelect;
export type InsertManaPackage = z.infer<typeof insertManaPackageSchema>;

// Inventory item schema and types
export const insertInventoryItemSchema = createInsertSchema(inventoryItems)
  .omit({
    id: true,
    createdAt: true,
  });

export type InventoryItem = typeof inventoryItems.$inferSelect;
export type InsertInventoryItem = z.infer<typeof insertInventoryItemSchema>;

// Crafting system tables
export const craftingRecipes = pgTable("crafting_recipes", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  resultItemName: text("result_item_name").notNull(),
  resultItemType: text("result_item_type").notNull(),
  resultItemRarity: text("result_item_rarity").notNull().default("common"),
  resultItemDescription: text("result_item_description").notNull(),
  resultItemImageUrl: text("result_item_image_url"),
  resultItemQuantity: integer("result_item_quantity").default(1),
  resultItemAttributes: jsonb("result_item_attributes"),
  ingredients: jsonb("ingredients").notNull(), // Array of {itemName, quantity} objects
  requiredLevel: integer("required_level").default(1),
  craftingTime: integer("crafting_time").default(0), // In seconds
  manaPrice: integer("mana_price").default(0),
  isDiscovered: boolean("is_discovered").default(false), // Default recipes are discoverable, rare ones need to be found
  createdAt: timestamp("created_at").defaultNow(),
});

export const userRecipes = pgTable("user_recipes", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  recipeId: integer("recipe_id").notNull().references(() => craftingRecipes.id),
  discoveredAt: timestamp("discovered_at").defaultNow(),
});

export const craftingQueue = pgTable("crafting_queue", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  recipeId: integer("recipe_id").notNull().references(() => craftingRecipes.id),
  startedAt: timestamp("started_at").defaultNow(),
  completesAt: timestamp("completes_at").notNull(),
  isCompleted: boolean("is_completed").default(false),
  isClaimed: boolean("is_claimed").default(false),
});

// Define relations for crafting
export const craftingRecipesRelations = relations(craftingRecipes, ({ many }) => ({
  userRecipes: many(userRecipes),
  craftingQueue: many(craftingQueue),
}));

export const userRecipesRelations = relations(userRecipes, ({ one }) => ({
  user: one(users, {
    fields: [userRecipes.userId],
    references: [users.id],
  }),
  recipe: one(craftingRecipes, {
    fields: [userRecipes.recipeId],
    references: [craftingRecipes.id],
  }),
}));

export const craftingQueueRelations = relations(craftingQueue, ({ one }) => ({
  user: one(users, {
    fields: [craftingQueue.userId],
    references: [users.id],
  }),
  recipe: one(craftingRecipes, {
    fields: [craftingQueue.recipeId],
    references: [craftingRecipes.id],
  }),
}));

// Update user relations to include crafting
export const usersRelations = relations(users, ({ many }) => ({
  unlockedScrolls: many(userScrolls),
  inventoryItems: many(inventoryItems),
  userRecipes: many(userRecipes),
  craftingQueue: many(craftingQueue),
}));

// Create schemas for inserts
export const insertCraftingRecipeSchema = createInsertSchema(craftingRecipes)
  .omit({
    id: true,
    createdAt: true,
  });

export const insertUserRecipeSchema = createInsertSchema(userRecipes)
  .omit({
    id: true,
    discoveredAt: true,
  });

export const insertCraftingQueueSchema = createInsertSchema(craftingQueue)
  .omit({
    id: true,
    startedAt: true,
  });

// Export types
export type CraftingRecipe = typeof craftingRecipes.$inferSelect;
export type InsertCraftingRecipe = z.infer<typeof insertCraftingRecipeSchema>;

export type UserRecipe = typeof userRecipes.$inferSelect;
export type InsertUserRecipe = z.infer<typeof insertUserRecipeSchema>;

export type CraftingQueueItem = typeof craftingQueue.$inferSelect;
export type InsertCraftingQueueItem = z.infer<typeof insertCraftingQueueSchema>;
