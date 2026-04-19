"use client";

import { useState } from "react";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import TransactionRow from "../../components/TransactionRow";

const mockWallet = {
  hid: "HID-2847-KE", name: "Amara Njeri", balance: "47.20", currency: "RLUSD",
  localCurrency: "KES", localAmount: "6,136",
  lastReceived: { amount: "12.50", from: "Kenya Relief Fund", time: "2 minutes ago" },
};

const mockTransactions = [
  { type: "incoming" as const, amount: "12.50", currency: "RLUSD", from: "Kenya Relief Fund", to: "HID-2847-KE", timestamp: "Apr 18, 2026 — 2:15 PM", txHash: "C3D4E5F6A7B8C9D0E1F2A3B4C5D6E7F8A9B0C1D2E3F4A5B6C7D8E9F0A1B2C3D4" },
  { type: "outgoing" as const, amount: "5.00", currency: "RLUSD", from: "HID-2847-KE", to: "HID-3192-KE", timestamp: "Apr 17, 2026 — 10:30 AM", txHash: "D4E5F6A7B8C9D0E1F2A3B4C5D6E7F8A9B0C1D2E3F4A5B6C7D8E9F0A1B2C3D4E5" },
  { type: "incoming" as const, amount: "25.00", currency: "RLUSD", from: "Kenya Relief Fund", to: "HID-2847-KE", timestamp: "Apr 15, 2026 — 3:45 PM", txHash: "E5F6A7B8C9D0E1F2A3B4C5D6E7F8A9B0C1D2E3F4A5B6C7D8E9F0A1B2C3D4E5F6" },
  { type: "incoming" as const, amount: "14.70", currency: "RLUSD", from: "Emergency Food Aid", to: "HID-2847-KE", timestamp: "Apr 12, 2026 — 9:15 AM", txHash: "F6A7B8C9D0E1F2A3B4C5D6E7F8A9B0C1D2E3F4A5B6C7D8E9F0A1B2C3D4E5F6A7" },
];

