import xrplService from "./src/services/xrpl-service.js";
import onrampService from "./src/services/onramp-service.js";
import smsService from "./src/services/sms-service.js";
import { startServer, recipientStore, io } from "./server.js";
import { io as ioClient } from "socket.io-client";
import fs from "fs";

const PORT = 3099; // Use non-standard port for testing

async function runTests() {
  console.log("═══════════════════════════════════════════════════════");
  console.log("  NexusAID — Full Integration Test + Demo Staging");
  console.log("═══════════════════════════════════════════════════════\n");

  // --- Start server ---
  const { httpServer } = await startServer(PORT);
  const BASE = `http://localhost:${PORT}`;

  // --- Connect a Socket.io test client ---
  const wsEvents = [];
  const ws = ioClient(BASE);
  await new Promise((resolve) => ws.on("connect", resolve));
  console.log("[TEST] WebSocket client connected\n");

  // Capture all events
  const eventTypes = [
    "donation:received",
    "payment:disbursement",
    "payment:received",
    "recipient:new",
    "ledger:closed",
    "dashboard:state",
  ];
  eventTypes.forEach((evt) => {
    ws.on(evt, (data) => {
      wsEvents.push({ event: evt, data });
    });
  });

  // =========================================================================
  // TEST 1: Health Check
  // =========================================================================
  console.log("── Test 1: Health Check ──");
  const health = await fetch(`${BASE}/api/health`).then((r) => r.json());
  assert(health.status === "ok", "Health OK");
  assert(health.connected === true, "XRPL connected");

  // =========================================================================
  // TEST 2: Register Demo Recipients
  // =========================================================================
  console.log("\n── Test 2: Register Demo Recipients ──");

  const demoRecipients = [
    { name: "Amina Osei", phone: "+254700100001" },
    { name: "Joseph Kamau", phone: "+254700100002" },
    { name: "Fatima Hassan", phone: "+254700100003" },
    { name: "David Ochieng", phone: "+254700100004" },
    { name: "Grace Wanjiku", phone: "+254700100005" },
  ];

  const registeredHIDs = [];
  for (const r of demoRecipients) {
    const result = await fetch(`${BASE}/api/recipients`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(r),
    }).then((res) => res.json());

    assert(result.hid, `Registered ${r.name} as ${result.hid}`);
    registeredHIDs.push(result.hid);
  }

  // Verify recipients endpoint
  const allRecipients = await fetch(`${BASE}/api/recipients`).then((r) => r.json());
  assert(allRecipients.length === 5, `All 5 recipients listed`);

  // =========================================================================
  // TEST 3: Process Donations (On-ramp)
  // =========================================================================
  console.log("\n── Test 3: Process Donations ──");

  const donations = [
    { donorName: "UNHCR Grant", fiatAmount: 5000, fiatCurrency: "USD" },
    { donorName: "Jane Smith (London)", fiatAmount: 200, fiatCurrency: "GBP" },
    { donorName: "Oxfam Partnership", fiatAmount: 3000, fiatCurrency: "EUR" },
    { donorName: "GoFundMe Campaign", fiatAmount: 1500, fiatCurrency: "USD" },
  ];

  let totalDonated = 0;
  for (const d of donations) {
    const result = await fetch(`${BASE}/api/donate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(d),
    }).then((res) => res.json());

    assert(result.txHash, `${d.donorName}: ${d.fiatAmount} ${d.fiatCurrency} → ${result.rlusdAmount} RLUSD`);
    totalDonated += result.rlusdAmount;
  }
  console.log(`   Total donated: ${totalDonated.toFixed(2)} RLUSD`);

  // =========================================================================
  // TEST 4: Disburse Aid to Recipients
  // =========================================================================
  console.log("\n── Test 4: Disburse Aid ──");

  const disbursements = [
    { hid: registeredHIDs[0], amount: 500 },  // Amina
    { hid: registeredHIDs[1], amount: 350 },  // Joseph
    { hid: registeredHIDs[2], amount: 200 },  // Fatima
    { hid: registeredHIDs[3], amount: 150 },  // David
    { hid: registeredHIDs[4], amount: 300 },  // Grace
  ];

  for (const d of disbursements) {
    const result = await fetch(`${BASE}/api/disburse`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(d),
    }).then((res) => res.json());

    assert(result.txHash, `Disbursed ${d.amount} RLUSD → ${d.hid} (balance: ${result.newBalance})`);
  }

  // =========================================================================
  // TEST 5: Check Individual Balances
  // =========================================================================
  console.log("\n── Test 5: Recipient Balances ──");
  for (const hid of registeredHIDs) {
    const result = await fetch(`${BASE}/api/recipients/${hid}/balance`).then((r) => r.json());
    assert(result.balance > 0, `${hid}: ${result.balance} RLUSD`);
  }

  // =========================================================================
  // TEST 6: Dashboard Summary
  // =========================================================================
  console.log("\n── Test 6: Dashboard ──");
  const dashboard = await fetch(`${BASE}/api/dashboard`).then((r) => r.json());
  assert(dashboard.ngoBalance > 0, `NGO balance: ${dashboard.ngoBalance} RLUSD`);
  assert(dashboard.recipientCount === 5, `Recipients: ${dashboard.recipientCount}`);
  assert(dashboard.totalDistributed > 0, `Total distributed: ${dashboard.totalDistributed} RLUSD`);
  console.log(`   Total issued: ${dashboard.totalIssued} RLUSD`);

  // =========================================================================
  // TEST 7: SMS Commands
  // =========================================================================
  console.log("\n── Test 7: SMS Commands ──");

  // BAL
  const bal = await smsService.handleIncomingSMS("+254700100001", "BAL");
  assert(bal.command === "BAL", `BAL → ${bal.response.split("\n")[0]}`);

  // SEND (Amina → Joseph)
  const send = await smsService.handleIncomingSMS("+254700100001", `SEND 50 ${registeredHIDs[1]}`);
  assert(send.command === "SEND", `SEND → ${send.response.split("\n")[0]}`);

  // HISTORY
  const hist = await smsService.handleIncomingSMS("+254700100002", "HISTORY");
  assert(hist.command === "HISTORY", `HISTORY → ${hist.response.split("\n")[0]}`);

  // HELP
  const help = await smsService.handleIncomingSMS("+254700100003", "HELP");
  assert(help.command === "HELP", `HELP → response received`);

  // Error cases
  const badUser = await smsService.handleIncomingSMS("+19999999999", "BAL");
  assert(badUser.command === "UNKNOWN_USER", `Unknown user handled`);

  const badCmd = await smsService.handleIncomingSMS("+254700100001", "PIZZA");
  assert(badCmd.command === "UNKNOWN", `Bad command handled`);

  // =========================================================================
  // TEST 8: Transaction History API
  // =========================================================================
  console.log("\n── Test 8: Transaction History ──");
  const r1 = recipientStore.get(registeredHIDs[0]);
  const txHistory = await fetch(`${BASE}/api/transactions/${r1.address}?limit=5`).then((r) => r.json());
  assert(txHistory.length > 0, `${txHistory.length} transactions found for ${registeredHIDs[0]}`);

  // =========================================================================
  // TEST 9: Socket.io Events Received
  // =========================================================================
  console.log("\n── Test 9: Socket.io Events ──");
  // Give events a moment to propagate
  await sleep(1000);

  const donationEvents = wsEvents.filter((e) => e.event === "donation:received");
  const disbursementEvents = wsEvents.filter((e) => e.event === "payment:disbursement");
  const recipientEvents = wsEvents.filter((e) => e.event === "recipient:new");

  assert(donationEvents.length === 4, `Received ${donationEvents.length} donation events`);
  assert(disbursementEvents.length >= 5, `Received ${disbursementEvents.length} disbursement events`);
  assert(recipientEvents.length === 5, `Received ${recipientEvents.length} recipient:new events`);

  // =========================================================================
  // TEST 10: Dashboard Subscribe via WebSocket
  // =========================================================================
  console.log("\n── Test 10: WebSocket Dashboard Subscribe ──");
  const dashState = await new Promise((resolve) => {
    ws.once("dashboard:state", resolve);
    ws.emit("dashboard:subscribe");
  });
  assert(dashState.ngoBalance > 0, `WS dashboard: NGO balance ${dashState.ngoBalance}`);
  assert(dashState.recipients.length === 5, `WS dashboard: ${dashState.recipients.length} recipients`);

  // =========================================================================
  // Save demo wallet state for frontend work
  // =========================================================================
  console.log("\n── Saving Demo State ──");
  const demoState = {
    savedAt: new Date().toISOString(),
    server: `http://localhost:3001`,
    ngo: {
      address: xrplService.ngoWallet.address,
      balance: dashboard.ngoBalance,
    },
    recipients: [],
    donations: donations.map((d, i) => ({
      ...d,
      rlusdAmount: donationEvents[i]?.data.rlusdAmount,
    })),
  };

  for (const [hid, r] of recipientStore) {
    const balance = await xrplService.getBalance(r.address);
    demoState.recipients.push({
      hid,
      name: r.name,
      phone: r.phone,
      address: r.address,
      seed: r.seed,
      balance,
    });
  }

  fs.writeFileSync("demo-state.json", JSON.stringify(demoState, null, 2));
  console.log("   Saved demo-state.json");

  // =========================================================================
  // Results
  // =========================================================================
  console.log("\n═══════════════════════════════════════════════════════");
  console.log("  ✅ ALL 10 TESTS PASSED");
  console.log("═══════════════════════════════════════════════════════");
  console.log(`\n  📊 Final State:`);
  console.log(`     NGO Balance:     ${dashboard.ngoBalance} RLUSD`);
  console.log(`     Recipients:      ${dashboard.recipientCount}`);
  console.log(`     Total Disbursed: ${dashboard.totalDistributed} RLUSD`);
  console.log(`     WS Events:       ${wsEvents.length} captured`);
  console.log(`\n  📁 Files saved:`);
  console.log(`     wallets.json     — Gateway + NGO keys`);
  console.log(`     demo-state.json  — Full demo state for frontend\n`);

  ws.disconnect();
  httpServer.close();
  await xrplService.disconnect();
  process.exit(0);
}

// --- Helpers ---

function assert(condition, message) {
  if (condition) {
    console.log(`   ✅ ${message}`);
  } else {
    console.log(`   ❌ FAIL: ${message}`);
    process.exit(1);
  }
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// --- Run ---
runTests().catch((err) => {
  console.error("\n❌ Test failed:", err);
  process.exit(1);
});
