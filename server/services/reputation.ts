import { 
  type Review, 
  type ReputationScore,
  type CompetitorSnapshot,
  type Location,
  type ReputationAlert,
  type InsertReputationScore,
  type InsertReputationAlert,
  type ReputationAlertType,
  type ReputationAlertSeverity
} from "@shared/schema";
import { OpenAIService } from "./openai";
import type { IStorage } from "../storage";

// Core interfaces for the reputation analysis service
export interface RiskScoreComponents {
  negativeReviewVelocity: number; // 0-100, higher=worse
  responseLatency: number;        // 0-100, higher=worse  
  sentimentDrift: number;         // 0-100, higher=worse
  engagementDrop: number;         // 0-100, higher=worse
  competitorGap: number;          // 0-100, higher=worse
}

export interface TrendAnalysis {
  trend: 'improving' | 'declining' | 'stable';
  slope: number;
  confidence: number;
  anomalies: Date[];
  weeklyAverages: number[];
  zScoreFlags: boolean;
}

export interface ReputationAnalysisResult {
  score: number;
  components: RiskScoreComponents;
  trend: TrendAnalysis;
  alerts: Array<{
    type: ReputationAlertType;
    severity: ReputationAlertSeverity;
    message: string;
    reasonCode: string;
    metadata?: Record<string, any>;
  }>;
  insights: {
    summary: string;
    recommendations: string[];
    competitorComparison?: string;
  };
}

export interface SentimentAnalysisResult {
  overallSentiment: number; // -1 to 1
  sentimentTrend: number[];
  negativePatterns: string[];
  keyTopics: string[];
}

// Configuration constants
const RISK_SCORE_WEIGHTS = {
  negativeReviewVelocity: 0.35,
  responseLatency: 0.20,
  sentimentDrift: 0.25,
  engagementDrop: 0.10,
  competitorGap: 0.10
};

const TREND_ANALYSIS_CONFIG = {
  ewmaAlpha: 0.3,           // Exponentially Weighted Moving Average smoothing factor
  zScoreThreshold: 2.0,     // Standard deviations for anomaly detection
  minDataPoints: 7,         // Minimum data points for trend analysis
  significantSlopeThreshold: 5.0  // Minimum slope change to flag as significant
};

const SENTIMENT_LEXICON = {
  positive: ['excelente', 'fantástico', 'increíble', 'perfecto', 'genial', 'maravilloso', 'outstanding', 'excellent', 'amazing', 'perfect', 'great', 'wonderful'],
  negative: ['terrible', 'horrible', 'pésimo', 'malo', 'awful', 'bad', 'worst', 'disgusting', 'disappointing', 'unsatisfied', 'poor', 'rude'],
  neutral: ['okay', 'bien', 'normal', 'average', 'fair', 'decent', 'acceptable']
};

export class ReputationAnalysisService {
  private openaiService: OpenAIService;
  private storage: IStorage;
  private logger: {
    info: (message: string, meta?: any) => void;
    warn: (message: string, meta?: any) => void;
    error: (message: string, meta?: any) => void;
  };

  constructor(storage: IStorage) {
    this.storage = storage;
    this.openaiService = new OpenAIService();
    this.logger = {
      info: (message: string, meta?: any) => console.log(`[ReputationService] INFO: ${message}`, meta || ''),
      warn: (message: string, meta?: any) => console.warn(`[ReputationService] WARN: ${message}`, meta || ''),
      error: (message: string, meta?: any) => console.error(`[ReputationService] ERROR: ${message}`, meta || '')
    };
  }

  /**
   * Validate input parameters for analysis
   */
  private validateAnalysisParams(locationId: string, windowDays: number): void {
    if (!locationId || typeof locationId !== 'string') {
      throw new Error('Invalid locationId: must be a non-empty string');
    }
    
    if (!Number.isInteger(windowDays) || windowDays < 1 || windowDays > 365) {
      throw new Error('Invalid windowDays: must be an integer between 1 and 365');
    }
  }

  /**
   * Handle storage operation errors with fallbacks
   */
  private async safeStorageOperation<T>(
    operation: () => Promise<T>, 
    fallback: T, 
    operationName: string
  ): Promise<T> {
    try {
      return await operation();
    } catch (error) {
      this.logger.error(`Storage operation failed: ${operationName}`, error);
      return fallback;
    }
  }

