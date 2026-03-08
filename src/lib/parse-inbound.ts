/**
 * Parses an inbound email from either Mailgun's or Postal's webhook payload.
 * Extracts sender, recipients, subject, campaign identifier, and message ID.
 */

export interface ParsedInboundEmail {
  senderEmail: string;
  recipientEmails: string[];
  governmentRecipients: string[];
  clockEmailRecipient: string | null;
  campaignIdentifier: string | null;
  subjectLine: string;
  messageId: string | null;
  timestamp: Date;
}

const CLOCK_DOMAIN = "clock.email";

/**
 * Detects format and parses accordingly.
 * Mailgun sends: sender, recipient, subject, To, Cc, Message-Id, timestamp, etc.
 * Postal sends:  mail_from, rcpt_to, subject, to, cc, message_id, timestamp, etc.
 */
export function parseInboundEmail(
  payload: Record<string, string | number | undefined>
): ParsedInboundEmail {
  // Detect format: Mailgun uses "sender", Postal uses "mail_from"
  const isMailgun = "sender" in payload && "recipient" in payload;

  if (isMailgun) {
    return parseMailgun(payload);
  }
  return parsePostal(payload);
}

// ─── Mailgun format ─────────────────────────────────────────────

function parseMailgun(
  payload: Record<string, string | number | undefined>
): ParsedInboundEmail {
  const senderEmail = extractFirstEmail(String(payload.sender ?? "")) ?? "";
  const subjectLine = String(payload.subject ?? "(no subject)");
  const messageId = payload["Message-Id"]
    ? String(payload["Message-Id"])
    : null;
  const timestamp = payload.timestamp
    ? new Date(Number(payload.timestamp) * 1000)
    : new Date();

  // Mailgun provides To, Cc, and recipient (envelope)
  const allRecipients = collectRecipients(
    String(payload.To ?? payload.to ?? ""),
    String(payload.Cc ?? payload.cc ?? ""),
    String(payload.recipient ?? "")
  );

  return classifyRecipients(allRecipients, {
    senderEmail,
    subjectLine,
    messageId,
    timestamp,
  });
}

// ─── Postal format ──────────────────────────────────────────────

function parsePostal(
  payload: Record<string, string | number | undefined>
): ParsedInboundEmail {
  const senderEmail = String(payload.mail_from ?? "")
    .toLowerCase()
    .trim();
  const subjectLine = String(payload.subject ?? "(no subject)");
  const messageId = payload.message_id ? String(payload.message_id) : null;
  const timestamp = payload.timestamp
    ? new Date(Number(payload.timestamp) * 1000)
    : new Date();

  const allRecipients = collectRecipients(
    String(payload.to ?? ""),
    String(payload.cc ?? ""),
    String(payload.rcpt_to ?? "")
  );

  return classifyRecipients(allRecipients, {
    senderEmail,
    subjectLine,
    messageId,
    timestamp,
  });
}

// ─── Shared helpers ─────────────────────────────────────────────

function classifyRecipients(
  allRecipients: string[],
  base: {
    senderEmail: string;
    subjectLine: string;
    messageId: string | null;
    timestamp: Date;
  }
): ParsedInboundEmail {
  let clockEmailRecipient: string | null = null;
  let campaignIdentifier: string | null = null;
  const governmentRecipients: string[] = [];

  for (const email of allRecipients) {
    if (email.endsWith(`@${CLOCK_DOMAIN}`)) {
      clockEmailRecipient = email;
      campaignIdentifier = extractCampaignIdentifier(email);
    } else {
      governmentRecipients.push(email);
    }
  }

  return {
    ...base,
    recipientEmails: allRecipients,
    governmentRecipients,
    clockEmailRecipient,
    campaignIdentifier,
  };
}

/**
 * Extracts the campaign identifier from a plus-addressed clock.email address.
 * e.g., "start+mattapan-bus-a7k2m@clock.email" -> "mattapan-bus-a7k2m"
 */
function extractCampaignIdentifier(email: string): string | null {
  const localPart = email.split("@")[0];
  const plusIndex = localPart.indexOf("+");
  if (plusIndex === -1) return null;
  const identifier = localPart.slice(plusIndex + 1);
  return identifier.length > 0 ? identifier : null;
}

/**
 * Extracts the first email address from a string like "Name <email>" or plain "email".
 */
function extractFirstEmail(str: string): string | null {
  const match = str.match(/[\w.+-]+@[\w.-]+/);
  return match ? match[0].toLowerCase().trim() : null;
}

/**
 * Collects unique email addresses from To, CC headers and the envelope recipient.
 */
function collectRecipients(
  to?: string,
  cc?: string,
  rcptTo?: string
): string[] {
  const emails = new Set<string>();

  const parse = (header?: string) => {
    if (!header) return;
    const matches = header.match(/[\w.+-]+@[\w.-]+/g);
    if (matches) {
      for (const m of matches) {
        emails.add(m.toLowerCase().trim());
      }
    }
  };

  parse(to);
  parse(cc);
  parse(rcptTo);

  return Array.from(emails);
}
