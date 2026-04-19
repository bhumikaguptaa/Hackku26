
async function seed() {
  const BASE = "http://localhost:3001";

  console.log("🌱 Seeding NexusAID Demo Data...");

  // 1. Register Recipients
  const recipients = [
    { name: "Amina Osei", phone: "+254700100001" },
    { name: "Joseph Kamau", phone: "+254700100002" },
    { name: "Fatima Hassan", phone: "+254700100003" },
    { name: "David Ochieng", phone: "+254700100004" },
    { name: "Grace Wanjiku", phone: "+254700100005" },
  ];

  for (const r of recipients) {
    const res = await fetch(`${BASE}/api/recipients`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(r),
    });
    const data = await res.json();
    console.log(`✅ Registered: ${r.name} (${data.hid})`);
  }

  // 2. Process Initial Donations
  const donations = [
    { donorName: "UNHCR Grant", fiatAmount: 5000, fiatCurrency: "USD", cause: "Global Relief" },
    { donorName: "Oxfam Partnership", fiatAmount: 2500, fiatCurrency: "EUR", cause: "Kenya Relief Fund" },
    { donorName: "Jane Smith", fiatAmount: 150, fiatCurrency: "GBP", cause: "Medical Supplies" },
  ];

  for (const d of donations) {
    const res = await fetch(`${BASE}/api/donate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(d),
    });
    const data = await res.json();
    console.log(`💰 Donation: $${d.fiatAmount} from ${d.donorName} processed.`);
  }

  console.log("\n✨ Seeding Complete! Refresh your dashboard at http://localhost:3000");
}

seed().catch(err => {
  console.error("❌ Seeding failed. Is the server running on port 3001?");
  process.exit(1);
});
