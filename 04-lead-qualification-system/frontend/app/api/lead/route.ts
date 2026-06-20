export async function POST(request : Request){
    const body = await request.json();

    const response = await fetch("http://localhost:5678/webhook/new-lead" , {
        method : "POST",
        headers : {"Content-Type" : "application/json"},
        body : JSON.stringify(body)
    })

    if(!response.ok){
        return Response.json({
            error : "Failed to submit lead"
        },
    {
        status : 500
    })
    }

    return Response.json({
        success : true
    } , {
        status : 200
    });
}