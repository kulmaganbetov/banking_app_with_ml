import express from "express";
import cors from "cors";
import authRouter from "./routes/auth";
import transactionsRouter from "./routes/transactions";
import securityRouter from "./routes/security";
import { seedTransactions } from "./data/seed";

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", authRouter);
app.use("/api/transactions", transactionsRouter);
app.use("/api/security", securityRouter);

// Health check
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", service: "SecureBank API" });
});

// Seed demo data
seedTransactions();

app.listen(PORT, () => {
  console.log(`SecureBank API running on port ${PORT}`);
});

export default app;
