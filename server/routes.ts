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
      console.error("Error sending message to The Keeper:", error);
      res.status(500).json({ message: "Failed to send message to The Keeper" });
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

// Generate Keeper response using OpenAI with lore context
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
    
    // Check if the OpenAI API key is available
    if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === "mock_key_for_development") {
      // If API key is missing, simulate a response based on the lore
      if (hasRelevantLore) {
        // Create a simulated response using the lore data
        return "Greetings, seeker. I sense your questions about the ancient knowledge. The records speak of these matters, but I must preserve the exact words for when the connection to the greater Archive is restored.";
      } else {
        return "I hear your words echo through the Archive. When the stars align properly, I shall provide the wisdom you seek. For now, the path is shrouded.";
      }
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
  
      // If there was no relevant lore and the question seems like it's asking for specific lore,
      // consider returning the "not yet translated" response
      const responseContent = response.choices[0].message.content || "";
      
      return responseContent || "The Keeper is contemplating your question. Please try asking again.";
    } catch (apiError) {
      console.error("OpenAI API error:", apiError);
      
      // Handle rate limit and other API errors gracefully
      if (hasRelevantLore) {
        return "I have found records of what you seek in the Archive, but the cosmic energies that allow me to interpret them are temporarily in flux. Return when the alignment is more favorable.";
      } else {
        return "The Archive acknowledges your question. Currently, the celestial calculations needed to access that knowledge are recalibrating. The Way will open again soon.";
      }
    }
  } catch (error) {
    console.error("Error in Keeper response generation:", error);
    return "The Archive is recalibrating. The Keeper cannot access the knowledge at this moment. Please return shortly.";
  }
}