export default function WalletPage() {
  const [sendTo, setSendTo] = useState("");
  const [sendAmount, setSendAmount] = useState("");
  const [sending, setSending] = useState(false);
  const [sendSuccess, setSendSuccess] = useState(false);
  const [tab, setTab] = useState<"overview" | "send">("overview");

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    // TODO: API CALL — POST /api/recipient/send
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setSending(false);
    setSendSuccess(true);
    setTimeout(() => { setSendSuccess(false); setSendTo(""); setSendAmount(""); setTab("overview"); }, 3000);
  };

  return (
    <>
      <Navbar />
      <main className="max-w-2xl mx-auto px-6 py-12">
        {/* Profile */}
        <div className="text-center mb-8 animate-fade-in-up">
          <div className="w-16 h-16 rounded-2xl bg-chassis flex items-center justify-center mx-auto mb-4" style={{ boxShadow: "var(--shadow-floating)" }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-text-primary text-embossed">{mockWallet.name}</h1>
          <p className="label-stamped mt-1">{mockWallet.hid}</p>
        </div>

        {/* Balance */}
        <div className="rounded-2xl p-8 text-center mb-8 bg-[#2d3436] relative animate-fade-in-up" style={{ boxShadow: "var(--shadow-card)", animationDelay: "0.1s" }}>
          <div className="absolute top-3 left-3 screw opacity-30" /><div className="absolute top-3 right-3 screw opacity-30" />
          <div className="absolute bottom-3 left-3 screw opacity-30" /><div className="absolute bottom-3 right-3 screw opacity-30" />
          <p className="label-stamped text-[#a8b2d1] mb-2">YOUR BALANCE</p>
          <p className="text-5xl font-extrabold font-mono text-white tracking-tight" style={{ filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.3))" }}>${mockWallet.balance}</p>
          <p className="text-lg font-mono text-accent mt-1">{mockWallet.currency}</p>
          <div className="mt-3 inline-flex items-center gap-2 px-4 py-1.5 rounded-md bg-[#3d4c51] text-[#a8b2d1]" style={{ boxShadow: "inset 2px 2px 4px rgba(0,0,0,0.3), inset -2px -2px 4px rgba(255,255,255,0.05)" }}>
            <span className="font-mono text-sm">approx. {mockWallet.localCurrency} {mockWallet.localAmount}</span>
          </div>
          <p className="font-mono text-xs text-[#636e72] mt-4">
            Last received: ${mockWallet.lastReceived.amount} from {mockWallet.lastReceived.from} — {mockWallet.lastReceived.time}
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex rounded-xl overflow-hidden mb-8" style={{ boxShadow: "var(--shadow-card)" }}>
          <button onClick={() => setTab("overview")}
            className={`flex-1 px-4 py-3 text-sm font-semibold uppercase tracking-wider transition-all duration-150 ${tab === "overview" ? "bg-accent text-white" : "bg-chassis text-text-muted hover:text-accent"}`}>
            History
          </button>
          <button onClick={() => setTab("send")}
            className={`flex-1 px-4 py-3 text-sm font-semibold uppercase tracking-wider transition-all duration-150 ${tab === "send" ? "bg-accent text-white" : "bg-chassis text-text-muted hover:text-accent"}`}>
            Send
          </button>
        </div>

        {tab === "overview" ? (
          <div className="space-y-0 animate-fade-in">
            {mockTransactions.map((tx, i) => <TransactionRow key={i} {...tx} />)}
          </div>
        ) : (
          <div className="rounded-2xl p-8 bg-chassis animate-fade-in relative" style={{ boxShadow: "var(--shadow-card)" }}>
            <div className="absolute top-3 left-3 screw" /><div className="absolute top-3 right-3 screw" />
            {sendSuccess ? (
              <div className="text-center py-8 animate-fade-in-up">
                <div className="w-16 h-16 rounded-full bg-accent flex items-center justify-center mx-auto mb-4" style={{ boxShadow: "var(--shadow-glow-green)" }}>
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg>
                </div>
                <h3 className="text-xl font-bold text-text-primary text-embossed mb-2">Transfer Sent</h3>
                <p className="text-sm text-text-muted">${sendAmount} RLUSD has been sent to {sendTo}</p>
              </div>
            ) : (
              <form onSubmit={handleSend} className="space-y-6">
                <div>
                  <label className="label-stamped block mb-2">RECIPIENT HID OR PHONE</label>
                  <input type="text" value={sendTo} onChange={(e) => setSendTo(e.target.value)} placeholder="e.g. HID-3192-KE or +254..." required
                    className="w-full px-5 py-4 rounded-xl bg-chassis font-mono text-sm text-text-primary placeholder:text-text-muted/30 border-none outline-none"
                    style={{ boxShadow: "var(--shadow-recessed)" }} />
                </div>
                <div>
                  <label className="label-stamped block mb-2">AMOUNT (RLUSD)</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted font-mono font-bold text-xl">$</span>
                    <input type="number" value={sendAmount} onChange={(e) => setSendAmount(e.target.value)} placeholder="0.00" min="0.01" step="0.01" required
                      className="w-full pl-10 pr-4 py-4 rounded-xl bg-chassis font-mono text-2xl font-bold text-text-primary placeholder:text-text-muted/30 border-none outline-none"
                      style={{ boxShadow: "var(--shadow-recessed)" }} />
                  </div>
                  <p className="font-mono text-xs text-text-muted mt-2">Available: ${mockWallet.balance} RLUSD</p>
                </div>
                <button type="submit" disabled={sending}
                  className="btn-industrial btn-primary w-full py-4 text-sm rounded-xl disabled:opacity-50">
                  {sending ? "Sending on XRPL..." : "Send Funds"}
                </button>
              </form>
            )}
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
