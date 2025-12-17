
import 'dotenv/config';
import { db } from '../lib/db';
import { users } from '../lib/db/schema/users';

async function testCreateUser() {
  console.log('🧪 Testing user creation...');
  try {
    const email = `test-${Date.now()}@example.com`;
    console.log(`Attempting to insert user: ${email}`);
    
    await db.insert(users).values({
      name: 'Test User',
      email: email,
      password: 'hashed_password_placeholder',
      role: 'user',
    });

    console.log('✅ Manual INSERT successful.');
  } catch (error) {
    console.error('❌ Manual INSERT failed:', error);
  } finally {
    process.exit(0);
  }
}

testCreateUser();
