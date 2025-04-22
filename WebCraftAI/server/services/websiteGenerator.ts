import { generateWebsiteContent, generateWebsiteCode, checkAvailableAI, GenerationApproach } from "./aiService";
import { type WebsiteRequest } from "@shared/schema";
import { storage } from "../storage";

/**
 * Generates a website based on the provided prompt and template
 */
export async function generateWebsite(request: WebsiteRequest) {
  try {
    // Get the generation approach from the environment or use the default hybrid approach
    const approachStr = process.env.GENERATION_APPROACH || GenerationApproach.Hybrid;
    const approach = approachStr as GenerationApproach;
    
    // Check available AI services
    const available = checkAvailableAI();
    if (!available.gemini && !available.openai && approach !== GenerationApproach.TemplateBased) {
      throw new Error("No AI service is available. Please set up either GEMINI_API_KEY or OPENAI_API_KEY.");
    }
    
    console.log(`Generating website with approach: ${approach}, template: ${request.templateId}`);
    
    // Step 1: Generate website content using the appropriate AI service
    const content = await generateWebsiteContent(request.prompt, request.templateId, approach);
    
    // Step 2: Generate HTML and CSS based on the approach
    const { html, css } = await generateWebsiteCode(content, request.templateId, approach);
    
    // Step 3: Save the website to storage
    const website = await storage.createWebsite({
      prompt: request.prompt,
      templateId: request.templateId,
      content: content,
      html: html,
      css: css,
    });
    
    return website;
  } catch (error) {
    console.error("Error in website generation process:", error);
    throw error;
  }
}

/**
 * Creates a ZIP package with the website files
 */
export async function createWebsiteZipPackage(html: string, css: string): Promise<Buffer> {
  try {
    // Use dynamic import instead of require for better compatibility with ESM
    const JSZipModule = await import('jszip');
    const JSZip = JSZipModule.default;
    
    // Create a new ZIP file
    const zip = new JSZip();
    
    // Add the website files
    zip.file("index.html", html);
    zip.file("styles.css", css);
    zip.file("script.js", "// Your website's JavaScript");
    
    // Add a README file
    zip.file("README.md", `# Your Generated Website

This package contains the files for your website created with WebCraft AI:

- index.html - The main HTML file
- styles.css - The CSS styles for your website
- script.js - A JavaScript file for interactive features

## How to use
1. Extract all files to a folder
2. Open index.html in your browser to view locally
3. Upload all files to your web hosting service to publish online
`);
    
    // Generate the ZIP file as a buffer
    return await zip.generateAsync({ type: "nodebuffer" });
  } catch (error) {
    console.error("Error creating ZIP package:", error);
    throw new Error(`Failed to create website ZIP package: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}