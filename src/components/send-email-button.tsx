"use client";

import { useState } from "react";

interface SendEmailButtonProps {
  targetEmail: string;
  ccAddress: string;
  subject?: string;
}

function buildMailto(to: string, cc: string, subject?: string): string {
  const params = new URLSearchParams();
  params.set("cc", cc);
  if (subject) params.set("subject", subject);
  return `mailto:${to}?${params.toString()}`;
}

function buildGmail(to: string, cc: string, subject?: string): string {
  const params = new URLSearchParams();
  params.set("view", "cm");
  params.set("to", to);
  params.set("cc", cc);
  if (subject) params.set("su", subject);
  return `https://mail.google.com/mail/?${params.toString()}`;
}

function buildOutlook(to: string, cc: string, subject?: string): string {
  const params = new URLSearchParams();
  params.set("to", to);
  params.set("cc", cc);
  if (subject) params.set("subject", subject);
  return `https://outlook.live.com/mail/0/deeplink/compose?${params.toString()}`;
}

function buildYahoo(to: string, cc: string, subject?: string): string {
  const params = new URLSearchParams();
  params.set("to", to);
  params.set("cc", cc);
  if (subject) params.set("subject", subject);
  return `https://compose.mail.yahoo.com/?${params.toString()}`;
}

const providers = [
  { id: "default", label: "Email app", build: buildMailto },
  { id: "gmail", label: "Gmail", build: buildGmail },
  { id: "outlook", label: "Outlook", build: buildOutlook },
  { id: "yahoo", label: "Yahoo Mail", build: buildYahoo },
] as const;

export function SendEmailButton({ targetEmail, ccAddress, subject }: SendEmailButtonProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <div className="flex rounded-lg overflow-hidden border border-velvet-600">
        <a
          href={buildMailto(targetEmail, ccAddress, subject)}
          className="flex-1 flex items-center justify-between bg-velvet-500 text-white px-4 py-3 hover:bg-velvet-600 transition-colors"
        >
          <span className="font-mono text-sm break-all">{targetEmail}</span>
          <span className="text-sm font-medium ml-4 shrink-0">Send email &rarr;</span>
        </a>
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="bg-velvet-600 text-white px-3 hover:bg-velvet-700 transition-colors border-l border-velvet-700 flex items-center"
          aria-label="Choose email provider"
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className={`transition-transform ${open ? "rotate-180" : ""}`}>
            <path d="M3 5L6 8L9 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>

      {open && (
        <div className="absolute right-0 mt-1 bg-paper rounded-lg border border-sand-300 shadow-lg overflow-hidden z-10 w-48">
          {providers.map((provider) => (
            <a
              key={provider.id}
              href={provider.build(targetEmail, ccAddress, subject)}
              target={provider.id === "default" ? undefined : "_blank"}
              rel={provider.id === "default" ? undefined : "noopener noreferrer"}
              onClick={() => setOpen(false)}
              className="block px-4 py-2.5 text-sm text-ink hover:bg-stone transition-colors"
            >
              {provider.label}
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
