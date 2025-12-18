import { Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { Metadata } from "next";
import { Truck, ShieldCheck, Moon } from "lucide-react";
import { getFeaturedProducts } from "@/lib/actions/product";
import Card from "@/components/Card";

export const metadata: Metadata = {
  title: "Pillow-Peek | Sleep Without Compromise",
  description: "Expertly engineered mattresses designed for your specific sleep profile. Experience professional-grade comfort and support.",
};

export default function HomePage() {
  return (
    <div className="flex flex-col gap-16 pb-16">
      {/* Hero Section */}
      <section className="relative h-[85vh] w-full overflow-hidden">
        <Image
          src="/home-hero.png"
          alt="Premium bedroom with a luxurious mattress"
          fill
          priority
          className="object-cover"
        />
        <div className="absolute inset-0 bg-dark-900/10" />
        <div className="absolute inset-0 flex flex-col items-center justify-center px-4 text-center">
          <h1 className="max-w-4xl font-playfair text-[32px] sm:text-[48px] md:text-[100px] text-light-100 drop-shadow-xl leading-[1.1]">
            Sleep Without Compromise.
          </h1>
          <p className="mt-8 max-w-2xl text-lead text-light-100 drop-shadow-md">
            Expertly engineered mattresses designed for your specific sleep profile.
          </p>
          <div className="mt-12">
            <Link
              href="/mattresses"
              className="inline-flex h-16 items-center justify-center rounded-full bg-light-100 px-12 text-body-medium font-semibold text-dark-900 transition-all hover:scale-105 hover:bg-light-200"
            >
              Shop All Mattresses
            </Link>
          </div>
        </div>
      </section>

      {/* Brand Promotion Section (Fancy Fonts) */}
      <section className="mx-auto max-w-7xl px-4 py-12 text-center sm:px-6 lg:px-8">
        <div className="inline-block py-8">
          <span className="block text-caption uppercase tracking-[0.3em] text-dark-500 mb-2">Introducing</span>
          <h2 className="font-playfair text-[64px] italic text-dark-900 leading-tight md:text-[84px]">
            Pillow Peek
          </h2>
          <p className="mt-4 font-playfair text-xl italic text-dark-700">
            &quot;The zenith of rest, redefined.&quot;
          </p>
        </div>
      </section>

      {/* Trust & Benefits Grid */}
      <section className="mx-auto grid max-w-7xl grid-cols-1 gap-12 border-y border-light-300 px-4 py-20 sm:grid-cols-3 sm:px-6 lg:px-8">
        {[
          {
            title: "100-Night Trial",
            description: "Sleep on it. If you don&apos;t love it, we&apos;ll take it back seamlessly.",
            icon: Moon,
          },
          {
            title: "Free Shipping",
            description: "Delivered to your door in a convenient, eco-friendly setup.",
            icon: Truck,
          },
          {
            title: "10-Year Warranty",
            description: "Quality that lasts. We stand behind every single stitch.",
            icon: ShieldCheck,
          },
        ].map((benefit) => (
          <div key={benefit.title} className="flex flex-col items-center text-center">
            <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-light-200 text-dark-900 transition-colors hover:bg-dark-900 hover:text-light-100">
              <benefit.icon className="h-7 w-7" />
            </div>
            <h3 className="text-2xl font-medium text-dark-900">{benefit.title}</h3>
            <p className="mt-3 text-body text-dark-700 max-w-[280px]">{benefit.description}</p>
          </div>
        ))}
      </section>

      {/* Featured Products Section */}
      <section className="mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8">
        <div className="mb-12 flex items-end justify-between border-b border-light-300 pb-6">
          <div>
            <span className="text-caption uppercase tracking-widest text-dark-500">Curated Collection</span>
            <h2 className="mt-2 text-3xl font-bold text-dark-900 md:text-5xl">Featured Mattresses</h2>
          </div>
          <Link href="/mattresses" className="group flex items-center gap-2 text-body-medium text-dark-900 transition-colors hover:text-dark-700">
            View All <span className="transition-transform group-hover:translate-x-1">→</span>
          </Link>
        </div>

        <Suspense fallback={<ProductGridSkeleton />}>
          <FeaturedProductsList />
        </Suspense>
      </section>
      
      {/* Experience Section */}
      <section className="bg-dark-900 py-24 text-light-100">
         <div className="mx-auto max-w-4xl px-4 text-center">
            <h2 className="font-playfair text-4xl md:text-6xl italic italic">Crafted for the Dreamers.</h2>
            <p className="mt-6 text-lead text-light-400">
              Discover the intersection of science and comfort. Our hybrid technology adapts to your movement, ensuring an uninterrupted cycle of deep, restorative sleep.
            </p>
         </div>
      </section>
    </div>
  );
}

async function FeaturedProductsList() {
  const products = await getFeaturedProducts();

  return (
    <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-3">
      {products.map((product) => (
        <Card
          key={product.id}
          title={product.name}
          description={product.description?.slice(0, 100) + (product.description && product.description.length > 100 ? "..." : "")}
          imageSrc={product.imageUrl}
          price={product.minPrice ?? 0}
          href={`/mattresses/${product.id}`}
          badge={{ label: "Featured", tone: "green" }}
          className="h-full border-none shadow-hover"
        />
      ))}
    </div>
  );
}

function ProductGridSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-3">
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex flex-col gap-6 animate-pulse">
          <div className="aspect-[4/5] w-full rounded-2xl bg-light-300" />
          <div className="space-y-3">
            <div className="h-8 w-3/4 rounded-lg bg-light-300" />
            <div className="h-5 w-full rounded-lg bg-light-300" />
            <div className="h-5 w-2/3 rounded-lg bg-light-300" />
          </div>
        </div>
      ))}
    </div>
  );
}
