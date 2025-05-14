import { 
  User, 
  InsertUser, 
  Scroll, 
  InsertScroll, 
  OracleMessage, 
  InsertOracleMessage, 
  ContactMessage, 
  InsertContactMessage,
  KeeperMessage,
  InsertKeeperMessage,
  UserScroll,
  ManaTransaction,
  InsertManaTransaction,
  ManaPackage,
  InsertManaPackage,
  InventoryItem,
  InsertInventoryItem,
  CraftingRecipe,
  InsertCraftingRecipe,
  UserRecipe,
  InsertUserRecipe,
  CraftingQueueItem,
  InsertCraftingQueueItem,
  users,
  scrolls,
  userScrolls,
  oracleMessages,
  contactMessages,
  keeperMessages,
  manaTransactions,
  manaPackages,
  oracleUsage,
  inventoryItems,
  craftingRecipes,
  userRecipes,
  craftingQueue
} from "@shared/schema";
import { db, pool, isDatabaseAvailable } from "./db";
import { eq, and } from "drizzle-orm";

import session from "express-session";
import createMemoryStore from "memorystore";
import connectPg from "connect-pg-simple";

const MemoryStore = createMemoryStore(session);
const PostgresSessionStore = connectPg(session);

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getAllUsers(): Promise<User[]>;
  updateUserProfilePicture(userId: number, profilePicture: string): Promise<User>;
  
  // Scroll methods
  getAllScrolls(): Promise<Scroll[]>;
  getScrollById(id: number): Promise<Scroll | undefined>;
  createScroll(scroll: InsertScroll): Promise<Scroll>;
  unlockScroll(id: number): Promise<Scroll | undefined>;
  updateScrollImage(id: number, imagePath: string): Promise<Scroll | undefined>;
  checkScrollKey(id: number, key: string): Promise<boolean>;
  
  // User-Scroll relation methods
  getUserUnlockedScrolls(userId: number): Promise<Scroll[]>;
  unlockScrollForUser(userId: number, scrollId: number): Promise<boolean>;
  isScrollUnlockedForUser(userId: number, scrollId: number): Promise<boolean>;
  
  // Oracle message methods
  getOracleMessages(userId: string): Promise<OracleMessage[]>;
  createOracleMessage(message: InsertOracleMessage): Promise<OracleMessage>;
  getOracleSessionCount(userId: string, date: string): Promise<number>; // Get Oracle usage count for anonymous users
  incrementOracleSessionCount(userId: string, date: string): Promise<number>; // Increment Oracle usage count
  
  // Keeper message methods
  getKeeperMessages(userId: string): Promise<KeeperMessage[]>;
  createKeeperMessage(message: InsertKeeperMessage): Promise<KeeperMessage>;
  
  // Contact message methods
  createContactMessage(message: InsertContactMessage): Promise<ContactMessage>;
  getContactMessages(): Promise<ContactMessage[]>;
  
  // Mana methods
  getUserManaBalance(userId: number): Promise<number>;
  updateUserManaBalance(userId: number, amount: number): Promise<number>; // Returns new balance
  createManaTransaction(transaction: InsertManaTransaction): Promise<ManaTransaction>;
  getUserManaTransactions(userId: number): Promise<ManaTransaction[]>;
  getAllManaPackages(): Promise<ManaPackage[]>;
  getManaPackageById(id: number): Promise<ManaPackage | undefined>;
  createManaPackage(manaPackage: InsertManaPackage): Promise<ManaPackage>;
  updateManaPackage(id: number, updates: Partial<InsertManaPackage>): Promise<ManaPackage | undefined>;
  updateUserStripeCustomerId(userId: number, stripeCustomerId: string): Promise<User>;
  
  // Inventory methods
  getUserInventory(userId: number): Promise<InventoryItem[]>;
  getInventoryItemById(id: number): Promise<InventoryItem | undefined>;
  addInventoryItem(item: InsertInventoryItem): Promise<InventoryItem>;
  updateInventoryItem(id: number, updates: Partial<InsertInventoryItem>): Promise<InventoryItem | undefined>;
  removeInventoryItem(id: number): Promise<boolean>;
  updateItemQuantity(id: number, quantity: number): Promise<InventoryItem | undefined>;
  equipItem(id: number, isEquipped: boolean): Promise<InventoryItem | undefined>;
  getEquippedItems(userId: number): Promise<InventoryItem[]>;
  
  // Crafting methods
  getAllCraftingRecipes(): Promise<CraftingRecipe[]>;
  getDiscoveredRecipes(userId: number): Promise<CraftingRecipe[]>;
  getCraftingRecipeById(recipeId: number): Promise<CraftingRecipe | undefined>;
  createCraftingRecipe(recipe: InsertCraftingRecipe): Promise<CraftingRecipe>;
  discoverRecipe(userId: number, recipeId: number): Promise<UserRecipe | undefined>;
  isRecipeDiscovered(userId: number, recipeId: number): Promise<boolean>;
  
  // Crafting queue methods
  getUserCraftingQueue(userId: number): Promise<CraftingQueueItem[]>;
  addToCraftingQueue(queueItem: InsertCraftingQueueItem): Promise<CraftingQueueItem>;
  getQueueItemById(queueId: number): Promise<CraftingQueueItem | undefined>;
  updateQueueItemStatus(queueId: number, isCompleted: boolean): Promise<CraftingQueueItem | undefined>;
  claimCraftedItem(queueId: number): Promise<InventoryItem | undefined>;
  
  // Check if user has required ingredients
  checkIngredients(userId: number, recipeId: number): Promise<{hasIngredients: boolean, missingItems?: string[]}>;
  // Use ingredients from inventory
  useIngredients(userId: number, recipeId: number): Promise<boolean>;
  
  // Session store
  sessionStore: session.Store;
}

export class DatabaseStorage implements IStorage {
  sessionStore: session.Store;
  
