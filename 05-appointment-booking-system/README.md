# Appointment Booking & Reminder System

Automated appointment booking and WhatsApp reminder system for small businesses (salons, clinics, consultants, tutors). Solves a real problem: manual booking via phone/WhatsApp is error-prone and clients forget appointments without reminders, costing businesses no-show revenue. This system handles booking with conflict detection and automatically reminds clients 24 hours before their appointment.

## Features

- **Conflict-checked booking** — every booking request checks Google Calendar for overlapping events before confirming, preventing double-booking.
- **Calendar integration** — confirmed bookings are created as real Google Calendar events automatically.
- **Automated WhatsApp reminders** — an hourly scheduled check finds appointments ~24 hours away and sends a reminder via WhatsApp (Twilio), using a pre-approved business-initiated message template.
- **Stateful reminder tracking** — a STATUS column (BOOKED → REMINDED) ensures each appointment is reminded exactly once, never duplicated.
- **Polished booking frontend** — a Next.js calendar/date-picker interface for clients to self-serve book a slot.

## Architecture

### Two independent flows in one n8n workflow

**Booking flow:**
```text
Webhook (POST)
      ↓
Google Calendar (Get Many — check conflicts in requested window)
      ↓
     IF (is the result a real event, or empty?)
      │
      ├── Free → Google Calendar (Create event)
      │             ↓
      │          Google Sheets (Append: BOOKED)
      │             ↓
      │          Respond to Webhook (success)
      │
      └── Taken → Respond to Webhook (conflict error)
```

**Reminder flow:**
```text
Schedule Trigger (hourly)
      ↓
Google Sheets (Get all rows)
      ↓
Filter (STATUS = BOOKED AND 23 ≤ hours-until-appointment ≤ 24)
      ↓
HTTP Request (Twilio — send WhatsApp template message)
      ↓
Google Sheets (Update row: STATUS → REMINDED)
```

### Frontend

```text
Next.js booking form (calendar + time slots + name/phone)
      ↓
/api/book (Next.js API route)
      ↓
n8n production webhook
```

## Tech Stack

- n8n (workflow automation)
- Google Calendar (booking + conflict detection)
- Google Sheets (booking records + reminder state)
- Twilio WhatsApp API (reminder delivery via pre-approved Content Template)
- Next.js + TypeScript + Tailwind CSS + react-day-picker (booking frontend)

## Setup

1. Import `workflow.json` into n8n.
2. Connect Google Calendar and Google Sheets credentials (OAuth2).
3. Create a Twilio account, join the WhatsApp Sandbox (or use an approved Business sender for production), and create a Basic Auth credential using your Account SID + Auth Token.
4. Set up a Content Template in Twilio for appointment reminders, and update the `ContentSid` in the HTTP Request node.
5. Update the webhook URL in `frontend/app/api/book/route.ts` to match your n8n production URL.
6. Activate the n8n workflow.
7. Run:
```bash
npm install && npm run dev
```
in the `frontend` folder.

## Important Notes

- All datetime expressions are explicitly locked to `Asia/Kolkata` to avoid timezone bugs.
- Sheet cells for `APPOINTMENT DATETIME` and `CLIENT PHONE` require a leading apostrophe (`'`) when edited manually, to prevent Google Sheets from auto-formatting dates or stripping a leading `+`.
- The reminder flow's `STATUS` field must not be included as a mapped (even if blank) field anywhere it shouldn't be updated — n8n's Update node can send empty values if a field is left mapped but empty, rather than skipping it.
- Reschedule/cancel functionality is intentionally not included in this version — planned as a future addition.

## Sheet Structure

Required columns (exact case-sensitive headers):

| BOOKING ID | CLIENT NAME | CLIENT PHONE | APPOINTMENT DATETIME | STATUS | CALENDAR EVENT ID |
|---|---|---|---|---|---|

## Reschedule Flow

```text
Webhook (POST /reschedule-appointment)
      ↓
Google Sheets (find rows matching phone number)
      ↓
     IF (any row found?)
      │
      ├── No → Respond to Webhook (not found)
      │
      └── Yes → Filter (future appointments only)
                  ↓
                Sort (ascending by date) + Limit (1)
                  ↓
                Google Calendar (Get Many — check new time for conflicts)
                  ↓
                 IF (new time free?)
                  │
                  ├── Free → Calendar (Update existing event by ID)
                  │            ↓
                  │          Sheets (update datetime, reset STATUS to BOOKED)
                  │            ↓
                  │          Respond to Webhook (success)
                  │
                  └── Taken → Respond to Webhook (conflict error)
```

A client identifies their booking by phone number (not a booking ID) for a friendlier experience. If multiple upcoming bookings exist under one number, the soonest is selected. Rescheduling resets STATUS to BOOKED so the reminder flow fires again for the new time.

## Security

Both the booking and reschedule webhooks require a `X-API-Key` header (Header Auth in n8n). The key is stored only in the Next.js backend (`.env.local`, never committed to git) and attached server-side when proxying requests to n8n — it is never exposed to the browser.

## Frontend Routes

- `/` — booking form
- `/reschedule` — reschedule an existing booking by phone number