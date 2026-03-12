export default async function handler(req, res) {
  if (req.method === "GET") return res.status(200).json({ hasKey: !!process.env.ANTHROPIC_API_KEY, keyLength: process.env.ANTHROPIC_API_KEY?.length || 0 });
  if (req.method !== "POST") return res.status(405).end();
  // ... rest stays the same
export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": process.env.ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify(req.body),
  });

  const data = await response.json();
  res.status(response.status).json(data);
}
