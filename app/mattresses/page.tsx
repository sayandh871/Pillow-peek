import { Suspense } from "react";
import { FilterSidebar } from "@/components/filter/Sidebar";
import { SortDropdown } from "@/components/SortDropdown";
import { ProductCard } from "@/components/ProductCard";
import { MobileDrawer } from "@/components/filter/MobileDrawer";
import { db } from "@/lib/db";
import { sizes as sizesTable, firmness as firmnessTable, materials as materialsTable } from "@/lib/db/schema";
import { getAllProducts } from "@/lib/actions/product";
import { parseSearchParams } from "@/lib/utils/query";
import { notFound } from "next/navigation";
import { Metadata } from "next";

// Force dynamic rendering for searchParams
export const dynamic = 'force-dynamic';

export async function generateMetadata({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }): Promise<Metadata> {
    const params = await searchParams;
    const filters = parseSearchParams(params);
    const countText = filters.sizes?.length ? `${filters.sizes.length} sizes` : 'Luxury Mattresses';
    return {
        title: `Shop ${countText} | Pillow-Peek`,
        description: 'Find your perfect sleep with our premium mattress collection.',
    }
}

async function getFilterOptions() {
  const [sizes, firmness, materials] = await Promise.all([
    db.select().from(sizesTable),
    db.select().from(firmnessTable),
    db.select().from(materialsTable),
  ]);
  
  return {
    sizes: sizes.map(s => ({ id: s.id, label: s.name })),
    firmness: firmness.map(f => ({ id: f.id, label: f.name })),
    materials: materials.map(m => ({ id: m.id, label: m.name })),
  };
}

export default async function MattressesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const resolvedParams = await searchParams;
  const filters = parseSearchParams(resolvedParams);
  const filterOptions = await getFilterOptions();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col gap-8 lg:flex-row">
        {/* Mobile Filter Drawer */}
        <div className="lg:hidden">
          <MobileDrawer {...filterOptions} />
        </div>

        {/* Desktop Sidebar */}
        <aside className="hidden w-64 flex-shrink-0 lg:block">
          <FilterSidebar {...filterOptions} />
        </aside>

        {/* Main Content */}
        <div className="flex-1">
          <div className="mb-6 flex items-center justify-between">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">
              Mattresses
            </h1>
            <SortDropdown />
          </div>

          <Suspense fallback={<ProductGridSkeleton />}>
            <ProductGrid filters={filters} />
          </Suspense>
        </div>
      </div>
    </div>
  );
}

async function ProductGrid({ filters }: { filters: ReturnType<typeof parseSearchParams> }) {
  const { products, totalCount } = await getAllProducts(filters);

  if (products.length === 0) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
        <h3 className="text-lg font-semibold">No mattresses found</h3>
        <p className="text-muted-foreground">
          Try adjusting your filters or clearing them to see more results.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          id={product.id}
          name={product.name}
          description={product.description}
          startingPrice={product.minPrice}
          imageUrl={product.imageUrl}
          availableSizes={product.availableSizes || []}
          availableFirmness={[]} // We didn't aggregate firmness in current query for performance, can add if needed
        />
      ))}
    </div>
  );
}

function ProductGridSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="h-[400px] rounded-xl bg-gray-100 animate-pulse" />
      ))}
    </div>
  );
}
