import { NextRequest } from "next/server";
import type { User } from "@/types/user";

export interface AuthRequest extends NextRequest {
  user?: User;
}

/**
 * Extract JWT token from Authorization header
 */
export function getTokenFromRequest(request: NextRequest): string | null {
  const authHeader = request.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }
  return authHeader.substring(7);
}

/**
 * Verify JWT token and return user
 * This should be implemented based on your auth system
 * For now, returns a mock implementation
 */
export async function verifyToken(token: string): Promise<User | null> {
  // TODO: Implement actual JWT verification
  // This should verify the token and return the user
  // For now, this is a placeholder

  try {
    // In a real implementation, you would:
    // 1. Verify the JWT token
    // 2. Decode the payload
    // 3. Fetch user from database
    // 4. Return user object

    // Example structure:
    // const decoded = jwt.verify(token, process.env.JWT_SECRET!);
    // const user = await User.findById(decoded.userId);
    // return user;

    return null;
  } catch {
    return null;
  }
}

/**
 * Check if user has admin or moderator role
 */
export function hasAdminAccess(user: User | null): boolean {
  if (!user) return false;
  return user.role === "admin" || user.role === "moderator";
}

/**
 * Middleware to authenticate requests
 */
export async function authenticateRequest(
  request: NextRequest
): Promise<{ user: User | null; error: string | null }> {
  const token = getTokenFromRequest(request);

  if (!token) {
    return { user: null, error: "No token provided" };
  }

  const user = await verifyToken(token);

  if (!user) {
    return { user: null, error: "Invalid token" };
  }

  return { user, error: null };
}

/**
 * Middleware to require authentication
 */
export async function requireAuth(
  request: NextRequest
): Promise<{ user: User; error: null } | { user: null; error: string }> {
  const { user, error } = await authenticateRequest(request);

  if (error || !user) {
    return {
      user: null,
      error: error || "Authentication required",
    };
  }

  return { user, error: null };
}

/**
 * Middleware to require admin/moderator access
 */
export async function requireAdmin(
  request: NextRequest
): Promise<{ user: User; error: null } | { user: null; error: string }> {
  const authResult = await requireAuth(request);

  if (authResult.error || !authResult.user) {
    return authResult;
  }

  if (!hasAdminAccess(authResult.user)) {
    return {
      user: null,
      error: "Admin or moderator access required",
    };
  }

  return { user: authResult.user, error: null };
}




