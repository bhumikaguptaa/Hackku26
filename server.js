import express from "express";
import { createServer } from "http";
import { Server as SocketIO } from "socket.io";
import cors from "cors";
import fs from "fs";
import xrplService from "./src/services/xrpl-service.js";
import onrampService from "./src/services/onramp-service.js";
import smsService from "./src/services/sms-service.js";

const app = express();
const httpServer = createServer(app);
const io = new SocketIO(httpServer, {
  cors: { origin: "*", methods: ["GET", "POST"] },
});

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- Recipient store (in-memory, shared across services) ---
const recipientStore = new Map(); // hid → { hid, name, phone, address, seed }
const donationsStore = new Map(); // txHash → donation object
const activityStore = []; // array of recent activity objects
// --- Data Persistence Layer ---
const DB_FILE = "./db.json";

function loadDB() {
  if (fs.existsSync(DB_FILE)) {
    try {
      const data = JSON.parse(fs.readFileSync(DB_FILE, "utf-8"));
      if (data.recipients) {
        recipientStore.clear();
        data.recipients.forEach(([k, v]) => recipientStore.set(k, v));
      }
      if (data.donations) {
        donationsStore.clear();
        data.donations.forEach(([k, v]) => donationsStore.set(k, v));
      }
      if (data.activities) {
        activityStore.length = 0;
        data.activities.forEach(a => activityStore.push(a));
      }
      console.log(`[DB] Successfully loaded state from ${DB_FILE}`);
    } catch (e) {
      console.error("[DB] Failed to load db:", e);
    }
  }
}

function saveDB() {
  try {
    const data = {
      recipients: Array.from(recipientStore.entries()),
      donations: Array.from(donationsStore.entries()),
      activities: activityStore
    };
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), "utf-8");
  } catch (e) {
    console.error("[DB] Failed to save db:", e);
  }
}

// --- REST API ---

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", connected: xrplService.connected });
});

// Get all recipients
app.get("/api/recipients", (req, res) => {
  const list = Array.from(recipientStore.values()).map((r) => ({
    hid: r.hid,
    name: r.name,
    phone: r.phone,
    address: r.address,
  }));
  res.json(list);
});

// Get single recipient balance
app.get("/api/recipients/:hid/balance", async (req, res) => {
  const r = recipientStore.get(req.params.hid);
  if (!r) return res.status(404).json({ error: "Recipient not found" });

  const balance = await xrplService.getBalance(r.address);
  res.json({ hid: r.hid, balance, address: r.address });
});

// Register new recipient (creates wallet + trust line)
app.post("/api/recipients", async (req, res) => {
  const { name, phone } = req.body;
  const count = recipientStore.size + 1;
  const hid = `HID-${String(count).padStart(4, "0")}-KE`;

  const wallet = await xrplService.createRecipientWallet();

  const recipient = {
    hid,
    name,
    phone,
    address: wallet.address,
    seed: wallet.seed,
  };

  recipientStore.set(hid, recipient);
  smsService.registerRecipient(phone, recipient);

  io.emit("recipient:new", { hid, name, phone, address: wallet.address });
  saveDB();

  res.json({ hid, address: wallet.address });
});

// Disburse RLUSD from NGO to recipient
app.post("/api/disburse", async (req, res) => {
  const { hid, amount } = req.body;
  const r = recipientStore.get(hid);
  if (!r) return res.status(404).json({ error: "Recipient not found" });

  const result = await xrplService.disburse(r.address, String(amount));
  const newBalance = await xrplService.getBalance(r.address);

  const event = {
    type: "disbursement",
    hid: r.hid,
    name: r.name,
    amount: parseFloat(amount),
    newBalance,
    txHash: result.hash,
    explorerUrl: result.explorerUrl,
    timestamp: new Date().toISOString(),
  };

  io.emit("payment:disbursement", event);
  await smsService.notifyDisbursement(r.phone, amount, "NGO");

  const activity = {
    id: Date.now().toString(),
    action: "Disbursement sent",
    detail: `$${amount} RLUSD → ${hid}`,
    time: "Just now"
  };
  activityStore.unshift(activity);
  if (activityStore.length > 50) activityStore.pop();
  saveDB();

  res.json(event);
});

// Process a donor donation
app.post("/api/donate", async (req, res) => {
  const { donorName, fiatAmount, fiatCurrency } = req.body;

  const result = await onrampService.processDonation({
    donorName,
    fiatAmount: parseFloat(fiatAmount),
    fiatCurrency,
  });

  const ngoBalance = await xrplService.getBalance(xrplService.ngoWallet.address);

  const event = {
    type: "donation",
    donorName: result.donorName,
    fiatAmount: result.fiatAmount,
    fiatCurrency: result.fiatCurrency,
    rlusdAmount: parseFloat(result.rlusdAmount),
    exchangeRate: result.exchangeRate,
    ngoBalance,
    txHash: result.txHash,
    explorerUrl: result.explorerUrl,
    timestamp: result.timestamp,
    cause: req.body.cause || "General Fund"
  };

  donationsStore.set(result.txHash, event);

  io.emit("donation:received", event);

  const activity = {
    id: Date.now().toString(),
    action: "Donation received",
    detail: `$${result.fiatAmount} from ${result.donorName} → ${event.cause}`,
    time: "Just now"
  };
  activityStore.unshift(activity);
  if (activityStore.length > 50) activityStore.pop();
  saveDB();

  res.json(event);
});

