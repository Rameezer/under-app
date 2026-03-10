export async function POST(req) {
  const { intel, existing, regenField } = await req.json();

  const isArt = ["Painting","Ceramic","Photo","Textile Art"].includes(existing?.cat);

  // If regenerating a single field
  if (regenField) {
    const FIELD_PROMPTS = {
      name: `Given this intel about an underground ${isArt?"artist":"fashion brand"}: "${intel}"
Return ONLY a JSON object with one key: {"name": "BRAND NAME"}
The name should be short (1-3 words), evocative, and feel like an underground label. All caps or title case. No explanation.`,

      sub: `Given this intel: "${intel}" and brand name "${existing?.name}"
Return ONLY: {"sub": "one-line craft descriptor"}
Examples: "Hand-Dyed Indigo Knitwear" / "Earth Pigment Painting" / "Resist-Dye Couture"
Max 5 words. Title case. No explanation.`,

      story: `Given this intel about ${existing?.name||"this brand"}: "${intel}"
Write a 2-sentence story in ÜNDER's voice. Rules:
- Include the founder's name (invent one if not given, make it culturally appropriate to the city)
- Be specific about the craft, material, or technique
- Make it feel like insider knowledge, not a press release
- Do NOT use phrases like "embodies" "journey" "passion" "innovative"
Return ONLY: {"story": "Two sentences here."}`,

      g: `Given this intel about ${existing?.name||"this brand"}: "${intel}"
Write the Guide's quote — a short, poetic, specific observation. Rules:
- Max 14 words
- Should feel like something a knowledgeable friend would say
- Specific detail beats vague praise (mention material, process, or specific fact)
- Examples: "72 hours in indigo. You can smell the craft." / "Three cobblers. 200 pairs a year. Every customer known by name."
Return ONLY: {"g": "the quote here without surrounding quote marks"}`,

      r: `Given this intel: "${intel}" and category "${existing?.cat}"
Score the rarity on a scale of 8.0-10.0 based on: obscurity, craft quality, geographic uniqueness, cultural significance, celebrity adjacency if mentioned.
Return ONLY: {"r": 9.3}`,
    };

    const prompt = FIELD_PROMPTS[regenField];
    if (!prompt) return Response.json({});

    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "Content-Type":"application/json","x-api-key":process.env.ANTHROPIC_API_KEY,"anthropic-version":"2023-06-01" },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 300,
        system: "You are ÜNDER's editorial voice — a knowledgeable, poetic fashion and art intelligence. You write with specificity, restraint, and insider confidence. Never use clichés. Always return valid JSON only, no markdown, no explanation.",
        messages: [{ role:"user", content:prompt }],
      }),
    });
    const data = await res.json();
    const text = (data.content?.[0]?.text||"{}").replace(/```json\n?|```\n?/g,"").trim();
    try { return Response.json(JSON.parse(text)); }
    catch { return Response.json({}); }
  }

  // Full generation
  const prompt = `You are ÜNDER's editorial intelligence. Transform raw intel into a complete brand profile.

INTEL FROM THE EDITOR:
"${intel}"

${existing?.cat ? `Category hint: ${existing.cat}` : ""}
${existing?.name ? `Name hint: ${existing.name}` : ""}

Return a JSON object with ALL of these fields:

{
  "name": "BRAND NAME (1-3 words, all caps or title case, evocative)",
  "sub": "Craft Descriptor (3-5 words, Title Case, specific to the technique)",
  "city": "City name",
  "ctry": "2-letter ISO country code",
  "cont": "one of: Africa/Americas/Asia/Europe/Oceania",
  "cat": "one of: Knitwear/Drape/Tailoring/Denim/Workwear/Minimal/Accs/Painting/Ceramic/Photo/Textile Art",
  "r": 9.3,
  "color": "one of: #FF6B35/#00E5FF/#7CFF50/#FF2D9B/#A855F7/#00FFBB/#FFD700",
  "g": "Guide quote — max 14 words, poetic, specific, NO surrounding quote marks in this string",
  "story": "2-3 sentences. Include founder name (invent if needed, culturally appropriate). Specific about craft, material, process. Feel like insider knowledge."
}

Rules for the writing:
- NEVER use: embodies, journey, passion, innovative, sustainable, curated, aesthetic
- DO use: specific material names, specific processes, specific numbers, founder's full name
- The guide quote should sound like something a knowledgeable friend would say, not a caption
- Rarity score based on: obscurity, craft quality, geographic uniqueness, cultural significance
- Color should feel right for the brand's vibe

Return ONLY valid JSON. No markdown. No explanation. No code fences.`;

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type":"application/json","x-api-key":process.env.ANTHROPIC_API_KEY,"anthropic-version":"2023-06-01" },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 800,
      system: "You are ÜNDER's editorial voice — a knowledgeable, poetic fashion and art intelligence with deep knowledge of global craft traditions. You write with specificity, restraint, and insider confidence. You never use clichés. Always return valid JSON only.",
      messages: [{ role:"user", content:prompt }],
    }),
  });

  const data = await res.json();
  const text = (data.content?.[0]?.text||"{}").replace(/```json\n?|```\n?/g,"").trim();
  try {
    const match = text.match(/\{[\s\S]*\}/);
    return Response.json(match ? JSON.parse(match[0]) : JSON.parse(text));
  } catch {
    return Response.json({ error:"parse failed", raw:text }, { status:200 });
  }
}
