import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { openaiService } from "./services/openai";
import { 
  generateSEOContentSchema, 
  generateGMBPostSchema, 
  analyzeCompetitorsSchema,
  generateReviewResponseSchema,
  detectConflictiveReviewSchema
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

  const httpServer = createServer(app);

  return httpServer;
}