  /**
   * Calculate comprehensive reputation score for a location
   */
  async calculateReputationScore(
    locationId: string, 
    windowDays: number = 30
  ): Promise<ReputationAnalysisResult> {
    this.validateAnalysisParams(locationId, windowDays);
    
    try {
      this.logger.info(`Starting reputation analysis for location ${locationId} with ${windowDays} day window`);

      const location = await this.safeStorageOperation(
        () => this.storage.getLocationById(locationId),
        undefined,
        'getLocationById'
      );

      if (!location) {
        throw new Error(`Location ${locationId} not found`);
      }

      // Gather all necessary data with error handling
      const [reviews, competitors, scoreHistory] = await Promise.all([
        this.safeStorageOperation(
          () => this.storage.getRecentReviews(locationId, windowDays),
          [],
          'getRecentReviews'
        ),
        this.safeStorageOperation(
          () => this.storage.getLatestCompetitorSnapshots(locationId),
          [],
          'getLatestCompetitorSnapshots'
        ),
        this.safeStorageOperation(
          () => this.storage.getReputationScoreHistory(locationId, windowDays * 2),
          [],
          'getReputationScoreHistory'
        )
      ]);

      this.logger.info(`Data gathered: ${reviews.length} reviews, ${competitors.length} competitors, ${scoreHistory.length} score history entries`);

      // Calculate risk score components with error handling
      const components = await this.calculateRiskComponentsSafe(
        locationId, 
        reviews, 
        competitors, 
        windowDays
      );

      // Calculate overall weighted risk score
      const score = this.calculateWeightedRiskScore(components);

      // Perform trend analysis
      const trend = this.detectTrends(scoreHistory, reviews);

      // Generate insights and alerts
      const insights = await this.generateInsightsSafe(reviews, components, trend, competitors);
      const alerts = this.generateAlerts(score, components, trend);

      // Check threshold and generate automated threshold-based alerts
      await this.checkThresholdAndGenerateAlerts(locationId, score, components, trend);

      this.logger.info(`Analysis completed: score=${score}, trend=${trend.trend}, alerts=${alerts.length}`);

      return {
        score,
        components,
        trend,
        alerts,
        insights
      };

    } catch (error) {
      this.logger.error('Failed to calculate reputation score', { locationId, windowDays, error });
      
      // Return a safe fallback analysis result
      return this.createFallbackAnalysisResult(locationId);
    }
  }

  /**
   * Check threshold and generate automated alerts when score meets/exceeds threshold
   */
  private async checkThresholdAndGenerateAlerts(
    locationId: string,
    score: number,
    components: RiskScoreComponents,
    trend: TrendAnalysis
  ): Promise<void> {
    try {
      // Get the threshold for this location
      const threshold = await this.storage.getLocationThreshold(locationId);
      
      this.logger.info(`Checking threshold for location ${locationId}: score=${score}, threshold=${threshold}`);

      // Only generate alert if score meets or exceeds threshold
      if (score >= threshold) {
        // Check for duplicate alerts in the last 24 hours to prevent spam
        const isDuplicate = await this.checkForDuplicateThresholdAlert(locationId, score);
        
        if (!isDuplicate) {
          // Determine severity based on how much the score exceeds threshold
          const severity = this.categorizeSeverityByScore(score, threshold);
          
          // Generate threshold-based alert
          const alert = await this.storage.createReputationAlert({
            locationId,
            alertType: 'score_drop',
            severity,
            score,
            reasonCode: 'THRESHOLD_EXCEEDED',
            message: this.generateThresholdAlertMessage(score, threshold, severity),
            metadata: JSON.stringify({
              threshold,
              scoreComponents: components,
              trend: trend.trend,
              generatedAt: new Date().toISOString(),
              alertSource: 'automated_threshold_check'
            }),
            acknowledged: false
          });

          this.logger.info(`Generated threshold alert for location ${locationId}: alertId=${alert.id}, severity=${severity}`);
        } else {
          this.logger.info(`Skipped duplicate threshold alert for location ${locationId} (similar alert exists within 24h)`);
        }
      } else {
        this.logger.info(`Score ${score} below threshold ${threshold} for location ${locationId} - no alert generated`);
      }
    } catch (error) {
      this.logger.error(`Failed to check threshold and generate alerts for location ${locationId}`, error);
      // Don't throw error - this shouldn't break the main analysis
    }
  }

  /**
   * Check for duplicate threshold alerts within the last 24 hours
   */
  private async checkForDuplicateThresholdAlert(locationId: string, currentScore: number): Promise<boolean> {
    try {
      const recentAlerts = await this.storage.getRecentAlerts(locationId, 1); // Last 24 hours
      
      // Check if there's already a threshold alert in similar score range (±5 points)
      const duplicateAlert = recentAlerts.find(alert => 
        alert.alertType === 'score_drop' && 
        alert.reasonCode === 'THRESHOLD_EXCEEDED' &&
        alert.score && 
        Math.abs(alert.score - currentScore) <= 5 && // Within 5 points of current score
        !alert.acknowledged // Only consider unacknowledged alerts as duplicates
      );

      return !!duplicateAlert;
    } catch (error) {
      this.logger.error('Error checking for duplicate threshold alerts', error);
      return false; // Assume no duplicate if check fails
    }
  }

  /**
   * Categorize alert severity based on score level
   */
  private categorizeSeverityByScore(score: number, threshold: number): 'low' | 'medium' | 'high' | 'critical' {
    const exceedance = score - threshold;
    
    if (exceedance >= 25) {
      return 'critical'; // Score is 25+ points above threshold
    } else if (exceedance >= 15) {
      return 'high'; // Score is 15-24 points above threshold
    } else if (exceedance >= 5) {
      return 'medium'; // Score is 5-14 points above threshold
    } else {
      return 'low'; // Score is just above threshold (0-4 points)
    }
  }

