"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function RecipientLogin() {
  const router = useRouter();
  const [hid, setHid] = useState("");
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    
    try {
      const response = await fetch("http://localhost:3001/api/recipients");
      const recipients = await response.json();
      
      const found = recipients.find((r: any) => r.hid.toLowerCase() === hid.toLowerCase());
      
      if (found && pin.length === 4) {
        // Just storing ID in local storage for demo purposes
        if (typeof window !== "undefined") {
          localStorage.setItem("nexus_hid", found.hid);
        }
        router.push("/portal/wallet");
      } else {
        setError("Invalid Humanitarian ID or PIN. Please try again.");
      }
    } catch (e) {
      console.error(e);
      setError("Failed to connect to backend server.");
    }
    
    setLoading(false);
  };

  return (
    <>
      <Navbar />
      <main className="flex-1 flex items-center justify-center px-6 py-20">
        <div className="w-full max-w-md animate-fade-in-up">
          <div className="text-center mb-10">
            <div className="w-20 h-20 rounded-2xl bg-chassis flex items-center justify-center mx-auto mb-6"
              style={{ boxShadow: "var(--shadow-floating)" }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
              </svg>
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight text-text-primary text-embossed mb-2">NexusAID Wallet</h1>
            <p className="text-text-muted">Access your funds with your Humanitarian ID and PIN</p>
          </div>

          <form onSubmit={handleLogin} className="rounded-2xl p-8 space-y-6 bg-chassis relative" style={{ boxShadow: "var(--shadow-floating)" }}>
            <div className="absolute top-3 left-3 screw" /><div className="absolute top-3 right-3 screw" />
            <div className="absolute bottom-3 left-3 screw" /><div className="absolute bottom-3 right-3 screw" />

            <div>
              <label className="label-stamped block mb-2">HUMANITARIAN ID</label>
              <input type="text" value={hid} onChange={(e) => setHid(e.target.value)} placeholder="e.g. HID-2847-KE" required
                className="w-full px-5 py-4 rounded-xl bg-chassis font-mono text-base text-text-primary placeholder:text-text-muted/30 border-none outline-none"
                style={{ boxShadow: "var(--shadow-recessed)" }} />
            </div>
            <div>
              <label className="label-stamped block mb-2">4-DIGIT PIN</label>
              <input type="password" value={pin} onChange={(e) => { if (e.target.value.length <= 4) setPin(e.target.value); }}
                placeholder="----" maxLength={4} pattern="[0-9]*" inputMode="numeric" required
                className="w-full px-5 py-4 rounded-xl bg-chassis font-mono text-3xl text-center tracking-[0.5em] text-text-primary placeholder:text-text-muted/30 border-none outline-none"
                style={{ boxShadow: "var(--shadow-recessed)" }} />
            </div>
            {error && (
              <div className="rounded-lg p-4 bg-red-50 border border-red-200 animate-fade-in">
                <p className="text-sm font-semibold text-red-600">{error}</p>
              </div>
            )}
            <button type="submit" disabled={loading}
              className="btn-industrial btn-primary w-full py-4 text-sm rounded-xl disabled:opacity-50">
              {loading ? "Authenticating..." : "Access Wallet"}
            </button>
          </form>

          <p className="text-center text-xs text-text-muted mt-6">
            Don&apos;t have a Humanitarian ID? Contact your local NGO office or text REGISTER to the NexusAID SMS line.
          </p>
        </div>
      </main>
      <Footer />
    </>
  );
}
