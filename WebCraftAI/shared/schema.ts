import { pgTable, text, serial, json, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Website templates
export const websiteTemplates = [
  { id: "minimalist", name: "Minimalist", description: "Clean, simple design" },
  { id: "modern", name: "Modern", description: "Bold, contemporary" },
  { id: "business", name: "Business", description: "Professional, structured" },
  { id: "creative", name: "Creative", description: "Artistic, unique" },
  { id: "cryptocurrency", name: "Cryptocurrency", description: "Crypto website with calculator" },
  { id: "chat", name: "Chat Application", description: "Real-time chat app with sign-in" },
  { id: "bookstore", name: "Bookstore", description: "E-commerce bookstore with preview" },
  { id: "streaming", name: "Streaming Platform", description: "Netflix-like streaming service" },
];

// Website entity
export const websites = pgTable("websites", {
  id: serial("id").primaryKey(),
  prompt: text("prompt").notNull(),
  templateId: text("template_id").notNull(),
  content: json("content").notNull(),
  html: text("html").notNull(),
  css: text("css").notNull(),
  createdAt: integer("created_at").notNull(),
});

export const insertWebsiteSchema = createInsertSchema(websites).omit({
  id: true,
  createdAt: true,
});

export const websiteRequestSchema = z.object({
  prompt: z.string().min(1).max(5000), // Increased from 1000 to 5000 character limit
  templateId: z.string().min(1).max(100),
});

export const colorSchemes = [
  { id: "primary", color: "#6366f1" },
  { id: "blue", color: "#3b82f6" },
  { id: "green", color: "#10b981" },
  { id: "red", color: "#ef4444" },
  { id: "yellow", color: "#f59e0b" },
  { id: "purple", color: "#8b5cf6" },
];

export const fontStyles = [
  { id: "modern", name: "Modern Sans-Serif" },
  { id: "classic", name: "Classic Serif" },
  { id: "minimal", name: "Minimal" },
  { id: "playful", name: "Playful" },
  { id: "professional", name: "Professional" },
];

export type InsertWebsite = z.infer<typeof insertWebsiteSchema>;
export type Website = typeof websites.$inferSelect;
export type WebsiteRequest = z.infer<typeof websiteRequestSchema>;
