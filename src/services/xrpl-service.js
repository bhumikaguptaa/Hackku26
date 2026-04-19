import xrpl from "xrpl";
import fs from "fs";
import { EventEmitter } from "events";

const SERVER_URL = "wss://s.altnet.rippletest.net:51233/";
const CURRENCY_CODE = "USD";

class XRPLService extends EventEmitter {
  constructor() {
    super();
    this.client = new xrpl.Client(SERVER_URL);
    this.connected = false;
    this.gatewayWallet = null;
    this.ngoWallet = null;
  }

  // --- Connection ---

  async connect() {
    if (this.connected) return;
    await this.client.connect();
    this.connected = true;
    console.log("[XRPL] Connected to Testnet");
  }

  async disconnect() {
    if (!this.connected) return;
    await this.client.disconnect();
    this.connected = false;
    console.log("[XRPL] Disconnected");
  }

  // Load gateway + NGO wallets from the saved wallets.json
  loadWallets(path = "./wallets.json") {
    const data = JSON.parse(fs.readFileSync(path, "utf8"));
    this.gatewayWallet = xrpl.Wallet.fromSeed(data.wallets.gateway.seed);
    this.ngoWallet = xrpl.Wallet.fromSeed(data.wallets.ngo.seed);
    console.log(`[XRPL] Gateway loaded: ${this.gatewayWallet.address}`);
    console.log(`[XRPL] NGO loaded:     ${this.ngoWallet.address}`);
    return data;
  }

  // --- Wallet Creation ---

  // Create a new funded wallet on testnet (uses faucet)
  async createFundedWallet() {
    await this.ensureConnected();
    const result = await this.client.fundWallet();
    console.log(`[XRPL] Wallet created: ${result.wallet.address}`);
    return result.wallet;
  }

  // Create a recipient wallet with trust line automatically set up
  // Returns { wallet, address, seed, trustLineTxHash }
  async createRecipientWallet() {
    await this.ensureConnected();

    const wallet = await this.createFundedWallet();
    const trustLineTx = await this.createTrustLine(wallet);

    return {
      wallet,
      address: wallet.address,
      seed: wallet.seed,
      trustLineTxHash: trustLineTx.hash,
    };
  }

  // Restore a wallet from a saved seed string
  walletFromSeed(seed) {
    return xrpl.Wallet.fromSeed(seed);
  }

  // --- Trust Lines ---

  // Create a trust line from a wallet to the gateway for RLUSD
  async createTrustLine(wallet, limit = "1000000000") {
    await this.ensureConnected();

    const tx = {
      TransactionType: "TrustSet",
      Account: wallet.address,
      LimitAmount: {
        currency: CURRENCY_CODE,
        issuer: this.gatewayWallet.address,
        value: limit,
      },
    };

    const result = await this.submitTx(wallet, tx);
    console.log(`[XRPL] Trust line created for ${wallet.address}`);
    return result;
  }

  // Check if a wallet already has a trust line to the gateway
  async hasTrustLine(address) {
    await this.ensureConnected();

    const response = await this.client.request({
      command: "account_lines",
      account: address,
      ledger_index: "validated",
    });

    return response.result.lines.some(
      (line) =>
        line.currency === CURRENCY_CODE &&
        line.account === this.gatewayWallet.address
    );
  }

  // --- Payments ---

  // Issue RLUSD from gateway to a destination (mints new tokens)
  async issueRLUSD(destinationAddress, amount) {
    await this.ensureConnected();

    const tx = {
      TransactionType: "Payment",
      Account: this.gatewayWallet.address,
      Destination: destinationAddress,
      DestinationTag: 1,
      DeliverMax: {
        currency: CURRENCY_CODE,
        value: String(amount),
        issuer: this.gatewayWallet.address,
      },
    };

    const result = await this.submitTx(this.gatewayWallet, tx);
    console.log(`[XRPL] Issued ${amount} RLUSD → ${destinationAddress}`);
    return result;
  }

  // Send RLUSD from NGO wallet to a recipient (disbursement)
  async disburse(destinationAddress, amount) {
    await this.ensureConnected();

    const tx = {
      TransactionType: "Payment",
      Account: this.ngoWallet.address,
      Destination: destinationAddress,
      DestinationTag: 1,
      DeliverMax: {
        currency: CURRENCY_CODE,
        value: String(amount),
        issuer: this.gatewayWallet.address,
      },
    };

    const result = await this.submitTx(this.ngoWallet, tx);
    console.log(`[XRPL] Disbursed ${amount} RLUSD → ${destinationAddress}`);
    return result;
  }

