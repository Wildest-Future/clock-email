const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? "https://clock.email";

// Shared email wrapper
function wrap(body: string): string {
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8" /><meta name="viewport" content="width=device-width" /></head>
<body style="margin:0;padding:0;background:#FAF4DD;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <div style="max-width:560px;margin:0 auto;padding:32px 24px;">
    <div style="font-family:monospace;font-weight:700;color:#224749;font-size:18px;margin-bottom:24px;">
      clock.email
    </div>
    ${body}
    <div style="margin-top:32px;padding-top:16px;border-top:1px solid #DAD4BF;font-size:12px;color:#AAA590;">
      <p>You're receiving this because you used clock.email to track a government response.</p>
      <p style="margin-top:4px;">
        <a href="${BASE_URL}" style="color:#224749;">clock.email</a> — Government response time, made visible.
      </p>
    </div>
  </div>
</body>
</html>`;
}

function button(href: string, label: string, color = "#224749"): string {
  return `<a href="${href}" style="display:inline-block;background:${color};color:white;text-decoration:none;padding:10px 20px;border-radius:6px;font-size:14px;font-weight:600;">${label}</a>`;
}

function formatDays(days: number): string {
  if (days === 1) return "1 day";
  return `${days} days`;
}

// ─── Clock Started ───────────────────────────────────────────────

interface ClockStartedParams {
  clockId: string;
  senderEmail: string;
  recipientEmail: string;
  campaignName: string;
  campaignIdentifier: string;
  subjectLine: string;
}

export function clockStartedEmail(params: ClockStartedParams) {
  const clockUrl = `${BASE_URL}/clock/${params.clockId}`;
  const campaignUrl = `${BASE_URL}/campaign/${params.campaignIdentifier}`;

  const subject = `Your clock is ticking — ${params.recipientEmail}`;

  const text = `Your clock has started.

You emailed ${params.recipientEmail} as part of the "${params.campaignName}" campaign. A public timer is now counting how long it takes them to respond.

View your clock: ${clockUrl}
View the campaign: ${campaignUrl}

The clock stops when the recipient responds. We'll check in with you periodically to see if you've heard back.

— clock.email`;

  const html = wrap(`
    <h1 style="font-family:monospace;font-size:22px;color:#282413;margin:0 0 16px;">
      Your clock is ticking.
    </h1>
    <p style="font-size:15px;color:#282413;line-height:1.5;margin:0 0 8px;">
      You emailed <strong style="font-family:monospace;color:#224749;">${params.recipientEmail}</strong>
      as part of the <a href="${campaignUrl}" style="color:#224749;font-weight:600;">${params.campaignName}</a> campaign.
    </p>
    <p style="font-size:15px;color:#635E4B;line-height:1.5;margin:0 0 20px;">
      A public timer is now counting how long it takes them to respond. We'll check in
      with you periodically to see if you've heard back.
    </p>
    <div style="background:#112627;border-radius:10px;padding:20px;text-align:center;margin-bottom:20px;">
      <div style="font-family:monospace;font-size:12px;color:#BBC8C9;text-transform:uppercase;letter-spacing:1px;margin-bottom:8px;">
        Subject line
      </div>
      <div style="font-family:monospace;font-size:16px;color:white;">
        ${params.subjectLine}
      </div>
    </div>
    <div style="text-align:center;">
      ${button(clockUrl, "View your clock")}
    </div>
  `);

  return { to: params.senderEmail, subject, text, html };
}

// ─── Check-in ────────────────────────────────────────────────────

interface CheckInParams {
  clockId: string;
  checkInToken: string;
  senderEmail: string;
  recipientEmail: string;
  campaignName: string;
  subjectLine: string;
  daysSinceStart: number;
}

export function checkInEmail(params: CheckInParams) {
  const clockUrl = `${BASE_URL}/clock/${params.clockId}`;
  const resolvedUrl = `${BASE_URL}/api/check-in?token=${params.checkInToken}&action=resolved`;
  const responseUrl = `${BASE_URL}/api/check-in?token=${params.checkInToken}&action=response_received`;
  const noChangeUrl = `${BASE_URL}/api/check-in?token=${params.checkInToken}&action=no_change`;

  const subject = `${formatDays(params.daysSinceStart)} and counting — still waiting on ${params.recipientEmail}?`;

  const text = `It's been ${formatDays(params.daysSinceStart)} since you emailed ${params.recipientEmail}.

Campaign: ${params.campaignName}
Subject: ${params.subjectLine}

Have you heard back? Click one:

They responded and it's resolved: ${resolvedUrl}
I got a response but it's not resolved: ${responseUrl}
Still waiting, no change: ${noChangeUrl}

View your clock: ${clockUrl}

— clock.email`;

  const html = wrap(`
    <h1 style="font-family:monospace;font-size:22px;color:#282413;margin:0 0 16px;">
      ${formatDays(params.daysSinceStart)} and counting.
    </h1>
    <p style="font-size:15px;color:#282413;line-height:1.5;margin:0 0 8px;">
      You emailed <strong style="font-family:monospace;color:#224749;">${params.recipientEmail}</strong>
      ${formatDays(params.daysSinceStart)} ago. Have you heard back?
    </p>
    <p style="font-size:13px;color:#86806C;line-height:1.5;margin:0 0 20px;">
      Campaign: ${params.campaignName}<br/>
      Subject: ${params.subjectLine}
    </p>
    <div style="background:#EEE8D2;border-radius:10px;padding:20px;margin-bottom:20px;">
      <p style="font-size:14px;color:#635E4B;margin:0 0 16px;font-weight:600;">
        What's the status?
      </p>
      <div style="margin-bottom:10px;">
        ${button(resolvedUrl, "Resolved — they responded", "#2F7D57")}
      </div>
      <div style="margin-bottom:10px;">
        ${button(responseUrl, "Got a response, but not resolved", "#B57A2A")}
      </div>
      <div>
        ${button(noChangeUrl, "Still waiting, no change", "#86806C")}
      </div>
    </div>
    <div style="text-align:center;">
      <a href="${clockUrl}" style="font-size:13px;color:#224749;">View your clock &rarr;</a>
    </div>
  `);

  return { to: params.senderEmail, subject, text, html };
}

// ─── Campaign Creator Notification ──────────────────────────────

interface NewClockNotificationParams {
  campaignName: string;
  campaignIdentifier: string;
  creatorEmail: string;
  recipientEmail: string;
  clockCount: number;
}

export function newClockNotificationEmail(params: NewClockNotificationParams) {
  const campaignUrl = `${BASE_URL}/campaign/${params.campaignIdentifier}`;

  const subject = `New clock started — ${params.campaignName} (${params.clockCount} total)`;

  const text = `Someone just emailed ${params.recipientEmail} as part of your "${params.campaignName}" campaign.

That's ${params.clockCount} clock${params.clockCount !== 1 ? "s" : ""} total.

View the campaign: ${campaignUrl}

— clock.email`;

  const html = wrap(`
    <h1 style="font-family:monospace;font-size:22px;color:#282413;margin:0 0 16px;">
      New clock started.
    </h1>
    <p style="font-size:15px;color:#282413;line-height:1.5;margin:0 0 8px;">
      Someone just emailed <strong style="font-family:monospace;color:#224749;">${params.recipientEmail}</strong>
      as part of your <strong>${params.campaignName}</strong> campaign.
    </p>
    <p style="font-size:14px;color:#635E4B;margin:0 0 20px;">
      That's <strong>${params.clockCount}</strong> clock${params.clockCount !== 1 ? "s" : ""} total.
    </p>
    <div style="text-align:center;">
      ${button(campaignUrl, "View your campaign")}
    </div>
  `);

  return { to: params.creatorEmail, subject, text, html };
}
