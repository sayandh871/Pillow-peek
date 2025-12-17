
import 'dotenv/config';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

async function reset() {
  console.log('🗑️  Resetting database...');
  try {
    // Drop tables with CASCADE to handle foreign keys
    await sql`DROP TABLE IF EXISTS "product_variants" CASCADE`;
    await sql`DROP TABLE IF EXISTS "products" CASCADE`;
    await sql`DROP TABLE IF EXISTS "categories" CASCADE`;
    await sql`DROP TABLE IF EXISTS "sizes" CASCADE`;
    await sql`DROP TABLE IF EXISTS "firmness" CASCADE`;
    await sql`DROP TABLE IF EXISTS "materials" CASCADE`;
    
    // Also drop any other potential tables from previous schema versions if known, 
    // but strict list is usually safer.
    // Drizzle might create internal tables, but usually not for schema storage in neon-http driver same way.
    
    console.log('✅ Tables dropped successfully.');
  } catch (error) {
    console.error('❌ Reset failed:', error);
  } finally {
    // Process exit not always needed with neon serverless but good practice for scripts
    // But neon helper might hang if not careful? No, it's HTTP.
  }
}

reset();
