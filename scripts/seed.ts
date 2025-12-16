import "dotenv/config";
import { db } from "../db/client";
import { products } from "../db/schema";

async function main() {
  const sampleProducts = [
    {
      name: "CloudSoft Memory Foam Mattress",
      description: "Plush memory foam mattress with cooling gel for side sleepers.",
      priceCents: 89900,
      firmness: "soft",
      size: "Queen",
      heightInches: "12.0",
    },
    {
      name: "OrthoSupport Hybrid Mattress",
      description: "Hybrid mattress with pocketed coils for balanced support and pressure relief.",
      priceCents: 119900,
      firmness: "medium",
      size: "King",
      heightInches: "13.0",
    },
    {
      name: "FirmAlign Latex Mattress",
      description: "Responsive latex mattress ideal for back and stomach sleepers.",
      priceCents: 109900,
      firmness: "firm",
      size: "Queen",
      heightInches: "10.0",
    },
  ];

  await db.delete(products);
  await db.insert(products).values(sampleProducts);
  // eslint-disable-next-line no-console
  console.log("Seeded products table with sample mattresses.");
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exit(1);
});


