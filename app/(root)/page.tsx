
import Card from "../../components/Card";
import {getCurrentUser} from "@/lib/auth/actions";

const products = [
  {
    id: 1,
    title: "CloudRest Memory Foam",
    subtitle: "Premium Mattress",
    meta: "Medium Firm · Pressure Relief",
    price: 18999,
    imageSrc: "/mattress/mattress-1.webp",
    badge: { label: "Best Seller", tone: "orange" as const },
  },
  {
    id: 2,
    title: "OrthoCare Spine Support",
    subtitle: "Orthopedic Mattress",
    meta: "Firm · Back Pain Relief",
    price: 20999,
    imageSrc: "/mattress/mattress-2.webp",
    badge: { label: "Doctor Recommended", tone: "red" as const },
  },
  {
    id: 3,
    title: "CoolBreeze Latex Plus",
    subtitle: "Natural Latex Mattress",
    meta: "Cooling · Breathable",
    price: 26999,
    imageSrc: "/mattress/mattress-3.webp",
    badge: { label: "Cooling", tone: "green" as const },
  },
  {
    id: 4,
    title: "Hybrid Luxe Pro",
    subtitle: "Hybrid Mattress",
    meta: "Pocket Springs · Foam Layers",
    price: 29999,
    imageSrc: "/mattress/mattress-4.webp",
  },
  {
    id: 5,
    title: "SleepSoft Comfort",
    subtitle: "Foam Mattress",
    meta: "Soft · Plush Feel",
    price: 15999,
    imageSrc: "/mattress/mattress-5.webp",
    badge: { label: "New", tone: "orange" as const },
  },
  {
    id: 6,
    title: "RoyalSleep Elite",
    subtitle: "Luxury Mattress",
    meta: "Hotel Grade · Extra Thick",
    price: 34999,
    imageSrc: "/mattress/mattress-6.webp",
    badge: { label: "Luxury", tone: "green" as const },
  },
];


const Home = async () => {
  

  return (
    <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <section aria-labelledby="latest" className="pb-12">
        <h2 id="latest" className="mb-6 text-heading-3 text-dark-900">
          Latest Mattresses
        </h2>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((p) => (
            <Card
              key={p.id}
              title={p.title}
              subtitle={p.subtitle}
              meta={p.meta}
              imageSrc={p.imageSrc}
              price={p.price}
              badge={p.badge}
            />
          ))}
        </div>
      </section>
    </main>
  );
};

export default Home;