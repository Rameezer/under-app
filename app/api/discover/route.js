import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const PROMPTS = [
  `Find 3 ultra-niche underground fashion brands that A-list celebrities have been spotted wearing but are virtually unknown to the public. Focus on brands from Africa, Asia, or South America with extraordinary craft. For each brand provide: name, sub (one-line craft descriptor), city, country (2-letter code), continent (one of: Africa/Americas/Asia/Europe/Oceania), cat (one of: Knitwear/Drape/Tailoring/Denim/Workwear/Minimal/Accs), rarity (number 8.5-10), g (guide note max 12 words, poetic and specific), story (2 sentences, include founder name). Return as a valid JSON array only. No markdown, no explanation, no preamble.`,

  `Discover 3 hidden luxury fashion ateliers that celebrities wear on off-duty days — brands that deliberately avoid press and have no PR. Must have extraordinary craft and unusual materials or techniques. For each: name, sub, city, country (2-letter code), continent (Africa/Americas/Asia/Europe/Oceania), cat (Knitwear/Drape/Tailoring/Denim/Workwear/Minimal/Accs), rarity (8.5-10), g (poetic guide line, max 12 words), story (2 sentences with founder name). Valid JSON array only.`,

  `Find 3 ancient-craft-meets-contemporary-design fashion brands — traditional techniques from indigenous or artisan communities elevated to luxury. The kind worn by style icons who know things others don't. For each: name, sub, city, country (2-letter code), continent (Africa/Americas/Asia/Europe/Oceania), cat (Knitwear/Drape/Tailoring/Denim/Workwear/Minimal/Accs), rarity (8.5-10), g (guide quote max 12 words), story (2 sentences with founder name). Valid JSON array only.`,
];

export async function POST(req) {
  try {
    const { wave } = await req.json();
    const prompt = PROMPTS[wave] || PROMPTS[0];

    const msg = await client.messages.create({
      model: "claude-opus-4-5",
      max_tokens: 1500,
      system: "You are a fashion intelligence agent specializing in discovering ultra-niche underground brands worn by celebrities. You have deep knowledge of global artisan fashion, street style, and which obscure labels celebrities quietly wear. Always respond with valid JSON arrays only — no markdown, no preamble, no explanation, no backticks.",
      messages: [{ role: "user", content: prompt }],
    });

    const text = msg.content[0]?.text || "[]";
    const clean = text.replace(/```json|```/g, "").trim();
    const brands = JSON.parse(clean);

    return Response.json({ brands });
  } catch (err) {
    console.error("Discover error:", err);
    return Response.json({ brands: [], error: err.message }, { status: 500 });
  }
}
