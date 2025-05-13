import { pgTable, text, serial, integer, boolean, timestamp, primaryKey } from "drizzle-orm/pg-core";
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
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const scrolls = pgTable("scrolls", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  image: text("image").notNull(), // URL to image
  isLocked: boolean("is_locked").notNull().default(true),
  key: text("key").notNull(), // Key phrase to unlock the scroll
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

export const usersRelations = relations(users, ({ many }) => ({
  unlockedScrolls: many(userScrolls),
}));

export const scrollsRelations = relations(scrolls, ({ many }) => ({
  unlockedBy: many(userScrolls),
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

// User insert schema with required email and optional phone
export const insertUserSchema = createInsertSchema(users)
  .pick({
    username: true,
    email: true,
    phone: true,
    password: true,
  })
  .partial({
    phone: true,
  });

export const insertScrollSchema = createInsertSchema(scrolls).pick({
  title: true,
  content: true,
  image: true,
  isLocked: true,
  key: true,
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
