"use client";

import { useState } from "react";
import { AIImage } from "@/lib/data-models";
import ImageCard from "./ImageCard";
import ImageModal from "./ImageModal";

interface ImageGridProps {
  images: AIImage[];
  columns?: 2 | 3 | 4;
  showStats?: boolean;
}

export default function ImageGrid({ 
  images, 
  columns = 4, 
  showStats = true 
}: ImageGridProps) {
  const [selectedImage, setSelectedImage] = useState<AIImage | null>(null);

  const getGridClasses = () => {
    switch (columns) {
      case 2:
        return "grid-cols-1 sm:grid-cols-2";
      case 3:
        return "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3";
      case 4:
      default:
        return "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4";
    }
  };

  if (images.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="space-y-4">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto">
            <span className="text-2xl text-muted-foreground">🎨</span>
          </div>
          <h3 className="text-lg font-medium text-muted-foreground">No images found</h3>
          <p className="text-sm text-muted-foreground">
            Try adjusting your search or create some amazing art!
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className={`grid ${getGridClasses()} gap-4 lg:gap-6`}>
        {images.map((image) => (
          <ImageCard
            key={image.id}
            image={image}
            showStats={showStats}
            onClick={() => setSelectedImage(image)}
          />
        ))}
      </div>

      {/* Image Modal */}
      {selectedImage && (
        <ImageModal
          image={selectedImage}
          isOpen={!!selectedImage}
          onClose={() => setSelectedImage(null)}
        />
      )}
    </>
  );
}