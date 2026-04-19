"use client";

import { useState } from "react";

const mockRecipients = [
  { hid: "HID-2847-KE", name: "Amara Njeri", phone: "+254 712 345 678", balance: "$47.20", lastActivity: "2 min ago", status: "Active", region: "Nairobi, Kenya" },
  { hid: "HID-3192-KE", name: "John Ochieng", phone: "+254 723 456 789", balance: "$32.50", lastActivity: "5 min ago", status: "Active", region: "Mombasa, Kenya" },
  { hid: "HID-4501-KE", name: "Fatima Hassan", phone: "+254 734 567 890", balance: "$18.00", lastActivity: "1 hour ago", status: "Active", region: "Kisumu, Kenya" },
  { hid: "HID-5678-KE", name: "Amina Osei", phone: "+254 745 678 901", balance: "$12.50", lastActivity: "1 hour ago", status: "Active", region: "Nairobi, Kenya" },
  { hid: "HID-6789-SY", name: "Omar Al-Rashid", phone: "+963 912 345 678", balance: "$65.00", lastActivity: "3 hours ago", status: "Active", region: "Aleppo, Syria" },
  { hid: "HID-7890-SY", name: "Layla Khoury", phone: "+963 923 456 789", balance: "$0.00", lastActivity: "2 days ago", status: "Pending", region: "Damascus, Syria" },
  { hid: "HID-8901-BD", name: "Rahim Ahmed", phone: "+880 1712 345 678", balance: "$22.80", lastActivity: "5 hours ago", status: "Active", region: "Dhaka, Bangladesh" },
  { hid: "HID-9012-BD", name: "Nasreen Begum", phone: "+880 1823 456 789", balance: "$8.50", lastActivity: "1 day ago", status: "Inactive", region: "Chittagong, Bangladesh" },
];

export default function RecipientsPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const filtered = mockRecipients.filter((r) => {
    const matchesSearch = r.name.toLowerCase().includes(search.toLowerCase()) || r.hid.toLowerCase().includes(search.toLowerCase()) || r.region.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "All" || r.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <svg className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted/40" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name, HID, or region..."
            className="w-full pl-10 pr-4 py-3 rounded-xl bg-chassis font-mono text-sm text-text-primary placeholder:text-text-muted/30 border-none outline-none"
            style={{ boxShadow: "var(--shadow-recessed)" }} />
        </div>
        <div className="flex gap-2 flex-wrap">
          {["All", "Active", "Pending", "Inactive"].map((status) => (
            <button key={status} onClick={() => setStatusFilter(status)}
              className={`btn-industrial px-4 py-2 text-xs rounded-lg ${statusFilter === status ? "btn-primary" : "btn-secondary"}`}>
              {status}
            </button>
          ))}
        </div>
      </div>

      <span className="label-stamped">{filtered.length} RECIPIENT{filtered.length !== 1 ? "S" : ""} FOUND</span>

      <div className="rounded-2xl bg-chassis overflow-hidden relative" style={{ boxShadow: "var(--shadow-card)" }}>
        <div className="absolute top-3 left-3 screw" /><div className="absolute top-3 right-3 screw" />
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-recessed/50">
                <th className="px-5 py-4 label-stamped">HID</th>
                <th className="px-5 py-4 label-stamped">NAME</th>
                <th className="px-5 py-4 label-stamped">PHONE</th>
                <th className="px-5 py-4 label-stamped">BALANCE</th>
                <th className="px-5 py-4 label-stamped">LAST ACTIVE</th>
                <th className="px-5 py-4 label-stamped">STATUS</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <tr key={r.hid} className="border-t border-recessed/50 hover:bg-recessed/20 transition-colors">
                  <td className="px-5 py-4 font-mono text-sm font-bold text-accent">{r.hid}</td>
                  <td className="px-5 py-4">
                    <p className="text-sm font-semibold text-text-primary">{r.name}</p>
                    <p className="text-xs text-text-muted">{r.region}</p>
                  </td>
                  <td className="px-5 py-4 font-mono text-sm text-text-muted">{r.phone}</td>
                  <td className="px-5 py-4 font-mono text-sm font-bold text-text-primary">{r.balance}</td>
                  <td className="px-5 py-4 font-mono text-xs text-text-muted">{r.lastActivity}</td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-1.5">
                      <div className={`led ${r.status === "Active" ? "led-on" : "led-off"}`} />
                      <span className="label-stamped">{r.status.toUpperCase()}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
