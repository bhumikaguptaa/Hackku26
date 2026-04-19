"use client";

interface DonationCardProps {
  title: string;
  region: string;
  description: string;
  raised: number;
  goal: number;
  color: string;
  icon: React.ReactNode;
  selected: boolean;
  onSelect: () => void;
}

export default function DonationCard({ title, region, description, raised, goal, icon, selected, onSelect }: DonationCardProps) {
  const progress = Math.min((raised / goal) * 100, 100);

  return (
    <button
      onClick={onSelect}
      className={`w-full text-left rounded-2xl p-6 transition-all duration-300 group relative ${
        selected
          ? "bg-chassis -translate-y-1"
          : "bg-chassis hover:-translate-y-1"
      }`}
      style={{
        boxShadow: selected ? "var(--shadow-floating), inset 0 0 0 2px var(--accent)" : "var(--shadow-card)",
      }}
    >
      {/* Corner screws */}
      <div className="absolute top-3 left-3 screw" />
      <div className="absolute top-3 right-3 screw" />
      <div className="absolute bottom-3 left-3 screw" />
      <div className="absolute bottom-3 right-3 screw" />

      {/* Vents */}
      <div className="absolute top-4 right-10 flex gap-1">
        <div className="vent" /><div className="vent" /><div className="vent" />
      </div>

      {/* Icon housing */}
      <div className="flex items-start justify-between mb-4">
        <div className="w-14 h-14 rounded-2xl bg-chassis flex items-center justify-center" style={{ boxShadow: "var(--shadow-floating)" }}>
          <div className={`text-accent group-hover:scale-110 group-hover:rotate-12 transition-all duration-200 ${selected ? "scale-110" : ""}`}>
            {icon}
          </div>
        </div>
        {selected && (
          <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center animate-fade-in" style={{ boxShadow: "var(--shadow-glow-accent)" }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
          </div>
        )}
      </div>

      {/* Content */}
      <h3 className="text-lg font-bold text-text-primary mb-1 text-embossed">{title}</h3>
      <span className="inline-block label-stamped text-accent mb-3">{region}</span>
      <p className="text-sm text-text-muted leading-relaxed mb-5">{description}</p>

      {/* Progress */}
      <div className="space-y-2">
        <div className="h-3 rounded-full bg-chassis neu-recessed overflow-hidden">
          <div className="h-full rounded-full bg-accent transition-all duration-700" style={{ width: `${progress}%`, boxShadow: progress > 5 ? "var(--shadow-glow-green)" : "none" }} />
        </div>
        <div className="flex justify-between">
          <span className="font-mono text-xs font-bold text-text-primary">${raised.toLocaleString()}</span>
          <span className="font-mono text-xs text-text-muted">${goal.toLocaleString()} goal</span>
        </div>
      </div>
    </button>
  );
}
