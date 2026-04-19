export async function GET(request: Request) {
  const url = new URL(request.url);
  const hidId = url.pathname.split("/").pop();
  try {
    const res = await fetch(`http://localhost:3001/api/recipients/${hidId}/balance`);
    const data = await res.json();
    return Response.json(data);
  } catch (e) {
    return Response.json({ error: "Failed to connect to backend" }, { status: 500 });
  }
}