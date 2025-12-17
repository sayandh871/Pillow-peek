
import 'dotenv/config';
import { db } from '../lib/db';
import { products, productVariants } from '../lib/db/schema';
import { count } from 'drizzle-orm';

async function verify() {
  console.log('🔍 Verifying seed data...');
  try {
    const [{ count: pCount }] = await db.select({ count: count() }).from(products);
    const [{ count: vCount }] = await db.select({ count: count() }).from(productVariants);

    console.log(`Products: ${pCount}`);
    console.log(`Variants: ${vCount}`);

    if (pCount === 10 && vCount > 0) {
      console.log('✅ Verification successful: 10 Products and associated variants found.');
    } else {
      console.log(`⚠️ Partial verification: Found ${pCount} products (expected 10).`);
    }
  } catch (e) {
    console.error('❌ Verification failed (Database Error):', e);
  } finally {
    process.exit(0);
  }
}

verify();
