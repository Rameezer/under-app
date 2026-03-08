export async function POST(req) {
  const body = await req.json();
  const promptIndex = body.promptIndex ?? body.wave ?? 0;

  const SEARCH_PROMPTS = [
    "Find 3 ultra-niche underground fashion brands that A-list celebrities have been spotted wearing but are virtually unknown to the public. Focus on brands from Africa, Asia, or South America with extraordinary craft. For each brand provide these exact fields: name, sub (one-line craft descriptor), city, country (2-letter code), continent (one of: Africa/Americas/Asia/Europe/Oceania), cat (one of: Knitwear/Drape/Tailoring/Denim/Workwear/Minimal/Accs), rarity (number 8.5-10), g (guide note max 12 words, poetic and specific), story (2 sentences, include founder name), unsplash_query (3-4 word photo search). Return a valid JSON array only. No markdown, no explanation, no extra text.",
    "Discover 3 hidden luxury fashion ateliers that celebrities wear on off-duty days — brands that deliberately avoid press and have no PR. Must have extraordinary craft and unusual materials or techniques. For each provide: name, sub, city, country (2-letter code), continent (Africa/Americas/Asia/Europe/Oceania), cat (Knitwear/Drape/Tailoring/Denim/Workwear/Minimal/Accs), rarity (8.5-10), g (poetic guide note max 12 words), story (2 sentences with founder name), unsplash_query. JSON array only, no other text.",
    "Find 3 ancient-craft-meets-contemporary-design fashion brands using traditional techniques from indigenous or artisan communities, elevated to luxury. The kind worn by style icons who know things others don't. For each: name, sub, city, country (2-letter code), continent (Africa/Americas/Asia/Europe/Oceania), cat (Knitwear/Drape/Tailoring/Denim/Workwear/Minimal/Accs), rarity (8.5-10), g (guide quote max 12 words), story (2 sentences with founder name), unsplash_query. JSON array only.",
  ];

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": process.env.ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1500,
      system: "You are a fashion intelligence agent specializing in discovering ultra-niche underground brands worn by celebrities. Always respond with valid JSON arrays only — no markdown, no preamble, no code fences.",
      messages: [{ role: "user", content: SEARCH_PROMPTS[promptIndex] }],
    }),
  });

  const data = await res.json();
  const text = data.content?.[0]?.text || "[]";

  try {
    const clean = text.replace(/```json|```/g, "").trim();
    const brands = JSON.parse(clean);
    return Response.json({ brands });
  } catch {
    return Response.json({ brands: [], raw: text }, { status: 200 });
  }
}
