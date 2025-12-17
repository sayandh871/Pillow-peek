import { Suspense } from "react";
import { notFound, redirect } from "next/navigation";
import { getProductBySlug } from "@/lib/actions/product";
import { Gallery } from "@/components/pdp/Gallery";
import { VariantSelector } from "@/components/pdp/VariantSelector";
import { BuyBox } from "@/components/pdp/BuyBox";
import { FirmnessScale } from "@/components/pdp/FirmnessScale";
import { ProductSpecs } from "@/components/pdp/ProductSpecs";
import { Badge } from "@/components/ui/badge";
import { StarRating } from "@/components/pdp/StarRating";
import { ReviewSection } from "@/components/pdp/ReviewSection";
import { RecommendedGrid } from "@/components/pdp/RecommendedGrid";
import { ReviewsSkeleton, ProductGridSkeleton } from "@/components/pdp/skeletons";
import { Metadata } from "next";

type Params = Promise<{ slug: string }>;
type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

export async function generateMetadata(
  props: {
    params: Params;
  }
): Promise<Metadata> {
  const params = await props.params;
  const product = await getProductBySlug(params.slug);

  if (!product) {
    return {
      title: "Product Not Found | Pillow Peek",
    };
  }

  return {
    title: `${product.name} | Pillow Peek`,
    description: product.description || `Shop the ${product.name} mattress.`,
  };
}

export default async function ProductPage(props: {
  params: Params;
  searchParams: SearchParams;
}) {
  const params = await props.params;
  const searchParams = await props.searchParams;
  
  // Fetch product data
  const product = await getProductBySlug(params.slug);

  if (!product) {
    notFound();
  }

  // Determine selected variant based on URL params - Strict Logic
  const selectedSize = typeof searchParams.size === 'string' ? searchParams.size : undefined;
  const selectedFirmness = typeof searchParams.firmness === 'string' ? searchParams.firmness : undefined;

  let selectedVariant = undefined;

  if (selectedSize && selectedFirmness) {
       selectedVariant = product.variants.find(
           v => v.sizeId === selectedSize && v.firmnessId === selectedFirmness
       );
  } else if (product.variants.length > 0) {
      // Logic: If no *complete* selection, redirect.
      // But if user just landed, we want to auto-select without redirect loop if possible?
      // Server-side redirect is solid.
      const defaultVariant = product.variants.find(v => v.sizeId === 'queen' && v.firmnessId === 'medium') || product.variants[0];
      
      const newParams = new URLSearchParams();
      if (defaultVariant.sizeId) newParams.set('size', defaultVariant.sizeId);
      if (defaultVariant.firmnessId) newParams.set('firmness', defaultVariant.firmnessId);
      
      // Only redirect if params differentiate from current URL
      if (selectedSize !== defaultVariant.sizeId || selectedFirmness !== defaultVariant.firmnessId) {
          redirect(`/mattresses/${params.slug}?${newParams.toString()}`);
      }
      
      // Fallback: If we are here, params might match default but selectedVariant is undefined 
      // because logic inside first IF block failed or we skipped it.
      // Ensure we have a variant to render.
      if (!selectedVariant) {
          selectedVariant = defaultVariant;
      }
  }

  // Derive unique materials from all variants for the specs section
  const variantMaterials = Array.from(new Set(product.variants.map(v => v.material?.name).filter(Boolean))) as string[];

  // Calculate firmness rating for the specific variant if possible
  const firmnessRating = selectedVariant?.firmness?.rating || 5; 

  // Calculate Average Rating directly from product (lightweight fetch)
  // reviews is array of { rating: number } based on the optimized action
  const reviewCount = product.reviews.length;
  const averageRating = reviewCount > 0 
      ? product.reviews.reduce((acc, r) => acc + r.rating, 0) / reviewCount 
      : 0;

  return (
    <div className="bg-white">
      <div className="container mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="lg:grid lg:grid-cols-2 lg:gap-x-12 lg:items-start">
          {/* Left Column: Gallery */}
          <div>
            <Gallery 
                images={product.images || []} 
                productName={product.name} 
            />
            {/* Mobile-only Firmness Scale (requested: Main image -> thumbnails -> firmness) 
                Gallery includes thumbnails. So put Firmness below Gallery on Mobile 
                but prompt said "Mobile-First: Main image... thumbnails... followed by Firmness Feel". 
                Gallery handles Main+Thumbs. So we put Firmness here for Mobile, hide on Desktop?
                Prompt said "Desktop: 2-column...". 
                Let's put Firmness in Right Column for Desktop, and strictly speaking 
                below gallery for mobile. 
                But HTML flow: Left Col (Gallery) -> Right Col (Info).
                On Mobile: Stacked. Gallery -> Info.
                If I put Firmness in Right Col, on mobile it appears after Title/Price etc.
                To strictly follow "Main image... thumbnails... followed by Firmness Feel", 
                Firmness needs to be IN or Immediately AFTER Gallery div.
            */}
             <div className="mt-6 lg:hidden">
                 <h3 className="text-sm font-medium text-gray-900 mb-2">Firmness Feel</h3>
                 <FirmnessScale rating={firmnessRating} />
             </div>
          </div>

          {/* Right Column: Product Info - Sticky */}
          <div className="mt-10 px-4 sm:mt-16 sm:px-0 lg:mt-0 lg:sticky lg:top-24 h-fit">
             <div className="mb-4">
                 <Badge variant="secondary" className="mb-2">
                     {selectedVariant?.material?.name || "Premium Material"}
                 </Badge>
                 <h1 className="text-3xl font-bold tracking-tight text-gray-900">{product.name}</h1>
                 
                 {/* Rating Summary */}
                 <div className="mt-3 flex items-center gap-2">
                      <StarRating rating={averageRating} />
                      <a href="#reviews" className="text-sm text-gray-500 hover:text-gray-900 underline-offset-4 hover:underline">
                          ({reviewCount} {reviewCount === 1 ? 'Review' : 'Reviews'})
                      </a>
                 </div>

                 <div className="mt-3">
                     <h2 className="sr-only">Product information</h2>
                     <p className="text-3xl tracking-tight text-gray-900">
                        {selectedVariant 
                            ? `$${Number(selectedVariant.price).toFixed(2)}` 
                            : `From $${Number(product.basePrice).toFixed(2)}`}
                     </p>
                 </div>
             </div>

             {/* Firmness Scale (Desktop) - Hide on Mobile since we placed it under Gallery */}
             <div className="hidden lg:block my-6">
                 <h3 className="text-sm font-medium text-gray-900 mb-2">Firmness Feel</h3>
                 <FirmnessScale rating={firmnessRating} />
             </div>

             <div className="mt-6">
                <VariantSelector 
                    variants={product.variants} 
                />
             </div>

             <div className="mt-8">
                 <BuyBox 
                    product={product} 
                    selectedVariant={selectedVariant}
                 />
             </div>

             <div className="mt-10">
                 <ProductSpecs description={product.description || ""} materials={variantMaterials} />
             </div>
          </div>
        </div>

        {/* Reviews Section - Suspense Streamed */}
        <div id="reviews">
            <Suspense fallback={<ReviewsSkeleton />}>
                <ReviewSection productId={product.id} />
            </Suspense>
        </div>

        {/* Recommended Section - Suspense Streamed */}
        <div>
            <Suspense fallback={<ProductGridSkeleton />}>
                <RecommendedGrid productId={product.id} />
            </Suspense>
        </div>
      </div>
    </div>
  );
}
