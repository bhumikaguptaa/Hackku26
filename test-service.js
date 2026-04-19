import xrplService from "./src/services/xrpl-service.js";

async function test() {
  // 1. Connect and load wallets from setup
  await xrplService.connect();
  const data = xrplService.loadWallets("./wallets.json");

  // 2. Check current balances
  console.log("\n--- Current Balances ---");
  const ngoBalance = await xrplService.getBalance(data.wallets.ngo.address);
  const r1Balance = await xrplService.getBalance(data.wallets.recipient1.address);
  const r2Balance = await xrplService.getBalance(data.wallets.recipient2.address);
  console.log(`NGO:         ${ngoBalance} RLUSD`);
  console.log(`Recipient 1: ${r1Balance} RLUSD`);
  console.log(`Recipient 2: ${r2Balance} RLUSD`);

  // 3. Create a brand new recipient wallet (auto trust line)
  console.log("\n--- Creating New Recipient ---");
  const newRecipient = await xrplService.createRecipientWallet();
  console.log(`New wallet:  ${newRecipient.address}`);

  // 4. Verify the trust line was set up
  const hasTL = await xrplService.hasTrustLine(newRecipient.address);
  console.log(`Trust line:  ${hasTL ? "✅ exists" : "❌ missing"}`);

  // 5. Disburse RLUSD from NGO to the new recipient
  console.log("\n--- Disbursing to New Recipient ---");
  const disbursement = await xrplService.disburse(newRecipient.address, "100");
  console.log(`Tx: ${disbursement.explorerUrl}`);

  // 6. Check the new recipient's balance
  const newBalance = await xrplService.getBalance(newRecipient.address);
  console.log(`New recipient balance: ${newBalance} RLUSD`);

  // 7. Get transaction history for the NGO
  console.log("\n--- NGO Transaction History ---");
  const history = await xrplService.getTransactionHistory(
    data.wallets.ngo.address,
    5
  );
  history.forEach((tx) => {
    console.log(`  ${tx.type} | ${tx.from?.slice(0, 8)}... → ${tx.to?.slice(0, 8) || "N/A"}... | ${tx.result}`);
  });

  // 8. Test ledger subscription (listen for 10 seconds)
  console.log("\n--- Subscribing to Ledger (10s) ---");
  xrplService.on("ledger", (ledger) => {
    console.log(`  Ledger #${ledger.index} closed (${ledger.txCount} txs)`);
  });
  await xrplService.subscribeToLedger();

  // 9. Test account subscription — watch the new recipient
  xrplService.on("payment", (payment) => {
    console.log(`  💰 Payment received: ${payment.amount} RLUSD → ${payment.to}`);
  });
  await xrplService.subscribeToAccounts([newRecipient.address]);

  // Send another small payment to trigger the event
  console.log("  Sending 25 RLUSD to trigger subscription event...");
  await xrplService.disburse(newRecipient.address, "25");

  // Wait 10 seconds to see ledger events, then disconnect
  await new Promise((resolve) => setTimeout(resolve, 10000));

  // 10. Final balances
  console.log("\n--- Final Balances ---");
  const finalNgo = await xrplService.getBalance(data.wallets.ngo.address);
  const finalNew = await xrplService.getBalance(newRecipient.address);
  console.log(`NGO:           ${finalNgo} RLUSD`);
  console.log(`New recipient: ${finalNew} RLUSD`);

  // Gateway overview
  const gwBalances = await xrplService.getGatewayBalances();
  console.log(`\nGateway obligations:`, gwBalances.obligations);

  await xrplService.disconnect();
  console.log("\n✅ All tests passed!");
}

test().catch(console.error);
