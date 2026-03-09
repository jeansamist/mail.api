import cors from "cors";
import "dotenv/config";
import express from "express";
import { createAnalyticsRouter } from "./router";
import { SmtpConfig } from "./types";

// ── Config ─────────────────────────────────────────────────────────────────────
function requireEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    console.error(`[startup] Missing required environment variable: ${key}`);
    process.exit(1);
  }
  return value;
}

const PORT = parseInt(process.env["PORT"] ?? "3000", 10);
const ADMIN_EMAIL = requireEnv("ADMIN_EMAIL");

const smtpConfig: SmtpConfig = {
  host: requireEnv("SMTP_HOST"),
  port: parseInt(requireEnv("SMTP_PORT"), 10),
  secure: process.env["SMTP_SECURE"] === "true",
  user: requireEnv("SMTP_USER"),
  pass: requireEnv("SMTP_PASS"),
  fromName: process.env["SMTP_FROM_NAME"] ?? "Analytics Bot",
};

// ── App ────────────────────────────────────────────────────────────────────────
const app = express();

app.use(
  cors({
    origin: process.env["CORS_ORIGIN"] ?? "*",
    methods: ["POST", "OPTIONS"],
    allowedHeaders: ["Content-Type"],
  })
);

app.use(express.json({ limit: "16kb" }));

// Health check
app.get("/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Analytics endpoint
app.use("/analytics", createAnalyticsRouter(smtpConfig, ADMIN_EMAIL));

// 404 fallback
app.use((_req, res) => {
  res.status(404).json({ error: "Not found" });
});

// ── Start ──────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`[server] Listening on http://localhost:${PORT}`);
  console.log(`[server] Admin notifications → ${ADMIN_EMAIL}`);
  console.log(`[server] SMTP host: ${smtpConfig.host}:${smtpConfig.port}`);
});
