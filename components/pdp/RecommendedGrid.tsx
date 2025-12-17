import { getRecommendedMattresses } from "@/lib/actions/product";
import { ProductCard } from "@/components/ProductCard";

export async function RecommendedGrid({ productId }: { productId: string }) {
  const products = await getRecommendedMattresses(productId);

  if (products.length === 0) {
      return null; 
  }

  return (
    <section className="mt-24 border-t pt-16">
        <h2 className="text-2xl font-bold tracking-tight text-gray-900 mb-8">
            You Might Also Like
        </h2>
        <div className="grid grid-cols-1 gap-y-10 gap-x-6 sm:grid-cols-2 lg:grid-cols-4 xl:gap-x-8">
            {products.map((related) => (
                <ProductCard
                    key={related.id}
                    id={related.id}
                    name={related.name}
                    description={related.description}
                    startingPrice={related.startingPrice}
                    imageUrl={related.imageUrl}
                    availableSizes={related.availableSizes}
                    availableFirmness={related.availableFirmness}
                />
            ))}
        </div>
    </section>
  );
}
