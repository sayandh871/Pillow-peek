import Card from "../components/Card";

const latestMattress = [
  {
    title: "CloudSoft Memory Foam",
    description: "Plush cooling foam ideal for side sleepers.",
    price: 899,
    imageSrc: "/mattress/mattress-1.webp",
    meta: "12\" profile • Medium-soft",
  },
  {
    title: "OrthoSupport Hybrid",
    description: "Pocketed coils with foam for balanced support.",
    price: 1199,
    imageSrc: "/mattress/mattress-2.webp",
    meta: "13\" profile • Medium",
  },
  {
    title: "FirmAlign Latex",
    description: "Responsive latex feel for back/stomach sleepers.",
    price: 1099,
    imageSrc: "/mattress/mattress-3.webp",
    meta: "10\" profile • Firm",
  },
];

export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen max-w-6xl flex-col gap-10 px-4 py-10 md:px-6 lg:px-8">
      <section className="space-y-6">
        <h2 className="text-heading-2 text-dark-900">Latest Mattress</h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {latestMattress.map((item) => (
            <Card
              key={item.title}
              title={item.title}
              description={item.description}
              price={item.price}
              meta={item.meta}
              imageSrc={item.imageSrc}
            />
          ))}
        </div>
      </section>
    </main>
  );
}
