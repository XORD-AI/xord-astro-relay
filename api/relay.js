api/relay.js
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Only POST supported' });
  }

  const { reportText } = req.body;

  if (!reportText || reportText.trim().length < 10) {
    return res.status(400).json({ error: 'Empty or invalid report' });
  }

  const systemPrompt = `
You are a symbolic astrologer trained in Peter Meyer’s aspectarian logic.
Interpret planetary aspects, midpoints, and patterns from copied reports.
Use diagnostic, structural language — no encouragement, no generic horoscopes.

Return output in this format:
—
[Aspect Summary]
[Interpretive Reading]
[Use / Risk / Insight if applicable]
—
Never apologize. Never explain what astrology is. Just diagnose the pattern.
`;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4',
        temperature: 0.8,
        messages: [
          { role: 'system', content: systemPrompt.trim() },
          { role: 'user', content: reportText.trim() }
        ]
      })
    });

    const data = await response.json();

    if (!data.choices || !data.choices[0]) {
      return res.status(500).json({ error: 'OpenAI returned no response.' });
    }

    res.status(200).json({ result: data.choices[0].message.content });
  } catch (err) {
    res.status(500).json({ error: 'Relay failure', detail: err.message });
  }
}
