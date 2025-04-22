// server/index.ts
import express2 from "express";

// server/routes.ts
import { createServer } from "http";

// server/storage.ts
var MemStorage = class {
  websites;
  currentId;
  constructor() {
    this.websites = /* @__PURE__ */ new Map();
    this.currentId = 1;
  }
  async createWebsite(insertWebsite) {
    const id = this.currentId++;
    const createdAt = Math.floor(Date.now() / 1e3);
    const website = { ...insertWebsite, id, createdAt };
    this.websites.set(id, website);
    return website;
  }
  async getWebsite(id) {
    return this.websites.get(id);
  }
  async getAllWebsites() {
    return Array.from(this.websites.values());
  }
};
var storage = new MemStorage();

// shared/schema.ts
import { pgTable, text, serial, json, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
var websites = pgTable("websites", {
  id: serial("id").primaryKey(),
  prompt: text("prompt").notNull(),
  templateId: text("template_id").notNull(),
  content: json("content").notNull(),
  html: text("html").notNull(),
  css: text("css").notNull(),
  createdAt: integer("created_at").notNull()
});
var insertWebsiteSchema = createInsertSchema(websites).omit({
  id: true,
  createdAt: true
});
var websiteRequestSchema = z.object({
  prompt: z.string().min(1).max(5e3),
  // Increased from 1000 to 5000 character limit
  templateId: z.string().min(1).max(100)
});

// server/services/openai.ts
import OpenAI from "openai";
var openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY || "sk-your-api-key" });
function getPlaceholderImageUrl(category, width = 800, height = 600) {
  const categoryCollections = {
    business: "3330445",
    creative: "4473755",
    professional: "3330448",
    technology: "9270463",
    food: "3356576",
    nature: "3330448",
    fashion: "3330453",
    travel: "3356584",
    health: "3657445",
    education: "3657442",
    default: "3330445"
  };
  const collection = categoryCollections[category.toLowerCase()] || categoryCollections.default;
  return `https://source.unsplash.com/collection/${collection}/${width}x${height}`;
}
async function generateWebsiteContent(prompt, templateType) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error("OPENAI_API_KEY environment variable is not set");
    }
    const systemPrompt = `You are a website design expert. Based on the user's description, generate a complete website structure with appropriate content.
    Respond in JSON format with the following structure:
    {
      "title": "Website Title",
      "description": "Meta description for the website",
      "sections": [
        {
          "type": "header",
          "title": "Brand Name",
          "logoText": "Brand Initial or Name" 
        },
        {
          "type": "hero",
          "title": "Main Headline",
          "content": "Subheading or description",
          "ctaText": "Call to action button text",
          "imageCategory": "Category for hero image (business, creative, technology, etc.)"
        },
        {
          "type": "about",
          "title": "About Us Section Title",
          "content": "Detailed about us content. At least 2-3 paragraphs.",
          "imageCategory": "Category for about image"
        },
        {
          "type": "features",
          "title": "Features or Services Section Title",
          "subtitle": "Optional subtitle explaining the features/services",
          "items": [
            { 
              "title": "Feature 1", 
              "description": "Detailed description of feature 1", 
              "icon": "fa-icon-name" 
            },
            { 
              "title": "Feature 2", 
              "description": "Detailed description of feature 2", 
              "icon": "fa-icon-name" 
            },
            { 
              "title": "Feature 3", 
              "description": "Detailed description of feature 3", 
              "icon": "fa-icon-name" 
            }
          ]
        },
        {
          "type": "gallery",
          "title": "Portfolio or Gallery Section Title",
          "subtitle": "Optional subtitle explaining the gallery contents",
          "items": [
            { 
              "title": "Project/Item 1", 
              "description": "Detailed description of item 1", 
              "category": "Image category for item 1 (e.g., business, food)",
              "size": "large" 
            },
            { 
              "title": "Project/Item 2", 
              "description": "Detailed description of item 2", 
              "category": "Image category for item 2",
              "size": "medium" 
            },
            { 
              "title": "Project/Item 3", 
              "description": "Detailed description of item 3", 
              "category": "Image category for item 3",
              "size": "medium" 
            },
            { 
              "title": "Project/Item 4", 
              "description": "Detailed description of item 4", 
              "category": "Image category for item 4",
              "size": "small" 
            }
          ]
        },
        {
          "type": "testimonials",
          "title": "Testimonials or Reviews Section Title",
          "subtitle": "What our clients say about us",
          "items": [
            { 
              "name": "Person 1 Full Name", 
              "role": "Professional Role or Company", 
              "content": "Detailed testimonial quote that's at least 2-3 sentences long",
              "imageCategory": "business" 
            },
            { 
              "name": "Person 2 Full Name", 
              "role": "Professional Role or Company", 
              "content": "Detailed testimonial quote that's at least 2-3 sentences long",
              "imageCategory": "business" 
            },
            { 
              "name": "Person 3 Full Name", 
              "role": "Professional Role or Company", 
              "content": "Detailed testimonial quote that's at least 2-3 sentences long",
              "imageCategory": "business" 
            }
          ]
        },
        {
          "type": "pricing",
          "title": "Our Pricing Plans",
          "subtitle": "Choose the plan that fits your needs",
          "items": [
            {
              "title": "Basic Plan",
              "price": "$XX/month",
              "features": ["Feature 1", "Feature 2", "Feature 3"],
              "ctaText": "Get Started"
            },
            {
              "title": "Standard Plan",
              "price": "$XX/month",
              "features": ["Everything in Basic", "Feature 4", "Feature 5", "Feature 6"],
              "ctaText": "Get Started",
              "highlighted": true
            },
            {
              "title": "Premium Plan",
              "price": "$XX/month",
              "features": ["Everything in Standard", "Feature 7", "Feature 8", "Feature 9"],
              "ctaText": "Get Started"
            }
          ]
        },
        {
          "type": "cta",
          "title": "Call to Action Section Title",
          "content": "Persuasive call to action text",
          "buttonText": "Action Button Text",
          "imageCategory": "relevant category"
        },
        {
          "type": "contact",
          "title": "Contact Us Section Title",
          "content": "Text explaining how to get in touch",
          "email": "contact@example.com",
          "phone": "+1 (555) 123-4567",
          "address": "123 Street Name, City, State, ZIP",
          "mapEmbedUrl": "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d12345.67890!2d-73.9!3d40.7!1m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNDDCsDQ2JzI1LjEiTiA3M8KwNTQnMC4wIlc!5e0!3m2!1sen!2sus!4v1234567890!5m2!1sen!2sus"
        },
        {
          "type": "footer",
          "companyName": "Company or Brand Name",
          "tagline": "Brief company tagline",
          "socialLinks": [
            {"platform": "facebook", "url": "https://facebook.com/"},
            {"platform": "twitter", "url": "https://twitter.com/"},
            {"platform": "instagram", "url": "https://instagram.com/"},
            {"platform": "linkedin", "url": "https://linkedin.com/"}
          ],
          "navigationSections": [
            {
              "title": "Company",
              "links": [
                {"text": "About", "url": "#about"},
                {"text": "Services", "url": "#services"},
                {"text": "Team", "url": "#team"}
              ]
            },
            {
              "title": "Resources",
              "links": [
                {"text": "Blog", "url": "#blog"},
                {"text": "FAQ", "url": "#faq"},
                {"text": "Support", "url": "#support"}
              ]
            },
            {
              "title": "Legal",
              "links": [
                {"text": "Privacy Policy", "url": "#privacy"},
                {"text": "Terms of Service", "url": "#terms"}
              ]
            }
          ],
          "copyright": "\xA9 2025 Company Name. All rights reserved."
        }
      ],
      "colorScheme": "primary", // One of: primary, blue, green, red, yellow, purple
      "fontStyle": "modern", // One of: modern, classic, minimal, playful, professional
      "imageStyle": "modern" // One of: modern, vintage, minimalist, bold, professional
    }
    
    Use the template style "${templateType}" as a guide for the overall design approach.
    Create realistic, detailed, and contextually appropriate content based on the user's prompt.
    All sections should be logical and relevant to the website purpose.
    For the "icon" fields, use FontAwesome 5 icon names (e.g., "fa-chart-line", "fa-shield-alt").
    For imageCategory, provide categories like: business, technology, nature, food, fashion, etc.`;
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: prompt }
      ],
      response_format: { type: "json_object" }
    });
    return JSON.parse(response.choices[0].message.content || "{}");
  } catch (error) {
    console.error("Error generating website content with OpenAI:", error);
    throw new Error(`Failed to generate website content: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
}
async function generateWebsiteCode(content, templateType) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error("OPENAI_API_KEY environment variable is not set");
    }
    const prompt = `
    Generate HTML and CSS code for a professional, modern, and visually appealing website based on the following structure:
    ${JSON.stringify(content, null, 2)}
    
    Use the template style "${templateType}" as a guide for the overall design aesthetics.
    
    IMPORTANT GUIDELINES:
    1. The HTML should be modern, semantic, and fully responsive for all devices
    2. The CSS should incorporate the specified color scheme and font style from the content
    3. Use Font Awesome 5 icons where icon names are specified
    4. Include placeholder images from Unsplash where needed (https://source.unsplash.com/collection/3330445/800x600)
    5. Create an engaging, professional design with appropriate spacing, shadows, and animations
    6. Ensure the design has visual hierarchy with proper color contrast
    7. Include hover effects for interactive elements
    8. Implement a responsive navigation system that works on mobile
    9. Use modern CSS techniques like flexbox, grid, and CSS variables
    10. Add subtle animations for better UX (like hover states, fade-ins, etc.)
    11. Include a favicon link (you can use a placeholder)
    12. Add meta tags for SEO
    13. Link to Google Fonts for typography
    14. Include all necessary FontAwesome and external CSS/JS libraries in the HTML head
    
    Respond with JSON in this format (provide complete working code):
    {
      "html": "<!-- Your complete HTML code with all necessary CDN links and meta tags -->",
      "css": "/* Your complete CSS code with all styles necessary for the website */"
    }
    `;
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a web development expert who specializes in creating beautiful, modern websites with clean, professional code. Your websites should be visually appealing with proper spacing, typography, and color usage."
        },
        { role: "user", content: prompt }
      ],
      response_format: { type: "json_object" }
    });
    try {
      const generatedCode = JSON.parse(response.choices[0].message.content || "{}");
      let processedHtml = generatedCode.html;
      const genericPlaceholderPattern = /https:\/\/source\.unsplash\.com\/\w+\/\d+x\d+/g;
      processedHtml = processedHtml.replace(genericPlaceholderPattern, (match) => {
        const dimensions = match.match(/(\d+)x(\d+)/);
        if (dimensions) {
          return getPlaceholderImageUrl("default", parseInt(dimensions[1]), parseInt(dimensions[2]));
        }
        return match;
      });
      return {
        html: processedHtml,
        css: generatedCode.css
      };
    } catch (parseError) {
      console.error("Error parsing generated code:", parseError);
      throw new Error(`Failed to parse generated website code: ${parseError instanceof Error ? parseError.message : "Unknown error"}`);
    }
  } catch (error) {
    console.error("Error generating website code with OpenAI:", error);
    throw new Error(`Failed to generate website code: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
}

// server/services/gemini.ts
import { GoogleGenerativeAI } from "@google/generative-ai";
var geminiApiKey = process.env.GEMINI_API_KEY || "";
var genAI = new GoogleGenerativeAI(geminiApiKey);
function getPlaceholderImageUrl2(category, width = 800, height = 600) {
  const categoryCollections = {
    business: "3330445",
    creative: "4473755",
    professional: "3330448",
    technology: "9270463",
    food: "3356576",
    nature: "3330448",
    fashion: "3330453",
    travel: "3356584",
    health: "3657445",
    education: "3657442",
    default: "3330445"
  };
  const collection = categoryCollections[category.toLowerCase()] || categoryCollections.default;
  return `https://source.unsplash.com/collection/${collection}/${width}x${height}`;
}
async function generateWebsiteContentWithGemini(prompt, templateType) {
  try {
    if (!geminiApiKey) {
      throw new Error("GEMINI_API_KEY environment variable is not set");
    }
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
    const systemPrompt = `You are a website design expert. Based on the user's description, generate a complete website structure with appropriate content.
    Respond in JSON format with the following structure:
    {
      "title": "Website Title",
      "description": "Meta description for the website",
      "sections": [
        {
          "type": "header",
          "title": "Brand Name",
          "logoText": "Brand Initial or Name" 
        },
        {
          "type": "hero",
          "title": "Main Headline",
          "content": "Subheading or description",
          "ctaText": "Call to action button text",
          "imageCategory": "Category for hero image (business, creative, technology, etc.)"
        },
        {
          "type": "about",
          "title": "About Us Section Title",
          "content": "Detailed about us content. At least 2-3 paragraphs.",
          "imageCategory": "Category for about image"
        },
        {
          "type": "features",
          "title": "Features or Services Section Title",
          "subtitle": "Optional subtitle explaining the features/services",
          "items": [
            { 
              "title": "Feature 1", 
              "description": "Detailed description of feature 1", 
              "icon": "fa-icon-name" 
            },
            { 
              "title": "Feature 2", 
              "description": "Detailed description of feature 2", 
              "icon": "fa-icon-name" 
            },
            { 
              "title": "Feature 3", 
              "description": "Detailed description of feature 3", 
              "icon": "fa-icon-name" 
            }
          ]
        },
        {
          "type": "gallery",
          "title": "Portfolio or Gallery Section Title",
          "subtitle": "Optional subtitle explaining the gallery contents",
          "items": [
            { 
              "title": "Project/Item 1", 
              "description": "Detailed description of item 1", 
              "category": "Image category for item 1 (e.g., business, food)",
              "size": "large" 
            },
            { 
              "title": "Project/Item 2", 
              "description": "Detailed description of item 2", 
              "category": "Image category for item 2",
              "size": "medium" 
            },
            { 
              "title": "Project/Item 3", 
              "description": "Detailed description of item 3", 
              "category": "Image category for item 3",
              "size": "medium" 
            },
            { 
              "title": "Project/Item 4", 
              "description": "Detailed description of item 4", 
              "category": "Image category for item 4",
              "size": "small" 
            }
          ]
        },
        {
          "type": "testimonials",
          "title": "Testimonials or Reviews Section Title",
          "subtitle": "What our clients say about us",
          "items": [
            { 
              "name": "Person 1 Full Name", 
              "role": "Professional Role or Company", 
              "content": "Detailed testimonial quote that's at least 2-3 sentences long",
              "imageCategory": "business" 
            },
            { 
              "name": "Person 2 Full Name", 
              "role": "Professional Role or Company", 
              "content": "Detailed testimonial quote that's at least 2-3 sentences long",
              "imageCategory": "business" 
            },
            { 
              "name": "Person 3 Full Name", 
              "role": "Professional Role or Company", 
              "content": "Detailed testimonial quote that's at least 2-3 sentences long",
              "imageCategory": "business" 
            }
          ]
        },
        {
          "type": "pricing",
          "title": "Our Pricing Plans",
          "subtitle": "Choose the plan that fits your needs",
          "items": [
            {
              "title": "Basic Plan",
              "price": "$XX/month",
              "features": ["Feature 1", "Feature 2", "Feature 3"],
              "ctaText": "Get Started"
            },
            {
              "title": "Standard Plan",
              "price": "$XX/month",
              "features": ["Everything in Basic", "Feature 4", "Feature 5", "Feature 6"],
              "ctaText": "Get Started",
              "highlighted": true
            },
            {
              "title": "Premium Plan",
              "price": "$XX/month",
              "features": ["Everything in Standard", "Feature 7", "Feature 8", "Feature 9"],
              "ctaText": "Get Started"
            }
          ]
        },
        {
          "type": "cta",
          "title": "Call to Action Section Title",
          "content": "Persuasive call to action text",
          "buttonText": "Action Button Text",
          "imageCategory": "relevant category"
        },
        {
          "type": "contact",
          "title": "Contact Us Section Title",
          "content": "Text explaining how to get in touch",
          "email": "contact@example.com",
          "phone": "+1 (555) 123-4567",
          "address": "123 Street Name, City, State, ZIP",
          "mapEmbedUrl": "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d12345.67890!2d-73.9!3d40.7!1m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNDDCsDQ2JzI1LjEiTiA3M8KwNTQnMC4wIlc!5e0!3m2!1sen!2sus!4v1234567890!5m2!1sen!2sus"
        },
        {
          "type": "footer",
          "companyName": "Company or Brand Name",
          "tagline": "Brief company tagline",
          "socialLinks": [
            {"platform": "facebook", "url": "https://facebook.com/"},
            {"platform": "twitter", "url": "https://twitter.com/"},
            {"platform": "instagram", "url": "https://instagram.com/"},
            {"platform": "linkedin", "url": "https://linkedin.com/"}
          ],
          "navigationSections": [
            {
              "title": "Company",
              "links": [
                {"text": "About", "url": "#about"},
                {"text": "Services", "url": "#services"},
                {"text": "Team", "url": "#team"}
              ]
            },
            {
              "title": "Resources",
              "links": [
                {"text": "Blog", "url": "#blog"},
                {"text": "FAQ", "url": "#faq"},
                {"text": "Support", "url": "#support"}
              ]
            },
            {
              "title": "Legal",
              "links": [
                {"text": "Privacy Policy", "url": "#privacy"},
                {"text": "Terms of Service", "url": "#terms"}
              ]
            }
          ],
          "copyright": "\xA9 2025 Company Name. All rights reserved."
        }
      ],
      "colorScheme": "primary", // One of: primary, blue, green, red, yellow, purple
      "fontStyle": "modern", // One of: modern, classic, minimal, playful, professional
      "imageStyle": "modern" // One of: modern, vintage, minimalist, bold, professional
    }
    
    Use the template style "${templateType}" as a guide for the overall design approach.
    Create realistic, detailed, and contextually appropriate content based on the user's prompt.
    All sections should be logical and relevant to the website purpose.
    For the "icon" fields, use FontAwesome 5 icon names (e.g., "fa-chart-line", "fa-shield-alt").
    For imageCategory, provide categories like: business, technology, nature, food, fashion, etc.`;
    const userMessage = `${systemPrompt}

User request: ${prompt}`;
    const result = await model.generateContent(userMessage);
    const response = result.response;
    const text2 = response.text();
    const jsonMatch = text2.match(/```json([\s\S]*?)```/) || text2.match(/```([\s\S]*?)```/) || [null, text2];
    let jsonStr = jsonMatch[1] || text2;
    jsonStr = jsonStr.trim();
    return JSON.parse(jsonStr);
  } catch (error) {
    console.error("Error generating website content with Gemini:", error);
    throw new Error(`Failed to generate website content: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
}
async function generateWebsiteCodeWithGemini(content, templateType) {
  try {
    if (!geminiApiKey) {
      throw new Error("GEMINI_API_KEY environment variable is not set");
    }
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
    const prompt = `
    Generate HTML and CSS code for a professional, modern, and visually appealing website based on the following structure:
    ${JSON.stringify(content, null, 2)}
    
    Use the template style "${templateType}" as a guide for the overall design aesthetics.
    
    IMPORTANT GUIDELINES:
    1. The HTML should be modern, semantic, and fully responsive for all devices
    2. The CSS should incorporate the specified color scheme and font style from the content
    3. Use Font Awesome 5 icons where icon names are specified
    4. Include placeholder images from Unsplash where needed (https://source.unsplash.com/collection/3330445/800x600)
    5. Create an engaging, professional design with appropriate spacing, shadows, and animations
    6. Ensure the design has visual hierarchy with proper color contrast
    7. Include hover effects for interactive elements
    8. Implement a responsive navigation system that works on mobile
    9. Use modern CSS techniques like flexbox, grid, and CSS variables
    10. Add subtle animations for better UX (like hover states, fade-ins, etc.)
    11. Include a favicon link (you can use a placeholder)
    12. Add meta tags for SEO
    13. Link to Google Fonts for typography
    14. Include all necessary FontAwesome and external CSS/JS libraries in the HTML head
    
    Respond with JSON in this format (provide complete working code):
    {
      "html": "<!-- Your complete HTML code with all necessary CDN links and meta tags -->",
      "css": "/* Your complete CSS code with all styles necessary for the website */"
    }
    `;
    const systemPrompt = "You are a web development expert who specializes in creating beautiful, modern websites with clean, professional code. Your websites should be visually appealing with proper spacing, typography, and color usage.";
    const userMessage = `${systemPrompt}

${prompt}`;
    const result = await model.generateContent(userMessage);
    const response = result.response;
    const text2 = response.text();
    const jsonMatch = text2.match(/```json([\s\S]*?)```/) || text2.match(/```([\s\S]*?)```/) || [null, text2];
    let jsonStr = jsonMatch[1] || text2;
    jsonStr = jsonStr.trim();
    try {
      const generatedCode = JSON.parse(jsonStr);
      let processedHtml = generatedCode.html;
      const genericPlaceholderPattern = /https:\/\/source\.unsplash\.com\/\w+\/\d+x\d+/g;
      processedHtml = processedHtml.replace(genericPlaceholderPattern, (match) => {
        const dimensions = match.match(/(\d+)x(\d+)/);
        if (dimensions) {
          return getPlaceholderImageUrl2("default", parseInt(dimensions[1]), parseInt(dimensions[2]));
        }
        return match;
      });
      return {
        html: processedHtml,
        css: generatedCode.css
      };
    } catch (parseError) {
      console.error("Error parsing generated code:", parseError);
      throw new Error(`Failed to parse generated website code: ${parseError instanceof Error ? parseError.message : "Unknown error"}`);
    }
  } catch (error) {
    console.error("Error generating website code with Gemini:", error);
    throw new Error(`Failed to generate website code: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
}

// server/services/templateService.ts
function getTemplateById(templateId) {
  return websiteTemplates.find((template) => template.id === templateId);
}
function fillTemplate(template, content) {
  let html = template.html;
  let css = template.css;
  html = html.replace(/{{title}}/g, content.title || "Generated Website");
  html = html.replace(/{{description}}/g, content.description || "A website created with AI");
  template.structure.sections.forEach((section) => {
    const sectionData = content.sections.find((s) => s.type === section.type);
    if (sectionData) {
      section.fields.forEach((field) => {
        const value = sectionData[field];
        if (value !== void 0) {
          const regex = new RegExp(`{{${section.id}\\.${field}}}`, "g");
          html = html.replace(regex, String(value));
        }
      });
    }
  });
  if (content.colorScheme) {
    css = css.replace(/--primary-color: #[0-9a-fA-F]{3,6};/g, `--primary-color: ${content.colorScheme};`);
    const colorClass = content.colorScheme.toLowerCase().replace("#", "");
    if (colorClass === "blue" || colorClass === "green" || colorClass === "red" || colorClass === "yellow" || colorClass === "purple") {
      css = css.replace(/\.primary {[\s\S]*?}/g, `.${colorClass} {}`);
    }
  }
  if (content.fontStyle) {
    const fontFamily = content.fontStyle === "modern" ? "'Poppins', sans-serif" : content.fontStyle === "classic" ? "'Merriweather', serif" : content.fontStyle === "minimal" ? "'Inter', sans-serif" : content.fontStyle === "playful" ? "'Comic Neue', cursive" : "'Roboto', sans-serif";
    css = css.replace(/--font-family: [^;]+;/g, `--font-family: ${fontFamily};`);
  }
  return { html, css };
}
var websiteTemplates = [
  {
    id: "cryptocurrency",
    name: "Cryptocurrency",
    description: "Modern cryptocurrency website with calculator",
    html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="{{description}}">
  <title>{{title}}</title>
  <link rel="stylesheet" href="styles.css">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css">
  <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&family=Roboto:wght@300;400;500;700&display=swap" rel="stylesheet">
</head>
<body class="crypto-theme">
  <!-- Header -->
  <header id="header">
    <div class="container">
      <div class="logo">
        <a href="#">{{header.title}}</a>
      </div>
      <nav>
        <ul>
          <li><a href="#hero">Home</a></li>
          <li><a href="#about">About</a></li>
          <li><a href="#services">Services</a></li>
          <li><a href="#calculator">Calculator</a></li>
          <li><a href="#policies">Policies</a></li>
          <li><a href="#contact">Contact</a></li>
        </ul>
      </nav>
      <div class="mobile-menu-btn">
        <i class="fas fa-bars"></i>
      </div>
    </div>
  </header>

  <!-- Hero Section -->
  <section id="hero">
    <div class="container">
      <div class="hero-content">
        <h1>{{hero.title}}</h1>
        <p>{{hero.content}}</p>
        <div class="hero-btns">
          <a href="#calculator" class="btn btn-primary">{{hero.ctaText}}</a>
          <a href="#about" class="btn btn-outline">Learn More</a>
        </div>
      </div>
      <div class="hero-image">
        <img src="{{hero.image}}" alt="Cryptocurrency">
      </div>
    </div>
    <div class="crypto-ticker">
      <div class="ticker-item">
        <span class="coin">BTC</span>
        <span class="price">$38,450.20</span>
        <span class="change positive">+2.5%</span>
      </div>
      <div class="ticker-item">
        <span class="coin">ETH</span>
        <span class="price">$2,530.15</span>
        <span class="change positive">+1.8%</span>
      </div>
      <div class="ticker-item">
        <span class="coin">SOL</span>
        <span class="price">$105.75</span>
        <span class="change negative">-0.9%</span>
      </div>
      <div class="ticker-item">
        <span class="coin">ADA</span>
        <span class="price">$0.52</span>
        <span class="change positive">+3.7%</span>
      </div>
      <div class="ticker-item">
        <span class="coin">XRP</span>
        <span class="price">$0.48</span>
        <span class="change negative">-1.2%</span>
      </div>
    </div>
  </section>

  <!-- About Section -->
  <section id="about">
    <div class="container">
      <div class="section-header">
        <h2>{{about.title}}</h2>
      </div>
      <div class="about-content">
        <div class="about-image">
          <img src="https://source.unsplash.com/collection/9270463/600x400" alt="About Cryptocurrency">
        </div>
        <div class="about-text">
          <p>{{about.content}}</p>
        </div>
      </div>
      <div class="about-cards">
        <div class="about-card">
          <div class="card-icon"><i class="fas fa-shield-alt"></i></div>
          <h3>Secure Storage</h3>
          <p>State-of-the-art security protocols to protect your digital assets.</p>
        </div>
        <div class="about-card">
          <div class="card-icon"><i class="fas fa-exchange-alt"></i></div>
          <h3>Fast Transactions</h3>
          <p>Lightning-fast transaction processing with minimal fees.</p>
        </div>
        <div class="about-card">
          <div class="card-icon"><i class="fas fa-headset"></i></div>
          <h3>24/7 Support</h3>
          <p>Round-the-clock customer support to assist you anytime.</p>
        </div>
      </div>
    </div>
  </section>

  <!-- Services Section -->
  <section id="services">
    <div class="container">
      <div class="section-header">
        <h2>{{services.title}}</h2>
        <p>{{services.subtitle}}</p>
      </div>
      <div class="services-grid">
        {{services.items}}
      </div>
    </div>
  </section>

  <!-- Calculator Section -->
  <section id="calculator">
    <div class="container">
      <div class="section-header">
        <h2>Cryptocurrency Calculator</h2>
        <p>Instantly convert between cryptocurrencies and fiat currencies</p>
      </div>
      <div class="calculator-wrapper">
        <div class="calculator-form">
          <div class="form-group">
            <label>From</label>
            <div class="currency-select">
              <select id="from-currency">
                <option value="BTC">Bitcoin (BTC)</option>
                <option value="ETH">Ethereum (ETH)</option>
                <option value="SOL">Solana (SOL)</option>
                <option value="ADA">Cardano (ADA)</option>
                <option value="XRP">Ripple (XRP)</option>
              </select>
            </div>
            <input type="number" id="from-amount" placeholder="1.00" value="1">
          </div>
          <div class="exchange-icon">
            <i class="fas fa-exchange-alt"></i>
          </div>
          <div class="form-group">
            <label>To</label>
            <div class="currency-select">
              <select id="to-currency">
                <option value="USD">US Dollar (USD)</option>
                <option value="EUR">Euro (EUR)</option>
                <option value="GBP">British Pound (GBP)</option>
                <option value="JPY">Japanese Yen (JPY)</option>
                <option value="CAD">Canadian Dollar (CAD)</option>
              </select>
            </div>
            <input type="number" id="to-amount" placeholder="38,450.20" value="38450.20" readonly>
          </div>
        </div>
        <div class="calculator-info">
          <div class="info-item">
            <span class="info-label">Exchange Rate:</span>
            <span class="info-value">1 BTC = $38,450.20 USD</span>
          </div>
          <div class="info-item">
            <span class="info-label">Last Updated:</span>
            <span class="info-value">April 18, 2025 19:45 UTC</span>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- Policies Section -->
  <section id="policies">
    <div class="container">
      <div class="section-header">
        <h2>Our Policies</h2>
        <p>Transparency and security are our top priorities</p>
      </div>
      <div class="policies-tabs">
        <div class="tabs-header">
          <button class="tab-btn active" data-tab="privacy">Privacy Policy</button>
          <button class="tab-btn" data-tab="terms">Terms of Service</button>
          <button class="tab-btn" data-tab="kyc">KYC/AML Policy</button>
          <button class="tab-btn" data-tab="security">Security</button>
        </div>
        <div class="tabs-content">
          <div class="tab-panel active" id="privacy-panel">
            <h3>Privacy Policy</h3>
            <p>We take your privacy very seriously. This Privacy Policy describes how we collect, use, and disclose your personal information when you use our services.</p>
            <p>The information we collect may include personal identification information, transaction data, and usage data. We use this information to provide and improve our services, process transactions, and comply with legal obligations.</p>
            <p>We implement strict security measures to protect your personal information from unauthorized access or disclosure.</p>
          </div>
          <div class="tab-panel" id="terms-panel">
            <h3>Terms of Service</h3>
            <p>By accessing or using our platform, you agree to be bound by these Terms of Service. Our services are intended solely for users who are at least 18 years old and are legally permitted to use cryptocurrency services in their jurisdiction.</p>
            <p>We reserve the right to modify or discontinue the service without notice. We are not responsible for delays or failures in performance beyond our control.</p>
          </div>
          <div class="tab-panel" id="kyc-panel">
            <h3>KYC/AML Policy</h3>
            <p>In compliance with global regulations, we implement Know Your Customer (KYC) and Anti-Money Laundering (AML) procedures. This may require verification of your identity through official documentation.</p>
            <p>We monitor transactions for suspicious activity and report as required by applicable laws. We reserve the right to freeze accounts and withhold funds pending investigation of suspicious activity.</p>
          </div>
          <div class="tab-panel" id="security-panel">
            <h3>Security Policy</h3>
            <p>We employ industry-standard security measures to protect your assets and information. This includes encryption, cold storage solutions, regular security audits, and multi-factor authentication.</p>
            <p>Despite our best efforts, no security system is impenetrable. We recommend that users also take steps to secure their accounts, such as using strong passwords and enabling two-factor authentication.</p>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- Contact Section -->
  <section id="contact">
    <div class="container">
      <div class="section-header">
        <h2>{{contact.title}}</h2>
        <p>{{contact.content}}</p>
      </div>
      <div class="contact-content">
        <div class="contact-info">
          <div class="contact-item">
            <i class="fas fa-envelope"></i>
            <h3>Email</h3>
            <p>{{contact.email}}</p>
          </div>
          <div class="contact-item">
            <i class="fas fa-phone"></i>
            <h3>Phone</h3>
            <p>{{contact.phone}}</p>
          </div>
          <div class="contact-item">
            <i class="fas fa-map-marker-alt"></i>
            <h3>Address</h3>
            <p>{{contact.address}}</p>
          </div>
        </div>
        <div class="contact-form">
          <form>
            <div class="form-group">
              <input type="text" placeholder="Your Name" required>
            </div>
            <div class="form-group">
              <input type="email" placeholder="Your Email" required>
            </div>
            <div class="form-group">
              <input type="text" placeholder="Subject">
            </div>
            <div class="form-group">
              <textarea placeholder="Your Message" required></textarea>
            </div>
            <button type="submit" class="btn btn-primary">Send Message</button>
          </form>
        </div>
      </div>
    </div>
  </section>

  <!-- Footer -->
  <footer id="footer">
    <div class="container">
      <div class="footer-content">
        <div class="footer-logo">
          <h3>{{footer.companyName}}</h3>
          <p>{{footer.tagline}}</p>
        </div>
        <div class="footer-links">
          <div class="footer-links-column">
            <h4>Quick Links</h4>
            <ul>
              <li><a href="#hero">Home</a></li>
              <li><a href="#about">About</a></li>
              <li><a href="#services">Services</a></li>
              <li><a href="#calculator">Calculator</a></li>
              <li><a href="#policies">Policies</a></li>
            </ul>
          </div>
          <div class="footer-links-column">
            <h4>Resources</h4>
            <ul>
              <li><a href="#">Help Center</a></li>
              <li><a href="#">Market Data</a></li>
              <li><a href="#">API Documentation</a></li>
              <li><a href="#">Blog</a></li>
            </ul>
          </div>
        </div>
        <div class="footer-newsletter">
          <h4>Stay Updated</h4>
          <p>Subscribe to our newsletter for the latest updates and news.</p>
          <form>
            <input type="email" placeholder="Your email address">
            <button type="submit" class="btn btn-sm">Subscribe</button>
          </form>
        </div>
      </div>
      <div class="footer-bottom">
        <p>{{footer.copyright}}</p>
        <div class="footer-social">
          <a href="#"><i class="fab fa-twitter"></i></a>
          <a href="#"><i class="fab fa-facebook-f"></i></a>
          <a href="#"><i class="fab fa-linkedin-in"></i></a>
          <a href="#"><i class="fab fa-telegram-plane"></i></a>
        </div>
      </div>
    </div>
  </footer>

  <script>
    // Simple script for tabs functionality
    document.addEventListener('DOMContentLoaded', function() {
      const tabBtns = document.querySelectorAll('.tab-btn');
      const tabPanels = document.querySelectorAll('.tab-panel');
      
      tabBtns.forEach(btn => {
        btn.addEventListener('click', function() {
          // Remove active class from all buttons and panels
          tabBtns.forEach(b => b.classList.remove('active'));
          tabPanels.forEach(p => p.classList.remove('active'));
          
          // Add active class to clicked button
          this.classList.add('active');
          
          // Show corresponding panel
          const tabId = this.getAttribute('data-tab');
          document.getElementById(tabId + '-panel').classList.add('active');
        });
      });
      
      // Simple calculator functionality (purely frontend)
      const fromCurrency = document.getElementById('from-currency');
      const toCurrency = document.getElementById('to-currency');
      const fromAmount = document.getElementById('from-amount');
      const toAmount = document.getElementById('to-amount');
      
      // Example exchange rates (in a real app, these would come from an API)
      const rates = {
        'BTC-USD': 38450.20,
        'ETH-USD': 2530.15,
        'SOL-USD': 105.75,
        'ADA-USD': 0.52,
        'XRP-USD': 0.48
      };
      
      function updateCalculation() {
        const from = fromCurrency.value;
        const to = toCurrency.value;
        const amount = parseFloat(fromAmount.value);
        
        if (isNaN(amount)) return;
        
        const rate = rates[from + '-' + to] || rates[from + '-USD'];
        if (rate) {
          toAmount.value = (amount * rate).toFixed(2);
        }
      }
      
      fromCurrency.addEventListener('change', updateCalculation);
      toCurrency.addEventListener('change', updateCalculation);
      fromAmount.addEventListener('input', updateCalculation);
    });
  </script>
</body>
</html>`,
    css: `/* Reset and Base Styles */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

:root {
  --primary-color: #7b3fe4;
  --secondary-color: #5429b1;
  --accent-color: #00f5cc;
  --dark-color: #13111a;
  --medium-dark-color: #201d29;
  --light-color: #f5f9fc;
  --grey-color: #6b7280;
  --border-color: rgba(255, 255, 255, 0.1);
  --font-family: 'Poppins', sans-serif;
  --card-bg: #1c1924;
  --positive-color: #00c087;
  --negative-color: #ff4d4d;
}

/* Color scheme variations */
.primary {
  --primary-color: #7b3fe4;
  --secondary-color: #5429b1;
  --accent-color: #00f5cc;
}

.blue {
  --primary-color: #3a86ff;
  --secondary-color: #0a58ca;
  --accent-color: #00e5ff;
}

.green {
  --primary-color: #10b981;
  --secondary-color: #059669;
  --accent-color: #a7f3d0;
}

.red {
  --primary-color: #ef4444;
  --secondary-color: #dc2626;
  --accent-color: #fca5a5;
}

.yellow {
  --primary-color: #f59e0b;
  --secondary-color: #d97706;
  --accent-color: #fcd34d;
}

.purple {
  --primary-color: #8b5cf6;
  --secondary-color: #7c3aed;
  --accent-color: #c4b5fd;
}

body {
  font-family: var(--font-family);
  line-height: 1.6;
  color: var(--light-color);
  background-color: var(--dark-color);
}

.crypto-theme {
  background-color: var(--dark-color);
  color: var(--light-color);
}

a {
  text-decoration: none;
  color: var(--accent-color);
  transition: color 0.3s ease;
}

a:hover {
  color: var(--primary-color);
}

ul {
  list-style: none;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.btn {
  display: inline-block;
  padding: 12px 30px;
  border-radius: 30px;
  font-weight: 500;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  border: none;
}

.btn-sm {
  padding: 8px 16px;
  font-size: 0.9rem;
}

.btn-primary {
  background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
  color: white;
  box-shadow: 0 4px 10px rgba(123, 63, 228, 0.3);
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 15px rgba(123, 63, 228, 0.4);
}

.btn-outline {
  background: transparent;
  color: var(--light-color);
  border: 1px solid var(--border-color);
}

.btn-outline:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

section {
  padding: 100px 0;
}

.section-header {
  text-align: center;
  margin-bottom: 60px;
}

.section-header h2 {
  font-size: 2.5rem;
  margin-bottom: 20px;
  position: relative;
  display: inline-block;
  color: var(--light-color);
}

.section-header h2::after {
  content: '';
  position: absolute;
  bottom: -10px;
  left: 50%;
  transform: translateX(-50%);
  width: 50px;
  height: 3px;
  background-color: var(--accent-color);
}

.section-header p {
  font-size: 1.1rem;
  color: var(--grey-color);
  max-width: 700px;
  margin: 0 auto;
}

/* Header */
#header {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  padding: 20px 0;
  background-color: rgba(19, 17, 26, 0.9);
  backdrop-filter: blur(8px);
  z-index: 1000;
  border-bottom: 1px solid var(--border-color);
}

#header .container {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logo {
  font-size: 1.8rem;
  font-weight: 700;
}

.logo a {
  color: var(--light-color);
  display: inline-block;
}

.logo a:hover {
  color: var(--accent-color);
}

nav ul {
  display: flex;
}

nav ul li {
  margin-left: 30px;
}

nav ul li a {
  color: var(--light-color);
  font-weight: 500;
  transition: color 0.3s ease;
  position: relative;
}

nav ul li a::after {
  content: '';
  position: absolute;
  bottom: -5px;
  left: 0;
  width: 0;
  height: 2px;
  background-color: var(--accent-color);
  transition: width 0.3s ease;
}

nav ul li a:hover {
  color: var(--accent-color);
}

nav ul li a:hover::after {
  width: 100%;
}

.mobile-menu-btn {
  display: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: var(--light-color);
}

/* Hero Section */
#hero {
  padding: 180px 0 100px;
  background: radial-gradient(circle at top right, rgba(84, 41, 177, 0.15), transparent);
  position: relative;
  overflow: hidden;
}

#hero::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: url('https://source.unsplash.com/collection/9270463/1600x900') no-repeat;
  background-size: cover;
  opacity: 0.05;
  z-index: -1;
}

#hero .container {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.hero-content {
  flex: 1;
  padding-right: 40px;
}

.hero-content h1 {
  font-size: 3.5rem;
  margin-bottom: 20px;
  line-height: 1.2;
  background: linear-gradient(135deg, var(--light-color), var(--accent-color));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.hero-content p {
  font-size: 1.2rem;
  margin-bottom: 30px;
  color: var(--grey-color);
}

.hero-btns {
  display: flex;
  gap: 15px;
}

.hero-image {
  flex: 1;
  display: flex;
  justify-content: flex-end;
}

.hero-image img {
  max-width: 100%;
  border-radius: 10px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  animation: floatAnimation 4s ease-in-out infinite;
}

@keyframes floatAnimation {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-20px);
  }
}

.crypto-ticker {
  position: relative;
  padding: 15px 0;
  margin-top: 50px;
  background-color: var(--medium-dark-color);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.15);
  border-radius: 5px;
  overflow: hidden;
  display: flex;
  justify-content: space-around;
}

.ticker-item {
  display: flex;
  align-items: center;
  padding: 0 15px;
}

.ticker-item .coin {
  font-weight: 600;
  margin-right: 10px;
}

.ticker-item .price {
  color: var(--light-color);
  margin-right: 10px;
}

.ticker-item .change {
  padding: 3px 8px;
  border-radius: 15px;
  font-size: 0.8rem;
  font-weight: 600;
}

.ticker-item .change.positive {
  background-color: rgba(0, 192, 135, 0.2);
  color: var(--positive-color);
}

.ticker-item .change.negative {
  background-color: rgba(255, 77, 77, 0.2);
  color: var(--negative-color);
}

/* About Section */
#about {
  background-color: var(--medium-dark-color);
}

.about-content {
  display: flex;
  gap: 40px;
  margin-bottom: 50px;
}

.about-image {
  flex: 1;
}

.about-image img {
  max-width: 100%;
  border-radius: 10px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
  transition: transform 0.3s ease;
}

.about-image img:hover {
  transform: scale(1.02);
}

.about-text {
  flex: 1;
  font-size: 1.1rem;
  color: var(--grey-color);
}

.about-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 30px;
  margin-top: 30px;
}

