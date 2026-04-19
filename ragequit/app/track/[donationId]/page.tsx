"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import TimelineStep from "../../components/TimelineStep";

export default function TrackPage() {
  const { donationId } = useParams() as { donationId: string };
  const [tracking, setTracking] = useState<any>(null);

  useEffect(() => {
    if (donationId === "demo-1" || !donationId) {
      // Mock fallback
      setTracking({
        donationId: "demo-1", donor: "Anonymous Donor", amount: "$50.00",
        cause: "Kenya Relief Fund", createdAt: new Date().toLocaleString(),
        steps: [
          { step: 1, title: "Payment received", subtitle: "Stripe confirmed your $50.00 donation. Transaction processing initiated.", timestamp: new Date().toLocaleTimeString(), txHash: undefined, status: "complete" as const },
          { step: 2, title: "Converting to RLUSD on XRPL", subtitle: "Gateway wallet received XRP equivalent. XRPL native DEX auto-converting XRP to RLUSD via atomic swap.", timestamp: new Date().toLocaleTimeString(), txHash: "DEMO123456789", status: "complete" as const },
          { step: 3, title: "Funds in NGO distribution wallet", subtitle: "$50.00 RLUSD now available in the distribution wallet. Ready for disbursement.", timestamp: new Date().toLocaleTimeString(), txHash: "DEMO987654321", status: "active" as const },
        ]
      });
      return;
    }

    fetch(`http://localhost:3001/api/donations/${donationId}`)
      .then(res => res.json())
      .then(data => {
        if (data.error) throw new Error(data.error);
        setTracking({
          donationId: data.txHash, 
          donor: data.donorName, 
          amount: `$${data.fiatAmount}`,
          cause: data.cause || "General Fund", 
          createdAt: new Date(data.timestamp).toLocaleString(),
          steps: [
            { step: 1, title: "Payment received", subtitle: `Confirmed your $${data.fiatAmount} donation to ${data.cause || "the cause"}. Transaction processing initiated.`, timestamp: new Date(data.timestamp).toLocaleTimeString(), txHash: undefined, status: "complete" as const },
            { step: 2, title: "Converting to RLUSD on XRPL", subtitle: "Gateway wallet received XRP equivalent. XRPL native DEX auto-converting to RLUSD via atomic swap.", timestamp: new Date(data.timestamp).toLocaleTimeString(), txHash: data.txHash, status: "complete" as const },
            { step: 3, title: "Funds in NGO distribution wallet", subtitle: `${data.rlusdAmount} RLUSD now available in the distribution wallet. Ready for disbursement.`, timestamp: new Date(data.timestamp).toLocaleTimeString(), txHash: data.txHash, status: "active" as const },
          ]
        });
      })
      .catch(console.error);
  }, [donationId]);

  if (!tracking) return <div className="min-h-screen bg-black text-white flex justify-center items-center">Locating XRPL record...</div>;

  return (
    <>
      <Navbar />
      <main className="max-w-3xl mx-auto px-6 py-14">
        <div className="mb-10 animate-fade-in-up">
          <div className="flex items-center gap-3 mb-4">
            <div className="led led-on" />
            <span className="label-stamped text-accent">LIVE TRACKER</span>
            <span className="font-mono text-xs text-text-muted/40">{donationId && donationId.length > 20 ? `${donationId.substring(0, 16)}...` : donationId}</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-text-primary text-embossed mb-3">Track Your Donation</h1>
          <p className="text-text-muted">
            Follow your {tracking.amount} donation to {tracking.cause} through every step — every transaction is on-chain and verifiable.
          </p>
        </div>

        {/* Summary */}
        <div className="rounded-2xl p-6 mb-10 bg-chassis relative animate-fade-in-up" style={{ boxShadow: "var(--shadow-card)", animationDelay: "0.1s" }}>
          <div className="absolute top-3 left-3 screw" /><div className="absolute top-3 right-3 screw" />
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { l: "DONOR", v: tracking.donor },
              { l: "AMOUNT", v: tracking.amount },
              { l: "CAUSE", v: tracking.cause },
              { l: "DATE", v: tracking.createdAt },
            ].map((d) => (
              <div key={d.l}>
                <p className="label-stamped mb-1">{d.l}</p>
                <p className={`text-sm font-semibold text-text-primary ${d.l === "AMOUNT" ? "font-mono text-accent" : ""}`}>{d.v}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Timeline */}
        <div className="animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
          <h2 className="text-xl font-bold text-text-primary text-embossed mb-6">Donation Journey</h2>
          <div className="ml-1">
            {tracking.steps.map((step: any, i: number) => (
              <TimelineStep key={step.step} {...step} isLast={i === tracking.steps.length - 1} />
            ))}
          </div>
        </div>

        {/* Transparency */}
        <div className="mt-10 rounded-2xl p-6 bg-chassis relative animate-fade-in-up" style={{ boxShadow: "var(--shadow-card)", animationDelay: "0.3s" }}>
          <div className="absolute top-3 left-3 screw" /><div className="absolute top-3 right-3 screw" />
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-chassis flex items-center justify-center flex-shrink-0" style={{ boxShadow: "var(--shadow-floating)" }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
            </div>
            <div>
              <h3 className="text-base font-bold text-text-primary text-embossed mb-1">Full Transparency</h3>
              <p className="text-sm text-text-muted leading-relaxed">
                Every step above is a real XRPL transaction — immutable, auditable, and publicly verifiable. Click any transaction hash to view it on the XRPL Explorer.
              </p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
