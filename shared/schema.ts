// ================================================
// TypeScript Types for Supabase Database Schema
// ================================================

// User table types
export interface User {
  id: string;
  auth_method: 'google' | 'email';
  
  // Google OAuth fields
  google_id?: string;
  email: string;
  email_verified: boolean;
  first_name?: string;
  last_name?: string;  
  full_name?: string;
  profile_image_url?: string;
  
  // Email signup fields
  password_hash?: string; // NULL for Google users
  
  // Pet information fields
  pet_name?: string;
  pet_breed?: string;
  pet_age?: number;
  pet_gender?: string;
  
  // System fields
  created_at: string;
  updated_at: string;
  last_login_at?: string;
  is_active: boolean;
}

// User insert type (for creating new users)
export interface UserInsert {
  auth_method: 'google' | 'email';
  google_id?: string;
  email: string;
  email_verified?: boolean;
  first_name?: string;
  last_name?: string;
  full_name?: string;
  profile_image_url?: string;
  password_hash?: string;
  pet_name?: string;
  pet_breed?: string;
  pet_age?: number;
  pet_gender?: string;
}

// User update type (for updating existing users)
export interface UserUpdate {
  email?: string;
  first_name?: string;
  last_name?: string;
  full_name?: string;
  profile_image_url?: string;
  pet_name?: string;
  pet_breed?: string;
  pet_age?: number;
  pet_gender?: string;
  last_login_at?: string;
  is_active?: boolean;
}

// Session table types (for express-session storage)
export interface Session {
  sid: string;
  sess: Record<string, any>;
  expire: string;
}

// Updated History table type (now with proper user reference)
export interface History {
  id: string;
  prompt: string;
  response: string;
  user_id?: string; // Now references users.id
  created_at: string;
}

// History insert type
export interface HistoryInsert {
  prompt: string;
  response: string;
  user_id?: string;
}

// Updated Cases table type (now with user reference)
export interface Case {
  id: string;
  symptoms: string;
  image_url?: string;
  status: string;
  questions?: Record<string, any>;
  user_id?: string; // New field references users.id
  created_at: string;
}

// Case insert type
export interface CaseInsert {
  symptoms: string;
  image_url?: string;
  status: string;
  questions?: Record<string, any>;
  user_id?: string;
}

// ================================================
// Helper Types for Authentication
// ================================================

// Google OAuth user data from Google's response
export interface GoogleOAuthUser {
  id: string;
  email: string;
  verified_email: boolean;
  name: string;
  given_name: string;
  family_name: string;
  picture: string;
}

// Login form data
export interface EmailLoginData {
  email: string;
  password: string;
}

// Email signup form data  
export interface EmailSignupData {
  email: string;
  password: string;
  pet_name: string;
  pet_breed: string;
}

// Profile completion form data
export interface ProfileCompletionData {
  pet_name: string;
  pet_breed: string;
  pet_age?: number;
  pet_gender?: string;
}

// ================================================
// Database Service Interface
// ================================================

export interface DatabaseService {
  // User operations
  getUserById(id: string): Promise<User | null>;
  getUserByEmail(email: string): Promise<User | null>;
  getUserByGoogleId(googleId: string): Promise<User | null>;
  createUser(userData: UserInsert): Promise<User>;
  updateUser(id: string, userData: UserUpdate): Promise<User>;
  
  // History operations (updated to use user_id)
  getHistoryByUserId(userId: string): Promise<History[]>;
  createHistory(historyData: HistoryInsert): Promise<History>;
  deleteHistory(id: string, userId: string): Promise<boolean>;
  
  // Cases operations (updated to use user_id)
  getCasesByUserId(userId: string): Promise<Case[]>;
  createCase(caseData: CaseInsert): Promise<Case>;
  updateCase(id: string, caseData: Partial<CaseInsert>): Promise<Case>;
  getCaseById(id: string, userId?: string): Promise<Case | null>;
}