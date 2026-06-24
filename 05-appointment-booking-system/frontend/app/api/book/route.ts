import { NextRequest, NextResponse } from "next/server";

const N8N_WEBHOOK_URL = "http://localhost:5678/webhook/book-appointment";

export async function POST(req: NextRequest) {
    const body = await req.json();

    const res = await fetch(N8N_WEBHOOK_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "X-API-Key": process.env.N8N_API_KEY!,
        },
        body: JSON.stringify(body),
    });

    const data = await res.json();

    return NextResponse.json(data, { status: res.status });
}