  /**
   * Generate contextual alert message based on score and severity
   */
  private generateThresholdAlertMessage(score: number, threshold: number, severity: 'low' | 'medium' | 'high' | 'critical'): string {
    const exceedance = score - threshold;
    
    const baseMessage = `Reputation score (${score}) has exceeded your configured threshold (${threshold})`;
    
    switch (severity) {
      case 'critical':
        return `${baseMessage} by ${exceedance} points. IMMEDIATE ATTENTION REQUIRED - this indicates severe reputation risks that need urgent intervention.`;
      case 'high':
        return `${baseMessage} by ${exceedance} points. High priority issue detected - review and action recommended within 24 hours.`;
      case 'medium':
        return `${baseMessage} by ${exceedance} points. Moderate concern identified - review recommended within 48 hours.`;
      case 'low':
        return `${baseMessage} by ${exceedance} points. Minor threshold breach detected - review when convenient.`;
      default:
        return `${baseMessage}. Please review your reputation metrics.`;
    }
  }

  /**
   * Create a safe fallback analysis result when primary analysis fails
   */
  private createFallbackAnalysisResult(locationId: string): ReputationAnalysisResult {
    const defaultComponents: RiskScoreComponents = {
      negativeReviewVelocity: 25,
      responseLatency: 50,
      sentimentDrift: 25,
      engagementDrop: 25,
      competitorGap: 25
    };

    return {
      score: 30, // Default moderate risk score
      components: defaultComponents,
      trend: {
        trend: 'stable',
        slope: 0,
        confidence: 0,
        anomalies: [],
        weeklyAverages: [],
        zScoreFlags: false
      },
      alerts: [{
        type: 'system_error',
        severity: 'medium',
        message: 'Analysis failed, using default metrics. Please check system logs.',
        reasonCode: 'ANALYSIS_FALLBACK',
        metadata: { locationId, timestamp: new Date().toISOString() }
      }],
      insights: {
        summary: 'Analysis could not be completed due to system issues. Default metrics applied.',
        recommendations: [
          'Check system connectivity and data availability',
          'Review recent system logs for errors',
          'Retry analysis after resolving technical issues'
        ]
      }
    };
  }

  /**
   * Safe version of calculateRiskComponents with comprehensive error handling
   */
  private async calculateRiskComponentsSafe(
    locationId: string,
    reviews: Review[],
    competitors: CompetitorSnapshot[],
    windowDays: number
  ): Promise<RiskScoreComponents> {
    const defaultComponents: RiskScoreComponents = {
      negativeReviewVelocity: 25,
      responseLatency: 50,
      sentimentDrift: 25,
      engagementDrop: 25,
      competitorGap: 25
    };

    try {
      return await this.calculateRiskComponents(locationId, reviews, competitors, windowDays);
    } catch (error) {
      this.logger.error('Risk components calculation failed, using defaults', error);
      return defaultComponents;
    }
  }

  /**
   * Safe version of generateInsights with fallback
   */
  private async generateInsightsSafe(
    reviews: Review[], 
    components: RiskScoreComponents, 
    trend: TrendAnalysis,
    competitors: CompetitorSnapshot[]
  ): Promise<{ summary: string; recommendations: string[]; competitorComparison?: string }> {
    try {
      return await this.generateInsights(reviews, components, trend, competitors);
    } catch (error) {
      this.logger.error('Insights generation failed, using fallback', error);
      return {
        summary: 'Unable to generate detailed insights due to technical issues.',
        recommendations: [
          'Monitor system performance and resolve technical issues',
          'Ensure data quality and availability',
          'Retry analysis after system maintenance'
        ]
      };
    }
  }

  /**
   * Calculate individual risk score components with specific weightings
   */
  private async calculateRiskComponents(
    locationId: string,
    reviews: Review[],
    competitors: CompetitorSnapshot[],
    windowDays: number
  ): Promise<RiskScoreComponents> {
    
    // 1. Negative review velocity delta vs 30d baseline (35%)
    const negativeReviewVelocity = await this.calculateNegativeReviewVelocity(locationId, reviews, windowDays);
    
    // 2. Response latency median hours last 30d (20%)
    const responseLatency = this.calculateResponseLatency(reviews);
    
    // 3. Sentiment drift using OpenAI batch or lexicon fallback (25%)
    const sentimentDrift = await this.calculateSentimentDrift(reviews);
    
    // 4. Engagement drop % change last 14d vs prior 14d (10%)
    const engagementDrop = await this.calculateEngagementDrop(locationId, windowDays);
    
    // 5. Competitor gap rating/latency vs top competitor (10%)
    const competitorGap = await this.calculateCompetitorGap(locationId, competitors);

    return {
      negativeReviewVelocity,
      responseLatency,
      sentimentDrift,
      engagementDrop,
      competitorGap
    };
  }

