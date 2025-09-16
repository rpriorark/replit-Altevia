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
  type InsertPostingSchedule
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
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private businesses: Map<string, Business>;
  private locations: Map<string, Location>;
  private contentCalendarPosts: Map<string, ContentCalendarPost>;
  private postingSchedules: Map<string, PostingSchedule>;

  constructor() {
    this.users = new Map();
    this.businesses = new Map();
    this.locations = new Map();
    this.contentCalendarPosts = new Map();
    this.postingSchedules = new Map();

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
}

export const storage = new MemStorage();
