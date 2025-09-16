import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { storage } from '../storage';

const SALT_ROUNDS = 12;
const SESSION_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours

export interface AuthSession {
  userId: string;
  username: string;
  sessionToken: string;
  expiresAt: Date;
}

// In-memory session store (in production, use Redis or database)
const activeSessions = new Map<string, AuthSession>();

export class AuthService {
  /**
   * Hash a password using bcrypt
   */
  static async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, SALT_ROUNDS);
  }

  /**
   * Verify a password against its hash
   */
  static async verifyPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  /**
   * Generate a secure session token
   */
  static generateSessionToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * Authenticate user and create session
   */
  static async loginUser(username: string, password: string): Promise<AuthSession | null> {
    try {
      // Get user from storage (this would need to be implemented)
      const user = await storage.getUserByUsername(username);
      
      if (!user) {
        return null;
      }

      // Check if password is hashed (starts with $2b$ for bcrypt)
      let isValidPassword = false;
      
      if (user.password.startsWith('$2b$')) {
        // Password is already hashed, verify with bcrypt
        isValidPassword = await this.verifyPassword(password, user.password);
      } else {
        // Legacy plaintext password, verify directly and then hash it
        if (user.password === password) {
          isValidPassword = true;
          // Upgrade to hashed password
          const hashedPassword = await this.hashPassword(password);
          await storage.updateUserPassword(user.id, hashedPassword);
        }
      }

      if (!isValidPassword) {
        return null;
      }

      // Create session
      const sessionToken = this.generateSessionToken();
      const expiresAt = new Date(Date.now() + SESSION_EXPIRY);
      
      const session: AuthSession = {
        userId: user.id,
        username: user.username,
        sessionToken,
        expiresAt
      };

      activeSessions.set(sessionToken, session);
      
      return session;
    } catch (error) {
      console.error('Login error:', error);
      return null;
    }
  }

  /**
   * Validate a session token
   */
  static validateSession(sessionToken: string): AuthSession | null {
    const session = activeSessions.get(sessionToken);
    
    if (!session) {
      return null;
    }

    // Check if session is expired
    if (session.expiresAt < new Date()) {
      activeSessions.delete(sessionToken);
      return null;
    }

    return session;
  }

  /**
   * Logout user (invalidate session)
   */
  static logout(sessionToken: string): void {
    activeSessions.delete(sessionToken);
  }

  /**
   * Create admin user with hashed password
   */
  static async createAdminUser(username: string, password: string): Promise<boolean> {
    try {
      const hashedPassword = await this.hashPassword(password);
      
      await storage.createUser({
        username,
        password: hashedPassword
      });
      
      return true;
    } catch (error) {
      console.error('Error creating admin user:', error);
      return false;
    }
  }

  /**
   * Middleware to protect admin routes
   */
  static requireAdminAuth(req: any, res: any, next: any) {
    const sessionToken = req.headers.authorization?.replace('Bearer ', '') || 
                        req.cookies?.sessionToken ||
                        req.session?.sessionToken;

    if (!sessionToken) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const session = AuthService.validateSession(sessionToken);
    
    if (!session) {
      return res.status(401).json({ error: 'Invalid or expired session' });
    }

    // Attach user info to request
    req.user = {
      id: session.userId,
      username: session.username
    };

    next();
  }

  /**
   * Clean up expired sessions
   */
  static cleanupExpiredSessions(): void {
    const now = new Date();
    
    for (const [token, session] of Array.from(activeSessions.entries())) {
      if (session.expiresAt < now) {
        activeSessions.delete(token);
      }
    }
  }
}

// Run cleanup every hour
setInterval(() => {
  AuthService.cleanupExpiredSessions();
}, 60 * 60 * 1000);

export default AuthService;