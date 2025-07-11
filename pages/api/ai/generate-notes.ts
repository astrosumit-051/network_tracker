// pages/api/ai/generate-notes.ts
import type { NextApiRequest, NextApiResponse } from 'next';

type Data = { text?: string; error?: string };

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const { prompt } = req.body;
  if (!prompt) {
    return res.status(400).json({ error: 'Missing prompt' });
  }

  try {
    const response = await fetch(process.env.GROK_API_URL!, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.GROK_API_KEY!}`,
      },
      body: JSON.stringify({
        model: process.env.GROK_MODEL || 'grok-1',
        input: prompt,
        // you can add other params here (e.g. max_tokens)
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      return res.status(response.status).json({ error: errText });
    }

    const data = await response.json();
    // Adjust this to match Grok’s response schema:
    // many Grok endpoints return either data.choices[0].text or data.text
    const text =
      data.choices?.[0]?.text ??
      data.choices?.[0]?.message?.content ??
      data.text ??
      '';
    return res.status(200).json({ text });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
}
