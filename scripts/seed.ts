
import 'dotenv/config';
import { db } from '../lib/db';
import { products, productVariants } from '../lib/db/schema'; // Check exports
import { sizes } from '../lib/db/schema/filters/sizes';
import { firmness } from '../lib/db/schema/filters/firmness';
import { materials } from '../lib/db/schema/filters/materials';
import { categories } from '../lib/db/schema/categories';
import { eq } from 'drizzle-orm';

async function seed() {
  console.log('🌱 Starting seed...');

  try {
    // 1. Clear existing data (in order of dependency)
    console.log('Cleaning up old data...');
    await db.delete(productVariants);
    await db.delete(products);
    await db.delete(sizes);
    await db.delete(firmness);
    await db.delete(materials);
    await db.delete(categories);

    // 2. Seed Filter Dimensions
    console.log('Seeding filters...');

    // Sizes
    const sizeData = [
      { id: 'twin', name: 'Twin', dimensions: '38" x 75"' },
      { id: 'twin-xl', name: 'Twin XL', dimensions: '38" x 80"' },
      { id: 'full', name: 'Full', dimensions: '54" x 75"' },
      { id: 'queen', name: 'Queen', dimensions: '60" x 80"' },
      { id: 'king', name: 'King', dimensions: '76" x 80"' },
      { id: 'cal-king', name: 'Cal King', dimensions: '72" x 84"' },
    ];
    await db.insert(sizes).values(sizeData);

    // Firmness
    const firmnessData = [
      { id: 'soft', name: 'Soft', rating: 3, description: 'Plush feel for side sleepers' },
      { id: 'medium', name: 'Medium', rating: 5, description: 'Balanced support for all positions' },
      { id: 'firm', name: 'Firm', rating: 7, description: 'Solid support for back/stomach sleepers' },
      { id: 'extra-firm', name: 'Extra Firm', rating: 9, description: 'Maximum support' },
    ];
    await db.insert(firmness).values(firmnessData);

    // Materials
    const materialData = [
      { id: 'memory-foam', name: 'Memory Foam', description: 'Contouring pressure relief' },
      { id: 'latex', name: 'Latex', description: 'Bouncy and cooling natural foam' },
      { id: 'hybrid', name: 'Hybrid', description: 'Coils + foam for best of both worlds' },
      { id: 'innerspring', name: 'Innerspring', description: 'Traditional bouncy feel' },
    ];
    await db.insert(materials).values(materialData);

    // Categories (Create one for mattresses)
    const [mattressCat] = await db.insert(categories).values({
      name: 'Mattresses',
      slug: 'mattresses',
      description: 'High quality mattresses',
    }).returning();

    // 3. Seed Products & Variants
    console.log('Seeding products and variants...');

    const productTemplates = [
      { name: 'Cloud Sleeper', basePrice: 500, description: 'Like sleeping on a cloud.' },
      { name: 'Orthopedic Dream', basePrice: 800, description: 'Perfect validation for your back.' },
      { name: 'Eco Green', basePrice: 1200, description: 'Organic materials for healthy sleep.' },
      { name: 'The Standard', basePrice: 400, description: 'Reliable and affordable.' },
      { name: 'Luxury Hotel', basePrice: 1500, description: 'Five-star comfort at home.' },
      { name: 'Cool Breeze', basePrice: 900, description: 'Stay cool all night long.' },
      { name: 'Spinal Support', basePrice: 750, description: 'Engineered for alignment.' },
      { name: 'Snuggle Nest', basePrice: 600, description: 'Cozy and encompassing.' },
      { name: 'Firm Foundation', basePrice: 550, description: 'No sink, just support.' },
      { name: 'Night Owl', basePrice: 650, description: 'For those who sleep late.' },
    ];

    for (const p of productTemplates) {
      // Create Product
      const [product] = await db.insert(products).values({
        categoryId: mattressCat.id,
        name: p.name,
        description: p.description,
        basePrice: p.basePrice.toString(),
        isPublished: true,
      }).returning();

      // Pick a random material for this product to act as its "core" material
      const material = materialData[Math.floor(Math.random() * materialData.length)];

      // Create Variants (Cross product of Size x Firmness)
      const variantsToInsert = [];
      
      for (const size of sizeData) {
        for (const firm of firmnessData) {
          // Price Multiplier Logic
          let multiplier = 1.0;
          if (size.id === 'twin-xl') multiplier = 1.1;
          if (size.id === 'full') multiplier = 1.3;
          if (size.id === 'queen') multiplier = 1.5;
          if (size.id === 'king') multiplier = 1.8;
          if (size.id === 'cal-king') multiplier = 1.9;

          // Firmness shouldn't affect price much, maybe +$50 for specialized ones, but let's keep it simple.
          
          const variantPrice = (p.basePrice * multiplier).toFixed(2);
          
          // SKU: PROD-INITIALS-SIZE-FIRM
          const initials = p.name.split(' ').map(w => w[0]).join('').toUpperCase();
          const sku = `${initials}-${size.id.toUpperCase()}-${firm.id.toUpperCase()}-${Math.floor(Math.random()*1000)}`;

          variantsToInsert.push({
            productId: product.id,
            sizeId: size.id,
            firmnessId: firm.id,
            materialId: material.id, // Using the product's chosen material
            price: variantPrice,
            stockQuantity: Math.floor(Math.random() * 50) + 10, // Random stock 10-60
            sku: sku,
            weight: (30 * multiplier).toFixed(2), // Rough weight approx
          });
        }
      }

      // Bulk insert variants
      await db.insert(productVariants).values(variantsToInsert);
    }

    console.log('✅ Seed complete!');
  } catch (error) {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

seed();
