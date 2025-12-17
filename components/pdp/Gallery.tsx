"use client";

import { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { ImageOff, ZoomIn } from "lucide-react";
import { Button } from "@/components/ui/button";

interface GalleryProps {
  images: {
    id: string;
    url: string;
    altText: string | null;
  }[];
  productName: string;
}

export function Gallery({ images, productName }: GalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);

  if (!images.length) {
    return (
      <div className="aspect-square flex items-center justify-center bg-gray-100 rounded-lg">
        <ImageOff className="h-24 w-24 text-gray-300" />
      </div>
    );
  }

  const currentImage = images[selectedIndex];

  return (
    <div className="flex flex-col-reverse gap-4 md:flex-row">
      {/* Thumbnails */}
      <div className="flex gap-4 overflow-x-auto pb-2 md:flex-col md:overflow-y-auto md:pb-0 md:w-24 md:h-[600px] scrollbar-hide">
        {images.map((image, idx) => (
          <button
            key={image.id}
            onClick={() => setSelectedIndex(idx)}
            className={cn(
              "relative aspect-square w-20 flex-shrink-0 overflow-hidden rounded-md border-2 transition-all",
              selectedIndex === idx
                ? "border-black ring-2 ring-black ring-offset-1"
                : "border-transparent hover:border-gray-200"
            )}
          >
            <Image
              src={image.url}
              alt={image.altText || `${productName} view ${idx + 1}`}
              fill
              className="object-cover"
              sizes="80px"
            />
          </button>
        ))}
      </div>

      {/* Main Image */}
      <div className="relative flex-1 aspect-square md:aspect-auto md:h-[600px] overflow-hidden rounded-lg bg-gray-50 group">
        <Image
          src={currentImage.url}
          alt={currentImage.altText || productName}
          fill
          className={cn(
            "object-cover transition-transform duration-500",
            isZoomed ? "scale-150 cursor-zoom-out" : "scale-100 cursor-zoom-in"
          )}
          onClick={() => setIsZoomed(!isZoomed)}
          priority={selectedIndex === 0}
          sizes="(max-width: 768px) 100vw, 600px"
        />
        
        <Button
          variant="secondary"
          size="icon"
          className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={() => setIsZoomed(!isZoomed)}
        >
          <ZoomIn className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
