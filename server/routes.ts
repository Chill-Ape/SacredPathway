import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertOracleMessageSchema, insertContactMessageSchema, insertKeeperMessageSchema } from "@shared/schema";
import OpenAI from "openai";
import { PROMPTS } from "./config/prompts";
import { getLoreContext } from "./utils/loreSearch";

// Initialize OpenAI client
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY || "mock_key_for_development" });

export async function registerRoutes(app: Express): Promise<Server> {
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

  // Get a specific scroll
  app.get("/api/scrolls/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const scroll = await storage.getScrollById(id);
      
      if (!scroll) {
        return res.status(404).json({ message: "Scroll not found" });
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
        res.json(updatedScroll);
      } else {
        res.status(403).json({ message: "Incorrect key" });
      }
    } catch (error) {
      console.error("Error unlocking scroll:", error);
      res.status(500).json({ message: "Failed to unlock scroll" });
    }
  });

  // Get messages for a specific user session
  app.get("/api/oracle/:userId", async (req: Request, res: Response) => {
    try {
      const { userId } = req.params;
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

  return httpServer;
}

// Generate oracle response using OpenAI
async function generateOracleResponse(userMessage: string): Promise<string> {
  try {
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
          content: userMessage
        }
      ],
      max_tokens: 250,
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
