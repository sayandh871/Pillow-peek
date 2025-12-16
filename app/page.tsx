import { db } from "../db/client";
import { products } from "../db/schema";

export default async function Home() {
  const items = await db.select().from(products);

  return (
    <div className="min-h-screen bg-zinc-50 px-4 py-12 font-sans text-zinc-900 dark:bg-black dark:text-zinc-50">
      <main className="mx-auto max-w-5xl">
        <header className="mb-10 flex flex-col gap-2 sm:flex-row sm:items-baseline sm:justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              Pillow Peek
            </h1>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
              Explore our curated lineup of mattresses.
            </p>
          </div>
        </header>

        <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
          <h2 className="mb-4 text-lg font-medium">Mattress catalog</h2>
          {items.length === 0 ? (
            <p className="text-sm text-zinc-500">No products found in the database.</p>
          ) : (
            <ul className="grid gap-4 md:grid-cols-2">
              {items.map((product) => (
                <li
                  key={product.id}
                  className="flex flex-col justify-between rounded-xl border border-zinc-200 bg-zinc-50 p-4 text-sm dark:border-zinc-800 dark:bg-zinc-900"
                >
                  <div>
                    <h3 className="text-base font-semibold">{product.name}</h3>
                    <p className="mt-1 text-zinc-600 dark:text-zinc-400">
                      {product.description}
                    </p>
                  </div>
                  <div className="mt-4 flex items-center justify-between text-xs text-zinc-600 dark:text-zinc-400">
                    <div className="flex gap-3">
                      <span className="rounded-full bg-zinc-200 px-2 py-0.5 text-[11px] font-medium uppercase tracking-wide dark:bg-zinc-800">
                        {product.firmness}
                      </span>
                      <span>
                        {product.size} · {product.heightInches}&quot; tall
                      </span>
                    </div>
                    <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                      ${(product.priceCents / 100).toFixed(0)}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
    </div>
  );
}
