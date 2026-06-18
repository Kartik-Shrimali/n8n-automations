import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { message } = await req.json();

  const response = await fetch("http://localhost:5678/webhook/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message }),
  });

  const text = await response.text();
  console.log("n8n response:", text);
  
  const data = JSON.parse(text);
  return NextResponse.json({ reply: data.reply });
}