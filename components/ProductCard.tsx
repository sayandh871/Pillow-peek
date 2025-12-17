
import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter } from "@/components/ui/card";

export type ProductCardProps = {
  id: string;
  name: string;
  description: string | null;
  basePrice: string; // or number, db returns decimal string usually
  imageUrl: string | null;
  startingPrice: number | null;
  availableSizes: string[];
  availableFirmness: string[];
};

export function ProductCard({
  id,
  name,
  description,
  startingPrice,
  imageUrl,
  availableSizes,
  availableFirmness,
}: ProductCardProps) {
  const priceDisplay = startingPrice 
    ? `$${Number(startingPrice).toFixed(2)}` 
    : "Out of Stock";

  return (
    <Card className="h-full overflow-hidden transition-all hover:shadow-lg group">
        <Link href={`/mattresses/${id}`}>
      <div className="relative aspect-square overflow-hidden bg-gray-100">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={name}
            fill
            className="object-cover transition-transform group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-gray-400">
            No Image
          </div>
        )}
        {/* Badges could go here */}
        {!startingPrice && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white font-bold">
                Out of Stock
            </div>
        )}
      </div>
      <CardContent className="p-4">
        <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
          {name}
        </h3>
        <p className="mt-1 text-sm text-gray-500 line-clamp-2">
          {description}
        </p>
        
        {/* Swatches / Available Options */}
        <div className="mt-3 flex flex-wrap gap-1">
             {availableSizes?.slice(0, 3).map(size => (
                 <span key={size} className="px-1.5 py-0.5 text-[10px] uppercase bg-gray-100 rounded text-gray-600 border border-gray-200">
                     {size}
                 </span>
             ))}
             {availableSizes?.length > 3 && (
                 <span className="px-1.5 py-0.5 text-[10px] text-gray-400">+More</span>
             )}
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <div className="flex w-full items-center justify-between">
          <div className="flex flex-col">
            <span className="text-xs text-gray-500 font-medium uppercase tracking-wide">
              Starting from
            </span>
            <span className="text-xl font-bold text-gray-900">
              {priceDisplay}
            </span>
          </div>
        </div>
      </CardFooter>
      </Link>
    </Card>
  );
}