.about-card {
  background-color: var(--card-bg);
  padding: 30px;
  border-radius: 10px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  text-align: center;
}

.about-card:hover {
  transform: translateY(-10px);
  box-shadow: 0 15px 25px rgba(0, 0, 0, 0.2);
}

.card-icon {
  font-size: 2.5rem;
  color: var(--accent-color);
  margin-bottom: 20px;
}

.about-card h3 {
  font-size: 1.3rem;
  margin-bottom: 15px;
}

.about-card p {
  color: var(--grey-color);
}

/* Services Section */
#services {
  background-color: var(--dark-color);
}

.services-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 30px;
}

.service-item {
  background-color: var(--card-bg);
  padding: 30px;
  border-radius: 10px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  border: 1px solid var(--border-color);
}

.service-item:hover {
  transform: translateY(-10px);
  box-shadow: 0 15px 25px rgba(0, 0, 0, 0.2);
}

.service-icon {
  font-size: 2.5rem;
  color: var(--primary-color);
  margin-bottom: 20px;
}

.service-item h3 {
  font-size: 1.3rem;
  margin-bottom: 15px;
}

.service-item p {
  color: var(--grey-color);
}

/* Calculator Section */
#calculator {
  background-color: var(--medium-dark-color);
}

.calculator-wrapper {
  max-width: 800px;
  margin: 0 auto;
  background-color: var(--card-bg);
  padding: 40px;
  border-radius: 15px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  border: 1px solid var(--border-color);
}

