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
  contentCalendarPosts: many(contentCalendarPosts),
  postingSchedules: many(postingSchedules),
  reviews: many(reviews),
  competitorSnapshots: many(competitorSnapshots),
  reputationScores: many(reputationScores),
  reputationAlerts: many(reputationAlerts),
}));

export const seoProjectsRelations = relations(seoProjects, ({ one }) => ({
  location: one(locations, {
    fields: [seoProjects.locationId],
    references: [locations.id],
  }),
}));

// Content Calendar Tables
export const contentCalendarPosts = pgTable("content_calendar_posts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  locationId: varchar("location_id").notNull().references(() => locations.id),
  title: varchar("title", { length: 255 }).notNull(),
  content: text("content").notNull(),
  platform: varchar("platform", { length: 50 }).notNull(), // 'gmb', 'facebook', 'instagram', 'blog', 'linkedin'
  contentType: varchar("content_type", { length: 100 }).notNull(), // 'promotional', 'educational', 'engagement', 'seasonal'
  scheduledDate: timestamp("scheduled_date").notNull(),
  status: varchar("status", { length: 50 }).notNull().default('suggested'), // 'suggested', 'approved', 'published', 'rejected'
  isGenerated: boolean("is_generated").notNull().default(true), // true if AI-generated
  templateId: varchar("template_id").references(() => contentTemplates.id),
  keywords: text("keywords"), // JSON array of keywords
  hashtags: text("hashtags"), // JSON array of hashtags
  imagePrompt: text("image_prompt"), // AI image generation prompt
  publishedAt: timestamp("published_at"),
  engagement: integer("engagement").default(0), // likes, shares, etc.
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
  updatedAt: timestamp("updated_at").notNull().default(sql`now()`)
});

export const contentTemplates = pgTable("content_templates", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name", { length: 255 }).notNull(),
  industry: varchar("industry", { length: 100 }).notNull(),
  platform: varchar("platform", { length: 50 }).notNull(),
  contentType: varchar("content_type", { length: 100 }).notNull(),
  template: text("template").notNull(), // Template with placeholders like {{businessName}}, {{season}}
  description: text("description"),
  isActive: boolean("is_active").notNull().default(true),
  usageCount: integer("usage_count").default(0),
  tags: text("tags"), // JSON array of tags for categorization
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
  updatedAt: timestamp("updated_at").notNull().default(sql`now()`)
});

export const postingSchedules = pgTable("posting_schedules", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  locationId: varchar("location_id").notNull().references(() => locations.id),
  platform: varchar("platform", { length: 50 }).notNull(),
  isActive: boolean("is_active").notNull().default(true),
  frequency: integer("frequency").notNull(), // posts per week
  preferredDays: text("preferred_days"), // JSON array of preferred days [1,2,3,4,5] (Monday=1)
  preferredTimes: text("preferred_times"), // JSON array of preferred hours [9, 12, 15, 18]
  timezone: varchar("timezone", { length: 50 }).notNull().default('America/Mexico_City'),
  autoApprove: boolean("auto_approve").notNull().default(false),
  lastGeneratedAt: timestamp("last_generated_at"),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
  updatedAt: timestamp("updated_at").notNull().default(sql`now()`)
});

// Content Calendar Relations
export const contentCalendarPostsRelations = relations(contentCalendarPosts, ({ one }) => ({
  location: one(locations, {
    fields: [contentCalendarPosts.locationId],
    references: [locations.id],
  }),
  template: one(contentTemplates, {
    fields: [contentCalendarPosts.templateId],
    references: [contentTemplates.id],
  }),
}));

export const contentTemplatesRelations = relations(contentTemplates, ({ many }) => ({
  posts: many(contentCalendarPosts),
}));

export const postingSchedulesRelations = relations(postingSchedules, ({ one }) => ({
  location: one(locations, {
    fields: [postingSchedules.locationId],
    references: [locations.id],
  }),
}));

