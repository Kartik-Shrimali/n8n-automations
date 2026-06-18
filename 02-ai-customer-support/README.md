# Project 2 - AI Customer Support Bot

## What it does
A fully functional AI-powered customer support chat widget that answers business-specific questions instantly.

## Flow
1. User sends message on the chat widget (Next.js frontend)
2. n8n Webhook receives the message
3. n8n sends it to Groq AI (Llama 3.3-70b)
4. AI replies with a context-aware answer based on business info
5. Reply is sent back to the user instantly
6. Conversation is logged in Google Sheets

## Tech Stack
- **n8n** — automation workflow
- **Groq API** — free AI (Llama 3.3-70b-versatile)
- **Next.js + TypeScript + Tailwind CSS** — chat widget frontend
- **Google Sheets** — conversation logging

## How to customize for a client
1. Update the system prompt in the HTTP Request node with the client's business info
2. Connect your own Google Sheet for logging
3. Deploy the Next.js frontend and update the webhook URL

## Business Value
- Handles customer queries 24/7 automatically
- No human support needed for common questions
- All conversations logged for review
- Easy to customize for any business in minutes

## Setup
1. Import `workflow.json` into n8n
2. Add your Groq API key as Header Auth credential
3. Connect Google Sheets via OAuth
4. Run `cd frontend && npm install && npm run dev`
5. Update webhook URL in `app/api/chat/route.ts`