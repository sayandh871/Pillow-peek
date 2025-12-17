
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
    const { productImages } = await import('../lib/db/schema');
    await db.delete(productImages);
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

    // 16 Product Names
    const productNames = [
      'Cloud Sleeper', 'Orthopedic Dream', 'Eco Green', 'The Standard', 
      'Luxury Hotel', 'Cool Breeze', 'Spinal Support', 'Snuggle Nest', 
      'Firm Foundation', 'Night Owl', 'Golden Slumber', 'Royal Comfort',
      'Zen Haven', 'Pure Bliss', 'Deep Rest', 'Morning Glory'
    ];

    // 16 Image files (mapped from directory listing)
    const imageFiles = [
        'mattress-1.webp', 'mattress-2.webp', 'mattress-3.webp', 'mattress-4.webp',
        'mattress-5.webp', 'mattress-6.webp', 'mattress-7.webp', 'mattress-8.webp',
        'mattress-9.webp', 'mattress-10.webp', 'mattress-11.webp', 'mattress-12.webp',
        'mattress-13.webp', 'mattress-14.webp', 'mattress-15.webp', 'mattress-16.webp'
    ];

    const descriptions = [
        'Like sleeping on a cloud.', 'Perfect validation for your back.',
        'Organic materials for healthy sleep.', 'Reliable and affordable.',
        'Five-star comfort at home.', 'Stay cool all night long.',
        'Engineered for alignment.', 'Cozy and encompassing.',
        'No sink, just support.', 'For those who sleep late.',
        'Drift away into golden dreams.', 'Fit for royalty.',
        'Find your inner peace.', 'Pure unadulterated bliss.',
        'The deepest sleep you ever had.', 'Wake up fresh every morning.'
    ];

    const prices = [500, 800, 1200, 400, 1500, 900, 750, 600, 550, 650, 1100, 2000, 950, 1300, 850, 700];

    // Ensure we have 16 items in all arrays
    if (productNames.length !== 16 || imageFiles.length !== 16) {
        throw new Error("Configuration error: Need exactly 16 names and images.");
    }

    const productsToInsert = [];
    const imagesToInsert = [];
    const variantsToInsert = [];

    // Pre-generate IDs for products to link images/variants
    // Actually, we can just await the insert or do it in a loop.
    // Loop is safer for ensuring we get the IDs back.
    
    // productImages is already imported at the top of the function

    for (let i = 0; i < 16; i++) {
        const name = productNames[i];
        const desc = descriptions[i];
        const basePrice = prices[i];
        const imageFile = imageFiles[i];

        // insert product
        const [product] = await db.insert(products).values({
            categoryId: mattressCat.id,
            name: name,
            description: desc,
            basePrice: basePrice.toString(),
            isPublished: true,
        }).returning();

        // insert image
        await db.insert(productImages).values({
            productId: product.id,
            url: `/mattress/${imageFile}`,
            altText: `${name} Mattress`,
            order: 0,
        });

        // Pick a random material
        const material = materialData[Math.floor(Math.random() * materialData.length)];

        // Generate Variants
        for (const size of sizeData) {
            for (const firm of firmnessData) {
                let multiplier = 1.0;
                if (size.id === 'twin-xl') multiplier = 1.1;
                if (size.id === 'full') multiplier = 1.3;
                if (size.id === 'queen') multiplier = 1.5;
                if (size.id === 'king') multiplier = 1.8;
                if (size.id === 'cal-king') multiplier = 1.9;

                const variantPrice = (basePrice * multiplier).toFixed(2);
                const initials = name.split(' ').map(w => w[0]).join('').toUpperCase();
                const sku = `${initials}-${size.id.toUpperCase()}-${firm.id.toUpperCase()}-${Math.floor(Math.random()*1000)}`;

                variantsToInsert.push({
                    productId: product.id,
                    sizeId: size.id,
                    firmnessId: firm.id,
                    materialId: material.id,
                    price: variantPrice,
                    stockQuantity: Math.floor(Math.random() * 50) + 5, // Ensure min stock > 0 for now to valid listings
                    sku: sku,
                    weight: (30 * multiplier).toFixed(2),
                });
            }
        }
    }

    // Bulk insert all variants
    // Note: this might be large, but for 16 products * 6 sizes * 4 firmness = 384 rows, it's fine.
    await db.insert(productVariants).values(variantsToInsert);

    console.log('✅ Seed complete!');
  } catch (error) {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

seed();