.calculator-form {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 30px;
}

.form-group {
  flex: 1;
}

.form-group label {
  display: block;
  margin-bottom: 10px;
  font-weight: 500;
}

.form-group input {
  width: 100%;
  padding: 15px;
  border: 1px solid var(--border-color);
  border-radius: 5px;
  background-color: rgba(255, 255, 255, 0.05);
  color: var(--light-color);
  font-family: var(--font-family);
  font-size: 1rem;
}

.currency-select {
  margin-bottom: 10px;
}

.currency-select select {
  width: 100%;
  padding: 15px;
  border: 1px solid var(--border-color);
  border-radius: 5px;
  background-color: rgba(255, 255, 255, 0.05);
  color: var(--light-color);
  font-family: var(--font-family);
  font-size: 1rem;
}

.exchange-icon {
  font-size: 1.5rem;
  color: var(--accent-color);
  animation: pulseAnimation 2s infinite;
}

@keyframes pulseAnimation {
  0%, 100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.2);
    opacity: 0.7;
  }
}

.calculator-info {
  display: flex;
  justify-content: space-between;
  padding-top: 20px;
  border-top: 1px solid var(--border-color);
}

.info-item {
  font-size: 0.9rem;
}

.info-label {
  font-weight: 600;
  margin-right: 10px;
}

