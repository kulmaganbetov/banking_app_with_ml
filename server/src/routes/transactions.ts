import { Router, Response } from "express";
import { authMiddleware, AuthenticatedRequest } from "../middleware/auth";
import { createTransaction, getUserTransactions } from "../services/transactionService";
import type { TransferType } from "../types";

const router = Router();

router.use(authMiddleware);

router.post("/", (req: AuthenticatedRequest, res: Response) => {
  const { fromAccountId, toAccountId, transferType, recipient, amount, description, automated, deviceId } = req.body;

  if (!fromAccountId || !recipient || !amount || !transferType) {
    res.status(400).json({ error: "fromAccountId, recipient, amount, and transferType are required" });
    return;
  }

  if (typeof amount !== "number" || amount <= 0) {
    res.status(400).json({ error: "Amount must be a positive number" });
    return;
  }

  const result = createTransaction(req.userId!, {
    fromAccountId,
    toAccountId,
    transferType: transferType as TransferType,
    recipient,
    amount,
    description,
    automated,
    deviceId,
  });

  const statusCode = result.blocked ? 403 : 201;
  res.status(statusCode).json(result);
});

router.get("/", (req: AuthenticatedRequest, res: Response) => {
  const transactions = getUserTransactions(req.userId!);
  res.json({ transactions });
});

export default router;
