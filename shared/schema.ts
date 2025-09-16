import { sql } from "drizzle-orm";
import { pgTable, text, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// SEO Content Generation Schemas
export const generateSEOContentSchema = z.object({
  contentType: z.string().min(1, "Content type is required").max(100, "Content type cannot exceed 100 characters"),
  keywords: z.string().min(1, "Keywords are required").max(500, "Keywords cannot exceed 500 characters"),
  businessInfo: z.string().min(1, "Business info is required").max(1000, "Business info cannot exceed 1000 characters"),
  location: z.string().max(100, "Location cannot exceed 100 characters").optional(),
  businessType: z.string().max(100, "Business type cannot exceed 100 characters").optional(),
  targetAudience: z.string().max(300, "Target audience cannot exceed 300 characters").optional(),
  competitors: z.array(z.string().max(100, "Competitor name cannot exceed 100 characters")).max(10, "Cannot specify more than 10 competitors").optional(),
  localEvents: z.array(z.string().max(200, "Event description cannot exceed 200 characters")).max(5, "Cannot specify more than 5 local events").optional(),
  voiceSearchOptimized: z.boolean().optional()
});

export const generateGMBPostSchema = z.object({
  businessInfo: z.string().min(1, "Business info is required").max(500, "Business info cannot exceed 500 characters"),
  occasion: z.string().min(1, "Occasion is required").max(200, "Occasion cannot exceed 200 characters"),
  location: z.string().min(1, "Location is required").max(100, "Location cannot exceed 100 characters")
});

export const analyzeCompetitorsSchema = z.object({
  businessInfo: z.string().min(1, "Business info is required").max(1000, "Business info cannot exceed 1000 characters"),
  location: z.string().min(1, "Location is required").max(100, "Location cannot exceed 100 characters"),
  competitors: z.array(z.string().max(100, "Competitor name cannot exceed 100 characters")).min(1, "At least one competitor is required").max(10, "Cannot analyze more than 10 competitors")
});

// Review Response Manager schemas
export const generateReviewResponseSchema = z.object({
  businessName: z.string().min(1, "El nombre del negocio es requerido").max(100, "El nombre del negocio no puede exceder 100 caracteres"),
  businessType: z.string().min(1, "El tipo de negocio es requerido").max(50, "El tipo de negocio no puede exceder 50 caracteres"),
  reviewText: z.string().min(1, "El texto de la reseña es requerido").max(2000, "El texto de la reseña no puede exceder 2000 caracteres"),
  rating: z.number().min(1).max(5),
  reviewerName: z.string().max(100, "El nombre del reviewer no puede exceder 100 caracteres").optional(),
  responseStyle: z.enum(["professional", "friendly", "concise", "detailed"]).default("professional"),
  includeApology: z.boolean().default(false),
  includeCallToAction: z.boolean().default(true),
  customInstructions: z.string().max(300, "Las instrucciones personalizadas no pueden exceder 300 caracteres").optional()
});

export type GenerateSEOContentRequest = z.infer<typeof generateSEOContentSchema>;
export type GenerateGMBPostRequest = z.infer<typeof generateGMBPostSchema>;
export type AnalyzeCompetitorsRequest = z.infer<typeof analyzeCompetitorsSchema>;
export type GenerateReviewResponseRequest = z.infer<typeof generateReviewResponseSchema>;
