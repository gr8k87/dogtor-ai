import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertPetSchema, insertAssessmentSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Health check endpoint
  app.get("/health", (_req, res) => {
    res.json({ ok: true });
  });

  // Pet routes
  app.post("/api/pets", async (req, res) => {
    try {
      const petData = insertPetSchema.parse(req.body);
      const pet = await storage.createPet(petData);
      res.json(pet);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid pet data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create pet" });
      }
    }
  });

  app.get("/api/pets", async (_req, res) => {
    try {
      const pets = await storage.getPetsByOwner("default");
      res.json(pets);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch pets" });
    }
  });

  app.get("/api/pets/:id", async (req, res) => {
    try {
      const pet = await storage.getPet(req.params.id);
      if (!pet) {
        res.status(404).json({ message: "Pet not found" });
        return;
      }
      res.json(pet);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch pet" });
    }
  });

  // Assessment routes
  app.post("/api/assessments", async (req, res) => {
    try {
      const assessmentData = insertAssessmentSchema.parse(req.body);
      const assessment = await storage.createAssessment(assessmentData);
      res.json(assessment);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid assessment data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create assessment" });
      }
    }
  });

  app.get("/api/assessments/:petId", async (req, res) => {
    try {
      const assessments = await storage.getAssessmentsByPet(req.params.petId);
      res.json(assessments);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch assessments" });
    }
  });

  // Vet clinic routes
  app.get("/api/vet-clinics", async (_req, res) => {
    try {
      const clinics = await storage.getVetClinics();
      res.json(clinics);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch vet clinics" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
