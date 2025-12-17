
import { cn } from "@/lib/utils";

interface FirmnessScaleProps {
  rating: number; // 1-10
  className?: string;
}

export function FirmnessScale({ rating, className }: FirmnessScaleProps) {
  // Normalize rating to 1-10 if needed, usually passed as 1-10 or 1-5 mapped to 10?
  // User data schema says firmness rating is 1-10 (e.g. 7).
  
  const percentage = (rating / 10) * 100;
  
  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex justify-between text-xs font-medium text-gray-500 uppercase tracking-wider">
        <span>Plush (1)</span>
        <span>Balanced (5)</span>
        <span>Firm (10)</span>
      </div>
      <div className="relative h-4 w-full rounded-full bg-gray-200">
        <div 
            className="absolute top-0 bottom-0 left-0 rounded-full bg-blue-900 transition-all duration-500"
            style={{ width: `${percentage}%` }}
        />
        {/* Indicator dot */}
        <div 
            className="absolute top-1/2 -translate-y-1/2 h-6 w-6 rounded-full border-4 border-white bg-blue-900 shadow-md"
            style={{ left: `calc(${percentage}% - 12px)` }}
        />
      </div>
      <div className="text-center text-sm font-semibold text-gray-900">
        Rating: {rating}/10
      </div>
    </div>
  );
}
