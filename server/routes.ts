import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { openaiService } from "./services/openai";
import { 
  generateSEOContentSchema, 
  generateGMBPostSchema, 
  analyzeCompetitorsSchema 
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
      res.status(500).json({
        error: "Failed to analyze local competitors",
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
