/**
 * Verifies Mailgun webhook signatures using HMAC-SHA256.
 * See: https://documentation.mailgun.com/docs/mailgun/api-reference/openapi-final/tag/Webhooks/
 */

import { createHmac } from "crypto";

interface MailgunSignature {
  timestamp: string;
  token: string;
  signature: string;
}

export function verifyMailgunSignature(sig: MailgunSignature): boolean {
  const signingKey = process.env.MAILGUN_WEBHOOK_SIGNING_KEY;
  if (!signingKey) {
    console.warn("[mailgun] No MAILGUN_WEBHOOK_SIGNING_KEY set, skipping verification");
    return true; // Allow in dev when key isn't set
  }

  const hmac = createHmac("sha256", signingKey);
  hmac.update(sig.timestamp + sig.token);
  const computed = hmac.digest("hex");

  return computed === sig.signature;
}
