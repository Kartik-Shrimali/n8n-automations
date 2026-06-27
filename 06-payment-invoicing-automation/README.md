# Payment Collection & Invoicing Automation

Automated invoicing and payment-tracking system for freelancers and small businesses. Solves a real problem: manually generating payment links, tracking who's paid, and chasing overdue clients eats hours every week — and clients quietly slip through the cracks. This system creates the invoice, verifies payment automatically and securely, and chases overdue payments on its own.

## Features

- **Instant payment link generation** — submit client + amount, get back a real Razorpay payment link, logged automatically.
- **Cryptographically verified payment confirmation** — incoming payment webhooks are verified with HMAC-SHA256 signature checking (raw-byte hashing + timing-safe comparison), not just trusted blindly.
- **Repeating overdue reminders** — invoices that go unpaid past their due date get automatic email reminders every 24 hours, until paid.
- **Two-layer security** — invoice creation is protected by Header Auth (only your own frontend can create invoices); payment confirmation is protected by Razorpay's own webhook signature (not a static header, since Razorpay can't send custom headers).
- **Ledger-styled invoice creation frontend** — a Next.js form for the business owner, with a BFF proxy that keeps the API key off the browser entirely.

## Architecture

### Three flows in one n8n workflow

**Flow 1 — Create Invoice:**
```text
Webhook (POST, Header Auth protected)
      ↓
HTTP Request (Razorpay: create payment link)
      ↓
Google Sheets (log invoice, STATUS: PENDING)
      ↓
Respond to Webhook (return payment link)
```

**Flow 2 — Payment Confirmation:**
```text
Webhook (Razorpay → payment_link.paid event, raw body)
      ↓
Code (HMAC-SHA256 signature verification, timing-safe compare)
      ↓
     IF (signature valid?)
      │
      ├── Valid   → Sheets (find invoice by Payment Link ID)
      │                ↓
      │             Sheets (update STATUS: PAID, PAID AT)
      │                ↓
      │             Respond to Webhook (success)
      │
      └── Invalid → Respond to Webhook (rejection)
```

**Flow 3 — Repeating Overdue Reminders:**
```text
Schedule Trigger (hourly)
      ↓
Google Sheets (get all invoices)
      ↓
Filter (PENDING AND overdue AND (never reminded OR 24+ hrs since last reminder))
      ↓
Gmail (send reminder)
      ↓
Google Sheets (update LAST REMINDED AT)
```

### Frontend

```text
Next.js invoice form
      ↓
/api/create-invoice (Next.js API route — attaches secret server-side)
      ↓
n8n production webhook
```

## Tech Stack

- n8n (workflow automation)
- Razorpay (payment links, test mode)
- Google Sheets (invoice ledger)
- Gmail (overdue reminders)
- Next.js + TypeScript + Tailwind CSS (invoice creation frontend)
- ngrok (local webhook tunneling for Razorpay → n8n)

## Setup

1. Import `workflow.json` into n8n.
2. Create a Razorpay account (Test Mode), generate API keys, add as a Basic Auth credential.
3. Set environment variables on your n8n container: `NODE_FUNCTION_ALLOW_BUILTIN=crypto` (required for the signature verification Code node) and `RAZORPAY_WEBHOOK_SECRET` (must match what you set in Razorpay's webhook settings).
4. Connect Google Sheets and Gmail credentials.
5. Set up a Header Auth credential for the `create-invoice` webhook — this protects invoice creation from public abuse.
6. In Razorpay Dashboard → Settings → Webhooks, register your **public** webhook URL (via ngrok for local dev) pointing to `/webhook/razorpay-webhook`, with the `payment_link.paid` event enabled.
7. Activate the n8n workflow.
8. Update the webhook URL and API key in `frontend/.env.local`.
9. Run:
```bash
npm install && npm run dev
```
in the `frontend` folder.

## Important Notes

- **Webhook signature verification requires raw bytes, not re-parsed JSON.** The Razorpay webhook node has "Raw Body" enabled, and the Code node reads the true binary buffer (`getBinaryDataBuffer`) for hashing — using the auto-parsed `$json.body` would produce a different hash and silently break verification.
- **`crypto` is disallowed in n8n Code nodes by default.** Requires `NODE_FUNCTION_ALLOW_BUILTIN=crypto` set on the container at startup — this cannot be enabled from the n8n UI.
- **Never hardcode secrets inside Code node text** — Code node content is saved verbatim into the exported workflow JSON, unlike n8n credentials. Both the Razorpay webhook secret and the API key are read from environment variables / credentials, never typed as literal strings.
- **Test URL vs Production URL** — Razorpay's real webhook calls only ever hit the Production URL (`/webhook/...`), which requires the workflow to be saved and **Active**. The Test URL (`/webhook-test/...`) only works after manually clicking "Listen for test event" and is for development only.
- **ngrok's free-tier URL changes on every restart** — must be updated in Razorpay's webhook settings each time the tunnel restarts.
- Apostrophe-prefix formatting guard applies to `CLIENT PHONE`, `CREATED AT`, `DUE DATE`, `LAST REMINDED AT`, and `PAID AT` — same Google Sheets auto-formatting issue as prior projects.
- The frontend does not live-update when a client pays — Flow 2 only updates the sheet (the browser session that created the invoice has no active connection to that event). A "check invoice status" page is a natural future addition.

## Sheet Structure

Required columns (exact case-sensitive headers):

| INVOICE ID | CLIENT NAME | CLIENT PHONE | CLIENT EMAIL | DESCRIPTION | AMOUNT | RAZORPAY PAYMENT LINK ID | PAYMENT LINK URL | STATUS | CREATED AT | DUE DATE | LAST REMINDED AT | PAID AT |
|---|---|---|---|---|---|---|---|---|---|---|---|---|

## Security

- `create-invoice` webhook: protected by Header Auth (`X-API-Key`) — key is held only in the Next.js backend's `.env.local`, never exposed to the browser.
- `razorpay-webhook`: intentionally has **no** Header Auth — Razorpay cannot send custom headers. Protection instead comes from HMAC-SHA256 signature verification against the raw request body, which also proves the payload wasn't tampered with in transit.