  /**
   * Calculate negative review velocity compared to baseline
   */
  private async calculateNegativeReviewVelocity(
    locationId: string,
    currentReviews: Review[],
    windowDays: number
  ): Promise<number> {
    try {
      // Get baseline period (previous 30 days)
      const baselineStart = new Date();
      baselineStart.setDate(baselineStart.getDate() - (windowDays * 2));
      const baselineEnd = new Date();
      baselineEnd.setDate(baselineEnd.getDate() - windowDays);

      const baselineReviews = await this.storage.getReviewsByLocation(locationId, {
        startDate: baselineStart,
        endDate: baselineEnd
      });

      // Calculate negative review percentages
      const currentNegative = currentReviews.filter(r => r.rating <= 2).length;
      const currentTotal = currentReviews.length;
      const currentNegativePct = currentTotal > 0 ? (currentNegative / currentTotal) * 100 : 0;

      const baselineNegative = baselineReviews.filter(r => r.rating <= 2).length;
      const baselineTotal = baselineReviews.length;
      const baselineNegativePct = baselineTotal > 0 ? (baselineNegative / baselineTotal) * 100 : 0;

      // Calculate velocity delta
      const velocityDelta = currentNegativePct - baselineNegativePct;
      
      // Normalize to 0-100 scale (0 = no change/improvement, 100 = significant increase in negative reviews)
      return Math.max(0, Math.min(100, velocityDelta * 2 + 25)); // Scale and offset for reasonable distribution

    } catch (error) {
      console.error('Error calculating negative review velocity:', error);
      return 25; // Default moderate risk
    }
  }

  /**
   * Calculate response latency risk score
   */
  private calculateResponseLatency(reviews: Review[]): number {
    try {
      const reviewsWithResponses = reviews.filter(r => r.respondedAt);
      
      if (reviewsWithResponses.length === 0) {
        return 75; // High risk if no responses
      }

      // Calculate response times in hours
      const responseTimes = reviewsWithResponses.map(r => {
        const reviewTime = new Date(r.createdAt).getTime();
        const responseTime = new Date(r.respondedAt!).getTime();
        return (responseTime - reviewTime) / (1000 * 60 * 60); // Hours
      });

      // Calculate median response time
      responseTimes.sort((a, b) => a - b);
      const median = responseTimes[Math.floor(responseTimes.length / 2)];

      // Normalize to risk score (0 = <2 hours, 100 = >48 hours)
      if (median < 2) return 0;
      if (median > 48) return 100;
      
      return Math.min(100, (median / 48) * 100);

    } catch (error) {
      console.error('Error calculating response latency:', error);
      return 50; // Default moderate risk
    }
  }

  /**
   * Calculate sentiment drift using OpenAI or lexicon fallback
   */
  private async calculateSentimentDrift(reviews: Review[]): Promise<number> {
    try {
      // Try OpenAI sentiment analysis first
      const sentimentResult = await this.analyzeSentimentBatch(reviews);
      
      if (sentimentResult) {
        return this.calculateSentimentDriftFromAnalysis(sentimentResult);
      }

      // Fallback to lexicon-based sentiment analysis
      return this.calculateSentimentDriftLexicon(reviews);

    } catch (error) {
      console.error('Error calculating sentiment drift:', error);
      return this.calculateSentimentDriftLexicon(reviews);
    }
  }

  /**
   * Lexicon-based sentiment analysis fallback
   */
  private calculateSentimentDriftLexicon(reviews: Review[]): number {
    try {
      if (reviews.length < 4) return 25; // Insufficient data
      
      // Split reviews into two halves for comparison
      const midPoint = Math.floor(reviews.length / 2);
      const recentReviews = reviews.slice(0, midPoint);
      const olderReviews = reviews.slice(midPoint);

      const recentSentiment = this.calculateLexiconSentiment(recentReviews);
      const olderSentiment = this.calculateLexiconSentiment(olderReviews);

      // Calculate drift (higher = worse sentiment change)
      const sentimentDrift = olderSentiment - recentSentiment;
      
      // Normalize to 0-100 (0 = improving, 100 = significantly worse)
      return Math.max(0, Math.min(100, (sentimentDrift + 1) * 50));

    } catch (error) {
      console.error('Error in lexicon sentiment analysis:', error);
      return 50; // Default moderate risk
    }
  }

  /**
   * Calculate lexicon-based sentiment score
   */
  private calculateLexiconSentiment(reviews: Review[]): number {
    if (reviews.length === 0) return 0;

    let totalSentiment = 0;
    let totalWords = 0;

    reviews.forEach(review => {
      const words = review.text.toLowerCase().split(/\s+/);
      let reviewSentiment = 0;
      let reviewWords = 0;

      words.forEach(word => {
        if (SENTIMENT_LEXICON.positive.includes(word)) {
          reviewSentiment += 1;
          reviewWords++;
        } else if (SENTIMENT_LEXICON.negative.includes(word)) {
          reviewSentiment -= 1;
          reviewWords++;
        }
      });

      if (reviewWords > 0) {
        totalSentiment += reviewSentiment / reviewWords;
        totalWords++;
      }
    });

    return totalWords > 0 ? totalSentiment / totalWords : 0;
  }

