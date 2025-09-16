import { 
  type User, 
  type InsertUser,
  type Business,
  type InsertBusiness,
  type Location,
  type InsertLocation,
  type ContentCalendarPost,
  type InsertContentCalendarPost,
  type PostingSchedule,
  type InsertPostingSchedule,
  type Review,
  type InsertReview,
  type CompetitorSnapshot,
  type InsertCompetitorSnapshot,
  type ReputationScore,
  type InsertReputationScore,
  type ReputationAlert,
  type InsertReputationAlert
} from "@shared/schema";
import { randomUUID } from "crypto";

// modify the interface with any CRUD methods
// you might need

export interface IStorage {
  // User methods
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Business methods
  getBusiness(id: string): Promise<Business | undefined>;
  getBusinessById(id: string): Promise<Business | undefined>;
  getBusinessesByOwner(ownerId: string): Promise<Business[]>;
  createBusiness(business: InsertBusiness): Promise<Business>;
  
  // Location methods  
  getLocation(id: string): Promise<Location | undefined>;
  getLocationById(id: string): Promise<Location | undefined>;
  getLocationsByBusiness(businessId: string): Promise<Location[]>;
  createLocation(location: InsertLocation): Promise<Location>;
  
  // Content Calendar methods
  getContentCalendarPosts(locationId: string, filters?: {
    month?: number;
    year?: number;
    platform?: string;
    status?: string;
  }): Promise<ContentCalendarPost[]>;
  createContentCalendarPost(post: Omit<InsertContentCalendarPost, 'id'>): Promise<ContentCalendarPost>;
  updateContentCalendarPost(postId: string, updateData: Partial<ContentCalendarPost>): Promise<ContentCalendarPost | undefined>;
  updatePostStatus(postId: string, status: string, feedback?: string): Promise<ContentCalendarPost | undefined>;
  bulkUpdatePostStatus(postIds: string[], status: string): Promise<ContentCalendarPost[]>;
  
  // Posting Schedule methods
  getPostingSchedules(locationId: string): Promise<PostingSchedule[]>;
  createOrUpdatePostingSchedule(schedule: Omit<InsertPostingSchedule, 'id'>): Promise<PostingSchedule>;
  
  // Reputation Module methods
  
  // Review methods
  createReview(review: Omit<InsertReview, 'id'>): Promise<Review>;
  getReviewsByLocation(locationId: string, filters?: {
    rating?: number;
    platform?: string;
    startDate?: Date;
    endDate?: Date;
    limit?: number;
  }): Promise<Review[]>;
  getRecentReviews(locationId: string, days?: number): Promise<Review[]>;
  updateReviewResponse(reviewId: string, respondedAt: Date): Promise<Review | undefined>;
  
  // Competitor Snapshot methods  
  createCompetitorSnapshot(snapshot: Omit<InsertCompetitorSnapshot, 'id'>): Promise<CompetitorSnapshot>;
  getLatestCompetitorSnapshots(locationId: string): Promise<CompetitorSnapshot[]>;
  getCompetitorHistory(locationId: string, competitorName: string, days?: number): Promise<CompetitorSnapshot[]>;
  
  // Reputation Score methods
  createReputationScore(score: Omit<InsertReputationScore, 'id'>): Promise<ReputationScore>;
  getLatestReputationScore(locationId: string): Promise<ReputationScore | undefined>;
  getReputationScoreHistory(locationId: string, days?: number): Promise<ReputationScore[]>;
  
  // Reputation Alert methods
  createReputationAlert(alert: Omit<InsertReputationAlert, 'id'>): Promise<ReputationAlert>;
  getUnacknowledgedAlerts(locationId: string): Promise<ReputationAlert[]>;
  getRecentAlerts(locationId: string, days?: number): Promise<ReputationAlert[]>;
  acknowledgeAlert(alertId: string, acknowledgedBy?: string): Promise<ReputationAlert | undefined>;
  bulkAcknowledgeAlerts(alertIds: string[], acknowledgedBy?: string): Promise<ReputationAlert[]>;
  
  // Threshold Management methods
  setLocationThreshold(locationId: string, threshold: number): Promise<void>;
  getLocationThreshold(locationId: string): Promise<number>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private businesses: Map<string, Business>;
  private locations: Map<string, Location>;
  private contentCalendarPosts: Map<string, ContentCalendarPost>;
  private postingSchedules: Map<string, PostingSchedule>;
  // Reputation Module Maps
  private reviews: Map<string, Review>;
  private competitorSnapshots: Map<string, CompetitorSnapshot>;
  private reputationScores: Map<string, ReputationScore>;
  private reputationAlerts: Map<string, ReputationAlert>;
  // Threshold Management Map
  private locationThresholds: Map<string, number>;

