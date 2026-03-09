'use client';
import { useState, useEffect, useRef, useCallback } from "react";

const SUPABASE_URL = "https://geqqyxrmdxwwyyddxohc.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdlcXF5eHJtZHh3d3l5ZGR4b2hjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI5OTU0NzcsImV4cCI6MjA4ODU3MTQ3N30.0E3K0sfEAicGq4cKBqk_N2TdIrLs10pNgrGe_KC-z6Y";

const FALLBACK_DB = [
  {id:1,  name:"VESSEL",        sub:"Hand-Dyed Knitwear",        city:"New Orleans", ctry:"US", cont:"Americas", cat:"Knitwear",  r:9.2, color:"#FF6B35", img:"https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=90", g:"Every piece bathed in indigo 72 hours. You can smell the craft.", story:"Maya Chen started VESSEL in her grandmother's kitchen using indigo recipes from coastal Louisiana. A 72-hour ritual, never repeated."},
  {id:2,  name:"RUST & CLOTH",  sub:"Reclaimed Workwear",        city:"Detroit",     ctry:"US", cont:"Americas", cat:"Workwear",  r:8.7, color:"#00E5FF", img:"https://images.unsplash.com/photo-1542272604-787c3835535d?w=800&q=90", g:"Dead-stock from a factory closed in '87. Literal history on your back.", story:"James Okafor tracked down dead-stock denim from his father's closed Ford plant. Every serial number tells a story."},
  {id:3,  name:"GROVE",         sub:"Earth-Pigment Textiles",    city:"Oaxaca",      ctry:"MX", cont:"Americas", cat:"Knitwear",  r:9.6, color:"#7CFF50", img:"https://images.unsplash.com/photo-1504703395950-b89145a5425b?w=800&q=90", g:"Cochineal beetle pigment. Ancient dye. Wild silhouette.", story:"Sofía Ruiz grinds cochineal beetles for pigment just as her great-aunt did. GROVE refuses to simplify that knowledge for anyone."},
  {id:4,  name:"KINFOLK",       sub:"Patchwork Tailoring",       city:"Atlanta",     ctry:"US", cont:"Americas", cat:"Tailoring", r:8.4, color:"#FF2D9B", img:"https://images.unsplash.com/photo-1509631179647-0177331693ae?w=800&q=90", g:"12 fabric origins per jacket. 12 stories, one garment.", story:"Marcus Webb collected vintage West African wax print for a decade before cutting a single piece. Each jacket is an atlas."},
  {id:5,  name:"DUSK",          sub:"Noir Drape",                city:"Lagos",       ctry:"NG", cont:"Africa",   cat:"Drape",    r:9.1, color:"#A855F7", img:"https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=800&q=90", g:"Nollywood costume designer turned couturier. Drama is the point.", story:"Adaeze Obi spent eight years in Nollywood before bringing that drama to ready-to-wear. DUSK commands every room."},
  {id:6,  name:"BLOC",          sub:"Mono Sculpture",            city:"Seoul",       ctry:"KR", cont:"Asia",     cat:"Minimal",  r:9.4, color:"#00FFBB", img:"https://images.unsplash.com/photo-1509631179647-0177331693ae?w=800&q=90", g:"Six years of architecture. The seams are structural decisions.", story:"Park Ji-ho trained as an architect. At BLOC, every silhouette is engineered — geometry first, everything follows."},
  {id:7,  name:"TERRA",         sub:"Raw Earth Cuts",            city:"Marrakech",   ctry:"MA", cont:"Africa",   cat:"Drape",    r:8.9, color:"#FFD700", img:"https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800&q=90", g:"Clay-washed linen aged 30 days in Marrakech sun.", story:"Fatima Al-Rashid ages every piece in Moroccan sun for a full month. You inherit it — you don't buy it."},
  {id:8,  name:"NUIT",          sub:"Midnight Drape",            city:"Paris",       ctry:"FR", cont:"Europe",   cat:"Drape",    r:9.3, color:"#FF6B35", img:"https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800&q=90", g:"Two yards of silk. No seams. Pure geometry and a decade of obsession.", story:"Céleste Moreau uses exactly two yards of silk per piece. Every garment achieved through geometry alone."},
  {id:9,  name:"HAZE",          sub:"Washed Denim Art",          city:"Tokyo",       ctry:"JP", cont:"Asia",     cat:"Denim",    r:8.8, color:"#00E5FF", img:"https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=800&q=90", g:"180 days in salt water. No two pieces share a fade.", story:"Kenji Mori submerges every jacket for exactly 180 days. The ocean does the design work."},
  {id:10, name:"AGBADA CO.",    sub:"Deconstructed Traditional", city:"Lagos",       ctry:"NG", cont:"Africa",   cat:"Tailoring",r:9.3, color:"#7CFF50", img:"https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=800&q=90", g:"Agbada geometry rebuilt for the contemporary body.", story:"Chidi Nwosu pulls apart traditional Agbada and rebuilds it for modern silhouettes. An argument about what inheritance means."},
  {id:11, name:"LOOM",          sub:"Handwoven Luxury",          city:"Accra",       ctry:"GH", cont:"Africa",   cat:"Knitwear", r:9.4, color:"#FF2D9B", img:"https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=800&q=90", g:"Three weeks to weave one yard. Berlin-trained, Accra-rooted.", story:"Abena Owusu studied textile engineering in Berlin and went back home. LOOM is where both educations meet."},
  {id:12, name:"BARKCLOTH",     sub:"Ancient Textile Revival",   city:"Kampala",     ctry:"UG", cont:"Africa",   cat:"Drape",    r:9.7, color:"#A855F7", img:"https://images.unsplash.com/photo-1523381294911-8d3cead13475?w=800&q=90", g:"Hammered fig bark. 600-year-old technique. UNESCO knows it. Fashion doesn't.", story:"Uganda's barkcloth tradition is UNESCO-listed. This studio hammers fig bark into luxury fabric, one sheet at a time."},
  {id:13, name:"MU",            sub:"Negative Space Tailoring",  city:"Tokyo",       ctry:"JP", cont:"Asia",     cat:"Minimal",  r:9.6, color:"#00FFBB", img:"https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=800&q=90", g:"MU means nothingness. More void than fabric. The absence is load-bearing.", story:"Haruto Sato designs around what isn't there. The negative space in every MU garment is the whole point."},
  {id:14, name:"SHIBORI LAB",   sub:"Resist-Dye Research",       city:"Kyoto",       ctry:"JP", cont:"Asia",     cat:"Knitwear", r:9.4, color:"#FFD700", img:"https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=90", g:"300 shibori techniques documented. Each season uses exactly three.", story:"Part fashion brand, part research institution. SHIBORI LAB documents ancient dye techniques and applies three per collection."},
  {id:15, name:"HANJI",         sub:"Korean Paper Textiles",     city:"Seoul",       ctry:"KR", cont:"Asia",     cat:"Minimal",  r:9.8, color:"#FF6B35", img:"https://images.unsplash.com/photo-1517841905240-472988babdf9?w=800&q=90", g:"Clothes from Korean mulberry paper. Impossibly light. I own two pieces.", story:"HANJI weaves Korean mulberry paper into wearable textiles. An ancient technique, impossibly light."},
  {id:16, name:"BORO REVIVAL",  sub:"Japanese Boro Patchwork",   city:"Kyoto",       ctry:"JP", cont:"Asia",     cat:"Denim",    r:9.5, color:"#00E5FF", img:"https://images.unsplash.com/photo-1475178626620-a4d074967452?w=800&q=90", g:"Centuries-old Japanese repair culture. This is its living heir.", story:"Yuki Tanaka studies museum Boro textiles and reinterprets the patchwork tradition using contemporary Japanese indigo."},
  {id:17, name:"DHAKA THREAD",  sub:"Muslin Ultra-Fine",         city:"Dhaka",       ctry:"BD", cont:"Asia",     cat:"Drape",    r:9.8, color:"#7CFF50", img:"https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=800&q=90", g:"Mughals called it woven air. Three master weavers remain.", story:"DHAKA THREAD revives Dhaka muslin — so fine Mughal emperors were buried in it. Three remaining weavers keep it alive."},
  {id:18, name:"PINA STUDIO",   sub:"Pineapple Fibre Luxury",    city:"Manila",      ctry:"PH", cont:"Asia",     cat:"Drape",    r:9.5, color:"#FF2D9B", img:"https://images.unsplash.com/photo-1551803091-e20673f15770?w=800&q=90", g:"Piña — pineapple leaf fibre. Lighter than silk. Most luxurious thing you've never touched.", story:"PINA STUDIO revives weaving Piña, the finest fabric most people have never heard of."},
  {id:19, name:"IKAT HOUSE",    sub:"Traditional Ikat Weave",    city:"Jaipur",      ctry:"IN", cont:"Asia",     cat:"Drape",    r:9.1, color:"#A855F7", img:"https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=800&q=90", g:"Pattern dyed into thread before the loom is touched. Ancient mathematics.", story:"Priya Sharma works with 23 Rajasthani weavers on Ikat — where pattern is dyed before weaving begins."},
  {id:20, name:"TERRA NOVA",    sub:"Dark Wax Print",            city:"Yogyakarta",  ctry:"ID", cont:"Asia",     cat:"Drape",    r:9.0, color:"#00FFBB", img:"https://images.unsplash.com/photo-1523381294911-8d3cead13475?w=800&q=90", g:"Batik in black on black. The pattern only visible in motion.", story:"Traditional Javanese batik technique in black on black. The design reveals itself only as the fabric moves."},
  {id:21, name:"ADIRE ATELIER", sub:"Resist-Dye Couture",        city:"Ibadan",      ctry:"NG", cont:"Africa",   cat:"Drape",    r:9.5, color:"#FFD700", img:"https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=800&q=90", g:"Yoruba resist-dye at couture scale. The dye is a collaborator.", story:"ADIRE ATELIER elevates Yoruba resist-dyeing to couture. Designer and dye collaborate — neither fully in control."},
  {id:22, name:"MAASAI MOD",    sub:"Beadwork Modernism",        city:"Nairobi",     ctry:"KE", cont:"Africa",   cat:"Accs",     r:9.2, color:"#FF6B35", img:"https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=800&q=90", g:"Maasai beadwork on modernist silhouettes. Joint credit. Nothing like it.", story:"Wanjiru Kamau works with Maasai cooperatives. Equal credit and payment for both maker and designer."},
  {id:23, name:"NDEBELE NOW",   sub:"Geometric Bead Architecture",city:"Jo'burg",   ctry:"ZA", cont:"Africa",   cat:"Accs",     r:9.4, color:"#00E5FF", img:"https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&q=90", g:"Ndebele beadwork so precise it functions like architecture.", story:"Nomsa Dlamini translates Ndebele's bold geometric traditions into wearable fashion structures."},
  {id:24, name:"CAIRO DRAPE",   sub:"Pharaonic Linen",           city:"Cairo",       ctry:"EG", cont:"Africa",   cat:"Drape",    r:9.0, color:"#7CFF50", img:"https://images.unsplash.com/photo-1551803091-e20673f15770?w=800&q=90", g:"From a mill since 1923. Same quality as fabric found in tombs.", story:"CAIRO DRAPE works with a family-run linen mill since 1923. The fabric is identical to what archaeologists find in ancient tombs."},
  {id:25, name:"RIFT",          sub:"East African Minimalism",   city:"Addis Ababa", ctry:"ET", cont:"Africa",   cat:"Minimal",  r:8.9, color:"#FF2D9B", img:"https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800&q=90", g:"Studied in Tokyo, came back to Addis. Couldn't stop thinking about both.", story:"Mekdes Haile studied in Tokyo then returned home. RIFT is what Ethiopia and Japan say to each other."},
  {id:26, name:"ATELIER BRUT",  sub:"Raw Edge Couture",          city:"Paris",       ctry:"FR", cont:"Europe",   cat:"Tailoring",r:9.2, color:"#A855F7", img:"https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=800&q=90", g:"Finished edges are a lie. BRUT lets fabric be what it wants.", story:"Mathilde Rousseau believes finishing is dishonest. Every BRUT piece has its raw edge as its central feature."},
  {id:27, name:"SUOLO",         sub:"Handmade Footwear",         city:"Florence",    ctry:"IT", cont:"Europe",   cat:"Accs",     r:9.1, color:"#00FFBB", img:"https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=90", g:"Three cobblers. One workshop. 200 pairs a year. 40 hours each.", story:"Three cobblers in Florence, one workshop. 200 pairs maximum a year. Every customer is known by name."},
  {id:28, name:"STOFF",         sub:"Deadstock Luxury",          city:"Berlin",      ctry:"DE", cont:"Europe",   cat:"Minimal",  r:8.8, color:"#FFD700", img:"https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=800&q=90", g:"Only deadstock. No two seasons share a single fabric.", story:"STOFF buys end-of-run luxury fabrics from European mills. What's available defines everything."},
  {id:29, name:"SISU",          sub:"Arctic Functional Luxury",  city:"Helsinki",    ctry:"FI", cont:"Europe",   cat:"Workwear", r:9.0, color:"#FF6B35", img:"https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=800&q=90", g:"Designed for -30°C. Looks extraordinary at any temperature.", story:"Finnish designers who grew up dressing for brutal winters. SISU makes gear that looks extraordinary everywhere."},
  {id:30, name:"TIERRA VIVA",   sub:"Andean Textile Revival",    city:"Lima",        ctry:"PE", cont:"Americas", cat:"Knitwear", r:9.4, color:"#00E5FF", img:"https://images.unsplash.com/photo-1591085686350-798c0f9faa7f?w=800&q=90", g:"Andean weaving unchanged 3,000 years. The patterns are archaeological records.", story:"TIERRA VIVA works with indigenous Andean weavers on textiles using pre-Columbian techniques."},
  {id:31, name:"SELVA",         sub:"Amazonian Bark Textile",    city:"Manaus",      ctry:"BR", cont:"Americas", cat:"Drape",    r:9.6, color:"#7CFF50", img:"https://images.unsplash.com/photo-1518611012118-696072aa579a?w=800&q=90", g:"The Amazon literally becomes fashion. Every purchase funds land rights.", story:"SELVA works with Amazonian communities on bark textiles. Every purchase funds rainforest land rights."},
  {id:32, name:"SUZANI HOUSE",  sub:"Embroidered Textile Art",   city:"Tashkent",    ctry:"UZ", cont:"Asia",     cat:"Drape",    r:9.5, color:"#FF2D9B", img:"https://images.unsplash.com/photo-1516762689617-e1cffcef479d?w=800&q=90", g:"Months of embroidery by multiple women. You wear someone's months.", story:"SUZANI HOUSE repurposes antique Central Asian wedding textiles — months of embroidery — into wearable art."},
  {id:33, name:"FELT ROAD",     sub:"Nomadic Felt Tradition",    city:"Almaty",      ctry:"KZ", cont:"Asia",     cat:"Accs",     r:9.3, color:"#A855F7", img:"https://images.unsplash.com/photo-1518611012118-696072aa579a?w=800&q=90", g:"Kazakh felt-making. 5,000-year-old process. It shows in the weight.", story:"FELT ROAD preserves Kazakh nomadic felt-making in wearable form. Five thousand years in every piece."},
  {id:34, name:"TAPA CLOTH",    sub:"Pacific Bark Cloth Couture",city:"Suva",        ctry:"FJ", cont:"Oceania",  cat:"Drape",    r:9.7, color:"#00FFBB", img:"https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&q=90", g:"Fijian bark cloth as couture. Ancient Pacific craft, global fashion.", story:"TAPA CLOTH preserves the Fijian tradition of beating mulberry bark into fabric with geometric prints."},
  {id:35, name:"SALTBUSH",      sub:"Desert Plant Dye",          city:"Alice Springs",ctry:"AU",cont:"Oceania",  cat:"Drape",    r:9.3, color:"#FFD700", img:"https://images.unsplash.com/photo-1504703395950-b89145a5425b?w=800&q=90", g:"Central Australian desert plants as colour palette. The Outback is in every thread.", story:"SALTBUSH works with Aboriginal communities to use desert plants for natural dyeing."},
  {id:36, name:"VADMAL",        sub:"Norse Wool Heritage",       city:"Bergen",      ctry:"NO", cont:"Europe",   cat:"Knitwear", r:9.1, color:"#FF6B35", img:"https://images.unsplash.com/photo-1542272604-787c3835535d?w=800&q=90", g:"Vadmal was Viking wool. This is its modern heir.", story:"VADMAL uses the same dense Norse wool technique as Viking-era fabric. Medieval technology worn now."},
  {id:37, name:"MEND",          sub:"Visible Repair Culture",    city:"Brooklyn",    ctry:"US", cont:"Americas", cat:"Denim",    r:8.9, color:"#00E5FF", img:"https://images.unsplash.com/photo-1475178626620-a4d074967452?w=800&q=90", g:"The repairs ARE the design. Sashiko stitching makes damage beautiful.", story:"MEND sells pre-repaired jeans using Sashiko stitching. The damage is the aesthetic, the repair is the garment."},
  {id:38, name:"SILT",          sub:"River-Dyed Cotton",         city:"Memphis",     ctry:"US", cont:"Americas", cat:"Knitwear", r:9.0, color:"#7CFF50", img:"https://images.unsplash.com/photo-1516762689617-e1cffcef479d?w=800&q=90", g:"Mississippi River water. Different dye reactions every season.", story:"SILT discovered the Mississippi produces unique dye reactions each season. Every collection is a geological record."},
  {id:39, name:"DISHDASHA LAB", sub:"Gulf Garment Reimagined",   city:"Dubai",       ctry:"AE", cont:"Asia",     cat:"Minimal",  r:9.2, color:"#FF2D9B", img:"https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=800&q=90", g:"The dishdasha deconstructed into global fashion. About time.", story:"Ahmed Al-Mansoori asks why Gulf garments haven't evolved globally like Japanese silhouettes. DISHDASHA LAB is his answer."},
  {id:40, name:"KEFFIYEH CO.",  sub:"Cultural Textile Couture",  city:"Amman",       ctry:"JO", cont:"Asia",     cat:"Accs",     r:9.1, color:"#A855F7", img:"https://images.unsplash.com/photo-1504703395950-b89145a5425b?w=800&q=90", g:"The keffiyeh pattern as high fashion. Deeply intentional design.", story:"Lina Khalil explores the keffiyeh as a design language with full cultural acknowledgment and intent."},
  {id:41, name:"MAEDEUP",       sub:"Korean Knot Couture",       city:"Busan",       ctry:"KR", cont:"Asia",     cat:"Accs",     r:9.6, color:"#00FFBB", img:"https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&q=90", g:"8 years mastering Korean decorative knotting. It's the entire garment structure.", story:"Jisoo Park spent 8 years mastering Maedeup knotting before using it as the total structural language of her work."},
  {id:42, name:"BRUTA",         sub:"Brutalist Knitwear",        city:"Lisbon",      ctry:"PT", cont:"Europe",   cat:"Knitwear", r:8.9, color:"#FFD700", img:"https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800&q=90", g:"Lisbon's concrete brutalism in knitwear form. Real weight. Structural presence.", story:"Ana Costa knits to evoke the weight of Lisbon's brutalist buildings. These garments make their presence physically felt."},
  {id:43, name:"BANDHANI",      sub:"Tie-Dye Mastery",           city:"Kutch",       ctry:"IN", cont:"Asia",     cat:"Drape",    r:9.2, color:"#FF6B35", img:"https://images.unsplash.com/photo-1591085686350-798c0f9faa7f?w=800&q=90", g:"5,000 tiny knots per piece. One family, three generations.", story:"The Khatri family of Kutch has practiced Bandhani tie-dye for three generations. Global debut now."},
  {id:44, name:"HOLLOW",        sub:"Zero-Waste Streetwear",     city:"Portland",    ctry:"US", cont:"Americas", cat:"Workwear", r:8.1, color:"#00E5FF", img:"https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=800&q=90", g:"Every offcut becomes something. Their studio floor is genuinely spotless.", story:"Three RISD graduates committed to zero waste. Every scrap becomes the next piece."},
  {id:46, name:"OCHRE STUDIO",    sub:"Earth Pigment Painting",     city:"Oaxaca",      ctry:"MX", cont:"Americas", cat:"Painting",      r:9.6, color:"#FF6B35", img:"https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=800&q=90", g:"Volcano ash and clay. Colour you cannot buy in a tube.", story:"Elena Vasquez grinds volcanic minerals from Oaxacan highlands to create pigments unavailable anywhere else. Beyonce has three pieces. None are for sale."},
  {id:47, name:"CLAY MONK",        sub:"Ceremonial Ceramics",          city:"Kyoto",       ctry:"JP", cont:"Asia",     cat:"Ceramic",       r:9.8, color:"#00FFBB", img:"https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=800&q=90", g:"Three kiln firings. Each one a conversation with chance.", story:"Takeshi Yamamoto has been throwing clay in the same Kyoto studio for 31 years. His pieces take two years to acquire. The waiting list is the point."},
  {id:48, name:"VELUM",            sub:"Darkroom Silver Gelatin",      city:"Lagos",       ctry:"NG", cont:"Africa",   cat:"Photo",         r:9.4, color:"#A855F7", img:"https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=800&q=90", g:"Silver halide. Lagos light. Nothing digital has ever looked like this.", story:"Amara Osei shoots exclusively on large-format film in Lagos, printing in her own darkroom. Collectors say her photographs smell like the city they capture."},
  {id:49, name:"NOOR LOOM",        sub:"Hand-Knotted Textile Art",     city:"Fez",         ctry:"MA", cont:"Africa",   cat:"Textile Art",   r:9.5, color:"#FFD700", img:"https://images.unsplash.com/photo-1558171813-c36a2d4a9dcd?w=800&q=90", g:"Six months per piece. Some collectors wait three years.", story:"Fatima Benali and her four sisters have knotted wool tapestries in their family riad for two generations. The patterns are a private language only they can read."},
  {id:50, name:"ASH   {id:45, name:"CERRADO", IRON",       sub:"Abstract Fire Painting",       city:"Detroit",     ctry:"US", cont:"Americas", cat:"Painting",      r:9.1, color:"#00E5FF", img:"https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=800&q=90", g:"Motor city iron oxide and fire as medium. Industry as beauty.", story:"Marcus Webb burns automotive steel and captures the patina on canvas. His Detroit series has been quietly acquired by three major musicians who refuse to identify themselves."},
  {id:51, name:"SEOKSU",           sub:"Korean Celadon Revival",       city:"Seoul",       ctry:"KR", cont:"Asia",     cat:"Ceramic",       r:9.7, color:"#7CFF50", img:"https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=800&q=90", g:"Goryeo dynasty glaze. Twelve centuries of memory in the clay.", story:"Park Soohyun studied celadon archives for a decade before producing a single piece. The jade-green glaze has not been replicated since the 12th century until now."},
  {id:52, name:"BAST WORKS",       sub:"Bark Fibre Textile Art",       city:"Kampala",     ctry:"UG", cont:"Africa",   cat:"Textile Art",   r:9.6, color:"#FF2D9B", img:"https://images.unsplash.com/photo-1558171813-c36a2d4a9dcd?w=800&q=90", g:"Fig tree bark beaten into wall art. UNESCO craft as contemporary gallery piece.", story:"Ssali Mutebi transforms UNESCO-recognised Ugandan barkcloth into large-scale textile installations. Six international galleries hold pieces. None are labelled."},
  {id:53, name:"SILT PRESS",       sub:"River Sediment Photography",   city:"New Orleans", ctry:"US", cont:"Americas", cat:"Photo",         r:9.2, color:"#00FFBB", img:"https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=800&q=90", g:"Mississippi mud as developer. The river writes its own portrait.", story:"Josephine Tran uses Mississippi River sediment as a photographic developer, producing prints with a warmth no chemical process has matched. She makes 40 prints a year."},
  {id:54, name:"MERIDIAN INK",     sub:"Natural Pigment Abstraction",  city:"Jaipur",      ctry:"IN", cont:"Asia",     cat:"Painting",      r:9.3, color:"#FF6B35", img:"https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=800&q=90", g:"Pomegranate rind and indigo. Colours that come from the ground not a factory.", story:"Priya Nair grinds Rajasthani minerals and botanical matter into paint by hand, refusing synthetic pigment entirely. Her canvases cannot be reproduced. That is the whole point."},
  {id:55, name:"KUMO",             sub:"Paper Sculpture Art",          city:"Tokyo",       ctry:"JP", cont:"Asia",     cat:"Textile Art",   r:9.9, color:"#FFD700", img:"https://images.unsplash.com/photo-1558171813-c36a2d4a9dcd?w=800&q=90", g:"Washi paper folded into architecture. Each piece takes a month.", story:"Haruki Ono creates large-scale washi paper sculptures that function as both wall art and wearable objects. His work sits in the collection of three fashion houses and one emperor."},
  {id:45, name:"CERRADO",       sub:"Brazilian Cerrado Dye",     city:"São Paulo",   ctry:"BR", cont:"Americas", cat:"Drape",    r:9.0, color:"#7CFF50", img:"https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=800&q=90", g:"Dyed with endangered savanna plants. The biome is in the colour.", story:"CERRADO uses plants from Brazil's endangered Cerrado savanna. Conservation through couture."},
];

