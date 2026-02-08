import { Router, Request, Response } from "express";
import { getUserByUsername, encodeToken, getUser } from "../data/store";
import { authMiddleware, AuthenticatedRequest } from "../middleware/auth";

const router = Router();

router.post("/login", (req: Request, res: Response) => {
  const { username, password } = req.body;

  if (!username || !password) {
    res.status(400).json({ error: "Username and password are required" });
    return;
  }

  const user = getUserByUsername(username);
  if (!user) {
    res.status(401).json({ error: "Invalid credentials" });
    return;
  }

  // Mock auth — accept any password for demo user
  if (username === "demo" && password === "demo123") {
    const token = encodeToken(user.id);

    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        fullName: user.fullName,
        accountNumber: user.accountNumber,
      },
    });
    return;
  }

  res.status(401).json({ error: "Invalid credentials" });
});

router.get(
  "/me",
  authMiddleware,
  (req: AuthenticatedRequest, res: Response) => {
    const user = getUser(req.userId!);
    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }
    res.json({
      id: user.id,
      username: user.username,
      fullName: user.fullName,
      balance: user.balance,
      accountNumber: user.accountNumber,
    });
  }
);

export default router;
