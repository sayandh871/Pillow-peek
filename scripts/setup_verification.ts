import { hash } from 'bcryptjs';
import 'dotenv/config';
import { db } from '../lib/db';
import { products, reviews, users } from '../lib/db/schema';
import { eq } from 'drizzle-orm';

async function setupVerification() {
  console.log('🔍 Finding a product...');
  const allProducts = await db.select().from(products).limit(1);
  
  if (allProducts.length === 0) {
    console.error('❌ No products found. Run seed first.');
    return;
  }

  const product = allProducts[0];
  console.log(`found product: ${product.name} (${product.id})`);

  // Check for users to link reviews to, or create a dummy one
  const allUsers = await db.select().from(users).limit(1);
  let userId;
  if (allUsers.length === 0) {
      console.log('Creating dummy user for reviews...');
      const hashedPassword = await hash('dummy', 10);
      const [newUser] = await db.insert(users).values({
          email: 'reviewer@example.com',
          name: 'Reviewer',
          password: hashedPassword,
          role: 'user' 
      }).returning();
      userId = newUser.id;
  } else {
      userId = allUsers[0].id;
  }

  // Check if reviews exist
  const existingReviews = await db.select().from(reviews).where(eq(reviews.productId, product.id));
  if (existingReviews.length === 0) {
      console.log('📝 Adding dummy reviews to generate ~4.5 rating...');
      await db.insert(reviews).values([
          { productId: product.id, userId: userId, rating: 5, comment: 'Great!' },
          { productId: product.id, userId: userId, rating: 4, comment: 'Good' },
      ]);
      console.log('✅ Added 2 reviews (5, 4) -> Avg 4.5');
  } else {
      console.log(`ℹ️ Product already has ${existingReviews.length} reviews.`);
  }

  console.log(`\n🚀 URL to test: http://localhost:3000/mattresses/${product.id}`);
}

setupVerification();
