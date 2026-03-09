import { Request, Response, NextFunction } from "express";
import { AnalyticsPayload } from "./types";

function isNumber(v: unknown): v is number {
  return typeof v === "number" && isFinite(v);
}

function isString(v: unknown): v is string {
  return typeof v === "string";
}

export function validateAnalyticsPayload(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const b = req.body as Partial<AnalyticsPayload>;

  const errors: string[] = [];

  if (!isNumber(b.latitude) || b.latitude < -90 || b.latitude > 90)
    errors.push("latitude must be a number between -90 and 90");
  if (!isNumber(b.longitude) || b.longitude < -180 || b.longitude > 180)
    errors.push("longitude must be a number between -180 and 180");
  if (!isNumber(b.accuracy) || b.accuracy < 0)
    errors.push("accuracy must be a non-negative number");
  if (!isString(b.browser) || b.browser.trim() === "")
    errors.push("browser is required");
  if (!isString(b.platform) || b.platform.trim() === "")
    errors.push("platform is required");
  if (!isString(b.language) || b.language.trim() === "")
    errors.push("language is required");
  if (!isString(b.timestamp) || isNaN(Date.parse(b.timestamp)))
    errors.push("timestamp must be a valid ISO date string");

  const s = b.screen;
  if (
    !s ||
    !isNumber(s.width) ||
    !isNumber(s.height) ||
    !isNumber(s.colorDepth)
  ) {
    errors.push("screen must contain numeric width, height, and colorDepth");
  }

  if (errors.length > 0) {
    res.status(400).json({ success: false, errors });
    return;
  }

  next();
}
