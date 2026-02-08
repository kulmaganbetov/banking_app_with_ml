import { Router, Response } from "express";
import { authMiddleware, AuthenticatedRequest } from "../middleware/auth";
import { fetchSecurityLogs, getSecurityStatus } from "../services/transactionService";

const router = Router();

router.use(authMiddleware);

router.get("/logs", (_req: AuthenticatedRequest, res: Response) => {
  const logs = fetchSecurityLogs();
  res.json({ logs });
});

router.get("/status", (req: AuthenticatedRequest, res: Response) => {
  const status = getSecurityStatus(req.userId!);
  res.json(status);
});

export default router;
