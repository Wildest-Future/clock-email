/**
 * Parses an inbound email from Postal's webhook payload.
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

export function parseInboundEmail(payload: {
  mail_from: string;
  rcpt_to: string;
  subject?: string;
  message_id?: string;
  timestamp?: number;
  to?: string;
  cc?: string;
}): ParsedInboundEmail {
  const senderEmail = payload.mail_from.toLowerCase().trim();
  const subjectLine = payload.subject ?? "(no subject)";
  const messageId = payload.message_id ?? null;
  const timestamp = payload.timestamp
    ? new Date(payload.timestamp * 1000)
    : new Date();

  // Collect all recipient addresses from To and CC headers
  const allRecipients = collectRecipients(payload.to, payload.cc, payload.rcpt_to);

  // Find the clock.email address and extract campaign identifier
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
    senderEmail,
    recipientEmails: allRecipients,
    governmentRecipients,
    clockEmailRecipient,
    campaignIdentifier,
    subjectLine,
    messageId,
    timestamp,
  };
}

/**
 * Extracts the campaign identifier from a plus-addressed clock.email address.
 * e.g., "start+mattapan-bus-a7k2m@clock.email" -> "mattapan-bus-a7k2m"
 * e.g., "start@clock.email" -> null (unaffiliated clock)
 */
function extractCampaignIdentifier(email: string): string | null {
  const localPart = email.split("@")[0];
  const plusIndex = localPart.indexOf("+");
  if (plusIndex === -1) return null;
  const identifier = localPart.slice(plusIndex + 1);
  return identifier.length > 0 ? identifier : null;
}

/**
 * Collects unique email addresses from To, CC headers and the envelope rcpt_to.
 */
function collectRecipients(
  to?: string,
  cc?: string,
  rcptTo?: string
): string[] {
  const emails = new Set<string>();

  const parse = (header?: string) => {
    if (!header) return;
    // Handle formats like "Name <email>" or plain "email"
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