  // Send RLUSD from any wallet to any other wallet (generic transfer)
  async sendPayment(fromWallet, destinationAddress, amount) {
    await this.ensureConnected();

    const tx = {
      TransactionType: "Payment",
      Account: fromWallet.address,
      Destination: destinationAddress,
      DestinationTag: 1,
      DeliverMax: {
        currency: CURRENCY_CODE,
        value: String(amount),
        issuer: this.gatewayWallet.address,
      },
    };

    const result = await this.submitTx(fromWallet, tx);
    console.log(`[XRPL] Sent ${amount} RLUSD: ${fromWallet.address} → ${destinationAddress}`);
    return result;
  }

  // --- Balance Queries ---

  // Get RLUSD balance for a single address
  async getBalance(address) {
    await this.ensureConnected();

    const response = await this.client.request({
      command: "account_lines",
      account: address,
      ledger_index: "validated",
    });

    const line = response.result.lines.find(
      (l) =>
        l.currency === CURRENCY_CODE &&
        l.account === this.gatewayWallet.address
    );

    return line ? parseFloat(line.balance) : 0;
  }

  // Get XRP balance for an address
  async getXRPBalance(address) {
    await this.ensureConnected();

    const response = await this.client.request({
      command: "account_info",
      account: address,
      ledger_index: "validated",
    });

    return xrpl.dropsToXrp(response.result.account_data.Balance);
  }

  // Get total issued RLUSD from gateway's perspective
  async getGatewayBalances() {
    await this.ensureConnected();

    const response = await this.client.request({
      command: "gateway_balances",
      account: this.gatewayWallet.address,
      ledger_index: "validated",
      hotwallet: [this.ngoWallet.address],
    });

    return {
      obligations: response.result.obligations || {},
      ngoHoldings: response.result.balances || {},
    };
  }

  // Get transaction history for an address
  async getTransactionHistory(address, limit = 20) {
    await this.ensureConnected();

    const response = await this.client.request({
      command: "account_tx",
      account: address,
      ledger_index_min: -1,
      ledger_index_max: -1,
      limit,
    });

    return response.result.transactions.map((tx) => ({
      hash: tx.tx_json?.hash || tx.hash,
      type: tx.tx_json?.TransactionType,
      from: tx.tx_json?.Account,
      to: tx.tx_json?.Destination,
      amount: tx.tx_json?.DeliverMax || tx.tx_json?.Amount,
      date: tx.tx_json?.date
        ? xrpl.rippleTimeToISOTime(tx.tx_json.date)
        : null,
      result: tx.meta?.TransactionResult,
    }));
  }

  // --- Ledger Subscription (Real-time Events) ---

  // Subscribe to transactions on specific accounts
  // Emits: "payment" event when RLUSD is received by a watched account
  async subscribeToAccounts(addresses) {
    await this.ensureConnected();

    await this.client.request({
      command: "subscribe",
      accounts: addresses,
    });

    console.log(`[XRPL] Subscribed to ${addresses.length} account(s)`);

    this.client.on("transaction", (event) => {
      const tx = event.transaction || event.tx_json;
      if (!tx) return;

      if (tx.TransactionType === "Payment" && event.validated) {
        const amount = tx.DeliverMax || tx.Amount;
        const isRLUSD =
          typeof amount === "object" &&
          amount.currency === CURRENCY_CODE &&
          amount.issuer === this.gatewayWallet.address;

        if (isRLUSD) {
          const paymentData = {
            hash: tx.hash || event.hash,
            from: tx.Account,
            to: tx.Destination,
            amount: amount.value,
            currency: CURRENCY_CODE,
            timestamp: new Date().toISOString(),
          };

          this.emit("payment", paymentData);
          console.log(`[XRPL] Payment detected: ${amount.value} RLUSD ${tx.Account} → ${tx.Destination}`);
        }
      }
    });
  }

  // Subscribe to ledger close events
  async subscribeToLedger() {
    await this.ensureConnected();

    await this.client.request({
      command: "subscribe",
      streams: ["ledger"],
    });

    this.client.on("ledgerClosed", (ledger) => {
      this.emit("ledger", {
        index: ledger.ledger_index,
        hash: ledger.ledger_hash,
        txCount: ledger.txn_count,
        closeTime: ledger.ledger_time,
      });
    });

    console.log("[XRPL] Subscribed to ledger events");
  }

  // --- Internal Helpers ---

  async ensureConnected() {
    if (!this.connected) await this.connect();
  }

  async submitTx(wallet, tx) {
    const prepared = await this.client.autofill(tx);
    const signed = wallet.sign(prepared);
    const result = await this.client.submitAndWait(signed.tx_blob);

    if (result.result.meta.TransactionResult !== "tesSUCCESS") {
      throw new Error(
        `Transaction failed: ${result.result.meta.TransactionResult}`
      );
    }

    return {
      hash: signed.hash,
      result: result.result.meta.TransactionResult,
      explorerUrl: `https://testnet.xrpl.org/transactions/${signed.hash}`,
    };
  }
}

// Export a singleton instance
const xrplService = new XRPLService();
export default xrplService;
export { XRPLService, CURRENCY_CODE, SERVER_URL };
