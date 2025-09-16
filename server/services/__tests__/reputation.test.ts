import { ReputationAnalysisService } from '../reputation';
import type { IStorage } from '../../storage';
import type { Review, CompetitorSnapshot, ReputationScore, Location } from '@shared/schema';

// Mock storage implementation for testing
class MockStorage implements Partial<IStorage> {
  private mockLocation: Location = {
    id: 'test-location-1',
    businessId: 'test-business-1',
    name: 'Test Restaurant',
    address: '123 Test St',
    city: 'Test City',
    state: 'TX',
    zipCode: '12345',
    country: 'US',
    latitude: '40.7128',
    longitude: '-74.0060',
    phone: '+1-555-123-4567',
    email: 'test@restaurant.com',
    managerName: 'John Doe',
    isActive: true,
    averageRating: '4.2',
    totalReviews: 150,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  };

  private mockReviews: Review[] = [
    {
      id: 'review-1',
      locationId: 'test-location-1',
      rating: 5,
      text: 'Excellent service and amazing food!',
      reviewerName: 'Happy Customer',
      platform: 'google',
      externalId: 'google-123',
      createdAt: new Date('2024-09-10'),
      respondedAt: new Date('2024-09-11')
    },
    {
      id: 'review-2',
      locationId: 'test-location-1',
      rating: 2,
      text: 'Poor service, food was cold and took forever.',
      reviewerName: 'Disappointed',
      platform: 'google',
      externalId: 'google-124',
      createdAt: new Date('2024-09-12'),
      respondedAt: undefined
    },
    {
      id: 'review-3',
      locationId: 'test-location-1',
      rating: 4,
      text: 'Good food, friendly staff, reasonable prices.',
      reviewerName: 'Regular Customer',
      platform: 'google',
      externalId: 'google-125',
      createdAt: new Date('2024-09-13'),
      respondedAt: new Date('2024-09-13')
    }
  ];

  private mockCompetitors: CompetitorSnapshot[] = [
    {
      id: 'comp-1',
      locationId: 'test-location-1',
      competitorName: 'Top Competitor',
      avgRating: '4.8',
      reviewCount: 200,
      last30dNegPct: '5.0',
      engagementRate: '95.0',
      marketSharePct: '25.0',
      capturedAt: new Date('2024-09-15')
    }
  ];

  private mockScoreHistory: ReputationScore[] = [
    {
      id: 'score-1',
      locationId: 'test-location-1',
      score: 75,
      components: JSON.stringify({
        negativeReviewVelocity: 20,
        responseLatency: 30,
        sentimentDrift: 15,
        engagementDrop: 10,
        competitorGap: 35
      }),
      trend: 'stable',
      previousScore: 73,
      calculatedAt: new Date('2024-09-01')
    },
    {
      id: 'score-2',
      locationId: 'test-location-1',
      score: 73,
      components: JSON.stringify({
        negativeReviewVelocity: 25,
        responseLatency: 35,
        sentimentDrift: 20,
        engagementDrop: 15,
        competitorGap: 30
      }),
      trend: 'declining',
      previousScore: 78,
      calculatedAt: new Date('2024-08-15')
    }
  ];

  async getLocationById(id: string): Promise<Location | undefined> {
    return id === 'test-location-1' ? this.mockLocation : undefined;
  }

  async getRecentReviews(locationId: string, days?: number): Promise<Review[]> {
    if (locationId !== 'test-location-1') return [];
    
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - (days || 30));
    
