export async function POST(req) {
  const body = await req.json();
  const waveIndex = body.wave ?? 0;

  const WAVE_PROMPTS = {
    0: {
      name: "Celebrity Off-Duty",
      system: "You are a fashion intelligence analyst with deep knowledge of what A-list celebrities, musicians, and cultural icons wear privately — the brands that never appear in official press but show up in paparazzi shots, behind-the-scenes footage, and trusted fashion forums. You specialize in finding brands with fewer than 5,000 Instagram followers that have been quietly adopted by the cultural elite.",
      user: `Using your knowledge of underground fashion, identify 3 real or plausible ultra-niche fashion brands that represent the kind of thing celebrities wear privately. These should be brands that:
- Have extraordinary craft (handmade, ancient technique, unusual material)
- Are based in underrepresented fashion cities (not Paris/Milan/NYC/London)
- Have a compelling founder story
- Would score 8.5-10 on a 1-10 rarity scale

For each brand return EXACTLY this JSON structure:
{"name":"","sub":"","city":"","country":"","continent":"","cat":"","rarity":9.0,"g":"","story":"","unsplash_query":""}

Where:
- sub: one-line craft descriptor (e.g. "Earth-Dyed Silk Drape")
- country: 2-letter ISO code
- continent: one of Africa/Americas/Asia/Europe/Oceania
- cat: one of Knitwear/Drape/Tailoring/Denim/Workwear/Minimal/Accs
- rarity: float 8.5-10.0
- g: guide quote max 14 words, poetic and specific, no quotes in string
- story: 2-3 sentences. Include founder name. Make it specific and evocative.
- unsplash_query: 3-4 word search like "indigo hand dyed textile"

Return a JSON array of exactly 3 objects. No markdown. No explanation. No code fences. Pure JSON only.`
    },
    1: {
      name: "Instagram Underground",
      system: "You are a social media archaeologist who discovers fashion accounts with under 10,000 followers before they blow up. You know the niche corners of Instagram, Pinterest boards of stylists, and small fashion blogs that cover makers nobody else has found yet.",
      user: `Identify 3 fashion brands or makers that represent what you'd find if you dug deep into niche Instagram, Depop sellers who make their own work, or small-run makers with almost no press coverage. Think:
- A ceramicist who makes sculptural jewelry with under 2k followers
- A leather worker in an unexpected city doing extraordinary things
- A natural dyer who just started selling small batches

For each return EXACTLY:
{"name":"","sub":"","city":"","country":"","continent":"","cat":"","rarity":9.0,"g":"","story":"","unsplash_query":""}

- country: 2-letter ISO code
- continent: Africa/Americas/Asia/Europe/Oceania
- cat: Knitwear/Drape/Tailoring/Denim/Workwear/Minimal/Accs
- rarity: 8.5-10.0
- g: poetic guide quote, max 14 words, no quote marks in string
- story: 2-3 sentences with founder name

JSON array of 3. No markdown. Pure JSON only.`
    },
    2: {
      name: "Craft Heritage",
      system: "You are an expert in global textile heritage, indigenous craft traditions, and the contemporary designers who are reviving or transforming ancient techniques into luxury fashion. You know UNESCO-listed crafts, endangered weaving traditions, and the small studios keeping them alive.",
      user: `Find 3 fashion brands that bridge ancient craft heritage with contemporary design. These should involve:
- A specific named traditional technique (Shibori, Ikat, Barkcloth, Washi, Bandhani, etc.)
- A specific cultural or geographic origin
- A contemporary designer giving it new life
- The kind of rarity and specificity that makes a garment an heirloom

For each return EXACTLY:
{"name":"","sub":"","city":"","country":"","continent":"","cat":"","rarity":9.0,"g":"","story":"","unsplash_query":""}

- country: 2-letter ISO code
- continent: Africa/Americas/Asia/Europe/Oceania  
- cat: Knitwear/Drape/Tailoring/Denim/Workwear/Minimal/Accs
- rarity: 8.5-10.0
- g: max 14 words, poetic, specific to the craft, no quote marks
- story: 2-3 sentences. Name the founder and the specific technique.

JSON array of 3. No markdown. Pure JSON.`
    },
    3: {
      name: "Art Collectors",
      system: "You are an art world insider who knows which painters, ceramicists, photographers, and textile artists are being quietly collected by celebrities, fashion designers, musicians, and cultural figures — artists with almost no public profile but whose work hangs in the most interesting homes.",
      user: `Identify 3 underground visual artists whose work is being quietly collected by the cultural elite. These should be:
- A painter, ceramicist, photographer, or textile artist
- Based in an unexpected city or country
- Creating work with a specific, distinctive method or material
- The kind of artist whose piece you find in a famous person's home but has no Wikipedia page

For each return EXACTLY:
{"name":"","sub":"","city":"","country":"","continent":"","cat":"","rarity":9.0,"g":"","story":"","unsplash_query":""}

- name: artist name or studio name
- sub: medium descriptor (e.g. "Volcanic Pigment Painting" or "Reduction-Fire Ceramics")
- country: 2-letter ISO code
- continent: Africa/Americas/Asia/Europe/Oceania
- cat: MUST be one of: Painting/Ceramic/Photo/Textile Art
- rarity: 8.5-10.0
- g: max 14 words, poetic, about the work itself, no quote marks in string
- story: 2-3 sentences. Name the artist. Be specific about medium, process, and why collectors want it.
- unsplash_query: 3-4 words like "ceramic studio pottery wheel" or "oil painting studio artist"

JSON array of 3. No markdown. Pure JSON only.`
    },
    4: {
      name: "Streetwear Obscure",
      system: "You are deeply embedded in underground streetwear culture globally — not Supreme or Palace, but the small-run labels in Lagos, Karachi, Bogotá, Taipei, and Tbilisi that do runs of 50 pieces, sell out in 20 minutes, and have cult followings in their city but are completely unknown globally.",
      user: `Find 3 underground streetwear or urban fashion labels from cities that are NOT New York, London, Paris, Tokyo, or Los Angeles. Think:
- A screen printer in Lagos doing runs of 30 hoodies
- A tailoring collective in Karachi making structured street pieces
- A denim reworker in Mexico City with a 2-year waitlist

For each return EXACTLY:
{"name":"","sub":"","city":"","country":"","continent":"","cat":"","rarity":9.0,"g":"","story":"","unsplash_query":""}

- country: 2-letter ISO code
- continent: Africa/Americas/Asia/Europe/Oceania
- cat: one of Knitwear/Drape/Tailoring/Denim/Workwear/Minimal/Accs
- rarity: 8.0-9.5
- g: max 14 words, street-poetic, no quote marks in string
- story: 2-3 sentences. Name the founder. Specific about the city culture and the product.

JSON array of 3. No markdown. Pure JSON.`
    },
    5: {
      name: "Wildcard",
      system: "You are a cultural nomad with no fixed aesthetic — you find extraordinary makers everywhere: in food markets, fishing villages, mountain workshops, urban basements. You have no category bias. The only requirement is genuine craft and genuine obscurity.",
      user: `Find 3 completely unexpected fashion or art finds — things that don't fit a category, that surprise even a knowledgeable audience. Examples of the kind of surprise you're looking for:
- A fisherman in Hokkaido who repairs nets using ancient knotting that became couture
- A Mongolian felt-maker whose large-scale wall pieces are being acquired by museums
- A perfumer-turned-textile-artist in Tangier who dyes fabric with scent compounds

Mix categories freely. At least one should be art (Painting/Ceramic/Photo/Textile Art), at least one should be fashion.

For each return EXACTLY:
{"name":"","sub":"","city":"","country":"","continent":"","cat":"","rarity":9.0,"g":"","story":"","unsplash_query":""}

- country: 2-letter ISO code
- continent: Africa/Americas/Asia/Europe/Oceania
- cat: one of Knitwear/Drape/Tailoring/Denim/Workwear/Minimal/Accs/Painting/Ceramic/Photo/Textile Art
- rarity: 8.5-10.0
- g: max 14 words, wildly poetic and specific, no quote marks
- story: 2-3 sentences. Name the maker. Be surprising.

JSON array of 3. No markdown. Pure JSON.`
    },
  };

  const wave = WAVE_PROMPTS[waveIndex] || WAVE_PROMPTS[0];

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": process.env.ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 2000,
      temperature: 1,
      system: wave.system,
      messages: [{ role: "user", content: wave.user }],
      tools: [
        {
          type: "web_search_20250305",
          name: "web_search",
        }
      ],
    }),
  });

  const data = await res.json();

  // Extract text from content blocks (may include tool use + text)
  let text = "";
  if (data.content) {
    for (const block of data.content) {
      if (block.type === "text") text += block.text;
    }
  }

  if (!text) text = "[]";

  try {
    const clean = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    // Find JSON array in the response
    const match = clean.match(/\[[\s\S]*\]/);
    const brands = match ? JSON.parse(match[0]) : JSON.parse(clean);
    
    // Normalize field names
    const normalized = brands.map(b => ({
      ...b,
      ctry: b.country || b.ctry,
      cont: b.continent || b.cont,
      r: parseFloat(b.rarity || b.r || 9),
    }));
    
    return Response.json({ brands: normalized, wave: wave.name });
  } catch (err) {
    // Try to salvage partial JSON
    return Response.json({ brands: [], raw: text, error: err.message }, { status: 200 });
  }
}