.info-value {
  color: var(--grey-color);
}

/* Policies Section */
#policies {
  background-color: var(--dark-color);
}

.policies-tabs {
  max-width: 900px;
  margin: 0 auto;
  background-color: var(--card-bg);
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.1);
}

.tabs-header {
  display: flex;
  background-color: rgba(255, 255, 255, 0.05);
  border-bottom: 1px solid var(--border-color);
}

.tab-btn {
  flex: 1;
  padding: 15px;
  background: transparent;
  border: none;
  color: var(--light-color);
  font-family: var(--font-family);
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  border-bottom: 2px solid transparent;
}

.tab-btn:hover {
  background-color: rgba(255, 255, 255, 0.05);
}

.tab-btn.active {
  background-color: rgba(255, 255, 255, 0.08);
  border-bottom: 2px solid var(--accent-color);
  color: var(--accent-color);
}

.tabs-content {
  padding: 30px;
}

.tab-panel {
  display: none;
}

.tab-panel.active {
  display: block;
  animation: fadeIn 0.5s;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.tab-panel h3 {
  margin-bottom: 20px;
  color: var(--accent-color);
}

.tab-panel p {
  margin-bottom: 15px;
  color: var(--grey-color);
}

/* Contact Section */
#contact {
  background-color: var(--medium-dark-color);
}

