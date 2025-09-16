import { sql, relations } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, decimal, integer, boolean } from "drizzle-orm/pg-core";
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

// Multi-Location Business Management Tables
export const businesses = pgTable("businesses", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name", { length: 255 }).notNull(),
  industry: varchar("industry", { length: 100 }).notNull(),
  description: text("description"),
  website: varchar("website", { length: 255 }),
  phone: varchar("phone", { length: 20 }),
  email: varchar("email", { length: 255 }),
  ownerId: varchar("owner_id").notNull().references(() => users.id),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
  updatedAt: timestamp("updated_at").notNull().default(sql`now()`)
});

export const locations = pgTable("locations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  businessId: varchar("business_id").notNull().references(() => businesses.id),
  name: varchar("name", { length: 255 }).notNull(),
  address: text("address").notNull(),
  city: varchar("city", { length: 100 }).notNull(),
  state: varchar("state", { length: 50 }).notNull(),
  zipCode: varchar("zip_code", { length: 10 }).notNull(),
  country: varchar("country", { length: 50 }).notNull().default('US'),
  latitude: decimal("latitude", { precision: 10, scale: 8 }),
  longitude: decimal("longitude", { precision: 11, scale: 8 }),
  phone: varchar("phone", { length: 20 }),
  email: varchar("email", { length: 255 }),
  managerName: varchar("manager_name", { length: 255 }),
  isActive: boolean("is_active").notNull().default(true),
  gmbPlaceId: varchar("gmb_place_id", { length: 255 }), // Google My Business Place ID
  gmbUrl: text("gmb_url"), // Google My Business URL
  averageRating: decimal("average_rating", { precision: 3, scale: 2 }),
  totalReviews: integer("total_reviews").default(0),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
  updatedAt: timestamp("updated_at").notNull().default(sql`now()`)
});

export const seoProjects = pgTable("seo_projects", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  locationId: varchar("location_id").notNull().references(() => locations.id),
  title: varchar("title", { length: 255 }).notNull(),
  contentType: varchar("content_type", { length: 100 }).notNull(),
  keywords: text("keywords").notNull(),
  targetAudience: text("target_audience"),
  generatedContent: text("generated_content"),
  metaTitle: varchar("meta_title", { length: 255 }),
  metaDescription: text("meta_description"),
  status: varchar("status", { length: 50 }).notNull().default('draft'), // draft, published, archived
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
  updatedAt: timestamp("updated_at").notNull().default(sql`now()`)
});

// Relations
export const businessesRelations = relations(businesses, ({ one, many }) => ({
  owner: one(users, {
    fields: [businesses.ownerId],
    references: [users.id],
  }),
  locations: many(locations),
}));

export const locationsRelations = relations(locations, ({ one, many }) => ({
  business: one(businesses, {
    fields: [locations.businessId],
    references: [businesses.id],
  }),
  seoProjects: many(seoProjects),
}));

export const seoProjectsRelations = relations(seoProjects, ({ one }) => ({
  location: one(locations, {
    fields: [seoProjects.locationId],
    references: [locations.id],
  }),
}));

// Insert schemas
export const insertBusinessSchema = createInsertSchema(businesses).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertLocationSchema = createInsertSchema(locations).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertSeoProjectSchema = createInsertSchema(seoProjects).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertBusiness = z.infer<typeof insertBusinessSchema>;
export type Business = typeof businesses.$inferSelect;
export type InsertLocation = z.infer<typeof insertLocationSchema>;
export type Location = typeof locations.$inferSelect;
export type InsertSeoProject = z.infer<typeof insertSeoProjectSchema>;
export type SeoProject = typeof seoProjects.$inferSelect;

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
  customInstructions: z.string().max(300, "Las instrucciones personalizadas no pueden exceder 300 caracteres").optional(),
  // New legal mode parameters
  legalMode: z.boolean().default(false),
  industryType: z.enum(["healthcare", "legal", "consulting", "finance", "general"]).optional(),
  conflictLevel: z.enum(["low", "medium", "high"]).optional()
});

// Legal Review Detection Schema
export const detectConflictiveReviewSchema = z.object({
  reviewText: z.string().min(1, "El texto de la reseña es requerido").max(2000, "El texto de la reseña no puede exceder 2000 caracteres"),
  rating: z.number().min(1).max(5),
  businessType: z.string().min(1, "El tipo de negocio es requerido").max(50, "El tipo de negocio no puede exceder 50 caracteres")
});

// Conflict Detection Result Type
export const conflictDetectionResultSchema = z.object({
  isConflictive: z.boolean(),
  conflictLevel: z.enum(["low", "medium", "high"]),
  detectedKeywords: z.array(z.string()),
  legalRisk: z.boolean(),
  sentimentScore: z.number().min(-1).max(1),
  recommendedIndustryType: z.enum(["healthcare", "legal", "consulting", "finance", "general"]).optional(),
  riskFactors: z.array(z.string()),
  suggestedResponseApproach: z.string()
});

export type GenerateSEOContentRequest = z.infer<typeof generateSEOContentSchema>;
export type GenerateGMBPostRequest = z.infer<typeof generateGMBPostSchema>;
export type AnalyzeCompetitorsRequest = z.infer<typeof analyzeCompetitorsSchema>;
export type GenerateReviewResponseRequest = z.infer<typeof generateReviewResponseSchema>;
export type DetectConflictiveReviewRequest = z.infer<typeof detectConflictiveReviewSchema>;
export type ConflictDetectionResult = z.infer<typeof conflictDetectionResultSchema>;
