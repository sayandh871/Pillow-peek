
import { auth } from "@/lib/auth"; // Import from lib/auth (which is lib/auth/index.ts actually, check imports)
import { toNextJsHandler } from "better-auth/next-js";

export const { POST, GET } = toNextJsHandler(auth);