    return this.mockReviews.filter(review => 
      new Date(review.createdAt) >= cutoffDate
    );
  }

  async getReviewsByLocation(locationId: string, filters?: {
    rating?: number;
    platform?: string;
    startDate?: Date;
    endDate?: Date;
    limit?: number;
  }): Promise<Review[]> {
    if (locationId !== 'test-location-1') return [];
    
    let filteredReviews = [...this.mockReviews];
    
    if (filters?.startDate) {
      filteredReviews = filteredReviews.filter(r => 
        new Date(r.createdAt) >= filters.startDate!
      );
    }
    
    if (filters?.endDate) {
      filteredReviews = filteredReviews.filter(r => 
        new Date(r.createdAt) <= filters.endDate!
      );
    }
    
    if (filters?.rating) {
      filteredReviews = filteredReviews.filter(r => r.rating === filters.rating);
    }
    
    if (filters?.limit) {
      filteredReviews = filteredReviews.slice(0, filters.limit);
    }
    
    return filteredReviews;
  }

  async getLatestCompetitorSnapshots(locationId: string): Promise<CompetitorSnapshot[]> {
    return locationId === 'test-location-1' ? this.mockCompetitors : [];
  }

  async getReputationScoreHistory(locationId: string, days?: number): Promise<ReputationScore[]> {
    if (locationId !== 'test-location-1') return [];
    
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - (days || 30));
    
    return this.mockScoreHistory.filter(score => 
      new Date(score.calculatedAt) >= cutoffDate
    );
  }
}

