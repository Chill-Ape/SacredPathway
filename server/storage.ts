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
  users,
  scrolls,
  oracleMessages,
  contactMessages,
  keeperMessages
} from "@shared/schema";
import { db, isDatabaseAvailable } from "./db";
import { eq } from "drizzle-orm";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Scroll methods
  getAllScrolls(): Promise<Scroll[]>;
  getScrollById(id: number): Promise<Scroll | undefined>;
  createScroll(scroll: InsertScroll): Promise<Scroll>;
  unlockScroll(id: number): Promise<Scroll | undefined>;
  checkScrollKey(id: number, key: string): Promise<boolean>;
  
  // Oracle message methods
  getOracleMessages(userId: string): Promise<OracleMessage[]>;
  createOracleMessage(message: InsertOracleMessage): Promise<OracleMessage>;
  
  // Keeper message methods
  getKeeperMessages(userId: string): Promise<KeeperMessage[]>;
  createKeeperMessage(message: InsertKeeperMessage): Promise<KeeperMessage>;
  
  // Contact message methods
  createContactMessage(message: InsertContactMessage): Promise<ContactMessage>;
  getContactMessages(): Promise<ContactMessage[]>;
}

export class DatabaseStorage implements IStorage {
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
      image: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc",
      isLocked: false,
      key: "origins"
    });
    
    await this.createScroll({
      title: "The Path",
      content: "Guidance for the seeker on the journey through the labyrinth of consciousness and awakening. The path winds through many landscapes of awareness, each offering its own challenges and revelations. Those who walk with awareness find that the journey itself transforms them, and the destination is merely a reflection of the traveler.",
      image: "https://images.unsplash.com/photo-1585829365295-ab7cd400c167",
      isLocked: false,
      key: "path"
    });
    
    await this.createScroll({
      title: "Sacred Geometry",
      content: "The underlying patterns that connect all life and form the foundation of the universe. In the perfect dance of circle, square, and triangle lies the blueprint of creation. The Flower of Life, the Seed of Life, the Tree of Life - all expressions of the same fundamental patterns that govern existence at every scale, from atomic to cosmic.",
      image: "https://pixabay.com/get/ge7348c3db3bb477215ee95542b56ca259ded8edac4638452d9dd6ef04671df955d7c84e3bef175cd5f0b16c05ee29ea68fe66df94a5cd6dbbd13d3cd201e10e8_1280.jpg",
      isLocked: false,
      key: "geometry"
    });
    
    // Locked scrolls
    await this.createScroll({
      title: "The Flood",
      content: "Chronicles of the great deluge that changed the course of humanity and ushered in a new age. When the waters rose, they cleansed the world of the corrupted consciousness that had forgotten its divine origins. Those who remembered the sacred knowledge retreated to high places, preserving the wisdom for the new cycle to come.",
      image: "https://images.unsplash.com/photo-1599707254554-027aeb4deacd",
      isLocked: true,
      key: "deluge"
    });
    
    await this.createScroll({
      title: "Celestial Cycles",
      content: "The movements of the heavenly bodies and their influence on the Great Cycle of existence. As above, so below - the cosmic dance of planets and stars reflects and influences the rhythms of consciousness on Earth. By understanding these celestial patterns, one can align with the greater cycles of transformation and evolution.",
      image: "https://images.unsplash.com/photo-1532968961962-8a0cb45a9bc0",
      isLocked: true,
      key: "celestial"
    });
    
    await this.createScroll({
      title: "Inner Alchemy",
      content: "Transformative practices to transmute consciousness and achieve inner illumination. The Great Work begins within. By purifying the elements of one's own being - earth, water, air, and fire - the seeker creates the conditions for the quintessence to emerge: the awakened consciousness that recognizes its own divine nature.",
      image: "https://pixabay.com/get/gdc09a72847686903158033c8a1132fe5676295b2295196f10ba03b843d65b873eaa655f918a75e78e37bdacc3b35a2bac743a5e0603a03273823a3b2ddccb301_1280.jpg",
      isLocked: true,
      key: "alchemy"
    });
  }
}

