import { cookies } from "next/headers";

const ADMIN_COOKIE_NAME = "admin_token";

export function verifyAdminToken(token: string): { valid: boolean; name: string } {
  const adminToken = process.env.ADMIN_TOKEN;
  if (!adminToken) return { valid: false, name: "" };
  if (token !== adminToken) return { valid: false, name: "" };
  return { valid: true, name: process.env.ADMIN_NAME ?? "Admin" };
}

export async function getAdmin(): Promise<{ authenticated: boolean; name: string }> {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_COOKIE_NAME)?.value;
  if (!token) return { authenticated: false, name: "" };
  const result = verifyAdminToken(token);
  return { authenticated: result.valid, name: result.name };
}

export { ADMIN_COOKIE_NAME };
