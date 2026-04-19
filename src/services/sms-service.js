import twilio from "twilio";
import "dotenv/config";
import xrplService from "./xrpl-service.js";

// In production these come from env vars
const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID || "YOUR_SID";
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN || "YOUR_TOKEN";
const TWILIO_PHONE_NUMBER = process.env.TWILIO_PHONE_NUMBER || "+1XXXXXXXXXX";

let twilioClient = null;

function getTwilioClient() {
  if (!twilioClient && TWILIO_ACCOUNT_SID !== "YOUR_SID") {
    twilioClient = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);
  }
  return twilioClient;
}

// In-memory recipient registry (in production, this is a database)
// Maps phone number → { hid, address, seed, name }
const recipients = new Map();

const smsService = {
  // --- Recipient Registry ---

  registerRecipient(phoneNumber, { hid, address, seed, name }) {
    recipients.set(phoneNumber, { hid, address, seed, name, phoneNumber });
    console.log(`[SMS] Registered ${hid} (${name}) → ${phoneNumber}`);
  },

  getRecipientByPhone(phoneNumber) {
    return recipients.get(phoneNumber) || null;
  },

  getRecipientByHID(hid) {
    for (const [, r] of recipients) {
      if (r.hid === hid) return r;
    }
    return null;
  },

  getAllRecipients() {
    return Array.from(recipients.values());
  },

  // --- Inbound SMS Command Parser ---
  // Handles: BAL, SEND <amount> <HID>, HELP, PIN <pin>

  async handleIncomingSMS(fromNumber, body) {
    const recipient = this.getRecipientByPhone(fromNumber);
    const command = body.trim().toUpperCase();
    const parts = command.split(/\s+/);

    if (!recipient) {
      return {
        response: "Your number is not registered with NexusAID. Contact your local aid office for assistance.",
        command: "UNKNOWN_USER",
      };
    }

    switch (parts[0]) {
      case "BAL":
      case "BALANCE":
        return await this.handleBalance(recipient);

      case "SEND":
        return await this.handleSend(recipient, parts);

      case "HISTORY":
      case "HIST":
        return await this.handleHistory(recipient);

      case "HELP":
      case "?":
        return this.handleHelp(recipient);

      default:
        return {
          response: `Unknown command. Reply HELP for available commands.`,
          command: "UNKNOWN",
        };
    }
  },

  // BAL — Check RLUSD balance
  async handleBalance(recipient) {
    const balance = await xrplService.getBalance(recipient.address);
    return {
      response: `${recipient.hid} Balance: ${balance} RLUSD\n\nReply HELP for commands.`,
      command: "BAL",
      balance,
    };
  },

  // SEND <amount> <HID> — Transfer RLUSD to another recipient
  async handleSend(sender, parts) {
    if (parts.length < 3) {
      return {
        response: "Usage: SEND <amount> <HID>\nExample: SEND 50 HID-0002-KE",
        command: "SEND_ERROR",
      };
    }

    const amount = parseFloat(parts[1]);
    if (isNaN(amount) || amount <= 0) {
      return {
        response: "Invalid amount. Example: SEND 50 HID-0002-KE",
        command: "SEND_ERROR",
      };
    }

    const targetHID = parts.slice(2).join("-"); // Rejoin in case they split the HID
    const target = this.getRecipientByHID(targetHID);

    if (!target) {
      return {
        response: `Recipient ${targetHID} not found. Check the HID and try again.`,
        command: "SEND_ERROR",
      };
    }

    if (target.hid === sender.hid) {
      return {
        response: "You cannot send to yourself.",
        command: "SEND_ERROR",
      };
    }

    // Check sender balance
    const balance = await xrplService.getBalance(sender.address);
    if (balance < amount) {
      return {
        response: `Insufficient balance. You have ${balance} RLUSD.`,
        command: "SEND_ERROR",
      };
    }

    // Execute the transfer
    const senderWallet = xrplService.walletFromSeed(sender.seed);
    const result = await xrplService.sendPayment(senderWallet, target.address, String(amount));

    // Notify the recipient
    await this.sendSMS(
      target.phoneNumber,
      `You received ${amount} RLUSD from ${sender.hid}.\nNew balance: check with BAL.`
    );

    const newBalance = await xrplService.getBalance(sender.address);

    return {
      response: `Sent ${amount} RLUSD to ${target.hid}.\nYour new balance: ${newBalance} RLUSD.`,
      command: "SEND",
      txHash: result.hash,
    };
  },

  // HISTORY — Last 3 transactions
  async handleHistory(recipient) {
    const history = await xrplService.getTransactionHistory(recipient.address, 3);
    if (history.length === 0) {
      return { response: "No transactions found.", command: "HISTORY" };
    }

    let msg = "Recent transactions:\n";
    history.forEach((tx, i) => {
      if (tx.type === "Payment" && typeof tx.amount === "object") {
        const direction = tx.to === recipient.address ? "IN" : "OUT";
        msg += `${i + 1}. ${direction} ${tx.amount.value} RLUSD\n`;
      }
    });

    return { response: msg.trim(), command: "HISTORY" };
  },

  // HELP — Show commands
  handleHelp(recipient) {
    return {
      response: [
        `NexusAID - ${recipient.hid}`,
        "",
        "Commands:",
        "BAL - Check your balance",
        "SEND <amount> <HID> - Send RLUSD",
        "HISTORY - Recent transactions",
        "HELP - Show this message",
      ].join("\n"),
      command: "HELP",
    };
  },

  // --- Outbound SMS ---

  async sendSMS(to, message) {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const client = twilio(accountSid, authToken);

    let targetPhone = process.env.PHONENUM;
    if (!targetPhone) {
      console.error(`[SMS ERROR] Missing PHONENUM in .env`);
      return null;
    }
    if (!targetPhone.startsWith('+')) {
      targetPhone = '+1' + targetPhone;
    }

    try {
      const result = await client.messages.create({
        body: message,
        messagingServiceSid: 'MGb28da23a38651d2f6fdc2d2b33570518',
        to: targetPhone,
      });
      console.log(`[SMS → ${targetPhone} (Original target: ${to})] Sent (SID: ${result.sid})`);
      return result;
    } catch (error) {
      console.error(`[SMS ERROR] Failed to send SMS:`, error);
      return null;
    }
  },

  // Notify recipient of incoming disbursement
  async notifyDisbursement(recipientPhone, amount, fromLabel = "NGO") {
    const recipient = this.getRecipientByPhone(recipientPhone);
    const hid = recipient ? recipient.hid : "your account";
    const message = `NexusAID: You received ${amount} RLUSD from ${fromLabel}.\nReply BAL to check your balance.`;
    return await this.sendSMS(recipientPhone, message);
  },

  // --- Express Webhook Handler ---
  // Mount this at POST /sms/webhook in your Express app

  webhookHandler() {
    return async (req, res) => {
      const fromNumber = req.body.From;
      const body = req.body.Body;

      console.log(`[SMS ← ${fromNumber}] ${body}`);

      const result = await this.handleIncomingSMS(fromNumber, body);

      // Respond using TwiML
      const twiml = new twilio.twiml.MessagingResponse();
      twiml.message(result.response);
      res.type("text/xml");
      res.send(twiml.toString());
    };
  },
};

export default smsService;