  constructor() {
    // Initialize PostgreSQL session store
    if (!pool) {
      console.error("Database pool is not initialized, using MemoryStore instead");
      this.sessionStore = new MemoryStore({
        checkPeriod: 86400000, // prune expired entries every 24h
        stale: false, // don't serve stale sessions 
        ttl: 86400000 * 7, // 1 week max lifetime
      });
    } else {
      console.log("Initializing PostgreSQL session store");
      this.sessionStore = new PostgresSessionStore({
        pool: pool,
        createTableIfMissing: true,
        tableName: 'session', // Standard table name
        schemaName: 'public', // Default schema
        ttl: 86400 * 7, // 1 week in seconds
        pruneSessionInterval: 3600 // Prune every hour
      });
      
      // Initialize database tables and default data
      this.initializeTables().catch(err => {
        console.error("Error initializing database tables:", err);
      });
    }
  }
  
  private async initializeTables() {
    // This will create tables based on the schema
    try {
      console.log("Creating database tables if they don't exist");
      
      // Initialize scrolls - use the main initialization method
      try {
        await this.initializeDefaultScrolls();
      } catch (err) {
        console.error("Error initializing scrolls:", err);
      }
      
      // Initialize Mana packages
      try {
        // Check if we have any Mana packages in the database
        const existingPackages = await db.select().from(manaPackages);
        
        if (existingPackages.length === 0) {
          console.log("Mana packages table is empty, creating default packages");
          await this._initializeDefaultManaPackages();
        } else {
          console.log("Mana packages already exist:", existingPackages.length);
        }
      } catch (err) {
        // If the table doesn't exist yet, we'll get an error
        console.log("Mana packages table not initialized yet, creating default packages");
        await this._initializeDefaultManaPackages();
      }
    } catch (error) {
      console.error("Error initializing tables:", error);
    }
  }
  
  async _initializeDefaultManaPackages() {
    console.log("Initializing default Mana packages");
    
    // Create default mana packages
    const packages: InsertManaPackage[] = [
      {
        name: "Novice Pack",
        description: "A small amount of Mana to unlock basic scrolls and features.",
        amount: 100,
        price: 499, // $4.99
        isActive: true
      },
      {
        name: "Adept Pack",
        description: "A moderate amount of Mana for regular Archive users.",
        amount: 300,
        price: 999, // $9.99
        isActive: true
      },
      {
        name: "Scholar Pack",
        description: "A substantial amount of Mana for dedicated seekers of knowledge.",
        amount: 1000,
        price: 2499, // $24.99
        isActive: true
      },
      {
        name: "Master Pack",
        description: "An abundant reserve of Mana for the most devoted students of the Archive.",
        amount: 2500,
        price: 4999, // $49.99
        isActive: true
      }
    ];
    
    // Create all mana packages
    for (const pkg of packages) {
      await this.createManaPackage(pkg);
    }
    
    console.log("Created default Mana packages:", packages.length);
  }
  
  // The _initializeDefaultScrolls method has been removed to avoid duplicates
  // All scroll initialization should use the primary initializeDefaultScrolls method
  
