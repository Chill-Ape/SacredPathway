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
  users,
  scrolls,
  userScrolls,
  oracleMessages,
  contactMessages,
  keeperMessages,
  manaTransactions,
  manaPackages,
  oracleUsage
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
      });
    } else {
      console.log("Initializing PostgreSQL session store");
      this.sessionStore = new PostgresSessionStore({
        pool: pool,
        createTableIfMissing: true
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
      
      // Initialize scrolls
      try {
        // Check if we have any scrolls in the database 
        const existingScrolls = await db.select().from(scrolls);
        
        if (existingScrolls.length === 0) {
          console.log("Scrolls table is empty, creating default scrolls");
          await this._initializeDefaultScrolls();
        } else {
          console.log("Scrolls already exist:", existingScrolls.length);
        }
      } catch (err) {
        // If the table doesn't exist yet, we'll get an error
        console.log("Scrolls table not initialized yet, creating default scrolls");
        await this._initializeDefaultScrolls();
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
  
  async _initializeDefaultScrolls() {
    console.log("Initializing default scrolls");
    
    // Define unlocked scrolls
    const unlockScrolls: InsertScroll[] = [
      {
        title: "Welcome to the Archive",
        content: "The Sacred Archive is a repository of ancient wisdom, preserved by The Keepers throughout the ages. Within these halls, you'll find knowledge that has been hidden from the world for millennia. As a Seeker, you have been granted access to the outer chambers. More profound wisdom awaits in the deeper sanctums as you prove yourself worthy.",
        image: "/assets/welcome_scroll.png",
        isLocked: false,
        key: ""
      }
    ];
    
    // Define locked scrolls
    const lockedScrolls: InsertScroll[] = [
      {
        title: "The Great Flood",
        content: "An ancient cataclysm wiped out civilizations across the globe, preserved in myths worldwide. Survivors carried fragments of antediluvian knowledge into our age. The waters came suddenly, but not without warning - the Watchers knew and preserved what wisdom they could. The Archive contains much that was saved from this deluge.",
        image: "/assets/flood_scroll.png",
        isLocked: true,
        key: "deluge"
      },
      {
        title: "The Five Pillars",
        content: "The knowledge of the Archive is organized around five fundamental principles: The Flood that nearly erased humanity; The Ark that preserved what remained; The Cycle that governs time; Mana, the force that flows through all; and The Tablets, which record the ancient codes. Understanding their interconnection is key to ascending through the Archive.",
        image: "/assets/pillars_scroll.png",
        isLocked: true,
        key: "pillars"
      },
      {
        title: "Inner Alchemy",
        content: "Transformative practices to transmute consciousness and achieve inner illumination. The Great Work begins within. By purifying the elements of one's own being - earth, water, air, and fire - the seeker creates the conditions for the quintessence to emerge: the awakened consciousness that recognizes its own divine nature.",
        image: "/assets/crystal_tablet.png",
        isLocked: true,
        key: "alchemy"
      }
    ];
    
    // Create all scrolls
    for (const scroll of [...unlockScrolls, ...lockedScrolls]) {
      await this.createScroll(scroll);
    }
  }
  
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
  
  // For scroll image updating
  async updateScrollImage(id: number, imagePath: string): Promise<Scroll | undefined> {
    const [result] = await db.update(scrolls)
      .set({ image: imagePath })
      .where(eq(scrolls.id, id))
      .returning();
    
    return result;
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

  // Initialize default scrolls 
  async initializeDefaultScrolls() {
    // Check if we already have scrolls to avoid duplication
    const existingScrolls = await db.select().from(scrolls);
    if (existingScrolls.length > 0) {
      return; // Already initialized
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
  sessionStore: session.Store;
  
  private currentUserId: number;
  private currentScrollId: number;
  private currentOracleMessageId: number;
  private currentKeeperMessageId: number;
  private currentContactMessageId: number;
  private currentManaTransactionId: number;
  private currentManaPackageId: number;

  constructor() {
    this.users = new Map();
    this.scrolls = new Map();
    this.userScrolls = new Map();
    this.oracleMessages = new Map();
    this.keeperMessages = new Map();
    this.contactMessages = new Map();
    this.manaTransactions = new Map();
    this.manaPackages = new Map();
    
    // Initialize session store
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000, // prune expired entries every 24h
    });
    
    this.currentUserId = 1;
    this.currentScrollId = 1;
    this.currentOracleMessageId = 1;
    this.currentKeeperMessageId = 1;
    this.currentContactMessageId = 1;
    this.currentManaTransactionId = 1;
    this.currentManaPackageId = 1;
    
    // Initialize with some default scrolls
    this.initializeDefaultScrolls();
    
    // Initialize with default mana packages
    this.initializeDefaultManaPackages();
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
      stripeCustomerId: null // Initialize stripe customer ID to null
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
      isLocked: insertScroll.isLocked !== undefined ? insertScroll.isLocked : true
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
    if (scroll) {
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
  
  async updateScrollImage(id: number, imagePath: string): Promise<Scroll | undefined> {
    const scroll = await this.getScrollById(id);
    
    if (!scroll) {
      return undefined;
    }
    
    scroll.image = imagePath;
    this.scrolls.set(id, scroll);
    
    return scroll;
  }
  
  // INITIALIZE DEFAULT DATA
  private initializeDefaultManaPackages() {
    // Only initialize if none exist
    if (this.manaPackages.size > 0) {
      return;
    }
    
    // Create default mana packages
    this.createManaPackage({
      name: "Novice Pack",
      description: "A small amount of Mana to unlock basic scrolls and features.",
      amount: 100,
      price: 499, // $4.99
      isActive: true
    });
    
    this.createManaPackage({
      name: "Adept Pack",
      description: "A moderate amount of Mana for regular Archive users.",
      amount: 300,
      price: 999, // $9.99
      isActive: true
    });
    
    this.createManaPackage({
      name: "Scholar Pack",
      description: "A substantial amount of Mana for dedicated seekers of knowledge.",
      amount: 1000,
      price: 2499, // $24.99
      isActive: true
    });
    
    this.createManaPackage({
      name: "Master Pack",
      description: "An abundant reserve of Mana for the most devoted students of the Archive.",
      amount: 2500,
      price: 4999, // $49.99
      isActive: true
    });
  }
  
  private initializeDefaultScrolls() {
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
    
    // Create all scrolls
    [...unlockScrolls, ...lockedScrolls].forEach(scroll => {
      this.createScroll(scroll);
    });
  }
}

// Use DatabaseStorage if a database connection is available, otherwise fall back to MemStorage
export const storage = isDatabaseAvailable ? new DatabaseStorage() : new MemStorage();
