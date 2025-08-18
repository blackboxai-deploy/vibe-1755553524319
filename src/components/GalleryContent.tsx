"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StorageService } from "@/lib/storage";
import { AIImage, SearchFilters, IMAGE_CATEGORIES } from "@/lib/data-models";
import ImageGrid from "@/components/ImageGrid";

export default function GalleryContent() {
  const searchParams = useSearchParams();
  const [images, setImages] = useState<AIImage[]>([]);
  const [filteredImages, setFilteredImages] = useState<AIImage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [sortBy, setSortBy] = useState<SearchFilters["sortBy"]>("newest");
  const [stats, setStats] = useState(StorageService.getImageStats());

  // Load initial search query from URL params
  useEffect(() => {
    const query = searchParams.get("search");
    if (query) {
      setSearchQuery(query);
    }
  }, [searchParams]);

  // Load all images
  useEffect(() => {
    const loadImages = () => {
      try {
        const allImages = StorageService.getAllImages();
        setImages(allImages);
        setStats(StorageService.getImageStats());
      } catch (error) {
        console.error("Error loading images:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadImages();
  }, []);

  // Filter and search images
  const filterImages = useCallback(() => {
    const filters: SearchFilters = {
      query: searchQuery.trim() || undefined,
      category: selectedCategory || undefined,
      sortBy,
    };

    const filtered = StorageService.searchImages(filters);
    setFilteredImages(filtered);
  }, [searchQuery, selectedCategory, sortBy]);

  useEffect(() => {
    filterImages();
  }, [filterImages]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    filterImages();
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedCategory("");
    setSortBy("newest");
  };

  const handleTagClick = (tag: string) => {
    setSearchQuery(tag);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full animate-pulse mx-auto"></div>
          <p className="text-muted-foreground">Loading gallery...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center space-y-4 mb-8">
        <h1 className="text-4xl font-bold">
          Community{" "}
          <span className="bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
            Gallery
          </span>
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Explore amazing AI-generated artwork from our creative community
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Card className="text-center p-4">
          <h3 className="text-2xl font-bold text-primary">{stats.totalImages}</h3>
          <p className="text-sm text-muted-foreground">Total Artworks</p>
        </Card>
        <Card className="text-center p-4">
          <h3 className="text-2xl font-bold text-primary">{stats.totalLikes}</h3>
          <p className="text-sm text-muted-foreground">Total Likes</p>
        </Card>
        <Card className="text-center p-4">
          <h3 className="text-2xl font-bold text-primary">{stats.todayImages}</h3>
          <p className="text-sm text-muted-foreground">Created Today</p>
        </Card>
        <Card className="text-center p-4">
          <h3 className="text-2xl font-bold text-primary">{stats.totalUsers}</h3>
          <p className="text-sm text-muted-foreground">Artists</p>
        </Card>
      </div>

      <Tabs defaultValue="browse" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 lg:w-auto lg:grid-cols-3">
          <TabsTrigger value="browse">Browse All</TabsTrigger>
          <TabsTrigger value="trending">Trending</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
        </TabsList>

        <TabsContent value="browse" className="space-y-6">
          {/* Search and Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <span>🔍</span>
                <span>Search & Filter</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Search Form */}
              <form onSubmit={handleSearch} className="flex gap-2">
                <Input
                  placeholder="Search by prompt, tags, or artist..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1"
                />
                <Button type="submit">Search</Button>
              </form>

              {/* Filters */}
              <div className="flex flex-wrap gap-4">
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Categories</SelectItem>
                    {IMAGE_CATEGORIES.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={sortBy} onValueChange={(value) => setSortBy(value as SearchFilters["sortBy"])}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Newest</SelectItem>
                    <SelectItem value="oldest">Oldest</SelectItem>
                    <SelectItem value="popular">Most Popular</SelectItem>
                    <SelectItem value="trending">Trending</SelectItem>
                  </SelectContent>
                </Select>

                {(searchQuery || selectedCategory) && (
                  <Button variant="outline" onClick={clearFilters}>
                    Clear Filters
                  </Button>
                )}
              </div>

              {/* Active Filters Display */}
              {(searchQuery || selectedCategory) && (
                <div className="flex flex-wrap gap-2">
                  {searchQuery && (
                    <Badge variant="secondary">
                      Search: "{searchQuery}"
                      <button
                        className="ml-2 hover:text-destructive"
                        onClick={() => setSearchQuery("")}
                      >
                        ×
                      </button>
                    </Badge>
                  )}
                  {selectedCategory && (
                    <Badge variant="secondary">
                      Category: {selectedCategory}
                      <button
                        className="ml-2 hover:text-destructive"
                        onClick={() => setSelectedCategory("")}
                      >
                        ×
                      </button>
                    </Badge>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Results */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">
                {filteredImages.length === images.length
                  ? `All Artworks (${filteredImages.length})`
                  : `Search Results (${filteredImages.length})`}
              </h2>
            </div>

            {filteredImages.length > 0 ? (
              <ImageGrid images={filteredImages} />
            ) : (
              <Card className="p-12 text-center">
                <div className="space-y-4">
                  <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto">
                    <span className="text-2xl text-muted-foreground">🔍</span>
                  </div>
                  <h3 className="text-lg font-medium">No results found</h3>
                  <p className="text-muted-foreground">
                    Try adjusting your search terms or browse all artworks
                  </p>
                  <Button onClick={clearFilters}>Clear Filters</Button>
                </div>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="trending" className="space-y-6">
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Trending Artworks</h2>
            <ImageGrid 
              images={StorageService.searchImages({ sortBy: "trending", limit: 20 })} 
            />
          </div>
        </TabsContent>

        <TabsContent value="categories" className="space-y-6">
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">Browse by Category</h2>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {IMAGE_CATEGORIES.map((category) => {
                const categoryImages = StorageService.searchImages({ 
                  category, 
                  limit: 1 
                });
                const count = StorageService.searchImages({ category }).length;
                
                return (
                  <Card
                    key={category}
                    className="cursor-pointer hover:shadow-lg transition-all duration-300 border-2 hover:border-primary/20"
                    onClick={() => {
                      setSelectedCategory(category);
                      // Switch to browse tab
                      const browseTab = document.querySelector('[value="browse"]') as HTMLButtonElement;
                      browseTab?.click();
                    }}
                  >
                    <CardContent className="p-4 text-center space-y-3">
                      <div className="aspect-square bg-muted rounded-lg flex items-center justify-center relative overflow-hidden">
                        {categoryImages[0] ? (
                          <img
                            src={categoryImages[0].imageUrl}
                            alt={category}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-2xl text-muted-foreground">🎨</span>
                        )}
                      </div>
                      <div>
                        <h3 className="font-medium">{category}</h3>
                        <p className="text-sm text-muted-foreground">
                          {count} artwork{count !== 1 ? 's' : ''}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Trending Tags */}
      {stats.trendingTags.length > 0 && (
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <span>🔥</span>
              <span>Trending Tags</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {stats.trendingTags.map((tag) => (
                <Badge
                  key={tag}
                  variant="secondary"
                  className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                  onClick={() => handleTagClick(tag)}
                >
                  #{tag}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}