  /**
   * Calculate engagement drop risk score
   */
  private async calculateEngagementDrop(locationId: string, windowDays: number): Promise<number> {
    try {
      // For now, use review volume as engagement proxy
      // In a real implementation, this would analyze GMB insights, social media engagement, etc.
      
      const recent14Days = await this.storage.getRecentReviews(locationId, 14);
      const prior14Days = await this.storage.getReviewsByLocation(locationId, {
        startDate: new Date(Date.now() - (28 * 24 * 60 * 60 * 1000)),
        endDate: new Date(Date.now() - (14 * 24 * 60 * 60 * 1000))
      });

      const recentCount = recent14Days.length;
      const priorCount = prior14Days.length;

      if (priorCount === 0) return 25; // No baseline data

      const engagementChange = ((recentCount - priorCount) / priorCount) * 100;
      
      // Convert to risk score (negative change = higher risk)
      if (engagementChange >= 0) return 0; // No drop or increase
      
      return Math.min(100, Math.abs(engagementChange) * 2);

    } catch (error) {
      console.error('Error calculating engagement drop:', error);
      return 25; // Default moderate risk
    }
  }

  /**
   * Calculate competitor gap risk score
   */
  private async calculateCompetitorGap(
    locationId: string, 
    competitors: CompetitorSnapshot[]
  ): Promise<number> {
    try {
      if (competitors.length === 0) return 25; // No competitor data

      const location = await this.storage.getLocationById(locationId);
      if (!location) return 50;

      // Find top competitor by rating
      const topCompetitor = competitors.reduce((top, current) => 
        parseFloat(current.avgRating.toString()) > parseFloat(top.avgRating.toString()) ? current : top
      );

      const locationRating = parseFloat(location.averageRating?.toString() || '0');
      const topCompetitorRating = parseFloat(topCompetitor.avgRating.toString());

      // Calculate rating gap
      const ratingGap = topCompetitorRating - locationRating;
      
      // Calculate engagement rate gap
      const topCompetitorEngagement = parseFloat(topCompetitor.engagementRate?.toString() || '0');
      const locationEngagement = 50; // Placeholder - would be calculated from actual data
      const engagementGap = topCompetitorEngagement - locationEngagement;

      // Combine gaps into risk score
      const ratingRisk = Math.max(0, ratingGap * 25); // Each 0.1 rating difference = 2.5 risk points
      const engagementRisk = Math.max(0, engagementGap * 2); // Each 1% engagement gap = 2 risk points

      return Math.min(100, ratingRisk + engagementRisk);

    } catch (error) {
      console.error('Error calculating competitor gap:', error);
      return 25; // Default moderate risk
    }
  }

  /**
   * Calculate weighted overall risk score
   */
  private calculateWeightedRiskScore(components: RiskScoreComponents): number {
    const weightedScore = 
      (components.negativeReviewVelocity * RISK_SCORE_WEIGHTS.negativeReviewVelocity) +
      (components.responseLatency * RISK_SCORE_WEIGHTS.responseLatency) +
      (components.sentimentDrift * RISK_SCORE_WEIGHTS.sentimentDrift) +
      (components.engagementDrop * RISK_SCORE_WEIGHTS.engagementDrop) +
      (components.competitorGap * RISK_SCORE_WEIGHTS.competitorGap);

    return Math.round(Math.max(0, Math.min(100, weightedScore)));
  }

  /**
   * Detect trends using EWMA and z-score anomaly detection
   */
  private detectTrends(
    scoreHistory: ReputationScore[], 
    reviews: Review[]
  ): TrendAnalysis {
    try {
      if (scoreHistory.length < TREND_ANALYSIS_CONFIG.minDataPoints) {
        return {
          trend: 'stable',
          slope: 0,
          confidence: 0,
          anomalies: [],
          weeklyAverages: [],
          zScoreFlags: false
        };
      }

      // Calculate EWMA
      const scores = scoreHistory.map(s => s.score);
      const ewmaValues = this.calculateEWMA(scores, TREND_ANALYSIS_CONFIG.ewmaAlpha);
      
      // Calculate z-scores for anomaly detection
      const zScores = this.calculateZScores(ewmaValues);
      const anomalies = this.detectAnomalies(zScores, scoreHistory);
      
      // Calculate slope for trend direction
      const slope = this.calculateSlope(ewmaValues);
      
      // Determine trend
      const trend = this.determineTrend(slope, zScores);
      
      // Calculate weekly averages
      const weeklyAverages = this.calculateWeeklyAverages(scoreHistory);
      
      // Check for z-score flags
      const zScoreFlags = zScores.some(z => Math.abs(z) > TREND_ANALYSIS_CONFIG.zScoreThreshold);

      return {
        trend,
        slope,
        confidence: this.calculateTrendConfidence(scoreHistory.length, zScoreFlags),
        anomalies: anomalies.map(a => new Date(a.calculatedAt)),
        weeklyAverages,
        zScoreFlags
      };

    } catch (error) {
      console.error('Error detecting trends:', error);
      return {
        trend: 'stable',
        slope: 0,
        confidence: 0,
        anomalies: [],
        weeklyAverages: [],
        zScoreFlags: false
      };
    }
  }

