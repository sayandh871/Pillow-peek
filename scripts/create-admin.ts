
import 'dotenv/config';
import { db } from '../lib/db';
import { users } from '../lib/db/schema/users';
import { eq } from 'drizzle-orm';

const email = process.argv[2];

if (!email) {
  console.error('Please provide an email address: npx tsx scripts/create-admin.ts <email>');
  process.exit(1);
}

async function promoteToAdmin() {
  console.log(`🔍 Promoting ${email} to admin...`);
  try {
    const user = await db.query.users.findFirst({
        where: eq(users.email, email)
    });

    if (!user) {
        console.error(`❌ User with email ${email} not found.`);
        process.exit(1);
    }

    await db.update(users)
      .set({ role: 'admin' })
      .where(eq(users.email, email));

    console.log(`✅ User ${email} is now an admin.`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Failed to promote user:', error);
    process.exit(1);
  }
}

promoteToAdmin();
