import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { openaiService } from "./services/openai";
import { ReputationAnalysisService, type RiskScoreComponents } from "./services/reputation";
import { mercadoPagoService } from "./services/mercadopago";
import { sendEmail, sendTrialSignupNotification, sendWelcomeEmail } from "./services/email";
import { 
  generateSEOContentSchema, 
  generateGMBPostSchema, 
  analyzeCompetitorsSchema,
  generateReviewResponseSchema,
  detectConflictiveReviewSchema,
  generateContentCalendarSchema,
  updatePostingScheduleSchema,
  updatePostStatusSchema,
  editPostContentSchema,
  insertContentCalendarPostSchema,
  bulkApprovePostsSchema,
  generateSeasonalContentSchema,
  runReputationAnalysisSchema,
  getReputationScoreSchema,
  getReputationTrendsSchema,
  getReputationAlertsSchema,
  ingestReviewsSchema,
  updateThresholdSchema,
  acknowledgeAlertsSchema,
  insertSubscriptionPlanSchema,
  insertSubscriptionSchema,
  insertPaymentSchema,
  insertTrialSignupSchema,
  insertReviewSourceSchema,
  insertGmbPostSchema,
  insertReportExportSchema,
  insertAdminUserSchema,
  insertCompetitorAnalysisSchema,
  insertBusinessSchema,
  insertLocationSchema,
  insertUserSchema
} from "@shared/schema";
import { fromZodError } from "zod-validation-error";
import { z } from "zod";