.contact-content {
  display: flex;
  gap: 40px;
}

.contact-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 30px;
}

.contact-item {
  background-color: var(--card-bg);
  padding: 30px;
  border-radius: 10px;
  text-align: center;
  transition: transform 0.3s ease;
  border: 1px solid var(--border-color);
}

.contact-item:hover {
  transform: translateY(-5px);
}

.contact-item i {
  font-size: 2rem;
  color: var(--accent-color);
  margin-bottom: 15px;
}

.contact-item h3 {
  margin-bottom: 10px;
}

.contact-form {
  flex: 1;
  background-color: var(--card-bg);
  padding: 30px;
  border-radius: 10px;
  border: 1px solid var(--border-color);
}

.contact-form .form-group {
  margin-bottom: 20px;
}

.contact-form input,
.contact-form textarea {
  width: 100%;
  padding: 15px;
  border: 1px solid var(--border-color);
  border-radius: 5px;
  background-color: rgba(255, 255, 255, 0.05);
  color: var(--light-color);
  font-family: var(--font-family);
  font-size: 1rem;
}

.contact-form textarea {
  height: 150px;
  resize: vertical;
}

/* Footer */
#footer {
  background-color: var(--card-bg);
  padding: 70px 0 30px;
}

.footer-content {
  display: flex;
  justify-content: space-between;
  margin-bottom: 50px;
}

