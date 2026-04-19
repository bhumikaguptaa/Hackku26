import xrpl from "xrpl";
import xrplService, { CURRENCY_CODE } from "./xrpl-service.js";

// Simulated exchange rate (in production, this comes from a real price feed)
const XRP_TO_USD_RATE = 2.15;

const onrampService = {
  // Simulate a fiat donor deposit: donor sends fiat → system converts to RLUSD
  // In production: fiat hits on-ramp partner (MoonPay, etc) → XRP → DEX → RLUSD
  // For demo: we simulate the fiat part and do the XRPL part for real
  async simulateDonation({ donorName, fiatAmount, fiatCurrency, recipientAddress }) {
    await xrplService.ensureConnected();

    const rlusdAmount = convertFiatToRLUSD(fiatAmount, fiatCurrency);

    console.log(`[ONRAMP] Donation from ${donorName}: ${fiatAmount} ${fiatCurrency}`);
    console.log(`[ONRAMP] Converted: ${rlusdAmount} RLUSD (rate: 1 XRP = $${XRP_TO_USD_RATE})`);

    // Issue RLUSD from gateway to recipient (simulating the full on-ramp + DEX flow)
    const result = await xrplService.issueRLUSD(recipientAddress, rlusdAmount);

    return {
      donorName,
      fiatAmount,
      fiatCurrency,
      rlusdAmount,
      exchangeRate: XRP_TO_USD_RATE,
      txHash: result.hash,
      explorerUrl: result.explorerUrl,
      timestamp: new Date().toISOString(),
    };
  },

  // Place a DEX offer: Gateway sells RLUSD for XRP (provides liquidity)
  // This creates an order on XRPL's built-in decentralized exchange
  async createDEXOffer(rlusdAmount, xrpPerUnit) {
    await xrplService.ensureConnected();

    const takerGetsDrops = xrpl.xrpToDrops(String(parseFloat(rlusdAmount) / xrpPerUnit));

    const tx = {
      TransactionType: "OfferCreate",
      Account: xrplService.gatewayWallet.address,
      // Gateway is selling RLUSD (taker gets RLUSD)
      TakerGets: {
        currency: CURRENCY_CODE,
        issuer: xrplService.gatewayWallet.address,
        value: String(rlusdAmount),
      },
      // Gateway wants XRP in return (taker pays XRP)
      TakerPays: takerGetsDrops,
    };

    const prepared = await xrplService.client.autofill(tx);
    const signed = xrplService.gatewayWallet.sign(prepared);
    const result = await xrplService.client.submitAndWait(signed.tx_blob);

    if (result.result.meta.TransactionResult !== "tesSUCCESS") {
      throw new Error(`DEX offer failed: ${result.result.meta.TransactionResult}`);
    }

    console.log(`[ONRAMP] DEX offer created: ${rlusdAmount} RLUSD for ${xrpl.dropsToXrp(takerGetsDrops)} XRP`);

    return {
      hash: signed.hash,
      explorerUrl: `https://testnet.xrpl.org/transactions/${signed.hash}`,
    };
  },

  // Execute a DEX swap: donor wallet sends XRP, receives RLUSD via the DEX
  async swapXRPtoRLUSD(donorWallet, xrpAmount) {
    await xrplService.ensureConnected();

    const expectedRLUSD = (parseFloat(xrpAmount) * XRP_TO_USD_RATE).toFixed(2);

    // Cross-currency payment: send XRP, deliver RLUSD
    const tx = {
      TransactionType: "Payment",
      Account: donorWallet.address,
      Destination: donorWallet.address, // Send to self (swap)
      DestinationTag: 1,
      DeliverMax: {
        currency: CURRENCY_CODE,
        issuer: xrplService.gatewayWallet.address,
        value: expectedRLUSD,
      },
      SendMax: xrpl.xrpToDrops(String(parseFloat(xrpAmount) * 1.05)), // 5% slippage buffer
      Flags: xrpl.PaymentFlags.tfPartialPayment,
    };

    const prepared = await xrplService.client.autofill(tx);
    const signed = donorWallet.sign(prepared);
    const result = await xrplService.client.submitAndWait(signed.tx_blob);

    if (result.result.meta.TransactionResult !== "tesSUCCESS") {
      throw new Error(`DEX swap failed: ${result.result.meta.TransactionResult}`);
    }

    // Get actual delivered amount from metadata
    const delivered = result.result.meta.delivered_amount;
    const actualRLUSD = typeof delivered === "object" ? delivered.value : "0";

    console.log(`[ONRAMP] DEX swap: ${xrpAmount} XRP → ${actualRLUSD} RLUSD`);

    return {
      xrpSpent: xrpAmount,
      rlusdReceived: actualRLUSD,
      hash: signed.hash,
      explorerUrl: `https://testnet.xrpl.org/transactions/${signed.hash}`,
    };
  },

  // Simulate full donor flow: donate fiat → on-ramp → disburse to NGO
  async processDonation({ donorName, fiatAmount, fiatCurrency }) {
    const rlusdAmount = convertFiatToRLUSD(fiatAmount, fiatCurrency);

    // Issue RLUSD to the NGO wallet (simulating on-ramp → gateway → NGO)
    const result = await xrplService.issueRLUSD(
      xrplService.ngoWallet.address,
      rlusdAmount
    );

    console.log(`[ONRAMP] Donation processed: ${fiatAmount} ${fiatCurrency} → ${rlusdAmount} RLUSD → NGO`);

    return {
      donorName,
      fiatAmount,
      fiatCurrency,
      rlusdAmount,
      exchangeRate: getExchangeRate(fiatCurrency),
      txHash: result.hash,
      explorerUrl: result.explorerUrl,
      timestamp: new Date().toISOString(),
    };
  },
};

// --- Helpers ---

function getExchangeRate(fiatCurrency) {
  const rates = {
    USD: 1.0,
    EUR: 1.08,
    GBP: 1.26,
    KES: 0.0077, // Kenyan Shilling
    NGN: 0.00062, // Nigerian Naira
    INR: 0.012, // Indian Rupee
  };
  return rates[fiatCurrency] || 1.0;
}

function convertFiatToRLUSD(amount, currency) {
  const rate = getExchangeRate(currency);
  return (parseFloat(amount) * rate).toFixed(2);
}

export default onrampService;
export { convertFiatToRLUSD, getExchangeRate, XRP_TO_USD_RATE };
