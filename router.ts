import { Router, Request, Response } from "express";
import { validateAnalyticsPayload } from "./validation";
import { sendAnalyticsEmail } from "./mailer";
import { AnalyticsPayload, SmtpConfig } from "./types";

export function createAnalyticsRouter(
  smtpConfig: SmtpConfig,
  adminEmail: string
): Router {
  const router = Router();

  /**
   * POST /analytics
   * Accepts a JSON analytics payload, validates it, and fires an email
   * notification to the admin.
   */
  router.post(
    "/",
    validateAnalyticsPayload,
    async (req: Request, res: Response): Promise<void> => {
      const payload = req.body as AnalyticsPayload;

      // Best-effort IP extraction (works behind common proxies)
      const ip =
        (req.headers["x-forwarded-for"] as string | undefined)
          ?.split(",")[0]
          .trim() ??
        req.socket.remoteAddress ??
        "unknown";

      try {
        await sendAnalyticsEmail(smtpConfig, adminEmail, payload, ip);
        console.log(
          `[analytics] email sent for ${payload.latitude},${payload.longitude} from ${ip}`
        );
        res.status(200).json({ success: true, message: "Data received." });
      } catch (err) {
        console.error("[analytics] failed to send email:", err);
        // Still return 200 to the client — email failure is an internal concern
        res
          .status(200)
          .json({ success: true, message: "Data received (email pending)." });
      }
    }
  );

  return router;
}