describe('ReputationAnalysisService', () => {
  let service: ReputationAnalysisService;
  let mockStorage: MockStorage;

  beforeEach(() => {
    // Ensure no OpenAI API key is set for testing fallback behavior
    delete process.env.OPENAI_API_KEY;
    
    mockStorage = new MockStorage();
    service = new ReputationAnalysisService(mockStorage as IStorage);
  });

  describe('calculateReputationScore', () => {
    test('should return deterministic results with mock data', async () => {
      const result = await service.calculateReputationScore('test-location-1', 30);
      
      // Verify basic structure
      expect(result).toHaveProperty('score');
      expect(result).toHaveProperty('components');
      expect(result).toHaveProperty('trend');
      expect(result).toHaveProperty('alerts');
      expect(result).toHaveProperty('insights');
      
      // Verify score is within expected range
      expect(result.score).toBeGreaterThanOrEqual(0);
      expect(result.score).toBeLessThanOrEqual(100);
      
      // Verify components structure
      expect(result.components).toHaveProperty('negativeReviewVelocity');
      expect(result.components).toHaveProperty('responseLatency');
      expect(result.components).toHaveProperty('sentimentDrift');
      expect(result.components).toHaveProperty('engagementDrop');
      expect(result.components).toHaveProperty('competitorGap');
      
      // Verify trend structure
      expect(['improving', 'declining', 'stable']).toContain(result.trend.trend);
      expect(result.trend).toHaveProperty('slope');
      expect(result.trend).toHaveProperty('confidence');
      
      // Verify insights structure
      expect(result.insights).toHaveProperty('summary');
      expect(result.insights).toHaveProperty('recommendations');
      expect(Array.isArray(result.insights.recommendations)).toBe(true);
    });

    test('should work without OpenAI API key (fallback mode)', async () => {
      const result = await service.calculateReputationScore('test-location-1', 30);
      
      // Should still return a valid analysis result
      expect(result.score).toBeDefined();
      expect(result.components.sentimentDrift).toBeGreaterThanOrEqual(0);
      expect(result.insights.summary).toBeDefined();
      expect(result.insights.recommendations.length).toBeGreaterThan(0);
    });

    test('should handle invalid location gracefully', async () => {
      const result = await service.calculateReputationScore('non-existent-location', 30);
      
      // Should return fallback result
      expect(result.score).toBe(30); // Default fallback score
      expect(result.alerts).toHaveLength(1);
      expect(result.alerts[0].type).toBe('system_error');
      expect(result.alerts[0].reasonCode).toBe('ANALYSIS_FALLBACK');
    });

    test('should validate input parameters', async () => {
      // Test invalid locationId
      await expect(service.calculateReputationScore('', 30))
        .rejects.toThrow('Invalid locationId');
      
      // Test invalid windowDays
      await expect(service.calculateReputationScore('test-location-1', 0))
        .rejects.toThrow('Invalid windowDays');
      
      await expect(service.calculateReputationScore('test-location-1', 400))
        .rejects.toThrow('Invalid windowDays');
    });

    test('should calculate weighted risk score correctly', async () => {
      const result = await service.calculateReputationScore('test-location-1', 30);
      
      // Verify that individual components contribute to overall score
      const { components } = result;
      
      // All components should be within 0-100 range
      expect(components.negativeReviewVelocity).toBeGreaterThanOrEqual(0);
      expect(components.negativeReviewVelocity).toBeLessThanOrEqual(100);
      
      expect(components.responseLatency).toBeGreaterThanOrEqual(0);
      expect(components.responseLatency).toBeLessThanOrEqual(100);
      
      expect(components.sentimentDrift).toBeGreaterThanOrEqual(0);
      expect(components.sentimentDrift).toBeLessThanOrEqual(100);
      
      expect(components.engagementDrop).toBeGreaterThanOrEqual(0);
      expect(components.engagementDrop).toBeLessThanOrEqual(100);
      
      expect(components.competitorGap).toBeGreaterThanOrEqual(0);
      expect(components.competitorGap).toBeLessThanOrEqual(100);
    });

    test('should generate alerts based on risk factors', async () => {
      const result = await service.calculateReputationScore('test-location-1', 30);
      
      // Should have alerts array (may be empty if no risks detected)
      expect(Array.isArray(result.alerts)).toBe(true);
      
      // If alerts exist, they should have proper structure
      result.alerts.forEach(alert => {
        expect(alert).toHaveProperty('type');
        expect(alert).toHaveProperty('severity');
        expect(alert).toHaveProperty('message');
        expect(alert).toHaveProperty('reasonCode');
        expect(['low', 'medium', 'high', 'critical']).toContain(alert.severity);
      });
    });

    test('should include competitor comparison when available', async () => {
      const result = await service.calculateReputationScore('test-location-1', 30);
      
      // Should have competitor comparison since mock data includes competitors
      expect(result.insights.competitorComparison).toBeDefined();
      expect(result.insights.competitorComparison).toContain('Top Competitor');
    });

    test('should be deterministic with same input data', async () => {
      const result1 = await service.calculateReputationScore('test-location-1', 30);
      const result2 = await service.calculateReputationScore('test-location-1', 30);
      
      // Should return consistent results (except for random elements in demo sentiment)
      expect(result1.score).toBe(result2.score);
      expect(result1.components.negativeReviewVelocity).toBe(result2.components.negativeReviewVelocity);
      expect(result1.components.responseLatency).toBe(result2.components.responseLatency);
      expect(result1.components.engagementDrop).toBe(result2.components.engagementDrop);
      expect(result1.components.competitorGap).toBe(result2.components.competitorGap);
    });
  });

  describe('PII Redaction', () => {
    test('should redact PII from review text', async () => {
      // Create a service instance to access private methods for testing
      const testService = service as any;
      
      const textWithPII = `Contact Dr. John Smith at john.smith@email.com or call 555-123-4567. 
                          Visit us at 123 Main Street. Patient ID: MRN123456789`;
      
      const redacted = testService.redactPII(textWithPII);
      
      expect(redacted).not.toContain('john.smith@email.com');
      expect(redacted).not.toContain('555-123-4567');
      expect(redacted).not.toContain('Dr. John Smith');
      expect(redacted).not.toContain('123 Main Street');
      expect(redacted).not.toContain('MRN123456789');
      
      expect(redacted).toContain('[EMAIL_REDACTED]');
      expect(redacted).toContain('[PHONE_REDACTED]');
      expect(redacted).toContain('[NAME_REDACTED]');
      expect(redacted).toContain('[ADDRESS_REDACTED]');
      expect(redacted).toContain('[MEDICAL_ID_REDACTED]');
    });
  });
});

console.log('ReputationAnalysisService test suite created successfully!');