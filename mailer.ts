import nodemailer, { Transporter } from "nodemailer";
import { AnalyticsPayload, SmtpConfig } from "./types";

// ── Transporter (singleton) ────────────────────────────────────────────────────
let transporter: Transporter | null = null;

function getTransporter(cfg: SmtpConfig): Transporter {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: cfg.host,
      port: cfg.port,
      secure: cfg.secure,
      auth: {
        user: cfg.user,
        pass: cfg.pass,
      },
    });
  }
  return transporter;
}

// ── HTML email template ────────────────────────────────────────────────────────
function buildEmailHtml(data: AnalyticsPayload, ip: string): string {
  const mapsUrl = `https://www.google.com/maps?q=${data.latitude},${data.longitude}`;
  const formattedTime = new Date(data.timestamp).toLocaleString("en-US", {
    dateStyle: "full",
    timeStyle: "long",
  });

  const row = (label: string, value: string | number) => `
    <tr>
      <td style="padding:8px 12px;font-weight:600;color:#555;white-space:nowrap;border-bottom:1px solid #f0f0f0;">${label}</td>
      <td style="padding:8px 12px;color:#222;border-bottom:1px solid #f0f0f0;word-break:break-all;">${value}</td>
    </tr>`;

  return `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:'Helvetica Neue',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 0;">
    <tr><td align="center">
      <table width="580" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">

        <!-- Header -->
        <tr>
          <td colspan="2" style="background:#111;padding:28px 32px;">
            <p style="margin:0;font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#888;">Analytics Alert</p>
            <h1 style="margin:6px 0 0;font-size:22px;color:#fff;font-weight:500;">New Visitor Captured</h1>
          </td>
        </tr>

        <!-- Location highlight -->
        <tr>
          <td colspan="2" style="padding:24px 32px;background:#fafafa;border-bottom:1px solid #eee;">
            <p style="margin:0 0 4px;font-size:11px;letter-spacing:1.5px;text-transform:uppercase;color:#999;">Location</p>
            <p style="margin:0;font-size:28px;font-weight:700;color:#111;letter-spacing:-0.5px;">
              ${data.latitude.toFixed(5)}, ${data.longitude.toFixed(5)}
            </p>
            <p style="margin:6px 0 0;font-size:13px;color:#888;">Accuracy: ±${Math.round(data.accuracy)} metres</p>
            <a href="${mapsUrl}" style="display:inline-block;margin-top:14px;padding:9px 18px;background:#111;color:#fff;border-radius:4px;font-size:13px;text-decoration:none;font-weight:500;">
              📍 View on Google Maps
            </a>
          </td>
        </tr>

        <!-- Data table -->
        <tr>
          <td colspan="2" style="padding:8px 20px 20px;">
            <table width="100%" cellpadding="0" cellspacing="0" style="font-size:14px;">
              ${row("Timestamp", formattedTime)}
              ${row("IP Address", ip)}
              ${row("Browser / UA", data.browser)}
              ${row("Platform", data.platform)}
              ${row("Language", data.language)}
              ${row("Screen", `${data.screen.width} × ${data.screen.height} px — ${data.screen.colorDepth}-bit colour`)}
              ${row("CPU Cores", data.cpuCores)}
              ${row("Touch Points", data.maxTouchPoints)}
            </table>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td colspan="2" style="padding:16px 32px;border-top:1px solid #eee;background:#fafafa;">
            <p style="margin:0;font-size:12px;color:#aaa;text-align:center;">
              Sent automatically by your Analytics API — do not reply to this message.
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

// ── Plain-text fallback ────────────────────────────────────────────────────────
function buildEmailText(data: AnalyticsPayload, ip: string): string {
  return [
    "NEW VISITOR CAPTURED",
    "=".repeat(40),
    `Timestamp : ${data.timestamp}`,
    `IP        : ${ip}`,
    `Location  : ${data.latitude}, ${data.longitude} (±${Math.round(data.accuracy)} m)`,
    `Maps      : https://www.google.com/maps?q=${data.latitude},${data.longitude}`,
    `Platform  : ${data.platform}`,
    `Language  : ${data.language}`,
    `Screen    : ${data.screen.width}x${data.screen.height} / ${data.screen.colorDepth}-bit`,
    `CPU Cores : ${data.cpuCores}`,
    `Touch pts : ${data.maxTouchPoints}`,
    "",
    `User Agent: ${data.browser}`,
  ].join("\n");
}

// ── Public send function ───────────────────────────────────────────────────────
export async function sendAnalyticsEmail(
  cfg: SmtpConfig,
  adminEmail: string,
  data: AnalyticsPayload,
  ip: string
): Promise<void> {
  const transport = getTransporter(cfg);

  await transport.sendMail({
    from: `"${cfg.fromName}" <${cfg.user}>`,
    to: adminEmail,
    subject: `📍 New visitor — ${data.latitude.toFixed(3)}, ${data.longitude.toFixed(3)}`,
    text: buildEmailText(data, ip),
    html: buildEmailHtml(data, ip),
  });
}
