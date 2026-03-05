import { randomBytes } from "crypto";

/** Generate a URL-safe random token for check-in links. */
export function generateCheckInToken(): string {
  return randomBytes(32).toString("base64url");
}

/** Generate a 5-character alphanumeric campaign code. */
export function generateCampaignCode(): string {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  const bytes = randomBytes(5);
  return Array.from(bytes)
    .map((b) => chars[b % chars.length])
    .join("");
}

/** Convert a campaign name to a URL-friendly slug. */
export function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}
