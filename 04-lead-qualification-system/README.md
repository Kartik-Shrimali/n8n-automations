# Lead Qualification & Nurture System

Automated lead scoring and follow-up system for small businesses. Solves a real problem: every inbound lead gets treated the same, so urgent buyers wait in a queue alongside casual browsers — and hot leads go cold before anyone notices. This system reads each lead, scores their intent with AI, and routes them automatically.

---

## Features

- **AI lead scoring** — every submission is classified as HOT, WARM, or COLD based on buying intent, using a strict single-word classification prompt.
- **Instant sales alerts** — HOT leads trigger an immediate Slack notification so sales can respond right away.
- **AI-personalized nurture emails** — WARM and COLD leads get a delayed, AI-drafted follow-up email referencing their original message. Two separate generation prompts are used: a warmer, slightly more direct tone for WARM leads, and a low-pressure, no-pitch tone for COLD leads.
- **CRM logging** — every WARM/COLD lead is logged to Google Sheets with score, status, and timestamp for manual follow-up tracking.
- **Lead capture frontend** — a Next.js form that submits leads through an internal API route, avoiding direct browser-to-n8n CORS issues.

---

## Architecture

### One n8n workflow, AI-driven branching

```text
Webhook (POST)
        ↓
HTTP Request (Groq: classify HOT/WARM/COLD)
        ↓
      Switch
        │
        ├── HOT
        │     └── Slack alert
        │
        ├── WARM
        │     └── Sheets (log)
        │           ↓
        │         Wait
        │           ↓
        │     HTTP Request (Groq: draft warm email)
        │           ↓
        │         Gmail
        │
        └── COLD
              └── Sheets (log)
                    ↓
                  Wait
                    ↓
              HTTP Request (Groq: draft low-pressure email)
                    ↓
                  Gmail
```

### Frontend

```text
Next.js form
      ↓
/api/lead (Next.js API route)
      ↓
n8n production webhook
```

---

## Tech Stack

- n8n (workflow automation)
- Groq API (Llama 3.3-70b) — used twice: once for classification, once for email generation
- Google Sheets (CRM log)
- Slack (instant alerts)
- Next.js + TypeScript + Tailwind CSS (lead capture frontend)

---

## Setup

1. Import `workflow.json` into n8n.
2. Connect Groq (Header Auth), Google Sheets, and Slack credentials.
3. Update the webhook URL in `frontend/app/api/lead/route.ts` to match your n8n production URL.
4. Activate the n8n workflow.
5. Run:

```bash
npm install && npm run dev
```

in the `frontend` folder.

---

## Sheet Structure

Required columns (exact case-sensitive headers):

| NAME | EMAIL | MESSAGE | SCORE | STATUS | TIMESTAMP |
|------|--------|---------|--------|---------|-----------|