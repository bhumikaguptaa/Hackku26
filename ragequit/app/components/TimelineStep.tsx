interface TimelineStepProps {
  step: number;
  title: string;
  subtitle: string;
  timestamp?: string;
  txHash?: string;
  status: "complete" | "active" | "pending";
  isLast?: boolean;
}

export default function TimelineStep({ step, title, subtitle, timestamp, txHash, status, isLast = false }: TimelineStepProps) {
  return (
    <div className="flex gap-5">
      {/* Connector + node */}
      <div className="flex flex-col items-center">
        <div
          className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 z-10 font-mono font-bold text-sm transition-all ${
            status === "complete"
              ? "bg-accent text-white"
              : status === "active"
              ? "bg-chassis text-accent"
              : "bg-chassis text-text-muted/30"
          }`}
          style={{
            boxShadow: status === "complete"
              ? `var(--shadow-glow-green), 4px 4px 8px rgba(0,0,0,0.1)`
              : status === "active"
              ? "var(--shadow-floating)"
              : "var(--shadow-recessed)",
          }}
        >
          {status === "complete" ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
          ) : (
            <span>{String(step).padStart(2, "0")}</span>
          )}
        </div>
        {!isLast && (
          <div className={`w-0.5 flex-1 min-h-[40px] mt-2 rounded-full ${
            status === "complete" ? "bg-accent" : "bg-recessed"
          }`} />
        )}
      </div>

      {/* Content */}
      <div className={`pb-8 ${isLast ? "pb-0" : ""}`}>
        <h3 className={`text-base font-bold mb-1 ${status === "pending" ? "text-text-muted/30" : "text-text-primary text-embossed"}`}>
          {title}
        </h3>
        <p className="text-sm text-text-muted leading-relaxed mb-3">{subtitle}</p>
        <div className="flex items-center gap-3 flex-wrap">
          {timestamp && <span className="font-mono text-xs text-text-muted/50">{timestamp}</span>}
          {txHash && (
            <a href={`https://testnet.xrpl.org/transactions/${txHash}`} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-mono font-bold text-accent bg-chassis transition-all duration-150 hover:-translate-y-0.5"
              style={{ boxShadow: "var(--shadow-card)" }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /><polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" /></svg>
              {txHash.slice(0, 8)}...{txHash.slice(-6)}
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
