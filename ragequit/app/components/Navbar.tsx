"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

export default function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const links = [
    { href: "/", label: "Home" },
    { href: "/donate", label: "Donate" },
    { href: "/dashboard", label: "Dashboard" },
    { href: "/portal", label: "Portal" },
  ];

  return (
    <header className="sticky top-0 z-50 bg-chassis" style={{ boxShadow: "0 4px 12px rgba(0,0,0,0.08)" }}>
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-chassis flex items-center justify-center" style={{ boxShadow: "var(--shadow-floating)" }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="group-hover:scale-110 group-hover:rotate-12 transition-all duration-200">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
          </div>
          <span className="text-xl font-bold tracking-tight text-text-primary">NexusAID</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1">
          {links.map((link) => {
            const isActive = pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href));
            return (
              <Link key={link.href} href={link.href}
                className={`px-4 py-2 text-sm font-semibold uppercase tracking-wider rounded-lg transition-all duration-200 ${isActive
                    ? "text-accent bg-chassis neu-recessed"
                    : "text-text-muted hover:text-accent"
                  }`}
              >
                {link.label}
              </Link>
            );
          })}
          {/* LED */}
          <div className="flex items-center gap-2 ml-4 px-3 py-1.5 rounded-lg neu-recessed">
            <div className="led led-on" />
            <span className="label-stamped text-accent">ONLINE</span>
          </div>
        </nav>

        {/* Mobile hamburger */}
        <button onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden w-10 h-10 rounded-lg flex items-center justify-center bg-chassis transition-all duration-150 active:translate-y-[2px]"
          style={{ boxShadow: mobileOpen ? "var(--shadow-pressed)" : "var(--shadow-card)" }}
          aria-label="Toggle menu"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            {mobileOpen ? (
              <><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></>
            ) : (
              <><line x1="4" y1="6" x2="20" y2="6" /><line x1="4" y1="12" x2="20" y2="12" /><line x1="4" y1="18" x2="20" y2="18" /></>
            )}
          </svg>
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-chassis px-6 py-4 animate-fade-in" style={{ boxShadow: "inset 0 4px 8px rgba(0,0,0,0.06)" }}>
          <nav className="flex flex-col gap-2">
            {links.map((link) => {
              const isActive = pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href));
              return (
                <Link key={link.href} href={link.href} onClick={() => setMobileOpen(false)}
                  className={`px-4 py-3 text-sm font-semibold uppercase tracking-wider rounded-lg transition-all duration-150 ${isActive ? "text-accent neu-recessed" : "text-text-muted neu-card hover:text-accent"
                    }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>
      )}
    </header>
  );
}
