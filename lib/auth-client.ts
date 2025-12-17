import { createAuthClient } from "better-auth/react";
import { adminClient } from "better-auth/plugins/admin";

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_APP_URL, // Ensure this env var is set
  plugins: [
    // adminClient()
  ]
});
