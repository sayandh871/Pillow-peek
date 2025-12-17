import { Star, StarHalf } from "lucide-react";
import { cn } from "@/lib/utils";

interface StarRatingProps {
  rating: number;
  maxStars?: number;
  className?: string;
  size?: number; // Icon size in px (optional, explicit, though generic approach uses w/h classes)
}

export function StarRating({ 
  rating, 
  maxStars = 5, 
  className,
  size = 20 
}: StarRatingProps) {
  // Clamp rating between 0 and maxStars
  const clampedRating = Math.min(Math.max(0, rating), maxStars);

  const fullStars = Math.floor(clampedRating);
  const hasHalfStar = clampedRating % 1 >= 0.25 && clampedRating % 1 < 0.75;
  // If decimal is >= 0.75, it typically rounds up visually to a full star in some systems, 
  // but standard "floor + half" logic usually implies:
  // 4.0 - 4.24 -> 4 stars
  // 4.25 - 4.74 -> 4.5 stars
  // 4.75 - 5.0 -> 5 stars? 
  // Let's implement rounding to nearest 0.5 for display purposes first.
  
  const displayRating = Math.round(clampedRating * 2) / 2;
  const renderFullStars = Math.floor(displayRating);
  const renderHalfStar = displayRating % 1 !== 0;

  return (
    <div 
      className={cn("flex items-center space-x-0.5", className)} 
      aria-label={`Rating: ${rating.toFixed(1)} out of ${maxStars} stars`}
      role="img"
    >
      {[...Array(maxStars)].map((_, index) => {
        const isFull = index < renderFullStars;
        const isHalf = index === renderFullStars && renderHalfStar;

        return (
          <div key={index} className="relative">
             {isFull ? (
               <Star 
                 size={size} 
                 className="fill-yellow-400 text-yellow-400" 
               />
             ) : isHalf ? (
                 <div className="relative">
                    {/* Background Empty Star */}
                    <Star 
                        size={size} 
                        className="text-gray-300"
                    />
                    {/* Foreground Half Star */}
                    <div className="absolute inset-0 overflow-hidden w-1/2">
                         <Star 
                            size={size} 
                            className="fill-yellow-400 text-yellow-400"
                        />
                    </div>
                 </div>
               // Alternative: Use StarHalf if available and verify style match. 
               // <StarHalf size={size} className="fill-yellow-400 text-yellow-400" />
               // But StarHalf in Lucide is just the left half shape? 
               // Usually yes. If we want the outline of the right half, we need to layer it.
             ) : (
               <Star 
                 size={size} 
                 className="text-gray-300" 
               />
             )}
          </div>
        );
      })}
    </div>
  );
}