  // USER METHODS
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }
  
  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users);
  }
  
  // SCROLL METHODS
  async getAllScrolls(): Promise<Scroll[]> {
    return await db.select().from(scrolls);
  }
  
  async getScrollById(id: number): Promise<Scroll | undefined> {
    const [scroll] = await db.select().from(scrolls).where(eq(scrolls.id, id));
    return scroll || undefined;
  }
  
  async createScroll(insertScroll: InsertScroll): Promise<Scroll> {
    const [scroll] = await db
      .insert(scrolls)
      .values(insertScroll)
      .returning();
    return scroll;
  }
  
  async unlockScroll(id: number): Promise<Scroll | undefined> {
    const [scroll] = await db
      .update(scrolls)
      .set({ isLocked: false })
      .where(eq(scrolls.id, id))
      .returning();
    return scroll || undefined;
  }
  
  async checkScrollKey(id: number, key: string): Promise<boolean> {
    const [scroll] = await db.select().from(scrolls).where(eq(scrolls.id, id));
    if (scroll) {
      return scroll.key.toLowerCase() === key.toLowerCase();
    }
    return false;
  }
  
  // ORACLE MESSAGE METHODS
  async getOracleMessages(userId: string): Promise<OracleMessage[]> {
    return await db
      .select()
      .from(oracleMessages)
      .where(eq(oracleMessages.userId, userId))
      .orderBy(oracleMessages.id);
  }
  
  async createOracleMessage(insertMessage: InsertOracleMessage): Promise<OracleMessage> {
    const [message] = await db
      .insert(oracleMessages)
      .values(insertMessage)
      .returning();
    return message;
  }
  
  // KEEPER MESSAGE METHODS
  async getKeeperMessages(userId: string): Promise<KeeperMessage[]> {
    return await db
      .select()
      .from(keeperMessages)
      .where(eq(keeperMessages.userId, userId))
      .orderBy(keeperMessages.id);
  }
  
  // USER-SCROLL RELATION METHODS
  async getUserUnlockedScrolls(userId: number): Promise<Scroll[]> {
    const result = await db
      .select({
        scroll: scrolls
      })
      .from(userScrolls)
      .innerJoin(scrolls, eq(userScrolls.scrollId, scrolls.id))
      .where(eq(userScrolls.userId, userId));
    
    return result.map((r: { scroll: Scroll }) => r.scroll);
  }
  
  async unlockScrollForUser(userId: number, scrollId: number): Promise<boolean> {
    try {
      await db
        .insert(userScrolls)
        .values({
          userId,
          scrollId
        })
        .onConflictDoNothing(); // In case it's already unlocked
      
      return true;
    } catch (error) {
      console.error("Error unlocking scroll for user:", error);
      return false;
    }
  }
  
  async isScrollUnlockedForUser(userId: number, scrollId: number): Promise<boolean> {
    const [relation] = await db
      .select()
      .from(userScrolls)
      .where(eq(userScrolls.userId, userId))
      .where(eq(userScrolls.scrollId, scrollId));
    
    return !!relation; // Convert to boolean
  }
  
  async createKeeperMessage(insertMessage: InsertKeeperMessage): Promise<KeeperMessage> {
    const [message] = await db
      .insert(keeperMessages)
      .values(insertMessage)
      .returning();
    return message;
  }
  
  // CONTACT MESSAGE METHODS
  async createContactMessage(insertMessage: InsertContactMessage): Promise<ContactMessage> {
    const [message] = await db
      .insert(contactMessages)
      .values(insertMessage)
      .returning();
    return message;
  }
  
  async getContactMessages(): Promise<ContactMessage[]> {
    return await db.select().from(contactMessages);
  }
  
  // MANA METHODS
  async getUserManaBalance(userId: number): Promise<number> {
    const [user] = await db.select({ manaBalance: users.manaBalance }).from(users).where(eq(users.id, userId));
    return user?.manaBalance || 0;
  }

  async updateUserManaBalance(userId: number, amount: number): Promise<number> {
    // Get current balance first
    const currentBalance = await this.getUserManaBalance(userId);
    const newBalance = currentBalance + amount;
    
    // Update user's mana balance
    await db.update(users)
      .set({ manaBalance: newBalance })
      .where(eq(users.id, userId));
    
    return newBalance;
  }

  async createManaTransaction(transaction: InsertManaTransaction): Promise<ManaTransaction> {
    const [result] = await db.insert(manaTransactions)
      .values(transaction)
      .returning();
    
    return result;
  }

  async getUserManaTransactions(userId: number): Promise<ManaTransaction[]> {
    return await db.select()
      .from(manaTransactions)
      .where(eq(manaTransactions.userId, userId))
      .orderBy(manaTransactions.createdAt);
  }

  async getAllManaPackages(): Promise<ManaPackage[]> {
    return await db.select()
      .from(manaPackages)
      .where(eq(manaPackages.isActive, true))
      .orderBy(manaPackages.price);
  }

  async getManaPackageById(id: number): Promise<ManaPackage | undefined> {
    const [result] = await db.select()
      .from(manaPackages)
      .where(eq(manaPackages.id, id));
    
    return result;
  }

  async createManaPackage(manaPackage: InsertManaPackage): Promise<ManaPackage> {
    const [result] = await db.insert(manaPackages)
      .values(manaPackage)
      .returning();
    
    return result;
  }

  async updateManaPackage(id: number, updates: Partial<InsertManaPackage>): Promise<ManaPackage | undefined> {
    const [result] = await db.update(manaPackages)
      .set(updates)
      .where(eq(manaPackages.id, id))
      .returning();
    
    return result;
  }

  async updateUserStripeCustomerId(userId: number, stripeCustomerId: string): Promise<User> {
    const [user] = await db.update(users)
      .set({ stripeCustomerId })
      .where(eq(users.id, userId))
      .returning();
    
    return user;
  }
  
  async updateUserProfilePicture(userId: number, profilePicture: string): Promise<User> {
    const [user] = await db.update(users)
      .set({ profilePicture })
      .where(eq(users.id, userId))
      .returning();
    
    return user;
  }
  
  // For scroll image updating
  async updateScrollImage(id: number, imagePath: string): Promise<Scroll | undefined> {
    const [result] = await db.update(scrolls)
      .set({ image: imagePath })
      .where(eq(scrolls.id, id))
      .returning();
    
    return result;
  }
  
  // Inventory system methods
  async getUserInventory(userId: number): Promise<InventoryItem[]> {
    return await db.select().from(inventoryItems).where(eq(inventoryItems.userId, userId));
  }
  
  async getInventoryItemById(id: number): Promise<InventoryItem | undefined> {
    const [item] = await db.select().from(inventoryItems).where(eq(inventoryItems.id, id));
    return item;
  }
  
  async addInventoryItem(item: InsertInventoryItem): Promise<InventoryItem> {
    const [newItem] = await db.insert(inventoryItems).values(item).returning();
    return newItem;
  }
  
  async updateInventoryItem(id: number, updates: Partial<InsertInventoryItem>): Promise<InventoryItem | undefined> {
    const [updatedItem] = await db
      .update(inventoryItems)
      .set(updates)
      .where(eq(inventoryItems.id, id))
      .returning();
    return updatedItem;
  }
  
  async removeInventoryItem(id: number): Promise<boolean> {
    const result = await db.delete(inventoryItems).where(eq(inventoryItems.id, id));
    return !!result;
  }
  
  async updateItemQuantity(id: number, quantity: number): Promise<InventoryItem | undefined> {
    const [updatedItem] = await db
      .update(inventoryItems)
      .set({ quantity })
      .where(eq(inventoryItems.id, id))
      .returning();
    return updatedItem;
  }
  
  async equipItem(id: number, isEquipped: boolean): Promise<InventoryItem | undefined> {
    const [updatedItem] = await db
      .update(inventoryItems)
      .set({ isEquipped })
      .where(eq(inventoryItems.id, id))
      .returning();
    return updatedItem;
  }
  
  async getEquippedItems(userId: number): Promise<InventoryItem[]> {
    return await db
      .select()
      .from(inventoryItems)
      .where(
        and(
          eq(inventoryItems.userId, userId),
          eq(inventoryItems.isEquipped, true)
        )
      );
  }
  
  // Crafting methods implementation
  async getAllCraftingRecipes(): Promise<CraftingRecipe[]> {
    return await db.select().from(craftingRecipes);
  }

  async getDiscoveredRecipes(userId: number): Promise<CraftingRecipe[]> {
    const result = await db
      .select({
        recipe: craftingRecipes
      })
      .from(userRecipes)
      .innerJoin(craftingRecipes, eq(userRecipes.recipeId, craftingRecipes.id))
      .where(eq(userRecipes.userId, userId));
    
    return result.map(r => r.recipe);
  }

  async getCraftingRecipeById(recipeId: number): Promise<CraftingRecipe | undefined> {
    const [recipe] = await db.select().from(craftingRecipes).where(eq(craftingRecipes.id, recipeId));
    return recipe;
  }

  async createCraftingRecipe(recipe: InsertCraftingRecipe): Promise<CraftingRecipe> {
    const [newRecipe] = await db.insert(craftingRecipes).values(recipe).returning();
    return newRecipe;
  }

  async discoverRecipe(userId: number, recipeId: number): Promise<UserRecipe | undefined> {
    // Check if already discovered
    const alreadyDiscovered = await this.isRecipeDiscovered(userId, recipeId);
    if (alreadyDiscovered) {
      const [existing] = await db
        .select()
        .from(userRecipes)
        .where(and(
          eq(userRecipes.userId, userId),
          eq(userRecipes.recipeId, recipeId)
        ));
      return existing;
    }
    
    // Create new discovery
    const [discovery] = await db
      .insert(userRecipes)
      .values({ userId, recipeId })
      .returning();
      
    return discovery;
  }

  async isRecipeDiscovered(userId: number, recipeId: number): Promise<boolean> {
    const [discovered] = await db
      .select()
      .from(userRecipes)
      .where(and(
        eq(userRecipes.userId, userId),
        eq(userRecipes.recipeId, recipeId)
      ));
      
    return !!discovered;
  }
  
  // Crafting queue methods
  async getUserCraftingQueue(userId: number): Promise<CraftingQueueItem[]> {
    return await db
      .select()
      .from(craftingQueue)
      .where(eq(craftingQueue.userId, userId));
  }

  async addToCraftingQueue(queueItem: InsertCraftingQueueItem): Promise<CraftingQueueItem> {
    const [newQueueItem] = await db
      .insert(craftingQueue)
      .values(queueItem)
      .returning();
      
    return newQueueItem;
  }

  async getQueueItemById(queueId: number): Promise<CraftingQueueItem | undefined> {
    const [queueItem] = await db
      .select()
      .from(craftingQueue)
      .where(eq(craftingQueue.id, queueId));
      
    return queueItem;
  }

  async updateQueueItemStatus(queueId: number, isCompleted: boolean): Promise<CraftingQueueItem | undefined> {
    const [updatedItem] = await db
      .update(craftingQueue)
      .set({ isCompleted })
      .where(eq(craftingQueue.id, queueId))
      .returning();
      
    return updatedItem;
  }

  async claimCraftedItem(queueId: number): Promise<InventoryItem | undefined> {
    // Get the queue item
    const queueItem = await this.getQueueItemById(queueId);
    if (!queueItem || !queueItem.isCompleted || queueItem.isClaimed) {
      return undefined;
    }
    
    // Get the recipe
    const recipe = await this.getCraftingRecipeById(queueItem.recipeId);
    if (!recipe) {
      return undefined;
    }
    
    // Mark as claimed
    await db
      .update(craftingQueue)
      .set({ isClaimed: true })
      .where(eq(craftingQueue.id, queueId));
      
    // Add item to inventory
    const newItem = await this.addInventoryItem({
      userId: queueItem.userId,
      name: recipe.resultItemName,
      description: recipe.resultItemDescription,
      type: recipe.resultItemType,
      imageUrl: recipe.resultItemImageUrl,
      rarity: recipe.resultItemRarity,
      quantity: recipe.resultItemQuantity,
      isEquipped: false,
      usesLeft: null,
      attributes: recipe.resultItemAttributes
    });
    
    return newItem;
  }
  
  // Ingredient checking and consumption
  async checkIngredients(userId: number, recipeId: number): Promise<{hasIngredients: boolean, missingItems?: string[]}> {
    // Get the recipe
    const recipe = await this.getCraftingRecipeById(recipeId);
    if (!recipe) {
      return { hasIngredients: false, missingItems: ["Recipe not found"] };
    }
    
    // Get user's inventory
    const inventory = await this.getUserInventory(userId);
    
    // Check if user has all required ingredients
    const ingredients = recipe.ingredients as {itemName: string, quantity: number}[];
    const missingItems: string[] = [];
    
    for (const ingredient of ingredients) {
      const userItem = inventory.find(item => item.name === ingredient.itemName);
      
      if (!userItem || userItem.quantity < ingredient.quantity) {
        missingItems.push(ingredient.itemName);
      }
    }
    
    return {
      hasIngredients: missingItems.length === 0,
      missingItems: missingItems.length > 0 ? missingItems : undefined
    };
  }
  
  async useIngredients(userId: number, recipeId: number): Promise<boolean> {
    // Check if user has the ingredients
    const { hasIngredients } = await this.checkIngredients(userId, recipeId);
    if (!hasIngredients) {
      return false;
    }
    
    // Get the recipe
    const recipe = await this.getCraftingRecipeById(recipeId);
    if (!recipe) {
      return false;
    }
    
    // Get user's inventory
    const inventory = await this.getUserInventory(userId);
    
    // Consume the ingredients
    const ingredients = recipe.ingredients as {itemName: string, quantity: number}[];
    
    try {
      for (const ingredient of ingredients) {
        const userItem = inventory.find(item => item.name === ingredient.itemName);
        
        if (!userItem) {
          throw new Error(`Item ${ingredient.itemName} not found in inventory`);
        }
        
        const newQuantity = userItem.quantity - ingredient.quantity;
        
        if (newQuantity < 0) {
          throw new Error(`Not enough quantity of ${ingredient.itemName}`);
        }
        
        if (newQuantity === 0) {
          // Remove the item if quantity becomes zero
          await this.removeInventoryItem(userItem.id);
        } else {
          // Update the quantity
          await this.updateItemQuantity(userItem.id, newQuantity);
        }
      }
      
      return true;
    } catch (error) {
      console.error("Error using ingredients:", error);
      return false;
    }
  }
  
  // Oracle usage tracking for session-based limitations
  async getOracleSessionCount(userId: string, date: string): Promise<number> {
    try {
      const [usage] = await db
        .select({ count: oracleUsage.count })
        .from(oracleUsage)
        .where(and(
          eq(oracleUsage.sessionId, userId),
          eq(oracleUsage.date, date)
        ));
      
      return usage?.count || 0;
    } catch (error) {
      console.error("Error getting Oracle session count:", error);
      return 0;
    }
  }
  
  async incrementOracleSessionCount(userId: string, date: string): Promise<number> {
    try {
      // Check if there's an existing record
      const existingCount = await this.getOracleSessionCount(userId, date);
      
      if (existingCount === 0) {
        // Create new record
        const [newRecord] = await db
          .insert(oracleUsage)
          .values({
            sessionId: userId,
            date,
            count: 1
          })
          .returning();
        
        return newRecord.count;
      } else {
        // Update existing record
        const [updatedRecord] = await db
          .update(oracleUsage)
          .set({ count: existingCount + 1 })
          .where(and(
            eq(oracleUsage.sessionId, userId),
            eq(oracleUsage.date, date)
          ))
          .returning();
        
        return updatedRecord.count;
      }
    } catch (error) {
      console.error("Error incrementing Oracle session count:", error);
      return 1; // Default to 1 if there's an error
    }
  }

  // Primary method for initializing default scrolls - other methods will be removed
  async initializeDefaultScrolls() {
    try {
      console.log("Checking if scrolls need initialization");
      // Check if we already have scrolls to avoid duplication
      const existingScrolls = await db.select().from(scrolls);
      if (existingScrolls.length > 0) {
        console.log(`Scrolls already initialized (${existingScrolls.length} found), skipping`);
        return; // Already initialized
      }
      
      console.log("Initializing default scrolls - no existing scrolls found");
    } catch (error) {
      console.error("Error checking for existing scrolls:", error);
    }

    // Unlocked scrolls
    await this.createScroll({
      title: "Origins",
      content: "The first tablet of creation, revealing how the world began and the first emergence of consciousness. The primordial waters stirred with potential, and from the depths arose the first patterns of existence. The sacred geometries that form the foundation of all reality began to align, creating the template upon which all life would eventually manifest.",
      image: "/assets/ancient_tablet_dark.png",
      isLocked: false,
      key: "origins"
    });
    
    await this.createScroll({
      title: "The Path",
      content: "Guidance for the seeker on the journey through the labyrinth of consciousness and awakening. The path winds through many landscapes of awareness, each offering its own challenges and revelations. Those who walk with awareness find that the journey itself transforms them, and the destination is merely a reflection of the traveler.",
      image: "/assets/ancient_tablet_cracked.png",
      isLocked: false,
      key: "path"
    });
    
    await this.createScroll({
      title: "Sacred Geometry",
      content: "The underlying patterns that connect all life and form the foundation of the universe. In the perfect dance of circle, square, and triangle lies the blueprint of creation. The Flower of Life, the Seed of Life, the Tree of Life - all expressions of the same fundamental patterns that govern existence at every scale, from atomic to cosmic.",
      image: "/assets/sacred_symbol.png",
      isLocked: false,
      key: "geometry"
    });
    
    // Made Legacy of the Lost Age scroll accessible
    await this.createScroll({
      title: "Legacy of the Lost Age",
      content: "Many ancient cultures share flood myths coinciding with the dawn of civilization. Archaeological evidence from Eridu (founded 5400 BC) shows eighteen superimposed temples built over millennia. The Sumerian King List names Eridu as the first city where 'kingship descended from heaven.' This ancient city became the template for later Mesopotamian civilization, and its flood stories echo across cultures. The Great Flood, dated by evidence to around 2900 BC, marks a division between mythic time and historical time. Were the elaborate myths and monumental architecture of early Egypt and Mesopotamia preserving knowledge from an even earlier, now-lost civilization?",
      image: "/assets/ancient_civilization.png",
      isLocked: false,
      key: "lost-age"
    });
    
    await this.createScroll({
      title: "The Flood",
      content: "Chronicles of the great deluge that changed the course of humanity and ushered in a new age. When the waters rose, they cleansed the world of the corrupted consciousness that had forgotten its divine origins. Those who remembered the sacred knowledge retreated to high places, preserving the wisdom for the new cycle to come.",
      image: "/assets/great_flood.png",
      isLocked: false,
      key: "deluge"
    });
    
    await this.createScroll({
      title: "Celestial Cycles",
      content: "The movements of the heavenly bodies and their influence on the Great Cycle of existence. As above, so below - the cosmic dance of planets and stars reflects and influences the rhythms of consciousness on Earth. By understanding these celestial patterns, one can align with the greater cycles of transformation and evolution.",
      image: "/assets/ancient_city.png",
      isLocked: true,
      key: "celestial"
    });
    
    await this.createScroll({
      title: "Inner Alchemy",
      content: "Transformative practices to transmute consciousness and achieve inner illumination. The Great Work begins within. By purifying the elements of one's own being - earth, water, air, and fire - the seeker creates the conditions for the quintessence to emerge: the awakened consciousness that recognizes its own divine nature.",
      image: "/assets/crystal_tablet.png",
      isLocked: true,
      key: "alchemy"
    });
  }
}

