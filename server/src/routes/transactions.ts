import { Router, Response } from "express";
import { authMiddleware, AuthenticatedRequest } from "../middleware/auth";
import { createTransaction, getUserTransactions } from "../services/transactionService";

const router = Router();

router.use(authMiddleware);

router.post("/", (req: AuthenticatedRequest, res: Response) => {
  const { recipient, amount, description, automated } = req.body;

  if (!recipient || !amount) {
    res.status(400).json({ error: "Recipient and amount are required" });
    return;
  }

  if (typeof amount !== "number" || amount <= 0) {
    res.status(400).json({ error: "Amount must be a positive number" });
    return;
  }

  const result = createTransaction(req.userId!, {
    recipient,
    amount,
    description,
    automated,
  });

  const statusCode = result.blocked ? 403 : 201;
  res.status(statusCode).json(result);
});

router.get("/", (req: AuthenticatedRequest, res: Response) => {
  const transactions = getUserTransactions(req.userId!);
  res.json({ transactions });
});

export default router;