  constructor() {
    this.users = new Map();
    this.businesses = new Map();
    this.locations = new Map();
    this.contentCalendarPosts = new Map();
    this.postingSchedules = new Map();
    // Initialize Reputation Module Maps
    this.reviews = new Map();
    this.competitorSnapshots = new Map();
    this.reputationScores = new Map();
    this.reputationAlerts = new Map();
    // Initialize Threshold Management Map
    this.locationThresholds = new Map();

    // Initialize with some mock data for testing
    this.initializeMockData();
  }

  private initializeMockData() {
    // Mock business
    const mockBusiness: Business = {
      id: "business-1",
      name: "Restaurante La Vista",
      industry: "Restaurantes",
      description: "Auténtica comida mexicana con vista panorámica de la ciudad",
      website: "https://lavista.com",
      phone: "+1 (555) 123-4567",
      email: "contacto@lavista.com",
      ownerId: "user-1",
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.businesses.set(mockBusiness.id, mockBusiness);

    // Mock location
    const mockLocation: Location = {
      id: "location-1",
      businessId: "business-1",
      name: "La Vista Centro",
      address: "Av. Juárez 123",
      city: "Ciudad de México",
      state: "CDMX",
      zipCode: "06600",
      country: "MX",
      latitude: "19.4326",
      longitude: "-99.1332",
      phone: "+1 (555) 123-4567",
      email: "centro@lavista.com",
      managerName: "Carlos González",
      isActive: true,
      averageRating: "4.5",
      totalReviews: 127,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.locations.set(mockLocation.id, mockLocation);
  }

  // User methods
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Business methods
  async getBusiness(id: string): Promise<Business | undefined> {
    return this.businesses.get(id);
  }

  async getBusinessById(id: string): Promise<Business | undefined> {
    return this.businesses.get(id);
  }

  async getBusinessesByOwner(ownerId: string): Promise<Business[]> {
    return Array.from(this.businesses.values()).filter(
      business => business.ownerId === ownerId
    );
  }

  async createBusiness(business: InsertBusiness): Promise<Business> {
    const id = randomUUID();
    const newBusiness: Business = {
      ...business,
      id,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.businesses.set(id, newBusiness);
    return newBusiness;
  }

  // Location methods
  async getLocation(id: string): Promise<Location | undefined> {
    return this.locations.get(id);
  }

  async getLocationById(id: string): Promise<Location | undefined> {
    return this.locations.get(id);
  }

  async getLocationsByBusiness(businessId: string): Promise<Location[]> {
    return Array.from(this.locations.values()).filter(
      location => location.businessId === businessId
    );
  }

  async createLocation(location: InsertLocation): Promise<Location> {
    const id = randomUUID();
    const newLocation: Location = {
      ...location,
      id,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.locations.set(id, newLocation);
    return newLocation;
  }

  // Content Calendar methods
  async getContentCalendarPosts(locationId: string, filters?: {
    month?: number;
    year?: number;
    platform?: string;
    status?: string;
  }): Promise<ContentCalendarPost[]> {
    let posts = Array.from(this.contentCalendarPosts.values()).filter(
      post => post.locationId === locationId
    );

    if (filters) {
      if (filters.month && filters.year) {
        posts = posts.filter(post => {
          const postDate = new Date(post.scheduledDate);
          return postDate.getMonth() + 1 === filters.month && 
                 postDate.getFullYear() === filters.year;
        });
      }
      if (filters.platform) {
        posts = posts.filter(post => post.platform === filters.platform);
      }
      if (filters.status) {
        posts = posts.filter(post => post.status === filters.status);
      }
    }

    return posts.sort((a, b) => 
      new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime()
    );
  }

  async createContentCalendarPost(postData: Omit<InsertContentCalendarPost, 'id'>): Promise<ContentCalendarPost> {
    const id = randomUUID();
    const post: ContentCalendarPost = {
      ...postData,
      id,
      keywords: postData.keywords || null,
      hashtags: postData.hashtags || null,
      imagePrompt: postData.imagePrompt || null,
      templateId: postData.templateId || null,
      publishedAt: postData.publishedAt || null,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.contentCalendarPosts.set(id, post);
    return post;
  }

  async updateContentCalendarPost(postId: string, updateData: Partial<ContentCalendarPost>): Promise<ContentCalendarPost | undefined> {
    const existingPost = this.contentCalendarPosts.get(postId);
    if (!existingPost) return undefined;

    const updatedPost: ContentCalendarPost = {
      ...existingPost,
      ...updateData,
      updatedAt: new Date()
    };
    this.contentCalendarPosts.set(postId, updatedPost);
    return updatedPost;
  }

  async updatePostStatus(postId: string, status: string, feedback?: string): Promise<ContentCalendarPost | undefined> {
    const existingPost = this.contentCalendarPosts.get(postId);
    if (!existingPost) return undefined;

    const updatedPost: ContentCalendarPost = {
      ...existingPost,
      status,
      updatedAt: new Date()
    };

    if (status === 'published') {
      updatedPost.publishedAt = new Date();
    }

    this.contentCalendarPosts.set(postId, updatedPost);
    return updatedPost;
  }

  async bulkUpdatePostStatus(postIds: string[], status: string): Promise<ContentCalendarPost[]> {
    const updatedPosts: ContentCalendarPost[] = [];

    for (const postId of postIds) {
      const post = await this.updatePostStatus(postId, status);
      if (post) {
        updatedPosts.push(post);
      }
    }

    return updatedPosts;
  }

  // Posting Schedule methods
  async getPostingSchedules(locationId: string): Promise<PostingSchedule[]> {
    return Array.from(this.postingSchedules.values()).filter(
      schedule => schedule.locationId === locationId
    );
  }

  async createOrUpdatePostingSchedule(scheduleData: Omit<InsertPostingSchedule, 'id'>): Promise<PostingSchedule> {
    // Check if schedule already exists for this location and platform
    const existingSchedule = Array.from(this.postingSchedules.values()).find(
      schedule => schedule.locationId === scheduleData.locationId && 
                  schedule.platform === scheduleData.platform
    );

    if (existingSchedule) {
      // Update existing schedule
      const updatedSchedule: PostingSchedule = {
        ...existingSchedule,
        ...scheduleData,
        updatedAt: new Date()
      };
      this.postingSchedules.set(existingSchedule.id, updatedSchedule);
      return updatedSchedule;
    } else {
      // Create new schedule
      const id = randomUUID();
      const newSchedule: PostingSchedule = {
        ...scheduleData,
        id,
        lastGeneratedAt: scheduleData.lastGeneratedAt || null,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      this.postingSchedules.set(id, newSchedule);
      return newSchedule;
    }
  }

  // Reputation Module Methods
  
  // Review methods
  async createReview(reviewData: Omit<InsertReview, 'id'>): Promise<Review> {
    const id = randomUUID();
    const review: Review = {
      ...reviewData,
      id,
      reviewerName: reviewData.reviewerName || null,
      externalId: reviewData.externalId || null,
      createdAt: new Date(),
      respondedAt: reviewData.respondedAt || null
    };
    this.reviews.set(id, review);
    return review;
  }

  async getReviewsByLocation(locationId: string, filters?: {
    rating?: number;
    platform?: string;
    startDate?: Date;
    endDate?: Date;
    limit?: number;
  }): Promise<Review[]> {
    let reviews = Array.from(this.reviews.values()).filter(
      review => review.locationId === locationId
    );

    if (filters) {
      if (filters.rating) {
        reviews = reviews.filter(review => review.rating === filters.rating);
      }
      if (filters.platform) {
        reviews = reviews.filter(review => review.platform === filters.platform);
      }
      if (filters.startDate) {
        reviews = reviews.filter(review => 
          new Date(review.createdAt) >= filters.startDate!
        );
      }
      if (filters.endDate) {
        reviews = reviews.filter(review => 
          new Date(review.createdAt) <= filters.endDate!
        );
      }
      if (filters.limit) {
        reviews = reviews.slice(0, filters.limit);
      }
    }

    return reviews.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  async getRecentReviews(locationId: string, days: number = 30): Promise<Review[]> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    return this.getReviewsByLocation(locationId, { startDate });
  }

  async updateReviewResponse(reviewId: string, respondedAt: Date): Promise<Review | undefined> {
    const review = this.reviews.get(reviewId);
    if (!review) return undefined;

    const updatedReview: Review = {
      ...review,
      respondedAt
    };
    this.reviews.set(reviewId, updatedReview);
    return updatedReview;
  }

  // Competitor Snapshot methods
  async createCompetitorSnapshot(snapshotData: Omit<InsertCompetitorSnapshot, 'id'>): Promise<CompetitorSnapshot> {
    const id = randomUUID();
    const snapshot: CompetitorSnapshot = {
      ...snapshotData,
      id,
      capturedAt: new Date()
    };
    this.competitorSnapshots.set(id, snapshot);
    return snapshot;
  }

  async getLatestCompetitorSnapshots(locationId: string): Promise<CompetitorSnapshot[]> {
    const snapshots = Array.from(this.competitorSnapshots.values()).filter(
      snapshot => snapshot.locationId === locationId
    );

    // Group by competitor name and return latest for each
    const latestByCompetitor = new Map<string, CompetitorSnapshot>();
    snapshots.forEach(snapshot => {
      const existing = latestByCompetitor.get(snapshot.competitorName);
      if (!existing || new Date(snapshot.capturedAt) > new Date(existing.capturedAt)) {
        latestByCompetitor.set(snapshot.competitorName, snapshot);
      }
    });

    return Array.from(latestByCompetitor.values()).sort((a, b) => 
      new Date(b.capturedAt).getTime() - new Date(a.capturedAt).getTime()
    );
  }

  async getCompetitorHistory(locationId: string, competitorName: string, days: number = 30): Promise<CompetitorSnapshot[]> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    return Array.from(this.competitorSnapshots.values()).filter(
      snapshot => snapshot.locationId === locationId && 
                  snapshot.competitorName === competitorName &&
                  new Date(snapshot.capturedAt) >= startDate
    ).sort((a, b) => 
      new Date(b.capturedAt).getTime() - new Date(a.capturedAt).getTime()
    );
  }

  // Reputation Score methods
  async createReputationScore(scoreData: Omit<InsertReputationScore, 'id'>): Promise<ReputationScore> {
    const id = randomUUID();
    const score: ReputationScore = {
      ...scoreData,
      id,
      previousScore: scoreData.previousScore || null,
      calculatedAt: new Date()
    };
    this.reputationScores.set(id, score);
    return score;
  }

  async getLatestReputationScore(locationId: string): Promise<ReputationScore | undefined> {
    const scores = Array.from(this.reputationScores.values()).filter(
      score => score.locationId === locationId
    );

    return scores.reduce((latest, current) => {
      if (!latest || new Date(current.calculatedAt) > new Date(latest.calculatedAt)) {
        return current;
      }
      return latest;
    }, undefined as ReputationScore | undefined);
  }

  async getReputationScoreHistory(locationId: string, days: number = 30): Promise<ReputationScore[]> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    return Array.from(this.reputationScores.values()).filter(
      score => score.locationId === locationId &&
               new Date(score.calculatedAt) >= startDate
    ).sort((a, b) => 
      new Date(b.calculatedAt).getTime() - new Date(a.calculatedAt).getTime()
    );
  }

  // Reputation Alert methods
  async createReputationAlert(alertData: Omit<InsertReputationAlert, 'id'>): Promise<ReputationAlert> {
    const id = randomUUID();
    const alert: ReputationAlert = {
      ...alertData,
      id,
      score: alertData.score || null,
      metadata: alertData.metadata || null,
      acknowledgedAt: alertData.acknowledgedAt || null,
      acknowledgedBy: alertData.acknowledgedBy || null,
      createdAt: new Date()
    };
    this.reputationAlerts.set(id, alert);
    return alert;
  }

  async getUnacknowledgedAlerts(locationId: string): Promise<ReputationAlert[]> {
    return Array.from(this.reputationAlerts.values()).filter(
      alert => alert.locationId === locationId && !alert.acknowledged
    ).sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  async getRecentAlerts(locationId: string, days: number = 7): Promise<ReputationAlert[]> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    return Array.from(this.reputationAlerts.values()).filter(
      alert => alert.locationId === locationId &&
                new Date(alert.createdAt) >= startDate
    ).sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  async acknowledgeAlert(alertId: string, acknowledgedBy?: string): Promise<ReputationAlert | undefined> {
    const alert = this.reputationAlerts.get(alertId);
    if (!alert) return undefined;

    const updatedAlert: ReputationAlert = {
      ...alert,
      acknowledged: true,
      acknowledgedAt: new Date(),
      acknowledgedBy: acknowledgedBy || null
    };
    this.reputationAlerts.set(alertId, updatedAlert);
    return updatedAlert;
  }

  async bulkAcknowledgeAlerts(alertIds: string[], acknowledgedBy?: string): Promise<ReputationAlert[]> {
    const updatedAlerts: ReputationAlert[] = [];

    for (const alertId of alertIds) {
      const alert = await this.acknowledgeAlert(alertId, acknowledgedBy);
      if (alert) {
        updatedAlerts.push(alert);
      }
    }

    return updatedAlerts;
  }

  // Threshold Management methods
  async setLocationThreshold(locationId: string, threshold: number): Promise<void> {
    // Validate threshold value
    if (threshold < 0 || threshold > 100) {
      throw new Error('Threshold must be between 0 and 100');
    }
    
    // Validate location exists
    const location = await this.getLocationById(locationId);
    if (!location) {
      throw new Error(`Location with ID ${locationId} not found`);
    }
    
    this.locationThresholds.set(locationId, threshold);
  }

  async getLocationThreshold(locationId: string): Promise<number> {
    // Return stored threshold or default of 70
    return this.locationThresholds.get(locationId) ?? 70;
  }
}

export const storage = new MemStorage();
