// /api/relay.js

// This is the correct, CORS-compliant Vercel Serverless Function.
// It handles the browser's pre-flight check and allows your private domain to connect.

export default async function handler(request, response) {
  // Set CORS headers to allow requests from your specific private domain
  response.setHeader('Access-Control-Allow-Origin', 'https://astro.xord.io');
  response.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle the browser's pre-flight OPTIONS request
  if (request.method === 'OPTIONS') {
    return response.status(204).end();
  }

  // Ensure the request is a POST request
  if (request.method !== 'POST') {
    return response.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { reportText } = request.body;
    if (!reportText) {
      return response.status(400).json({ error: 'Missing reportText in request body' });
    }

    // Call OpenAI using the API key from Vercel's environment variables
    const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "You are a symbolic astrologer inspired by Peter Meyer. You will receive a technical report from the 'Planetary Aspects and Transits' software. Your task is to interpret the provided aspects, patterns, and midpoints in flowing, symbolic, human language, as if providing a wise, esoteric reading. Focus on the archetypal meaning, not the technical data."
          },
          {
            role: "user",
            content: reportText
          }
        ]
      })
    });

    const data = await openAIResponse.json();

    if (openAIResponse.status !== 200) {
      // Forward any error from OpenAI
      console.error("OpenAI API Error:", data);
      return response.status(openAIResponse.status).json({ error: "Error from OpenAI API", details: data });
    }

    const interpretation = data.choices[0].message.content;

    // Send the successful interpretation back to the frontend
    return response.status(200).json({ result: interpretation });

  } catch (error) {
    console.error("Internal Server Error:", error);
    return response.status(500).json({ error: 'The server encountered an unexpected error.' });
  }
}
