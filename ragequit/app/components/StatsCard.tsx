interface StatsCardProps {
  label: string;
  value: string;
  change?: string;
  trend?: "up" | "down" | "neutral";
  icon: React.ReactNode;
}

export default function StatsCard({ label, value, change, trend = "neutral", icon }: StatsCardProps) {
  return (
    <div className="relative rounded-2xl p-6 bg-chassis transition-all duration-300 hover:-translate-y-1 group" style={{ boxShadow: "var(--shadow-card)" }}>
      {/* Screws */}
      <div className="absolute top-3 left-3 screw" />
      <div className="absolute top-3 right-3 screw" />

      <div className="flex items-start justify-between mb-4">
        <div className="w-12 h-12 rounded-xl bg-chassis flex items-center justify-center group-hover:scale-110 group-hover:rotate-12 transition-all duration-200"
          style={{ boxShadow: "var(--shadow-floating)" }}>
          <div className="text-accent">{icon}</div>
        </div>
        {change && (
          <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-mono font-bold ${
            trend === "up" ? "text-accent" : trend === "down" ? "text-red-500" : "text-text-muted"
          }`} style={{ boxShadow: "var(--shadow-recessed)" }}>
            {trend === "up" && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" /></svg>}
            {change}
          </div>
        )}
      </div>
      <p className="text-3xl font-extrabold tracking-tight text-text-primary text-embossed font-mono">{value}</p>
      <p className="label-stamped mt-1">{label}</p>
    </div>
  );
}
