import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY || "sk-your-api-key" });

// Helper function to get professional-looking placeholder images
function getPlaceholderImageUrl(category: string, width = 800, height = 600): string {
  // Map of categories to Unsplash collection IDs
  const categoryCollections: Record<string, string> = {
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

  // Get collection based on category or use default
  const collection = categoryCollections[category.toLowerCase()] || categoryCollections.default;
  
  // Use Unsplash source for placeholder images
  return `https://source.unsplash.com/collection/${collection}/${width}x${height}`;
}

export interface WebsiteContent {
  title: string;
  description: string;
  sections: WebsiteSection[];
  colorScheme: string;
  fontStyle: string;
  imageStyle?: string;
}

export interface WebsiteSection {
  type: string;
  title?: string;
  content?: string;
  items?: any[];
  logoText?: string;
  ctaText?: string;
  imageCategory?: string;
  subtitle?: string;
  buttonText?: string;
  email?: string;
  phone?: string;
  address?: string;
  mapEmbedUrl?: string;
  companyName?: string;
  tagline?: string;
  socialLinks?: any[];
  navigationSections?: any[];
  copyright?: string;
}

export async function generateWebsiteContent(
  prompt: string,
  templateType: string
): Promise<WebsiteContent> {
  try {
    // Make sure we have an API key
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
          "copyright": "© 2025 Company Name. All rights reserved."
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
        { role: "user", content: prompt },
      ],
      response_format: { type: "json_object" },
    });

    return JSON.parse(response.choices[0].message.content || "{}") as WebsiteContent;
  } catch (error) {
    console.error("Error generating website content with OpenAI:", error);
    throw new Error(`Failed to generate website content: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function generateWebsiteCode(
  content: WebsiteContent,
  templateType: string
): Promise<{ html: string; css: string }> {
  try {
    // Make sure we have an API key
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
        { role: "user", content: prompt },
      ],
      response_format: { type: "json_object" },
    });

    try {
      // Parse the JSON response
      const generatedCode = JSON.parse(response.choices[0].message.content || "{}") as { html: string; css: string };
      
      // Process the HTML to ensure image URLs are correctly set
      let processedHtml = generatedCode.html;
      
      // Replace any generic placeholder image URLs with our category-specific ones
      const genericPlaceholderPattern = /https:\/\/source\.unsplash\.com\/\w+\/\d+x\d+/g;
      processedHtml = processedHtml.replace(genericPlaceholderPattern, (match) => {
        const dimensions = match.match(/(\d+)x(\d+)/);
        if (dimensions) {
          return getPlaceholderImageUrl('default', parseInt(dimensions[1]), parseInt(dimensions[2]));
        }
        return match;
      });
      
      // Return the processed code
      return {
        html: processedHtml,
        css: generatedCode.css
      };
    } catch (parseError) {
      console.error("Error parsing generated code:", parseError);
      throw new Error(`Failed to parse generated website code: ${parseError instanceof Error ? parseError.message : 'Unknown error'}`);
    }
  } catch (error) {
    console.error("Error generating website code with OpenAI:", error);
    throw new Error(`Failed to generate website code: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
