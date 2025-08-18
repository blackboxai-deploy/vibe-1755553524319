"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { StorageService } from "@/lib/storage";

export default function Navigation() {
  const [searchQuery, setSearchQuery] = useState("");
  const currentUser = StorageService.getCurrentUser();
  const stats = StorageService.getImageStats();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/gallery?search=${encodeURIComponent(searchQuery.trim())}`;
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">AI</span>
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
            ArtGallery
          </span>
        </Link>

        {/* Search Bar */}
        <div className="hidden md:block flex-1 max-w-md mx-8">
          <form onSubmit={handleSearch} className="relative">
            <Input
              type="search"
              placeholder="Search artworks, styles, artists..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-4 pr-12 h-10"
            />
            <Button
              type="submit"
              size="sm"
              className="absolute right-1 top-1 h-8 px-3"
            >
              Search
            </Button>
          </form>
        </div>

        {/* Navigation Links */}
        <nav className="hidden lg:flex items-center space-x-6">
          <Link 
            href="/gallery" 
            className="text-sm font-medium hover:text-primary transition-colors"
          >
            Gallery
            <Badge variant="secondary" className="ml-2 text-xs">
              {stats.totalImages}
            </Badge>
          </Link>
          <Link 
            href="/generate" 
            className="text-sm font-medium hover:text-primary transition-colors"
          >
            Create
          </Link>
          <Link 
            href="/trending" 
            className="text-sm font-medium hover:text-primary transition-colors"
          >
            Trending
          </Link>
        </nav>

        {/* User Menu */}
        <div className="flex items-center space-x-4">
          {/* Generate Button */}
          <Button asChild className="hidden sm:flex">
            <Link href="/generate">
              <span className="mr-2">✨</span>
              Generate
            </Link>
          </Button>

          {/* User Avatar */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={currentUser?.avatar} alt={currentUser?.displayName} />
                  <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white">
                    {currentUser?.displayName.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {currentUser?.displayName}
                  </p>
                  <p className="text-xs leading-none text-muted-foreground">
                    @{currentUser?.username}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href={`/profile/${currentUser?.username}`}>
                  Profile
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/my-gallery">
                  My Gallery
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/liked">
                  Liked Images
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/settings">
                  Settings
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem>
                Help & Support
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Mobile Menu Button */}
          <Button variant="ghost" size="sm" className="md:hidden">
            <span className="sr-only">Menu</span>
            <div className="w-5 h-5 flex flex-col justify-center space-y-1">
              <div className="w-full h-0.5 bg-current"></div>
              <div className="w-full h-0.5 bg-current"></div>
              <div className="w-full h-0.5 bg-current"></div>
            </div>
          </Button>
        </div>
      </div>

      {/* Mobile Search */}
      <div className="md:hidden px-4 pb-3">
        <form onSubmit={handleSearch} className="relative">
          <Input
            type="search"
            placeholder="Search artworks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-4 pr-20 h-9"
          />
          <Button
            type="submit"
            size="sm"
            className="absolute right-1 top-1 h-7 px-2 text-xs"
          >
            Search
          </Button>
        </form>
      </div>
    </header>
  );
}