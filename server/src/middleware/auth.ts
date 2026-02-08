import { Request, Response, NextFunction } from "express";
import { getUserIdByToken, getUser } from "../data/store";

export interface AuthenticatedRequest extends Request {
  userId?: string;
}

export function authMiddleware(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({ error: "Missing or invalid authorization header" });
    return;
  }

  const token = authHeader.slice(7);
  const userId = getUserIdByToken(token);

  if (!userId) {
    res.status(401).json({ error: "Invalid or expired token" });
    return;
  }

  const user = getUser(userId);
  if (!user) {
    res.status(401).json({ error: "User not found" });
    return;
  }

  req.userId = userId;
  next();
}
