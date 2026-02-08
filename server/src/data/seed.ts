import { createTransaction } from "../services/transactionService";

export function seedTransactions(): void {
  const userId = "user-001";

  // Normal transactions
  createTransaction(userId, {
    recipient: "Almaty Electric Co.",
    amount: 15_200,
    description: "Monthly electricity bill",
  });

  createTransaction(userId, {
    recipient: "KazTelecom",
    amount: 8_500,
    description: "Internet subscription",
  });

  createTransaction(userId, {
    recipient: "Nazarbayev University",
    amount: 450_000,
    description: "Tuition fee installment",
  });

  createTransaction(userId, {
    recipient: "Glovo KZ",
    amount: 4_200,
    description: "Food delivery",
  });

  createTransaction(userId, {
    recipient: "Kaspi Магазин",
    amount: 32_000,
    description: "Electronics purchase",
  });

  // Suspicious transactions (will trigger ML detection)
  createTransaction(userId, {
    recipient: "Unknown Account X-8832",
    amount: 1_200_000,
    description: "Wire transfer",
    automated: true,
  });

  createTransaction(userId, {
    recipient: "CryptoWallet-anon-991",
    amount: 750_000,
    description: "Urgent transfer",
    automated: true,
  });

  createTransaction(userId, {
    recipient: "OffshoreHoldings-334",
    amount: 950_000,
    description: "Investment transfer",
    automated: true,
  });
}
