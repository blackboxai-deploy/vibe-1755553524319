"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { StorageService } from "@/lib/storage";
import { AIImage, ImageStats } from "@/lib/data-models";
import ImageGrid from "@/components/ImageGrid";

export default function HomePage() {
  const [featuredImages, setFeaturedImages] = useState<AIImage[]>([]);
  const [stats, setStats] = useState<ImageStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = () => {
      try {
        // Get featured images (most popular recent images)
        const allImages = StorageService.getAllImages();
        const featured = allImages
          .sort((a, b) => (b.likes + b.views) - (a.likes + a.views))
          .slice(0, 8);
        
        setFeaturedImages(featured);
        setStats(StorageService.getImageStats());
      } catch (error) {
        console.error('Error loading homepage data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full animate-pulse mx-auto"></div>
          <p className="text-muted-foreground">Loading amazing AI art...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-background to-pink-900/20"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center max-w-4xl mx-auto space-y-8">
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold">
              Create{" "}
              <span className="bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
                Stunning AI Art
              </span>
              <br />
              Share with the World
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Join a vibrant community of AI artists. Generate breathtaking images with cutting-edge AI, 
              explore incredible creations, and get inspired by limitless creativity.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button asChild size="lg" className="text-lg px-8 py-6">
                <Link href="/generate">
                  <span className="mr-2">✨</span>
                  Start Creating
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="text-lg px-8 py-6">
                <Link href="/gallery">
                  <span className="mr-2">🎨</span>
                  Explore Gallery
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      {stats && (
        <section className="py-12 border-t">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              <div className="space-y-2">
                <h3 className="text-3xl font-bold text-primary">{stats.totalImages}</h3>
                <p className="text-muted-foreground">Artworks Created</p>
              </div>
              <div className="space-y-2">
                <h3 className="text-3xl font-bold text-primary">{stats.totalUsers}</h3>
                <p className="text-muted-foreground">Active Artists</p>
              </div>
              <div className="space-y-2">
                <h3 className="text-3xl font-bold text-primary">{stats.totalLikes}</h3>
                <p className="text-muted-foreground">Total Likes</p>
              </div>
              <div className="space-y-2">
                <h3 className="text-3xl font-bold text-primary">{stats.todayImages}</h3>
                <p className="text-muted-foreground">Created Today</p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Featured Artworks */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-4 mb-12">
            <h2 className="text-3xl md:text-4xl font-bold">Featured Artworks</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Discover the most amazing AI-generated artworks from our talented community
            </p>
          </div>
          
          {featuredImages.length > 0 ? (
            <ImageGrid images={featuredImages} />
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-6">No artworks yet. Be the first to create!</p>
              <Button asChild>
                <Link href="/generate">
                  <span className="mr-2">✨</span>
                  Create First Artwork
                </Link>
              </Button>
            </div>
          )}

          <div className="text-center mt-12">
            <Button asChild variant="outline" size="lg">
              <Link href="/gallery">
                View All Artworks
                <span className="ml-2">→</span>
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Trending Tags */}
      {stats && stats.trendingTags.length > 0 && (
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="text-center space-y-4 mb-8">
              <h2 className="text-3xl font-bold">Trending Now</h2>
              <p className="text-muted-foreground">Popular styles and themes in the community</p>
            </div>
            <div className="flex flex-wrap justify-center gap-3">
              {stats.trendingTags.map((tag) => (
                <Badge
                  key={tag}
                  variant="secondary"
                  className="text-sm py-2 px-4 hover:bg-primary hover:text-primary-foreground transition-colors cursor-pointer"
                  onClick={() => window.location.href = `/gallery?search=${encodeURIComponent(tag)}`}
                >
                  #{tag}
                </Badge>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* How It Works */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl md:text-4xl font-bold">How It Works</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Creating stunning AI art has never been easier
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="text-center p-8 border-2 hover:border-primary/50 transition-colors">
              <CardContent className="space-y-4">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto text-2xl">
                  ✍️
                </div>
                <h3 className="text-xl font-semibold">Describe Your Vision</h3>
                <p className="text-muted-foreground">
                  Write a detailed prompt describing the image you want to create. Be creative and specific!
                </p>
              </CardContent>
            </Card>
            
            <Card className="text-center p-8 border-2 hover:border-primary/50 transition-colors">
              <CardContent className="space-y-4">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto text-2xl">
                  🎨
                </div>
                <h3 className="text-xl font-semibold">AI Creates Magic</h3>
                <p className="text-muted-foreground">
                  Our advanced AI models transform your words into stunning, high-quality artwork in seconds.
                </p>
              </CardContent>
            </Card>
            
            <Card className="text-center p-8 border-2 hover:border-primary/50 transition-colors">
              <CardContent className="space-y-4">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto text-2xl">
                  🌟
                </div>
                <h3 className="text-xl font-semibold">Share & Discover</h3>
                <p className="text-muted-foreground">
                  Share your creations with the community and explore amazing artworks from other artists.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}