"use client";

import { useState } from "react";

const mockRecipients = [
  { hid: "HID-2847-KE", name: "Amara Njeri", balance: "$47.20", region: "Nairobi" },
  { hid: "HID-3192-KE", name: "John Ochieng", balance: "$32.50", region: "Mombasa" },
  { hid: "HID-4501-KE", name: "Fatima Hassan", balance: "$18.00", region: "Kisumu" },
  { hid: "HID-5678-KE", name: "Amina Osei", balance: "$12.50", region: "Nairobi" },
  { hid: "HID-6789-SY", name: "Omar Al-Rashid", balance: "$65.00", region: "Aleppo" },
  { hid: "HID-7890-SY", name: "Layla Khoury", balance: "$0.00", region: "Damascus" },
  { hid: "HID-8901-BD", name: "Rahim Ahmed", balance: "$22.80", region: "Dhaka" },
];

export default function DisbursePage() {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [mode, setMode] = useState<"equal" | "custom">("equal");
  const [totalAmount, setTotalAmount] = useState("50");
  const [customAmounts, setCustomAmounts] = useState<Record<string, string>>({});
  const [showConfirm, setShowConfirm] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);

  const toggleRecipient = (hid: string) => { setSelected((p) => { const n = new Set(p); if (n.has(hid)) n.delete(hid); else n.add(hid); return n; }); };
  const selectAll = () => { if (selected.size === mockRecipients.length) setSelected(new Set()); else setSelected(new Set(mockRecipients.map((r) => r.hid))); };
  const perRecipient = mode === "equal" && selected.size > 0 ? (Number(totalAmount) / selected.size).toFixed(2) : "0.00";

  const handleDisburse = async () => { setProcessing(true); await new Promise((r) => setTimeout(r, 2500)); setProcessing(false); setSuccess(true); };

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center py-16 animate-fade-in-up">
        <div className="w-20 h-20 rounded-full bg-accent flex items-center justify-center mb-6" style={{ boxShadow: "var(--shadow-glow-green), var(--shadow-floating)" }}>
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
        </div>
        <h2 className="text-2xl font-extrabold text-text-primary text-embossed mb-3">Disbursement Complete</h2>
        <p className="text-text-muted text-center max-w-md mb-6">
          ${mode === "equal" ? totalAmount : Object.values(customAmounts).reduce((a, b) => a + Number(b), 0).toFixed(2)} RLUSD sent to {selected.size} recipient{selected.size > 1 ? "s" : ""}.
        </p>
        <div className="rounded-2xl p-6 w-full max-w-md bg-chassis relative space-y-3" style={{ boxShadow: "var(--shadow-card)" }}>
          <div className="absolute top-3 left-3 screw" /><div className="absolute top-3 right-3 screw" />
          {Array.from(selected).map((hid, i) => (
            <div key={hid} className="flex items-center justify-between border-b border-recessed/30 last:border-b-0 pb-2 last:pb-0">
              <span className="font-mono text-sm font-bold text-accent">{hid}</span>
              <a href={`https://testnet.xrpl.org/transactions/MOCK${i}HASH${hid.replace(/-/g, "")}`} target="_blank" rel="noopener noreferrer"
                className="font-mono text-xs text-text-muted hover:text-accent transition-colors">View tx</a>
            </div>
          ))}
        </div>
        <button onClick={() => { setSuccess(false); setSelected(new Set()); setShowConfirm(false); }}
          className="btn-industrial btn-secondary px-8 py-3 text-sm rounded-xl mt-8">New Disbursement</button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Mode toggle + total */}
      <div className="flex items-center gap-4 flex-wrap">
        <div className="flex rounded-xl overflow-hidden" style={{ boxShadow: "var(--shadow-card)" }}>
          <button onClick={() => setMode("equal")}
            className={`px-5 py-2.5 text-sm font-semibold uppercase tracking-wider transition-all duration-150 ${mode === "equal" ? "bg-accent text-white" : "bg-chassis text-text-muted hover:text-accent"}`}>Equal</button>
          <button onClick={() => setMode("custom")}
            className={`px-5 py-2.5 text-sm font-semibold uppercase tracking-wider transition-all duration-150 ${mode === "custom" ? "bg-accent text-white" : "bg-chassis text-text-muted hover:text-accent"}`}>Custom</button>
        </div>
        {mode === "equal" && (
          <div className="flex items-center gap-2 animate-fade-in">
            <span className="label-stamped">TOTAL:</span>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted font-mono text-sm">$</span>
              <input type="number" value={totalAmount} onChange={(e) => setTotalAmount(e.target.value)}
                className="w-28 pl-7 pr-3 py-2 rounded-lg bg-chassis font-mono text-sm font-bold text-text-primary border-none outline-none"
                style={{ boxShadow: "var(--shadow-recessed)" }} />
            </div>
            {selected.size > 0 && <span className="font-mono text-xs text-text-muted animate-fade-in">= ${perRecipient} each x {selected.size}</span>}
          </div>
        )}
      </div>

      <div className="flex items-center justify-between">
        <button onClick={selectAll} className="text-sm font-semibold text-accent hover:underline transition-colors">
          {selected.size === mockRecipients.length ? "Deselect All" : "Select All"}
        </button>
        <span className="label-stamped">{selected.size} SELECTED</span>
      </div>

      {/* Table */}
      <div className="rounded-2xl bg-chassis overflow-hidden relative" style={{ boxShadow: "var(--shadow-card)" }}>
        <div className="absolute top-3 left-3 screw" /><div className="absolute top-3 right-3 screw" />
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-recessed/50">
                <th className="px-5 py-4 w-12" />
                <th className="px-5 py-4 label-stamped">HID</th>
                <th className="px-5 py-4 label-stamped">NAME</th>
                <th className="px-5 py-4 label-stamped">BALANCE</th>
                {mode === "custom" && <th className="px-5 py-4 label-stamped">AMOUNT</th>}
                {mode === "equal" && selected.size > 0 && <th className="px-5 py-4 label-stamped">WILL GET</th>}
              </tr>
            </thead>
            <tbody>
              {mockRecipients.map((r) => (
                <tr key={r.hid} onClick={() => toggleRecipient(r.hid)}
                  className={`cursor-pointer border-t border-recessed/30 transition-colors ${selected.has(r.hid) ? "bg-accent/5" : "hover:bg-recessed/20"}`}>
                  <td className="px-5 py-4">
                    <div className={`w-5 h-5 rounded-md flex items-center justify-center transition-all ${selected.has(r.hid) ? "bg-accent" : "bg-chassis"}`}
                      style={{ boxShadow: selected.has(r.hid) ? "var(--shadow-glow-green)" : "var(--shadow-recessed)" }}>
                      {selected.has(r.hid) && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><polyline points="20 6 9 17 4 12" /></svg>}
                    </div>
                  </td>
                  <td className="px-5 py-4 font-mono text-sm font-bold text-accent">{r.hid}</td>
                  <td className="px-5 py-4"><p className="text-sm font-semibold text-text-primary">{r.name}</p><p className="text-xs text-text-muted">{r.region}</p></td>
                  <td className="px-5 py-4 font-mono text-sm text-text-muted">{r.balance}</td>
                  {mode === "custom" && (
                    <td className="px-5 py-4" onClick={(e) => e.stopPropagation()}>
                      {selected.has(r.hid) && (
                        <input type="number" value={customAmounts[r.hid] || ""} onChange={(e) => setCustomAmounts((p) => ({ ...p, [r.hid]: e.target.value }))} placeholder="0.00"
                          className="w-24 px-3 py-1.5 rounded-md bg-chassis font-mono text-sm font-bold border-none outline-none animate-fade-in"
                          style={{ boxShadow: "var(--shadow-recessed)" }} />
                      )}
                    </td>
                  )}
                  {mode === "equal" && selected.size > 0 && (
                    <td className="px-5 py-4 font-mono text-sm font-bold text-accent">{selected.has(r.hid) ? `$${perRecipient}` : "—"}</td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Confirm */}
      {selected.size > 0 && !showConfirm && (
        <div className="flex justify-end animate-fade-in-up">
          <button onClick={() => setShowConfirm(true)} className="btn-industrial btn-primary px-8 py-4 text-sm rounded-xl">Review Disbursement</button>
        </div>
      )}

      {showConfirm && (
        <div className="rounded-2xl p-8 bg-chassis relative animate-fade-in-up" style={{ boxShadow: "var(--shadow-floating)" }}>
          <div className="absolute top-3 left-3 screw" /><div className="absolute top-3 right-3 screw" />
          <div className="absolute bottom-3 left-3 screw" /><div className="absolute bottom-3 right-3 screw" />
          <h3 className="text-xl font-bold text-text-primary text-embossed mb-4">Confirm Disbursement</h3>
          <div className="rounded-xl p-4 mb-6 space-y-2" style={{ boxShadow: "var(--shadow-recessed)" }}>
            <div className="flex justify-between text-sm"><span className="text-text-muted">Recipients</span><span className="font-mono font-bold">{selected.size}</span></div>
            <div className="flex justify-between text-sm border-t border-recessed/30 pt-2"><span className="text-text-muted">Total Amount</span>
              <span className="font-mono font-bold text-accent">${mode === "equal" ? totalAmount : Object.entries(customAmounts).filter(([hid]) => selected.has(hid)).reduce((a, [, b]) => a + Number(b), 0).toFixed(2)} RLUSD</span></div>
            <div className="flex justify-between text-sm border-t border-recessed/30 pt-2"><span className="text-text-muted">Network Fee</span><span className="font-mono text-text-muted">~${(selected.size * 0.0002).toFixed(4)}</span></div>
          </div>
          <div className="flex gap-3">
            <button onClick={() => setShowConfirm(false)} className="btn-industrial btn-secondary flex-1 py-3 text-sm rounded-xl">Cancel</button>
            <button onClick={handleDisburse} disabled={processing} className="btn-industrial btn-primary flex-1 py-3 text-sm rounded-xl disabled:opacity-50">
              {processing ? "Sending on XRPL..." : "Confirm & Send"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