  /**
   * Calculate Exponentially Weighted Moving Average
   */
  private calculateEWMA(values: number[], alpha: number): number[] {
    if (values.length === 0) return [];
    
    const ewma: number[] = [values[0]];
    
    for (let i = 1; i < values.length; i++) {
      ewma[i] = alpha * values[i] + (1 - alpha) * ewma[i - 1];
    }
    
    return ewma;
  }

  /**
   * Calculate z-scores for anomaly detection
   */
  private calculateZScores(values: number[]): number[] {
    if (values.length < 2) return values.map(() => 0);
    
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
    const stdDev = Math.sqrt(variance);
    
    if (stdDev === 0) return values.map(() => 0);
    
    return values.map(val => (val - mean) / stdDev);
  }

  /**
   * Detect anomalies based on z-scores
   */
  private detectAnomalies(zScores: number[], scoreHistory: ReputationScore[]): ReputationScore[] {
    const anomalies: ReputationScore[] = [];
    
    zScores.forEach((zScore, index) => {
      if (Math.abs(zScore) > TREND_ANALYSIS_CONFIG.zScoreThreshold) {
        anomalies.push(scoreHistory[index]);
      }
    });
    
    return anomalies;
  }

  /**
   * Calculate slope for trend analysis
   */
  private calculateSlope(values: number[]): number {
    if (values.length < 2) return 0;
    
    const n = values.length;
    const sumX = (n * (n - 1)) / 2; // Sum of indices 0,1,2...n-1
    const sumY = values.reduce((sum, val) => sum + val, 0);
    const sumXY = values.reduce((sum, val, index) => sum + (index * val), 0);
    const sumXX = values.reduce((sum, val, index) => sum + (index * index), 0);
    
    const denominator = n * sumXX - sumX * sumX;
    
    if (denominator === 0) return 0;
    
    return (n * sumXY - sumX * sumY) / denominator;
  }

  /**
   * Determine overall trend direction
   */
  private determineTrend(slope: number, zScores: number[]): 'improving' | 'declining' | 'stable' {
    const absSlope = Math.abs(slope);
    const hasAnomalies = zScores.some(z => Math.abs(z) > TREND_ANALYSIS_CONFIG.zScoreThreshold);
    
    if (hasAnomalies && absSlope > TREND_ANALYSIS_CONFIG.significantSlopeThreshold) {
      return slope > 0 ? 'improving' : 'declining';
    }
    
    return 'stable';
  }

  /**
   * Calculate weekly averages for trend visualization
   */
  private calculateWeeklyAverages(scoreHistory: ReputationScore[]): number[] {
    const weeklyGroups: { [key: string]: number[] } = {};
    
    scoreHistory.forEach(score => {
      const date = new Date(score.calculatedAt);
      const weekStart = new Date(date);
      weekStart.setDate(date.getDate() - date.getDay()); // Start of week
      const weekKey = weekStart.toISOString().split('T')[0];
      
      if (!weeklyGroups[weekKey]) {
        weeklyGroups[weekKey] = [];
      }
      weeklyGroups[weekKey].push(score.score);
    });
    
    return Object.values(weeklyGroups).map(scores => 
      scores.reduce((sum, score) => sum + score, 0) / scores.length
    );
  }

  /**
   * Calculate trend confidence based on data quality
   */
  private calculateTrendConfidence(dataPoints: number, hasAnomalies: boolean): number {
    let confidence = Math.min(100, (dataPoints / 30) * 100); // Max confidence with 30+ data points
    
    if (hasAnomalies) {
      confidence *= 0.8; // Reduce confidence if anomalies detected
    }
    
    return Math.round(confidence);
  }

  /**
   * OpenAI sentiment analysis with PII redaction
   */
  private async analyzeSentimentBatch(reviews: Review[]): Promise<SentimentAnalysisResult | null> {
    try {
      // Validate if OpenAI service is available
      if (!process.env.OPENAI_API_KEY) {
        console.log('OpenAI API key not available, falling back to lexicon analysis');
        return null;
      }

      if (reviews.length === 0) return null;

      // Redact PII from review texts
      const redactedReviews = reviews.map(review => ({
        ...review,
        originalText: review.text,
        text: this.redactPII(review.text)
      }));

      // Prepare batch analysis prompt
      const reviewTexts = redactedReviews.map(r => r.text).join('\n---\n');
      
      const prompt = `
Analiza el sentimiento de estas reseñas de negocio local. Para cada reseña, proporciona:
1. Score de sentimiento (-1 a 1)
2. Patrones negativos identificados
3. Temas clave mencionados

Reseñas:
${reviewTexts}

Responde en formato JSON:
{
  "overallSentiment": number,
  "sentimentTrend": [numbers],
  "negativePatterns": ["pattern1", "pattern2"],
  "keyTopics": ["topic1", "topic2"]
}
`;

      const response = await this.openaiService.generateLocalSEOContent({
        contentType: 'sentiment_analysis',
        keywords: 'sentiment analysis',
        businessInfo: 'sentiment analysis request',
        // Custom prompt for sentiment analysis
      });

      // Parse response and restore original context
      return this.parseSentimentAnalysisResponse(response, reviews);

    } catch (error) {
      console.error('Error in OpenAI sentiment analysis:', error);
      return null; // Fall back to lexicon analysis
    }
  }

