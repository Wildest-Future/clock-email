const dotColors: Record<string, string> = {
  active: "#8B504C",
  response_received: "#B57A2A",
  disputed: "#8D3E3A",
  resolved: "#2F7D57",
  inactive: "#C3BEA9",
};

interface StatusDotsProps {
  clocks: { status: string }[];
}

export function StatusDots({ clocks }: StatusDotsProps) {
  if (clocks.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-1 mt-2">
      {clocks.map((clock, i) => (
        <span
          key={i}
          className="w-2 h-2 rounded-full inline-block"
          style={{ backgroundColor: dotColors[clock.status] ?? "#C3BEA9" }}
        />
      ))}
    </div>
  );
}
