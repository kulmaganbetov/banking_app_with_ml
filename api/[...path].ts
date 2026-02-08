// Vercel Serverless Function — catch-all handler that delegates to Express
import app from "../server/src/index";
import type { VercelRequest, VercelResponse } from "@vercel/node";

export default function handler(req: VercelRequest, res: VercelResponse) {
  return app(req, res);
}
