
import 'dotenv/config';
import { auth } from '../lib/auth';

// Mock headers/request if needed (Better-Auth might need request context)
// But api.signUpEmail can be called directly usually or via test helpers.
// actually auth.api.signUpEmail needs a request object usually if context inferred, 
// OR we can use the direct calls if available.
// Let's try calling it. Note that auth.api is the server side API.

async function debugAuth() {
  console.log('🐞 Debugging Auth Signup...');
  const email = `debug-${Date.now()}@example.com`;
  const password = 'password123';
  const name = 'Debug User';

  try {
    console.log(`Attempting to signup user: ${email}`);
    
    // We need to pass a mock request or context if required, 
    // but better-auth server actions might work if we are in a "server" context?
    // Running this in tsx might be tricky if it depends on headers() or cookies().
    // However, let's try calling it.
    
    // Adapting for standalone script execution might require mocking headers
    const res = await auth.api.signUpEmail({
        body: {
            email,
            password,
            name
        },
        asResponse: false // failure will throw or return specific error structure
    });

    console.log('✅ Signup successful result:', res);
    process.exit(0);
  } catch (error) {
    console.error('❌ Signup failed:', error);
    if (error) {
         console.error('Full Error:', JSON.stringify(error, null, 2));
    }
    process.exit(1);
  }
}

debugAuth();