// Use MemStorage for now since we don't have a database provisioned
export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private scrolls: Map<number, Scroll>;
  private userScrolls: Map<string, UserScroll>; // key in format "userId-scrollId"
  private oracleMessages: Map<number, OracleMessage>;
  private keeperMessages: Map<number, KeeperMessage>;
  private contactMessages: Map<number, ContactMessage>;
  private manaTransactions: Map<number, ManaTransaction>;
  private manaPackages: Map<number, ManaPackage>;
  private inventoryItems: Map<number, InventoryItem>; // New: for inventory items
  private oracleUsageBySession: Map<string, Map<string, number>>; // Track Oracle usage per session per date
  sessionStore: session.Store;
  
  private currentUserId: number;
  private currentScrollId: number;
  private currentOracleMessageId: number;
  private currentKeeperMessageId: number;
  private currentContactMessageId: number;
  private currentManaTransactionId: number;
  private currentManaPackageId: number;
  private currentInventoryItemId: number; // New: for tracking inventory item IDs

  constructor() {
    this.users = new Map();
    this.scrolls = new Map();
    this.userScrolls = new Map();
    this.oracleMessages = new Map();
    this.keeperMessages = new Map();
    this.contactMessages = new Map();
    this.manaTransactions = new Map();
    this.manaPackages = new Map();
    this.inventoryItems = new Map();
    this.oracleUsageBySession = new Map();
    
    // Initialize robust session store with explicit configuration
    console.log("MemStorage: Initializing MemoryStore for sessions");
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000, // prune expired entries every 24h
      stale: false, // don't serve stale sessions
      ttl: 86400000 * 7, // 1 week max lifetime
    });
    
    this.currentUserId = 1;
    this.currentScrollId = 1;
    this.currentOracleMessageId = 1;
    this.currentKeeperMessageId = 1;
    this.currentContactMessageId = 1;
    this.currentManaTransactionId = 1;
    this.currentManaPackageId = 1;
    this.currentInventoryItemId = 1;
    
    // Initialize data in an async way
    this.initializeData();
  }
  
  // Separate async initialization to avoid issues with constructor
  private async initializeData() {
    try {
      // Initialize with default mana packages first
      await this.initializeDefaultManaPackages();
      
      // Then initialize default scrolls
      await this.initializeDefaultScrolls();
      
      console.log("MemStorage: Finished initializing default data");
    } catch (error) {
      console.error("MemStorage: Error initializing data:", error);
    }
  }

  // USER METHODS
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }
  
  async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const createdAt = new Date();
    const user: User = { 
      ...insertUser, 
      id, 
      createdAt,
      email: insertUser.email,
      phone: insertUser.phone || null,
      password: insertUser.password || '', // Ensure password is always a string
      manaBalance: 0, // Initialize mana balance to 0
      stripeCustomerId: null, // Initialize stripe customer ID to null
      profilePicture: "/assets/default_avatar.svg" // Set default profile picture
    };
    this.users.set(id, user);
    return user;
  }
  
  // SCROLL METHODS
  async getAllScrolls(): Promise<Scroll[]> {
    return Array.from(this.scrolls.values());
  }
  
  async getScrollById(id: number): Promise<Scroll | undefined> {
    return this.scrolls.get(id);
  }
  
  async createScroll(insertScroll: InsertScroll): Promise<Scroll> {
    const id = this.currentScrollId++;
    // Ensure isLocked has a default value of true if not provided
    const scroll: Scroll = { 
      ...insertScroll, 
      id,
      isLocked: insertScroll.isLocked !== undefined ? insertScroll.isLocked : true,
      type: insertScroll.type || 'scroll', // Default type to 'scroll' if not provided
      key: insertScroll.key || null, // Ensure key can be null
    };
    this.scrolls.set(id, scroll);
    return scroll;
  }
  
  async unlockScroll(id: number): Promise<Scroll | undefined> {
    const scroll = this.scrolls.get(id);
    if (scroll) {
      scroll.isLocked = false;
      this.scrolls.set(id, scroll);
      return scroll;
    }
    return undefined;
  }
  
  async checkScrollKey(id: number, key: string): Promise<boolean> {
    const scroll = this.scrolls.get(id);
    if (scroll && scroll.key && typeof scroll.key === 'string') {
      return scroll.key.toLowerCase() === key.toLowerCase();
    }
    return false;
  }
  
  // USER-SCROLL RELATION METHODS
  async getUserUnlockedScrolls(userId: number): Promise<Scroll[]> {
    const unlockedScrolls: Scroll[] = [];
    
    // Find all relations for this user
    this.userScrolls.forEach((relation, key) => {
      if (relation.userId === userId) {
        const scroll = this.scrolls.get(relation.scrollId);
        if (scroll) {
          unlockedScrolls.push(scroll);
        }
      }
    });
    
    return unlockedScrolls;
  }
  
  async unlockScrollForUser(userId: number, scrollId: number): Promise<boolean> {
    // Check if user and scroll exist
    const user = this.users.get(userId);
    const scroll = this.scrolls.get(scrollId);
    
    if (!user || !scroll) {
      return false;
    }
    
    // Create relation key
    const key = `${userId}-${scrollId}`;
    
    // Check if already unlocked
    if (this.userScrolls.has(key)) {
      return true;
    }
    
    // Create new relation
    this.userScrolls.set(key, {
      userId,
      scrollId,
      unlockedAt: new Date()
    });
    
    return true;
  }
  
  async isScrollUnlockedForUser(userId: number, scrollId: number): Promise<boolean> {
    // Create relation key
    const key = `${userId}-${scrollId}`;
    
    // Check if relation exists
    return this.userScrolls.has(key);
  }
  
  // ORACLE MESSAGE METHODS
  async getOracleMessages(userId: string): Promise<OracleMessage[]> {
    return Array.from(this.oracleMessages.values())
      .filter(message => message.userId === userId)
      .sort((a, b) => a.id - b.id);
  }
  
  async createOracleMessage(insertMessage: InsertOracleMessage): Promise<OracleMessage> {
    const id = this.currentOracleMessageId++;
    const createdAt = new Date();
    const message: OracleMessage = { ...insertMessage, id, createdAt };
    this.oracleMessages.set(id, message);
    return message;
  }
  
  // KEEPER MESSAGE METHODS
  async getKeeperMessages(userId: string): Promise<KeeperMessage[]> {
    return Array.from(this.keeperMessages.values())
      .filter(message => message.userId === userId)
      .sort((a, b) => a.id - b.id);
  }
  
  async createKeeperMessage(insertMessage: InsertKeeperMessage): Promise<KeeperMessage> {
    const id = this.currentKeeperMessageId++;
    const createdAt = new Date();
    const message: KeeperMessage = { ...insertMessage, id, createdAt };
    this.keeperMessages.set(id, message);
    return message;
  }
  
  // CONTACT MESSAGE METHODS
  async createContactMessage(insertMessage: InsertContactMessage): Promise<ContactMessage> {
    const id = this.currentContactMessageId++;
    const createdAt = new Date();
    const message: ContactMessage = { ...insertMessage, id, createdAt };
    this.contactMessages.set(id, message);
    return message;
  }
  
  async getContactMessages(): Promise<ContactMessage[]> {
    return Array.from(this.contactMessages.values());
  }
  
  // MANA METHODS
  async getUserManaBalance(userId: number): Promise<number> {
    const user = await this.getUser(userId);
    return user?.manaBalance || 0;
  }

  async updateUserManaBalance(userId: number, amount: number): Promise<number> {
    const user = await this.getUser(userId);
    if (!user) {
      throw new Error(`User with ID ${userId} not found`);
    }
    
    const newBalance = (user.manaBalance || 0) + amount;
    user.manaBalance = newBalance;
    this.users.set(userId, user);
    
    return newBalance;
  }

  async createManaTransaction(transaction: InsertManaTransaction): Promise<ManaTransaction> {
    const id = this.currentManaTransactionId++;
    const createdAt = new Date();
    
    const newTransaction: ManaTransaction = {
      ...transaction,
      id,
      createdAt,
      referenceId: transaction.referenceId || null,
      stripePaymentIntentId: transaction.stripePaymentIntentId || null
    };
    
    this.manaTransactions.set(id, newTransaction);
    return newTransaction;
  }

  async getUserManaTransactions(userId: number): Promise<ManaTransaction[]> {
    return Array.from(this.manaTransactions.values())
      .filter(transaction => transaction.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async getAllManaPackages(): Promise<ManaPackage[]> {
    return Array.from(this.manaPackages.values())
      .filter(pkg => pkg.isActive)
      .sort((a, b) => a.price - b.price);
  }

  async getManaPackageById(id: number): Promise<ManaPackage | undefined> {
    return this.manaPackages.get(id);
  }

  async createManaPackage(manaPackage: InsertManaPackage): Promise<ManaPackage> {
    const id = this.currentManaPackageId++;
    const createdAt = new Date();
    
    const newPackage: ManaPackage = {
      ...manaPackage,
      id,
      createdAt,
      isActive: manaPackage.isActive !== undefined ? manaPackage.isActive : true
    };
    
    this.manaPackages.set(id, newPackage);
    return newPackage;
  }

  async updateManaPackage(id: number, updates: Partial<InsertManaPackage>): Promise<ManaPackage | undefined> {
    const existingPackage = await this.getManaPackageById(id);
    
    if (!existingPackage) {
      return undefined;
    }
    
    const updatedPackage: ManaPackage = {
      ...existingPackage,
      ...updates,
      id: existingPackage.id,
      createdAt: existingPackage.createdAt
    };
    
    this.manaPackages.set(id, updatedPackage);
    return updatedPackage;
  }

  async updateUserStripeCustomerId(userId: number, stripeCustomerId: string): Promise<User> {
    const user = await this.getUser(userId);
    
    if (!user) {
      throw new Error(`User with ID ${userId} not found`);
    }
    
    user.stripeCustomerId = stripeCustomerId;
    this.users.set(userId, user);
    
    return user;
  }
  
  async updateUserProfilePicture(userId: number, profilePicture: string): Promise<User> {
    const user = await this.getUser(userId);
    
    if (!user) {
      throw new Error(`User with ID ${userId} not found`);
    }
    
    user.profilePicture = profilePicture;
    this.users.set(userId, user);
    
    return user;
  }
  
  async updateScrollImage(id: number, imagePath: string): Promise<Scroll | undefined> {
    const scroll = await this.getScrollById(id);
    
    if (!scroll) {
      return undefined;
    }
    
    scroll.image = imagePath;
    this.scrolls.set(id, scroll);
    
    return scroll;
  }
  
  // Inventory system methods
  async getUserInventory(userId: number): Promise<InventoryItem[]> {
    const items: InventoryItem[] = [];
    for (const item of this.inventoryItems.values()) {
      if (item.userId === userId) {
        items.push(item);
      }
    }
    return items;
  }
  
  async getInventoryItemById(id: number): Promise<InventoryItem | undefined> {
    return this.inventoryItems.get(id);
  }
  
  async addInventoryItem(item: InsertInventoryItem): Promise<InventoryItem> {
    const id = this.currentInventoryItemId++;
    const createdAt = new Date();
    
    const newItem: InventoryItem = {
      ...item,
      id,
      createdAt
    };
    
    this.inventoryItems.set(id, newItem);
    return newItem;
  }
  
  async updateInventoryItem(id: number, updates: Partial<InsertInventoryItem>): Promise<InventoryItem | undefined> {
    const item = await this.getInventoryItemById(id);
    
    if (!item) {
      return undefined;
    }
    
    const updatedItem: InventoryItem = {
      ...item,
      ...updates
    };
    
    this.inventoryItems.set(id, updatedItem);
    return updatedItem;
  }
  
  async removeInventoryItem(id: number): Promise<boolean> {
    return this.inventoryItems.delete(id);
  }
  
  async updateItemQuantity(id: number, quantity: number): Promise<InventoryItem | undefined> {
    const item = await this.getInventoryItemById(id);
    
    if (!item) {
      return undefined;
    }
    
    item.quantity = quantity;
    this.inventoryItems.set(id, item);
    return item;
  }
  
  async equipItem(id: number, isEquipped: boolean): Promise<InventoryItem | undefined> {
    const item = await this.getInventoryItemById(id);
    
    if (!item) {
      return undefined;
    }
    
    item.isEquipped = isEquipped;
    this.inventoryItems.set(id, item);
    return item;
  }
  
  async getEquippedItems(userId: number): Promise<InventoryItem[]> {
    const items: InventoryItem[] = [];
    for (const item of this.inventoryItems.values()) {
      if (item.userId === userId && item.isEquipped) {
        items.push(item);
      }
    }
    return items;
  }
  
  // Oracle usage tracking methods
  async getOracleSessionCount(userId: string, date: string): Promise<number> {
    try {
      // Check if we have data for this session
      const sessionData = this.oracleUsageBySession.get(userId);
      if (!sessionData) {
        return 0;
      }
      
      // Check if we have data for this date
      return sessionData.get(date) || 0;
    } catch (error) {
      console.error("Error getting Oracle session count:", error);
      return 0;
    }
  }
  
  async incrementOracleSessionCount(userId: string, date: string): Promise<number> {
    try {
      // Check if we have a map for this session
      if (!this.oracleUsageBySession.has(userId)) {
        this.oracleUsageBySession.set(userId, new Map<string, number>());
      }
      
      // Get the map for this session
      const sessionData = this.oracleUsageBySession.get(userId)!;
      
      // Get current count for this date
      const currentCount = sessionData.get(date) || 0;
      const newCount = currentCount + 1;
      
      // Update the count
      sessionData.set(date, newCount);
      
      return newCount;
    } catch (error) {
      console.error("Error incrementing Oracle session count:", error);
      return 1; // Default to 1 if there's an error
    }
  }
  
  // INITIALIZE DEFAULT DATA
  private async initializeDefaultManaPackages() {
    // Get all existing packages
    const existingPackages = await this.getAllManaPackages();
    
    // Only initialize if none exist
    if (existingPackages.length > 0) {
      console.log(`MemStorage: Mana packages already exist: ${existingPackages.length}`);
      return;
    }
    
    console.log("MemStorage: Initializing default Mana packages");
    
    // Define default packages
    const packages = [
      {
        name: "Novice Pack",
        description: "A small amount of Mana to unlock basic scrolls and features.",
        amount: 100,
        price: 499, // $4.99
        isActive: true
      },
      {
        name: "Adept Pack",
        description: "A moderate amount of Mana for regular Archive users.",
        amount: 300,
        price: 999, // $9.99
        isActive: true
      },
      {
        name: "Scholar Pack",
        description: "A substantial amount of Mana for dedicated seekers of knowledge.",
        amount: 1000,
        price: 2499, // $24.99
        isActive: true
      },
      {
        name: "Master Pack",
        description: "An abundant reserve of Mana for the most devoted students of the Archive.",
        amount: 2500,
        price: 4999, // $49.99
        isActive: true
      }
    ];
    
    // Create all packages one by one
    for (const pkg of packages) {
      await this.createManaPackage(pkg);
    }
    
    console.log(`MemStorage: Created ${packages.length} default Mana packages`);
  }
  
  private async initializeDefaultScrolls() {
    // Check if scrolls already exist
    const existingScrolls = await this.getAllScrolls();
    
    if (existingScrolls.length > 0) {
      console.log(`MemStorage: Scrolls already initialized (${existingScrolls.length} found), skipping`);
      return; // Skip initialization if scrolls already exist
    }
    
    console.log("MemStorage: Initializing default scrolls - no existing scrolls found");
    
    const unlockScrolls = [
      {
        title: "Origins",
        content: "The first tablet of creation, revealing how the world began and the first emergence of consciousness. The primordial waters stirred with potential, and from the depths arose the first patterns of existence. The sacred geometries that form the foundation of all reality began to align, creating the template upon which all life would eventually manifest.",
        image: "/assets/ancient_tablet_dark.png",
        isLocked: false,
        key: "origins"
      },
      {
        title: "The Path",
        content: "Guidance for the seeker on the journey through the labyrinth of consciousness and awakening. The path winds through many landscapes of awareness, each offering its own challenges and revelations. Those who walk with awareness find that the journey itself transforms them, and the destination is merely a reflection of the traveler.",
        image: "/assets/ancient_tablet_cracked.png",
        isLocked: false,
        key: "path"
      },
      {
        title: "Sacred Geometry",
        content: "The underlying patterns that connect all life and form the foundation of the universe. In the perfect dance of circle, square, and triangle lies the blueprint of creation. The Flower of Life, the Seed of Life, the Tree of Life - all expressions of the same fundamental patterns that govern existence at every scale, from atomic to cosmic.",
        image: "/assets/sacred_symbol.png",
        isLocked: false,
        key: "geometry"
      },
      {
        title: "The Flood",
        content: "Chronicles of the great deluge that changed the course of humanity and ushered in a new age. When the waters rose, they cleansed the world of the corrupted consciousness that had forgotten its divine origins. Those who remembered the sacred knowledge retreated to high places, preserving the wisdom for the new cycle to come.",
        image: "/assets/great_flood.png",
        isLocked: false,
        key: "deluge"
      },
      {
        title: "Legacy of the Lost Age",
        content: "Many ancient cultures share flood myths coinciding with the dawn of civilization. Archaeological evidence from Eridu (founded 5400 BC) shows eighteen superimposed temples built over millennia. The Sumerian King List names Eridu as the first city where 'kingship descended from heaven.' This ancient city became the template for later Mesopotamian civilization, and its flood stories echo across cultures. The Great Flood, dated by evidence to around 2900 BC, marks a division between mythic time and historical time. Were the elaborate myths and monumental architecture of early Egypt and Mesopotamia preserving knowledge from an even earlier, now-lost civilization?",
        image: "/assets/ancient_civilization.png",
        isLocked: false,
        key: "lost-age"
      }
    ];
    
    const lockedScrolls = [
      {
        title: "Celestial Cycles",
        content: "The movements of the heavenly bodies and their influence on the Great Cycle of existence. As above, so below - the cosmic dance of planets and stars reflects and influences the rhythms of consciousness on Earth. By understanding these celestial patterns, one can align with the greater cycles of transformation and evolution.",
        image: "/assets/ancient_city.png",
        isLocked: true,
        key: "celestial"
      },
      {
        title: "Inner Alchemy",
        content: "Transformative practices to transmute consciousness and achieve inner illumination. The Great Work begins within. By purifying the elements of one's own being - earth, water, air, and fire - the seeker creates the conditions for the quintessence to emerge: the awakened consciousness that recognizes its own divine nature.",
        image: "/assets/crystal_tablet.png",
        isLocked: true,
        key: "alchemy"
      }
    ];
    
    // Create all scrolls one by one
    for (const scroll of [...unlockScrolls, ...lockedScrolls]) {
      await this.createScroll(scroll);
    }
    
    console.log(`MemStorage: Created ${unlockScrolls.length + lockedScrolls.length} default scrolls`);
  }
}

// Use DatabaseStorage if a database connection is available, otherwise fall back to MemStorage
export const storage = isDatabaseAvailable ? new DatabaseStorage() : new MemStorage();
