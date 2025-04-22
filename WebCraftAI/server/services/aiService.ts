import { generateWebsiteContent as generateWithOpenAI, generateWebsiteCode as generateCodeWithOpenAI } from './openai';
import { generateWebsiteContentWithGemini, generateWebsiteCodeWithGemini } from './gemini';
import { getTemplateById, fillTemplate } from './templateService';
import { WebsiteContent } from './openai';

/**
 * Defines the available approaches for website generation
 */
export enum GenerationApproach {
  FullAI = 'full-ai',          // Full AI generation (more tokens, better customization)
  TemplateBased = 'template',  // Template-based approach (fewer tokens, faster)
  Hybrid = 'hybrid'            // Hybrid approach (templates with AI customization)
}

// Default generation approach
const DEFAULT_APPROACH = GenerationApproach.Hybrid;

/**
 * Helper function to check the environment variables
 * @returns Object with availability flags for each AI service
 */
export function checkAvailableAI(): { openai: boolean; gemini: boolean } {
  return {
    openai: Boolean(process.env.OPENAI_API_KEY),
    gemini: Boolean(process.env.GEMINI_API_KEY)
  };
}

/**
 * Generates website content using the most appropriate available AI service
 * @param prompt The user's prompt
 * @param templateType The template style
 * @param approach The generation approach to use
 * @returns Website content structure
 */
export async function generateWebsiteContent(
  prompt: string,
  templateType: string,
  approach: GenerationApproach = DEFAULT_APPROACH
): Promise<WebsiteContent> {
  const available = checkAvailableAI();
  
  // If no AI services are available and we're not using template-only approach
  if (!available.gemini && !available.openai && approach !== GenerationApproach.TemplateBased) {
    throw new Error("No AI service is available. Please set up either GEMINI_API_KEY or OPENAI_API_KEY.");
  }
  
  // First try Gemini (preferred for free usage)
  if (available.gemini) {
    try {
      return await generateWebsiteContentWithGemini(prompt, templateType);
    } catch (error) {
      console.error("Error with Gemini, falling back to OpenAI if available:", error);
      // Fall through to OpenAI if available
    }
  }
  
  // Try OpenAI if Gemini failed or is not available
  if (available.openai) {
    return await generateWithOpenAI(prompt, templateType);
  }
  
  // If we reached here with no services, throw an error
  throw new Error("Failed to generate website content. No AI service is available.");
}

/**
 * Generates website code using the most appropriate approach and available AI service
 * @param content The website content structure
 * @param templateType The template style
 * @param approach The generation approach to use
 * @returns Generated HTML and CSS code
 */
export async function generateWebsiteCode(
  content: WebsiteContent,
  templateType: string,
  approach: GenerationApproach = DEFAULT_APPROACH
): Promise<{ html: string; css: string }> {
  // For template-based or hybrid approach, use templates
  if (approach === GenerationApproach.TemplateBased || approach === GenerationApproach.Hybrid) {
    const template = getTemplateById(templateType);
    
    if (template) {
      console.log(`Using template-based approach with template: ${templateType}`);
      return fillTemplate(template, content);
    } else {
      console.log(`Template ${templateType} not found, falling back to AI generation`);
    }
  }
  
  // For full AI generation or if template not found
  const available = checkAvailableAI();
  
  // First try Gemini (preferred for free usage)
  if (available.gemini) {
    try {
      return await generateWebsiteCodeWithGemini(content, templateType);
    } catch (error) {
      console.error("Error with Gemini, falling back to OpenAI if available:", error);
      // Fall through to OpenAI if available
    }
  }
  
  // Try OpenAI if Gemini failed or is not available
  if (available.openai) {
    return await generateCodeWithOpenAI(content, templateType);
  }
  
  // If no service is available, throw an error
  throw new Error("No AI service is available. Please set up either GEMINI_API_KEY or OPENAI_API_KEY.");
}