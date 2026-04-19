"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import DonationCard from "../components/DonationCard";

const causes = [
  {
    id: "kenya-relief", title: "Kenya Relief Fund", region: "EAST AFRICA",
    description: "Providing food, shelter, and medical supplies to families displaced by drought in northern Kenya.",
    raised: 34200, goal: 50000, color: "#10b981",
    icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" /><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" /></svg>,
  },
  {
    id: "syria-medical", title: "Syria Medical Aid", region: "MIDDLE EAST",
    description: "Funding emergency medical care and supplies for hospitals in conflict-affected regions of Syria.",
    raised: 78500, goal: 100000, color: "#3b82f6",
    icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2" /></svg>,
  },
  {
    id: "bangladesh-flood", title: "Bangladesh Flood Relief", region: "SOUTH ASIA",
    description: "Supporting families impacted by severe flooding with clean water, food packages, and temporary housing.",
    raised: 12800, goal: 75000, color: "#8b5cf6",
    icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>,
  },
];

const presetAmounts = [10, 25, 50, 100];

export default function DonatePage() {
  const router = useRouter();
  const [selectedCause, setSelectedCause] = useState<string | null>(null);
  const [amount, setAmount] = useState<number | null>(50);
  const [customAmount, setCustomAmount] = useState("");
  const [isCustom, setIsCustom] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const effectiveAmount = isCustom ? Number(customAmount) : amount;
  const canDonate = selectedCause && effectiveAmount && effectiveAmount > 0;

  const handleDonate = async () => {
    if (!canDonate) return;
    setProcessing(true);
    // TODO: API CALL — POST /api/donate/simulate
    await new Promise((resolve) => setTimeout(resolve, 2000));
    router.push("/track/demo-1");
  };

  return (
    <>
      <Navbar />
      <main className="max-w-6xl mx-auto px-6 py-14">
        <div className="text-center mb-14 animate-fade-in-up">
          <span className="label-stamped text-accent mb-2 block">DONATION MODULE</span>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-text-primary text-embossed mb-4">Make a Donation</h1>
          <p className="text-text-muted max-w-lg mx-auto">
            Choose a cause, select an amount, and your donation will reach recipients in under 60 seconds via XRPL.
          </p>
        </div>

        {/* Step 1 */}
        <div className="mb-14">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-chassis flex items-center justify-center font-mono font-bold text-sm text-accent"
              style={{ boxShadow: "var(--shadow-floating)" }}>01</div>
            <h2 className="text-xl font-bold text-text-primary text-embossed">Select a Cause</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 stagger">
            {causes.map((cause) => (
              <DonationCard key={cause.id} {...cause} selected={selectedCause === cause.id} onSelect={() => setSelectedCause(cause.id)} />
            ))}
          </div>
        </div>

        {/* Step 2 */}
        <div className="mb-14">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-chassis flex items-center justify-center font-mono font-bold text-sm text-accent"
              style={{ boxShadow: "var(--shadow-floating)" }}>02</div>
            <h2 className="text-xl font-bold text-text-primary text-embossed">Choose Amount</h2>
          </div>
          <div className="rounded-2xl p-6 bg-chassis" style={{ boxShadow: "var(--shadow-card)" }}>
            <div className="flex flex-wrap gap-3 mb-5">
              {presetAmounts.map((preset) => (
                <button key={preset} onClick={() => { setAmount(preset); setIsCustom(false); setCustomAmount(""); }}
                  className={`btn-industrial px-6 py-3 text-sm rounded-xl ${
                    !isCustom && amount === preset ? "btn-primary" : "btn-secondary"
                  }`}>
                  ${preset}
                </button>
              ))}
              <button onClick={() => { setIsCustom(true); setAmount(null); }}
                className={`btn-industrial px-6 py-3 text-sm rounded-xl ${isCustom ? "btn-primary" : "btn-secondary"}`}>
                Custom
              </button>
            </div>
            {isCustom && (
              <div className="animate-fade-in max-w-xs">
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted font-mono font-bold">$</span>
                  <input type="number" value={customAmount} onChange={(e) => setCustomAmount(e.target.value)} placeholder="0.00" min="1"
                    className="w-full pl-9 pr-4 py-3.5 rounded-xl bg-chassis font-mono text-lg text-text-primary placeholder:text-text-muted/30 border-none outline-none focus:ring-0 transition-shadow"
                    style={{ boxShadow: "var(--shadow-recessed)" }} />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Step 3 */}
        <div className="mb-14">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-chassis flex items-center justify-center font-mono font-bold text-sm text-accent"
              style={{ boxShadow: "var(--shadow-floating)" }}>03</div>
            <h2 className="text-xl font-bold text-text-primary text-embossed">
              Your Details <span className="text-sm font-normal text-text-muted">(optional)</span>
            </h2>
          </div>
          <div className="rounded-2xl p-6 bg-chassis" style={{ boxShadow: "var(--shadow-card)" }}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="label-stamped block mb-2">Name</label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name"
                  className="w-full px-5 py-3.5 rounded-xl bg-chassis font-mono text-sm text-text-primary placeholder:text-text-muted/30 border-none outline-none focus:ring-0 transition-shadow"
                  style={{ boxShadow: "var(--shadow-recessed)" }} />
              </div>
              <div>
                <label className="label-stamped block mb-2">Email</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="your@email.com"
                  className="w-full px-5 py-3.5 rounded-xl bg-chassis font-mono text-sm text-text-primary placeholder:text-text-muted/30 border-none outline-none focus:ring-0 transition-shadow"
                  style={{ boxShadow: "var(--shadow-recessed)" }} />
              </div>
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="text-center">
          <button onClick={handleDonate} disabled={!canDonate || processing}
            className={`btn-industrial px-12 py-5 text-base rounded-xl ${
              canDonate && !processing ? "btn-primary cursor-pointer" : "bg-recessed text-text-muted/30 cursor-not-allowed"
            }`}
            style={!canDonate || processing ? { boxShadow: "var(--shadow-recessed)" } : undefined}>
            {processing ? "Processing..." : `Donate $${effectiveAmount || 0}`}
          </button>
          {canDonate && <p className="mt-5 text-sm text-text-muted animate-fade-in">Your donation will be converted to RLUSD on XRPL and delivered instantly.</p>}
        </div>
      </main>
      <Footer />
    </>
  );
}
