"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AIImage } from "@/lib/data-models";
import { StorageService } from "@/lib/storage";
import { ImageUtils } from "@/lib/image-utils";
import { toast } from "sonner";

interface ImageModalProps {
  image: AIImage;
  isOpen: boolean;
  onClose: () => void;
}

export default function ImageModal({ image, isOpen, onClose }: ImageModalProps) {
  const [isLiked, setIsLiked] = useState(false);
  const [likes, setLikes] = useState(image.likes);
  const [isDownloading, setIsDownloading] = useState(false);

  const handleLike = () => {
    const currentUser = StorageService.getCurrentUser();
    if (!currentUser) return;

    const newLikedState = StorageService.toggleLike(image.id, currentUser.id);
    setIsLiked(newLikedState);
    setLikes(prev => newLikedState ? prev + 1 : prev - 1);
    
    toast.success(newLikedState ? "Added to favorites!" : "Removed from favorites");
  };

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      const filename = `ai-art-${image.id}.png`;
      ImageUtils.downloadImage(image.imageUrl, filename);
      toast.success("Download started!");
    } catch (error) {
      toast.error("Failed to download image");
    } finally {
      setIsDownloading(false);
    }
  };

  const handleCopyUrl = async () => {
    try {
      await ImageUtils.copyImageUrl(image.imageUrl);
      toast.success("Image URL copied to clipboard!");
    } catch (error) {
      toast.error("Failed to copy URL");
    }
  };

  const handleCopyPrompt = async () => {
    try {
      await navigator.clipboard.writeText(image.prompt);
      toast.success("Prompt copied to clipboard!");
    } catch (error) {
      toast.error("Failed to copy prompt");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] p-0 gap-0">
        <div className="grid md:grid-cols-2 h-full">
          {/* Image Section */}
          <div className="relative bg-black/5 flex items-center justify-center p-4">
            <div className="relative w-full aspect-square max-w-lg">
              <Image
                src={image.imageUrl}
                alt={image.prompt}
                fill
                className="object-contain rounded-lg"
                sizes="50vw"
                priority
              />
            </div>
          </div>

          {/* Details Section */}
          <div className="flex flex-col h-full">
            <DialogHeader className="p-6 pb-4">
              <DialogTitle className="sr-only">Image Details</DialogTitle>
              
              {/* Author Info */}
              <div className="flex items-center justify-between">
                <Link 
                  href={`/profile/${image.author}`}
                  className="flex items-center space-x-3 hover:opacity-80 transition-opacity"
                >
                  <Avatar className="h-10 w-10">
                    <AvatarImage src="" alt={image.author} />
                    <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white">
                      {image.author.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold">{image.author}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(image.createdAt).toLocaleDateString('en-US', {
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </p>
                  </div>
                </Link>

                {/* Action Buttons */}
                <div className="flex items-center space-x-2">
                  <Button
                    variant={isLiked ? "default" : "outline"}
                    size="sm"
                    onClick={handleLike}
                  >
                    <span className="mr-2">{isLiked ? '❤️' : '🤍'}</span>
                    {likes}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleDownload}
                    disabled={isDownloading}
                  >
                    {isDownloading ? "..." : "⬇️"}
                  </Button>
                </div>
              </div>
            </DialogHeader>

            <ScrollArea className="flex-1 px-6">
              <div className="space-y-6 pb-6">
                {/* Prompt */}
                <div className="space-y-2">
                  <h3 className="font-semibold">Prompt</h3>
                  <div className="relative">
                    <p className="text-sm bg-muted p-4 rounded-lg leading-relaxed">
                      {image.prompt}
                    </p>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute top-2 right-2 h-8 w-8 p-0"
                      onClick={handleCopyPrompt}
                    >
                      📋
                    </Button>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-muted rounded-lg">
                    <p className="text-2xl font-bold text-primary">{likes}</p>
                    <p className="text-sm text-muted-foreground">Likes</p>
                  </div>
                  <div className="text-center p-4 bg-muted rounded-lg">
                    <p className="text-2xl font-bold text-primary">{image.views}</p>
                    <p className="text-sm text-muted-foreground">Views</p>
                  </div>
                </div>

                {/* Tags */}
                {image.tags.length > 0 && (
                  <div className="space-y-2">
                    <h3 className="font-semibold">Tags</h3>
                    <div className="flex flex-wrap gap-2">
                      {image.tags.map((tag) => (
                        <Badge
                          key={tag}
                          variant="secondary"
                          className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                          onClick={() => window.location.href = `/gallery?search=${encodeURIComponent(tag)}`}
                        >
                          #{tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Category */}
                {image.category && (
                  <div className="space-y-2">
                    <h3 className="font-semibold">Category</h3>
                    <Badge variant="outline">{image.category}</Badge>
                  </div>
                )}

                {/* Generation Details */}
                <div className="space-y-2">
                  <h3 className="font-semibold">Generation Details</h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Model:</span>
                      <span className="font-mono">{image.model}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Dimensions:</span>
                      <span>{image.parameters.width} × {image.parameters.height}</span>
                    </div>
                    {image.parameters.steps && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Steps:</span>
                        <span>{image.parameters.steps}</span>
                      </div>
                    )}
                    {image.parameters.guidance && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Guidance:</span>
                        <span>{image.parameters.guidance}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Description */}
                {image.description && (
                  <div className="space-y-2">
                    <h3 className="font-semibold">Description</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {image.description}
                    </p>
                  </div>
                )}

                <Separator />

                {/* Action Buttons */}
                <div className="space-y-3">
                  <Button
                    className="w-full"
                    onClick={handleCopyUrl}
                  >
                    <span className="mr-2">🔗</span>
                    Copy Image URL
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full"
                    asChild
                  >
                    <Link href="/generate">
                      <span className="mr-2">✨</span>
                      Create Similar
                    </Link>
                  </Button>
                </div>
              </div>
            </ScrollArea>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}