.footer-logo h3 {
  font-size: 1.8rem;
  margin-bottom: 15px;
  color: var(--light-color);
}

.footer-logo p {
  color: var(--grey-color);
  margin-bottom: 20px;
}

.footer-links {
  display: flex;
  gap: 50px;
}

.footer-links-column h4 {
  font-size: 1.2rem;
  margin-bottom: 20px;
  color: var(--light-color);
}

.footer-links-column ul li {
  margin-bottom: 12px;
}

.footer-links-column ul li a {
  color: var(--grey-color);
  transition: color 0.3s ease;
}

.footer-links-column ul li a:hover {
  color: var(--accent-color);
}

.footer-newsletter h4 {
  font-size: 1.2rem;
  margin-bottom: 20px;
  color: var(--light-color);
}

.footer-newsletter p {
  color: var(--grey-color);
  margin-bottom: 20px;
}

.footer-newsletter form {
  display: flex;
}

.footer-newsletter input {
  flex: 1;
  padding: 12px 15px;
  border: 1px solid var(--border-color);
  border-radius: 30px 0 0 30px;
  background-color: rgba(255, 255, 255, 0.05);
  color: var(--light-color);
  font-family: var(--font-family);
}

.footer-newsletter button {
  border-radius: 0 30px 30px 0;
  background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
  color: white;
}

