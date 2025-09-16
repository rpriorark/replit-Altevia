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
  type InsertReputationAlert,
  type SubscriptionPlan,
  type InsertSubscriptionPlan,
  type Subscription,
  type InsertSubscription,
  type Payment,
  type InsertPayment,
  type ReviewSource,
  type InsertReviewSource,
  type TrialSignup,
  type InsertTrialSignup,
  type GmbPost,
  type InsertGmbPost,
  type ReportExport,
  type InsertReportExport,
  type AdminUser,
  type InsertAdminUser,
  type CompetitorAnalysisRecord,
  type InsertCompetitorAnalysis
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
  
  // Subscription Plan methods
  getSubscriptionPlan(id: string): Promise<SubscriptionPlan | undefined>;
  getAllSubscriptionPlans(activeOnly?: boolean): Promise<SubscriptionPlan[]>;
  getSubscriptionPlans(filters?: { activeOnly?: boolean }): Promise<SubscriptionPlan[]>;
  createSubscriptionPlan(plan: Omit<InsertSubscriptionPlan, 'id'>): Promise<SubscriptionPlan>;
  updateSubscriptionPlan(planId: string, updateData: Partial<SubscriptionPlan>): Promise<SubscriptionPlan | undefined>;
  
  // Subscription methods
  getSubscription(id: string): Promise<Subscription | undefined>;
  getSubscriptionByUser(userId: string): Promise<Subscription | undefined>;
  getSubscriptionsByPlan(planId: string): Promise<Subscription[]>;
  createSubscription(subscription: Omit<InsertSubscription, 'id'>): Promise<Subscription>;
  updateSubscription(subscriptionId: string, updateData: Partial<Subscription>): Promise<Subscription | undefined>;
  cancelSubscription(subscriptionId: string, cancelAtPeriodEnd?: boolean): Promise<Subscription | undefined>;
  
  // Payment methods
  getPayment(id: string): Promise<Payment | undefined>;
  getPaymentsBySubscription(subscriptionId: string): Promise<Payment[]>;
  getPaymentsByUser(userId: string): Promise<Payment[]>;
  getPaymentByMercadoPagoId(mercadoPagoId: string): Promise<Payment | undefined>;
  updatePaymentByMercadoPagoId(mercadoPagoId: string, updateData: Partial<Payment>): Promise<Payment | undefined>;
  createPayment(payment: Omit<InsertPayment, 'id'>): Promise<Payment>;
  updatePaymentStatus(paymentId: string, status: string, failureReason?: string): Promise<Payment | undefined>;
  
  // Review Source methods
  getReviewSource(id: string): Promise<ReviewSource | undefined>;
  getReviewSourcesByLocation(locationId: string): Promise<ReviewSource[]>;
  getReviewSources(filters?: { locationId?: string; platform?: string }): Promise<ReviewSource[]>;
  deleteReviewSource(sourceId: string): Promise<boolean>;
  createReviewSource(source: Omit<InsertReviewSource, 'id'>): Promise<ReviewSource>;
  updateReviewSource(sourceId: string, updateData: Partial<ReviewSource>): Promise<ReviewSource | undefined>;
  updateLastSync(sourceId: string, totalReviews?: number, averageRating?: string): Promise<ReviewSource | undefined>;
  
  // Trial Signup methods
  getTrialSignup(id: string): Promise<TrialSignup | undefined>;
  getTrialSignupByEmail(email: string): Promise<TrialSignup | undefined>;
  getActiveTrialSignups(): Promise<TrialSignup[]>;
  getExpiredTrialSignups(): Promise<TrialSignup[]>;
  getTrialSignups(filters?: { status?: string; limit?: number }): Promise<TrialSignup[]>;
  updateTrialSignup(signupId: string, updateData: Partial<TrialSignup>): Promise<TrialSignup | undefined>;
  createTrialSignup(signup: Omit<InsertTrialSignup, 'id'>): Promise<TrialSignup>;
  convertTrialSignup(signupId: string, userId: string): Promise<TrialSignup | undefined>;
  markTrialExpired(signupId: string): Promise<TrialSignup | undefined>;
  
  // GMB Post methods
  getGmbPost(id: string): Promise<GmbPost | undefined>;
  getGmbPostsByLocation(locationId: string, filters?: {
    status?: string;
    postType?: string;
    startDate?: Date;
    endDate?: Date;
    limit?: number;
  }): Promise<GmbPost[]>;
  getGmbPosts(filters?: { locationId?: string; status?: string; limit?: number }): Promise<GmbPost[]>;
  deleteGmbPost(postId: string): Promise<boolean>;
  createGmbPost(post: Omit<InsertGmbPost, 'id'>): Promise<GmbPost>;
  updateGmbPost(postId: string, updateData: Partial<GmbPost>): Promise<GmbPost | undefined>;
  updateGmbPostStatus(postId: string, status: string, gmbPostId?: string): Promise<GmbPost | undefined>;
  updateGmbPostEngagement(postId: string, engagement: number, clicks: number, views: number): Promise<GmbPost | undefined>;
  
  // Report Export methods
  getReportExport(id: string): Promise<ReportExport | undefined>;
  getReportExportsByUser(userId: string): Promise<ReportExport[]>;
  getReportExports(filters?: { userId?: string; status?: string }): Promise<ReportExport[]>;
  updateReportExport(reportId: string, updateData: Partial<ReportExport>): Promise<ReportExport | undefined>;
  createReportExport(report: Omit<InsertReportExport, 'id'>): Promise<ReportExport>;
  updateReportExportStatus(reportId: string, status: string, fileUrl?: string, fileSize?: number, errorMessage?: string): Promise<ReportExport | undefined>;
  getExpiredReportExports(): Promise<ReportExport[]>;
  
  // Admin User methods
  getAdminUser(id: string): Promise<AdminUser | undefined>;
  getAdminUserByUsername(username: string): Promise<AdminUser | undefined>;
  getAdminUserByEmail(email: string): Promise<AdminUser | undefined>;
  getAllAdminUsers(activeOnly?: boolean): Promise<AdminUser[]>;
  createAdminUser(user: Omit<InsertAdminUser, 'id'>): Promise<AdminUser>;
  updateAdminUserLastLogin(adminId: string): Promise<AdminUser | undefined>;
  updateAdminUserStatus(adminId: string, isActive: boolean): Promise<AdminUser | undefined>;
  
  // Competitor Analysis methods
  getCompetitorAnalysis(id: string): Promise<CompetitorAnalysisRecord | undefined>;
  getCompetitorAnalysesByLocation(locationId: string, analysisType?: string): Promise<CompetitorAnalysisRecord[]>;
  getCompetitorAnalysisByLocation(locationId: string, filters?: { analysisType?: string; limit?: number }): Promise<CompetitorAnalysisRecord[]>;
  getCompetitorAnalysisHistory(locationId: string, competitorName: string, days?: number): Promise<CompetitorAnalysisRecord[]>;
  createCompetitorAnalysis(analysis: Omit<InsertCompetitorAnalysis, 'id'>): Promise<CompetitorAnalysisRecord>;
  createCompetitorAnalysisRecord(analysis: Omit<InsertCompetitorAnalysis, 'id'>): Promise<CompetitorAnalysisRecord>;
  getLatestCompetitorAnalyses(locationId: string): Promise<CompetitorAnalysisRecord[]>;
  
  // Statistics methods
  getUserCount(): Promise<number>;
  getBusinessCount(): Promise<number>;
  getLocationCount(): Promise<number>;
  getActiveSubscriptionCount(): Promise<number>;
  getTrialSignupCount(): Promise<number>;
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
  // New Feature Maps
  private subscriptionPlans: Map<string, SubscriptionPlan>;
  private subscriptions: Map<string, Subscription>;
  private payments: Map<string, Payment>;
  private reviewSources: Map<string, ReviewSource>;
  private trialSignups: Map<string, TrialSignup>;
  private gmbPosts: Map<string, GmbPost>;
  private reportExports: Map<string, ReportExport>;
  private adminUsers: Map<string, AdminUser>;
  private competitorAnalyses: Map<string, CompetitorAnalysisRecord>;

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
    // Initialize New Feature Maps
    this.subscriptionPlans = new Map();
    this.subscriptions = new Map();
    this.payments = new Map();
    this.reviewSources = new Map();
    this.trialSignups = new Map();
    this.gmbPosts = new Map();
    this.reportExports = new Map();
    this.adminUsers = new Map();
    this.competitorAnalyses = new Map();

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
      gmbPlaceId: null,
      gmbUrl: null,
      averageRating: "4.5",
      totalReviews: 127,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.locations.set(mockLocation.id, mockLocation);

    // Initialize mock subscription plans
    const basicPlan: SubscriptionPlan = {
      id: "plan-basic",
      name: "Plan Básico",
      description: "Ideal para pequeños negocios con una ubicación",
      price: "899.00",
      currency: "MXN",
      interval: "monthly",
      features: JSON.stringify(["1 ubicación", "Análisis básico de reputación", "Respuestas automáticas", "Soporte email"]),
      maxLocations: 1,
      maxUsers: 2,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.subscriptionPlans.set(basicPlan.id, basicPlan);

    const proPlan: SubscriptionPlan = {
      id: "plan-pro",
      name: "Plan Profesional",
      description: "Para empresas con múltiples ubicaciones",
      price: "1599.00",
      currency: "MXN",
      interval: "monthly",
      features: JSON.stringify(["5 ubicaciones", "Análisis avanzado", "Calendario de contenido", "Reportes exportables", "Soporte prioritario"]),
      maxLocations: 5,
      maxUsers: 10,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.subscriptionPlans.set(proPlan.id, proPlan);

    // Mock admin user
    const mockAdmin: AdminUser = {
      id: "admin-1",
      username: "admin",
      passwordHash: "$2b$10$example.hash.for.testing.purposes",
      email: "admin@altevia.com",
      role: "super_admin",
      lastLogin: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
      isActive: true,
      createdAt: new Date()
    };
    this.adminUsers.set(mockAdmin.id, mockAdmin);

    // Mock review source
    const mockReviewSource: ReviewSource = {
      id: "source-1",
      locationId: "location-1",
      sourceName: "google",
      sourceUrl: "https://maps.google.com/place/example",
      isActive: true,
      apiKey: null,
      lastSyncAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      syncFrequency: 24,
      totalReviews: 127,
      averageRating: "4.5",
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.reviewSources.set(mockReviewSource.id, mockReviewSource);
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
      description: business.description ?? null,
      website: business.website ?? null,
      phone: business.phone ?? null,
      email: business.email ?? null,
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
      country: location.country ?? 'US',
      latitude: location.latitude ?? null,
      longitude: location.longitude ?? null,
      phone: location.phone ?? null,
      email: location.email ?? null,
      managerName: location.managerName ?? null,
      isActive: location.isActive ?? true,
      gmbPlaceId: location.gmbPlaceId ?? null,
      gmbUrl: location.gmbUrl ?? null,
      averageRating: location.averageRating ?? null,
      totalReviews: location.totalReviews ?? 0,
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
      status: postData.status ?? 'suggested',
      isGenerated: postData.isGenerated ?? true,
      keywords: postData.keywords ?? null,
      hashtags: postData.hashtags ?? null,
      imagePrompt: postData.imagePrompt ?? null,
      templateId: postData.templateId ?? null,
      publishedAt: postData.publishedAt ?? null,
      engagement: postData.engagement ?? 0,
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
        isActive: scheduleData.isActive ?? true,
        preferredDays: scheduleData.preferredDays ?? null,
        preferredTimes: scheduleData.preferredTimes ?? null,
        timezone: scheduleData.timezone ?? 'America/Mexico_City',
        autoApprove: scheduleData.autoApprove ?? false,
        lastGeneratedAt: scheduleData.lastGeneratedAt ?? null,
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
      platform: reviewData.platform ?? 'google',
      reviewerName: reviewData.reviewerName ?? null,
      externalId: reviewData.externalId ?? null,
      createdAt: new Date(),
      respondedAt: reviewData.respondedAt ?? null
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
      reviewCount: snapshotData.reviewCount ?? 0,
      last30dNegPct: snapshotData.last30dNegPct ?? null,
      engagementRate: snapshotData.engagementRate ?? null,
      marketSharePct: snapshotData.marketSharePct ?? null,
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
      trend: scoreData.trend ?? 'stable',
      previousScore: scoreData.previousScore ?? null,
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
      severity: alertData.severity ?? 'medium',
      acknowledged: alertData.acknowledged ?? false,
      score: alertData.score ?? null,
      metadata: alertData.metadata ?? null,
      acknowledgedAt: alertData.acknowledgedAt ?? null,
      acknowledgedBy: alertData.acknowledgedBy ?? null,
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

  // Subscription Plan methods
  async getSubscriptionPlan(id: string): Promise<SubscriptionPlan | undefined> {
    return this.subscriptionPlans.get(id);
  }

  async getAllSubscriptionPlans(activeOnly: boolean = true): Promise<SubscriptionPlan[]> {
    let plans = Array.from(this.subscriptionPlans.values());
    if (activeOnly) {
      plans = plans.filter(plan => plan.isActive);
    }
    return plans.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
  }

  async createSubscriptionPlan(planData: Omit<InsertSubscriptionPlan, 'id'>): Promise<SubscriptionPlan> {
    const id = randomUUID();
    const plan: SubscriptionPlan = {
      ...planData,
      id,
      description: planData.description ?? null,
      currency: planData.currency ?? 'MXN',
      maxLocations: planData.maxLocations ?? 1,
      maxUsers: planData.maxUsers ?? 1,
      isActive: planData.isActive ?? true,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.subscriptionPlans.set(id, plan);
    return plan;
  }

  async updateSubscriptionPlan(planId: string, updateData: Partial<SubscriptionPlan>): Promise<SubscriptionPlan | undefined> {
    const existingPlan = this.subscriptionPlans.get(planId);
    if (!existingPlan) return undefined;

    const updatedPlan: SubscriptionPlan = {
      ...existingPlan,
      ...updateData,
      updatedAt: new Date()
    };
    this.subscriptionPlans.set(planId, updatedPlan);
    return updatedPlan;
  }

  // Subscription methods
  async getSubscription(id: string): Promise<Subscription | undefined> {
    return this.subscriptions.get(id);
  }

  async getSubscriptionByUser(userId: string): Promise<Subscription | undefined> {
    return Array.from(this.subscriptions.values()).find(
      subscription => subscription.userId === userId
    );
  }

  async getSubscriptionsByPlan(planId: string): Promise<Subscription[]> {
    return Array.from(this.subscriptions.values()).filter(
      subscription => subscription.planId === planId
    );
  }

  async createSubscription(subscriptionData: Omit<InsertSubscription, 'id'>): Promise<Subscription> {
    const id = randomUUID();
    const subscription: Subscription = {
      ...subscriptionData,
      id,
      mercadoPagoId: subscriptionData.mercadoPagoId ?? null,
      status: subscriptionData.status ?? 'active',
      trialEndsAt: subscriptionData.trialEndsAt ?? null,
      cancelAtPeriodEnd: subscriptionData.cancelAtPeriodEnd ?? false,
      cancelledAt: subscriptionData.cancelledAt ?? null,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.subscriptions.set(id, subscription);
    return subscription;
  }

  async updateSubscription(subscriptionId: string, updateData: Partial<Subscription>): Promise<Subscription | undefined> {
    const existingSubscription = this.subscriptions.get(subscriptionId);
    if (!existingSubscription) return undefined;

    const updatedSubscription: Subscription = {
      ...existingSubscription,
      ...updateData,
      updatedAt: new Date()
    };
    this.subscriptions.set(subscriptionId, updatedSubscription);
    return updatedSubscription;
  }

  async cancelSubscription(subscriptionId: string, cancelAtPeriodEnd: boolean = true): Promise<Subscription | undefined> {
    const subscription = this.subscriptions.get(subscriptionId);
    if (!subscription) return undefined;

    const updatedSubscription: Subscription = {
      ...subscription,
      status: cancelAtPeriodEnd ? subscription.status : 'cancelled',
      cancelAtPeriodEnd,
      cancelledAt: cancelAtPeriodEnd ? null : new Date(),
      updatedAt: new Date()
    };
    this.subscriptions.set(subscriptionId, updatedSubscription);
    return updatedSubscription;
  }

  // Payment methods
  async getPayment(id: string): Promise<Payment | undefined> {
    return this.payments.get(id);
  }

  async getPaymentsBySubscription(subscriptionId: string): Promise<Payment[]> {
    return Array.from(this.payments.values()).filter(
      payment => payment.subscriptionId === subscriptionId
    ).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async getPaymentsByUser(userId: string): Promise<Payment[]> {
    const userSubscription = await this.getSubscriptionByUser(userId);
    if (!userSubscription) return [];
    return this.getPaymentsBySubscription(userSubscription.id);
  }

  async createPayment(paymentData: Omit<InsertPayment, 'id'>): Promise<Payment> {
    const id = randomUUID();
    const payment: Payment = {
      ...paymentData,
      id,
      mercadoPagoPaymentId: paymentData.mercadoPagoPaymentId ?? null,
      currency: paymentData.currency ?? 'MXN',
      paymentMethod: paymentData.paymentMethod ?? null,
      failureReason: paymentData.failureReason ?? null,
      paidAt: paymentData.paidAt ?? null,
      createdAt: new Date()
    };
    this.payments.set(id, payment);
    return payment;
  }

  async updatePaymentStatus(paymentId: string, status: string, failureReason?: string): Promise<Payment | undefined> {
    const payment = this.payments.get(paymentId);
    if (!payment) return undefined;

    const updatedPayment: Payment = {
      ...payment,
      status,
      failureReason: failureReason ?? payment.failureReason,
      paidAt: status === 'approved' ? new Date() : payment.paidAt
    };
    this.payments.set(paymentId, updatedPayment);
    return updatedPayment;
  }

  // Review Source methods
  async getReviewSource(id: string): Promise<ReviewSource | undefined> {
    return this.reviewSources.get(id);
  }

  async getReviewSourcesByLocation(locationId: string): Promise<ReviewSource[]> {
    return Array.from(this.reviewSources.values()).filter(
      source => source.locationId === locationId
    );
  }

  async createReviewSource(sourceData: Omit<InsertReviewSource, 'id'>): Promise<ReviewSource> {
    const id = randomUUID();
    const source: ReviewSource = {
      ...sourceData,
      id,
      sourceUrl: sourceData.sourceUrl ?? null,
      isActive: sourceData.isActive ?? true,
      apiKey: sourceData.apiKey ?? null,
      lastSyncAt: sourceData.lastSyncAt ?? null,
      syncFrequency: sourceData.syncFrequency ?? 24,
      totalReviews: sourceData.totalReviews ?? 0,
      averageRating: sourceData.averageRating ?? null,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.reviewSources.set(id, source);
    return source;
  }

  async updateReviewSource(sourceId: string, updateData: Partial<ReviewSource>): Promise<ReviewSource | undefined> {
    const existingSource = this.reviewSources.get(sourceId);
    if (!existingSource) return undefined;

    const updatedSource: ReviewSource = {
      ...existingSource,
      ...updateData,
      updatedAt: new Date()
    };
    this.reviewSources.set(sourceId, updatedSource);
    return updatedSource;
  }

  async updateLastSync(sourceId: string, totalReviews?: number, averageRating?: string): Promise<ReviewSource | undefined> {
    const source = this.reviewSources.get(sourceId);
    if (!source) return undefined;

    const updatedSource: ReviewSource = {
      ...source,
      lastSyncAt: new Date(),
      totalReviews: totalReviews ?? source.totalReviews,
      averageRating: averageRating ?? source.averageRating,
      updatedAt: new Date()
    };
    this.reviewSources.set(sourceId, updatedSource);
    return updatedSource;
  }

  // Trial Signup methods
  async getTrialSignup(id: string): Promise<TrialSignup | undefined> {
    return this.trialSignups.get(id);
  }

  async getTrialSignupByEmail(email: string): Promise<TrialSignup | undefined> {
    return Array.from(this.trialSignups.values()).find(
      signup => signup.contactEmail === email
    );
  }

  async getActiveTrialSignups(): Promise<TrialSignup[]> {
    return Array.from(this.trialSignups.values()).filter(
      signup => signup.status === 'active'
    ).sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  }

  async getExpiredTrialSignups(): Promise<TrialSignup[]> {
    return Array.from(this.trialSignups.values()).filter(
      signup => signup.status === 'expired'
    );
  }

  async createTrialSignup(signupData: Omit<InsertTrialSignup, 'id'>): Promise<TrialSignup> {
    const id = randomUUID();
    const trialStart = signupData.trialStartDate ?? new Date();
    const trialEnd = signupData.trialEndDate ?? new Date(Date.now() + 14 * 24 * 60 * 60 * 1000); // 14 days from now
    
    const signup: TrialSignup = {
      ...signupData,
      id,
      phone: signupData.phone ?? null,
      industry: signupData.industry ?? null,
      city: signupData.city ?? null,
      websiteUrl: signupData.websiteUrl ?? null,
      currentReviewPlatforms: signupData.currentReviewPlatforms ?? null,
      mainChallenges: signupData.mainChallenges ?? null,
      heardAboutUs: signupData.heardAboutUs ?? null,
      trialStartDate: trialStart,
      trialEndDate: trialEnd,
      status: signupData.status ?? 'active',
      convertedToUserId: signupData.convertedToUserId ?? null,
      notifiedAdmin: signupData.notifiedAdmin ?? false,
      createdAt: new Date()
    };
    this.trialSignups.set(id, signup);
    return signup;
  }

  async convertTrialSignup(signupId: string, userId: string): Promise<TrialSignup | undefined> {
    const signup = this.trialSignups.get(signupId);
    if (!signup) return undefined;

    const updatedSignup: TrialSignup = {
      ...signup,
      status: 'converted',
      convertedToUserId: userId
    };
    this.trialSignups.set(signupId, updatedSignup);
    return updatedSignup;
  }

  async markTrialExpired(signupId: string): Promise<TrialSignup | undefined> {
    const signup = this.trialSignups.get(signupId);
    if (!signup) return undefined;

    const updatedSignup: TrialSignup = {
      ...signup,
      status: 'expired'
    };
    this.trialSignups.set(signupId, updatedSignup);
    return updatedSignup;
  }

  // GMB Post methods
  async getGmbPost(id: string): Promise<GmbPost | undefined> {
    return this.gmbPosts.get(id);
  }

  async getGmbPostsByLocation(locationId: string, filters?: {
    status?: string;
    postType?: string;
    startDate?: Date;
    endDate?: Date;
    limit?: number;
  }): Promise<GmbPost[]> {
    let posts = Array.from(this.gmbPosts.values()).filter(
      post => post.locationId === locationId
    );

    if (filters) {
      if (filters.status) {
        posts = posts.filter(post => post.status === filters.status);
      }
      if (filters.postType) {
        posts = posts.filter(post => post.postType === filters.postType);
      }
      if (filters.startDate) {
        posts = posts.filter(post => 
          new Date(post.createdAt) >= filters.startDate!
        );
      }
      if (filters.endDate) {
        posts = posts.filter(post => 
          new Date(post.createdAt) <= filters.endDate!
        );
      }
      if (filters.limit) {
        posts = posts.slice(0, filters.limit);
      }
    }

    return posts.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  async createGmbPost(postData: Omit<InsertGmbPost, 'id'>): Promise<GmbPost> {
    const id = randomUUID();
    const post: GmbPost = {
      ...postData,
      id,
      title: postData.title ?? null,
      callToAction: postData.callToAction ?? null,
      buttonUrl: postData.buttonUrl ?? null,
      imageUrl: postData.imageUrl ?? null,
      scheduledDate: postData.scheduledDate ?? null,
      publishedDate: postData.publishedDate ?? null,
      status: postData.status ?? 'draft',
      gmbPostId: postData.gmbPostId ?? null,
      engagement: postData.engagement ?? 0,
      clicks: postData.clicks ?? 0,
      views: postData.views ?? 0,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.gmbPosts.set(id, post);
    return post;
  }

  async updateGmbPost(postId: string, updateData: Partial<GmbPost>): Promise<GmbPost | undefined> {
    const existingPost = this.gmbPosts.get(postId);
    if (!existingPost) return undefined;

    const updatedPost: GmbPost = {
      ...existingPost,
      ...updateData,
      updatedAt: new Date()
    };
    this.gmbPosts.set(postId, updatedPost);
    return updatedPost;
  }

  async updateGmbPostStatus(postId: string, status: string, gmbPostId?: string): Promise<GmbPost | undefined> {
    const post = this.gmbPosts.get(postId);
    if (!post) return undefined;

    const updatedPost: GmbPost = {
      ...post,
      status,
      gmbPostId: gmbPostId ?? post.gmbPostId,
      publishedDate: status === 'published' ? new Date() : post.publishedDate,
      updatedAt: new Date()
    };
    this.gmbPosts.set(postId, updatedPost);
    return updatedPost;
  }

  async updateGmbPostEngagement(postId: string, engagement: number, clicks: number, views: number): Promise<GmbPost | undefined> {
    const post = this.gmbPosts.get(postId);
    if (!post) return undefined;

    const updatedPost: GmbPost = {
      ...post,
      engagement,
      clicks,
      views,
      updatedAt: new Date()
    };
    this.gmbPosts.set(postId, updatedPost);
    return updatedPost;
  }

  // Report Export methods
  async getReportExport(id: string): Promise<ReportExport | undefined> {
    return this.reportExports.get(id);
  }

  async getReportExportsByUser(userId: string): Promise<ReportExport[]> {
    return Array.from(this.reportExports.values()).filter(
      report => report.userId === userId
    ).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async createReportExport(reportData: Omit<InsertReportExport, 'id'>): Promise<ReportExport> {
    const id = randomUUID();
    const report: ReportExport = {
      ...reportData,
      id,
      filters: reportData.filters ?? null,
      status: reportData.status ?? 'processing',
      fileUrl: reportData.fileUrl ?? null,
      fileSize: reportData.fileSize ?? null,
      expiresAt: reportData.expiresAt ?? null,
      errorMessage: reportData.errorMessage ?? null,
      createdAt: new Date()
    };
    this.reportExports.set(id, report);
    return report;
  }

  async updateReportExportStatus(reportId: string, status: string, fileUrl?: string, fileSize?: number, errorMessage?: string): Promise<ReportExport | undefined> {
    const report = this.reportExports.get(reportId);
    if (!report) return undefined;

    const updatedReport: ReportExport = {
      ...report,
      status,
      fileUrl: fileUrl ?? report.fileUrl,
      fileSize: fileSize ?? report.fileSize,
      errorMessage: errorMessage ?? report.errorMessage,
      expiresAt: status === 'completed' && fileUrl ? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) : report.expiresAt // 7 days from now
    };
    this.reportExports.set(reportId, updatedReport);
    return updatedReport;
  }

  async getExpiredReportExports(): Promise<ReportExport[]> {
    const now = new Date();
    return Array.from(this.reportExports.values()).filter(
      report => report.expiresAt && new Date(report.expiresAt) < now
    );
  }

  // Admin User methods
  async getAdminUser(id: string): Promise<AdminUser | undefined> {
    return this.adminUsers.get(id);
  }

  async getAdminUserByUsername(username: string): Promise<AdminUser | undefined> {
    return Array.from(this.adminUsers.values()).find(
      admin => admin.username === username
    );
  }

  async getAdminUserByEmail(email: string): Promise<AdminUser | undefined> {
    return Array.from(this.adminUsers.values()).find(
      admin => admin.email === email
    );
  }

  async getAllAdminUsers(activeOnly: boolean = true): Promise<AdminUser[]> {
    let admins = Array.from(this.adminUsers.values());
    if (activeOnly) {
      admins = admins.filter(admin => admin.isActive);
    }
    return admins.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  }

  async createAdminUser(adminData: Omit<InsertAdminUser, 'id'>): Promise<AdminUser> {
    const id = randomUUID();
    const admin: AdminUser = {
      ...adminData,
      id,
      role: adminData.role ?? 'admin',
      lastLogin: adminData.lastLogin ?? null,
      isActive: adminData.isActive ?? true,
      createdAt: new Date()
    };
    this.adminUsers.set(id, admin);
    return admin;
  }

  async updateAdminUserLastLogin(adminId: string): Promise<AdminUser | undefined> {
    const admin = this.adminUsers.get(adminId);
    if (!admin) return undefined;

    const updatedAdmin: AdminUser = {
      ...admin,
      lastLogin: new Date()
    };
    this.adminUsers.set(adminId, updatedAdmin);
    return updatedAdmin;
  }

  async updateAdminUserStatus(adminId: string, isActive: boolean): Promise<AdminUser | undefined> {
    const admin = this.adminUsers.get(adminId);
    if (!admin) return undefined;

    const updatedAdmin: AdminUser = {
      ...admin,
      isActive
    };
    this.adminUsers.set(adminId, updatedAdmin);
    return updatedAdmin;
  }

  // Competitor Analysis methods
  async getCompetitorAnalysis(id: string): Promise<CompetitorAnalysisRecord | undefined> {
    return this.competitorAnalyses.get(id);
  }

  async getCompetitorAnalysesByLocation(locationId: string, analysisType?: string): Promise<CompetitorAnalysisRecord[]> {
    let analyses = Array.from(this.competitorAnalyses.values()).filter(
      analysis => analysis.locationId === locationId
    );

    if (analysisType) {
      analyses = analyses.filter(analysis => analysis.analysisType === analysisType);
    }

    return analyses.sort((a, b) => 
      new Date(b.analysisDate).getTime() - new Date(a.analysisDate).getTime()
    );
  }

  async getCompetitorAnalysisHistory(locationId: string, competitorName: string, days: number = 30): Promise<CompetitorAnalysisRecord[]> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    return Array.from(this.competitorAnalyses.values()).filter(
      analysis => analysis.locationId === locationId && 
                  analysis.competitorName === competitorName &&
                  new Date(analysis.analysisDate) >= startDate
    ).sort((a, b) => 
      new Date(b.analysisDate).getTime() - new Date(a.analysisDate).getTime()
    );
  }

  async createCompetitorAnalysis(analysisData: Omit<InsertCompetitorAnalysis, 'id'>): Promise<CompetitorAnalysisRecord> {
    const id = randomUUID();
    const analysis: CompetitorAnalysisRecord = {
      ...analysisData,
      id,
      competitorWebsite: analysisData.competitorWebsite ?? null,
      strengthsWeaknesses: analysisData.strengthsWeaknesses ?? null,
      recommendations: analysisData.recommendations ?? null,
      competitiveScore: analysisData.competitiveScore ?? null,
      marketPosition: analysisData.marketPosition ?? null,
      analysisDate: new Date()
    };
    this.competitorAnalyses.set(id, analysis);
    return analysis;
  }

  async getLatestCompetitorAnalyses(locationId: string): Promise<CompetitorAnalysisRecord[]> {
    const analyses = Array.from(this.competitorAnalyses.values()).filter(
      analysis => analysis.locationId === locationId
    );

    // Group by competitor name and return latest for each
    const latestByCompetitor = new Map<string, CompetitorAnalysisRecord>();
    analyses.forEach(analysis => {
      const existing = latestByCompetitor.get(analysis.competitorName);
      if (!existing || new Date(analysis.analysisDate) > new Date(existing.analysisDate)) {
        latestByCompetitor.set(analysis.competitorName, analysis);
      }
    });

    return Array.from(latestByCompetitor.values()).sort((a, b) => 
      new Date(b.analysisDate).getTime() - new Date(a.analysisDate).getTime()
    );
  }

  // Additional missing methods for interface compliance

  async getSubscriptionPlans(filters?: { activeOnly?: boolean }): Promise<SubscriptionPlan[]> {
    const plans = Array.from(this.subscriptionPlans.values());
    if (filters?.activeOnly !== undefined) {
      return plans.filter(plan => plan.isActive === filters.activeOnly);
    }
    return plans;
  }

  async getPaymentByMercadoPagoId(mercadoPagoId: string): Promise<Payment | undefined> {
    return Array.from(this.payments.values()).find(payment => payment.mercadoPagoPaymentId === mercadoPagoId);
  }

  async updatePaymentByMercadoPagoId(mercadoPagoId: string, updateData: Partial<Payment>): Promise<Payment | undefined> {
    const payment = await this.getPaymentByMercadoPagoId(mercadoPagoId);
    if (!payment) return undefined;

    const updatedPayment: Payment = {
      ...payment,
      ...updateData
    };
    this.payments.set(payment.id, updatedPayment);
    return updatedPayment;
  }

  async updateTrialSignup(signupId: string, updateData: Partial<TrialSignup>): Promise<TrialSignup | undefined> {
    const signup = this.trialSignups.get(signupId);
    if (!signup) return undefined;

    const updatedSignup: TrialSignup = {
      ...signup,
      ...updateData
    };
    this.trialSignups.set(signupId, updatedSignup);
    return updatedSignup;
  }

  async getTrialSignups(filters?: { status?: string; limit?: number }): Promise<TrialSignup[]> {
    let signups = Array.from(this.trialSignups.values());
    
    if (filters?.status) {
      signups = signups.filter(signup => signup.status === filters.status);
    }
    
    if (filters?.limit) {
      signups = signups.slice(0, filters.limit);
    }
    
    return signups.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  async getReviewSources(filters?: { locationId?: string; platform?: string }): Promise<ReviewSource[]> {
    let sources = Array.from(this.reviewSources.values());
    
    if (filters?.locationId) {
      sources = sources.filter(source => source.locationId === filters.locationId);
    }
    
    if (filters?.platform) {
      sources = sources.filter(source => source.sourceName === filters.platform);
    }
    
    return sources;
  }

  async deleteReviewSource(sourceId: string): Promise<boolean> {
    return this.reviewSources.delete(sourceId);
  }

  async getGmbPosts(filters?: { locationId?: string; status?: string; limit?: number }): Promise<GmbPost[]> {
    let posts = Array.from(this.gmbPosts.values());
    
    if (filters?.locationId) {
      posts = posts.filter(post => post.locationId === filters.locationId);
    }
    
    if (filters?.status) {
      posts = posts.filter(post => post.status === filters.status);
    }
    
    if (filters?.limit) {
      posts = posts.slice(0, filters.limit);
    }
    
    return posts.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  async deleteGmbPost(postId: string): Promise<boolean> {
    return this.gmbPosts.delete(postId);
  }

  async updateReportExport(reportId: string, updateData: Partial<ReportExport>): Promise<ReportExport | undefined> {
    const report = this.reportExports.get(reportId);
    if (!report) return undefined;

    const updatedReport: ReportExport = {
      ...report,
      ...updateData
    };
    this.reportExports.set(reportId, updatedReport);
    return updatedReport;
  }

  async getReportExports(filters?: { userId?: string; status?: string }): Promise<ReportExport[]> {
    let reports = Array.from(this.reportExports.values());
    
    if (filters?.userId) {
      reports = reports.filter(report => report.userId === filters.userId);
    }
    
    if (filters?.status) {
      reports = reports.filter(report => report.status === filters.status);
    }
    
    return reports.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  async createCompetitorAnalysisRecord(analysisData: Omit<InsertCompetitorAnalysis, 'id'>): Promise<CompetitorAnalysisRecord> {
    // This is just an alias for createCompetitorAnalysis
    return this.createCompetitorAnalysis(analysisData);
  }

  async getCompetitorAnalysisByLocation(locationId: string, filters?: { analysisType?: string; limit?: number }): Promise<CompetitorAnalysisRecord[]> {
    let analyses = Array.from(this.competitorAnalyses.values()).filter(
      analysis => analysis.locationId === locationId
    );

    if (filters?.analysisType) {
      analyses = analyses.filter(analysis => analysis.analysisType === filters.analysisType);
    }

    if (filters?.limit) {
      analyses = analyses.slice(0, filters.limit);
    }

    return analyses.sort((a, b) => 
      new Date(b.analysisDate).getTime() - new Date(a.analysisDate).getTime()
    );
  }

  // Statistics methods
  async getUserCount(): Promise<number> {
    return this.users.size;
  }

  async getBusinessCount(): Promise<number> {
    return this.businesses.size;
  }

  async getLocationCount(): Promise<number> {
    return this.locations.size;
  }

  async getActiveSubscriptionCount(): Promise<number> {
    return Array.from(this.subscriptions.values()).filter(sub => sub.status === 'active').length;
  }

  async getTrialSignupCount(): Promise<number> {
    return this.trialSignups.size;
  }
}

export const storage = new MemStorage();
