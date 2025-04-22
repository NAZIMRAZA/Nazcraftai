import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { websiteRequestSchema } from "@shared/schema";
import { generateWebsite, createWebsiteZipPackage } from "./services/websiteGenerator";

export async function registerRoutes(app: Express): Promise<Server> {
  // API endpoint to generate a website
  app.post("/api/websites", async (req: Request, res: Response) => {
    try {
      // Validate the request body
      const result = websiteRequestSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ 
          message: "Invalid request",
          errors: result.error.format() 
        });
      }

      // Generate the website
      const website = await generateWebsite(result.data);
      
      return res.status(201).json(website);
    } catch (error) {
      console.error("Error generating website:", error);
      return res.status(500).json({ 
        message: "Failed to generate website",
        error: error instanceof Error ? error.message : "Unknown error" 
      });
    }
  });

  // API endpoint to get a specific website
  app.get("/api/websites/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid website ID" });
      }

      const website = await storage.getWebsite(id);
      if (!website) {
        return res.status(404).json({ message: "Website not found" });
      }

      return res.status(200).json(website);
    } catch (error) {
      console.error("Error retrieving website:", error);
      return res.status(500).json({ 
        message: "Failed to retrieve website",
        error: error instanceof Error ? error.message : "Unknown error" 
      });
    }
  });

  // API endpoint to get all websites
  app.get("/api/websites", async (_req: Request, res: Response) => {
    try {
      const websites = await storage.getAllWebsites();
      return res.status(200).json(websites);
    } catch (error) {
      console.error("Error retrieving websites:", error);
      return res.status(500).json({ 
        message: "Failed to retrieve websites",
        error: error instanceof Error ? error.message : "Unknown error" 
      });
    }
  });

  // API endpoint to download a website as a ZIP package
  app.get("/api/websites/:id/download", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid website ID" });
      }

      const website = await storage.getWebsite(id);
      if (!website) {
        return res.status(404).json({ message: "Website not found" });
      }

      // Create a ZIP package with the website files
      const zipBuffer = await createWebsiteZipPackage(website.html, website.css);
      
      // Set headers for file download
      res.setHeader('Content-Disposition', `attachment; filename="website-${id}.zip"`);
      res.setHeader('Content-Type', 'application/zip');
      
      // Send the ZIP file
      return res.send(zipBuffer);
    } catch (error) {
      console.error("Error downloading website:", error);
      return res.status(500).json({ 
        message: "Failed to download website",
        error: error instanceof Error ? error.message : "Unknown error" 
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
