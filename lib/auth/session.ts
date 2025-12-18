import { auth } from "./index";
import { headers } from "next/headers";

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  image?: string | null;
  role: "user" | "admin";
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthSession {
  user: SessionUser;
  session: {
    id: string;
    userId: string;
    expiresAt: Date;
    token: string;
    ipAddress?: string;
    userAgent?: string;
  };
}

export async function getAuthSession(): Promise<AuthSession | null> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) return null;

  // Type guard to ensure session has expected shape
  if (!session.user || typeof session.user !== "object") return null;
  
  const user = session.user as any;
  
  // Validate required fields
  if (!user.id || !user.email || !user.role) return null;

  return session as AuthSession;
}

export async function requireAuth(): Promise<AuthSession> {
  const session = await getAuthSession();
  if (!session) {
    throw new Error("Unauthorized: Authentication required");
  }
  return session;
}

export async function requireAdmin(): Promise<AuthSession> {
  const session = await requireAuth();
  if (session.user.role !== "admin") {
    throw new Error("Unauthorized: Admin access required");
  }
  return session;
}

export function isAdmin(session: AuthSession | null): boolean {
  return session?.user?.role === "admin";
}
