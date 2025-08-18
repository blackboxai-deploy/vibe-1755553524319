// TypeScript interfaces for the AI image gallery platform

export interface GenerationParams {
  model: string;
  width: number;
  height: number;
  steps?: number;
  guidance?: number;
  seed?: number;
}

export interface AIImage {
  id: string;
  prompt: string;
  imageUrl: string;
  author: string;
  authorId: string;
  createdAt: string;
  likes: number;
  views: number;
  tags: string[];
  model: string;
  parameters: GenerationParams;
  isPublic: boolean;
  category?: string;
  description?: string;
}

export interface User {
  id: string;
  username: string;
  displayName: string;
  email: string;
  avatar?: string;
  bio?: string;
  createdAt: string;
  imageCount: number;
  totalLikes: number;
  following: string[];
  followers: string[];
}

export interface GenerationRequest {
  prompt: string;
  model?: string;
  width?: number;
  height?: number;
  steps?: number;
  guidance?: number;
  seed?: number;
}

export interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface SearchFilters {
  query?: string;
  category?: string;
  author?: string;
  tags?: string[];
  dateRange?: {
    from: string;
    to: string;
  };
  sortBy?: 'newest' | 'oldest' | 'popular' | 'trending';
  limit?: number;
  offset?: number;
}

export interface ImageStats {
  totalImages: number;
  totalUsers: number;
  totalLikes: number;
  todayImages: number;
  trendingTags: string[];
}

// Default generation parameters
export const DEFAULT_GENERATION_PARAMS: GenerationParams = {
  model: 'replicate/black-forest-labs/flux-1.1-pro',
  width: 1024,
  height: 1024,
  steps: 50,
  guidance: 7.5,
};

// Image categories
export const IMAGE_CATEGORIES = [
  'Art',
  'Photography',
  'Portrait',
  'Landscape',
  'Abstract',
  'Fantasy',
  'Sci-Fi',
  'Architecture',
  'Fashion',
  'Digital Art',
  'Concept Art',
  'Character Design',
  'Environment',
  'Product Design',
  'Logo Design',
] as const;

export type ImageCategory = typeof IMAGE_CATEGORIES[number];