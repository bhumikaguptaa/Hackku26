import Link from "next/link";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

export default function LandingPage() {
  return (
    <>
      <Navbar />
      <main>
        {/* Hero */}
        <section className="relative overflow-hidden py-20 md:py-28">
          <div className="max-w-6xl mx-auto px-6">
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 items-center">
              {/* Text — 3 cols */}
              <div className="lg:col-span-3 animate-fade-in-up">
                <div className="flex items-center gap-2.5 mb-6">
                  <div className="led led-on" />
                  <span className="label-stamped text-accent">SYSTEM OPERATIONAL</span>
                </div>
                <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight leading-[1.1] mb-6 text-text-primary text-embossed">
                  Universal Humanitarian Payment Rails
                </h1>
                <p className="text-lg text-text-muted leading-relaxed max-w-xl mb-8">
                  Donate fiat in any currency. It converts to RLUSD on XRPL in 3 seconds. Recipients access funds via SMS or web — no smartphone, no bank account needed.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link href="/donate" className="btn-industrial btn-primary px-8 py-4 text-sm rounded-xl">
                    Donate Now
                  </Link>
                  {/* <Link href="/track/demo-1" className="btn-industrial btn-secondary px-8 py-4 text-sm rounded-xl">
                    Track a Donation
                  </Link> */}
                </div>
              </div>

              {/* Device visualization — 2 cols */}
              <div className="lg:col-span-2 animate-fade-in-up hidden lg:block" style={{ animationDelay: "0.2s" }}>
                <div className="rounded-3xl p-1 border-4 border-[#2d3436] relative" style={{ background: "linear-gradient(145deg, #1a1a2e, #16213e)" }}>
                  {/* Screen */}
                  <div className="rounded-2xl aspect-[4/3] relative overflow-hidden bg-[#0a0e17]" style={{ boxShadow: "inset 0 0 20px rgba(0,0,0,0.5)" }}>
                    {/* Scanlines */}
                    <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ background: "linear-gradient(rgba(18,16,16,0) 50%, rgba(0,0,0,0.25) 50%)", backgroundSize: "100% 4px" }} />
                    {/* Dashboard content */}
                    <div className="absolute inset-4 flex flex-col justify-between">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs text-accent/60">NEXUSAID v2.0</span>
                        <div className="flex items-center gap-2">
                          <div className="led led-on" />
                          <span className="font-mono text-[10px] text-accent/60">LIVE</span>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div className="h-2 w-3/4 rounded-full bg-accent/20"><div className="h-full w-2/3 rounded-full bg-accent" /></div>
                        <div className="h-2 w-1/2 rounded-full bg-accent/20"><div className="h-full w-4/5 rounded-full bg-accent/60" /></div>
                        <div className="h-2 w-5/6 rounded-full bg-accent/20"><div className="h-full w-1/3 rounded-full bg-teal" /></div>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        {["$12,450", "47", "3 sec"].map((v) => (
                          <div key={v} className="rounded-md bg-white/5 px-2 py-1.5 text-center">
                            <span className="font-mono text-xs font-bold text-accent">{v}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  {/* Physical buttons on side */}
                  <div className="absolute -right-3 top-1/3 flex flex-col gap-3">
                    <div className="w-2 h-8 rounded-full bg-[#3d4c51]" style={{ boxShadow: "1px 1px 2px rgba(0,0,0,0.3)" }} />
                    <div className="w-2 h-5 rounded-full bg-accent" style={{ boxShadow: "1px 1px 2px rgba(0,0,0,0.3)" }} />
                  </div>
                  {/* Power LED */}
                  <div className="absolute bottom-2 left-1/2 -translate-x-1/2">
                    <div className="w-2 h-2 rounded-full bg-accent" style={{ boxShadow: "0 0 6px 1px var(--accent-glow)" }} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Strip */}
        <section className="bg-[#2d3436] py-10">
          <div className="max-w-6xl mx-auto px-6">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6 stagger">
              {[
                { value: "$0.0002", label: "AVG TRANSACTION FEE" },
                { value: "3 SEC", label: "SETTLEMENT ON XRPL" },
                { value: "SMS", label: "WORKS ON ANY PHONE" },
              ].map((stat) => (
                <div key={stat.label} className="text-center">
                  <p className="text-3xl md:text-4xl font-extrabold font-mono text-white tracking-tight" style={{ filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.3))" }}>
                    {stat.value}
                  </p>
                  <p className="label-stamped text-[#a8b2d1] mt-1">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="max-w-6xl mx-auto px-6 py-20">
          <div className="text-center mb-14">
            <span className="label-stamped text-accent mb-2 block">PROCESS DIAGRAM</span>
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-text-primary text-embossed">How It Works</h2>
            <p className="text-text-muted mt-3 max-w-xl mx-auto">
              From a donor&apos;s credit card to a recipient&apos;s SMS — in under 60 seconds, for less than a cent.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 stagger relative">
            {/* Connector pipe */}
            <div className="hidden md:block absolute top-20 left-[16%] w-[68%] h-3 rounded-full bg-recessed" style={{ boxShadow: "inset 0 1px 3px rgba(0,0,0,0.2)" }} />

            {[
              { step: "01", title: "Donor Pays Fiat", desc: "Choose a cause and donate via credit card. Stripe handles the payment processing securely." },
              { step: "02", title: "XRPL Converts to RLUSD", desc: "The native DEX auto-converts fiat to RLUSD in a single atomic transaction. 3 seconds. $0.0002 fee." },
              { step: "03", title: "Recipient Gets SMS", desc: "Funds land in their Humanitarian ID wallet. They get an SMS notification — works on any phone." },
            ].map((item) => (
              <div key={item.step} className="relative rounded-2xl p-7 bg-chassis transition-all duration-300 hover:-translate-y-1 group" style={{ boxShadow: "var(--shadow-card)" }}>
                {/* Screws */}
                <div className="absolute top-3 left-3 screw" />
                <div className="absolute top-3 right-3 screw" />

                {/* Step number */}
                <div className="w-14 h-14 rounded-full bg-chassis flex items-center justify-center mb-5 font-mono font-bold text-lg text-accent z-10 relative"
                  style={{ boxShadow: "var(--shadow-floating)" }}>
                  {item.step}
                </div>
                <h3 className="text-lg font-bold text-text-primary mb-3 text-embossed">{item.title}</h3>
                <p className="text-sm text-text-muted leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Three Actors */}
        <section className="bg-[#2d3436] py-20">
          <div className="max-w-6xl mx-auto px-6">
            <div className="text-center mb-14">
              <span className="label-stamped text-accent mb-2 block">SYSTEM ARCHITECTURE</span>
              <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white" style={{ filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.3))" }}>Three Actors, One Platform</h2>
              <p className="text-[#a8b2d1] mt-3 max-w-xl mx-auto">NexusAID connects donors, NGOs, and recipients through a single transparent system.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 stagger">
              {[
                { title: "The Donor", tag: "FIAT IN", items: ["Visits nexusaid.org/donate", "Selects a cause / region", "Pays via credit card", "Gets receipt with XRPL tx hash", "Tracks donation to recipient"] },
                { title: "The NGO", tag: "OPERATIONS", items: ["Dashboard to manage recipients", "Create / verify Humanitarian IDs", "Set disbursement rules", "View real-time fund flows", "Export audit reports"] },
                { title: "The Recipient", tag: "SMS ACCESS", items: ["Receives SMS notification", "Web dashboard for smartphones", "Check balance via SMS", "Transfer funds by text", "No smartphone or bank needed"] },
              ].map((actor) => (
                <div key={actor.title} className="rounded-2xl p-7 bg-chassis relative group transition-all duration-300 hover:-translate-y-1" style={{ boxShadow: "var(--shadow-card)" }}>
                  <div className="absolute top-3 left-3 screw" />
                  <div className="absolute top-3 right-3 screw" />
                  <div className="absolute bottom-3 left-3 screw" />
                  <div className="absolute bottom-3 right-3 screw" />

                  <div className="flex items-center gap-2 mb-4">
                    <div className="led led-on" />
                    <span className="label-stamped text-accent">{actor.tag}</span>
                  </div>
                  <h3 className="text-xl font-bold text-text-primary mb-4 text-embossed">{actor.title}</h3>
                  <ul className="space-y-2.5">
                    {actor.items.map((item) => (
                      <li key={item} className="flex items-start gap-2 text-sm text-text-muted">
                        <svg className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6" /></svg>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Bottom CTA */}
        <section className="max-w-6xl mx-auto px-6 py-20 text-center">
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-text-primary text-embossed mb-4">Ready to make an impact?</h2>
          <p className="text-text-muted mb-8 max-w-md mx-auto">Every dollar goes further on NexusAID. Zero intermediaries, full transparency, instant delivery.</p>
          <Link href="/donate" className="btn-industrial btn-primary px-10 py-5 text-base rounded-xl">
            Start Donating
          </Link>
        </section>
      </main>
      <Footer />
    </>
  );
}
