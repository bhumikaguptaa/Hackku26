import xrpl from "xrpl";
import fs from "fs";

const SERVER_URL = "wss://s.altnet.rippletest.net:51233/";
const CURRENCY_CODE = "USD"; // Simulating RLUSD on testnet

async function main() {
  // Connect to XRPL Testnet
  console.log("🔌 Connecting to XRPL Testnet...");
  const client = new xrpl.Client(SERVER_URL);
  await client.connect();
  console.log("✅ Connected!\n");

  // Create and fund 4 wallets
  console.log("💰 Creating Gateway wallet (RLUSD issuer)...");
  const gatewayFund = await client.fundWallet();
  const gatewayWallet = gatewayFund.wallet;
  console.log(`   Address: ${gatewayWallet.address}`);
  console.log(`   Explorer: https://testnet.xrpl.org/accounts/${gatewayWallet.address}\n`);

  console.log("💰 Creating NGO wallet...");
  const ngoFund = await client.fundWallet();
  const ngoWallet = ngoFund.wallet;
  console.log(`   Address: ${ngoWallet.address}\n`);

  console.log("💰 Creating Recipient 1 wallet...");
  const recipient1Fund = await client.fundWallet();
  const recipient1Wallet = recipient1Fund.wallet;
  console.log(`   Address: ${recipient1Wallet.address}\n`);

  console.log("💰 Creating Recipient 2 wallet...");
  const recipient2Fund = await client.fundWallet();
  const recipient2Wallet = recipient2Fund.wallet;
  console.log(`   Address: ${recipient2Wallet.address}\n`);

  // Configure Gateway as token issuer (enable DefaultRipple)
  console.log("⚙️  Configuring Gateway as token issuer...");
  const gatewaySettingsTx = {
    TransactionType: "AccountSet",
    Account: gatewayWallet.address,
    SetFlag: xrpl.AccountSetAsfFlags.asfDefaultRipple,
    Flags:
      xrpl.AccountSetTfFlags.tfDisallowXRP |
      xrpl.AccountSetTfFlags.tfRequireDestTag,
  };
  const gatewayPrepared = await client.autofill(gatewaySettingsTx);
  const gatewaySigned = gatewayWallet.sign(gatewayPrepared);
  const gatewayResult = await client.submitAndWait(gatewaySigned.tx_blob);

  if (gatewayResult.result.meta.TransactionResult === "tesSUCCESS") {
    console.log(`✅ Gateway configured! Tx: https://testnet.xrpl.org/transactions/${gatewaySigned.hash}\n`);
  } else {
    throw `❌ Failed: ${gatewayResult.result.meta.TransactionResult}`;
  }

  // Create trust lines (NGO, Recipient1, Recipient2 → Gateway)
  const trustLineWallets = [
    { name: "NGO", wallet: ngoWallet },
    { name: "Recipient 1", wallet: recipient1Wallet },
    { name: "Recipient 2", wallet: recipient2Wallet },
  ];

  for (const { name, wallet } of trustLineWallets) {
    console.log(`🔗 Creating trust line: ${name} → Gateway for ${CURRENCY_CODE}...`);
    const trustSetTx = {
      TransactionType: "TrustSet",
      Account: wallet.address,
      LimitAmount: {
        currency: CURRENCY_CODE,
        issuer: gatewayWallet.address,
        value: "1000000000",
      },
    };
    const tsPrepared = await client.autofill(trustSetTx);
    const tsSigned = wallet.sign(tsPrepared);
    const tsResult = await client.submitAndWait(tsSigned.tx_blob);

    if (tsResult.result.meta.TransactionResult === "tesSUCCESS") {
      console.log(`✅ ${name} trust line created!\n`);
    } else {
      throw `❌ Failed for ${name}: ${tsResult.result.meta.TransactionResult}`;
    }
  }

  // Issue RLUSD: Gateway → NGO (10,000)
  console.log("💸 Issuing 10,000 RLUSD: Gateway → NGO...");
  const issueTx = {
    TransactionType: "Payment",
    Account: gatewayWallet.address,
    Destination: ngoWallet.address,
    DestinationTag: 1,
    DeliverMax: {
      currency: CURRENCY_CODE,
      value: "10000",
      issuer: gatewayWallet.address,
    },
  };
  const issuePrepared = await client.autofill(issueTx);
  const issueSigned = gatewayWallet.sign(issuePrepared);
  const issueResult = await client.submitAndWait(issueSigned.tx_blob);

  if (issueResult.result.meta.TransactionResult === "tesSUCCESS") {
    console.log(`✅ 10,000 RLUSD issued to NGO!\n`);
  } else {
    throw `❌ Failed: ${issueResult.result.meta.TransactionResult}`;
  }

  // Disburse aid: NGO → Recipients
  const disbursements = [
    { name: "Recipient 1", wallet: recipient1Wallet, amount: "500" },
    { name: "Recipient 2", wallet: recipient2Wallet, amount: "250" },
  ];

  for (const { name, wallet, amount } of disbursements) {
    console.log(`💸 NGO disbursing ${amount} RLUSD → ${name}...`);
    const payTx = {
      TransactionType: "Payment",
      Account: ngoWallet.address,
      Destination: wallet.address,
      DestinationTag: 1,
      DeliverMax: {
        currency: CURRENCY_CODE,
        value: amount,
        issuer: gatewayWallet.address,
      },
    };
    const payPrepared = await client.autofill(payTx);
    const paySigned = ngoWallet.sign(payPrepared);
    const payResult = await client.submitAndWait(paySigned.tx_blob);

    if (payResult.result.meta.TransactionResult === "tesSUCCESS") {
      console.log(`✅ ${amount} RLUSD sent to ${name}!\n`);
    } else {
      throw `❌ Failed for ${name}: ${payResult.result.meta.TransactionResult}`;
    }
  }

  // Verify balances
  console.log("📊 Checking balances...\n");
  const allWallets = [
    { name: "NGO", wallet: ngoWallet },
    { name: "Recipient 1", wallet: recipient1Wallet },
    { name: "Recipient 2", wallet: recipient2Wallet },
  ];

  for (const { name, wallet } of allWallets) {
    const lines = await client.request({
      command: "account_lines",
      account: wallet.address,
      ledger_index: "validated",
    });
    const balance =
      lines.result.lines.find(
        (l) => l.currency === CURRENCY_CODE && l.account === gatewayWallet.address
      )?.balance || "0";
    console.log(`   ${name}: ${balance} RLUSD`);
  }

  // Save wallet credentials
  const credentials = {
    network: "testnet",
    server: SERVER_URL,
    currencyCode: CURRENCY_CODE,
    createdAt: new Date().toISOString(),
    wallets: {
      gateway: {
        role: "Token Issuer (Cold Wallet)",
        address: gatewayWallet.address,
        seed: gatewayWallet.seed,
        publicKey: gatewayWallet.publicKey,
      },
      ngo: {
        role: "NGO Operations (Hot Wallet)",
        address: ngoWallet.address,
        seed: ngoWallet.seed,
        publicKey: ngoWallet.publicKey,
      },
      recipient1: {
        role: "Test Recipient — HID-0001-KE",
        address: recipient1Wallet.address,
        seed: recipient1Wallet.seed,
        publicKey: recipient1Wallet.publicKey,
      },
      recipient2: {
        role: "Test Recipient — HID-0002-KE",
        address: recipient2Wallet.address,
        seed: recipient2Wallet.seed,
        publicKey: recipient2Wallet.publicKey,
      },
    },
  };

  fs.writeFileSync("wallets.json", JSON.stringify(credentials, null, 2));
  console.log("\n💾 Saved to wallets.json");

  await client.disconnect();
  console.log("🔌 Disconnected.");
}

main().catch(console.error);
