export async function POST(request: Request) {
  const body = await request.json();
  
  const response = await fetch("http://localhost:5678/webhook/2d313cdc-aa3a-48d3-8035-ee9e78d49442", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  
  const data = await response.json();
  return Response.json(data);
}