"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { AIImageService } from "@/lib/ai-service";
import { StorageService } from "@/lib/storage";
import { ImageUtils } from "@/lib/image-utils";
import { GenerationRequest, IMAGE_CATEGORIES } from "@/lib/data-models";
import Image from "next/image";

export default function GeneratePage() {
  const [prompt, setPrompt] = useState("");
  const [category, setCategory] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [generationTime, setGenerationTime] = useState<number | null>(null);

  const suggestedPrompts = AIImageService.getSuggestedPrompts();

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error("Please enter a prompt to generate an image");
      return;
    }

    const validation = AIImageService.validatePrompt(prompt);
    if (!validation.valid) {
      toast.error(validation.error);
      return;
    }

    setIsGenerating(true);
    setProgress(0);
    setGeneratedImage(null);
    setGenerationTime(null);

    // Simulate progress updates
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + Math.random() * 10;
      });
    }, 500);

    try {
      const generationRequest: GenerationRequest = {
        prompt: prompt.trim(),
        width: 1024,
        height: 1024,
      };

      const result = await AIImageService.generateImage(generationRequest);

      if (result.success && result.imageUrl) {
        setProgress(100);
        setGeneratedImage(result.imageUrl);
        setGenerationTime(result.metadata?.generationTime || 0);
        toast.success("Image generated successfully!");
      } else {
        throw new Error(result.error || "Failed to generate image");
      }
    } catch (error) {
      console.error("Generation error:", error);
      toast.error(error instanceof Error ? error.message : "Failed to generate image");
    } finally {
      clearInterval(progressInterval);
      setIsGenerating(false);
      setProgress(0);
    }
  };

  const handleSaveImage = () => {
    if (!generatedImage) return;

    const currentUser = StorageService.getCurrentUser();
    if (!currentUser) {
      toast.error("Please log in to save images");
      return;
    }

    const imageData = {
      id: ImageUtils.generateImageId(),
      prompt,
      imageUrl: generatedImage,
      author: currentUser.displayName,
      authorId: currentUser.id,
      createdAt: new Date().toISOString(),
      likes: 0,
      views: 0,
      tags: ImageUtils.extractTagsFromPrompt(prompt),
      model: "replicate/black-forest-labs/flux-1.1-pro",
      parameters: {
        model: "replicate/black-forest-labs/flux-1.1-pro",
        width: 1024,
        height: 1024,
      },
      isPublic: true,
      category: category || undefined,
    };

    StorageService.saveImage(imageData);
    toast.success("Image saved to your gallery!");
    
    // Reset form
    setPrompt("");
    setCategory("");
    setGeneratedImage(null);
    setGenerationTime(null);
  };

  const handleDownload = () => {
    if (!generatedImage) return;
    const filename = `ai-art-${Date.now()}.png`;
    ImageUtils.downloadImage(generatedImage, filename);
    toast.success("Download started!");
  };

  const handlePromptSuggestion = (suggestedPrompt: string) => {
    setPrompt(suggestedPrompt);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="text-center space-y-4 mb-8">
        <h1 className="text-4xl font-bold">
          Generate{" "}
          <span className="bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
            AI Art
          </span>
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Transform your imagination into stunning visual art with our advanced AI image generation
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Generation Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <span>✨</span>
              <span>Create Your Art</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Prompt Input */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Describe Your Vision</label>
              <Textarea
                placeholder="A majestic dragon soaring through cloudy mountains at sunset, digital art, highly detailed..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                rows={4}
                className="resize-none"
                disabled={isGenerating}
              />
              <p className="text-xs text-muted-foreground">
                Be specific and creative! Include style, mood, colors, and details.
              </p>
            </div>

            {/* Category Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Category (Optional)</label>
              <Select value={category} onValueChange={setCategory} disabled={isGenerating}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {IMAGE_CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Generation Progress */}
            {isGenerating && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Generating your artwork...</span>
                  <span>{Math.round(progress)}%</span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>
            )}

            {/* Generate Button */}
            <Button
              onClick={handleGenerate}
              disabled={isGenerating || !prompt.trim()}
              className="w-full"
              size="lg"
            >
              {isGenerating ? (
                <>
                  <span className="mr-2">⚡</span>
                  Generating...
                </>
              ) : (
                <>
                  <span className="mr-2">✨</span>
                  Generate Image
                </>
              )}
            </Button>

            {/* Generation Time */}
            {generationTime && (
              <div className="text-center text-sm text-muted-foreground">
                Generated in {(generationTime / 1000).toFixed(1)} seconds
              </div>
            )}
          </CardContent>
        </Card>

        {/* Result Display */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <span>🎨</span>
              <span>Your Artwork</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {generatedImage ? (
              <div className="space-y-4">
                <div className="relative aspect-square bg-muted rounded-lg overflow-hidden">
                  <Image
                    src={generatedImage}
                    alt={prompt}
                    fill
                    className="object-cover"
                    sizes="50vw"
                  />
                </div>
                
                {/* Action Buttons */}
                <div className="grid grid-cols-2 gap-3">
                  <Button onClick={handleSaveImage} variant="outline">
                    <span className="mr-2">💾</span>
                    Save to Gallery
                  </Button>
                  <Button onClick={handleDownload} variant="outline">
                    <span className="mr-2">⬇️</span>
                    Download
                  </Button>
                </div>

                {/* Generated Tags */}
                {prompt && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Auto-generated Tags</label>
                    <div className="flex flex-wrap gap-2">
                      {ImageUtils.extractTagsFromPrompt(prompt).slice(0, 6).map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          #{tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="aspect-square bg-muted rounded-lg flex items-center justify-center">
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto opacity-50">
                    <span className="text-white text-2xl">🎨</span>
                  </div>
                  <p className="text-muted-foreground">
                    Your generated artwork will appear here
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Suggested Prompts */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <span>💡</span>
            <span>Prompt Inspiration</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            {suggestedPrompts.map((suggestedPrompt, index) => (
              <div
                key={index}
                className="p-4 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => handlePromptSuggestion(suggestedPrompt)}
              >
                <p className="text-sm">{suggestedPrompt}</p>
              </div>
            ))}
          </div>
          <Separator className="my-4" />
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-4">
              Tips for better results:
            </p>
            <div className="grid md:grid-cols-3 gap-4 text-sm">
              <div className="space-y-2">
                <h4 className="font-medium">Be Specific</h4>
                <p className="text-muted-foreground">
                  Include details about style, mood, lighting, and composition
                </p>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium">Use Quality Terms</h4>
                <p className="text-muted-foreground">
                  Add words like "detailed", "professional", "high quality"
                </p>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium">Mention Art Styles</h4>
                <p className="text-muted-foreground">
                  Reference specific artists, movements, or techniques
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}