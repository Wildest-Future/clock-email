"use client";

interface MailtoButtonProps {
  targetEmail: string;
  ccAddress: string;
  subject?: string;
}

export function MailtoButton({ targetEmail, ccAddress, subject }: MailtoButtonProps) {
  const params = new URLSearchParams();
  params.set("cc", ccAddress);
  if (subject) params.set("subject", subject);

  const mailto = `mailto:${targetEmail}?${params.toString()}`;

  return (
    <a
      href={mailto}
      className="flex items-center justify-between bg-velvet-500 text-white rounded-lg px-4 py-3 hover:bg-velvet-600 transition-colors"
    >
      <span className="font-mono text-sm break-all">{targetEmail}</span>
      <span className="text-sm font-medium ml-4 shrink-0">Send email &rarr;</span>
    </a>
  );
}
