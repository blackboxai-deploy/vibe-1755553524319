// Image processing and utility functions

export class ImageUtils {
  /**
   * Generate a unique ID for images
   */
  static generateImageId(): string {
    return `img-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Extract tags from a prompt
   */
  static extractTagsFromPrompt(prompt: string): string[] {
    const commonWords = new Set([
      'a', 'an', 'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by',
      'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did',
      'will', 'would', 'could', 'should', 'may', 'might', 'can', 'must', 'very', 'really', 'quite'
    ]);

    const words = prompt
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => 
        word.length > 2 && 
        !commonWords.has(word) &&
        isNaN(Number(word))
      );

    // Get unique words and limit to 10 most relevant
    const uniqueWords = Array.from(new Set(words));
    return uniqueWords.slice(0, 10);
  }

  /**
   * Validate image URL
   */
  static isValidImageUrl(url: string): boolean {
    try {
      const urlObj = new URL(url);
      return /\.(jpg|jpeg|png|gif|webp)$/i.test(urlObj.pathname) || 
             url.includes('placehold.co') ||
             url.includes('base64');
    } catch {
      return false;
    }
  }

  /**
   * Convert file to base64
   */
  static fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  /**
   * Resize image to fit container while maintaining aspect ratio
   */
  static calculateImageDimensions(
    originalWidth: number,
    originalHeight: number,
    maxWidth: number,
    maxHeight: number
  ): { width: number; height: number } {
    const aspectRatio = originalWidth / originalHeight;
    
    let width = Math.min(originalWidth, maxWidth);
    let height = width / aspectRatio;
    
    if (height > maxHeight) {
      height = maxHeight;
      width = height * aspectRatio;
    }
    
    return { width: Math.round(width), height: Math.round(height) };
  }

  /**
   * Get image metadata from URL
   */
  static async getImageMetadata(url: string): Promise<{
    width: number;
    height: number;
    size?: number;
  } | null> {
    return new Promise((resolve) => {
      const img = new Image();
      
      img.onload = () => {
        resolve({
          width: img.naturalWidth,
          height: img.naturalHeight,
        });
      };
      
      img.onerror = () => {
        resolve(null);
      };
      
      img.src = url;
    });
  }

  /**
   * Generate placeholder image URL with specific dimensions and text
   */
  static generatePlaceholder(
    width: number,
    height: number,
    text?: string,
    backgroundColor?: string,
    textColor?: string
  ): string {
    let url = `https://storage.googleapis.com/workspace-0f70711f-8b4e-4d94-86f1-2a93ccde5887/image/594c6275-f671-4fe1-87db-830b6ef6285b.png}x${height}`;
    
    if (backgroundColor) {
      url += `/${backgroundColor}`;
      
      if (textColor) {
        url += `/${textColor}`;
      }
    }
    
    if (text) {
      const encodedText = encodeURIComponent(text.replace(/\s+/g, '+'));
      url += `?text=${encodedText}`;
    }
    
    return url;
  }

  /**
   * Check if image is loaded
   */
  static isImageLoaded(img: HTMLImageElement): boolean {
    return img.complete && img.naturalHeight !== 0;
  }

  /**
   * Preload images for better performance
   */
  static preloadImages(urls: string[]): Promise<void[]> {
    const promises = urls.map(url => 
      new Promise<void>((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve();
        img.onerror = () => reject(new Error(`Failed to load image: ${url}`));
        img.src = url;
      })
    );
    
    return Promise.all(promises);
  }

  /**
   * Format file size in human readable format
   */
  static formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * Get dominant color from image (simplified version)
   */
  static async getDominantColor(imageUrl: string): Promise<string> {
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          
          if (!ctx) {
            resolve('#666666');
            return;
          }
          
          canvas.width = img.width;
          canvas.height = img.height;
          ctx.drawImage(img, 0, 0);
          
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const data = imageData.data;
          
          let r = 0, g = 0, b = 0;
          const pixelCount = data.length / 4;
          
          for (let i = 0; i < data.length; i += 4) {
            r += data[i];
            g += data[i + 1];
            b += data[i + 2];
          }
          
          r = Math.round(r / pixelCount);
          g = Math.round(g / pixelCount);
          b = Math.round(b / pixelCount);
          
          resolve(`rgb(${r}, ${g}, ${b})`);
        } catch {
          resolve('#666666');
        }
      };
      
      img.onerror = () => resolve('#666666');
      img.src = imageUrl;
    });
  }

  /**
   * Create a download link for an image
   */
  static downloadImage(imageUrl: string, filename: string): void {
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = filename;
    link.target = '_blank';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  /**
   * Copy image URL to clipboard
   */
  static async copyImageUrl(imageUrl: string): Promise<boolean> {
    try {
      await navigator.clipboard.writeText(imageUrl);
      return true;
    } catch {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = imageUrl;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      return true;
    }
  }
}