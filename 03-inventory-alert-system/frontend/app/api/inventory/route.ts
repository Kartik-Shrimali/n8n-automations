export async function GET(){
    const response = await fetch("http://localhost:5678/webhook/get-inventory");
    const data = await response.json();
    return Response.json(data);
}