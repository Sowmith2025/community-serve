// Gemini AI Service — wraps Google Generative Language REST API
// Uses the free gemini-1.5-flash model to keep costs at zero.
// The API key is read from the VITE_GEMINI_API_KEY env variable.

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
// Triggering Vercel rebuild for API Key injection
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;

/**
 * Send a single text prompt to Gemini and return the response text.
 * @param {string} prompt
 * @returns {Promise<string>}
 */
async function askGemini(prompt) {
  const res = await fetch(GEMINI_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.7, maxOutputTokens: 512 },
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message || `Gemini API error: ${res.status}`);
  }

  const data = await res.json();
  return data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ?? '';
}

/**
 * Generate a polished event description from brief organizer notes.
 * @param {{ title: string, location: string, date: string, category: string, maxVolunteers: number, notes: string }} details
 * @returns {Promise<string>}
 */
export async function generateEventDescription({ title, location, date, category, maxVolunteers, notes }) {
  const prompt = `You are a community service coordinator writing event listings for a volunteer platform.
Generate a clear, enthusiastic, and professional event description (3-4 sentences) based on the following details:

Event Title: ${title || 'Untitled'}
Category: ${category || 'general'}
Date: ${date || 'TBD'}
Location: ${location || 'TBD'}
Max Volunteers Needed: ${maxVolunteers || 20}
Organizer Notes: ${notes || 'No additional notes.'}

Write ONLY the description — no headings, no bullet points, no markdown. Make it motivating for students to sign up.`;

  return askGemini(prompt);
}

/**
 * Generate AI insights from organizer event statistics.
 * @param {{ events: Array, totalRegistrations: number, topEvent: string, categories: Object }} stats
 * @returns {Promise<string[]>}  array of insight strings
 */
export async function generateOrganizerInsights(stats) {
  const prompt = `You are a smart analytics assistant for a student volunteer platform.
Analyze the following organizer statistics and return exactly 3 short, actionable insights.
Each insight must be a single sentence. Format them as a JSON array of strings.

Statistics:
- Total events created: ${stats.totalEvents}
- Total registrations across all events: ${stats.totalRegistrations}
- Most popular event: "${stats.topEvent}"
- Category breakdown: ${JSON.stringify(stats.categories)}
- Average fill rate: ${stats.avgFillRate}%

Respond ONLY with a valid JSON array, e.g.: ["Insight 1.", "Insight 2.", "Insight 3."]`;

  const text = await askGemini(prompt);
  // Extract JSON array from response (guard against markdown code fences)
  const match = text.match(/\[[\s\S]*\]/);
  if (!match) return ['Could not parse insights. Please try again.'];
  return JSON.parse(match[0]);
}