// Predictive Reputation Module Tables
export const reviews = pgTable("reviews", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  locationId: varchar("location_id").notNull().references(() => locations.id),
  rating: integer("rating").notNull(), // 1-5 star rating
  text: text("text").notNull(),
  reviewerName: varchar("reviewer_name", { length: 255 }),
  platform: varchar("platform", { length: 50 }).notNull().default('google'), // 'google', 'facebook', 'yelp', etc.
  externalId: varchar("external_id", { length: 255 }), // Platform-specific review ID
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
  respondedAt: timestamp("responded_at"), // When business responded to review
});

export const competitorSnapshots = pgTable("competitor_snapshots", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  locationId: varchar("location_id").notNull().references(() => locations.id),
  competitorName: varchar("competitor_name", { length: 255 }).notNull(),
  avgRating: decimal("avg_rating", { precision: 3, scale: 2 }).notNull(),
  reviewCount: integer("review_count").notNull().default(0),
  last30dNegPct: decimal("last_30d_neg_pct", { precision: 5, scale: 2 }).default('0'), // Percentage of negative reviews in last 30 days
  engagementRate: decimal("engagement_rate", { precision: 5, scale: 2 }).default('0'), // Response rate to reviews
  marketSharePct: decimal("market_share_pct", { precision: 5, scale: 2 }).default('0'), // Estimated market share percentage
  capturedAt: timestamp("captured_at").notNull().default(sql`now()`)
});

export const reputationScores = pgTable("reputation_scores", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  locationId: varchar("location_id").notNull().references(() => locations.id),
  score: integer("score").notNull(), // Overall reputation score 0-100
  components: text("components").notNull(), // JSON object with score breakdown: {rating: 85, volume: 70, sentiment: 90, recency: 80, response: 95}
  trend: varchar("trend", { length: 20 }).notNull().default('stable'), // 'improving', 'declining', 'stable'
  previousScore: integer("previous_score"), // Score from previous calculation
  calculatedAt: timestamp("calculated_at").notNull().default(sql`now()`)
});

export const reputationAlerts = pgTable("reputation_alerts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  locationId: varchar("location_id").notNull().references(() => locations.id),
  alertType: varchar("alert_type", { length: 50 }).notNull(), // 'score_drop', 'negative_review', 'competitor_surge', 'response_needed'
  severity: varchar("severity", { length: 20 }).notNull().default('medium'), // 'low', 'medium', 'high', 'critical'
  score: integer("score"), // Current reputation score when alert was triggered
  reasonCode: varchar("reason_code", { length: 100 }).notNull(),
  message: text("message").notNull(),
  metadata: text("metadata"), // JSON with additional alert context
  acknowledged: boolean("acknowledged").notNull().default(false),
  acknowledgedAt: timestamp("acknowledged_at"),
  acknowledgedBy: varchar("acknowledged_by", { length: 255 }),
  createdAt: timestamp("created_at").notNull().default(sql`now()`)
});

// Reputation Module Relations
export const reviewsRelations = relations(reviews, ({ one }) => ({
  location: one(locations, {
    fields: [reviews.locationId],
    references: [locations.id],
  }),
}));

export const competitorSnapshotsRelations = relations(competitorSnapshots, ({ one }) => ({
  location: one(locations, {
    fields: [competitorSnapshots.locationId],
    references: [locations.id],
  }),
}));

export const reputationScoresRelations = relations(reputationScores, ({ one }) => ({
  location: one(locations, {
    fields: [reputationScores.locationId],
    references: [locations.id],
  }),
}));

