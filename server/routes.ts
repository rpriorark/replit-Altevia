import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { openaiService } from "./services/openai";
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
  bulkApprovePostsSchema,
  generateSeasonalContentSchema
} from "@shared/schema";
import { fromZodError } from "zod-validation-error";

export async function registerRoutes(app: Express): Promise<Server> {
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
            scheduledDate: new Date(post.date).toISOString(),
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
      const validationResult = editPostContentSchema.safeParse(req.body);
      
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

      const updateData = validationResult.data;
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

      const scheduleData = validationResult.data;
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

  const httpServer = createServer(app);

  return httpServer;
}
