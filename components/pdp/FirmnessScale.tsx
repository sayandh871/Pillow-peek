
import { cn } from "@/lib/utils";

interface FirmnessScaleProps {
  rating: number; // 1-10
  className?: string;
}

export function FirmnessScale({ rating, className }: FirmnessScaleProps) {
  // Clamp rating to valid range
  const clampedRating = Math.max(1, Math.min(10, rating));
   
  const percentage = (clampedRating / 10) * 100;

  return (
    <div className={cn("w-full max-w-sm", className)}>
      <div className="mb-1 flex justify-between text-xs text-gray-500">
        <span>Soft</span>
        <span>Firm</span>
      </div>
      <div className="relative h-2 w-full rounded-full bg-gray-200">
        <div 
          className="absolute top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-blue-600 shadow-sm"
          style={{ left: `${percentage}%` }}
        />
      </div>
       <div className="text-center text-sm font-semibold text-gray-900">
        Rating: {clampedRating}/10
      </div>
    </div>
  );
}