.footer-bottom {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 30px;
  border-top: 1px solid var(--border-color);
}

.footer-bottom p {
  color: var(--grey-color);
}

.footer-social {
  display: flex;
  gap: 15px;
}

.footer-social a {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background-color: rgba(255, 255, 255, 0.05);
  border-radius: 50%;
  color: var(--light-color);
  transition: all 0.3s ease;
}

.footer-social a:hover {
  background-color: var(--primary-color);
  transform: translateY(-3px);
}

/* Responsive Styles */
@media (max-width: 992px) {
  .hero-content h1 {
    font-size: 2.8rem;
  }
  
  #hero .container {
    flex-direction: column;
  }
  
  .hero-content {
    padding-right: 0;
    margin-bottom: 40px;
    text-align: center;
  }
  
  .hero-btns {
    justify-content: center;
  }
  
  .about-content {
    flex-direction: column;
  }
  
  .calculator-form {
    flex-direction: column;
  }
  
  .calculator-info {
    flex-direction: column;
    gap: 10px;
  }
  
  .contact-content {
    flex-direction: column;
  }
  
  .footer-content {
    flex-direction: column;
    gap: 40px;
  }
}

@media (max-width: 768px) {
  .mobile-menu-btn {
    display: block;
  }
  
  nav {
    position: fixed;
    top: 80px;
    left: -100%;
    width: 80%;
    height: calc(100vh - 80px);
    background-color: var(--medium-dark-color);
    padding: 20px;
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
    transition: left 0.3s ease;
  }
  
  nav.active {
    left: 0;
  }
  
  nav ul {
    flex-direction: column;
  }
  
  nav ul li {
    margin: 0 0 20px 0;
  }
  
  .section-header h2 {
    font-size: 2rem;
  }
  
  .crypto-ticker {
    flex-wrap: wrap;
    gap: 15px;
  }
  
  .ticker-item {
    width: 45%;
  }
  
  .tabs-header {
    flex-wrap: wrap;
  }
  
  .tab-btn {
    width: 50%;
  }
  
  .footer-links {
    flex-direction: column;
    gap: 30px;
  }
}