const CATS    = ["All","Knitwear","Drape","Tailoring","Denim","Workwear","Minimal","Accs","Painting","Ceramic","Photo","Textile Art"];
const ART_CATS = ["Painting","Ceramic","Photo","Textile Art"];
const CONTS   = ["All","Africa","Americas","Asia","Europe","Oceania"];
const PALETTE = ["#FF6B35","#00E5FF","#7CFF50","#FF2D9B","#A855F7","#00FFBB","#FFD700"];
const WHISPERS = [
  "The best-dressed people wear things you've never heard of.",
  "Real luxury is anonymity. The best brands whisper.",
  "These aren't brands — they're arguments.",
  "Touch the fabric. If it says something, buy it.",
  "You came for an outfit. You'll leave with a perspective.",
  "The painting on their wall tells you more than the jacket on their back.",
  "Art and fashion have always spoken the same language. We translate.",
  "The rarest finds are the ones that exist in only one home on earth.",
];
const PAGE = 14;
const shuffle = a => [...a].sort(() => Math.random() - 0.5);
const isArt = b => ART_CATS.includes(b?.cat);

async function fetchBrands() {
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/brands?select=*&order=r.desc`, {
      headers: {
        "apikey": SUPABASE_KEY,
        "Authorization": `Bearer ${SUPABASE_KEY}`,
      }
    });
    if (!res.ok) throw new Error("fetch failed");
    const data = await res.json();
    return data.length > 0 ? shuffle(data) : shuffle(FALLBACK_DB);
  } catch {
    return shuffle(FALLBACK_DB);
  }
}

export default function App() {
  const [tab, setTab]         = useState("feed");
  const [cat, setCat]         = useState("All");
  const [cont, setCont]       = useState("All");
  const [search, setSearch]   = useState("");
  const [saved, setSaved]     = useState({});
  const [page, setPage]       = useState(1);
  const [paging, setPaging]   = useState(false);
  const [db, setDb]           = useState(() => shuffle(FALLBACK_DB));
  const [dbLoading, setDbLoading] = useState(true);
  const [active, setActive]   = useState(null);
  const [guideOpen, setGuideOpen] = useState(false);
  const [guideQ, setGuideQ]   = useState("");
  const [guideR, setGuideR]   = useState("");
  const [guideL, setGuideL]   = useState(false);
  const [whisper, setWhisper] = useState(0);
  const [splash, setSplash]   = useState(true);
  
  const [showFilters, setShowFilters] = useState(false);
  const [heroIdx, setHeroIdx] = useState(0);
  const loaderRef             = useRef(null);

  useEffect(() => {
    const t1 = setTimeout(() => setSplash(false), 800);
    const t2 = setInterval(() => setWhisper(i => (i+1) % WHISPERS.length), 5500);
    const t3 = setInterval(() => setHeroIdx(i => (i+1) % 5), 4000);
    return () => { clearTimeout(t1); clearInterval(t2); clearInterval(t3); };
  }, []);

  useEffect(() => {
    fetchBrands().then(data => {
      setDb(data);
      setDbLoading(false);
    });
  }, []);

  const filtered = db.filter(b =>
    (cat  === "All" || b.cat  === cat)  &&
    (cont === "All" || b.cont === cont) &&
    (!search || [b.name,b.city,b.sub,b.ctry].some(s => s.toLowerCase().includes(search.toLowerCase())))
  );
  useEffect(() => setPage(1), [cat, cont, search]);
  const visible = filtered.slice(0, page * PAGE);
  const hasMore = visible.length < filtered.length;

  const onIntersect = useCallback(([e]) => {
    if (e.isIntersecting && hasMore && !paging) {
      setPaging(true);
      setTimeout(() => { setPage(p => p+1); setPaging(false); }, 600);
    }
  }, [hasMore, paging]);

  useEffect(() => {
    const obs = new IntersectionObserver(onIntersect, { threshold: 0.1 });
    if (loaderRef.current) obs.observe(loaderRef.current);
    return () => obs.disconnect();
  }, [onIntersect]);

  const toggle = (id, e) => { e?.stopPropagation(); setSaved(p => ({...p,[id]:!p[id]})); };
  const savedList = db.filter(b => saved[b.id]);

  // ── Guide — calls our secure Next.js API route, not Anthropic directly
  const askGuide = async () => {
    if (!guideQ.trim() || guideL) return;
    setGuideL(true); setGuideR("");
    try {
      const res = await fetch("/api/guide", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: guideQ }),
      });
      const data = await res.json();
      setGuideR(data.reply || data.error || "Let me think on that...");
    } catch {
      setGuideR("Connection dropped. Try again?");
    }
    setGuideL(false);
  };

  const HEIGHTS = [300,230,280,210,320,250,290,220,310,240,270,215,295,235,305,225];
  const h = (id, ci) => HEIGHTS[(id*3+ci*7) % HEIGHTS.length];
  const col0 = visible.filter((_,i) => i%2===0);
  const col1 = visible.filter((_,i) => i%2===1);
  const cur = filtered[heroIdx % Math.min(filtered.length, 5)];

  return (
    <>
      
      <style>{`
        *,*::before,*::after{margin:0;padding:0;box-sizing:border-box;}
        body{background:#050505;overscroll-behavior:none;}
        :root{
          --bg:#050505;--bg2:#0D0D0D;--bg3:#151515;--bg4:#1E1E1E;
          --wht:#FFFFFF;--dim:#444;--rule:rgba(255,255,255,0.06);
          --glass:rgba(5,5,5,0.82);
          --c1:#FF6B35;--c2:#00E5FF;--c3:#7CFF50;--c4:#FF2D9B;--c5:#A855F7;--c6:#00FFBB;--c7:#FFD700;
        }
        .app{font-family:'Syne',sans-serif;background:var(--bg);max-width:430px;margin:0 auto;min-height:100vh;overflow-x:hidden;}
        @keyframes splashIn{0%{opacity:0;transform:scale(.5) rotate(-10deg);}60%{transform:scale(1.08) rotate(2deg);}100%{opacity:1;transform:scale(1) rotate(0);}}
        @keyframes splashSub{from{opacity:0;transform:translateY(20px);}to{opacity:1;transform:none;}}
        @keyframes splashOut{to{opacity:0;transform:scale(1.1);}}
        @keyframes ticker{from{transform:translateX(0);}to{transform:translateX(-50%);}}
        @keyframes heroKen{0%{transform:scale(1) translate(0,0);}50%{transform:scale(1.08) translate(-2%,-1%);}100%{transform:scale(1) translate(0,0);}}
        @keyframes popIn{0%{opacity:0;transform:scale(.7);}70%{transform:scale(1.06);}100%{opacity:1;transform:scale(1);}}
        @keyframes heartPop{0%{transform:scale(1);}30%{transform:scale(1.5);}60%{transform:scale(.9);}100%{transform:scale(1);}}
        @keyframes glowPulse{0%,100%{opacity:.5;}50%{opacity:1;}}
        @keyframes scanLine{from{top:-100%;}to{top:200%;}}
        @keyframes colorShift{0%{color:var(--c1);}14%{color:var(--c2);}28%{color:var(--c3);}42%{color:var(--c4);}56%{color:var(--c5);}70%{color:var(--c6);}84%{color:var(--c7);}100%{color:var(--c1);}}
        @keyframes borderFlow{0%{border-color:var(--c1);box-shadow:0 0 12px rgba(255,107,53,.3);}14%{border-color:var(--c2);box-shadow:0 0 12px rgba(0,229,255,.3);}28%{border-color:var(--c3);box-shadow:0 0 12px rgba(124,255,80,.3);}42%{border-color:var(--c4);box-shadow:0 0 12px rgba(255,45,155,.3);}56%{border-color:var(--c5);box-shadow:0 0 12px rgba(168,85,247,.3);}70%{border-color:var(--c6);box-shadow:0 0 12px rgba(0,255,187,.3);}84%{border-color:var(--c7);box-shadow:0 0 12px rgba(255,215,0,.3);}100%{border-color:var(--c1);box-shadow:0 0 12px rgba(255,107,53,.3);}}
        @keyframes dotBounce{0%,80%,100%{transform:scale(.6);opacity:.3;}40%{transform:scale(1);opacity:1;}}
        @keyframes pinReveal{from{opacity:0;transform:translateY(16px) scale(.96);}to{opacity:1;transform:none;}}
        @keyframes nameSlide{from{opacity:0;transform:translateX(-12px);}to{opacity:1;transform:none;}}
        @keyframes whisperIn{from{opacity:0;transform:translateX(10px);}to{opacity:1;transform:none;}}
        @keyframes sheetIn{from{transform:translateY(100%);}to{transform:none;}}
        @keyframes overlayIn{from{opacity:0;}to{opacity:1;}}
        @keyframes guideTyping{from{opacity:0;transform:translateY(8px);}to{opacity:1;transform:none;}}
        @keyframes statCount{from{opacity:0;transform:translateY(10px);}to{opacity:1;transform:none;}}
        @keyframes heroBars{from{transform:scaleX(0);}to{transform:scaleX(1);}}
        @keyframes tagFloat{0%,100%{transform:translateY(0);}50%{transform:translateY(-3px);}}
        .splash{position:fixed;inset:0;z-index:9999;background:var(--bg);display:flex;flex-direction:column;align-items:center;justify-content:center;}
        .splash.out{animation:splashOut .6s ease forwards;pointer-events:none;}
        .sp-logo{font-family:'Bebas Neue',sans-serif;font-size:90px;letter-spacing:16px;line-height:1;animation:colorShift 7s linear infinite,splashIn .8s cubic-bezier(.34,1.56,.64,1) both;}
        .sp-scanline{position:absolute;width:3px;height:60px;left:50%;margin-left:-1px;background:linear-gradient(transparent,#fff,transparent);animation:scanLine 1.5s ease .3s both;opacity:.4;}
        .sp-sub{font-family:'DM Mono',monospace;font-size:9px;letter-spacing:6px;text-transform:uppercase;color:var(--dim);animation:splashSub .5s .8s ease both;}
        .sp-count{font-family:'Bebas Neue',sans-serif;font-size:20px;letter-spacing:4px;margin-top:10px;animation:colorShift 7s linear infinite,splashSub .5s 1s ease both;}
        .hdr{position:sticky;top:0;z-index:100;background:var(--glass);backdrop-filter:blur(24px);-webkit-backdrop-filter:blur(24px);border-bottom:1px solid var(--rule);}
        .hdr-top{display:flex;align-items:center;padding:10px 14px 8px;gap:10px;}
        .logo{font-family:'Bebas Neue',sans-serif;font-size:30px;letter-spacing:6px;line-height:1;flex-shrink:0;animation:colorShift 7s linear infinite;}
        .srch{flex:1;background:var(--bg3);border:1px solid var(--rule);border-radius:20px;display:flex;align-items:center;padding:0 12px;height:34px;gap:8px;}
        .srch:focus-within{animation:borderFlow 7s linear infinite;}
        .srch input{flex:1;background:none;border:none;outline:none;font-family:'Syne',sans-serif;font-size:12px;color:var(--wht);}
        .srch input::placeholder{color:var(--dim);}
        .hbtn{width:34px;height:34px;border-radius:50%;background:var(--bg3);border:1px solid var(--rule);display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:13px;flex-shrink:0;transition:all .2s;position:relative;}
        .hbtn:hover{animation:borderFlow 2s linear infinite;transform:scale(1.1);}
        .hbtn .dot{position:absolute;top:4px;right:4px;width:7px;height:7px;border-radius:50%;border:1.5px solid var(--bg);animation:glowPulse 2s ease infinite;}
        .filter-wrap{overflow:hidden;max-height:0;transition:max-height .35s cubic-bezier(.25,.46,.45,.94);}
        .filter-wrap.open{max-height:120px;}
        .filter-inner{padding:6px 14px 10px;}
        .filter-row{display:flex;gap:5px;overflow-x:auto;scrollbar-width:none;padding-bottom:4px;}
        .filter-row::-webkit-scrollbar{display:none;}
        .fp{flex-shrink:0;border-radius:20px;border:1px solid var(--rule);font-family:'DM Mono',monospace;font-size:8px;letter-spacing:2px;text-transform:uppercase;color:var(--dim);padding:5px 14px;cursor:pointer;background:none;white-space:nowrap;transition:all .25s;}
        .fp:hover:not(.on){border-color:currentColor;animation:colorShift 4s linear infinite;}
        .fp.on{color:#000;border-color:transparent;}
        .fp:nth-child(1).on{background:var(--c1);}.fp:nth-child(2).on{background:var(--c2);}.fp:nth-child(3).on{background:var(--c3);}.fp:nth-child(4).on{background:var(--c4);}.fp:nth-child(5).on{background:var(--c5);}.fp:nth-child(6).on{background:var(--c6);}.fp:nth-child(7).on{background:var(--c7);}.fp:nth-child(8).on{background:var(--c1);}
        .stats-bar{display:flex;border-bottom:1px solid var(--rule);}
        .stat{flex:1;padding:7px 0;text-align:center;border-right:1px solid var(--rule);animation:statCount .4s ease both;}
        .stat:last-child{border-right:none;}
        .stat-n{font-family:'Bebas Neue',sans-serif;font-size:20px;letter-spacing:2px;animation:colorShift 7s linear infinite;}
        .stat-l{font-family:'DM Mono',monospace;font-size:6px;letter-spacing:2px;text-transform:uppercase;color:var(--dim);margin-top:1px;}
        .ticker{background:var(--bg2);overflow:hidden;white-space:nowrap;padding:7px 0;border-bottom:1px solid var(--rule);}
        .ticker-inner{display:inline-flex;animation:ticker 30s linear infinite;}
        .tick{font-family:'Bebas Neue',sans-serif;font-size:13px;letter-spacing:3px;padding:0 20px;display:flex;align-items:center;gap:10px;}
        .tick-dot{width:4px;height:4px;border-radius:50%;flex-shrink:0;}
        .tick span{color:rgba(255,255,255,.35);}
        .tick em{font-style:normal;animation:colorShift 7s linear infinite;}
        .whisper{padding:10px 16px;display:flex;align-items:center;gap:10px;cursor:pointer;transition:background .2s;}
        .whisper:hover{background:var(--bg2);}
        .w-dot{width:6px;height:6px;border-radius:50%;flex-shrink:0;animation:glowPulse 1.5s ease infinite;}
        .w-txt{font-family:'Playfair Display',serif;font-size:12px;font-style:italic;color:rgba(255,255,255,.35);flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;animation:whisperIn .5s ease both;}
        .w-ask{font-family:'DM Mono',monospace;font-size:8px;letter-spacing:2px;text-transform:uppercase;flex-shrink:0;animation:colorShift 7s linear infinite;}
        .hero{position:relative;overflow:hidden;cursor:pointer;height:460px;margin-bottom:2px;}
        .hero-slides{position:absolute;inset:0;}
        .hslide{position:absolute;inset:0;opacity:0;transition:opacity 1.2s ease;}
        .hslide.on{opacity:1;}
        .hslide img{width:100%;height:100%;object-fit:cover;object-position:top;display:block;animation:heroKen 12s ease infinite;}
        .hero::after{content:'';position:absolute;inset:0;background:linear-gradient(to bottom,transparent 25%,rgba(5,5,5,.3) 55%,rgba(5,5,5,.97) 100%);z-index:1;}
        .hero-line{position:absolute;top:0;left:0;right:0;height:3px;z-index:3;}
        .hero-bars{position:absolute;bottom:0;left:0;right:0;z-index:3;display:flex;gap:3px;padding:0 16px 88px;}
        .hbar{flex:1;height:2px;background:rgba(255,255,255,.2);cursor:pointer;border:none;padding:0;transition:all .3s;transform-origin:left;}
        .hbar.on{animation:heroBars .4s ease forwards;height:3px;}
        .hero-content{position:absolute;bottom:0;left:0;right:0;padding:20px 16px 18px;z-index:2;}
        .hero-eyebrow{font-family:'DM Mono',monospace;font-size:8px;letter-spacing:4px;text-transform:uppercase;margin-bottom:8px;display:flex;align-items:center;gap:8px;}
        .hero-eyebrow::before{content:'';width:18px;height:1px;background:currentColor;display:block;}
        .hero-name{font-family:'Bebas Neue',sans-serif;font-size:60px;letter-spacing:4px;color:var(--wht);line-height:.88;animation:nameSlide .5s ease both;}
        .hero-sub{font-family:'Syne',sans-serif;font-size:11px;color:rgba(255,255,255,.4);margin-top:6px;}
        .hero-guide{font-family:'Playfair Display',serif;font-size:12px;font-style:italic;color:rgba(255,255,255,.5);margin-top:8px;line-height:1.5;border-left:2px solid currentColor;padding-left:10px;}
        .hero-btns{display:flex;gap:8px;margin-top:14px;}
        .hero-btn{font-family:'DM Mono',monospace;font-size:9px;letter-spacing:3px;text-transform:uppercase;padding:9px 20px;cursor:pointer;border:none;transition:all .2s;}
        .hero-btn.fill{color:#000;font-weight:700;}
        .hero-btn.ghost{background:rgba(255,255,255,.08);color:rgba(255,255,255,.6);border:1px solid rgba(255,255,255,.15);backdrop-filter:blur(8px);}
        .hero-btn.ghost.on{color:#000;border-color:transparent;}
        .hero-rar{position:absolute;top:14px;right:14px;z-index:3;font-family:'DM Mono',monospace;font-size:9px;padding:5px 12px;color:#000;font-weight:700;animation:popIn .5s .3s ease both;}
        .sec-label{display:flex;align-items:center;gap:10px;padding:14px 16px 10px;}
        .sl-line{flex:1;height:1px;background:var(--rule);}
        .sl-txt{font-family:'DM Mono',monospace;font-size:8px;letter-spacing:4px;text-transform:uppercase;color:var(--dim);white-space:nowrap;}
        .sl-dot{font-size:6px;animation:colorShift 7s linear infinite;}
        .masonry{display:flex;gap:2px;padding:0 2px;}
        .m-col{flex:1;display:flex;flex-direction:column;gap:2px;}
        .pin{position:relative;overflow:hidden;cursor:pointer;border-radius:6px;background:var(--bg3);flex-shrink:0;animation:pinReveal .45s ease both;}
        .pin img{width:100%;height:100%;object-fit:cover;object-position:top;display:block;transition:transform .7s ease;}
        .pin:hover img{transform:scale(1.1);}
        .pin-grad{position:absolute;inset:0;background:linear-gradient(transparent 40%,rgba(5,5,5,.9) 100%);pointer-events:none;}
        .pin-topbar{position:absolute;top:0;left:0;right:0;height:3px;z-index:3;transition:height .3s;}
        .pin:hover .pin-topbar{height:5px;}
        .pin-info{position:absolute;bottom:0;left:0;right:0;padding:22px 10px 10px;}
        .pin-name{font-family:'Bebas Neue',sans-serif;font-size:16px;letter-spacing:2px;color:var(--wht);line-height:1;transition:transform .3s;}
        .pin:hover .pin-name{transform:translateY(-2px);}
        .pin-loc{font-family:'DM Mono',monospace;font-size:7px;letter-spacing:1.5px;text-transform:uppercase;color:rgba(255,255,255,.35);margin-top:2px;}
        .pin-cat{position:absolute;bottom:30px;left:10px;font-family:'DM Mono',monospace;font-size:7px;letter-spacing:2px;text-transform:uppercase;padding:2px 8px;color:#000;opacity:0;transform:translateY(6px);transition:all .25s;border-radius:2px;}
        .pin:hover .pin-cat{opacity:1;transform:none;}
        .pin-heart{position:absolute;top:8px;right:8px;z-index:3;width:30px;height:30px;border-radius:50%;background:rgba(5,5,5,.65);backdrop-filter:blur(8px);border:1px solid rgba(255,255,255,.1);display:flex;align-items:center;justify-content:center;font-size:13px;cursor:pointer;color:rgba(255,255,255,.3);opacity:0;transition:opacity .2s,color .15s,background .15s;}
        .pin:hover .pin-heart,.pin-heart.on{opacity:1;}
        .pin-heart.on{animation:heartPop .4s ease;color:var(--c4);background:rgba(255,45,155,.2);border-color:rgba(255,45,155,.3);}
        .pin-rar{position:absolute;top:8px;left:8px;z-index:3;font-family:'DM Mono',monospace;font-size:8px;padding:3px 8px;border-radius:2px;color:#000;font-weight:700;opacity:0;transform:translateY(-4px);transition:all .25s;}
        .pin:hover .pin-rar{opacity:1;transform:none;}
        .pin.art{border-radius:2px;}
        .pin.art .pin-info{background:linear-gradient(transparent,rgba(5,5,5,.96) 100%);}
        .pin.art .pin-name{font-family:'Playfair Display',serif;font-size:15px;font-style:italic;letter-spacing:1px;}
        .pin.art .pin-loc{color:rgba(255,255,255,.25);font-size:6px;letter-spacing:2px;}
        .pin-medium{position:absolute;top:8px;left:8px;z-index:3;font-family:'DM Mono',monospace;font-size:7px;letter-spacing:2px;text-transform:uppercase;padding:3px 8px;border-radius:2px;color:#000;font-weight:700;opacity:0;transform:translateY(-4px);transition:all .25s;}
        .pin:hover .pin-medium{opacity:1;transform:none;}
        .art-frame{position:absolute;inset:6px;border:1px solid rgba(255,255,255,.08);pointer-events:none;z-index:2;border-radius:2px;}
        .loader{height:20px;}
        .loading{display:flex;justify-content:center;gap:6px;padding:16px;}
        .ldot{width:8px;height:8px;border-radius:50%;animation:dotBounce 1.2s ease infinite;}
        .ldot:nth-child(1){background:var(--c1);}.ldot:nth-child(2){background:var(--c2);animation-delay:.2s;}.ldot:nth-child(3){background:var(--c3);animation-delay:.4s;}
        .end-msg{text-align:center;padding:28px;border-top:1px solid var(--rule);}
        .end-logo{font-family:'Bebas Neue',sans-serif;font-size:28px;letter-spacing:8px;animation:colorShift 7s linear infinite;}
        .end-line{height:1px;width:32px;margin:10px auto;background:currentColor;animation:colorShift 7s linear infinite;}
        .end-sub{font-family:'DM Mono',monospace;font-size:7px;letter-spacing:3px;text-transform:uppercase;color:var(--dim);}
        .overlay{position:fixed;inset:0;z-index:200;background:rgba(0,0,0,.85);backdrop-filter:blur(16px);animation:overlayIn .25s ease;}
        .sheet{position:absolute;bottom:0;left:0;right:0;background:var(--bg2);max-height:91vh;overflow-y:auto;scrollbar-width:none;border-radius:20px 20px 0 0;animation:sheetIn .32s cubic-bezier(.25,.46,.45,.94);}
        .sheet::-webkit-scrollbar{display:none;}
        .sh-handle{display:flex;justify-content:center;padding:12px 0 0;}
        .shh{width:32px;height:3px;border-radius:2px;background:var(--bg4);}
        .sh-colorbar{height:3px;margin:6px 16px 0;border-radius:2px;}
        .sh-hero{height:370px;position:relative;overflow:hidden;margin-top:8px;}
        .sh-hero img{width:100%;height:100%;object-fit:cover;object-position:top;display:block;animation:heroKen 12s ease infinite;}
        .sh-hero::after{content:'';position:absolute;inset:0;background:linear-gradient(transparent 40%,rgba(5,5,5,.97) 100%);}
        .sh-back{position:absolute;top:14px;left:14px;z-index:5;background:rgba(5,5,5,.7);backdrop-filter:blur(8px);border:1px solid rgba(255,255,255,.1);color:var(--wht);font-family:'DM Mono',monospace;font-size:8px;letter-spacing:2px;text-transform:uppercase;padding:7px 14px;cursor:pointer;border-radius:3px;}
        .sh-rar{position:absolute;top:14px;right:14px;z-index:5;font-family:'DM Mono',monospace;font-size:9px;padding:5px 12px;color:#000;font-weight:700;border-radius:3px;}
        .sh-nameblock{position:absolute;bottom:0;left:0;right:0;padding:18px;z-index:3;}
        .sh-name{font-family:'Bebas Neue',sans-serif;font-size:54px;letter-spacing:4px;color:var(--wht);line-height:.88;}
        .sh-tag{font-family:'DM Mono',monospace;font-size:9px;letter-spacing:2px;text-transform:uppercase;margin-top:6px;}
        .sh-loc{font-family:'Syne',sans-serif;font-size:11px;color:rgba(255,255,255,.3);margin-top:3px;}
        .sh-body{padding:18px 18px 24px;}
        .sh-story{font-family:'Playfair Display',serif;font-size:14px;font-style:italic;color:rgba(255,255,255,.6);line-height:1.75;margin-bottom:16px;padding-left:14px;border-left-width:2px;border-left-style:solid;}
        .sh-guide{background:var(--bg3);padding:14px;border-radius:8px;margin-bottom:16px;animation:guideTyping .4s .1s ease both;}
        .sg-who{font-family:'DM Mono',monospace;font-size:8px;letter-spacing:3px;text-transform:uppercase;margin-bottom:8px;}
        .sg-txt{font-family:'Playfair Display',serif;font-size:14px;font-style:italic;color:rgba(255,255,255,.6);line-height:1.65;}
        .sh-actions{display:flex;gap:10px;}
        .sh-btn{flex:1;padding:13px;border:none;border-radius:8px;font-family:'DM Mono',monospace;font-size:9px;letter-spacing:3px;text-transform:uppercase;cursor:pointer;transition:all .2s;}
        .sh-btn.fill{color:#000;font-weight:700;}
        .sh-btn.ghost{background:var(--bg3);color:rgba(255,255,255,.5);border:1px solid var(--rule);}
        .guide-over{position:fixed;inset:0;z-index:300;background:rgba(0,0,0,.9);backdrop-filter:blur(20px);animation:overlayIn .25s ease;display:flex;flex-direction:column;justify-content:flex-end;}
        .guide-sheet{background:var(--bg2);border-radius:20px 20px 0 0;padding:16px 18px 34px;animation:sheetIn .3s ease;}
        .gs-top{height:3px;border-radius:2px;margin-bottom:16px;background:rgba(255,255,255,.06);}
        .gs-title{font-family:'Bebas Neue',sans-serif;font-size:30px;letter-spacing:4px;color:var(--wht);margin-bottom:4px;animation:colorShift 7s linear infinite;}
        .gs-sub{font-family:'Playfair Display',serif;font-size:12px;font-style:italic;color:var(--dim);margin-bottom:14px;}
        .gs-chips{display:flex;flex-wrap:wrap;gap:6px;margin-bottom:14px;}
        .gs-chip{background:var(--bg3);border:1px solid var(--rule);border-radius:20px;padding:5px 14px;font-family:'Syne',sans-serif;font-size:11px;color:rgba(255,255,255,.4);cursor:pointer;transition:all .2s;}
        .gs-chip:hover{transform:scale(1.05);}
        .gs-chip:nth-child(1):hover{background:var(--c1);border-color:var(--c1);color:#000;}.gs-chip:nth-child(2):hover{background:var(--c2);border-color:var(--c2);color:#000;}.gs-chip:nth-child(3):hover{background:var(--c3);border-color:var(--c3);color:#000;}.gs-chip:nth-child(4):hover{background:var(--c4);border-color:var(--c4);}.gs-chip:nth-child(5):hover{background:var(--c5);border-color:var(--c5);}.gs-chip:nth-child(6):hover{background:var(--c6);border-color:var(--c6);color:#000;}.gs-chip:nth-child(7):hover{background:var(--c7);border-color:var(--c7);color:#000;}.gs-chip:nth-child(8):hover{background:var(--c1);border-color:var(--c1);color:#000;}
        .gs-row{display:flex;gap:8px;}
        .gs-in{flex:1;background:var(--bg3);border:1px solid var(--rule);border-radius:24px;padding:11px 18px;font-family:'Syne',sans-serif;font-size:13px;color:var(--wht);outline:none;transition:all .2s;}
        .gs-in:focus{animation:borderFlow 3s linear infinite;}
        .gs-go{width:44px;height:44px;border-radius:50%;border:none;cursor:pointer;font-size:16px;display:flex;align-items:center;justify-content:center;flex-shrink:0;transition:all .2s;color:#000;font-weight:700;}
        .gs-go:hover{transform:scale(1.1) rotate(15deg);}
        .gs-reply{margin-top:14px;padding:14px;background:var(--bg3);border-radius:10px;border-left-width:2px;border-left-style:solid;animation:guideTyping .4s ease;}
        .gr-who{font-family:'DM Mono',monospace;font-size:8px;letter-spacing:3px;text-transform:uppercase;margin-bottom:8px;}
        .gr-txt{font-family:'Playfair Display',serif;font-size:14px;font-style:italic;color:rgba(255,255,255,.7);line-height:1.65;}
        .nav{position:fixed;bottom:0;left:50%;transform:translateX(-50%);width:100%;max-width:430px;z-index:100;background:var(--glass);backdrop-filter:blur(24px);border-top:1px solid var(--rule);display:flex;}
        .ntb{flex:1;background:none;border:none;display:flex;flex-direction:column;align-items:center;padding:9px 0 11px;gap:4px;cursor:pointer;}
        .ntb-i{font-size:19px;opacity:.35;transition:all .3s;}
        .ntb-l{font-family:'DM Mono',monospace;font-size:7px;letter-spacing:2px;text-transform:uppercase;color:var(--dim);transition:all .3s;}
        .ntb.on .ntb-i{opacity:1;animation:tagFloat 2s ease infinite;}
        .ntb.on .ntb-l{animation:colorShift 7s linear infinite;}
        .empty{display:flex;flex-direction:column;align-items:center;justify-content:center;padding:80px 24px;gap:12px;text-align:center;}
        .empty-i{font-size:40px;animation:glowPulse 2s ease infinite;opacity:.3;}
        .empty-t{font-family:'Bebas Neue',sans-serif;font-size:28px;letter-spacing:4px;animation:colorShift 7s linear infinite;}
        .empty-s{font-family:'Syne',sans-serif;font-size:12px;color:var(--dim);max-width:200px;line-height:1.6;}
        .scroll{overflow-y:auto;scrollbar-width:none;padding-bottom:80px;}
        .scroll::-webkit-scrollbar{display:none;}
      `}</style>

      <div className="app">

        {/* SPLASH */}
        <div className={`splash${!splash ? " out" : ""}`} onClick={() => setSplash(false)} style={{cursor:"pointer"}}>
          <div className="sp-scanline" />
          <div className="sp-logo">ÜNDER</div>
          <div style={{width:"32px",height:"2px",background:"rgba(255,255,255,.15)",margin:"12px auto",animation:"splashSub .5s .7s ease both",opacity:0}} />
          <div className="sp-sub">Underground Fashion &amp; Art</div>
          <div className="sp-count">{db.length} brands · {[...new Set(db.map(b=>b.ctry))].length} countries</div>
        </div>

        {/* HEADER */}
        <div className="hdr">
          <div className="hdr-top">
            <div className="logo">ÜNDER</div>
            <div className="srch">
              <span style={{fontSize:11,color:"var(--dim)"}}>⊙</span>
              <input placeholder="Search brands, cities…" value={search} onChange={e=>setSearch(e.target.value)} />
              {search && <span style={{cursor:"pointer",color:"var(--dim)",fontSize:11}} onClick={()=>setSearch("")}>✕</span>}
            </div>
            <button className="hbtn" onClick={()=>setShowFilters(f=>!f)} style={{color:"rgba(255,255,255,.5)"}}>
              ⚬
              {(cat!=="All"||cont!=="All") && <div className="dot" style={{background:"var(--c3)"}} />}
            </button>
            <button className="hbtn" onClick={()=>setGuideOpen(true)} style={{color:"rgba(255,255,255,.5)"}}>◉</button>
          </div>
          <div className={`filter-wrap${showFilters?" open":""}`}>
            <div className="filter-inner">
              <div className="filter-row" style={{marginBottom:5}}>
                {[["All","All"],["Fashion","fashion"],["Art","art"]].map(([lbl,val])=>(
                  <button key={val} className={`fp${(val==="all"||(val==="fashion"&&!ART_CATS.includes(cat)&&cat!=="All")||(val==="art"&&ART_CATS.includes(cat)))?" on":""}`}
                    onClick={()=>{if(val==="fashion"){setCat("Knitwear")}else if(val==="art"){setCat("Painting")}else{setCat("All")}}}>{lbl}</button>
                ))}
              </div>
              <div className="filter-row">{CATS.map(c=><button key={c} className={`fp${cat===c?" on":""}`} onClick={()=>setCat(c)}>{c}</button>)}</div>
              <div className="filter-row" style={{marginTop:5}}>{CONTS.map(c=><button key={c} className={`fp${cont===c?" on":""}`} onClick={()=>setCont(c)}>{c}</button>)}</div>
            </div>
          </div>
          <div className="stats-bar">
            {[["Finds",filtered.length],["Countries",[...new Set(db.map(b=>b.ctry))].length],["Continents",[...new Set(db.map(b=>b.cont))].length],["Saved",savedList.length]].map(([l,n],i)=>(
              <div key={l} className="stat" style={{animationDelay:`${i*.07}s`}}>
                <div className="stat-n">{n}</div>
                <div className="stat-l">{l}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="scroll">
          {(tab==="feed"||tab==="search") && (<>
            <div className="ticker">
              <div className="ticker-inner">
                {[...db,...db].map((b,i)=>(
                  <span key={i} className="tick">
                    <span className="tick-dot" style={{background:b.color}} />
                    <em>{b.name}</em>
                    <span>— {b.city}</span>
                  </span>
                ))}
              </div>
            </div>
            <div className="whisper" onClick={()=>setGuideOpen(true)}>
              <div className="w-dot" style={{background:PALETTE[whisper%PALETTE.length]}} />
              <div className="w-txt" key={whisper}>"{WHISPERS[whisper]}"</div>
              <div className="w-ask">Ask →</div>
            </div>

            {filtered.length===0 ? (
              <div className="empty">
                <div className="empty-i">◎</div>
                <div className="empty-t" style={{color:"var(--c2)"}}>Nothing Here</div>
                <div className="empty-s">Try a different filter.</div>
              </div>
            ) : (<>
              {/* HERO */}
              <div className="hero" onClick={()=>setActive(cur)}>
                <div className="hero-slides">
                  {filtered.slice(0,5).map((b,i)=>(
                    <div key={b.id} className={`hslide${i===heroIdx%Math.min(filtered.length,5)?" on":""}`}>
                      <img src={b.img} alt={b.name} />
                    </div>
                  ))}
                </div>
                <div className="hero-line" style={{background:cur?.color}} />
                <div className="hero-rar" style={{background:cur?.color}}>◆ {cur?.r} / 10</div>
                <div className="hero-bars" onClick={e=>e.stopPropagation()}>
                  {filtered.slice(0,5).map((_,i)=>(
                    <button key={i} className={`hbar${i===heroIdx%Math.min(filtered.length,5)?" on":""}`}
                      style={{background:i===heroIdx%Math.min(filtered.length,5)?filtered[i]?.color:undefined}}
                      onClick={()=>setHeroIdx(i)} />
                  ))}
                </div>
                <div className="hero-content">
                  <div className="hero-eyebrow"><span style={{color:cur?.color}}>{isArt(cur) ? "Art Find" : "Today's Find"}</span></div>
                  <div className="hero-name">{cur?.name}</div>
                  <div className="hero-sub">{cur?.sub} · {cur?.city}</div>
                  <div className="hero-guide" style={{borderLeftColor:cur?.color,color:cur?.color}}>"{cur?.g}"</div>
                  <div className="hero-btns" onClick={e=>e.stopPropagation()}>
                    <button className="hero-btn fill" style={{background:cur?.color}} onClick={()=>setActive(cur)}>Discover →</button>
                    <button className={`hero-btn ghost${saved[cur?.id]?" on":""}`}
                      style={saved[cur?.id]?{background:cur?.color,borderColor:"transparent"}:{}}
                      onClick={e=>toggle(cur?.id,e)}>
                      {saved[cur?.id]?"♥ Saved":"♡ Save"}
                    </button>
                  </div>
                </div>
              </div>

              <div className="sec-label">
                <div className="sl-line"/><span className="sl-dot">◆</span>
                <span className="sl-txt">{cat!=="All"||cont!=="All"?[cat!=="All"&&cat,cont!=="All"&&cont].filter(Boolean).join(" · "):"All Finds"}</span>
                <span className="sl-dot">◆</span><div className="sl-line"/>
              </div>

              <div className="masonry">
                {[col0,col1].map((col,ci)=>(
                  <div key={ci} className="m-col">
                    {col.map((b,ri)=>(
                      <div key={b.id} className={`pin${isArt(b)?" art":""}`} style={{height:h(b.id,ci),animationDelay:`${(ri*2+ci)*.04}s`}} onClick={()=>setActive(b)}>
                        <img src={b.img} alt={b.name} loading="lazy" />
                        <div className="pin-grad"/>
                        <div className="pin-topbar" style={{background:b.color}}/>
                        <div className="pin-rar" style={{background:b.color}}>{b.r}</div>
                        <button className={`pin-heart${saved[b.id]?" on":""}`} onClick={e=>toggle(b.id,e)}>{saved[b.id]?"♥":"♡"}</button>
                        <div className={isArt(b) ? "pin-medium" : "pin-cat"} style={{background:b.color}}>{b.cat}</div>
                        {isArt(b) && <div className="art-frame"/>}
                        <div className="pin-info">
                          <div className="pin-name">{b.name}</div>
                          <div className="pin-loc">{b.city} · {b.ctry}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>

              <div ref={loaderRef} className="loader"/>
              {paging && <div className="loading"><div className="ldot"/><div className="ldot"/><div className="ldot"/></div>}
              {!hasMore && visible.length>0 && (
                <div className="end-msg">
                  <div className="end-logo">ÜNDER</div>
                  <div className="end-line"/>
                  <div className="end-sub">{filtered.length} finds · fashion &amp; art · more added weekly</div>
                </div>
              )}
            </>)}
          </>)}

          {tab==="saved" && (
            savedList.length===0 ? (
              <div className="empty">
                <div className="empty-i">♡</div>
                <div className="empty-t">Your Vault</div>
                <div className="empty-s">Heart any brand to save it here.</div>
              </div>
            ) : (<>
              <div className="sec-label" style={{marginTop:8}}>
                <div className="sl-line"/><span className="sl-dot">◆</span>
                <span className="sl-txt">{savedList.length} Saved</span>
                <span className="sl-dot">◆</span><div className="sl-line"/>
              </div>
              <div className="masonry">
                {[savedList.filter((_,i)=>i%2===0),savedList.filter((_,i)=>i%2===1)].map((col,ci)=>(
                  <div key={ci} className="m-col">
                    {col.map(b=>(
                      <div key={b.id} className="pin" style={{height:h(b.id,ci)}} onClick={()=>setActive(b)}>
                        <img src={b.img} alt={b.name}/>
                        <div className="pin-grad"/>
                        <div className="pin-topbar" style={{background:b.color}}/>
                        <button className="pin-heart on" onClick={e=>toggle(b.id,e)}>♥</button>
                        <div className="pin-info">
                          <div className="pin-name">{b.name}</div>
                          <div className="pin-loc">{b.city}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </>)
          )}
        </div>

        {/* NAV */}
        <div className="nav">
          {[["feed","◈","Feed"],["search","⊙","Explore"],["guide","◉","Guide"],["saved",savedList.length>0?"♥":"♡",`Saved${savedList.length>0?` (${savedList.length})`:""}`]].map(([t,icon,lbl])=>(
            <button key={t} className={`ntb${tab===t?" on":""}`} onClick={()=>t==="guide"?setGuideOpen(true):setTab(t)}>
              <div className="ntb-i">{icon}</div>
              <div className="ntb-l">{lbl}</div>
            </button>
          ))}
        </div>

        {/* BRAND SHEET */}
        {active && (
          <div className="overlay" onClick={()=>setActive(null)}>
            <div className="sheet" onClick={e=>e.stopPropagation()}>
              <div className="sh-handle"><div className="shh"/></div>
              <div className="sh-colorbar" style={{background:active.color}}/>
              <div className="sh-hero">
                <img src={active.img} alt={active.name}/>
                <button className="sh-back" onClick={()=>setActive(null)}>← Back</button>
                <div className="sh-rar" style={{background:active.color}}>◆ {active.r} / 10</div>
                <div className="sh-nameblock">
                  <div className="sh-name">{active.name}</div>
                  <div className="sh-tag" style={{color:active.color}}>{isArt(active) ? `${active.sub}` : active.sub}</div>
                  <div className="sh-loc">{isArt(active) ? `${active.cat} · ${active.city}` : `${active.city} · ${active.ctry}`}</div>
                </div>
              </div>
              <div className="sh-body">
                <div className="sh-story" style={{borderLeftColor:active.color}}>{active.story}</div>
                <div className="sh-guide" style={{borderLeft:`2px solid ${active.color}`}}>
                  <div className="sg-who" style={{color:active.color}}>◆ Your Guide's Take</div>
                  <div className="sg-txt">"{active.g}"</div>
                </div>
                <div className="sh-actions">
                  <button className="sh-btn fill" style={{background:active.color}}>{isArt(active) ? "Follow Artist" : "Follow Brand"}</button>
                  <button className={`sh-btn ghost${saved[active.id]?" on":""}`}
                    style={saved[active.id]?{background:active.color+"22",borderColor:active.color,color:active.color}:{}}
                    onClick={()=>toggle(active.id)}>
                    {saved[active.id]?"♥ Saved":"♡ Save"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* GUIDE SHEET */}
        {guideOpen && (
          <div className="guide-over" onClick={()=>setGuideOpen(false)}>
            <div className="guide-sheet" onClick={e=>e.stopPropagation()}>
              <div className="gs-top"/>
              <div className="gs-title">Ask The Guide</div>
              <div className="gs-sub">"I know every brand and artist in the vault. Ask me anything."</div>
              <div className="gs-chips">
                {["Earthy & natural","Best from Africa","Tokyo underground","Rarest finds","Nordic minimal","Rare paintings","Underground artists","Ceramic masters"].map(c=>(
                  <button key={c} className="gs-chip" onClick={()=>setGuideQ(c)}>{c}</button>
                ))}
              </div>
              <div className="gs-row">
                <input className="gs-in" autoFocus placeholder="Ask about fashion, art, artists…" value={guideQ}
                  onChange={e=>setGuideQ(e.target.value)} onKeyDown={e=>e.key==="Enter"&&askGuide()}/>
                <button className="gs-go" style={{background:PALETTE[whisper%PALETTE.length]}} onClick={askGuide} disabled={guideL}>
                  {guideL?"…":"→"}
                </button>
              </div>
              {(guideL||guideR) && (
                <div className="gs-reply" style={{borderLeftColor:PALETTE[whisper%PALETTE.length]}}>
                  <div className="gr-who" style={{color:PALETTE[whisper%PALETTE.length]}}>◆ Your Guide</div>
                  {guideL
                    ? <div className="loading"><div className="ldot"/><div className="ldot"/><div className="ldot"/></div>
                    : <div className="gr-txt">{guideR}</div>}
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </>
  );
}
