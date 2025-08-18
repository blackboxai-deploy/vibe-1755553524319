"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { AIImage } from "@/lib/data-models";
import { StorageService } from "@/lib/storage";

interface ImageCardProps {
  image: AIImage;
  showStats?: boolean;
  onClick?: () => void;
}

export default function ImageCard({ image, showStats = true, onClick }: ImageCardProps) {
  const [isLiked, setIsLiked] = useState(() => {
    const currentUser = StorageService.getCurrentUser();
    if (!currentUser) return false;
    // This would be replaced with actual liked status check
    return false;
  });
  const [likes, setLikes] = useState(image.likes);
  const [isLoading, setIsLoading] = useState(true);

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    const currentUser = StorageService.getCurrentUser();
    if (!currentUser) return;

    const newLikedState = StorageService.toggleLike(image.id, currentUser.id);
    setIsLiked(newLikedState);
    setLikes(prev => newLikedState ? prev + 1 : prev - 1);
  };

  const handleImageLoad = () => {
    setIsLoading(false);
    // Increment view count when image loads
    StorageService.incrementViews(image.id);
  };

  return (
    <Card 
      className="group cursor-pointer hover:shadow-lg transition-all duration-300 border-2 hover:border-primary/20 overflow-hidden"
      onClick={onClick}
    >
      <CardContent className="p-0 relative">
        {/* Image Container */}
        <div className="relative aspect-square overflow-hidden bg-muted">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full animate-pulse"></div>
            </div>
          )}
          <Image
            src={image.imageUrl}
            alt={image.prompt}
            fill
            className={`object-cover transition-all duration-300 group-hover:scale-105 ${
              isLoading ? 'opacity-0' : 'opacity-100'
            }`}
            onLoad={handleImageLoad}
            onError={() => setIsLoading(false)}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
          />
          
          {/* Overlay */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300" />
          
          {/* Like Button */}
          <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <Button
              size="sm"
              variant={isLiked ? "default" : "secondary"}
              className="h-8 w-8 p-0 rounded-full"
              onClick={handleLike}
            >
              <span className={`text-sm ${isLiked ? 'text-white' : ''}`}>
                {isLiked ? '❤️' : '🤍'}
              </span>
            </Button>
          </div>

          {/* Category Badge */}
          {image.category && (
            <div className="absolute top-3 left-3">
              <Badge variant="secondary" className="text-xs">
                {image.category}
              </Badge>
            </div>
          )}
        </div>
      </CardContent>

      <CardFooter className="p-4 space-y-3">
        {/* Prompt Preview */}
        <div className="w-full">
          <p className="text-sm text-foreground font-medium line-clamp-2 leading-relaxed">
            {image.prompt}
          </p>
        </div>

        {/* Author Info */}
        <div className="flex items-center justify-between w-full">
          <Link 
            href={`/profile/${image.author}`}
            className="flex items-center space-x-2 hover:opacity-80 transition-opacity"
            onClick={(e) => e.stopPropagation()}
          >
            <Avatar className="h-6 w-6">
              <AvatarImage src="" alt={image.author} />
              <AvatarFallback className="text-xs bg-gradient-to-br from-purple-500 to-pink-500 text-white">
                {image.author.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <span className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              {image.author}
            </span>
          </Link>

          {/* Stats */}
          {showStats && (
            <div className="flex items-center space-x-3 text-xs text-muted-foreground">
              <span className="flex items-center space-x-1">
                <span>❤️</span>
                <span>{likes}</span>
              </span>
              <span className="flex items-center space-x-1">
                <span>👁️</span>
                <span>{image.views}</span>
              </span>
            </div>
          )}
        </div>

        {/* Tags */}
        {image.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 w-full">
            {image.tags.slice(0, 3).map((tag) => (
              <Badge
                key={tag}
                variant="outline"
                className="text-xs px-2 py-0.5 h-auto"
                onClick={(e) => {
                  e.stopPropagation();
                  window.location.href = `/gallery?search=${encodeURIComponent(tag)}`;
                }}
              >
                #{tag}
              </Badge>
            ))}
            {image.tags.length > 3 && (
              <Badge variant="outline" className="text-xs px-2 py-0.5 h-auto">
                +{image.tags.length - 3}
              </Badge>
            )}
          </div>
        )}

        {/* Created Date */}
        <div className="w-full text-xs text-muted-foreground">
          {new Date(image.createdAt).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
          })}
        </div>
      </CardFooter>
    </Card>
  );
}