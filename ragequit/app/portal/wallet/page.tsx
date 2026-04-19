"use client";

import { useState, useEffect } from "react";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import TransactionRow from "../../components/TransactionRow";

export default function WalletPage() {
  const [hid, setHid] = useState("");
  const [wallet, setWallet] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  
  const [sendTo, setSendTo] = useState("");
  const [sendAmount, setSendAmount] = useState("");
  const [sending, setSending] = useState(false);
  const [sendSuccess, setSendSuccess] = useState(false);
  const [tab, setTab] = useState<"overview" | "send">("overview");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedHid = localStorage.getItem("nexus_hid");
      if (savedHid) {
        setHid(savedHid);
        fetchWalletData(savedHid);
      }
    }
  }, []);

  const fetchWalletData = async (userHid: string) => {
    try {
      // Get all recipients to find our address
      const recRes = await fetch("http://localhost:3001/api/recipients");
      const recipients = await recRes.json();
      const me = recipients.find((r: any) => r.hid === userHid);
      
      if (!me) return;

      // Get balance
      const balRes = await fetch(`http://localhost:3001/api/recipients/${userHid}/balance`);
      const balData = await balRes.json();
      
      setWallet({
        hid: me.hid,
        name: me.name,
        address: me.address,
        balance: typeof balData.balance === "number" ? balData.balance.toFixed(2) : "0.00",
        currency: "RLUSD",
        localCurrency: "KES",
        localAmount: (Number(balData.balance) * 130).toFixed(0), // approx KES
      });

      // Get transactions
      const txRes = await fetch(`http://localhost:3001/api/transactions/${me.address}?limit=10`);
      const txData = await txRes.json();
      
      const formattedTxs = txData.map((tx: any) => {
        let amt = "0.00";
        if (typeof tx.amount === "object") {
          amt = Number(tx.amount.value).toFixed(2);
        } else if (typeof tx.amount === "string") {
          amt = (Number(tx.amount) / 1000000).toFixed(2); // XRP drops
        }
        
        return {
          type: tx.to === me.address ? "incoming" as const : "outgoing" as const,
          amount: amt,
          currency: tx.amount?.currency || "XRP",
          from: tx.from === me.address ? me.hid : tx.from,
          to: tx.to === me.address ? me.hid : tx.to,
          timestamp: tx.date ? new Date(tx.date).toLocaleString() : "Unknown",
          txHash: tx.hash
        };
      });
      
      setTransactions(formattedTxs);
      
    } catch (e) {
      console.error(e);
      // Fallback
      setWallet({
        hid: "HID-XXXX-XX", name: "Demo User", balance: "0.00", currency: "RLUSD",
        localCurrency: "KES", localAmount: "0"
      });
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    
    try {
      const res = await fetch("http://localhost:3001/api/recipient/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          senderHid: hid,
          targetHid: sendTo,
          amount: Number(sendAmount)
        })
      });
      
      if (res.ok) {
        setSendSuccess(true);
        setTimeout(() => { 
          setSendSuccess(false); 
          setSendTo(""); 
          setSendAmount(""); 
          setTab("overview");
          fetchWalletData(hid);
        }, 3000);
      } else {
        alert("Transfer failed");
      }
    } catch (e) {
      console.error(e);
    }
    
    setSending(false);
  };

  if (!wallet) return <div className="min-h-screen bg-black text-white flex justify-center items-center">Loading...</div>;

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
          <h1 className="text-xl font-bold text-text-primary text-embossed">{wallet.name}</h1>
          <p className="label-stamped mt-1">{wallet.hid}</p>
        </div>

        {/* Balance */}
        <div className="rounded-2xl p-8 text-center mb-8 bg-[#2d3436] relative animate-fade-in-up" style={{ boxShadow: "var(--shadow-card)", animationDelay: "0.1s" }}>
          <div className="absolute top-3 left-3 screw opacity-30" /><div className="absolute top-3 right-3 screw opacity-30" />
          <div className="absolute bottom-3 left-3 screw opacity-30" /><div className="absolute bottom-3 right-3 screw opacity-30" />
          <p className="label-stamped text-[#a8b2d1] mb-2">YOUR BALANCE</p>
          <p className="text-5xl font-extrabold font-mono text-white tracking-tight" style={{ filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.3))" }}>${wallet.balance}</p>
          <p className="text-lg font-mono text-accent mt-1">{wallet.currency}</p>
          <div className="mt-3 inline-flex items-center gap-2 px-4 py-1.5 rounded-md bg-[#3d4c51] text-[#a8b2d1]" style={{ boxShadow: "inset 2px 2px 4px rgba(0,0,0,0.3), inset -2px -2px 4px rgba(255,255,255,0.05)" }}>
            <span className="font-mono text-sm">approx. {wallet.localCurrency} {wallet.localAmount}</span>
          </div>
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
            {transactions.length === 0 ? (
               <p className="text-center text-text-muted py-8">No transactions found.</p>
            ) : (
               transactions.map((tx, i) => <TransactionRow key={i} {...tx} />)
            )}
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
                  <p className="font-mono text-xs text-text-muted mt-2">Available: ${wallet.balance} RLUSD</p>
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
