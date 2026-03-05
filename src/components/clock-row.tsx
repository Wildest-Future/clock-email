import Link from "next/link";
import { TickingClock } from "./ticking-clock";
import { getAgeColor } from "@/lib/age-color";

interface ClockRowProps {
  id: string;
  subjectLine: string;
  status: string;
  startedAt: string;
  resolvedAt?: string | null;
  resolutionBackdatedTo?: string | null;
  recipientEmail?: string;
  campaignName?: string | null;
  campaignIdentifier?: string | null;
}

const statusStyles: Record<string, { bg: string; text: string }> = {
  active: { bg: "rgba(139,80,76,0.15)", text: "#8B504C" },
  response_received: { bg: "rgba(181,122,42,0.15)", text: "#B57A2A" },
  disputed: { bg: "rgba(141,62,58,0.15)", text: "#8D3E3A" },
  resolved: { bg: "rgba(47,125,87,0.15)", text: "#2F7D57" },
  inactive: { bg: "rgba(195,190,169,0.3)", text: "#86806C" },
};

const statusLabels: Record<string, string> = {
  active: "Active",
  response_received: "Response Received",
  disputed: "Disputed",
  resolved: "Resolved",
  inactive: "Inactive",
};

export function ClockRow(props: ClockRowProps) {
  const style = statusStyles[props.status] ?? statusStyles.inactive;
  const isActive = props.status !== "resolved" && props.status !== "inactive";

  // Compute age for the left accent bar
  const startMs = new Date(props.startedAt).getTime();
  const endMs = props.resolvedAt
    ? new Date(props.resolutionBackdatedTo ?? props.resolvedAt).getTime()
    : Date.now();
  const ageDays = Math.floor((endMs - startMs) / (1000 * 60 * 60 * 24));
  const ageColor = isActive ? getAgeColor(ageDays) : "#C3BEA9";

  return (
    <div
      className="py-4 px-4 border-l-4"
      style={{ borderLeftColor: ageColor }}
    >
      <div className="flex items-center justify-between">
        <TickingClock
          startedAt={props.startedAt}
          resolvedAt={props.resolvedAt}
          resolutionBackdatedTo={props.resolutionBackdatedTo}
          className="font-mono text-lg sm:text-xl tabular-nums font-bold"
          ageColor
        />
        <span
          className="text-xs font-semibold px-2.5 py-1 rounded-full whitespace-nowrap ml-3 shrink-0"
          style={{ backgroundColor: style.bg, color: style.text }}
        >
          {statusLabels[props.status] ?? props.status}
        </span>
      </div>
      <div className="mt-1">
        <Link
          href={`/clock/${props.id}`}
          className="text-sm font-medium text-ink hover:text-velvet-500 transition-colors truncate block"
        >
          {props.subjectLine}
        </Link>
        <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-sand-600 mt-0.5">
          {props.recipientEmail && (
            <Link
              href={`/recipient/${encodeURIComponent(props.recipientEmail)}`}
              className="font-mono hover:text-velvet-500 transition-colors"
            >
              {props.recipientEmail}
            </Link>
          )}
          {props.campaignName && (
            <Link
              href={`/campaign/${props.campaignIdentifier}`}
              className="hover:text-bronze transition-colors"
            >
              {props.campaignName}
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
