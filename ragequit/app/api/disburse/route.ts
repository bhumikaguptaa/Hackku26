export async function POST(request: Request) {
  try {
    const body = await request.json();
    const res = await fetch("http://localhost:3001/api/disburse", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });
    const data = await res.json();
    return Response.json(data);
  } catch (e) {
    return Response.json({ error: "Failed to connect to backend", details: (e as Error).message }, { status: 500 });
  }
}