// Helper function to map service components to UI expected format
function mapComponentsForUI(serviceComponents: RiskScoreComponents): {
  rating: number;
  volume: number;
  sentiment: number;
  recency: number;
  response: number;
} {
  return {
    rating: Math.max(0, 100 - serviceComponents.negativeReviewVelocity), // Invert: fewer negative reviews = better rating
    volume: Math.max(0, 100 - serviceComponents.engagementDrop), // Invert: less engagement drop = better volume
    sentiment: Math.max(0, 100 - serviceComponents.sentimentDrift), // Invert: less sentiment drift = better sentiment
    recency: Math.max(0, 100 - serviceComponents.competitorGap), // Invert: smaller competitor gap = better recency positioning
    response: Math.max(0, 100 - serviceComponents.responseLatency) // Invert: faster response = better response score
  };
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Initialize reputation analysis service
  const reputationService = new ReputationAnalysisService(storage);
  // SEO Content Generation Routes
  app.post("/api/seo/generate-content", async (req, res) => {
    try {
      const validationResult = generateSEOContentSchema.safeParse(req.body);
      
      if (!validationResult.success) {
        return res.status(400).json({
          error: "Validation failed",
          details: fromZodError(validationResult.error).toString()
        });
      }

      const {
        contentType,
        keywords,
        businessInfo,
        location,
        businessType,
        targetAudience,
        competitors,
        localEvents,
        voiceSearchOptimized
      } = validationResult.data;

      const generatedContent = await openaiService.generateLocalSEOContent({
        contentType,
        keywords,
        businessInfo,
        location,
        businessType,
        targetAudience,
        competitors,
        localEvents,
        voiceSearchOptimized
      });

      res.json(generatedContent);
    } catch (error) {
      console.error("Error generating SEO content:", error);
      if (error instanceof Error && error.message === "OPENAI_SERVICE_UNAVAILABLE") {
        return res.status(503).json({
          error: "OpenAI service unavailable",
          details: "OpenAI API key is not configured or invalid. Please contact support."
        });
      }
      if (error instanceof Error && error.message === "OPENAI_RATE_LIMITED") {
        return res.status(429).json({
          error: "Rate limit exceeded",
          details: "OpenAI API rate limit exceeded. Please try again later."
        });
      }
      if (error instanceof Error && error.message === "OPENAI_SERVER_ERROR") {
        return res.status(502).json({
          error: "OpenAI server error",
          details: "OpenAI service is experiencing issues. Please try again later."
        });
      }
      res.status(500).json({
        error: "Failed to generate SEO content",
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  app.post("/api/seo/generate-gmb-post", async (req, res) => {
    try {
      const validationResult = generateGMBPostSchema.safeParse(req.body);
      
      if (!validationResult.success) {
        return res.status(400).json({
          error: "Validation failed",
          details: fromZodError(validationResult.error).toString()
        });
      }

      const { businessInfo, occasion, location } = validationResult.data;

      const post = await openaiService.generateGoogleMyBusinessPost(
        businessInfo,
        occasion,
        location
      );

      res.json({ post });
    } catch (error) {
      console.error("Error generating GMB post:", error);
      if (error instanceof Error && error.message === "OPENAI_SERVICE_UNAVAILABLE") {
        return res.status(503).json({
          error: "OpenAI service unavailable",
          details: "OpenAI API key is not configured or invalid. Please contact support."
        });
      }
      if (error instanceof Error && error.message === "OPENAI_RATE_LIMITED") {
        return res.status(429).json({
          error: "Rate limit exceeded",
          details: "OpenAI API rate limit exceeded. Please try again later."
        });
      }
      if (error instanceof Error && error.message === "OPENAI_SERVER_ERROR") {
        return res.status(502).json({
          error: "OpenAI server error",
          details: "OpenAI service is experiencing issues. Please try again later."
        });
      }
      res.status(500).json({
        error: "Failed to generate Google My Business post",
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  app.post("/api/seo/analyze-competitors", async (req, res) => {
    try {
      const validationResult = analyzeCompetitorsSchema.safeParse(req.body);
      
      if (!validationResult.success) {
        return res.status(400).json({
          error: "Validation failed",
          details: fromZodError(validationResult.error).toString()
        });
      }

      const { businessInfo, location, competitors } = validationResult.data;

      const analysis = await openaiService.analyzeLocalCompetitors(
        businessInfo,
        location,
        competitors
      );

      res.json({ analysis });
    } catch (error) {
      console.error("Error analyzing competitors:", error);
      if (error instanceof Error && error.message === "OPENAI_SERVICE_UNAVAILABLE") {
        return res.status(503).json({
          error: "OpenAI service unavailable",
          details: "OpenAI API key is not configured or invalid. Please contact support."
        });
      }
      if (error instanceof Error && error.message === "OPENAI_RATE_LIMITED") {
        return res.status(429).json({
          error: "Rate limit exceeded",
          details: "OpenAI API rate limit exceeded. Please try again later."
        });
      }
      if (error instanceof Error && error.message === "OPENAI_SERVER_ERROR") {
        return res.status(502).json({
          error: "OpenAI server error",
          details: "OpenAI service is experiencing issues. Please try again later."
        });
      }
      res.status(500).json({
        error: "Failed to analyze local competitors",
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Review Response Manager Routes
  app.post("/api/reviews/generate-response", async (req, res) => {
    try {
      const validationResult = generateReviewResponseSchema.safeParse(req.body);
      
      if (!validationResult.success) {
        return res.status(400).json({
          error: "Validation failed",
          details: fromZodError(validationResult.error).toString()
        });
      }

      const {
        businessName,
        businessType,
        reviewText,
        rating,
        reviewerName,
        responseStyle,
        includeApology,
        includeCallToAction,
        customInstructions,
        legalMode,
        industryType,
        conflictLevel
      } = validationResult.data;

      const response = await openaiService.generateReviewResponse(
        businessName,
        businessType,
        reviewText,
        rating,
        reviewerName,
        responseStyle,
        includeApology,
        includeCallToAction,
        customInstructions,
        legalMode,
        industryType,
        conflictLevel
      );

      res.json({ response });
    } catch (error) {
      console.error("Error generating review response:", error);
      if (error instanceof Error && error.message === "OPENAI_SERVICE_UNAVAILABLE") {
        return res.status(503).json({
          error: "OpenAI service unavailable",
          details: "OpenAI API key is not configured or invalid. Please contact support."
        });
      }
      if (error instanceof Error && error.message === "OPENAI_RATE_LIMITED") {
        return res.status(429).json({
          error: "Rate limit exceeded",
          details: "OpenAI API rate limit exceeded. Please try again later."
        });
      }
      if (error instanceof Error && error.message === "OPENAI_SERVER_ERROR") {
        return res.status(502).json({
          error: "OpenAI server error",
          details: "OpenAI service is experiencing issues. Please try again later."
        });
      }
      res.status(500).json({
        error: "Failed to generate review response",
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Conflict Detection Route
  app.post("/api/reviews/detect-conflict", async (req, res) => {
    try {
      const validationResult = detectConflictiveReviewSchema.safeParse(req.body);
      
      if (!validationResult.success) {
        return res.status(400).json({
          error: "Validation failed",
          details: fromZodError(validationResult.error).toString()
        });
      }

      const { reviewText, rating, businessType } = validationResult.data;

      const conflictAnalysis = await openaiService.detectConflictiveReview(
        reviewText,
        rating,
        businessType
      );

      res.json(conflictAnalysis);
    } catch (error) {
      console.error("Error detecting conflictive review:", error);
      if (error instanceof Error && error.message === "OPENAI_SERVICE_UNAVAILABLE") {
        return res.status(503).json({
          error: "OpenAI service unavailable",
          details: "OpenAI API key is not configured or invalid. Please contact support."
        });
      }
      if (error instanceof Error && error.message === "OPENAI_RATE_LIMITED") {
        return res.status(429).json({
          error: "Rate limit exceeded",
          details: "OpenAI API rate limit exceeded. Please try again later."
        });
      }
      if (error instanceof Error && error.message === "OPENAI_SERVER_ERROR") {
        return res.status(502).json({
          error: "OpenAI server error",
          details: "OpenAI service is experiencing issues. Please try again later."
        });
      }
      res.status(500).json({
        error: "Failed to analyze review for conflicts",
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Content Calendar Routes
  app.post("/api/content-calendar/generate", async (req, res) => {
    try {
      const validationResult = generateContentCalendarSchema.safeParse(req.body);
      
      if (!validationResult.success) {
        return res.status(400).json({
          error: "Validation failed",
          details: fromZodError(validationResult.error).toString()
        });
      }

      const {
        locationId,
        month,
        year,
        platforms,
        contentTypes,
        includeHolidays,
        includeLocalEvents,
        customKeywords
      } = validationResult.data;

      // Get location info from storage
      const location = await storage.getLocationById(locationId);
      if (!location) {
        return res.status(404).json({
          error: "Location not found",
          details: "The specified location ID does not exist."
        });
      }

      const business = await storage.getBusinessById(location.businessId);
      if (!business) {
        return res.status(404).json({
          error: "Business not found",
          details: "The business for this location does not exist."
        });
      }

      const businessInfo = `${business.name} - ${business.industry} en ${location.city}, ${location.state}. ${business.description || ''}`;
      const locationStr = `${location.city}, ${location.state}`;

      const calendar = await openaiService.generateContentCalendar({
        businessInfo,
        location: locationStr,
        month,
        year,
        platforms,
        contentTypes,
        includeHolidays,
        includeLocalEvents,
        customKeywords
      });

      // Transform and save each generated post to storage
      const savedPosts = [];
      for (const post of calendar.posts) {
        try {
          const postData = {
            locationId,
            title: post.title,
            content: post.content,
            platform: post.platform,
            contentType: post.contentType,
            scheduledDate: new Date(post.date),
            status: 'suggested' as const,
            isGenerated: true,
            keywords: JSON.stringify(post.keywords),
            hashtags: JSON.stringify(post.hashtags),
            imagePrompt: post.imagePrompt || null,
            publishedAt: null,
            engagement: 0,
            templateId: null
          };

          const savedPost = await storage.createContentCalendarPost(postData);
          // Parse JSON strings back to arrays for frontend
          const normalizedPost = {
            ...savedPost,
            keywords: JSON.parse(savedPost.keywords || '[]'),
            hashtags: JSON.parse(savedPost.hashtags || '[]')
          };
          savedPosts.push(normalizedPost);
        } catch (postError) {
          console.error(`Error saving post: ${post.title}`, postError);
          // Continue with other posts even if one fails
        }
      }

      // Return the saved posts with their IDs along with summary
      res.json({
        posts: savedPosts,
        summary: calendar.summary
      });
    } catch (error) {
      console.error("Error generating content calendar:", error);
      if (error instanceof Error && error.message === "OPENAI_SERVICE_UNAVAILABLE") {
        return res.status(503).json({
          error: "OpenAI service unavailable",
          details: "OpenAI API key is not configured or invalid. Please contact support."
        });
      }
      if (error instanceof Error && error.message === "OPENAI_RATE_LIMITED") {
        return res.status(429).json({
          error: "Rate limit exceeded",
          details: "OpenAI API rate limit exceeded. Please try again later."
        });
      }
      if (error instanceof Error && error.message === "OPENAI_SERVER_ERROR") {
        return res.status(502).json({
          error: "OpenAI server error",
          details: "OpenAI service is experiencing issues. Please try again later."
        });
      }
      res.status(500).json({
        error: "Failed to generate content calendar",
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  app.post("/api/content-calendar/generate-seasonal", async (req, res) => {
    try {
      const validationResult = generateSeasonalContentSchema.safeParse(req.body);
      
      if (!validationResult.success) {
        return res.status(400).json({
          error: "Validation failed",
          details: fromZodError(validationResult.error).toString()
        });
      }

      const {
        locationId,
        season,
        platform,
        contentType,
        includeLocalEvents,
        customTheme
      } = validationResult.data;

      // Get location and business info
      const location = await storage.getLocationById(locationId);
      if (!location) {
        return res.status(404).json({
          error: "Location not found",
          details: "The specified location ID does not exist."
        });
      }

      const business = await storage.getBusinessById(location.businessId);
      if (!business) {
        return res.status(404).json({
          error: "Business not found",
          details: "The business for this location does not exist."
        });
      }

      const businessInfo = `${business.name} - ${business.industry} en ${location.city}, ${location.state}. ${business.description || ''}`;
      const locationStr = `${location.city}, ${location.state}`;

      const seasonalContent = await openaiService.generateSeasonalContent({
        businessInfo,
        location: locationStr,
        season,
        platform,
        contentType,
        includeLocalEvents,
        customTheme
      });

      res.json(seasonalContent);
    } catch (error) {
      console.error("Error generating seasonal content:", error);
      if (error instanceof Error && error.message === "OPENAI_SERVICE_UNAVAILABLE") {
        return res.status(503).json({
          error: "OpenAI service unavailable",
          details: "OpenAI API key is not configured or invalid. Please contact support."
        });
      }
      if (error instanceof Error && error.message === "OPENAI_RATE_LIMITED") {
        return res.status(429).json({
          error: "Rate limit exceeded",
          details: "OpenAI API rate limit exceeded. Please try again later."
        });
      }
      if (error instanceof Error && error.message === "OPENAI_SERVER_ERROR") {
        return res.status(502).json({
          error: "OpenAI server error",
          details: "OpenAI service is experiencing issues. Please try again later."
        });
      }
      res.status(500).json({
        error: "Failed to generate seasonal content",
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  app.post("/api/content-calendar/analyze-timing", async (req, res) => {
    try {
      const { locationId, platforms, targetAudience } = req.body;

      if (!locationId || !platforms || !Array.isArray(platforms)) {
        return res.status(400).json({
          error: "Validation failed",
          details: "locationId and platforms array are required"
        });
      }

      const location = await storage.getLocationById(locationId);
      if (!location) {
        return res.status(404).json({
          error: "Location not found",
          details: "The specified location ID does not exist."
        });
      }

      const business = await storage.getBusinessById(location.businessId);
      if (!business) {
        return res.status(404).json({
          error: "Business not found",
          details: "The business for this location does not exist."
        });
      }

      const businessInfo = `${business.name} - ${business.industry} en ${location.city}, ${location.state}. ${business.description || ''}`;
      const locationStr = `${location.city}, ${location.state}`;

      const timingAnalysis = await openaiService.analyzeOptimalPostingTimes({
        businessInfo,
        location: locationStr,
        platforms,
        targetAudience
      });

      res.json(timingAnalysis);
    } catch (error) {
      console.error("Error analyzing posting times:", error);
      if (error instanceof Error && error.message === "OPENAI_SERVICE_UNAVAILABLE") {
        return res.status(503).json({
          error: "OpenAI service unavailable",
          details: "OpenAI API key is not configured or invalid. Please contact support."
        });
      }
      if (error instanceof Error && error.message === "OPENAI_RATE_LIMITED") {
        return res.status(429).json({
          error: "Rate limit exceeded",
          details: "OpenAI API rate limit exceeded. Please try again later."
        });
      }
      if (error instanceof Error && error.message === "OPENAI_SERVER_ERROR") {
        return res.status(502).json({
          error: "OpenAI server error",
          details: "OpenAI service is experiencing issues. Please try again later."
        });
      }
      res.status(500).json({
        error: "Failed to analyze posting times",
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  app.post("/api/content-calendar/suggestions", async (req, res) => {
    try {
      const { locationId, currentPerformance, goals } = req.body;

      if (!locationId) {
        return res.status(400).json({
          error: "Validation failed",
          details: "locationId is required"
        });
      }

      const location = await storage.getLocationById(locationId);
      if (!location) {
        return res.status(404).json({
          error: "Location not found",
          details: "The specified location ID does not exist."
        });
      }

      const business = await storage.getBusinessById(location.businessId);
      if (!business) {
        return res.status(404).json({
          error: "Business not found",
          details: "The business for this location does not exist."
        });
      }

      const businessInfo = `${business.name} - ${business.industry} en ${location.city}, ${location.state}. ${business.description || ''}`;
      const locationStr = `${location.city}, ${location.state}`;

      const suggestions = await openaiService.generateContentSuggestions({
        businessInfo,
        location: locationStr,
        currentPerformance,
        goals
      });

      res.json(suggestions);
    } catch (error) {
      console.error("Error generating content suggestions:", error);
      if (error instanceof Error && error.message === "OPENAI_SERVICE_UNAVAILABLE") {
        return res.status(503).json({
          error: "OpenAI service unavailable",
          details: "OpenAI API key is not configured or invalid. Please contact support."
        });
      }
      if (error instanceof Error && error.message === "OPENAI_RATE_LIMITED") {
        return res.status(429).json({
          error: "Rate limit exceeded",
          details: "OpenAI API rate limit exceeded. Please try again later."
        });
      }
      if (error instanceof Error && error.message === "OPENAI_SERVER_ERROR") {
        return res.status(502).json({
          error: "OpenAI server error",
          details: "OpenAI service is experiencing issues. Please try again later."
        });
      }
      res.status(500).json({
        error: "Failed to generate content suggestions",
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Calendar Posts CRUD Routes
  app.get("/api/content-calendar/posts/:locationId", async (req, res) => {
    try {
      const { locationId } = req.params;
      const { month, year, platform, status } = req.query;

      const posts = await storage.getContentCalendarPosts(locationId, {
        month: month ? Number(month) : undefined,
        year: year ? Number(year) : undefined,
        platform: platform as string,
        status: status as string
      });

      // Parse keywords and hashtags from JSON strings back to arrays for frontend
      const postsWithParsedArrays = posts.map(post => ({
        ...post,
        keywords: post.keywords ? (typeof post.keywords === 'string' ? JSON.parse(post.keywords) : post.keywords) : null,
        hashtags: post.hashtags ? (typeof post.hashtags === 'string' ? JSON.parse(post.hashtags) : post.hashtags) : null
      }));

      res.json(postsWithParsedArrays);
    } catch (error) {
      console.error("Error fetching calendar posts:", error);
      res.status(500).json({
        error: "Failed to fetch calendar posts",
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  app.post("/api/content-calendar/posts", async (req, res) => {
    try {
      const validationResult = insertContentCalendarPostSchema.safeParse(req.body);
      
      if (!validationResult.success) {
        return res.status(400).json({
          error: "Validation failed",
          details: fromZodError(validationResult.error).toString()
        });
      }

      const postData = validationResult.data;
      const post = await storage.createContentCalendarPost(postData);

      // Parse keywords and hashtags from JSON strings back to arrays for frontend
      const postWithParsedArrays = {
        ...post,
        keywords: post.keywords ? (typeof post.keywords === 'string' ? JSON.parse(post.keywords) : post.keywords) : null,
        hashtags: post.hashtags ? (typeof post.hashtags === 'string' ? JSON.parse(post.hashtags) : post.hashtags) : null
      };

      res.status(201).json(postWithParsedArrays);
    } catch (error) {
      console.error("Error creating calendar post:", error);
      res.status(500).json({
        error: "Failed to create calendar post",
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  app.put("/api/content-calendar/posts/:postId", async (req, res) => {
    try {
      const { postId } = req.params;
      const validationResult = editPostContentSchema.safeParse(req.body);
      
      if (!validationResult.success) {
        return res.status(400).json({
          error: "Validation failed",
          details: fromZodError(validationResult.error).toString()
        });
      }

      const validatedData = validationResult.data;
      
      // Create properly typed update object for storage
      const updateData: Partial<{
        title: string;
        content: string;
        scheduledDate: Date;
        keywords: string;
        hashtags: string;
        imagePrompt: string;
      }> = {};
      
      // Map validated data to storage-compatible format
      if (validatedData.title) updateData.title = validatedData.title;
      if (validatedData.content) updateData.content = validatedData.content;
      if (validatedData.imagePrompt) updateData.imagePrompt = validatedData.imagePrompt;
      
      // Convert scheduledDate string to Date object if provided
      if (validatedData.scheduledDate) {
        updateData.scheduledDate = new Date(validatedData.scheduledDate);
      }
      
      // Convert arrays to JSON strings for storage
      if (validatedData.keywords) {
        updateData.keywords = JSON.stringify(validatedData.keywords);
      }
      if (validatedData.hashtags) {
        updateData.hashtags = JSON.stringify(validatedData.hashtags);
      }
      
      const post = await storage.updateContentCalendarPost(postId, updateData);

      if (!post) {
        return res.status(404).json({
          error: "Post not found",
          details: "The specified post ID does not exist."
        });
      }

      // Parse keywords and hashtags from JSON strings back to arrays for frontend
      const postWithParsedArrays = {
        ...post,
        keywords: post.keywords ? (typeof post.keywords === 'string' ? JSON.parse(post.keywords) : post.keywords) : null,
        hashtags: post.hashtags ? (typeof post.hashtags === 'string' ? JSON.parse(post.hashtags) : post.hashtags) : null
      };

      res.json(postWithParsedArrays);
    } catch (error) {
      console.error("Error updating calendar post:", error);
      res.status(500).json({
        error: "Failed to update calendar post",
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  app.patch("/api/content-calendar/posts/:postId/status", async (req, res) => {
    try {
      const { postId } = req.params;
      const validationResult = updatePostStatusSchema.safeParse(req.body);
      
      if (!validationResult.success) {
        return res.status(400).json({
          error: "Validation failed",
          details: fromZodError(validationResult.error).toString()
        });
      }

      const { status, feedback } = validationResult.data;
      const post = await storage.updatePostStatus(postId, status, feedback);

      if (!post) {
        return res.status(404).json({
          error: "Post not found",
          details: "The specified post ID does not exist."
        });
      }

      // Parse keywords and hashtags from JSON strings back to arrays for frontend
      const postWithParsedArrays = {
        ...post,
        keywords: post.keywords ? (typeof post.keywords === 'string' ? JSON.parse(post.keywords) : post.keywords) : null,
        hashtags: post.hashtags ? (typeof post.hashtags === 'string' ? JSON.parse(post.hashtags) : post.hashtags) : null
      };

      res.json(postWithParsedArrays);
    } catch (error) {
      console.error("Error updating post status:", error);
      res.status(500).json({
        error: "Failed to update post status",
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  app.post("/api/content-calendar/posts/bulk-approve", async (req, res) => {
    try {
      const validationResult = bulkApprovePostsSchema.safeParse(req.body);
      
      if (!validationResult.success) {
        return res.status(400).json({
          error: "Validation failed",
          details: fromZodError(validationResult.error).toString()
        });
      }

      const { postIds, action } = validationResult.data;
      const results = await storage.bulkUpdatePostStatus(postIds, action === "approve" ? "approved" : "rejected");

      // Parse keywords and hashtags from JSON strings back to arrays for frontend
      const resultsWithParsedArrays = results.map(post => ({
        ...post,
        keywords: post.keywords ? (typeof post.keywords === 'string' ? JSON.parse(post.keywords) : post.keywords) : null,
        hashtags: post.hashtags ? (typeof post.hashtags === 'string' ? JSON.parse(post.hashtags) : post.hashtags) : null
      }));

      res.json({ updatedCount: resultsWithParsedArrays.length, posts: resultsWithParsedArrays });
    } catch (error) {
      console.error("Error bulk approving posts:", error);
      res.status(500).json({
        error: "Failed to bulk approve posts",
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Posting Schedules Routes
  app.get("/api/content-calendar/schedules/:locationId", async (req, res) => {
    try {
      const { locationId } = req.params;
      const schedules = await storage.getPostingSchedules(locationId);
      res.json(schedules);
    } catch (error) {
      console.error("Error fetching posting schedules:", error);
      res.status(500).json({
        error: "Failed to fetch posting schedules",
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  app.post("/api/content-calendar/schedules", async (req, res) => {
    try {
      const validationResult = updatePostingScheduleSchema.safeParse(req.body);
      
      if (!validationResult.success) {
        return res.status(400).json({
          error: "Validation failed",
          details: fromZodError(validationResult.error).toString()
        });
      }

      const scheduleData = {
        ...validationResult.data,
        preferredDays: JSON.stringify(validationResult.data.preferredDays),
        preferredTimes: JSON.stringify(validationResult.data.preferredTimes)
      };
      const schedule = await storage.createOrUpdatePostingSchedule(scheduleData);

      res.json(schedule);
    } catch (error) {
      console.error("Error creating posting schedule:", error);
      res.status(500).json({
        error: "Failed to create posting schedule",
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Business and Location Management Routes
  app.get("/api/businesses", async (req, res) => {
    try {
      // TODO: Get ownerId from authenticated user session
      // For now, return the mock business
      const mockOwnerId = "user-1";
      const businesses = await storage.getBusinessesByOwner(mockOwnerId);
      
      // Include locations for each business
      const businessesWithLocations = await Promise.all(
        businesses.map(async (business) => {
          const locations = await storage.getLocationsByBusiness(business.id);
          return {
            ...business,
            locations
          };
        })
      );

      res.json(businessesWithLocations);
    } catch (error) {
      console.error("Error fetching businesses:", error);
      res.status(500).json({
        error: "Failed to fetch businesses",
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  app.get("/api/locations", async (req, res) => {
    try {
      // TODO: Get ownerId from authenticated user session
      // For now, return all locations for the mock business
      const mockOwnerId = "user-1";
      const businesses = await storage.getBusinessesByOwner(mockOwnerId);
      
      const allLocations = [];
      for (const business of businesses) {
        const locations = await storage.getLocationsByBusiness(business.id);
        allLocations.push(...locations.map(location => ({
          ...location,
          businessName: business.name
        })));
      }

      res.json(allLocations);
    } catch (error) {
      console.error("Error fetching locations:", error);
      res.status(500).json({
        error: "Failed to fetch locations",
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Reputation Module Routes

  // Run reputation analysis for a location
  app.post("/api/reputation/run", async (req, res) => {
    try {
      const validationResult = runReputationAnalysisSchema.safeParse(req.body);
      
      if (!validationResult.success) {
        return res.status(400).json({
          error: "Validation failed",
          details: fromZodError(validationResult.error).toString()
        });
      }

      const { locationId, windowDays } = validationResult.data;

      // Check if location exists
      const location = await storage.getLocationById(locationId);
      if (!location) {
        return res.status(404).json({
          error: "Location not found",
          details: `Location with ID ${locationId} does not exist`
        });
      }

      // Run comprehensive reputation analysis
      const analysisResult = await reputationService.calculateReputationScore(locationId, windowDays);

      // Persist the reputation score
      await storage.createReputationScore({
        locationId,
        score: analysisResult.score,
        components: JSON.stringify(analysisResult.components),
        trend: analysisResult.trend.trend,
        previousScore: null // Will be set by the service if there's a previous score
      });

      // Persist any new alerts
      for (const alert of analysisResult.alerts) {
        await storage.createReputationAlert({
          locationId,
          alertType: alert.type,
          severity: alert.severity,
          score: analysisResult.score,
          reasonCode: alert.reasonCode,
          message: alert.message,
          metadata: alert.metadata ? JSON.stringify(alert.metadata) : null,
          acknowledged: false
        });
      }

      res.json(analysisResult);
    } catch (error) {
      console.error("Error running reputation analysis:", error);
      if (error instanceof Error && error.message.includes("Invalid locationId")) {
        return res.status(400).json({
          error: "Invalid location ID",
          details: error.message
        });
      }
      if (error instanceof Error && error.message.includes("Invalid windowDays")) {
        return res.status(400).json({
          error: "Invalid window days",
          details: error.message
        });
      }
      res.status(500).json({
        error: "Failed to run reputation analysis",
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Get latest reputation score for a location
  app.get("/api/reputation/score", async (req, res) => {
    try {
      const validationResult = getReputationScoreSchema.safeParse(req.query);
      
      if (!validationResult.success) {
        return res.status(400).json({
          error: "Validation failed",
          details: fromZodError(validationResult.error).toString()
        });
      }

      const { locationId } = validationResult.data;

      // Check if location exists
      const location = await storage.getLocationById(locationId);
      if (!location) {
        return res.status(404).json({
          error: "Location not found",
          details: `Location with ID ${locationId} does not exist`
        });
      }

      // Get latest reputation score
      const latestScore = await storage.getLatestReputationScore(locationId);
      if (!latestScore) {
        return res.status(404).json({
          error: "No reputation score found",
          details: `No reputation analysis has been run for location ${locationId}. Run analysis first.`
        });
      }

      // Get score history for trends
      const scoreHistory = await storage.getReputationScoreHistory(locationId, 90);

      // Parse components JSON and map to UI format
      const serviceComponents = JSON.parse(latestScore.components) as RiskScoreComponents;
      const components = mapComponentsForUI(serviceComponents);

      const response = {
        score: latestScore.score,
        components,
        trend: latestScore.trend,
        previousScore: latestScore.previousScore,
        calculatedAt: latestScore.calculatedAt,
        history: scoreHistory.slice(0, 30) // Last 30 scores for trend visualization
      };

      res.json(response);
    } catch (error) {
      console.error("Error fetching reputation score:", error);
      res.status(500).json({
        error: "Failed to fetch reputation score",
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Get reputation trends analysis
  app.get("/api/reputation/trends", async (req, res) => {
    try {
      const validationResult = getReputationTrendsSchema.safeParse(req.query);
      
      if (!validationResult.success) {
        return res.status(400).json({
          error: "Validation failed",
          details: fromZodError(validationResult.error).toString()
        });
      }

      const { locationId, windowDays } = validationResult.data;

      // Check if location exists
      const location = await storage.getLocationById(locationId);
      if (!location) {
        return res.status(404).json({
          error: "Location not found",
          details: `Location with ID ${locationId} does not exist`
        });
      }

      // Get reputation score history
      const scoreHistory = await storage.getReputationScoreHistory(locationId, windowDays);
      
      if (scoreHistory.length === 0) {
        return res.status(404).json({
          error: "No trend data found",
          details: `No reputation analysis history found for location ${locationId}. Run analysis first.`
        });
      }

      // Get recent reviews for sentiment analysis
      const recentReviews = await storage.getRecentReviews(locationId, windowDays);

      // Calculate trend metrics
      const scores = scoreHistory.map(s => s.score);
      const dates = scoreHistory.map(s => s.calculatedAt);
      
      // Map score history components to UI format
      const mappedScoreHistory = scoreHistory.slice(0, 50).map(score => {
        const serviceComponents = JSON.parse(score.components) as RiskScoreComponents;
        const uiComponents = mapComponentsForUI(serviceComponents);
        return {
          id: score.id,
          locationId: score.locationId,
          score: score.score,
          components: uiComponents,
          trend: score.trend,
          previousScore: score.previousScore,
          calculatedAt: score.calculatedAt,
          date: score.calculatedAt // For frontend compatibility
        };
      });

      const trend = {
        direction: scoreHistory.length > 1 ? 
          (scoreHistory[0].score > scoreHistory[scoreHistory.length - 1].score ? 'improving' : 
           scoreHistory[0].score < scoreHistory[scoreHistory.length - 1].score ? 'declining' : 'stable') : 'stable',
        scoreHistory: mappedScoreHistory,
        averageScore: scores.reduce((a, b) => a + b, 0) / scores.length,
        scoreRange: {
          min: Math.min(...scores),
          max: Math.max(...scores)
        },
        reviewMetrics: {
          totalReviews: recentReviews.length,
          averageRating: recentReviews.length > 0 ? 
            recentReviews.reduce((sum, r) => sum + r.rating, 0) / recentReviews.length : 0,
          negativeReviews: recentReviews.filter(r => r.rating <= 2).length,
          positiveReviews: recentReviews.filter(r => r.rating >= 4).length
        },
        timeline: {
          windowDays,
          startDate: dates[dates.length - 1],
          endDate: dates[0]
        }
      };

      res.json(trend);
    } catch (error) {
      console.error("Error fetching reputation trends:", error);
      res.status(500).json({
        error: "Failed to fetch reputation trends",
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Get reputation alerts with filtering
  app.get("/api/reputation/alerts", async (req, res) => {
    try {
      const validationResult = getReputationAlertsSchema.safeParse(req.query);
      
      if (!validationResult.success) {
        return res.status(400).json({
          error: "Validation failed",
          details: fromZodError(validationResult.error).toString()
        });
      }

      const { locationId, acknowledged, severity, limit } = validationResult.data;

      // Check if location exists
      const location = await storage.getLocationById(locationId);
      if (!location) {
        return res.status(404).json({
          error: "Location not found",
          details: `Location with ID ${locationId} does not exist`
        });
      }

      // Get alerts based on filters
      let alerts;
      if (acknowledged === false) {
        alerts = await storage.getUnacknowledgedAlerts(locationId);
      } else {
        alerts = await storage.getRecentAlerts(locationId, 30); // Default to last 30 days
      }

      // Apply additional filters
      if (severity) {
        alerts = alerts.filter(alert => alert.severity === severity);
      }

      if (acknowledged !== undefined) {
        alerts = alerts.filter(alert => alert.acknowledged === acknowledged);
      }

      // Limit results
      const limitedAlerts = alerts.slice(0, limit);

      // Parse metadata for each alert
      const enrichedAlerts = limitedAlerts.map(alert => ({
        ...alert,
        metadata: alert.metadata ? JSON.parse(alert.metadata) : null
      }));

      const response = {
        alerts: enrichedAlerts,
        total: alerts.length,
        showing: limitedAlerts.length,
        filters: {
          locationId,
          acknowledged,
          severity,
          limit
        }
      };

      res.json(response);
    } catch (error) {
      console.error("Error fetching reputation alerts:", error);
      res.status(500).json({
        error: "Failed to fetch reputation alerts",
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Acknowledge a reputation alert
  app.post("/api/reputation/alerts/:id/ack", async (req, res) => {
    try {
      const alertId = req.params.id;
      if (!alertId) {
        return res.status(400).json({
          error: "Alert ID is required",
          details: "Alert ID must be provided in the URL path"
        });
      }

      // TODO: Get user from authentication session
      const acknowledgedBy = req.body.acknowledgedBy || "system"; // Fallback for now

      const acknowledgedAlert = await storage.acknowledgeAlert(alertId, acknowledgedBy);
      
      if (!acknowledgedAlert) {
        return res.status(404).json({
          error: "Alert not found",
          details: `Alert with ID ${alertId} does not exist`
        });
      }

      // Parse metadata if present
      const response = {
        ...acknowledgedAlert,
        metadata: acknowledgedAlert.metadata ? JSON.parse(acknowledgedAlert.metadata) : null
      };

      res.json(response);
    } catch (error) {
      console.error("Error acknowledging alert:", error);
      res.status(500).json({
        error: "Failed to acknowledge alert",
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Threshold Management Routes
  
  // Get threshold for a location
  app.get("/api/reputation/thresholds/:locationId", async (req, res) => {
    try {
      const { locationId } = req.params;
      
      if (!locationId) {
        return res.status(400).json({
          error: "Location ID is required",
          details: "Location ID must be provided in the URL path"
        });
      }

      // Check if location exists
      const location = await storage.getLocationById(locationId);
      if (!location) {
        return res.status(404).json({
          error: "Location not found",
          details: `Location with ID ${locationId} does not exist`
        });
      }

      const threshold = await storage.getLocationThreshold(locationId);
      
      res.json({
        locationId,
        threshold,
        location: {
          name: location.name,
          businessName: location.businessId // Will be populated with actual business name later
        }
      });
    } catch (error) {
      console.error("Error fetching threshold:", error);
      res.status(500).json({
        error: "Failed to fetch threshold",
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Update threshold for a location
  app.put("/api/reputation/thresholds/:locationId", async (req, res) => {
    try {
      const { locationId } = req.params;
      
      if (!locationId) {
        return res.status(400).json({
          error: "Location ID is required",
          details: "Location ID must be provided in the URL path"
        });
      }

      const validationResult = updateThresholdSchema.safeParse(req.body);
      
      if (!validationResult.success) {
        return res.status(400).json({
          error: "Validation failed",
          details: fromZodError(validationResult.error).toString()
        });
      }

      const { threshold } = validationResult.data;

      // Check if location exists
      const location = await storage.getLocationById(locationId);
      if (!location) {
        return res.status(404).json({
          error: "Location not found",
          details: `Location with ID ${locationId} does not exist`
        });
      }

      await storage.setLocationThreshold(locationId, threshold);
      
      res.json({
        locationId,
        threshold,
        message: `Threshold updated successfully to ${threshold}`,
        location: {
          name: location.name,
          businessName: location.businessId
        }
      });
    } catch (error) {
      console.error("Error updating threshold:", error);
      if (error instanceof Error && (error.message.includes("Threshold must be between") || error.message.includes("Location with ID"))) {
        return res.status(400).json({
          error: "Invalid input",
          details: error.message
        });
      }
      res.status(500).json({
        error: "Failed to update threshold",
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Bulk acknowledge alerts
  app.post("/api/reputation/alerts/acknowledge", async (req, res) => {
    try {
      const validationResult = acknowledgeAlertsSchema.safeParse(req.body);
      
      if (!validationResult.success) {
        return res.status(400).json({
          error: "Validation failed",
          details: fromZodError(validationResult.error).toString()
        });
      }

      const { alertIds, acknowledgedBy } = validationResult.data;

      // TODO: Get user from authentication session
      const acknowledger = acknowledgedBy || "system"; // Fallback for now

      const acknowledgedAlerts = await storage.bulkAcknowledgeAlerts(alertIds, acknowledger);
      
      if (acknowledgedAlerts.length === 0) {
        return res.status(404).json({
          error: "No alerts acknowledged",
          details: "None of the provided alert IDs were found or could be acknowledged"
        });
      }

      // Parse metadata for each acknowledged alert
      const enrichedAlerts = acknowledgedAlerts.map(alert => ({
        ...alert,
        metadata: alert.metadata ? JSON.parse(alert.metadata) : null
      }));

      res.json({
        message: `Successfully acknowledged ${acknowledgedAlerts.length} alert(s)`,
        acknowledged: acknowledgedAlerts.length,
        total: alertIds.length,
        alerts: enrichedAlerts
      });
    } catch (error) {
      console.error("Error acknowledging alerts:", error);
      res.status(500).json({
        error: "Failed to acknowledge alerts",
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Optional: Ingest reviews for testing/seeding
  app.post("/api/reviews/ingest", async (req, res) => {
    try {
      const validationResult = ingestReviewsSchema.safeParse(req.body);
      
      if (!validationResult.success) {
        return res.status(400).json({
          error: "Validation failed",
          details: fromZodError(validationResult.error).toString()
        });
      }

      const { locationId, reviews } = validationResult.data;

      // Check if location exists
      const location = await storage.getLocationById(locationId);
      if (!location) {
        return res.status(404).json({
          error: "Location not found",
          details: `Location with ID ${locationId} does not exist`
        });
      }

      // Ingest reviews
      const createdReviews = [];
      for (const reviewData of reviews) {
        const createdReview = await storage.createReview({
          locationId,
          rating: reviewData.rating,
          text: reviewData.text,
          reviewerName: reviewData.reviewerName || null,
          platform: reviewData.platform || 'google',
          externalId: reviewData.externalId || null,
          respondedAt: reviewData.respondedAt ? new Date(reviewData.respondedAt) : null
        });
        createdReviews.push(createdReview);
      }

      const response = {
        message: `Successfully ingested ${createdReviews.length} reviews`,
        locationId,
        reviewsCreated: createdReviews.length,
        reviews: createdReviews.slice(0, 5) // Show first 5 for confirmation
      };

      res.json(response);
    } catch (error) {
      console.error("Error ingesting reviews:", error);
      res.status(500).json({
        error: "Failed to ingest reviews",
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // ===========================================
  // SUBSCRIPTION & PAYMENT ROUTES (MERCADO PAGO)
  // ===========================================

  // Create subscription
  app.post("/api/subscriptions/create", async (req, res) => {
    try {
      const validationResult = insertSubscriptionSchema.safeParse(req.body);
      
      if (!validationResult.success) {
        return res.status(400).json({
          error: "Validation failed",
          details: fromZodError(validationResult.error).toString()
        });
      }

      const subscriptionData = validationResult.data;

      // Get the subscription plan
      const plan = await storage.getSubscriptionPlan(subscriptionData.planId);
      if (!plan) {
        return res.status(404).json({
          error: "Plan not found",
          details: `Subscription plan with ID ${subscriptionData.planId} does not exist`
        });
      }

      // Create MercadoPago subscription
      const mpSubscription = await mercadoPagoService.createSubscription({
        planId: subscriptionData.planId,
        payerEmail: req.body.payerEmail || "customer@example.com", // Should come from authenticated user
        cardToken: req.body.cardToken,
        preapprovalId: req.body.preapprovalId
      });

      // Create subscription in database
      const subscription = await storage.createSubscription({
        ...subscriptionData,
        mercadoPagoId: mpSubscription.id,
        status: mpSubscription.status
      });

      res.json({
        subscription,
        paymentUrl: mpSubscription.initPoint,
        sandboxPaymentUrl: mpSubscription.sandboxInitPoint
      });
    } catch (error) {
      console.error("Error creating subscription:", error);
      res.status(500).json({
        error: "Failed to create subscription",
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Cancel subscription
  app.post("/api/subscriptions/:subscriptionId/cancel", async (req, res) => {
    try {
      const { subscriptionId } = req.params;
      
      if (!subscriptionId) {
        return res.status(400).json({
          error: "Subscription ID is required",
          details: "Subscription ID must be provided in the URL path"
        });
      }

      const subscription = await storage.getSubscription(subscriptionId);
      if (!subscription) {
        return res.status(404).json({
          error: "Subscription not found",
          details: `Subscription with ID ${subscriptionId} does not exist`
        });
      }

      // Cancel with MercadoPago
      const success = await mercadoPagoService.cancelSubscription(subscription.mercadoPagoId || '');
      
      if (success) {
        const updatedSubscription = await storage.updateSubscription(subscriptionId, {
          status: 'cancelled',
          cancelledAt: new Date(),
          cancelAtPeriodEnd: true
        });

        res.json({
          message: "Subscription cancelled successfully",
          subscription: updatedSubscription
        });
      } else {
        res.status(500).json({
          error: "Failed to cancel subscription with payment processor",
          details: "Could not cancel subscription with MercadoPago"
        });
      }
    } catch (error) {
      console.error("Error cancelling subscription:", error);
      res.status(500).json({
        error: "Failed to cancel subscription",
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Get subscription plans
  app.get("/api/subscription-plans", async (req, res) => {
    try {
      const plans = await storage.getSubscriptionPlans();
      
      // Parse features JSON for each plan
      const enrichedPlans = plans.map(plan => ({
        ...plan,
        features: plan.features ? JSON.parse(plan.features) : []
      }));

      res.json({ plans: enrichedPlans });
    } catch (error) {
      console.error("Error fetching subscription plans:", error);
      res.status(500).json({
        error: "Failed to fetch subscription plans",
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Process payment webhook from MercadoPago
  app.post("/api/webhooks/mercadopago", async (req, res) => {
    try {
      const signature = req.headers['x-signature'] as string;
      const payload = JSON.stringify(req.body);

      // Verify webhook signature
      if (!mercadoPagoService.verifyWebhookSignature(payload, signature)) {
        return res.status(401).json({ error: "Invalid signature" });
      }

      const { type, data } = req.body;

      if (type === 'payment') {
        // Handle payment status update
        const paymentStatus = await mercadoPagoService.getPaymentStatus(data.id);
        
        // Update payment record
        await storage.updatePaymentByMercadoPagoId(data.id, {
          status: paymentStatus.status,
          paidAt: paymentStatus.status === 'approved' ? new Date() : null
        });

        // If payment approved, activate subscription
        if (paymentStatus.status === 'approved') {
          const payment = await storage.getPaymentByMercadoPagoId(data.id);
          if (payment) {
            await storage.updateSubscription(payment.subscriptionId, {
              status: 'active'
            });
          }
        }
      }

      res.json({ received: true });
    } catch (error) {
      console.error("Error processing MercadoPago webhook:", error);
      res.status(500).json({
        error: "Webhook processing failed",
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // ===========================================
  // TRIAL SIGNUP ROUTES
  // ===========================================

  // Process trial signup
  app.post("/api/trial-signup", async (req, res) => {
    try {
      const validationResult = insertTrialSignupSchema.safeParse(req.body);
      
      if (!validationResult.success) {
        return res.status(400).json({
          error: "Validation failed",
          details: fromZodError(validationResult.error).toString()
        });
      }

      const signupData = validationResult.data;

      // Calculate trial end date (14 days from now)
      const trialEndDate = new Date();
      trialEndDate.setDate(trialEndDate.getDate() + 14);

      // Create trial signup record
      const trialSignup = await storage.createTrialSignup({
        ...signupData,
        trialEndDate,
        currentReviewPlatforms: signupData.currentReviewPlatforms ? JSON.stringify(signupData.currentReviewPlatforms) : null
      });

      // Send notification to admin
      try {
        await sendTrialSignupNotification(
          signupData.businessName,
          signupData.contactEmail,
          signupData.phone || undefined,
          signupData.industry || undefined,
          signupData.city || undefined,
          signupData.websiteUrl || undefined,
          signupData.mainChallenges || undefined
        );
        
        // Update notification flag
        await storage.updateTrialSignup(trialSignup.id, { notifiedAdmin: true });
      } catch (emailError) {
        console.error("Failed to send admin notification:", emailError);
        // Continue even if email fails
      }

      // Send welcome email to customer
      try {
        await sendWelcomeEmail(signupData.businessName, signupData.contactEmail);
      } catch (emailError) {
        console.error("Failed to send welcome email:", emailError);
        // Continue even if email fails
      }

      res.json({
        message: "Trial signup successful",
        trialSignup: {
          ...trialSignup,
          currentReviewPlatforms: trialSignup.currentReviewPlatforms ? JSON.parse(trialSignup.currentReviewPlatforms) : null
        },
        trialEndDate
      });
    } catch (error) {
      console.error("Error processing trial signup:", error);
      res.status(500).json({
        error: "Failed to process trial signup",
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Get trial signups (admin only)
  app.get("/api/admin/trial-signups", async (req, res) => {
    try {
      const { status, limit = 50 } = req.query;
      
      const signups = await storage.getTrialSignups({
        status: status as string,
        limit: parseInt(limit as string)
      });

      // Parse JSON fields
      const enrichedSignups = signups.map(signup => ({
        ...signup,
        currentReviewPlatforms: signup.currentReviewPlatforms ? JSON.parse(signup.currentReviewPlatforms) : null
      }));

      res.json({ signups: enrichedSignups });
    } catch (error) {
      console.error("Error fetching trial signups:", error);
      res.status(500).json({
        error: "Failed to fetch trial signups",
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // ===========================================
  // REVIEW SOURCE CONFIGURATION ROUTES
  // ===========================================

  // Get review sources for a location
  app.get("/api/locations/:locationId/review-sources", async (req, res) => {
    try {
      const { locationId } = req.params;
      
      if (!locationId) {
        return res.status(400).json({
          error: "Location ID is required",
          details: "Location ID must be provided in the URL path"
        });
      }

      const reviewSources = await storage.getReviewSources({ locationId });
      
      res.json({ reviewSources });
    } catch (error) {
      console.error("Error fetching review sources:", error);
      res.status(500).json({
        error: "Failed to fetch review sources",
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Create review source
  app.post("/api/locations/:locationId/review-sources", async (req, res) => {
    try {
      const { locationId } = req.params;
      
      if (!locationId) {
        return res.status(400).json({
          error: "Location ID is required",
          details: "Location ID must be provided in the URL path"
        });
      }

      const validationResult = insertReviewSourceSchema.extend({
        locationId: z.string()
      }).safeParse({ ...req.body, locationId });
      
      if (!validationResult.success) {
        return res.status(400).json({
          error: "Validation failed",
          details: fromZodError(validationResult.error).toString()
        });
      }

      const sourceData = validationResult.data;

      // Check if location exists
      const location = await storage.getLocationById(locationId);
      if (!location) {
        return res.status(404).json({
          error: "Location not found",
          details: `Location with ID ${locationId} does not exist`
        });
      }

      const reviewSource = await storage.createReviewSource(sourceData);
      
      res.json({
        message: "Review source created successfully",
        reviewSource
      });
    } catch (error) {
      console.error("Error creating review source:", error);
      res.status(500).json({
        error: "Failed to create review source",
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Update review source
  app.put("/api/review-sources/:sourceId", async (req, res) => {
    try {
      const { sourceId } = req.params;
      
      if (!sourceId) {
        return res.status(400).json({
          error: "Review source ID is required",
          details: "Review source ID must be provided in the URL path"
        });
      }

      const updatedSource = await storage.updateReviewSource(sourceId, req.body);
      
      if (!updatedSource) {
        return res.status(404).json({
          error: "Review source not found",
          details: `Review source with ID ${sourceId} does not exist`
        });
      }

      res.json({
        message: "Review source updated successfully",
        reviewSource: updatedSource
      });
    } catch (error) {
      console.error("Error updating review source:", error);
      res.status(500).json({
        error: "Failed to update review source",
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Delete review source
  app.delete("/api/review-sources/:sourceId", async (req, res) => {
    try {
      const { sourceId } = req.params;
      
      if (!sourceId) {
        return res.status(400).json({
          error: "Review source ID is required",
          details: "Review source ID must be provided in the URL path"
        });
      }

      const success = await storage.deleteReviewSource(sourceId);
      
      if (!success) {
        return res.status(404).json({
          error: "Review source not found",
          details: `Review source with ID ${sourceId} does not exist`
        });
      }

      res.json({
        message: "Review source deleted successfully"
      });
    } catch (error) {
      console.error("Error deleting review source:", error);
      res.status(500).json({
        error: "Failed to delete review source",
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // ===========================================
  // GOOGLE MY BUSINESS POST MANAGEMENT ROUTES
  // ===========================================

  // Get GMB posts for a location
  app.get("/api/locations/:locationId/gmb-posts", async (req, res) => {
    try {
      const { locationId } = req.params;
      const { status, limit = 50 } = req.query;
      
      if (!locationId) {
        return res.status(400).json({
          error: "Location ID is required",
          details: "Location ID must be provided in the URL path"
        });
      }

      const posts = await storage.getGmbPosts({
        locationId,
        status: status as string,
        limit: parseInt(limit as string)
      });
      
      res.json({ posts });
    } catch (error) {
      console.error("Error fetching GMB posts:", error);
      res.status(500).json({
        error: "Failed to fetch GMB posts",
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Create GMB post
  app.post("/api/locations/:locationId/gmb-posts", async (req, res) => {
    try {
      const { locationId } = req.params;
      
      if (!locationId) {
        return res.status(400).json({
          error: "Location ID is required",
          details: "Location ID must be provided in the URL path"
        });
      }

      const validationResult = insertGmbPostSchema.extend({
        locationId: z.string()
      }).safeParse({ ...req.body, locationId });
      
      if (!validationResult.success) {
        return res.status(400).json({
          error: "Validation failed",
          details: fromZodError(validationResult.error).toString()
        });
      }

      const postData = validationResult.data;

      // Check if location exists
      const location = await storage.getLocationById(locationId);
      if (!location) {
        return res.status(404).json({
          error: "Location not found",
          details: `Location with ID ${locationId} does not exist`
        });
      }

      const gmbPost = await storage.createGmbPost(postData);
      
      res.json({
        message: "GMB post created successfully",
        post: gmbPost
      });
    } catch (error) {
      console.error("Error creating GMB post:", error);
      res.status(500).json({
        error: "Failed to create GMB post",
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Update GMB post
  app.put("/api/gmb-posts/:postId", async (req, res) => {
    try {
      const { postId } = req.params;
      
      if (!postId) {
        return res.status(400).json({
          error: "Post ID is required",
          details: "Post ID must be provided in the URL path"
        });
      }

      const updatedPost = await storage.updateGmbPost(postId, req.body);
      
      if (!updatedPost) {
        return res.status(404).json({
          error: "GMB post not found",
          details: `GMB post with ID ${postId} does not exist`
        });
      }

      res.json({
        message: "GMB post updated successfully",
        post: updatedPost
      });
    } catch (error) {
      console.error("Error updating GMB post:", error);
      res.status(500).json({
        error: "Failed to update GMB post",
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Publish GMB post
  app.post("/api/gmb-posts/:postId/publish", async (req, res) => {
    try {
      const { postId } = req.params;
      
      if (!postId) {
        return res.status(400).json({
          error: "Post ID is required",
          details: "Post ID must be provided in the URL path"
        });
      }

      // Get the post
      const post = await storage.getGmbPost(postId);
      if (!post) {
        return res.status(404).json({
          error: "GMB post not found",
          details: `GMB post with ID ${postId} does not exist`
        });
      }

      // Update status to published
      const updatedPost = await storage.updateGmbPost(postId, {
        status: 'published',
        publishedDate: new Date()
      });

      res.json({
        message: "GMB post published successfully",
        post: updatedPost
      });
    } catch (error) {
      console.error("Error publishing GMB post:", error);
      res.status(500).json({
        error: "Failed to publish GMB post",
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Delete GMB post
  app.delete("/api/gmb-posts/:postId", async (req, res) => {
    try {
      const { postId } = req.params;
      
      if (!postId) {
        return res.status(400).json({
          error: "Post ID is required",
          details: "Post ID must be provided in the URL path"
        });
      }

      const success = await storage.deleteGmbPost(postId);
      
      if (!success) {
        return res.status(404).json({
          error: "GMB post not found",
          details: `GMB post with ID ${postId} does not exist`
        });
      }

      res.json({
        message: "GMB post deleted successfully"
      });
    } catch (error) {
      console.error("Error deleting GMB post:", error);
      res.status(500).json({
        error: "Failed to delete GMB post",
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // ===========================================
  // REPORT EXPORT ROUTES
  // ===========================================

  // Generate report export
  app.post("/api/reports/export", async (req, res) => {
    try {
      const validationResult = insertReportExportSchema.safeParse(req.body);
      
      if (!validationResult.success) {
        return res.status(400).json({
          error: "Validation failed",
          details: fromZodError(validationResult.error).toString()
        });
      }

      const exportData = validationResult.data;

      // Create export record
      const reportExport = await storage.createReportExport(exportData);
      
      // Mock report generation - in production, this would generate actual PDF/Excel
      const reportUrl = `${process.env.BASE_URL || 'http://localhost:5000'}/api/reports/download/${reportExport.id}`;
      
      // Update with generated URL
      const updatedExport = await storage.updateReportExport(reportExport.id, {
        fileUrl: reportUrl,
        status: 'completed'
      });

      res.json({
        message: "Report export generated successfully",
        export: updatedExport,
        downloadUrl: reportUrl
      });
    } catch (error) {
      console.error("Error generating report export:", error);
      res.status(500).json({
        error: "Failed to generate report export",
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Download report
  app.get("/api/reports/download/:exportId", async (req, res) => {
    try {
      const { exportId } = req.params;
      
      if (!exportId) {
        return res.status(400).json({
          error: "Export ID is required",
          details: "Export ID must be provided in the URL path"
        });
      }

      const reportExport = await storage.getReportExport(exportId);
      
      if (!reportExport) {
        return res.status(404).json({
          error: "Report export not found",
          details: `Report export with ID ${exportId} does not exist`
        });
      }

      if (reportExport.status !== 'completed') {
        return res.status(400).json({
          error: "Report not ready",
          details: "Report export is still being processed"
        });
      }

      // Mock download - in production, serve actual file
      res.json({
        message: "Report download initiated",
        export: reportExport,
        mockData: "This would be the actual file content in production"
      });
    } catch (error) {
      console.error("Error downloading report:", error);
      res.status(500).json({
        error: "Failed to download report",
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Get export history
  app.get("/api/reports/exports", async (req, res) => {
    try {
      const { userId, limit = 50 } = req.query;
      
      const exports = await storage.getReportExports({
        userId: userId as string
      });
      
      res.json({ exports });
    } catch (error) {
      console.error("Error fetching export history:", error);
      res.status(500).json({
        error: "Failed to fetch export history",
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // ===========================================
  // BUSINESS & LOCATION MANAGEMENT ROUTES
  // ===========================================

  // Get businesses for current user
  app.get("/api/businesses", async (req, res) => {
    try {
      // TODO: Get userId from authentication session
      const userId = req.query.userId as string || "mock-user-id";
      
      const businesses = await storage.getBusinessesByOwner(userId);
      
      res.json({ businesses });
    } catch (error) {
      console.error("Error fetching businesses:", error);
      res.status(500).json({
        error: "Failed to fetch businesses",
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Create business
  app.post("/api/businesses", async (req, res) => {
    try {
      const validationResult = insertBusinessSchema.safeParse(req.body);
      
      if (!validationResult.success) {
        return res.status(400).json({
          error: "Validation failed",
          details: fromZodError(validationResult.error).toString()
        });
      }

      const businessData = validationResult.data;
      
      const business = await storage.createBusiness(businessData);
      
      res.json({
        message: "Business created successfully",
        business
      });
    } catch (error) {
      console.error("Error creating business:", error);
      res.status(500).json({
        error: "Failed to create business",
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Get locations for a business
  app.get("/api/businesses/:businessId/locations", async (req, res) => {
    try {
      const { businessId } = req.params;
      
      if (!businessId) {
        return res.status(400).json({
          error: "Business ID is required",
          details: "Business ID must be provided in the URL path"
        });
      }

      const locations = await storage.getLocationsByBusiness(businessId);
      
      res.json({ locations });
    } catch (error) {
      console.error("Error fetching locations:", error);
      res.status(500).json({
        error: "Failed to fetch locations",
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Create location
  app.post("/api/businesses/:businessId/locations", async (req, res) => {
    try {
      const { businessId } = req.params;
      
      if (!businessId) {
        return res.status(400).json({
          error: "Business ID is required",
          details: "Business ID must be provided in the URL path"
        });
      }

      const validationResult = insertLocationSchema.extend({
        businessId: z.string()
      }).safeParse({ ...req.body, businessId });
      
      if (!validationResult.success) {
        return res.status(400).json({
          error: "Validation failed",
          details: fromZodError(validationResult.error).toString()
        });
      }

      const locationData = validationResult.data;

      // Check if business exists
      const business = await storage.getBusinessById(businessId);
      if (!business) {
        return res.status(404).json({
          error: "Business not found",
          details: `Business with ID ${businessId} does not exist`
        });
      }

      const location = await storage.createLocation(locationData);
      
      res.json({
        message: "Location created successfully",
        location
      });
    } catch (error) {
      console.error("Error creating location:", error);
      res.status(500).json({
        error: "Failed to create location",
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // ===========================================
  // ENHANCED COMPETITOR ANALYSIS ROUTES
  // ===========================================

  // Store competitor analysis data
  app.post("/api/locations/:locationId/competitor-analysis", async (req, res) => {
    try {
      const { locationId } = req.params;
      
      if (!locationId) {
        return res.status(400).json({
          error: "Location ID is required",
          details: "Location ID must be provided in the URL path"
        });
      }

      const validationResult = insertCompetitorAnalysisSchema.extend({
        locationId: z.string()
      }).safeParse({ ...req.body, locationId });
      
      if (!validationResult.success) {
        return res.status(400).json({
          error: "Validation failed",
          details: fromZodError(validationResult.error).toString()
        });
      }

      const analysisData = validationResult.data;

      // Check if location exists
      const location = await storage.getLocationById(locationId);
      if (!location) {
        return res.status(404).json({
          error: "Location not found",
          details: `Location with ID ${locationId} does not exist`
        });
      }

      const analysis = await storage.createCompetitorAnalysisRecord({
        ...analysisData,
        analysisData: analysisData.analysisData ? JSON.stringify(analysisData.analysisData) : ''
      });
      
      res.json({
        message: "Competitor analysis stored successfully",
        analysis: {
          ...analysis,
          analysisData: analysis.analysisData ? JSON.parse(analysis.analysisData) : null
        }
      });
    } catch (error) {
      console.error("Error storing competitor analysis:", error);
      res.status(500).json({
        error: "Failed to store competitor analysis",
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Get competitor analysis history
  app.get("/api/locations/:locationId/competitor-analysis", async (req, res) => {
    try {
      const { locationId } = req.params;
      const { limit = 10 } = req.query;
      
      if (!locationId) {
        return res.status(400).json({
          error: "Location ID is required",
          details: "Location ID must be provided in the URL path"
        });
      }

      const analyses = await storage.getCompetitorAnalysisByLocation(locationId, { limit: parseInt(limit as string) });
      
      // Parse JSON fields
      const enrichedAnalyses = analyses.map(analysis => ({
        ...analysis,
        analysisData: analysis.analysisData ? JSON.parse(analysis.analysisData) : null
      }));
      
      res.json({ analyses: enrichedAnalyses });
    } catch (error) {
      console.error("Error fetching competitor analysis:", error);
      res.status(500).json({
        error: "Failed to fetch competitor analysis",
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // ===========================================
  // USER PROFILE & AUTHENTICATION ROUTES
  // ===========================================

  // Get user profile
  app.get("/api/users/profile", async (req, res) => {
    try {
      // TODO: Get userId from authentication session
      const userId = req.query.userId as string || "mock-user-id";
      
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({
          error: "User not found",
          details: `User with ID ${userId} does not exist`
        });
      }

      // User type doesn't have password field - it's in a separate auth table
      res.json({ user });
    } catch (error) {
      console.error("Error fetching user profile:", error);
      res.status(500).json({
        error: "Failed to fetch user profile",
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Create user (signup)
  app.post("/api/users/signup", async (req, res) => {
    try {
      const validationResult = insertUserSchema.safeParse(req.body);
      
      if (!validationResult.success) {
        return res.status(400).json({
          error: "Validation failed",
          details: fromZodError(validationResult.error).toString()
        });
      }

      const userData = validationResult.data;

      // Check if username already exists
      const existingUser = await storage.getUserByUsername(userData.username);
      if (existingUser) {
        return res.status(409).json({
          error: "Username already exists",
          details: `User with username ${userData.username} already exists`
        });
      }

      const user = await storage.createUser(userData);
      
      // Don't return password
      const { password, ...userProfile } = user;
      
      res.json({
        message: "User created successfully",
        user: userProfile
      });
    } catch (error) {
      console.error("Error creating user:", error);
      res.status(500).json({
        error: "Failed to create user",
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // ===========================================
  // ADMIN AUTHENTICATION ROUTES
  // ===========================================

  // Admin login
  app.post("/api/admin/login", async (req, res) => {
    try {
      const validationResult = z.object({
        username: z.string(),
        password: z.string()
      }).safeParse(req.body);
      
      if (!validationResult.success) {
        return res.status(400).json({
          error: "Validation failed",
          details: fromZodError(validationResult.error).toString()
        });
      }

      const { username, password } = validationResult.data;

      const adminUser = await storage.getAdminUserByUsername(username);
      
      if (!adminUser || adminUser.passwordHash !== password) { // In production, use proper password hashing
        return res.status(401).json({
          error: "Invalid credentials",
          details: "Username or password is incorrect"
        });
      }

      if (!adminUser.isActive) {
        return res.status(403).json({
          error: "Account disabled",
          details: "Admin account has been disabled"
        });
      }

      // Don't return password
      const { passwordHash: _, ...adminProfile } = adminUser;
      
      res.json({
        message: "Login successful",
        admin: adminProfile,
        // In production, generate and return JWT token
        token: `mock_admin_token_${Date.now()}`
      });
    } catch (error) {
      console.error("Error during admin login:", error);
      res.status(500).json({
        error: "Login failed",
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Get system stats (admin only)
  app.get("/api/admin/stats", async (req, res) => {
    try {
      // TODO: Implement proper admin authentication middleware
      
      const stats = {
        totalUsers: await storage.getUserCount(),
        totalBusinesses: await storage.getBusinessCount(),
        totalLocations: await storage.getLocationCount(),
        activeSubscriptions: await storage.getActiveSubscriptionCount(),
        trialSignups: await storage.getTrialSignupCount(),
        systemHealth: "operational"
      };
      
      res.json({ stats });
    } catch (error) {
      console.error("Error fetching admin stats:", error);
      res.status(500).json({
        error: "Failed to fetch system statistics",
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