// Use MemStorage for now since we don't have a database provisioned
export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private scrolls: Map<number, Scroll>;
  private oracleMessages: Map<number, OracleMessage>;
  private keeperMessages: Map<number, KeeperMessage>;
  private contactMessages: Map<number, ContactMessage>;
  
  private currentUserId: number;
  private currentScrollId: number;
  private currentOracleMessageId: number;
  private currentKeeperMessageId: number;
  private currentContactMessageId: number;

  constructor() {
    this.users = new Map();
    this.scrolls = new Map();
    this.oracleMessages = new Map();
    this.keeperMessages = new Map();
    this.contactMessages = new Map();
    
    this.currentUserId = 1;
    this.currentScrollId = 1;
    this.currentOracleMessageId = 1;
    this.currentKeeperMessageId = 1;
    this.currentContactMessageId = 1;
    
    // Initialize with some default scrolls
    this.initializeDefaultScrolls();
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

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
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
  
  // INITIALIZE DEFAULT DATA
  private initializeDefaultScrolls() {
    const unlockScrolls = [
      {
        title: "Origins",
        content: "The first tablet of creation, revealing how the world began and the first emergence of consciousness. The primordial waters stirred with potential, and from the depths arose the first patterns of existence. The sacred geometries that form the foundation of all reality began to align, creating the template upon which all life would eventually manifest.",
        image: "/assets/ChatGPT Image May 10, 2025, 05_25_40 PM.png",
        isLocked: false,
        key: "origins"
      },
      {
        title: "The Path",
        content: "Guidance for the seeker on the journey through the labyrinth of consciousness and awakening. The path winds through many landscapes of awareness, each offering its own challenges and revelations. Those who walk with awareness find that the journey itself transforms them, and the destination is merely a reflection of the traveler.",
        image: "/assets/ChatGPT Image May 10, 2025, 05_27_25 PM.png",
        isLocked: false,
        key: "path"
      },
      {
        title: "Sacred Geometry",
        content: "The underlying patterns that connect all life and form the foundation of the universe. In the perfect dance of circle, square, and triangle lies the blueprint of creation. The Flower of Life, the Seed of Life, the Tree of Life - all expressions of the same fundamental patterns that govern existence at every scale, from atomic to cosmic.",
        image: "/assets/ChatGPT Image Apr 24, 2025, 06_05_26 PM.png",
        isLocked: false,
        key: "geometry"
      }
    ];
    
    const lockedScrolls = [
      {
        title: "The Flood",
        content: "Chronicles of the great deluge that changed the course of humanity and ushered in a new age. When the waters rose, they cleansed the world of the corrupted consciousness that had forgotten its divine origins. Those who remembered the sacred knowledge retreated to high places, preserving the wisdom for the new cycle to come.",
        image: "/assets/bd4b8eed-bb3c-47be-aa39-0538667ff596.png",
        isLocked: true,
        key: "deluge"
      },
      {
        title: "Celestial Cycles",
        content: "The movements of the heavenly bodies and their influence on the Great Cycle of existence. As above, so below - the cosmic dance of planets and stars reflects and influences the rhythms of consciousness on Earth. By understanding these celestial patterns, one can align with the greater cycles of transformation and evolution.",
        image: "/assets/ChatGPT Image Apr 24, 2025, 07_12_19 PM.png",
        isLocked: true,
        key: "celestial"
      },
      {
        title: "Inner Alchemy",
        content: "Transformative practices to transmute consciousness and achieve inner illumination. The Great Work begins within. By purifying the elements of one's own being - earth, water, air, and fire - the seeker creates the conditions for the quintessence to emerge: the awakened consciousness that recognizes its own divine nature.",
        image: "/assets/ChatGPT Image Apr 24, 2025, 06_22_14 PM.png",
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

export const storage = new MemStorage();
