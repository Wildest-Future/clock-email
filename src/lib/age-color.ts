// Age thresholds in days → color
// Fresh clocks are velvet teal, aging shifts toward warm/red tones
const AGE_COLORS = [
  { days: 0, color: "#224749" },   // velvet-500 (fresh)
  { days: 3, color: "#356769" },   // velvet-300
  { days: 7, color: "#A67C52" },   // bronze
  { days: 14, color: "#B57A2A" },  // warn
  { days: 30, color: "#8B504C" },  // oxide
  { days: 60, color: "#8D3E3A" },  // crit
];

export function getAgeColor(days: number): string {
  for (let i = AGE_COLORS.length - 1; i >= 0; i--) {
    if (days >= AGE_COLORS[i].days) return AGE_COLORS[i].color;
  }
  return AGE_COLORS[0].color;
}
