# Inventory Alert System

Automated inventory tracking and low-stock alerting system for small businesses. Solves a real problem: business owners manually tracking spreadsheets often miss restocking until a customer asks for an out-of-stock item — losing sales. This system watches stock levels and alerts automatically.

## Features

- **Daily safety-net check** — scheduled job scans inventory every 24 hours and flags low-stock items, catching changes made outside the system (manual edits, other sales channels).
- **Real-time order processing** — webhook decrements stock instantly when an order is placed, and alerts immediately if it drops below the reorder threshold.
- **Live dashboard** — Next.js frontend showing real-time stock status, with a built-in order simulator for testing.
- **Slack alerts** — instant notifications to a dedicated channel whenever restocking is needed.

## Architecture

**Two parallel automation paths in one n8n workflow:**

1. **Scheduled path:** `Schedule Trigger` → `Google Sheets (read all)` → `Filter (stock < threshold)` → `Slack alert`
2. **Order path:** `Webhook (POST)` → `Google Sheets (find product)` → `Code (calculate new stock)` → `Google Sheets (update)` → `Filter (check threshold)` → `Slack alert`
3. **Dashboard data path:** `Webhook (GET)` → `Google Sheets (read all)` → `Respond to Webhook`

**Frontend:** Next.js dashboard calls internal API routes (`/api/inventory`, `/api/order`), which forward requests to n8n — avoiding direct browser-to-n8n CORS issues.

## Tech Stack

- n8n (workflow automation)
- Google Sheets (data store)
- Slack (alerts)
- Next.js + TypeScript + Tailwind CSS (frontend)

## Setup

1. Import `workflow.json` into n8n.
2. Connect your Google Sheets and Slack credentials.
3. Update webhook URLs in `frontend/app/api/inventory/route.ts` and `frontend/app/api/order/route.ts` to match your n8n production URLs.
4. Publish/activate the n8n workflow.
5. Run `npm install && npm run dev` in the `frontend` folder.

## Sheet Structure

Required columns (exact case-sensitive headers): `PRODUCT NAME`, `CURRENT STOCK`, `REORDER THRESHOLD`, `PRICE`, `LAST UPDATED`