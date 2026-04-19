"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const sidebarLinks = [
  {
    href: "/dashboard", label: "Overview", tag: "MAIN",
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /></svg>,
  },
  {
    href: "/dashboard/recipients", label: "Recipients", tag: "REGISTRY",
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>,
  },
  {
    href: "/dashboard/disburse", label: "Disburse", tag: "TRANSFER",
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>,
  },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-64 bg-chassis flex flex-col flex-shrink-0" style={{ boxShadow: "4px 0 12px rgba(0,0,0,0.06)" }}>
        {/* Logo */}
        <div className="px-5 h-16 flex items-center">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-lg bg-chassis flex items-center justify-center" style={{ boxShadow: "var(--shadow-floating)" }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="group-hover:scale-110 transition-transform">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
            </div>
            <span className="text-lg font-bold text-text-primary">NexusAID</span>
          </Link>
        </div>

        {/* Section label */}
        <div className="px-5 pt-5 pb-2">
          <span className="label-stamped text-text-muted/50">NGO DASHBOARD</span>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-2 space-y-1">
          {sidebarLinks.map((link) => {
            const isActive = pathname === link.href || (link.href !== "/dashboard" && pathname.startsWith(link.href));
            return (
              <Link key={link.href} href={link.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
                  isActive ? "text-accent neu-recessed" : "text-text-muted hover:text-accent"
                }`}
                style={!isActive ? { boxShadow: "none" } : undefined}>
                <div className={`${isActive ? "text-accent" : ""}`}>{link.icon}</div>
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Wallet indicator */}
        <div className="px-4 pb-5">
          <div className="rounded-xl p-4 bg-chassis" style={{ boxShadow: "var(--shadow-recessed)" }}>
            <span className="label-stamped block mb-1">NGO WALLET</span>
            <p className="text-sm font-mono font-bold text-text-primary truncate">rN7m4B...Kx9pQ2</p>
            <div className="flex items-center gap-1.5 mt-2">
              <div className="led led-on" />
              <span className="label-stamped text-accent">CONNECTED — TESTNET</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-chassis flex items-center justify-between px-8" style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
          <h1 className="text-xl font-bold text-text-primary text-embossed">
            {pathname === "/dashboard" ? "Fund Overview" : pathname === "/dashboard/recipients" ? "Recipient Registry" : pathname === "/dashboard/disburse" ? "Disburse Funds" : "Dashboard"}
          </h1>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-md" style={{ boxShadow: "var(--shadow-recessed)" }}>
            <div className="led led-on" />
            <span className="label-stamped text-accent">XRPL TESTNET</span>
          </div>
        </header>
        <main className="flex-1 p-8 overflow-auto bg-chassis">{children}</main>
      </div>
    </div>
  );
}
