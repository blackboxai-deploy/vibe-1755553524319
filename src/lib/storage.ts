// Local storage management system for demo purposes

import { AIImage, User, SearchFilters, ImageStats } from './data-models';

// Storage keys
const STORAGE_KEYS = {
  IMAGES: 'ai-gallery-images',
  USERS: 'ai-gallery-users',
  CURRENT_USER: 'ai-gallery-current-user',
  LIKED_IMAGES: 'ai-gallery-liked-images',
} as const;

export class StorageService {
  // Check if we're in browser environment
  private static isBrowser(): boolean {
    return typeof window !== 'undefined' && typeof localStorage !== 'undefined';
  }

  // Image management
  static saveImage(image: AIImage): void {
    if (!this.isBrowser()) return;
    
    try {
      const images = this.getAllImages();
      images.unshift(image); // Add to beginning of array
      localStorage.setItem(STORAGE_KEYS.IMAGES, JSON.stringify(images));
    } catch (error) {
      console.error('Error saving image:', error);
    }
  }

  static getAllImages(): AIImage[] {
    if (!this.isBrowser()) {
      return this.getDefaultImages();
    }
    
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.IMAGES);
      return stored ? JSON.parse(stored) : this.getDefaultImages();
    } catch (error) {
      console.error('Error getting images:', error);
      return this.getDefaultImages();
    }
  }

  static getImageById(id: string): AIImage | null {
    const images = this.getAllImages();
    return images.find(img => img.id === id) || null;
  }

  static updateImage(id: string, updates: Partial<AIImage>): boolean {
    if (!this.isBrowser()) return false;
    
    try {
      const images = this.getAllImages();
      const index = images.findIndex(img => img.id === id);
      
      if (index === -1) return false;
      
      images[index] = { ...images[index], ...updates };
      localStorage.setItem(STORAGE_KEYS.IMAGES, JSON.stringify(images));
      return true;
    } catch (error) {
      console.error('Error updating image:', error);
      return false;
    }
  }

  static deleteImage(id: string): boolean {
    if (!this.isBrowser()) return false;
    
    try {
      const images = this.getAllImages();
      const filtered = images.filter(img => img.id !== id);
      localStorage.setItem(STORAGE_KEYS.IMAGES, JSON.stringify(filtered));
      return true;
    } catch (error) {
      console.error('Error deleting image:', error);
      return false;
    }
  }

  static incrementViews(id: string): void {
    const image = this.getImageById(id);
    if (image) {
      this.updateImage(id, { views: image.views + 1 });
    }
  }

  static toggleLike(imageId: string, userId: string): boolean {
    try {
      const likedImages = this.getLikedImages(userId);
      const image = this.getImageById(imageId);
      
      if (!image) return false;

      const isLiked = likedImages.includes(imageId);
      
      if (isLiked) {
        // Unlike
        const filtered = likedImages.filter(id => id !== imageId);
        this.saveLikedImages(userId, filtered);
        this.updateImage(imageId, { likes: Math.max(0, image.likes - 1) });
        return false;
      } else {
        // Like
        likedImages.push(imageId);
        this.saveLikedImages(userId, likedImages);
        this.updateImage(imageId, { likes: image.likes + 1 });
        return true;
      }
    } catch (error) {
      console.error('Error toggling like:', error);
      return false;
    }
  }

  // User management
  static getCurrentUser(): User | null {
    if (!this.isBrowser()) {
      return this.getDefaultUser();
    }
    
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
      return stored ? JSON.parse(stored) : this.getDefaultUser();
    } catch (error) {
      console.error('Error getting current user:', error);
      return this.getDefaultUser();
    }
  }

  static saveCurrentUser(user: User): void {
    if (!this.isBrowser()) return;
    
    try {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
    } catch (error) {
      console.error('Error saving current user:', error);
    }
  }

  static getUserById(id: string): User | null {
    const users = this.getAllUsers();
    return users.find(user => user.id === id) || null;
  }

  static getAllUsers(): User[] {
    if (!this.isBrowser()) {
      return [this.getDefaultUser()];
    }
    
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.USERS);
      return stored ? JSON.parse(stored) : [this.getDefaultUser()];
    } catch (error) {
      console.error('Error getting users:', error);
      return [this.getDefaultUser()];
    }
  }

  // Search and filtering
  static searchImages(filters: SearchFilters): AIImage[] {
    let images = this.getAllImages();

    // Text search
    if (filters.query) {
      const query = filters.query.toLowerCase();
      images = images.filter(img => 
        img.prompt.toLowerCase().includes(query) ||
        img.tags.some(tag => tag.toLowerCase().includes(query)) ||
        img.description?.toLowerCase().includes(query)
      );
    }

    // Category filter
    if (filters.category) {
      images = images.filter(img => img.category === filters.category);
    }

    // Author filter
    if (filters.author) {
      images = images.filter(img => img.author === filters.author);
    }

    // Tags filter
    if (filters.tags && filters.tags.length > 0) {
      images = images.filter(img => 
        filters.tags!.some(tag => img.tags.includes(tag))
      );
    }

    // Date range filter
    if (filters.dateRange) {
      images = images.filter(img => {
        const imgDate = new Date(img.createdAt);
        const fromDate = new Date(filters.dateRange!.from);
        const toDate = new Date(filters.dateRange!.to);
        return imgDate >= fromDate && imgDate <= toDate;
      });
    }

    // Sorting
    switch (filters.sortBy) {
      case 'oldest':
        images.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        break;
      case 'popular':
        images.sort((a, b) => (b.likes + b.views) - (a.likes + a.views));
        break;
      case 'trending':
        // Simple trending algorithm based on recent likes
        const now = Date.now();
        images.sort((a, b) => {
          const aScore = a.likes / Math.max(1, (now - new Date(a.createdAt).getTime()) / (1000 * 60 * 60 * 24));
          const bScore = b.likes / Math.max(1, (now - new Date(b.createdAt).getTime()) / (1000 * 60 * 60 * 24));
          return bScore - aScore;
        });
        break;
      case 'newest':
      default:
        images.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
    }

    // Pagination
    if (filters.offset || filters.limit) {
      const start = filters.offset || 0;
      const end = filters.limit ? start + filters.limit : undefined;
      images = images.slice(start, end);
    }

    return images;
  }

  // Statistics
  static getImageStats(): ImageStats {
    const images = this.getAllImages();
    const users = this.getAllUsers();
    const today = new Date().toISOString().split('T')[0];
    
    const todayImages = images.filter(img => 
      img.createdAt.startsWith(today)
    ).length;

    const allTags = images.flatMap(img => img.tags);
    const tagCounts = allTags.reduce((acc, tag) => {
      acc[tag] = (acc[tag] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const trendingTags = Object.entries(tagCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([tag]) => tag);

    return {
      totalImages: images.length,
      totalUsers: users.length,
      totalLikes: images.reduce((sum, img) => sum + img.likes, 0),
      todayImages,
      trendingTags,
    };
  }

  // Private helper methods
  private static getLikedImages(userId: string): string[] {
    if (!this.isBrowser()) return [];
    
    try {
      const key = `${STORAGE_KEYS.LIKED_IMAGES}-${userId}`;
      const stored = localStorage.getItem(key);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error getting liked images:', error);
      return [];
    }
  }

  private static saveLikedImages(userId: string, imageIds: string[]): void {
    if (!this.isBrowser()) return;
    
    try {
      const key = `${STORAGE_KEYS.LIKED_IMAGES}-${userId}`;
      localStorage.setItem(key, JSON.stringify(imageIds));
    } catch (error) {
      console.error('Error saving liked images:', error);
    }
  }

  private static getDefaultUser(): User {
    return {
      id: 'user-1',
      username: 'artcreator',
      displayName: 'Art Creator',
      email: 'creator@aiart.com',
      bio: 'Passionate AI artist exploring the boundaries of digital creativity',
      createdAt: new Date().toISOString(),
      imageCount: 0,
      totalLikes: 0,
      following: [],
      followers: [],
    };
  }

  private static getDefaultImages(): AIImage[] {
    const now = new Date().toISOString();
    return [
      {
        id: 'img-1',
        prompt: 'A mystical forest with glowing mushrooms and ethereal light filtering through ancient trees',
        imageUrl: 'https://storage.googleapis.com/workspace-0f70711f-8b4e-4d94-86f1-2a93ccde5887/image/4c7a8482-c81d-4329-85d3-8cf8ef73ba15.png',
        author: 'Art Creator',
        authorId: 'user-1',
        createdAt: now,
        likes: 42,
        views: 156,
        tags: ['fantasy', 'forest', 'mystical', 'glowing', 'nature'],
        model: 'replicate/black-forest-labs/flux-1.1-pro',
        parameters: {
          model: 'replicate/black-forest-labs/flux-1.1-pro',
          width: 1024,
          height: 1024,
          steps: 50,
          guidance: 7.5,
        },
        isPublic: true,
        category: 'Fantasy',
        description: 'An enchanting mystical forest scene with bioluminescent mushrooms'
      },
      {
        id: 'img-2',
        prompt: 'Cyberpunk cityscape at night with neon lights reflecting on wet streets',
        imageUrl: 'https://storage.googleapis.com/workspace-0f70711f-8b4e-4d94-86f1-2a93ccde5887/image/2cb2d4cf-1a29-45f4-a4a3-31c700a09ab2.png',
        author: 'Art Creator',
        authorId: 'user-1',
        createdAt: new Date(Date.now() - 86400000).toISOString(),
        likes: 38,
        views: 98,
        tags: ['cyberpunk', 'cityscape', 'neon', 'futuristic', 'night'],
        model: 'replicate/black-forest-labs/flux-1.1-pro',
        parameters: {
          model: 'replicate/black-forest-labs/flux-1.1-pro',
          width: 1024,
          height: 1024,
          steps: 50,
          guidance: 7.5,
        },
        isPublic: true,
        category: 'Sci-Fi',
        description: 'A futuristic cyberpunk city with atmospheric neon lighting'
      }
    ];
  }
}