
import { Suspense } from "react";
import { getFilteredProducts, getFilterMetadata } from "@/lib/db/queries";
import { ProductCard } from "@/components/ProductCard";
import { FilterSidebar } from "@/components/filter/Sidebar";
import { MobileDrawer } from "@/components/filter/MobileDrawer";
import { SortDropdown } from "@/components/SortDropdown";
import { Metadata } from "next";

// Next.js 15 searchParams is a Promise
type Params = Promise<{ [key: string]: string | string[] | undefined }>;

export async function generateMetadata(props: { searchParams: Params }): Promise<Metadata> {
  const searchParams = await props.searchParams;
  const materials = searchParams.materials;
  const sizes = searchParams.sizes;
  
  let title = "Mattresses | Pillow Peek";
  if (typeof materials === 'string') {
      title = `${materials} Mattresses | Pillow Peek`; // Simple logic, improves SEO
  }
  
  return {
    title,
    description: "Find your perfect sleep with our premium mattress collection.",
  };
}

export default async function MattressesPage(props: {
  searchParams: Params;
}) {
  const searchParams = await props.searchParams;

  // Helper to ensure array
  const toArray = (val: string | string[] | undefined) => {
    if (!val) return undefined;
    if (Array.isArray(val)) return val;
    // Handle comma-separated strings if query-string parsed them as string? 
    // Next.js searchParams handles standard repeating params (?s=a&s=b) as array.
    // If we use comma separation (?s=a,b) manually, we need to split.
    if (val.includes(',')) return val.split(',');
    return [val];
  };

  const sizes = toArray(searchParams.sizes);
  const firmness = toArray(searchParams.firmness);
  const materials = toArray(searchParams.materials);
  const minPrice = searchParams.minPrice ? Number(searchParams.minPrice) : undefined;
  const maxPrice = searchParams.maxPrice ? Number(searchParams.maxPrice) : undefined;
  const sort = searchParams.sort as "price_asc" | "price_desc" | "newest" | undefined;
  const page = searchParams.page ? Number(searchParams.page) : 1;

  // Fetch data in parallel
  const [productsData, filterOptions] = await Promise.all([
    getFilteredProducts({
      sizes,
      firmness,
      materials,
      minPrice,
      maxPrice,
      sort,
      page,
      limit: 12,
    }),
    getFilterMetadata(),
  ]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-baseline justify-between border-b pb-6 pt-24">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900">
          Our Collection
        </h1>
        <div className="flex items-center gap-4">
          <SortDropdown />
          <MobileDrawer 
             sizes={filterOptions.sizes} 
             firmness={filterOptions.firmness} 
             materials={filterOptions.materials} 
          />
        </div>
      </div>

      <section className="pt-6 pb-24">
        <div className="grid grid-cols-1 gap-x-8 gap-y-10 lg:grid-cols-4">
          {/* Desktop Filter Sidebar */}
          <aside className="hidden lg:block">
            <FilterSidebar
              sizes={filterOptions.sizes}
              firmness={filterOptions.firmness}
              materials={filterOptions.materials}
            />
          </aside>

          {/* Product Grid */}
          <div className="lg:col-span-3">
             <Suspense fallback={<div className="grid grid-cols-1 gap-y-10 gap-x-6 sm:grid-cols-2 lg:grid-cols-3 xl:gap-x-8"><div className="h-64 bg-gray-100 rounded animate-pulse"></div><div className="h-64 bg-gray-100 rounded animate-pulse"></div><div className="h-64 bg-gray-100 rounded animate-pulse"></div></div>}>
                {productsData.length > 0 ? (
                    <div className="grid grid-cols-1 gap-y-10 gap-x-6 sm:grid-cols-2 lg:grid-cols-3 xl:gap-x-8">
                    {productsData.map((product) => (
                        <ProductCard
                        key={product.id}
                        id={product.id}
                        name={product.name}
                        description={product.description}
                        basePrice={product.basePrice}
                        imageUrl={product.imageUrl}
                        startingPrice={product.startingPrice}
                        availableSizes={product.availableSizes}
                        availableFirmness={product.availableFirmness}
                        />
                    ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                        <h3 className="mt-2 text-sm font-semibold text-gray-900">No products found</h3>
                        <p className="mt-1 text-sm text-gray-500">Try adjusting your filters.</p>
                    </div>
                )}
            </Suspense>
          </div>
        </div>
      </section>
    </div>
  );
}
