import { CampaignForm } from "@/components/campaign-form";

export const metadata = {
  title: "Start a Campaign — clock.email",
};

export default function NewCampaignPage() {
  return (
    <main className="max-w-2xl mx-auto px-6 py-10">
      <h1 className="text-3xl font-bold text-ink">Start a campaign</h1>
      <p className="text-sand-600 mt-2">
        Create a public accountability campaign. Define who you&apos;re targeting,
        and we&apos;ll generate a CC address that starts a public timer every time
        someone emails them.
      </p>

      <CampaignForm />
    </main>
  );
}
