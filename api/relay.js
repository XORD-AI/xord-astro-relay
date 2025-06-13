export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const { reportText } = req.body;
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: "You are a symbolic astrologer trained in Peter Meyer’s aspectarian logic. Interpret planetary aspects, midpoints, and patterns from copied reports. Use diagnostic, structural language — no encouragement, no generic horoscopes. Return output in this format: [Aspect Summary] [Interpretive Reading] [Use / Risk / Insight if applicable] Never apologize. Never explain what astrology is. Just diagnose the pattern."
          },
          {
            role: 'user',
            content: reportText
          }
        ],
        temperature: 0.7
      })
    });

    const data = await response.json();
    const result = data.choices?.[0]?.message?.content || "No response generated.";
    res.status(200).json({ result });
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
