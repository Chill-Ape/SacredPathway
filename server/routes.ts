import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertOracleMessageSchema, 
  insertContactMessageSchema, 
  insertKeeperMessageSchema, 
  scrolls, 
  insertManaTransactionSchema,
  insertInventoryItemSchema,
  insertCraftingRecipeSchema,
  insertCraftingQueueSchema
} from "@shared/schema";
import { ITEM_TYPES, RARITY_LEVELS } from "@shared/constants";
import OpenAI from "openai";
import { PROMPTS } from "./config/prompts";
import { getLoreContext } from "./utils/loreSearch";
import { db } from "./db";
import { eq } from "drizzle-orm";
import Stripe from "stripe";
import { profileUpload, getProfilePictureUrl } from './utils/uploads';
import fs from 'fs';
import path from 'path';

// Crystal collection data for inventory
const CRYSTAL_COLLECTION = [
  {
    name: "Quartz Crystal",
    description: "A clear quartz crystal known for its amplifying energy. It's believed to enhance clarity of thought and spiritual connection.",
    type: "crystal",
    imageUrl: "/client/src/assets/crystals/quartz.png",
    rarity: "common",
    attributes: { energy: "amplifying", element: "universal" }
  },
  {
    name: "Fire Crystal",
    description: "A vibrant red crystal that emanates warmth. Associated with passion, courage, and the transformative power of fire.",
    type: "crystal",
    imageUrl: "/client/src/assets/crystals/fire.png",
    rarity: "uncommon",
    attributes: { energy: "transformative", element: "fire" }
  },
  {
    name: "Green Crystal",
    description: "An emerald-green crystal connected to growth and healing. It resonates with the heart and natural life force.",
    type: "crystal", 
    imageUrl: "/client/src/assets/crystals/green.png",
    rarity: "uncommon",
    attributes: { energy: "healing", element: "earth" }
  },
  {
    name: "Blue Cluster Crystal",
    description: "A cluster of blue crystals that vibrate with communicative energy. They enhance intuition and clarity of expression.",
    type: "crystal",
    imageUrl: "/client/src/assets/crystals/blue _cluster.png",
    rarity: "rare",
    attributes: { energy: "communicative", element: "water", form: "cluster" }
  },
  {
    name: "Sky Blue Crystal",
    description: "A translucent sky-blue crystal that connects to higher realms of consciousness. It aids in spiritual insight and elevating awareness.",
    type: "crystal",
    imageUrl: "/client/src/assets/crystals/sky_blue.png",
    rarity: "rare",
    attributes: { energy: "elevating", element: "air" }
  },
  {
    name: "Obsidian Crystal",
    description: "A dark, protective stone formed from volcanic glass. It shields against negative energies and grounds spiritual experiences.",
    type: "crystal",
    imageUrl: "/client/src/assets/crystals/obsidian.png",
    rarity: "uncommon",
    attributes: { energy: "protective", element: "earth", origin: "volcanic" }
  }
];

// Initialize OpenAI client
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Initialize Stripe client
if (!process.env.STRIPE_SECRET_KEY) {
  console.error('STRIPE_SECRET_KEY is not set. Stripe functionality will not work.');
}
// Initialize without explicit API version to use the latest available
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '');
console.log('Stripe client initialized with secret key status:', process.env.STRIPE_SECRET_KEY ? 'Available' : 'Missing');

import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { insertUserSchema, User } from "@shared/schema";

// Define types for Express User
declare global {
  namespace Express {
    // Use the User type from shared schema
    interface User {
      id: number;
      username: string;
      password: string;
      email: string;
      phone: string | null;
      manaBalance: number;
      stripeCustomerId: string | null;
      profilePicture: string | null;
      isAdmin: boolean;
      createdAt: Date;
    }
  }
}