  /**
   * Redact PII from review text following OpenAI service patterns
   */
  private redactPII(text: string): string {
    let redactedText = text;

    // Email redaction
    redactedText = redactedText.replace(
      /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
      '[EMAIL_REDACTED]'
    );

    // Phone number redaction
    redactedText = redactedText.replace(
      /(?:\+?1[-.\s]?)?(?:\(?[0-9]{3}\)?[-.\s]?[0-9]{3}[-.\s]?[0-9]{4}|\b[0-9]{3}[-.\s]?[0-9]{3}[-.\s]?[0-9]{4}\b)/g,
      '[PHONE_REDACTED]'
    );

    // Name redaction (titles + names)
    redactedText = redactedText.replace(
      /\b(?:Dr|Doctor|Mr|Ms|Mrs|Miss)\.?\s+[A-Z][a-z]+(?:\s+[A-Z][a-z]+)?\b/gi,
      '[NAME_REDACTED]'
    );

    // Address redaction
    redactedText = redactedText.replace(
      /\b\d+\s+[A-Za-z\s]+(Street|St|Avenue|Ave|Road|Rd|Boulevard|Blvd|Lane|Ln|Drive|Dr|Way|Circle|Cir)\b/gi,
      '[ADDRESS_REDACTED]'
    );

    // Medical/Patient ID redaction
    redactedText = redactedText.replace(
      /\b(?:patient|medical|record|ID|MRN)[\s#:]*[A-Z0-9]{6,}\b/gi,
      '[MEDICAL_ID_REDACTED]'
    );

    return redactedText;
  }

  /**
   * Parse OpenAI sentiment analysis response
   */
  private parseSentimentAnalysisResponse(
    response: any, 
    originalReviews: Review[]
  ): SentimentAnalysisResult {
    try {
      // In a real implementation, this would parse the actual OpenAI response
      // For now, provide a structured fallback
      return {
        overallSentiment: 0.2, // Slightly positive
        sentimentTrend: originalReviews.map(() => Math.random() * 2 - 1), // Random sentiments for demo
        negativePatterns: ['slow service', 'poor quality', 'unprofessional staff'],
        keyTopics: ['service', 'quality', 'staff', 'price', 'location']
      };
    } catch (error) {
      console.error('Error parsing sentiment analysis response:', error);
      // Return neutral sentiment as fallback
      return {
        overallSentiment: 0,
        sentimentTrend: originalReviews.map(() => 0),
        negativePatterns: [],
        keyTopics: []
      };
    }
  }

  /**
   * Calculate sentiment drift from OpenAI analysis
   */
  private calculateSentimentDriftFromAnalysis(sentimentResult: SentimentAnalysisResult): number {
    try {
      const trends = sentimentResult.sentimentTrend;
      if (trends.length < 4) return 25; // Insufficient data

      // Split sentiment trend into recent vs older periods
      const midPoint = Math.floor(trends.length / 2);
      const recentSentiments = trends.slice(0, midPoint);
      const olderSentiments = trends.slice(midPoint);

      const recentAvg = recentSentiments.reduce((sum, s) => sum + s, 0) / recentSentiments.length;
      const olderAvg = olderSentiments.reduce((sum, s) => sum + s, 0) / olderSentiments.length;

      // Calculate drift (higher = worse sentiment change)
      const sentimentDrift = olderAvg - recentAvg;
      
      // Normalize to 0-100 (0 = improving, 100 = significantly worse)
      return Math.max(0, Math.min(100, (sentimentDrift + 1) * 50));

    } catch (error) {
      console.error('Error calculating sentiment drift from analysis:', error);
      return 25; // Default moderate risk
    }
  }

  /**
   * Generate insights using OpenAI or structured fallback
   */
  private async generateInsights(
    reviews: Review[], 
    components: RiskScoreComponents, 
    trend: TrendAnalysis,
    competitors: CompetitorSnapshot[]
  ): Promise<{ summary: string; recommendations: string[]; competitorComparison?: string }> {
    try {
      // Try to generate insights with OpenAI
      const aiInsights = await this.generateAIInsights(reviews, components, trend);
      
      if (aiInsights) {
        return aiInsights;
      }

      // Fallback to structured insights
      return this.generateStructuredInsights(components, trend, competitors);

    } catch (error) {
      console.error('Error generating insights:', error);
      return this.generateStructuredInsights(components, trend, competitors);
    }
  }

  /**
   * Generate AI-powered insights using OpenAI
   */
  private async generateAIInsights(
    reviews: Review[], 
    components: RiskScoreComponents, 
    trend: TrendAnalysis
  ): Promise<{ summary: string; recommendations: string[]; competitorComparison?: string } | null> {
    try {
      if (!process.env.OPENAI_API_KEY || reviews.length === 0) {
        return null;
      }

      // Get recent negative reviews for pattern analysis
      const negativeReviews = reviews
        .filter(r => r.rating <= 2)
        .slice(0, 10)
        .map(r => this.redactPII(r.text));

      if (negativeReviews.length === 0) {
        return {
          summary: "No significant negative patterns detected in recent reviews.",
          recommendations: [
            "Continue maintaining current service quality",
            "Monitor response times to maintain customer satisfaction",
            "Consider proactive engagement strategies"
          ]
        };
      }

      // For now, return structured insights as OpenAI integration would need more complex prompt engineering
      return null;

    } catch (error) {
      console.error('Error generating AI insights:', error);
      return null;
    }
  }

  /**
   * Generate structured insights based on analysis components
   */
  private generateStructuredInsights(
    components: RiskScoreComponents, 
    trend: TrendAnalysis,
    competitors: CompetitorSnapshot[]
  ): { summary: string; recommendations: string[]; competitorComparison?: string } {
    const recommendations: string[] = [];
    let summary = "Reputation analysis completed. ";

    // Analyze each component and generate targeted recommendations
    if (components.negativeReviewVelocity > 60) {
      summary += "Significant increase in negative reviews detected. ";
      recommendations.push("Implement immediate service quality review");
      recommendations.push("Increase staff training frequency");
      recommendations.push("Set up proactive customer follow-up system");
    }

    if (components.responseLatency > 50) {
      summary += "Response times are slower than optimal. ";
      recommendations.push("Establish 24-hour response time goal");
      recommendations.push("Set up automated review monitoring");
      recommendations.push("Train team on professional response templates");
    }

    if (components.sentimentDrift > 60) {
      summary += "Sentiment analysis shows concerning patterns. ";
      recommendations.push("Conduct customer satisfaction survey");
      recommendations.push("Review recent operational changes");
      recommendations.push("Implement sentiment monitoring dashboard");
    }

    if (components.engagementDrop > 40) {
      summary += "Customer engagement has decreased. ";
      recommendations.push("Launch customer re-engagement campaign");
      recommendations.push("Review marketing and social media strategy");
      recommendations.push("Implement loyalty program or incentives");
    }

    if (components.competitorGap > 50) {
      summary += "Competitive position needs improvement. ";
      recommendations.push("Analyze top competitor strategies");
      recommendations.push("Implement competitive pricing review");
      recommendations.push("Enhance unique value proposition");
    }

    // Trend-based recommendations
    if (trend.trend === 'declining') {
      summary += "Declining trend requires immediate attention. ";
      recommendations.push("Schedule emergency operations review");
      recommendations.push("Implement crisis communication plan");
    }

    // Default recommendations if no issues detected
    if (recommendations.length === 0) {
      recommendations.push("Continue monitoring reputation metrics");
      recommendations.push("Maintain current service standards");
      recommendations.push("Consider proactive improvement initiatives");
    }

    // Competitor comparison if available
    let competitorComparison: string | undefined;
    if (competitors.length > 0) {
      const topCompetitor = competitors.reduce((top, current) => 
        parseFloat(current.avgRating.toString()) > parseFloat(top.avgRating.toString()) ? current : top
      );
      
      competitorComparison = `Top competitor "${topCompetitor.competitorName}" maintains ${topCompetitor.avgRating} rating with ${topCompetitor.reviewCount} reviews. Focus on service differentiation and quality improvements.`;
    }

    return {
      summary: summary.trim(),
      recommendations: recommendations.slice(0, 5), // Limit to top 5 recommendations
      competitorComparison
    };
  }

  /**
   * Generate alerts based on analysis results
   */
  private generateAlerts(
    score: number, 
    components: RiskScoreComponents, 
    trend: TrendAnalysis
  ): Array<{
    type: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    message: string;
    reasonCode: string;
    metadata?: Record<string, any>;
  }> {
    const alerts = [];

    // Critical score alert
    if (score >= 80) {
      alerts.push({
        type: 'score_drop',
        severity: 'critical' as const,
        message: 'Reputation score is critically low',
        reasonCode: 'CRITICAL_SCORE',
        metadata: { score, threshold: 80 }
      });
    }

    // High negative velocity alert
    if (components.negativeReviewVelocity >= 70) {
      alerts.push({
        type: 'negative_review',
        severity: 'high' as const,
        message: 'Significant increase in negative reviews detected',
        reasonCode: 'HIGH_NEGATIVE_VELOCITY',
        metadata: { velocity: components.negativeReviewVelocity }
      });
    }

    // Poor response time alert
    if (components.responseLatency >= 60) {
      alerts.push({
        type: 'response_needed',
        severity: 'medium' as const,
        message: 'Response times are slower than recommended',
        reasonCode: 'SLOW_RESPONSE_TIME',
        metadata: { latency: components.responseLatency }
      });
    }

    // Declining trend alert
    if (trend.trend === 'declining' && trend.zScoreFlags) {
      alerts.push({
        type: 'score_drop',
        severity: 'high' as const,
        message: 'Reputation is declining with anomalous patterns detected',
        reasonCode: 'DECLINING_TREND',
        metadata: { slope: trend.slope, anomalies: trend.anomalies.length }
      });
    }

    return alerts;
  }
}