// Get NGO dashboard data
app.get("/api/dashboard", async (req, res) => {
  const ngoBalance = await xrplService.getBalance(xrplService.ngoWallet.address);
  let ngoXrpBalance = "0";
  let gatewayXrpBalance = "0";
  let gatewayData = { obligations: {} };
  try {
    ngoXrpBalance = await xrplService.getXRPBalance(xrplService.ngoWallet.address);
    gatewayXrpBalance = await xrplService.getXRPBalance(xrplService.gatewayWallet.address);
    gatewayData = await xrplService.getGatewayBalances();
  } catch (e) {
    console.warn("Failed to fetch extended dashboard balances:", e);
  }

  const recipients = [];
  for (const [, r] of recipientStore) {
    const balance = await xrplService.getBalance(r.address);
    recipients.push({ hid: r.hid, name: r.name, balance });
  }

  const totalDistributed = recipients.reduce((sum, r) => sum + r.balance, 0);

  res.json({
    ngoBalance,
    ngoXrpBalance,
    gatewayXrpBalance,
    totalIssued: gatewayData.obligations.RLUSD
      ? parseFloat(gatewayData.obligations.RLUSD)
      : (gatewayData.obligations.USD ? parseFloat(gatewayData.obligations.USD) : 0),
    totalDistributed,
    recipientCount: recipientStore.size,
    recipients,
    recentActivity: activityStore.slice(0, 10),
  });
});

// Get transaction history for any address
app.get("/api/transactions/:address", async (req, res) => {
  const history = await xrplService.getTransactionHistory(
    req.params.address,
    parseInt(req.query.limit) || 20
  );
  res.json(history);
});

// Get donation by txHash
app.get("/api/donations/:txHash", (req, res) => {
  const donation = donationsStore.get(req.params.txHash);
  if (!donation) return res.status(404).json({ error: "Donation not found" });
  res.json(donation);
});

// Recipient sends RLUSD to another recipient
app.post("/api/recipient/send", async (req, res) => {
  const { senderHid, targetHid, amount } = req.body;
  const sender = recipientStore.get(senderHid);

  let target = recipientStore.get(targetHid);
  if (!target && targetHid.startsWith("+")) {
    for (const [, r] of recipientStore) {
      if (r.phone === targetHid) {
        target = r; break;
      }
    }
  }

  if (!sender || !target) return res.status(404).json({ error: "Sender or target not found" });

  try {
    const senderWallet = xrplService.walletFromSeed(sender.seed);
    const result = await xrplService.sendPayment(senderWallet, target.address, String(amount));
    res.json({ success: true, txHash: result.hash });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Twilio SMS webhook
app.post("/sms/webhook", smsService.webhookHandler());

// --- Socket.io ---

io.on("connection", (socket) => {
  console.log(`[WS] Client connected: ${socket.id}`);

  // Send current state on connect
  socket.on("dashboard:subscribe", async () => {
    const ngoBalance = await xrplService.getBalance(xrplService.ngoWallet.address);
    const recipients = [];
    for (const [, r] of recipientStore) {
      const balance = await xrplService.getBalance(r.address);
      recipients.push({ hid: r.hid, name: r.name, balance });
    }
    socket.emit("dashboard:state", { ngoBalance, recipients });
  });

  socket.on("disconnect", () => {
    console.log(`[WS] Client disconnected: ${socket.id}`);
  });
});

// --- Bridge XRPL events → Socket.io ---

xrplService.on("payment", (payment) => {
  // Find if recipient is in our store
  let recipientInfo = null;
  for (const [, r] of recipientStore) {
    if (r.address === payment.to) {
      recipientInfo = { hid: r.hid, name: r.name };
      break;
    }
  }

  io.emit("payment:received", {
    ...payment,
    recipient: recipientInfo,
  });
});

xrplService.on("ledger", (ledger) => {
  io.emit("ledger:closed", ledger);
});

// --- Startup ---

async function startServer(port = 3001) {
  loadDB();
  await xrplService.connect();
  xrplService.loadWallets("./wallets.json");

  // Subscribe to ledger events
  await xrplService.subscribeToLedger();

  // Watch NGO wallet for incoming funds
  await xrplService.subscribeToAccounts([xrplService.ngoWallet.address]);

  httpServer.listen(port, () => {
    console.log(`\n🚀 NexusAID server running on http://localhost:${port}`);
    console.log(`   Socket.io ready for real-time connections`);
    console.log(`   SMS webhook: POST /sms/webhook`);
    console.log(`   Dashboard:   GET  /api/dashboard\n`);
  });

  return { app, io, httpServer };
}

export { app, io, httpServer, recipientStore, startServer };
export default startServer;

import { fileURLToPath } from 'url';
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  startServer().catch(console.error);
}