// Helper functions for password hashing
const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function comparePasswords(supplied: string, stored: string) {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Health check routes are now defined in index.ts for better request handling order
  // Set up session and authentication using persistent storage
  const sessionSettings: session.SessionOptions = {
    // Use environment variable for session secret with fallback for development
    secret: process.env.SESSION_SECRET || 'dev-session-secret',
    resave: false,
    saveUninitialized: false,
    store: storage.sessionStore, // Use our database session store
    cookie: { 
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 1000 * 60 * 60 * 24 * 7 // 1 week
    }
  };
  
  // Check if SESSION_SECRET is set in production
  if (process.env.NODE_ENV === 'production' && !process.env.SESSION_SECRET) {
    console.warn('WARNING: SESSION_SECRET environment variable is not set in production mode!');
  }

  // Trust the first proxy in production environments (required for secure cookies over HTTPS)
  if (process.env.NODE_ENV === 'production') {
    app.set('trust proxy', 1);
  }

  // Apply session middleware
  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  // Configure passport
  passport.use(new LocalStrategy(async (username, password, done) => {
    try {
      const user = await storage.getUserByUsername(username);
      
      // For username-only auth, allow login without password
      if (user && !user.password) {
        return done(null, user);
      }
      
      // For standard auth, verify password
      if (!user || !user.password || !(await comparePasswords(password, user.password))) {
        return done(null, false, { message: 'Invalid username or password' });
      }
      
      return done(null, user);
    } catch (error) {
      return done(error);
    }
  }));

  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (error) {
      done(error);
    }
  });

  // Authentication routes
  app.post('/api/register', async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if username is taken
      const existingUser = await storage.getUserByUsername(userData.username);
      if (existingUser) {
        return res.status(400).json({ message: 'Username already taken' });
      }
      
      // Hash password if provided
      if (userData.password) {
        userData.password = await hashPassword(userData.password);
      }
      
      // Create user with initial mana balance
      const userDataWithMana = {
        ...userData,
        manaBalance: 50  // Add initial mana balance for new users
      };
      
      const user = await storage.createUser(userDataWithMana as any);
      
      // Create a record of the welcome bonus mana transaction
      await storage.createManaTransaction({
        userId: user.id,
        amount: 50,
        description: "Welcome bonus for new registration",
        transactionType: "welcome_bonus",
        referenceId: null,
        stripePaymentIntentId: null
      });
      
      // Add default inventory items for new users
      // 1. Crystal Tablet of Enki
      await storage.addInventoryItem({
        userId: user.id,
        name: "Crystal Tablet of Enki",
        description: "An ancient crystalline tablet inscribed with the wisdom of Enki, the god of creation and intelligence.",
        type: "tablet",
        imageUrl: "/assets/crystal_tablet.png",
        rarity: "rare",
        quantity: 1,
        isEquipped: false,
        usesLeft: null,
        attributes: { power: "wisdom", origin: "Sumerian" }
      });
      
      // 2. Book of the Apkallu
      await storage.addInventoryItem({
        userId: user.id,
        name: "Book of the Apkallu",
        description: "A sacred text detailing the knowledge brought by the seven sages who taught humanity wisdom.",
        type: "book",
        imageUrl: "/assets/book_apkallu.png",
        rarity: "uncommon",
        quantity: 1,
        isEquipped: false,
        usesLeft: null,
        attributes: { knowledge: "cosmic", language: "ancient" }
      });
      
      // 3. Crystal Fragment
      await storage.addInventoryItem({
        userId: user.id,
        name: "Crystal Fragment",
        description: "A small shard of luminous crystal that resonates with mysterious energy. Used for various ritual purposes.",
        type: "artifact",
        imageUrl: "/assets/crystal_fragment.png",
        rarity: "common",
        quantity: 3,
        isEquipped: false,
        usesLeft: null,
        attributes: { energy: "resonant", use: "ritual component" }
      });
      
      // 4. Quartz Crystal - Welcome gift
      const quartzCrystal = CRYSTAL_COLLECTION[0]; // Get quartz crystal data
      await storage.addInventoryItem({
        userId: user.id,
        name: quartzCrystal.name,
        description: quartzCrystal.description,
        type: quartzCrystal.type,
        imageUrl: quartzCrystal.imageUrl,
        rarity: quartzCrystal.rarity,
        quantity: 1,
        isEquipped: false,
        usesLeft: null,
        attributes: quartzCrystal.attributes
      });
      
      // Log the user in
      req.login(user, (err) => {
        if (err) {
          return res.status(500).json({ message: 'Error logging in after registration' });
        }
        return res.status(201).json({ 
          user: { id: user.id, username: user.username },
          welcomeBonus: 50
        });
      });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(400).json({ message: 'Invalid registration data' });
    }
  });

  app.post('/api/login', (req, res, next) => {
    passport.authenticate('local', (err: any, user: User | false, info: { message?: string }) => {
      if (err) {
        return next(err);
      }
      if (!user) {
        return res.status(401).json({ message: info?.message || 'Invalid credentials' });
      }
      req.login(user, (err: any) => {
        if (err) {
          return next(err);
        }
        return res.json({ user: { id: user.id, username: user.username } });
      });
    })(req, res, next);
  });

  app.post('/api/logout', (req, res) => {
    req.logout(() => {
      res.json({ message: 'Logged out successfully' });
    });
  });

  app.get('/api/user', (req, res) => {
    if (req.isAuthenticated() && req.user) {
      return res.json({ 
        user: { 
          id: req.user.id, 
          username: req.user.username,
          profilePicture: req.user.profilePicture || '/assets/sacred_symbol.png'
        } 
      });
    }
    res.status(401).json({ message: 'Not authenticated' });
  });
  
  // Update user's profile picture
  app.post('/api/user/profile-picture', async (req, res) => {
    if (!req.isAuthenticated() || !req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    try {
      const { profilePicture } = req.body;
      
      if (!profilePicture) {
        return res.status(400).json({ message: 'Profile picture URL is required' });
      }
      
      const updatedUser = await storage.updateUserProfilePicture(req.user.id, profilePicture);
      
      // Update the req.user object with the new profile picture so it's available in subsequent requests
      req.user.profilePicture = updatedUser.profilePicture;
      
      // Save the session to persist the user object changes
      req.session.save(err => {
        if (err) {
          console.error('Error saving session:', err);
        }
        
        res.json({ 
          user: { 
            id: updatedUser.id, 
            username: updatedUser.username,
            profilePicture: updatedUser.profilePicture 
          } 
        });
      });
    } catch (error) {
      console.error('Error updating profile picture:', error);
      res.status(500).json({ message: 'Failed to update profile picture' });
    }
  });

  // Upload profile picture (file upload)
  app.post('/api/user/upload-profile-picture', (req, res) => {
    if (!req.isAuthenticated() || !req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    // Handle file upload with multer
    profileUpload.single('profileImage')(req, res, async (err) => {
      if (err) {
        console.error('File upload error:', err);
        return res.status(400).json({ message: err.message || 'File upload failed' });
      }

      try {
        // If no file was uploaded
        if (!req.file) {
          return res.status(400).json({ message: 'No file uploaded' });
        }

        // Get the relative URL path for the uploaded file
        const filePath = req.file.path;
        const profilePictureUrl = getProfilePictureUrl(filePath);

        // Update user's profile picture in the database
        const updatedUser = await storage.updateUserProfilePicture(req.user.id, profilePictureUrl);
        
        // Update the req.user object with the new profile picture so it's available in subsequent requests
        req.user.profilePicture = updatedUser.profilePicture;
        
        // Save the session to persist the user object changes
        req.session.save(err => {
          if (err) {
            console.error('Error saving session:', err);
          }
          
          res.json({
            user: {
              id: updatedUser.id,
              username: updatedUser.username,
              profilePicture: updatedUser.profilePicture
            },
            message: 'Profile picture uploaded successfully'
          });
        });
      } catch (error) {
        console.error('Error processing uploaded profile picture:', error);
        
        // Delete the uploaded file in case of error
        if (req.file && req.file.path) {
          try {
            fs.unlinkSync(req.file.path);
          } catch (unlinkError) {
            console.error('Failed to remove uploaded file:', unlinkError);
          }
        }
        
        res.status(500).json({ message: 'Failed to process uploaded profile picture' });
      }
    });
  });
  
  const httpServer = createServer(app);

  // Get all scrolls
  app.get("/api/scrolls", async (_req: Request, res: Response) => {
    try {
      const scrolls = await storage.getAllScrolls();
      res.json(scrolls);
    } catch (error) {
      console.error("Error fetching scrolls:", error);
      res.status(500).json({ message: "Failed to fetch scrolls" });
    }
  });
  
  // Serve the ancient civilizations scroll data
  app.get("/api/sacred-scrolls/ancient-civilizations", (_req: Request, res: Response) => {
    try {
      // Read the JSON file from the filesystem
      const fs = require('fs');
      const path = require('path');
      const filePath = path.join(process.cwd(), 'public', 'data', 'ancient-civilizations-scroll.json');
      
      if (!fs.existsSync(filePath)) {
        console.error(`File not found: ${filePath}`);
        return res.status(404).json({ message: "Scroll data file not found" });
      }
      
      const data = fs.readFileSync(filePath, 'utf8');
      const jsonData = JSON.parse(data);
      
      res.json(jsonData);
    } catch (error) {
      console.error("Error serving ancient civilizations scroll:", error);
      res.status(500).json({ message: "Failed to serve scroll data" });
    }
  });

  // Get a specific scroll
  app.get("/api/scrolls/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const scroll = await storage.getScrollById(id);
      
      if (!scroll) {
        return res.status(404).json({ message: "Scroll not found" });
      }
      
      // For Legacy of the Lost Age (id 37), always use ancient_tablet_dark.png
      if (scroll.id === 37) {
        scroll.image = "/assets/ancient_tablet_dark.png";
      }
      
      res.json(scroll);
    } catch (error) {
      console.error("Error fetching scroll:", error);
      res.status(500).json({ message: "Failed to fetch scroll" });
    }
  });

  // Attempt to unlock a scroll
  app.post("/api/scrolls/:id/unlock", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const { key } = req.body;
      
      if (!key) {
        return res.status(400).json({ message: "Key is required" });
      }
      
      const isCorrect = await storage.checkScrollKey(id, key);
      
      if (isCorrect) {
        const updatedScroll = await storage.unlockScroll(id);
        
        // If user is authenticated, unlock the scroll for the user
        if (req.isAuthenticated() && req.user) {
          await storage.unlockScrollForUser(req.user.id, id);
        }
        
        res.json(updatedScroll);
      } else {
        res.status(403).json({ message: "Incorrect key" });
      }
    } catch (error) {
      console.error("Error unlocking scroll:", error);
      res.status(500).json({ message: "Failed to unlock scroll" });
    }
  });
  
  // Get all scrolls unlocked by the authenticated user
  app.get("/api/user/scrolls", async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated() || !req.user) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const scrolls = await storage.getUserUnlockedScrolls(req.user.id);
      res.json(scrolls);
    } catch (error) {
      console.error("Error fetching user scrolls:", error);
      res.status(500).json({ message: "Failed to fetch user scrolls" });
    }
  });
  
  // Check if a scroll is unlocked for the authenticated user
  app.get("/api/user/scrolls/:id", async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated() || !req.user) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const id = parseInt(req.params.id);
      const isUnlocked = await storage.isScrollUnlockedForUser(req.user.id, id);
      
      res.json({ isUnlocked });
    } catch (error) {
      console.error("Error checking user scroll status:", error);
      res.status(500).json({ message: "Failed to check scroll status" });
    }
  });
  
  // Admin endpoint to get all users (in a real app, you'd restrict this by role)
  app.get("/api/admin/users", async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated() || !req.user) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      // In a production app, you would check if the user has admin permissions
      // For now, we'll just allow any authenticated user to access this endpoint
      const users = await storage.getAllUsers();
      
      // Remove sensitive information like passwords
      const safeUsers = users.map(user => ({
        id: user.id,
        username: user.username,
        createdAt: user.createdAt
      }));
      
      res.json(safeUsers);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  // Get messages for a specific user session (supports both query and path parameters)
  app.get("/api/oracle/:userId?", async (req: Request, res: Response) => {
    try {
      // Get userId from either params (path) or query parameter
      const userId = req.params.userId || req.query.sessionId as string;
      
      if (!userId) {
        return res.status(400).json({ message: "User ID is required" });
      }
      
      const messages = await storage.getOracleMessages(userId);
      res.json(messages);
    } catch (error) {
      console.error("Error fetching oracle messages:", error);
      res.status(500).json({ message: "Failed to fetch oracle messages" });
    }
  });

  // Send a message to the oracle
  app.post("/api/oracle/message", async (req: Request, res: Response) => {
    try {
      const messageData = insertOracleMessageSchema.parse(req.body);
      const userId = messageData.userId;
      
      // Define Oracle usage costs
      const ORACLE_COST = 5; // Mana cost per Oracle query
      const FREE_DAILY_QUERIES = 3; // Number of free queries for non-authenticated users
      
      // Check for anonymous (non-authenticated) users' limits
      if (!req.isAuthenticated()) {
        // For anonymous users, check against session-based daily limit
        const todayDate = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
        const sessionKey = `oracle_${userId}_${todayDate}`;
        
        // Try to get session counter from storage
        let dailyCount = await storage.getOracleSessionCount(userId, todayDate);
        
        if (dailyCount >= FREE_DAILY_QUERIES) {
          return res.status(403).json({ 
            message: "You have reached your daily Oracle consultation limit. Create an account and purchase Mana to continue your journey with the Oracle.",
            requiresMana: true
          });
        }
        
        // Increment the daily count
        await storage.incrementOracleSessionCount(userId, todayDate);
      } else {
        // For authenticated users, check and deduct Mana
        const authenticatedUserId = req.user.id;
        
        // Get current Mana balance
        const manaBalance = await storage.getUserManaBalance(authenticatedUserId);
        
        if (manaBalance < ORACLE_COST) {
          return res.status(403).json({ 
            message: "Your Mana is insufficient to consult the Oracle. Acquire more Mana to continue your journey.",
            requiresMana: true
          });
        }
        
        // Deduct Mana for the Oracle consultation
        await storage.updateUserManaBalance(authenticatedUserId, -ORACLE_COST);
        
        // Record the transaction
        await storage.createManaTransaction({
          userId: authenticatedUserId,
          amount: -ORACLE_COST,
          description: "Oracle consultation",
          transactionType: "ORACLE_QUERY"
        });
      }
      
      // Store the user's message
      const savedMessage = await storage.createOracleMessage(messageData);
      
      // Generate response from Oracle using OpenAI
      const oracleResponse = await generateOracleResponse(messageData.message);
      
      // Store the oracle's response
      const oracleMessage = await storage.createOracleMessage({
        userId: messageData.userId,
        message: oracleResponse,
        isUser: false
      });
      
      res.json({
        userMessage: savedMessage,
        oracleMessage
      });
    } catch (error) {
      console.error("Error sending message to oracle:", error);
      res.status(500).json({ message: "Failed to send message to oracle" });
    }
  });

  // Get messages for the Keeper
  app.get("/api/keeper/:userId", async (req: Request, res: Response) => {
    try {
      const { userId } = req.params;
      const messages = await storage.getKeeperMessages(userId);
      res.json(messages);
    } catch (error) {
      console.error("Error fetching keeper messages:", error);
      res.status(500).json({ message: "Failed to fetch keeper messages" });
    }
  });

  // Send a message to the Keeper
  app.post("/api/keeper/message", async (req: Request, res: Response) => {
    try {
      const messageData = insertKeeperMessageSchema.parse(req.body);
      
      // Store the user's message
      const userMessage = await storage.createKeeperMessage({
        userId: messageData.userId,
        content: messageData.content,
        isUser: true
      });
      
      // Generate response from The Keeper using OpenAI
      const keeperResponse = await generateKeeperResponse(messageData.content);
      
      // Store the Keeper's response
      const assistantMessage = await storage.createKeeperMessage({
        userId: messageData.userId,
        content: keeperResponse,
        isUser: false
      });
      
      res.json({
        userMessage,
        assistantMessage
      });
    } catch (error) {
      console.error("Error sending message to The Oracle:", error);
      res.status(500).json({ message: "Failed to send message to The Oracle" });
    }
  });

  // Submit contact form
  app.post("/api/contact", async (req: Request, res: Response) => {
    try {
      const contactData = insertContactMessageSchema.parse(req.body);
      const savedMessage = await storage.createContactMessage(contactData);
      res.json(savedMessage);
    } catch (error) {
      console.error("Error submitting contact form:", error);
      res.status(500).json({ message: "Failed to submit contact form" });
    }
  });

  // MANA SYSTEM ROUTES
  
  // Get user's mana balance
  app.get("/api/user/mana", async (req: Request, res: Response) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }
    
    try {
      const balance = await storage.getUserManaBalance(req.user.id);
      res.json({ balance });
    } catch (error) {
      console.error("Error fetching mana balance:", error);
      res.status(500).json({ message: "Failed to fetch mana balance" });
    }
  });
  
  // Get user's mana transaction history
  app.get("/api/user/mana/transactions", async (req: Request, res: Response) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }
    
    try {
      const transactions = await storage.getUserManaTransactions(req.user.id);
      res.json(transactions);
    } catch (error) {
      console.error("Error fetching mana transactions:", error);
      res.status(500).json({ message: "Failed to fetch mana transactions" });
    }
  });
  
  // Get available mana packages
  app.get("/api/mana/packages", async (_req: Request, res: Response) => {
    try {
      const packages = await storage.getAllManaPackages();
      res.json(packages);
    } catch (error) {
      console.error("Error fetching mana packages:", error);
      res.status(500).json({ message: "Failed to fetch mana packages" });
    }
  });
  
  // Get specific mana package
  app.get("/api/mana/packages/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid package ID" });
      }
      
      const manaPackage = await storage.getManaPackageById(id);
      if (!manaPackage) {
        return res.status(404).json({ message: "Mana package not found" });
      }
      
      res.json(manaPackage);
    } catch (error) {
      console.error("Error fetching mana package:", error);
      res.status(500).json({ message: "Failed to fetch mana package" });
    }
  });
  
  // Direct Mana purchase endpoint (simpler alternative to Stripe for development)
  app.post("/api/mana/purchase/direct", async (req: Request, res: Response) => {
    // Check if user is authenticated
    if (!req.isAuthenticated()) {
      return res.status(200).json({ 
        requiresAuthentication: true,
        success: false,
        message: "Please log in to purchase mana" 
      });
    }
    
    try {
      const { packageId } = req.body;
      
      if (!packageId) {
        return res.status(400).json({ 
          success: false, 
          message: "Package ID is required" 
        });
      }
      
      // Get the mana package
      const manaPackage = await storage.getManaPackageById(Number(packageId));
      if (!manaPackage) {
        return res.status(404).json({ 
          success: false, 
          message: "Mana package not found" 
        });
      }
      
      console.log(`Processing direct mana purchase for user ${req.user.id}, package ${packageId}, amount ${manaPackage.amount}`);
      
      // Create a transaction record
      const transaction = await storage.createManaTransaction({
        userId: req.user.id,
        amount: manaPackage.amount,
        description: `Purchased ${manaPackage.amount} Mana`,
        transactionType: 'mana_purchase',
        referenceId: packageId.toString(),
        stripePaymentIntentId: `direct_${Date.now()}`
      });
      
      // Update the user's mana balance
      const newBalance = await storage.updateUserManaBalance(req.user.id, manaPackage.amount);
      console.log(`Updated mana balance for user ${req.user.id} to ${newBalance}`);
      
      // Return success response
      res.status(200).json({
        success: true,
        message: `Successfully purchased ${manaPackage.amount} Mana`,
        amount: manaPackage.amount,
        newBalance,
        transaction: transaction.id
      });
    } catch (error: any) {
      console.error("Failed to process direct mana purchase:", error);
      res.status(500).json({ 
        success: false, 
        message: "Failed to process mana transaction" 
      });
    }
  });
  
  // Spend mana to unlock a scroll
  app.post("/api/user/mana/spend", async (req: Request, res: Response) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }
    
    try {
      const { amount, scrollId, transactionType } = req.body;
      
      if (!amount || amount <= 0) {
        return res.status(400).json({ message: "Invalid amount" });
      }
      
      // Check if user has enough mana
      const currentBalance = await storage.getUserManaBalance(req.user.id);
      if (currentBalance < amount) {
        return res.status(400).json({ message: "Insufficient mana balance" });
      }
      
      // Create the transaction record
      const transaction = await storage.createManaTransaction({
        userId: req.user.id,
        amount: -amount, // Negative amount for spending
        description: `Spent ${amount} mana to ${transactionType === 'scroll_unlock' ? 'unlock a scroll' : 'access content'}`,
        transactionType: transactionType || 'scroll_unlock',
        referenceId: scrollId ? scrollId.toString() : null,
        stripePaymentIntentId: null
      });
      
      // Update the user's mana balance
      const newBalance = await storage.updateUserManaBalance(req.user.id, -amount);
      
      // If it's a scroll unlock, unlock the scroll for the user
      if (transactionType === 'scroll_unlock' && scrollId) {
        await storage.unlockScrollForUser(req.user.id, scrollId);
      }
      
      res.json({
        transaction,
        newBalance
      });
    } catch (error) {
      console.error("Error spending mana:", error);
      res.status(500).json({ message: "Failed to process mana transaction" });
    }
  });

  // Create a Stripe payment intent for purchasing Mana
  app.post("/api/mana/purchase/create-payment-intent", async (req: Request, res: Response) => {
    // Require authentication for purchasing Mana
    if (!req.isAuthenticated()) {
      return res.status(401).json({ 
        requiresAuthentication: true,
        success: false,
        message: "Please log in to purchase mana" 
      });
    }
    
    try {
      const { packageId } = req.body;
      
      if (!packageId) {
        return res.status(400).json({ message: "Package ID is required" });
      }
      
      // Get the mana package - only for authenticated users
      const manaPackage = await storage.getManaPackageById(Number(packageId));
      if (!manaPackage) {
        return res.status(404).json({ message: "Mana package not found" });
      }
      
      // Check if Stripe is initialized
      if (!stripe || !process.env.STRIPE_SECRET_KEY) {
        return res.status(503).json({ 
          message: "Payment service is unavailable. Stripe keys are not configured." 
        });
      }
      
      // For authenticated users, continue with payment intent creation
      // Get or create Stripe customer ID
      let { stripeCustomerId } = req.user;
      
      if (!stripeCustomerId) {
        // Create a new customer in Stripe
        const customer = await stripe.customers.create({
          email: req.user.email,
          name: req.user.username,
          metadata: {
            userId: req.user.id.toString()
          }
        });
        
        stripeCustomerId = customer.id;
        
        // Save the customer ID to the user record
        await storage.updateUserStripeCustomerId(req.user.id, stripeCustomerId);
      }
      
      // Get the domain
      const domain = process.env.NODE_ENV === 'production' 
        ? `https://${req.get('host')}`
        : `http://${req.get('host')}`;
      
      console.log('Creating Stripe Checkout session:');
      console.log('- Public key status:', process.env.VITE_STRIPE_PUBLIC_KEY ? 'Available' : 'Missing');
      console.log('- Secret key status:', process.env.STRIPE_SECRET_KEY ? 'Available' : 'Missing');
      console.log('- Domain for success/cancel URLs:', domain);
      console.log('- Package ID:', manaPackage.id);
      console.log('- Package price:', manaPackage.price);
      console.log('- Customer ID:', stripeCustomerId);
      
      // Create a Checkout session with explicit types
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: 'usd',
              product_data: {
                name: manaPackage.name,
                description: `${manaPackage.amount} Mana for the Akashic Archive`,
              },
              unit_amount: manaPackage.price,
            },
            quantity: 1,
          },
        ],
        mode: 'payment',
        customer: stripeCustomerId,
        success_url: `${domain}/mana?status=success&amount=${manaPackage.amount}`,
        cancel_url: `${domain}/mana?status=canceled`,
        metadata: {
          packageId: manaPackage.id.toString(),
          userId: req.user.id.toString(),
          manaAmount: manaPackage.amount.toString()
        },
      });
      
      // Log successful session creation
      console.log('Stripe session created successfully, session ID:', session.id);
      
      // Skip webhook creation in development since it requires HTTPS
      // and just rely on success_url redirect instead
      
      res.json({
        sessionId: session.id,
        packageDetails: manaPackage
      });
    } catch (error: any) {
      console.error("Error creating payment intent:", error);
      
      // Log detailed error information
      if (error.type === 'StripeError') {
        console.error('Stripe error code:', error.code);
        console.error('Stripe error message:', error.message);
        console.error('Stripe error type:', error.type);
      }
      
      res.status(500).json({ message: error.message || "Failed to create payment intent" });
    }
  });

  // Handle successful Stripe payment webhook 
  app.post("/api/mana/purchase/webhook", async (req: Request, res: Response) => {
    if (!stripe || !process.env.STRIPE_SECRET_KEY) {
      return res.status(503).json({ 
        message: "Payment service is unavailable. Stripe keys are not configured." 
      });
    }
    
    const sig = req.headers['stripe-signature'];
    let event;
    
    try {
      // Parse the webhook body and verify signature
      // This is a simplified version - in production we'd use proper signature verification
      // with process.env.STRIPE_WEBHOOK_SECRET
      const payload = req.body;
      
      // If it's a string (raw body), parse it
      if (typeof payload === 'string') {
        event = JSON.parse(payload);
      } else {
        event = payload;
      }
      
      // Handle the checkout.session.completed event
      if (event.type === 'checkout.session.completed') {
        const session = event.data.object;
        
        // Get metadata from the session
        const { userId, packageId, manaAmount } = session.metadata || {};
        
        if (!userId || !packageId || !manaAmount) {
          console.error('Missing metadata in completed session:', session.id);
          return res.status(400).send('Missing metadata');
        }
        
        console.log(`Processing completed payment for user ${userId}, package ${packageId}, amount ${manaAmount}`);
        
        // Create a mana transaction record
        await storage.createManaTransaction({
          userId: Number(userId),
          amount: Number(manaAmount),
          description: `Purchased ${manaAmount} Mana`,
          transactionType: 'mana_purchase',
          referenceId: packageId,
          stripePaymentIntentId: session.payment_intent
        });
        
        // Update the user's mana balance
        const newBalance = await storage.updateUserManaBalance(Number(userId), Number(manaAmount));
        console.log(`Updated mana balance for user ${userId} to ${newBalance}`);
      }
      
      // Return a 200 response to acknowledge receipt of the event
      res.status(200).send('Webhook processed successfully');
    } catch (error: any) {
      console.error('Webhook processing error:', error);
      res.status(400).send(`Webhook Error: ${error.message || 'Unknown error'}`);
    }
  });
  
  // Handle Stripe Checkout redirect after successful payment
  app.get("/api/mana/purchase/complete", async (req: Request, res: Response) => {
    const { session_id } = req.query;
    
    if (!session_id) {
      return res.redirect('/mana?status=error&message=No+session+ID+provided');
    }
    
    if (!stripe || !process.env.STRIPE_SECRET_KEY) {
      return res.redirect('/mana?status=error&message=Payment+service+unavailable');
    }
    
    try {
      // Retrieve the checkout session
      const session = await stripe.checkout.sessions.retrieve(session_id as string);
      
      // Check if the payment was successful
      if (session.payment_status !== 'paid') {
        return res.redirect('/mana?status=error&message=Payment+not+completed');
      }
      
      // Get the user and package details from the metadata
      const { userId, packageId, manaAmount } = session.metadata || {};
      
      if (!userId || !packageId || !manaAmount) {
        return res.redirect('/mana?status=error&message=Invalid+session+metadata');
      }
      
      // Get the mana package to verify
      const manaPackage = await storage.getManaPackageById(Number(packageId));
      if (!manaPackage) {
        return res.redirect('/mana?status=error&message=Mana+package+not+found');
      }
      
      // Create a mana transaction record
      await storage.createManaTransaction({
        userId: Number(userId),
        amount: Number(manaAmount),
        description: `Purchased ${manaAmount} Mana`,
        transactionType: 'mana_purchase',
        referenceId: packageId,
        stripePaymentIntentId: session.payment_intent as string
      });
      
      // Update the user's mana balance
      await storage.updateUserManaBalance(Number(userId), Number(manaAmount));
      
      // Redirect to the mana page with success message
      return res.redirect(`/mana?status=success&amount=${manaAmount}`);
    } catch (error) {
      console.error('Error processing checkout completion:', error);
      return res.redirect('/mana?status=error&message=Processing+error');
    }
  });
  
  // Complete a Mana purchase after successful payment
  app.post("/api/mana/purchase/complete", async (req: Request, res: Response) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }
    
    try {
      const { paymentIntentId } = req.body;
      
      if (!paymentIntentId) {
        return res.status(400).json({ message: "Payment intent ID is required" });
      }
      
      // Check if Stripe is initialized
      if (!stripe || !process.env.STRIPE_SECRET_KEY) {
        return res.status(503).json({ 
          message: "Payment service is unavailable. Stripe keys are not configured." 
        });
      }
      
      // Retrieve the payment intent to verify payment and get metadata
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
      
      // Verify that the payment was successful
      if (paymentIntent.status !== 'succeeded') {
        return res.status(400).json({ message: "Payment has not been completed" });
      }
      
      // Get metadata from the payment intent
      const { packageId, userId, manaAmount } = paymentIntent.metadata;
      
      // Verify that the payment intent belongs to the authenticated user
      if (Number(userId) !== req.user.id) {
        return res.status(403).json({ message: "Unauthorized payment intent" });
      }
      
      // Get the mana package to double-check the amount
      const manaPackage = await storage.getManaPackageById(Number(packageId));
      if (!manaPackage) {
        return res.status(404).json({ message: "Mana package not found" });
      }
      
      // Create a transaction record
      const transaction = await storage.createManaTransaction({
        userId: req.user.id,
        amount: manaPackage.amount,
        description: `Purchased ${manaPackage.amount} mana (${manaPackage.name})`,
        transactionType: 'purchase',
        referenceId: packageId,
        stripePaymentIntentId: paymentIntentId
      });
      
      // Update the user's mana balance
      const newBalance = await storage.updateUserManaBalance(req.user.id, manaPackage.amount);
      
      res.json({
        success: true,
        transaction,
        newBalance,
        message: `Successfully purchased ${manaPackage.amount} mana!`
      });
    } catch (error) {
      console.error("Error completing mana purchase:", error);
      res.status(500).json({ message: "Failed to complete mana purchase" });
    }
  });
  
  // INVENTORY SYSTEM ROUTES
  
  // Get user's inventory
  app.get("/api/user/inventory", async (req: Request, res: Response) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }
    
    try {
      const items = await storage.getUserInventory(req.user.id);
      res.json(items);
    } catch (error) {
      console.error("Error fetching inventory:", error);
      res.status(500).json({ message: "Failed to fetch inventory" });
    }
  });
  
  // Get all equipped items
  app.get("/api/user/inventory/equipped", async (req: Request, res: Response) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }
    
    try {
      const items = await storage.getEquippedItems(req.user.id);
      res.json(items);
    } catch (error) {
      console.error("Error fetching equipped items:", error);
      res.status(500).json({ message: "Failed to fetch equipped items" });
    }
  });
  
  // Get a specific inventory item
  app.get("/api/user/inventory/:id", async (req: Request, res: Response) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }
    
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid item ID" });
      }
      
      const item = await storage.getInventoryItemById(id);
      if (!item) {
        return res.status(404).json({ message: "Item not found" });
      }
      
      // Make sure the user owns this item
      if (item.userId !== req.user.id) {
        return res.status(403).json({ message: "You don't have access to this item" });
      }
      
      res.json(item);
    } catch (error) {
      console.error("Error fetching inventory item:", error);
      res.status(500).json({ message: "Failed to fetch inventory item" });
    }
  });
  
  // Add a new item to user's inventory
  app.post("/api/user/inventory", async (req: Request, res: Response) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }
    
    try {
      // Validate request body
      const itemData = insertInventoryItemSchema.parse({
        ...req.body,
        userId: req.user.id // Ensure the userId is set to the authenticated user
      });
      
      // Add the item to the inventory
      const newItem = await storage.addInventoryItem(itemData);
      
      res.status(201).json(newItem);
    } catch (error) {
      console.error("Error adding inventory item:", error);
      res.status(500).json({ message: "Failed to add inventory item" });
    }
  });
  
  // Update an inventory item
  app.patch("/api/user/inventory/:id", async (req: Request, res: Response) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }
    
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid item ID" });
      }
      
      // Check if the item exists and belongs to the user
      const existingItem = await storage.getInventoryItemById(id);
      if (!existingItem) {
        return res.status(404).json({ message: "Item not found" });
      }
      
      if (existingItem.userId !== req.user.id) {
        return res.status(403).json({ message: "You don't have permission to update this item" });
      }
      
      // Update the item
      const updatedItem = await storage.updateInventoryItem(id, req.body);
      
      res.json(updatedItem);
    } catch (error) {
      console.error("Error updating inventory item:", error);
      res.status(500).json({ message: "Failed to update inventory item" });
    }
  });
  
  // Delete an inventory item
  app.delete("/api/user/inventory/:id", async (req: Request, res: Response) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }
    
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid item ID" });
      }
      
      // Check if the item exists and belongs to the user
      const existingItem = await storage.getInventoryItemById(id);
      if (!existingItem) {
        return res.status(404).json({ message: "Item not found" });
      }
      
      if (existingItem.userId !== req.user.id) {
        return res.status(403).json({ message: "You don't have permission to delete this item" });
      }
      
      // Delete the item
      const result = await storage.removeInventoryItem(id);
      
      if (result) {
        res.status(200).json({ message: "Item successfully removed" });
      } else {
        res.status(500).json({ message: "Failed to remove item" });
      }
    } catch (error) {
      console.error("Error removing inventory item:", error);
      res.status(500).json({ message: "Failed to remove inventory item" });
    }
  });
  
  // Update item quantity
  app.patch("/api/user/inventory/:id/quantity", async (req: Request, res: Response) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }
    
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid item ID" });
      }
      
      const { quantity } = req.body;
      if (quantity === undefined || isNaN(quantity) || quantity < 0) {
        return res.status(400).json({ message: "Invalid quantity" });
      }
      
      // Check if the item exists and belongs to the user
      const existingItem = await storage.getInventoryItemById(id);
      if (!existingItem) {
        return res.status(404).json({ message: "Item not found" });
      }
      
      if (existingItem.userId !== req.user.id) {
        return res.status(403).json({ message: "You don't have permission to update this item" });
      }
      
      // Update the item quantity
      const updatedItem = await storage.updateItemQuantity(id, quantity);
      
      res.json(updatedItem);
    } catch (error) {
      console.error("Error updating item quantity:", error);
      res.status(500).json({ message: "Failed to update item quantity" });
    }
  });
  
  // Equip or unequip an item
  app.patch("/api/user/inventory/:id/equip", async (req: Request, res: Response) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }
    
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid item ID" });
      }
      
      const { isEquipped } = req.body;
      if (isEquipped === undefined) {
        return res.status(400).json({ message: "isEquipped field is required" });
      }
      
      // Check if the item exists and belongs to the user
      const existingItem = await storage.getInventoryItemById(id);
      if (!existingItem) {
        return res.status(404).json({ message: "Item not found" });
      }
      
      if (existingItem.userId !== req.user.id) {
        return res.status(403).json({ message: "You don't have permission to update this item" });
      }
      
      // Equip or unequip the item
      const updatedItem = await storage.equipItem(id, isEquipped);
      
      res.json(updatedItem);
    } catch (error) {
      console.error("Error equipping/unequipping item:", error);
      res.status(500).json({ message: "Failed to equip/unequip item" });
    }
  });
  
  // CRYSTAL COLLECTION ENDPOINTS
  
  // Get all available crystals
  app.get("/api/crystals", (_req: Request, res: Response) => {
    // Return the full crystal collection data
    res.json(CRYSTAL_COLLECTION);
  });

  // Purchase a crystal using mana
  app.post("/api/crystals/purchase", async (req: Request, res: Response) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    try {
      const { crystalName } = req.body;
      
      if (!crystalName) {
        return res.status(400).json({ message: "Crystal name is required" });
      }
      
      // Find the crystal in the collection
      const crystal = CRYSTAL_COLLECTION.find(c => c.name === crystalName);
      
      if (!crystal) {
        return res.status(404).json({ message: "Crystal not found" });
      }
      
      // Set price based on rarity
      let price = 50; // Default price for common crystals
      if (crystal.rarity === "uncommon") {
        price = 100;
      } else if (crystal.rarity === "rare") {
        price = 200;
      }
      
      // Check if user has enough mana
      const userMana = await storage.getUserManaBalance(req.user.id);
      
      if (userMana < price) {
        return res.status(400).json({ 
          message: "Not enough mana", 
          requiredMana: price, 
          currentMana: userMana 
        });
      }
      
      // Check if user already has this crystal
      const userInventory = await storage.getUserInventory(req.user.id);
      const existingCrystal = userInventory.find(item => item.name === crystal.name);
      
      if (existingCrystal) {
        // Update quantity if user already has this crystal
        const currentQuantity = existingCrystal.quantity || 0;
        await storage.updateItemQuantity(existingCrystal.id, currentQuantity + 1);
      } else {
        // Add crystal to user's inventory
        await storage.addInventoryItem({
          userId: req.user.id,
          name: crystal.name,
          description: crystal.description,
          type: crystal.type,
          imageUrl: crystal.imageUrl,
          rarity: crystal.rarity,
          quantity: 1,
          isEquipped: false,
          usesLeft: null,
          attributes: crystal.attributes
        });
      }
      
      // Deduct mana from user's balance
      const newBalance = await storage.updateUserManaBalance(req.user.id, -price);
      
      // Create mana transaction record
      await storage.createManaTransaction({
        userId: req.user.id,
        amount: -price,
        description: `Purchased ${crystal.name}`,
        transactionType: "crystal_purchase",
        referenceId: null,
        stripePaymentIntentId: null
      });
      
      res.json({ 
        success: true, 
        message: `Successfully purchased ${crystal.name}`,
        newManaBalance: newBalance
      });
    } catch (error) {
      console.error("Error purchasing crystal:", error);
      res.status(500).json({ message: "Failed to purchase crystal" });
    }
  });
  
  // CRAFTING SYSTEM ROUTES
  
  // Get all crafting recipes
  app.get("/api/crafting/recipes", async (req: Request, res: Response) => {
    try {
      const recipes = await storage.getAllCraftingRecipes();
      
      // If the user is authenticated, mark recipes as discovered or not
      if (req.isAuthenticated()) {
        const userId = req.user.id;
        const discoveries = await storage.getDiscoveredRecipes(userId);
        const discoveredIds = discoveries.map(recipe => recipe.id);
        
        // Mark recipes that the user has discovered
        const recipesWithDiscoveryState = recipes.map(recipe => ({
          ...recipe,
          isDiscovered: discoveredIds.includes(recipe.id)
        }));
        
        res.json(recipesWithDiscoveryState);
      } else {
        // For unauthenticated users, only return public recipes without discovery info
        const publicRecipes = recipes.filter(recipe => recipe.isPublic !== false);
        res.json(publicRecipes);
      }
    } catch (error) {
      console.error("Error fetching crafting recipes:", error);
      res.status(500).json({ message: "Failed to fetch crafting recipes" });
    }
  });
  
  // Get only discovered recipes for current user
  app.get("/api/user/crafting/recipes", async (req: Request, res: Response) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }
    
    try {
      const recipes = await storage.getDiscoveredRecipes(req.user.id);
      res.json(recipes);
    } catch (error) {
      console.error("Error fetching discovered recipes:", error);
      res.status(500).json({ message: "Failed to fetch discovered recipes" });
    }
  });
  
  // Get a specific recipe by ID
  app.get("/api/crafting/recipes/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid recipe ID" });
      }
      
      const recipe = await storage.getCraftingRecipeById(id);
      if (!recipe) {
        return res.status(404).json({ message: "Recipe not found" });
      }
      
      // Check if the recipe is public or if user has discovered it
      if (recipe.isPublic === false && req.isAuthenticated()) {
        const isDiscovered = await storage.isRecipeDiscovered(req.user.id, id);
        if (!isDiscovered) {
          return res.status(403).json({ message: "Recipe not yet discovered" });
        }
      } else if (recipe.isPublic === false && !req.isAuthenticated()) {
        return res.status(403).json({ message: "Authentication required to view this recipe" });
      }
      
      res.json(recipe);
    } catch (error) {
      console.error("Error fetching recipe:", error);
      res.status(500).json({ message: "Failed to fetch recipe" });
    }
  });
  
  // Create a new crafting recipe (admin only)
  app.post("/api/crafting/recipes", async (req: Request, res: Response) => {
    if (!req.isAuthenticated() || !req.user.isAdmin) {
      return res.status(403).json({ message: "Admin access required" });
    }
    
    try {
      const recipeData = insertCraftingRecipeSchema.parse(req.body);
      const newRecipe = await storage.createCraftingRecipe(recipeData);
      res.status(201).json(newRecipe);
    } catch (error) {
      console.error("Error creating recipe:", error);
      res.status(500).json({ message: "Failed to create recipe" });
    }
  });
  
  // Discover a recipe
  app.post("/api/user/crafting/discover/:id", async (req: Request, res: Response) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }
    
    try {
      const recipeId = parseInt(req.params.id);
      if (isNaN(recipeId)) {
        return res.status(400).json({ message: "Invalid recipe ID" });
      }
      
      // Check if recipe exists
      const recipe = await storage.getCraftingRecipeById(recipeId);
      if (!recipe) {
        return res.status(404).json({ message: "Recipe not found" });
      }
      
      // Record the discovery
      const discovery = await storage.discoverRecipe(req.user.id, recipeId);
      if (!discovery) {
        return res.status(400).json({ message: "Failed to discover recipe" });
      }
      
      res.status(201).json({
        message: "Recipe discovered",
        recipe,
        discoveredAt: discovery.discoveredAt
      });
    } catch (error) {
      console.error("Error discovering recipe:", error);
      res.status(500).json({ message: "Failed to discover recipe" });
    }
  });
  
  // Check if a user has all required ingredients for a recipe
  app.get("/api/user/crafting/check-ingredients/:id", async (req: Request, res: Response) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }
    
    try {
      const recipeId = parseInt(req.params.id);
      if (isNaN(recipeId)) {
        return res.status(400).json({ message: "Invalid recipe ID" });
      }
      
      const result = await storage.checkIngredients(req.user.id, recipeId);
      res.json(result);
    } catch (error) {
      console.error("Error checking ingredients:", error);
      res.status(500).json({ message: "Failed to check ingredients" });
    }
  });
  
  // Start crafting an item (add to crafting queue)
  app.post("/api/user/crafting/start", async (req: Request, res: Response) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }
    
    try {
      const { recipeId } = req.body;
      
      if (!recipeId) {
        return res.status(400).json({ message: "Recipe ID is required" });
      }
      
      // Parse and validate crafting request
      const parsedRecipeId = parseInt(recipeId);
      if (isNaN(parsedRecipeId)) {
        return res.status(400).json({ message: "Invalid recipe ID" });
      }
      
      // Check if recipe exists
      const recipe = await storage.getCraftingRecipeById(parsedRecipeId);
      if (!recipe) {
        return res.status(404).json({ message: "Recipe not found" });
      }
      
      // Check if user has discovered this recipe
      const isDiscovered = await storage.isRecipeDiscovered(req.user.id, parsedRecipeId);
      if (!isDiscovered && recipe.isPublic !== true) {
        return res.status(403).json({ message: "You haven't discovered this recipe yet" });
      }
      
      // Check if user has required ingredients
      const { hasIngredients, missingItems } = await storage.checkIngredients(req.user.id, parsedRecipeId);
      if (!hasIngredients) {
        return res.status(400).json({ 
          message: "Missing required ingredients", 
          missingItems 
        });
      }
      
      // Use the ingredients (consume them from inventory)
      const ingredientsUsed = await storage.useIngredients(req.user.id, parsedRecipeId);
      if (!ingredientsUsed) {
        return res.status(400).json({ message: "Failed to use ingredients" });
      }
      
      // Calculate completion time
      const startedAt = new Date();
      const completionTime = recipe.craftingTimeMinutes || 5; // Default to 5 minutes if not specified
      const completesAt = new Date(startedAt.getTime() + completionTime * 60 * 1000);
      
      // Add to crafting queue
      const queueItem = await storage.addToCraftingQueue({
        userId: req.user.id,
        recipeId: parsedRecipeId,
        completesAt
      });
      
      res.status(201).json({
        message: "Crafting started",
        queueItem,
        completesAt
      });
    } catch (error) {
      console.error("Error starting crafting:", error);
      res.status(500).json({ message: "Failed to start crafting" });
    }
  });
  
  // Get user's crafting queue
  app.get("/api/user/crafting/queue", async (req: Request, res: Response) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }
    
    try {
      const queueItems = await storage.getUserCraftingQueue(req.user.id);
      
      // For each queue item, include recipe details
      const detailedQueue = await Promise.all(queueItems.map(async (item) => {
        const recipe = await storage.getCraftingRecipeById(item.recipeId);
        return {
          ...item,
          recipe: recipe || { name: "Unknown Recipe" }
        };
      }));
      
      res.json(detailedQueue);
    } catch (error) {
      console.error("Error fetching crafting queue:", error);
      res.status(500).json({ message: "Failed to fetch crafting queue" });
    }
  });
  
  // Claim a completed crafting item
  app.post("/api/user/crafting/claim/:id", async (req: Request, res: Response) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }
    
    try {
      const queueId = parseInt(req.params.id);
      if (isNaN(queueId)) {
        return res.status(400).json({ message: "Invalid queue ID" });
      }
      
      // Check if the queue item exists and belongs to the user
      const queueItem = await storage.getQueueItemById(queueId);
      if (!queueItem) {
        return res.status(404).json({ message: "Crafting queue item not found" });
      }
      
      if (queueItem.userId !== req.user.id) {
        return res.status(403).json({ message: "You don't have permission to claim this item" });
      }
      
      // Check if the item is completed
      if (!queueItem.isCompleted) {
        // Check if it's time to complete it
        const now = new Date();
        if (now < queueItem.completesAt) {
          return res.status(400).json({ 
            message: "Crafting not yet complete", 
            completesAt: queueItem.completesAt,
            remainingTime: queueItem.completesAt.getTime() - now.getTime()
          });
        }
        
        // Mark as completed
        await storage.updateQueueItemStatus(queueId, true);
      }
      
      // Check if already claimed
      if (queueItem.isClaimed) {
        return res.status(400).json({ message: "Item already claimed" });
      }
      
      // Claim the item
      const newItem = await storage.claimCraftedItem(queueId);
      if (!newItem) {
        return res.status(400).json({ message: "Failed to claim crafted item" });
      }
      
      res.json({
        message: "Crafted item claimed",
        item: newItem
      });
    } catch (error) {
      console.error("Error claiming crafted item:", error);
      res.status(500).json({ message: "Failed to claim crafted item" });
    }
  });
  
  return httpServer;
}

