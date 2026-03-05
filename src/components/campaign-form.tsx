"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function CampaignForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [createdByEmail, setCreatedByEmail] = useState("");
  const [recipientInputs, setRecipientInputs] = useState([""]);
  const [suggestedSubject, setSuggestedSubject] = useState("");
  const [emailTemplate, setEmailTemplate] = useState("");
  const [showTemplate, setShowTemplate] = useState(false);
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  function addRecipient() {
    setRecipientInputs([...recipientInputs, ""]);
  }

  function updateRecipient(index: number, value: string) {
    const updated = [...recipientInputs];
    updated[index] = value;
    setRecipientInputs(updated);
  }

  function removeRecipient(index: number) {
    if (recipientInputs.length === 1) return;
    setRecipientInputs(recipientInputs.filter((_, i) => i !== index));
  }

  function hideTemplate() {
    setShowTemplate(false);
    setSuggestedSubject("");
    setEmailTemplate("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitted(true);
    setError("");

    const targetEmails = recipientInputs
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    if (!name.trim() || !createdByEmail.trim() || targetEmails.length === 0) {
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch("/api/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim(),
          createdByEmail: createdByEmail.trim(),
          targetEmails,
          suggestedSubject: suggestedSubject.trim() || null,
          emailTemplate: emailTemplate.trim() || null,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "Something went wrong.");
        setSubmitting(false);
        return;
      }

      const data = await res.json();
      router.push(`/campaign/${data.identifier}`);
    } catch {
      setError("Failed to create campaign. Please try again.");
      setSubmitting(false);
    }
  }

  const inputClass =
    "w-full bg-paper border border-sand-300 rounded-lg px-4 py-2.5 text-ink placeholder:text-warmgray focus:outline-none focus:border-velvet-300 focus:ring-1 focus:ring-velvet-300 transition-colors";

  const errorInputClass =
    "w-full bg-paper border border-oxide rounded-lg px-4 py-2.5 text-ink placeholder:text-warmgray focus:outline-none focus:border-oxide focus:ring-1 focus:ring-oxide transition-colors";

  const labelClass = "block text-sm font-medium text-sand-700 mb-1.5";

  const nameEmpty = submitted && !name.trim();
  const emailEmpty = submitted && !createdByEmail.trim();
  const recipientsEmpty =
    submitted && recipientInputs.every((r) => !r.trim());

  return (
    <form onSubmit={handleSubmit} className="mt-8 space-y-8">
      {/* Basics */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-ink">Campaign details</h2>

        <div>
          <label htmlFor="name" className={labelClass}>
            Campaign name
          </label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Mattapan Bus Route Restoration"
            className={nameEmpty ? errorInputClass : inputClass}
            autoComplete="off"
          />
          {nameEmpty && (
            <p className="text-xs mt-1" style={{ color: "#8D3E3A" }}>
              Campaign name is required.
            </p>
          )}
        </div>

        <div>
          <label htmlFor="description" className={labelClass}>
            Description
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What is this campaign about? What are you asking for?"
            rows={3}
            className={inputClass}
            autoComplete="off"
          />
        </div>

        <div>
          <label htmlFor="organizer-email" className={labelClass}>
            Your email{" "}
            <span className="text-warmgray font-normal">
              (private, never displayed)
            </span>
          </label>
          <input
            id="organizer-email"
            type="email"
            value={createdByEmail}
            onChange={(e) => setCreatedByEmail(e.target.value)}
            placeholder="you@example.com"
            className={emailEmpty ? errorInputClass : inputClass}
            autoComplete="email"
          />
          {emailEmpty && (
            <p className="text-xs mt-1" style={{ color: "#8D3E3A" }}>
              Your email is required.
            </p>
          )}
        </div>
      </section>

      {/* Recipients */}
      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold text-ink">
            Who are you writing to?
          </h2>
          <p className="text-sm text-sand-600 mt-1">
            Add the email addresses of the government officials or offices this
            campaign is directed at.
          </p>
        </div>

        <div className="space-y-2">
          {recipientInputs.map((value, index) => (
            <div key={index} className="flex gap-2">
              <input
                type="email"
                value={value}
                onChange={(e) => updateRecipient(index, e.target.value)}
                placeholder="official@boston.gov"
                className={`${recipientsEmpty ? errorInputClass : inputClass} font-mono text-sm`}
                autoComplete="off"
                name={`recipient-${index}`}
              />
              {recipientInputs.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeRecipient(index)}
                  className="text-warmgray hover:text-oxide transition-colors px-2 text-lg"
                  aria-label="Remove"
                >
                  &times;
                </button>
              )}
            </div>
          ))}
        </div>

        {recipientsEmpty && (
          <p className="text-xs" style={{ color: "#8D3E3A" }}>
            Add at least one recipient email address.
          </p>
        )}

        <button
          type="button"
          onClick={addRecipient}
          className="text-sm text-velvet-500 hover:text-velvet-400 transition-colors font-medium"
        >
          + Add another recipient
        </button>
      </section>

      {/* Optional email template */}
      <section className="space-y-4">
        {!showTemplate ? (
          <button
            type="button"
            onClick={() => setShowTemplate(true)}
            className="text-sm text-bronze hover:text-oxide transition-colors font-medium"
          >
            + Add a suggested email template (optional)
          </button>
        ) : (
          <>
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-lg font-semibold text-ink">
                  Email template
                  <span className="text-warmgray font-normal text-sm ml-2">
                    optional
                  </span>
                </h2>
                <p className="text-sm text-sand-600 mt-1">
                  Help participants know what to write. This will be shown on the
                  campaign page.
                </p>
              </div>
              <button
                type="button"
                onClick={hideTemplate}
                className="text-sm text-warmgray hover:text-oxide transition-colors ml-4 whitespace-nowrap"
              >
                Remove
              </button>
            </div>

            <div>
              <label htmlFor="subject" className={labelClass}>
                Suggested subject line
              </label>
              <input
                id="subject"
                type="text"
                value={suggestedSubject}
                onChange={(e) => setSuggestedSubject(e.target.value)}
                placeholder="e.g., Restore the 31 bus route for Mattapan residents"
                className={inputClass}
                autoComplete="off"
              />
            </div>

            <div>
              <label htmlFor="template" className={labelClass}>
                Suggested email body
              </label>
              <textarea
                id="template"
                value={emailTemplate}
                onChange={(e) => setEmailTemplate(e.target.value)}
                placeholder={
                  "Dear [Official],\n\nI am writing to...\n\nThank you,\n[Your name]"
                }
                rows={8}
                className={inputClass}
                autoComplete="off"
              />
            </div>
          </>
        )}
      </section>

      {/* Submit */}
      {error && (
        <p className="text-sm font-medium" style={{ color: "#8D3E3A" }}>
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="w-full bg-velvet-500 text-white font-semibold py-3 rounded-lg hover:bg-velvet-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {submitting ? "Creating campaign..." : "Create campaign"}
      </button>
    </form>
  );
}
