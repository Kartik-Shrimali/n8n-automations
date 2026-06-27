import { NextResponse, NextRequest } from "next/server";

export async function POST(request: NextRequest) {
    const body = await request.json();

    const webhookUrl = process.env.N8N_WEBHOOK_URL;
    const apiKey = process.env.N8N_API_KEY;

    if (!webhookUrl || !apiKey) {
        return NextResponse.json(
            { success: false, message: 'Server misconfiguration: missing env vars' },
            { status: 500 }
        );
    }

    const n8nResponse = await fetch(webhookUrl,{
        method : "POST",
        headers : {
            "Content-Type" : "application/json",
            "X-API-Key" : apiKey
        },
        body : JSON.stringify(body)
    });

    const data = await n8nResponse.json();

    return NextResponse.json(data , {status : n8nResponse.status});
}