export const reputationAlertsRelations = relations(reputationAlerts, ({ one }) => ({
  location: one(locations, {
    fields: [reputationAlerts.locationId],
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

export const insertContentCalendarPostSchema = createInsertSchema(contentCalendarPosts).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertContentTemplateSchema = createInsertSchema(contentTemplates).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertPostingScheduleSchema = createInsertSchema(postingSchedules).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Reputation Module Insert Schemas
export const insertReviewSchema = createInsertSchema(reviews).omit({
  id: true,
  createdAt: true,
});

export const insertCompetitorSnapshotSchema = createInsertSchema(competitorSnapshots).omit({
  id: true,
  capturedAt: true,
});

export const insertReputationScoreSchema = createInsertSchema(reputationScores).omit({
  id: true,
  calculatedAt: true,
});

export const insertReputationAlertSchema = createInsertSchema(reputationAlerts).omit({
  id: true,
  createdAt: true,
});

export type InsertBusiness = z.infer<typeof insertBusinessSchema>;
export type Business = typeof businesses.$inferSelect;
export type InsertLocation = z.infer<typeof insertLocationSchema>;
export type Location = typeof locations.$inferSelect;
export type InsertSeoProject = z.infer<typeof insertSeoProjectSchema>;
export type SeoProject = typeof seoProjects.$inferSelect;
export type InsertContentCalendarPost = z.infer<typeof insertContentCalendarPostSchema>;
export type ContentCalendarPost = typeof contentCalendarPosts.$inferSelect;
export type InsertContentTemplate = z.infer<typeof insertContentTemplateSchema>;
export type ContentTemplate = typeof contentTemplates.$inferSelect;
export type InsertPostingSchedule = z.infer<typeof insertPostingScheduleSchema>;
export type PostingSchedule = typeof postingSchedules.$inferSelect;

// Reputation Module Types
export type InsertReview = z.infer<typeof insertReviewSchema>;
export type Review = typeof reviews.$inferSelect;
export type InsertCompetitorSnapshot = z.infer<typeof insertCompetitorSnapshotSchema>;
export type CompetitorSnapshot = typeof competitorSnapshots.$inferSelect;
export type InsertReputationScore = z.infer<typeof insertReputationScoreSchema>;
export type ReputationScore = typeof reputationScores.$inferSelect;
export type InsertReputationAlert = z.infer<typeof insertReputationAlertSchema>;
export type ReputationAlert = typeof reputationAlerts.$inferSelect;

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

// Content Calendar API Schemas
export const generateContentCalendarSchema = z.object({
  locationId: z.string().min(1, "Location ID is required"),
  month: z.number().min(1).max(12),
  year: z.number().min(2024).max(2030),
  platforms: z.array(z.enum(["gmb", "facebook", "instagram", "blog", "linkedin"])).min(1, "At least one platform is required"),
  contentTypes: z.array(z.enum(["promotional", "educational", "engagement", "seasonal"])).optional(),
  includeHolidays: z.boolean().default(true),
  includeLocalEvents: z.boolean().default(true),
  customKeywords: z.array(z.string()).max(20, "Cannot specify more than 20 custom keywords").optional()
});

export const updatePostingScheduleSchema = z.object({
  locationId: z.string().min(1, "Location ID is required"),
  platform: z.enum(["gmb", "facebook", "instagram", "blog", "linkedin"]),
  frequency: z.number().min(1).max(14), // posts per week
  preferredDays: z.array(z.number().min(1).max(7)).min(1, "At least one preferred day is required").max(7),
  preferredTimes: z.array(z.number().min(0).max(23)).min(1, "At least one preferred time is required").max(10),
  timezone: z.string().default('America/Mexico_City'),
  autoApprove: z.boolean().default(false)
});

export const updatePostStatusSchema = z.object({
  postId: z.string().min(1, "Post ID is required"),
  status: z.enum(["suggested", "approved", "published", "rejected"]),
  feedback: z.string().max(500, "Feedback cannot exceed 500 characters").optional()
});

export const editPostContentSchema = z.object({
  postId: z.string().min(1, "Post ID is required"),
  title: z.string().min(1, "Title is required").max(255, "Title cannot exceed 255 characters"),
  content: z.string().min(1, "Content is required").max(2000, "Content cannot exceed 2000 characters"),
  hashtags: z.array(z.string().max(50)).max(10, "Cannot have more than 10 hashtags").optional(),
  keywords: z.array(z.string().max(100)).max(20, "Cannot have more than 20 keywords").optional(),
  imagePrompt: z.string().max(500, "Image prompt cannot exceed 500 characters").optional(),
  scheduledDate: z.string().datetime().optional()
});

export const bulkApprovePostsSchema = z.object({
  postIds: z.array(z.string()).min(1, "At least one post ID is required").max(50, "Cannot approve more than 50 posts at once"),
  action: z.enum(["approve", "reject"])
});

export const generateSeasonalContentSchema = z.object({
  locationId: z.string().min(1, "Location ID is required"),
  season: z.enum(["spring", "summer", "fall", "winter", "holiday"]),
  platform: z.enum(["gmb", "facebook", "instagram", "blog", "linkedin"]),
  contentType: z.enum(["promotional", "educational", "engagement", "seasonal"]),
  includeLocalEvents: z.boolean().default(true),
  customTheme: z.string().max(200, "Custom theme cannot exceed 200 characters").optional()
});

export type GenerateContentCalendarRequest = z.infer<typeof generateContentCalendarSchema>;
export type UpdatePostingScheduleRequest = z.infer<typeof updatePostingScheduleSchema>;
export type UpdatePostStatusRequest = z.infer<typeof updatePostStatusSchema>;
export type EditPostContentRequest = z.infer<typeof editPostContentSchema>;
export type BulkApprovePostsRequest = z.infer<typeof bulkApprovePostsSchema>;
export type GenerateSeasonalContentRequest = z.infer<typeof generateSeasonalContentSchema>;

// Reputation Module API Schemas
export const runReputationAnalysisSchema = z.object({
  locationId: z.string().min(1, "Location ID is required"),
  windowDays: z.number().min(1).max(365).optional().default(30)
});

export const getReputationScoreSchema = z.object({
  locationId: z.string().min(1, "Location ID is required")
});

export const getReputationTrendsSchema = z.object({
  locationId: z.string().min(1, "Location ID is required"),
  windowDays: z.number().min(1).max(365).optional().default(30)
});

export const getReputationAlertsSchema = z.object({
  locationId: z.string().min(1, "Location ID is required"),
  acknowledged: z.boolean().optional(),
  severity: z.enum(["low", "medium", "high", "critical"]).optional(),
  limit: z.number().min(1).max(100).optional().default(20)
});

// Shared Alert Types Enum
export const reputationAlertTypeEnum = z.enum([
  'score_drop',
  'negative_review', 
  'competitor_surge',
  'response_needed',
  'system_error'
]);

export const reputationAlertSeverityEnum = z.enum([
  'low',
  'medium', 
  'high',
  'critical'
]);

export type ReputationAlertType = z.infer<typeof reputationAlertTypeEnum>;
export type ReputationAlertSeverity = z.infer<typeof reputationAlertSeverityEnum>;

export const ingestReviewsSchema = z.object({
  locationId: z.string().min(1, "Location ID is required"),
  reviews: z.array(z.object({
    rating: z.number().min(1).max(5),
    text: z.string().min(1, "Review text is required").max(2000),
    reviewerName: z.string().max(255).optional(),
    platform: z.string().max(50).optional().default('google'),
    externalId: z.string().max(255).optional(),
    createdAt: z.string().datetime().optional(),
    respondedAt: z.string().datetime().optional()
  })).min(1, "At least one review is required").max(100, "Cannot ingest more than 100 reviews at once")
});

// Threshold Management Schemas
export const updateThresholdSchema = z.object({
  threshold: z.number()
    .min(0, "Threshold must be at least 0")
    .max(100, "Threshold cannot exceed 100")
    .int("Threshold must be a whole number")
});

export const getThresholdSchema = z.object({
  locationId: z.string().min(1, "Location ID is required")
});

export const acknowledgeAlertsSchema = z.object({
  alertIds: z.array(z.string().min(1, "Alert ID is required"))
    .min(1, "At least one alert ID is required")
    .max(50, "Cannot acknowledge more than 50 alerts at once"),
  acknowledgedBy: z.string().max(255).optional()
});

export type RunReputationAnalysisRequest = z.infer<typeof runReputationAnalysisSchema>;
export type GetReputationScoreRequest = z.infer<typeof getReputationScoreSchema>;
export type GetReputationTrendsRequest = z.infer<typeof getReputationTrendsSchema>;
export type GetReputationAlertsRequest = z.infer<typeof getReputationAlertsSchema>;
export type IngestReviewsRequest = z.infer<typeof ingestReviewsSchema>;
export type UpdateThresholdRequest = z.infer<typeof updateThresholdSchema>;
export type GetThresholdRequest = z.infer<typeof getThresholdSchema>;
export type AcknowledgeAlertsRequest = z.infer<typeof acknowledgeAlertsSchema>;
