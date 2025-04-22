import { websites, type Website, type InsertWebsite } from "@shared/schema";

export interface IStorage {
  createWebsite(website: InsertWebsite): Promise<Website>;
  getWebsite(id: number): Promise<Website | undefined>;
  getAllWebsites(): Promise<Website[]>;
}

export class MemStorage implements IStorage {
  private websites: Map<number, Website>;
  currentId: number;

  constructor() {
    this.websites = new Map();
    this.currentId = 1;
  }

  async createWebsite(insertWebsite: InsertWebsite): Promise<Website> {
    const id = this.currentId++;
    const createdAt = Math.floor(Date.now() / 1000);
    const website: Website = { ...insertWebsite, id, createdAt };
    this.websites.set(id, website);
    return website;
  }

  async getWebsite(id: number): Promise<Website | undefined> {
    return this.websites.get(id);
  }

  async getAllWebsites(): Promise<Website[]> {
    return Array.from(this.websites.values());
  }
}

export const storage = new MemStorage();
