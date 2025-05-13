import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertOracleMessageSchema, insertContactMessageSchema, insertKeeperMessageSchema, scrolls, insertManaTransactionSchema } from "@shared/schema";
import OpenAI from "openai";
import { PROMPTS } from "./config/prompts";
import { getLoreContext } from "./utils/loreSearch";
import { db } from "./db";
import { eq } from "drizzle-orm";
import Stripe from "stripe";

// Initialize OpenAI client
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

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
  // Add health check endpoint at root path for deployment
  app.get('/', (req, res, next) => {
    // If requesting the root path with Accept: text/html, let Vite handle it for the SPA
    if (req.headers.accept && req.headers.accept.includes('text/html')) {
      return next();
    }
    
    // Otherwise, treat it as a health check and respond with OK
    res.status(200).send('OK');
  });
  
  // Add additional health check endpoint
  app.get('/health', (_req, res) => {
    res.status(200).send('OK');
  });
  // Set up session and authentication using persistent storage
  const sessionSettings = {
    // Use environment variable for session secret with fallback for development
    secret: process.env.SESSION_SECRET || 'dev-session-secret',
    resave: false,
    saveUninitialized: false,
    store: storage.sessionStore, // Use our database session store
    cookie: { 
      secure: process.env.NODE_ENV === 'production',
      maxAge: 1000 * 60 * 60 * 24 * 7 // 1 week
    }
  };
  
  // Check if SESSION_SECRET is set in production
  if (process.env.NODE_ENV === 'production' && !process.env.SESSION_SECRET) {
    console.warn('WARNING: SESSION_SECRET environment variable is not set in production mode!');
  }

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
      
      // Create user
      const user = await storage.createUser(userData);
      
      // Log the user in
      req.login(user, (err) => {
        if (err) {
          return res.status(500).json({ message: 'Error logging in after registration' });
        }
        return res.status(201).json({ user: { id: user.id, username: user.username } });
      });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(400).json({ message: 'Invalid registration data' });
    }
  });

  app.post('/api/login', (req, res, next) => {
    passport.authenticate('local', (err, user, info) => {
      if (err) {
        return next(err);
      }
      if (!user) {
        return res.status(401).json({ message: info?.message || 'Invalid credentials' });
      }
      req.login(user, (err) => {
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
          username: req.user.username 
        } 
      });
    }
    res.status(401).json({ message: 'Not authenticated' });
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
