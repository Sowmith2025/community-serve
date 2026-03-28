// AI Service — wraps NVIDIA NIM (OpenAI-compatible) API
// Uses meta/llama-3.1-8b-instruct to keep costs at zero using free credits.
// The API key is read from the VITE_NVIDIA_API_KEY env variable.

const NVIDIA_API_KEY = (import.meta.env.VITE_NVIDIA_API_KEY || '').trim();
const API_URL = "/api/nvidia/v1/chat/completions";

/**
 * Send a single text prompt to NVIDIA API and return the response text.
 * @param {string} prompt
 * @returns {Promise<string>}
 */
async function askAI(prompt) {
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${NVIDIA_API_KEY}`
    },
    body: JSON.stringify({
      model: "meta/llama-3.1-8b-instruct",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      max_tokens: 512,
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.detail || `NVIDIA API error: ${res.status}`);
  }

  const data = await res.json();
  return data?.choices?.[0]?.message?.content?.trim() ?? '';
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

  return askAI(prompt);
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

  const text = await askAI(prompt);
  // Extract JSON array from response (guard against markdown code fences)
  const match = text.match(/\[[\s\S]*\]/);
  if (!match) return ['Could not parse insights. Please try again.'];
  return JSON.parse(match[0]);
}
