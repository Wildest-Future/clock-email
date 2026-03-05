"use client";

import { useEffect, useState, useRef } from "react";
import { getAgeColor } from "@/lib/age-color";

interface TickingClockProps {
  startedAt: string;
  resolvedAt?: string | null;
  resolutionBackdatedTo?: string | null;
  className?: string;
  ageColor?: boolean;
  verbose?: boolean;
}

interface ElapsedParts {
  days: number;
  hours: string;
  minutes: string;
  seconds: string;
}

export function TickingClock({
  startedAt,
  resolvedAt,
  resolutionBackdatedTo,
  className,
  ageColor: showAgeColor,
  verbose,
}: TickingClockProps) {
  const [parts, setParts] = useState<ElapsedParts | null>(null);
  const [tick, setTick] = useState(false);
  const secRef = useRef<HTMLSpanElement>(null);

  const isActive = !resolvedAt;

  useEffect(() => {
    const start = new Date(startedAt).getTime();
    const end = resolvedAt
      ? new Date(resolutionBackdatedTo ?? resolvedAt).getTime()
      : null;

    function update() {
      const now = end ?? Date.now();
      const ms = now - start;
      const seconds = Math.floor(ms / 1000);
      const minutes = Math.floor(seconds / 60);
      const hours = Math.floor(minutes / 60);
      const days = Math.floor(hours / 24);

      setParts({
        days,
        hours: (hours % 24).toString().padStart(2, "0"),
        minutes: (minutes % 60).toString().padStart(2, "0"),
        seconds: (seconds % 60).toString().padStart(2, "0"),
      });
      setTick((t) => !t);
    }

    update();
    if (!end) {
      const interval = setInterval(update, 1000);
      return () => clearInterval(interval);
    }
  }, [startedAt, resolvedAt, resolutionBackdatedTo]);

  // Trigger a brief flash on the seconds span each tick
  useEffect(() => {
    if (!isActive || !secRef.current) return;
    const el = secRef.current;
    el.style.opacity = "0.5";
    const timeout = setTimeout(() => {
      el.style.opacity = "1";
    }, 150);
    return () => clearTimeout(timeout);
  }, [tick, isActive]);

  if (!parts) return <span className={className} />;

  const ageColor = showAgeColor && isActive ? getAgeColor(parts.days) : undefined;

  const sep = (
    <span
      style={isActive ? {
        animation: "colon-blink 1s ease-in-out infinite",
        opacity: 0.6,
      } : { opacity: 0.4 }}
    >
      :
    </span>
  );

  if (verbose) {
    const labelClass = "text-[0.35em] uppercase tracking-wider opacity-70 ml-1";
    return (
      <span
        className={className}
        style={ageColor ? { color: ageColor } : undefined}
      >
        {parts.days > 0 && (
          <>
            {parts.days}<span className={labelClass}>{parts.days === 1 ? "day" : "days"}</span>
            {" "}{sep}{" "}
          </>
        )}
        {parts.hours}<span className={labelClass}>hours</span>
        {" "}{sep}{" "}
        {parts.minutes}<span className={labelClass}>min</span>
        {" "}{sep}{" "}
        <span
          ref={secRef}
          style={{ transition: "opacity 0.15s ease-out" }}
        >
          {parts.seconds}<span className={labelClass}>sec</span>
        </span>
      </span>
    );
  }

  return (
    <span
      className={className}
      style={ageColor ? { color: ageColor } : undefined}
    >
      {parts.days > 0 && <>{parts.days}d {sep} </>}
      {parts.hours}h {sep} {parts.minutes}m {sep}{" "}
      <span
        ref={secRef}
        style={{ transition: "opacity 0.15s ease-out" }}
      >
        {parts.seconds}s
      </span>
    </span>
  );
}
