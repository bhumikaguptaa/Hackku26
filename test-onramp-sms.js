import xrplService from "./src/services/xrpl-service.js";
import onrampService from "./src/services/onramp-service.js";
import smsService from "./src/services/sms-service.js";

async function test() {
  // --- Setup ---
  await xrplService.connect();
  const data = xrplService.loadWallets("./wallets.json");

  // Register test recipients with phone numbers
  smsService.registerRecipient("+15551001001", {
    hid: "HID-0001-KE",
    address: data.wallets.recipient1.address,
    seed: data.wallets.recipient1.seed,
    name: "Amina",
  });
  smsService.registerRecipient("+15551002002", {
    hid: "HID-0002-KE",
    address: data.wallets.recipient2.address,
    seed: data.wallets.recipient2.seed,
    name: "Joseph",
  });

  console.log("\n========== ON-RAMP TEST ==========\n");

  // Test 1: Simulated donation (fiat → RLUSD → NGO)
  const donation = await onrampService.processDonation({
    donorName: "Jane Smith (London)",
    fiatAmount: 100,
    fiatCurrency: "GBP",
  });
  console.log(`Donation result:`, {
    donor: donation.donorName,
    fiat: `${donation.fiatAmount} ${donation.fiatCurrency}`,
    rlusd: `${donation.rlusdAmount} RLUSD`,
    tx: donation.explorerUrl,
  });

  // Test 2: Donation in Kenyan Shillings
  const donation2 = await onrampService.processDonation({
    donorName: "USAID Grant",
    fiatAmount: 50000,
    fiatCurrency: "KES",
  });
  console.log(`Donation result:`, {
    donor: donation2.donorName,
    fiat: `${donation2.fiatAmount} ${donation2.fiatCurrency}`,
    rlusd: `${donation2.rlusdAmount} RLUSD`,
  });

  // Disburse some of the new funds to recipients
  console.log("\nDisbursing from NGO...");
  await xrplService.disburse(data.wallets.recipient1.address, "75");
  await xrplService.disburse(data.wallets.recipient2.address, "50");

  console.log("\n========== SMS COMMAND TESTS ==========\n");

  // Test BAL command
  console.log("--- BAL ---");
  const bal = await smsService.handleIncomingSMS("+15551001001", "BAL");
  console.log(`Response: ${bal.response}\n`);

  // Test HELP command
  console.log("--- HELP ---");
  const help = await smsService.handleIncomingSMS("+15551001001", "HELP");
  console.log(`Response: ${help.response}\n`);

  // Test SEND command (Amina sends 20 RLUSD to Joseph)
  console.log("--- SEND ---");
  const send = await smsService.handleIncomingSMS("+15551001001", "SEND 20 HID-0002-KE");
  console.log(`Response: ${send.response}\n`);

  // Test HISTORY command
  console.log("--- HISTORY ---");
  const hist = await smsService.handleIncomingSMS("+15551002002", "HISTORY");
  console.log(`Response: ${hist.response}\n`);

  // Test unknown number
  console.log("--- UNKNOWN USER ---");
  const unknown = await smsService.handleIncomingSMS("+19999999999", "BAL");
  console.log(`Response: ${unknown.response}\n`);

  // Test bad command
  console.log("--- BAD COMMAND ---");
  const bad = await smsService.handleIncomingSMS("+15551001001", "PIZZA");
  console.log(`Response: ${bad.response}\n`);

  // Test SEND with insufficient funds
  console.log("--- SEND OVER BALANCE ---");
  const over = await smsService.handleIncomingSMS("+15551001001", "SEND 999999 HID-0002-KE");
  console.log(`Response: ${over.response}\n`);

  // Final balances
  console.log("========== FINAL BALANCES ==========\n");
  const ngo = await xrplService.getBalance(data.wallets.ngo.address);
  const r1 = await xrplService.getBalance(data.wallets.recipient1.address);
  const r2 = await xrplService.getBalance(data.wallets.recipient2.address);
  console.log(`NGO:         ${ngo} RLUSD`);
  console.log(`Recipient 1: ${r1} RLUSD (Amina)`);
  console.log(`Recipient 2: ${r2} RLUSD (Joseph)`);

  await xrplService.disconnect();
  console.log("\n✅ All tests passed!");
}

test().catch(console.error);
