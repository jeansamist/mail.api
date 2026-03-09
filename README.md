# Analytics API

Express + TypeScript backend that receives visitor analytics from the frontend and sends a formatted email notification to the admin via Nodemailer.

## Project structure

```
src/
├── index.ts        # Entry point — Express app + config bootstrap
├── router.ts       # POST /analytics route handler
├── mailer.ts       # Nodemailer transporter + HTML email template
├── validation.ts   # Request body validation middleware
└── types.ts        # Shared TypeScript interfaces
```

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

```bash
cp .env.example .env
```

Edit `.env` with your values:

| Variable        | Description                                          |
|-----------------|------------------------------------------------------|
| `PORT`          | HTTP port (default `3000`)                           |
| `ADMIN_EMAIL`   | Recipient address for analytics notifications        |
| `SMTP_HOST`     | SMTP server hostname (e.g. `smtp.gmail.com`)         |
| `SMTP_PORT`     | SMTP port — usually `587` (STARTTLS) or `465` (SSL)  |
| `SMTP_SECURE`   | `true` for port 465, `false` for 587                 |
| `SMTP_USER`     | SMTP login / sender address                          |
| `SMTP_PASS`     | SMTP password (Gmail: use an **App Password**)       |
| `SMTP_FROM_NAME`| Display name in the From field (default: Analytics Bot) |
| `CORS_ORIGIN`   | Allowed origin (default: `*` — restrict in production) |

#### Gmail App Password
1. Enable 2-Step Verification on your Google account.
2. Go to **Google Account → Security → App Passwords**.
3. Generate a password for "Mail" and paste it as `SMTP_PASS`.

### 3. Run

```bash
# Development (ts-node, no build needed)
npm run dev

# Production
npm run build
npm start
```

## API

### `POST /analytics`

Accepts the payload sent by the frontend on location grant.

**Request body** (`application/json`):
```json
{
  "latitude": 48.8566,
  "longitude": 2.3522,
  "accuracy": 20,
  "browser": "Mozilla/5.0 ...",
  "platform": "MacIntel",
  "language": "en-US",
  "screen": { "width": 1920, "height": 1080, "colorDepth": 24 },
  "cpuCores": 8,
  "maxTouchPoints": 0,
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

**Success response** `200`:
```json
{ "success": true, "message": "Data received." }
```

**Validation error** `400`:
```json
{ "success": false, "errors": ["latitude must be a number between -90 and 90"] }
```

### `GET /health`

Returns `{ "status": "ok", "timestamp": "..." }` — useful for uptime monitoring.

## Email

Each submission triggers an HTML email to `ADMIN_EMAIL` containing:
- Coordinates with a **View on Google Maps** link
- Accuracy radius
- Visitor IP address
- Browser user-agent, platform, language
- Screen resolution and colour depth
- CPU cores & touch points
- Formatted timestamp

A plain-text fallback is always included for email clients that don't render HTML.
