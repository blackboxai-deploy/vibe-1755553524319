import { NextRequest, NextResponse } from 'next/server';
import { AIImageService } from '@/lib/ai-service';
import { GenerationRequest } from '@/lib/data-models';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate request body
    if (!body.prompt || typeof body.prompt !== 'string') {
      return NextResponse.json(
        { error: 'Prompt is required and must be a string' },
        { status: 400 }
      );
    }

    // Validate prompt
    const validation = AIImageService.validatePrompt(body.prompt);
    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      );
    }

    // Prepare generation request
    const generationRequest: GenerationRequest = {
      prompt: body.prompt.trim(),
      model: body.model || 'replicate/black-forest-labs/flux-1.1-pro',
      width: body.width || 1024,
      height: body.height || 1024,
      steps: body.steps || 50,
      guidance: body.guidance || 7.5,
      seed: body.seed,
    };

    console.log('Processing image generation request:', generationRequest);

    // Generate image using AI service
    const result = await AIImageService.generateImage(generationRequest);

    if (result.success) {
      return NextResponse.json({
        success: true,
        imageUrl: result.imageUrl,
        metadata: result.metadata,
      });
    } else {
      console.error('Image generation failed:', result.error);
      return NextResponse.json(
        { error: result.error || 'Failed to generate image' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('API route error:', error);
    
    // Handle specific error types
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    {
      message: 'AI Image Generation API',
      endpoints: {
        POST: '/api/generate',
        description: 'Generate an AI image from a text prompt',
        parameters: {
          prompt: 'string (required) - Text description of the image to generate',
          model: 'string (optional) - AI model to use (default: replicate/black-forest-labs/flux-1.1-pro)',
          width: 'number (optional) - Image width (default: 1024)',
          height: 'number (optional) - Image height (default: 1024)',
          steps: 'number (optional) - Generation steps (default: 50)',
          guidance: 'number (optional) - Guidance scale (default: 7.5)',
          seed: 'number (optional) - Random seed for reproducibility'
        },
        example: {
          prompt: 'A majestic dragon soaring through cloudy mountains at sunset',
          width: 1024,
          height: 1024
        }
      }
    },
    { status: 200 }
  );
}