interface TransactionRowProps {
  type: "incoming" | "outgoing";
  amount: string;
  currency: string;
  from: string;
  to: string;
  timestamp: string;
  txHash?: string;
}

export default function TransactionRow({ type, amount, currency, from, to, timestamp, txHash }: TransactionRowProps) {
  return (
    <div className="flex items-center gap-4 px-5 py-4 rounded-xl bg-chassis transition-all duration-300 hover:-translate-y-0.5 mb-3" style={{ boxShadow: "var(--shadow-card)" }}>
      {/* Direction icon */}
      <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
        type === "incoming" ? "text-accent" : "text-text-muted"
      }`} style={{ boxShadow: "var(--shadow-floating)" }}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          {type === "incoming" ? (
            <><polyline points="7 17 17 7" /><polyline points="7 7 17 7 17 17" /></>
          ) : (
            <><polyline points="17 7 7 17" /><polyline points="17 17 7 17 7 7" /></>
          )}
        </svg>
      </div>

      {/* Details */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-text-primary">
          {type === "incoming" ? "Received from" : "Sent to"}{" "}
          <span className="text-text-muted font-normal truncate">{type === "incoming" ? from : to}</span>
        </p>
        <span className="font-mono text-xs text-text-muted/50">{timestamp}</span>
      </div>

      {/* Amount */}
      <div className="text-right flex-shrink-0">
        <span className={`text-base font-mono font-bold ${type === "incoming" ? "text-accent" : "text-text-primary"}`}>
          {type === "incoming" ? "+" : "-"}${amount}
        </span>
        <span className="block font-mono text-xs text-text-muted">{currency}</span>
        {txHash && (
          <a href={`https://testnet.xrpl.org/transactions/${txHash}`} target="_blank" rel="noopener noreferrer"
            className="block font-mono text-xs text-accent hover:underline mt-0.5">
            {txHash.slice(0, 8)}...
          </a>
        )}
      </div>
    </div>
  );
}
