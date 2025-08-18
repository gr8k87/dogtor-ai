import { type User, type InsertUser, type Pet, type InsertPet, type Assessment, type InsertAssessment, type VetClinic, type InsertVetClinic } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // User methods
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Pet methods
  getPet(id: string): Promise<Pet | undefined>;
  getPetsByOwner(ownerId: string): Promise<Pet[]>;
  createPet(pet: InsertPet): Promise<Pet>;
  updatePet(id: string, pet: Partial<InsertPet>): Promise<Pet | undefined>;
  
  // Assessment methods
  getAssessment(id: string): Promise<Assessment | undefined>;
  getAssessmentsByPet(petId: string): Promise<Assessment[]>;
  createAssessment(assessment: InsertAssessment): Promise<Assessment>;
  updateAssessment(id: string, assessment: Partial<InsertAssessment>): Promise<Assessment | undefined>;
  
  // Vet clinic methods
  getVetClinics(): Promise<VetClinic[]>;
  getVetClinic(id: string): Promise<VetClinic | undefined>;
  createVetClinic(clinic: InsertVetClinic): Promise<VetClinic>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private pets: Map<string, Pet>;
  private assessments: Map<string, Assessment>;
  private vetClinics: Map<string, VetClinic>;

  constructor() {
    this.users = new Map();
    this.pets = new Map();
    this.assessments = new Map();
    this.vetClinics = new Map();
    
    // Initialize with some sample vet clinics
    this.initializeVetClinics();
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

  // Pet methods
  async getPet(id: string): Promise<Pet | undefined> {
    return this.pets.get(id);
  }

  async getPetsByOwner(ownerId: string): Promise<Pet[]> {
    return Array.from(this.pets.values());
  }

  async createPet(insertPet: InsertPet): Promise<Pet> {
    const id = randomUUID();
    const pet: Pet = { 
      ...insertPet, 
      id, 
      createdAt: new Date() 
    };
    this.pets.set(id, pet);
    return pet;
  }

  async updatePet(id: string, petUpdate: Partial<InsertPet>): Promise<Pet | undefined> {
    const existing = this.pets.get(id);
    if (!existing) return undefined;
    
    const updated: Pet = { ...existing, ...petUpdate };
    this.pets.set(id, updated);
    return updated;
  }

  // Assessment methods
  async getAssessment(id: string): Promise<Assessment | undefined> {
    return this.assessments.get(id);
  }

  async getAssessmentsByPet(petId: string): Promise<Assessment[]> {
    return Array.from(this.assessments.values())
      .filter(assessment => assessment.petId === petId)
      .sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0));
  }

  async createAssessment(insertAssessment: InsertAssessment): Promise<Assessment> {
    const id = randomUUID();
    const assessment: Assessment = { 
      ...insertAssessment, 
      id, 
      createdAt: new Date() 
    };
    this.assessments.set(id, assessment);
    return assessment;
  }

  async updateAssessment(id: string, assessmentUpdate: Partial<InsertAssessment>): Promise<Assessment | undefined> {
    const existing = this.assessments.get(id);
    if (!existing) return undefined;
    
    const updated: Assessment = { ...existing, ...assessmentUpdate };
    this.assessments.set(id, updated);
    return updated;
  }

  // Vet clinic methods
  async getVetClinics(): Promise<VetClinic[]> {
    return Array.from(this.vetClinics.values());
  }

  async getVetClinic(id: string): Promise<VetClinic | undefined> {
    return this.vetClinics.get(id);
  }

  async createVetClinic(insertClinic: InsertVetClinic): Promise<VetClinic> {
    const id = randomUUID();
    const clinic: VetClinic = { ...insertClinic, id };
    this.vetClinics.set(id, clinic);
    return clinic;
  }

  private initializeVetClinics() {
    const clinics = [
      {
        id: randomUUID(),
        name: "Valley Animal Hospital",
        address: "123 Oak Street, Springfield",
        phone: "(555) 123-4567",
        rating: "4.8",
        distance: "0.8 miles",
        status: "open"
      },
      {
        id: randomUUID(),
        name: "Pet Care Central",
        address: "456 Main Ave, Springfield",
        phone: "(555) 987-6543",
        rating: "4.6",
        distance: "1.2 miles",
        status: "busy"
      }
    ];

    clinics.forEach(clinic => {
      this.vetClinics.set(clinic.id, clinic);
    });
  }
}

export const storage = new MemStorage();