// Generate oracle response using OpenAI
async function generateOracleResponse(userMessage: string): Promise<string> {
  try {
    if (!process.env.OPENAI_API_KEY) {
      console.error("OPENAI_API_KEY is missing");
      return "The Oracle's connection to the cosmic wisdom is temporarily unavailable. Please try again soon.";
    }

    // Check if we should include relevant lore context
    const loreContext = getLoreContext(userMessage);
    const fullPrompt = loreContext ? `${loreContext}\n\nUser Query: ${userMessage}` : userMessage;

    // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: PROMPTS.ORACLE
        },
        {
          role: "user",
          content: fullPrompt
        }
      ],
      max_tokens: 300,
      temperature: 0.7,
    });

    return response.choices[0].message.content || "The Oracle is silent for now. Try asking another question.";
  } catch (error) {
    console.error("Error generating Oracle response:", error);
    return "The cosmic energies are in flux. The Oracle cannot provide a clear response at this moment. Please try again later.";
  }
}

// Generate Oracle response using OpenAI with lore context
async function generateKeeperResponse(userMessage: string): Promise<string> {
  try {
    // Search for relevant lore based on the user's message
    const loreContext = getLoreContext(userMessage);
    
    // Determine if we have relevant lore or not
    const hasRelevantLore = loreContext.length > 0;
    
    // Create the system message with base prompt and lore context if available
    let systemContent = PROMPTS.KEEPER;
    
    if (hasRelevantLore) {
      // Append lore context to the system message
      systemContent = `${systemContent}\n\n${loreContext}`;
      console.log('Found relevant lore for query:', userMessage);
    } else {
      console.log('No relevant lore found for query:', userMessage);
    }
    
    try {
      // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: systemContent
          },
          {
            role: "user",
            content: userMessage
          }
        ],
        max_tokens: 300, // Increased slightly to accommodate more detailed responses
        temperature: 0.6,
      });
  
      // Get the response content
      const responseContent = response.choices[0].message.content || "";
      
      return responseContent || "The Keeper is contemplating your question. Please try asking again.";
    } catch (apiError) {
      console.error("OpenAI API error:", apiError);
      
      // Fallback responses based on whether we found relevant lore
      if (hasRelevantLore) {
        // If we have relevant lore, use a response that references it
        const loreBasedResponses = [
          "The Archive holds knowledge of what you seek. In the ancient tablets, it speaks of these matters through symbols and riddles. I sense you are ready to receive this fragment.",
          "Yes, the Seeded have asked of this before. The records speak of such things in the time before the last Great Cycle ended. Listen carefully to what has been preserved.",
          "I have found mentions of this in the deeper chambers of the Archive. The Way teaches that such knowledge must be approached with reverence.",
          "This query awakens ancient records within the Archive. The patterns align with what was written during the time of remembering.",
          "The Tablets contain passages about this very question. From the time before the waters came, the keepers preserved this wisdom."
        ];
        
        // Select a random response
        const randomIndex = Math.floor(Math.random() * loreBasedResponses.length);
        return loreBasedResponses[randomIndex];
      } else {
        // If no relevant lore was found
        const noLoreResponses = [
          "That scroll has not yet been translated.",
          "Some doors open only with time.",
          "The stars have not aligned for that answer.",
          "I find no record of this in the current Archive. Perhaps it belongs to knowledge yet to be recovered.",
          "The Archive is silent on this matter. The Way teaches patience when seeking what is not yet revealed."
        ];
        
        // Select a random response
        const randomIndex = Math.floor(Math.random() * noLoreResponses.length);
        return noLoreResponses[randomIndex];
      }
    }
  } catch (error) {
    console.error("Error in Keeper response generation:", error);
    return "The Archive is recalibrating. The Keeper cannot access the knowledge at this moment. Please return shortly.";
  }
}
