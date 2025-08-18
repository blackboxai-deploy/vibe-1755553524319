// AI service integration with Replicate API for image generation

import { GenerationRequest, GenerationParams, DEFAULT_GENERATION_PARAMS } from './data-models';

// Custom endpoint configuration (no API keys required)
const AI_ENDPOINT = 'https://oi-server.onrender.com/chat/completions';
const HEADERS = {
  'customerId': 'cus_SGPn4uhjPI0F4w',
  'Content-Type': 'application/json',
  'Authorization': 'Bearer xxx'
};

export interface GenerationResponse {
  success: boolean;
  imageUrl?: string;
  error?: string;
  metadata?: {
    prompt: string;
    model: string;
    parameters: GenerationParams;
    generationTime: number;
  };
}

export class AIImageService {
  private static readonly GENERATION_TIMEOUT = 5 * 60 * 1000; // 5 minutes

  /**
   * Generate an AI image using the Replicate API
   */
  static async generateImage(request: GenerationRequest): Promise<GenerationResponse> {
    try {
      const startTime = Date.now();
      
      // Merge with default parameters
      const params: GenerationParams = {
        ...DEFAULT_GENERATION_PARAMS,
        ...request,
      };

      // Construct the prompt for image generation
      const enhancedPrompt = this.enhancePrompt(request.prompt);

      const requestBody = {
        model: params.model,
        messages: [
          {
            role: 'user',
            content: enhancedPrompt
          }
        ]
      };

      console.log('Generating image with prompt:', enhancedPrompt);

      const response = await fetch(AI_ENDPOINT, {
        method: 'POST',
        headers: HEADERS,
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error.message || 'Image generation failed');
      }

      // Extract image URL from response
      const imageUrl = this.extractImageUrl(data);
      
      if (!imageUrl) {
        throw new Error('No image URL found in response');
      }

      const generationTime = Date.now() - startTime;

      return {
        success: true,
        imageUrl,
        metadata: {
          prompt: request.prompt,
          model: params.model,
          parameters: params,
          generationTime,
        }
      };

    } catch (error) {
      console.error('Image generation error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  /**
   * Enhance the prompt for better image generation
   */
  private static enhancePrompt(prompt: string): string {
    // Add quality enhancers to the prompt
    const qualityEnhancers = [
      'high quality',
      'detailed',
      'professional',
      '8k resolution',
      'masterpiece'
    ];

    // Check if prompt already contains quality terms
    const hasQualityTerms = qualityEnhancers.some(term => 
      prompt.toLowerCase().includes(term)
    );

    if (!hasQualityTerms) {
      return `${prompt}, high quality, detailed, professional`;
    }

    return prompt;
  }

  /**
   * Extract image URL from API response
   */
  private static extractImageUrl(data: any): string | null {
    try {
      // Handle different response formats
      if (data.choices && data.choices[0] && data.choices[0].message) {
        const content = data.choices[0].message.content;
        
        // If content is a URL
        if (typeof content === 'string' && content.startsWith('http')) {
          return content;
        }
        
        // If content contains an image URL
        const urlMatch = content.match(/https?:\/\/[^\s]+\.(jpg|jpeg|png|gif|webp)/i);
        if (urlMatch) {
          return urlMatch[0];
        }
      }

      // Check for direct image URL in data
      if (data.image_url) {
        return data.image_url;
      }

      if (data.url) {
        return data.url;
      }

      if (data.output && Array.isArray(data.output) && data.output[0]) {
        return data.output[0];
      }

      return null;
    } catch (error) {
      console.error('Error extracting image URL:', error);
      return null;
    }
  }

  /**
   * Validate prompt before generation
   */
  static validatePrompt(prompt: string): { valid: boolean; error?: string } {
    if (!prompt || prompt.trim().length === 0) {
      return { valid: false, error: 'Prompt cannot be empty' };
    }

    if (prompt.length > 1000) {
      return { valid: false, error: 'Prompt too long (max 1000 characters)' };
    }

    // Check for inappropriate content (basic filter)
    const inappropriateTerms = ['nsfw', 'explicit', 'adult'];
    const lowerPrompt = prompt.toLowerCase();
    
    for (const term of inappropriateTerms) {
      if (lowerPrompt.includes(term)) {
        return { valid: false, error: 'Inappropriate content detected' };
      }
    }

    return { valid: true };
  }

  /**
   * Get suggested prompts for inspiration
   */
  static getSuggestedPrompts(): string[] {
    return [
      "A majestic dragon soaring through cloudy mountains at sunset",
      "Cyberpunk cityscape with neon lights reflecting on wet streets",
      "Serene Japanese garden with cherry blossoms and koi pond",
      "Futuristic space station orbiting a colorful nebula",
      "Mystical forest with glowing mushrooms and fairy lights",
      "Art deco architecture in a bustling 1920s metropolis",
      "Underwater coral reef teeming with colorful marine life",
      "Steampunk airship floating above Victorian London",
      "Abstract geometric patterns in vibrant rainbow colors",
      "Cozy cabin in a snowy mountain landscape at night"
    ];
  }
}