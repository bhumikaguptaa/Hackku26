---

# NexusAID - HackKU26 Hackathon

![Project Status](https://img.shields.io/badge/Status-Hackathon_Prototype-brightgreen)

NexusAID is an end-to-end, blockchain-powered humanitarian financial pipeline designed to eradicate the "last-mile" problem in crisis zones. Built for the HackKU26 Hackathon, NexusAID provides a transparent, cross-border donation and disbursement ecosystem by immediately tokenizing fiat into RLUSD stablecoins on the XRP Ledger. It bridges the gap between traditional donor fiat systems and decentralized finance, allowing NGOs to rapidly deploy funds internationally with near-zero logistics overhead.

## 🚀 Features

- **Fiat-to-Stablecoin On-Ramp**: Donors convert their fiat contributions straight into `RLUSD` on the XRPL via an automated gateway, providing absolute transparent tracking right from the genesis of the donation.
- **Enterprise NGO Dashboard**: An intuitive real-time web portal that lets administrators monitor treasury balances, manually trigger bulk distributions, and audit all transaction history via live socket updates.
- **Gasless Recipient Wallets**: Non-technical victims receive funds without dealing with gas fees. The backend dynamically creates and provisions XRPL wallets tied to easily digestible "Humanitarian IDs" (HIDs), while a central NGO XRP reserve pays for network ledgers.
- **NFC / Web Portal Access**: Recipients can check their dynamic balances (and local fiat equivalents) or transmit their stablecoins to local merchants simply by logging into a lightweight, mobile-responsive portal using a 4-digit PIN.
- **SMS Two-Way Fallback & Notifications**: In the event of an internet blackout in a crisis zone, recipients use integrated Twilio services to receive real-time disbursement alerts, check balances, and execute XRPL RLUSD transfers entirely via text messages.

## 🏗️ Project Architecture

This monorepo consists of the following isolated systems woven together:

### 1. `backend` / Server (Node.js & Express)
The central nervous system of the financial flow. Key responsibilities:
- Managing terminal checkout/dashboard sessions via `Socket.IO`.
- Integrating directly with the XRPL network to manage fiat representations, establishing trustlines, and dispatching stablecoin (RLUSD) payload atomic swaps.
- Housing an active SQLite/JSON persistence layer connecting XRPL records to HIDs.
- Parsing text commands over a Twilio Webhook to trigger on-chain transfers on demand.

### 2. `ragequit` / Web Client (Next.js 14)
The primary user-facing stack handling the distinct experiences for Donors, NGOs, and Recipients.
- Built using React, Next.js, and styled exclusively with Tailwind CSS in an industrial, glassmorphic aesthetic.
- Hooks into raw XRPL Transaction Hashes to allow immediate transaction verification across external Block Explorers.

## 🛠️ Technology Stack

- **Frontend**: Next.js, React, Tailwind CSS.
- **Backend**: Node.js, Express, Socket.IO.
- **Blockchain**: XRP Ledger (`xrpl-js`), Testnet Environments.
- **Telephony**: Twilio API Webhooks.

## 💻 Running the Project Locally

### Prerequisites
- Node.js (v18 or higher recommended)
- A Twilio Account (for the SMS webhook fallbacks)
- Environment variables configured (see `.env`)

### Environment Settings
Create a `.env` file at the root containing:
```
PHONENUM=YourPhoneWithoutCountryCode
TWILIO_ACCOUNT_SID=YourTwilioAccountSID
TWILIO_AUTH_TOKEN=YourTwilioAuthToken
```

### Starting the Backend Server
Start by running the root level express application:
```bash
npm install
node server.js
```

*(Once started, run `node seed-data.js` in a new terminal window to populate the system with mock users and donations).*

### Starting the Client Interface
Open a brand new terminal, and navigate to the `ragequit` frontend folder:
```bash
cd ragequit
npm install
npm run dev
```

You can then visit:
- **Donation Tracker**: `http://localhost:3000/`
- **NGO Dashboard**: `http://localhost:3000/dashboard`
- **Recipient Login**: `http://localhost:3000/portal`

## 📜 License

This project is licensed under the MIT License - see the LICENSE file for details. Built with ❤️ for HackKU26.
