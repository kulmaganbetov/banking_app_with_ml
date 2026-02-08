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
  res.json({ status: "ok", service: "Sentra Bank API" });
});

// Seed demo data
seedTransactions();

// Only listen when running standalone (not in Vercel serverless)
if (process.env.VERCEL !== "1") {
  app.listen(PORT, () => {
    console.log(`Sentra Bank API running on port ${PORT}`);
  });
}

export default app;
