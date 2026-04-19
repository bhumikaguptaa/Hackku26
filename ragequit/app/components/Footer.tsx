export default function Footer() {
  return (
    <footer className="bg-[#2d3436] mt-16">
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#3d4c51] flex items-center justify-center" style={{ boxShadow: "inset 2px 2px 4px rgba(0,0,0,0.3), inset -2px -2px 4px rgba(255,255,255,0.05)" }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
            </div>
            <span className="text-lg font-bold text-white">NexusAID</span>
            <span className="text-sm text-[#a8b2d1] hidden sm:inline">— humanitarian payment rails</span>
          </div>

          {/* Badges */}
          <div className="flex items-center gap-4 flex-wrap justify-center">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-[#3d4c51] text-[#a8b2d1]" style={{ boxShadow: "inset 2px 2px 4px rgba(0,0,0,0.3), inset -2px -2px 4px rgba(255,255,255,0.05)" }}>
              <div className="led led-on" />
              <span className="label-stamped text-accent">XRPL POWERED</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-[#3d4c51]" style={{ boxShadow: "inset 2px 2px 4px rgba(0,0,0,0.3), inset -2px -2px 4px rgba(255,255,255,0.05)" }}>
              <span className="label-stamped text-[#a8b2d1]">RLUSD STABLECOIN</span>
            </div>
            <a href="https://testnet.xrpl.org" target="_blank" rel="noopener noreferrer"
              className="text-sm font-medium text-[#a8b2d1] hover:text-accent transition-colors">
              XRPL Explorer
              <svg className="inline ml-1 w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /><polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" /></svg>
            </a>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-[#3d4c51] text-center">
          <p className="label-stamped text-[#636e72]">HackKU 2026 — Ripple / XRPL Track</p>
        </div>
      </div>
    </footer>
  );
}