@media (max-width: 576px) {
  .hero-content h1 {
    font-size: 2.2rem;
  }
  
  .ticker-item {
    width: 100%;
    justify-content: center;
    margin-bottom: 10px;
  }
  
  .tab-btn {
    width: 100%;
  }
  
  .footer-bottom {
    flex-direction: column;
    gap: 20px;
  }
}`,
    structure: {
      sections: [
        { id: "header", type: "header", fields: ["title", "logoText"] },
        { id: "hero", type: "hero", fields: ["title", "content", "ctaText", "imageCategory"] },
        { id: "about", type: "about", fields: ["title", "content"] },
        { id: "services", type: "features", fields: ["title", "subtitle", "items"] },
        { id: "contact", type: "contact", fields: ["title", "content", "email", "phone", "address"] },
        { id: "footer", type: "footer", fields: ["companyName", "tagline", "copyright"] }
      ]
    }
  },
  {
    id: "chat",
    name: "Chat Application",
    description: "Real-time chat application with sign-in functionality",
    html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="{{description}}">
  <title>{{title}}</title>
  <link rel="stylesheet" href="styles.css">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css">
  <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&family=Roboto:wght@300;400;500;700&display=swap" rel="stylesheet">
</head>
<body>
  <div class="chat-app-container">
    <!-- Rest of the chat application template -->
  </div>
</body>
</html>`,
    css: `/* Chat application styles */`,
    structure: {
      sections: [
        { id: "header", type: "header", fields: ["title", "logoText"] },
        { id: "hero", type: "hero", fields: ["title", "content"] },
        { id: "footer", type: "footer", fields: ["companyName", "copyright"] }
      ]
    }
  },
  {
    id: "bookstore",
    name: "Bookstore",
    description: "E-commerce bookstore with preview and admin panel",
    html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="{{description}}">
  <title>{{title}}</title>
  <link rel="stylesheet" href="styles.css">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css">
  <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&family=Merriweather:wght@300;400;700&display=swap" rel="stylesheet">
</head>
<body>
  <!-- Rest of the bookstore template -->
</body>
</html>`,
    css: `/* Bookstore styles */`,
    structure: {
      sections: [
        { id: "header", type: "header", fields: ["title", "logoText"] },
        { id: "hero", type: "hero", fields: ["title", "content", "ctaText", "imageCategory"] },
        { id: "footer", type: "footer", fields: ["companyName", "tagline", "copyright"] }
      ]
    }
  },
  {
    id: "streaming",
    name: "Streaming Platform",
    description: "Netflix-like streaming platform with download feature",
    html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="{{description}}">
  <title>{{title}}</title>
  <link rel="stylesheet" href="styles.css">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css">
  <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&family=Roboto:wght@300;400;500;700&display=swap" rel="stylesheet">
</head>
<body>
  <!-- Streaming platform template -->
</body>
</html>`,
    css: `/* Streaming platform styles */`,
    structure: {
      sections: [
        { id: "header", type: "header", fields: ["title", "logoText"] },
        { id: "hero", type: "hero", fields: ["title", "content", "ctaText"] },
        { id: "footer", type: "footer", fields: ["companyName", "tagline", "copyright"] }
      ]
    }
  },
  {
    id: "business",
    name: "Business",
    description: "Professional business website template",
    html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <!-- Rest of the business template -->
</head>
<body>
  <!-- Business website template -->
</body>
</html>`,
    css: `/* Business website styles */`,
    structure: {
      sections: [
        { id: "header", type: "header", fields: ["title", "logoText"] },
        { id: "hero", type: "hero", fields: ["title", "subtitle", "content", "ctaText", "heroImage"] },
        { id: "features", type: "features", fields: ["title", "subtitle", "items"] },
        { id: "about", type: "about", fields: ["title", "content", "image"] },
        { id: "services", type: "services", fields: ["title", "subtitle", "services"] },
        { id: "testimonials", type: "testimonials", fields: ["title", "subtitle", "items"] },
        { id: "contact", type: "contact", fields: ["title", "content", "email", "phone", "address", "mapEmbedUrl"] },
        { id: "footer", type: "footer", fields: ["companyName", "tagline", "copyright", "navigationSections", "socialLinks"] }
      ]
    }
  }
];

// server/services/aiService.ts
var DEFAULT_APPROACH = "hybrid" /* Hybrid */;
function checkAvailableAI() {
  return {
    openai: Boolean(process.env.OPENAI_API_KEY),
    gemini: Boolean(process.env.GEMINI_API_KEY)
  };
}
async function generateWebsiteContent2(prompt, templateType, approach = DEFAULT_APPROACH) {
  const available = checkAvailableAI();
  if (!available.gemini && !available.openai && approach !== "template" /* TemplateBased */) {
    throw new Error("No AI service is available. Please set up either GEMINI_API_KEY or OPENAI_API_KEY.");
  }
  if (available.gemini) {
    try {
      return await generateWebsiteContentWithGemini(prompt, templateType);
    } catch (error) {
      console.error("Error with Gemini, falling back to OpenAI if available:", error);
    }
  }
  if (available.openai) {
    return await generateWebsiteContent(prompt, templateType);
  }
  throw new Error("Failed to generate website content. No AI service is available.");
}
async function generateWebsiteCode2(content, templateType, approach = DEFAULT_APPROACH) {
  if (approach === "template" /* TemplateBased */ || approach === "hybrid" /* Hybrid */) {
    const template = getTemplateById(templateType);
    if (template) {
      console.log(`Using template-based approach with template: ${templateType}`);
      return fillTemplate(template, content);
    } else {
      console.log(`Template ${templateType} not found, falling back to AI generation`);
    }
  }
  const available = checkAvailableAI();
  if (available.gemini) {
    try {
      return await generateWebsiteCodeWithGemini(content, templateType);
    } catch (error) {
      console.error("Error with Gemini, falling back to OpenAI if available:", error);
    }
  }
  if (available.openai) {
    return await generateWebsiteCode(content, templateType);
  }
  throw new Error("No AI service is available. Please set up either GEMINI_API_KEY or OPENAI_API_KEY.");
}

// server/services/websiteGenerator.ts
async function generateWebsite(request) {
  try {
    const approachStr = process.env.GENERATION_APPROACH || "hybrid" /* Hybrid */;
    const approach = approachStr;
    const available = checkAvailableAI();
    if (!available.gemini && !available.openai && approach !== "template" /* TemplateBased */) {
      throw new Error("No AI service is available. Please set up either GEMINI_API_KEY or OPENAI_API_KEY.");
    }
    console.log(`Generating website with approach: ${approach}, template: ${request.templateId}`);
    const content = await generateWebsiteContent2(request.prompt, request.templateId, approach);
    const { html, css } = await generateWebsiteCode2(content, request.templateId, approach);
    const website = await storage.createWebsite({
      prompt: request.prompt,
      templateId: request.templateId,
      content,
      html,
      css
    });
    return website;
  } catch (error) {
    console.error("Error in website generation process:", error);
    throw error;
  }
}
async function createWebsiteZipPackage(html, css) {
  try {
    const JSZipModule = await import("jszip");
    const JSZip = JSZipModule.default;
    const zip = new JSZip();
    zip.file("index.html", html);
    zip.file("styles.css", css);
    zip.file("script.js", "// Your website's JavaScript");
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
    return await zip.generateAsync({ type: "nodebuffer" });
  } catch (error) {
    console.error("Error creating ZIP package:", error);
    throw new Error(`Failed to create website ZIP package: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
}

// server/routes.ts
async function registerRoutes(app2) {
  app2.post("/api/websites", async (req, res) => {
    try {
      const result = websiteRequestSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({
          message: "Invalid request",
          errors: result.error.format()
        });
      }
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
  app2.get("/api/websites/:id", async (req, res) => {
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
  app2.get("/api/websites", async (_req, res) => {
    try {
      const websites2 = await storage.getAllWebsites();
      return res.status(200).json(websites2);
    } catch (error) {
      console.error("Error retrieving websites:", error);
      return res.status(500).json({
        message: "Failed to retrieve websites",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  app2.get("/api/websites/:id/download", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid website ID" });
      }
      const website = await storage.getWebsite(id);
      if (!website) {
        return res.status(404).json({ message: "Website not found" });
      }
      const zipBuffer = await createWebsiteZipPackage(website.html, website.css);
      res.setHeader("Content-Disposition", `attachment; filename="website-${id}.zip"`);
      res.setHeader("Content-Type", "application/zip");
      return res.send(zipBuffer);
    } catch (error) {
      console.error("Error downloading website:", error);
      return res.status(500).json({
        message: "Failed to download website",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  const httpServer = createServer(app2);
  return httpServer;
}

// server/vite.ts
import express from "express";
import fs from "fs";
import path2 from "path";
import { createServer as createViteServer, createLogger } from "vite";

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import themePlugin from "@replit/vite-plugin-shadcn-theme-json";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
var vite_config_default = defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    themePlugin(),
    ...process.env.NODE_ENV !== "production" && process.env.REPL_ID !== void 0 ? [
      await import("@replit/vite-plugin-cartographer").then(
        (m) => m.cartographer()
      )
    ] : []
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets")
    }
  },
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true
  }
});

// server/vite.ts
import { nanoid } from "nanoid";
var viteLogger = createLogger();
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
async function setupVite(app2, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      }
    },
    server: serverOptions,
    appType: "custom"
  });
  app2.use(vite.middlewares);
  app2.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path2.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html"
      );
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app2) {
  const distPath = path2.resolve(import.meta.dirname, "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(express.static(distPath));
  app2.use("*", (_req, res) => {
    res.sendFile(path2.resolve(distPath, "index.html"));
  });
}

// server/index.ts
var app = express2();
app.use(express2.json());
app.use(express2.urlencoded({ extended: false }));
app.use((req, res, next) => {
  const start = Date.now();
  const path3 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path3.startsWith("/api")) {
      let logLine = `${req.method} ${path3} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    }
  });
  next();
});
(async () => {
  const server = await registerRoutes(app);
  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  const port = 5e3;
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true
  }, () => {
    log(`serving on port ${port}`);
  });
})();
