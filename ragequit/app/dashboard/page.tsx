import StatsCard from "../components/StatsCard";
import Link from "next/link";

const recentActivity = [
  { id: 1, action: "Donation received", detail: "$50.00 from Anonymous Donor → Kenya Relief", time: "2 min ago" },
  { id: 2, action: "Disbursement sent", detail: "$12.50 RLUSD → HID-2847-KE", time: "5 min ago" },
  { id: 3, action: "Disbursement sent", detail: "$12.50 RLUSD → HID-3192-KE", time: "5 min ago" },
  { id: 4, action: "New recipient registered", detail: "HID-5678-KE — Amina Osei, Nairobi", time: "1 hour ago" },
  { id: 5, action: "Donation received", detail: "$100.00 from Jane D. → Syria Medical Aid", time: "3 hours ago" },
];

export default function DashboardOverview() {
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 stagger">
        <StatsCard label="TOTAL DONATED" value="$12,450" change="+$2,150 today" trend="up"
          icon={<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" /></svg>} />
        <StatsCard label="TREASURY BALANCE" value="$3,280" change="RLUSD" trend="neutral"
          icon={<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2" /><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" /></svg>} />
        <StatsCard label="TOTAL DISBURSED" value="$9,170" change="+$650 today" trend="up"
          icon={<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>} />
        <StatsCard label="ACTIVE RECIPIENTS" value="47" change="+3 this week" trend="up"
          icon={<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /></svg>} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <div className="rounded-2xl p-6 bg-chassis relative" style={{ boxShadow: "var(--shadow-card)" }}>
          <div className="absolute top-3 left-3 screw" /><div className="absolute top-3 right-3 screw" />
          <h2 className="text-lg font-bold text-text-primary text-embossed mb-5">Quick Actions</h2>
          <div className="space-y-3">
            <Link href="/dashboard/disburse"
              className="flex items-center gap-3 px-4 py-3 rounded-xl bg-chassis transition-all duration-200 hover:-translate-y-0.5 group"
              style={{ boxShadow: "var(--shadow-card)" }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:scale-110 group-hover:rotate-12 transition-all duration-200">
                <line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
              </svg>
              <div>
                <p className="text-sm font-semibold text-text-primary">Disburse Funds</p>
                <p className="text-xs text-text-muted">Send RLUSD to recipients</p>
              </div>
            </Link>
            <Link href="/dashboard/recipients"
              className="flex items-center gap-3 px-4 py-3 rounded-xl bg-chassis transition-all duration-200 hover:-translate-y-0.5 group"
              style={{ boxShadow: "var(--shadow-card)" }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:scale-110 group-hover:rotate-12 transition-all duration-200">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
              </svg>
              <div>
                <p className="text-sm font-semibold text-text-primary">View Recipients</p>
                <p className="text-xs text-text-muted">Manage Humanitarian IDs</p>
              </div>
            </Link>
          </div>
        </div>

        {/* Activity */}
        <div className="lg:col-span-2 rounded-2xl p-6 bg-chassis relative" style={{ boxShadow: "var(--shadow-card)" }}>
          <div className="absolute top-3 left-3 screw" /><div className="absolute top-3 right-3 screw" />
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-bold text-text-primary text-embossed">Recent Activity</h2>
            <div className="flex items-center gap-1.5">
              <div className="led led-on" />
              <span className="label-stamped text-accent">LIVE</span>
            </div>
          </div>
          <div className="space-y-1">
            {recentActivity.map((item) => (
              <div key={item.id} className="flex items-start gap-3 px-3 py-3 rounded-lg hover:bg-recessed/30 transition-colors">
                <span className="w-2 h-2 rounded-full bg-accent mt-1.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-text-primary">{item.action}</p>
                  <p className="text-xs text-text-muted truncate">{item.detail}</p>
                </div>
                <span className="font-mono text-xs text-text-muted/50 flex-shrink-0">{item.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
