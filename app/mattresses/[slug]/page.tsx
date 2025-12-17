
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { getProduct, getFilteredProducts } from "@/lib/db/queries";
import { Gallery } from "@/components/pdp/Gallery";
import { VariantSelector } from "@/components/pdp/VariantSelector";
import { BuyBox } from "@/components/pdp/BuyBox";
import { FirmnessScale } from "@/components/pdp/FirmnessScale";
import { ProductSpecs } from "@/components/pdp/ProductSpecs";
import { ProductCard } from "@/components/ProductCard";
import { Badge } from "@/components/ui/badge";
import { StarRating } from "@/components/pdp/StarRating";
import { Metadata } from "next";

type Params = Promise<{ slug: string }>;
type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

export async function generateMetadata(
  props: {
    params: Params;
  }
): Promise<Metadata> {
  const params = await props.params;
  const product = await getProduct(params.slug);

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
  const product = await getProduct(params.slug);

  if (!product) {
    notFound();
  }

  // Fetch related products (simple logic: just fetch some products, effectively "newest")
  const relatedProducts = await getFilteredProducts({ limit: 4 });
  // Filter out current product
  const filteredRelated = relatedProducts.filter(p => p.id !== product.id).slice(0, 4);


  // Determine selected variant based on URL params
  const selectedSize = typeof searchParams.size === 'string' ? searchParams.size : undefined;
  const selectedFirmness = typeof searchParams.firmness === 'string' ? searchParams.firmness : undefined;

  let selectedVariant = undefined;

  // If both selected, find exact match
  if (selectedSize && selectedFirmness) {
      selectedVariant = product.variants.find(
          v => v.sizeId === selectedSize && v.firmnessId === selectedFirmness
      );
  } 
  // If only one selected, or none, we might want to pick a default?
  // Usually landing on PDP shows a default configuration (e.g. Queen, Medium) or the "Starting From" price variant.
  // For now, if no params, we don't select a specific one for the BuyBox (it shows range or asks to select), 
  // BUT the BuyBox logic I wrote expects a variant to show a specific price.
  // Let's pick a default if nothing selected: First variant?
  // Or "Queen" "Medium"?
  
  if (!selectedVariant && !selectedSize && !selectedFirmness && product.variants.length > 0) {
      // Pick middle ground or first
      // Try to find Queen/Medium
      const defaultVariant = product.variants.find(v => v.sizeId === 'queen' && v.firmnessId === 'medium') || product.variants[0];
      // We don't auto-redirect (avoid flicker), but we can pass it as "initial"
      selectedVariant = defaultVariant;
  }


  // Calculate firmness rating for the specific variant if possible, 
  // OR just use the global product range / or the selected variant's firmness rating.
  // The `firmness` table has `rating`.
  // `getProduct` query includes nested `firmness`.
  const firmnessRating = selectedVariant?.firmness?.rating || 5; 
  // If multiple firmnesses, maybe show range? But FirmnessScale takes a number.
  
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
          </div>

          {/* Right Column: Product Info */}
          <div className="mt-10 px-4 sm:mt-16 sm:px-0 lg:mt-0">
             <div className="mb-4">
                 <Badge variant="secondary" className="mb-2">
                     {product.variants[0]?.material?.name || "Premium Material"}
                 </Badge>
                 <h1 className="text-3xl font-bold tracking-tight text-gray-900">{product.name}</h1>
                 
                 {/* Rating */}
                 <div className="mt-3 flex items-center gap-2">
                      <StarRating rating={product.reviews.length > 0 ? product.reviews.reduce((acc, r) => acc + r.rating, 0) / product.reviews.length : 0} />
                      <span className="text-sm text-gray-500">
                          ({product.reviews.length} {product.reviews.length === 1 ? 'Review' : 'Reviews'})
                      </span>
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

             {/* Firmness Scale (Visual) */}
             <div className="my-6">
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
                 <ProductSpecs description={product.description || ""} />
             </div>
          </div>
        </div>

        {/* Cross Sell */}
        <section className="mt-24 border-t pt-16">
            <h2 className="text-2xl font-bold tracking-tight text-gray-900 mb-8">
                You Might Also Like
            </h2>
            <div className="grid grid-cols-1 gap-y-10 gap-x-6 sm:grid-cols-2 lg:grid-cols-4 xl:gap-x-8">
                {filteredRelated.map((related) => (
                    <ProductCard
                        key={related.id}
                        id={related.id}
                        name={related.name}
                        description={related.description}
                        basePrice={related.basePrice}
                        imageUrl={related.imageUrl}
                        startingPrice={related.startingPrice}
                        availableSizes={related.availableSizes}
                        availableFirmness={related.availableFirmness}
                    />
                ))}
            </div>
        </section>
      </div>
    </div>
  );
}
