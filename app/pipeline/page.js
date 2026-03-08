'use client';
import { useState, useEffect, useRef } from "react";

const SUPABASE_URL = "https://geqqyxrmdxwwyyddxohc.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdlcXF5eHJtZHh3d3l5ZGR4b2hjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI5OTU0NzcsImV4cCI6MjA4ODU3MTQ3N30.0E3K0sfEAicGq4cKBqk_N2TdIrLs10pNgrGe_KC-z6Y";

const PALETTE = ["#FF6B35","#00E5FF","#7CFF50","#FF2D9B","#A855F7","#00FFBB","#FFD700"];
const CATS = ["Knitwear","Drape","Tailoring","Denim","Workwear","Minimal","Accs"];
const CONTS = ["Africa","Americas","Asia","Europe","Oceania"];

async function claudeSearch(promptIndex) {
  const res = await fetch("/api/discover", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ wave: promptIndex }),
  });
  const data = await res.json();
  return data.brands || [];
}

async function getUnsplashImage(query) {
  // Use a curated set of high-quality Unsplash fashion images as fallback
  const fashionImages = [
    "photo-1558618666-fcd25c85cd64","photo-1542272604-787c3835535d","photo-1504703395950-b89145a5425b",
    "photo-1509631179647-0177331693ae","photo-1529139574466-a303027c1d8b","photo-1490481651871-ab68de25d43d",
    "photo-1543163521-1bf539c55dd2","photo-1496747611176-843222e1e57c","photo-1517841905240-472988babdf9",
    "photo-1475178626620-a4d074967452","photo-1469334031218-e382a71b716b","photo-1528360983277-13d401cdc186",
    "photo-1523381294911-8d3cead13475","photo-1551803091-e20673f15770","photo-1534528741775-53994a69daeb",
    "photo-1516762689617-e1cffcef479d","photo-1518611012118-696072aa579a","photo-1483985988355-763728e1935b",
    "photo-1506629082955-511b1aa562c8","photo-1515886657613-9f3515b0c78f","photo-1591085686350-798c0f9faa7f",
  ];
  const idx = Math.floor(Math.random() * fashionImages.length);
  return `https://images.unsplash.com/${fashionImages[idx]}?w=800&q=90`;
}

async function publishToSupabase(brand) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/brands`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "apikey": SUPABASE_KEY,
      "Authorization": `Bearer ${SUPABASE_KEY}`,
      "Prefer": "return=representation",
    },
    body: JSON.stringify({
      name: brand.name,
      sub: brand.sub,
      city: brand.city,
      ctry: brand.country || brand.ctry,
      cont: brand.continent || brand.cont,
      cat: brand.cat,
      r: parseFloat(brand.rarity || brand.r),
      color: brand.color || PALETTE[Math.floor(Math.random() * PALETTE.length)],
      img: brand.img,
      g: brand.g || brand.guide,
      story: brand.story,
    }),
  });
  return res.ok;
}

function generateInstagramCaption(brand) {
  return `◆ ${brand.name.toUpperCase()} ◆

${brand.story}

${brand.g ? `"${brand.g}"` : ''}

📍 ${brand.city} · Rarity ${brand.rarity || brand.r}/10

The names you don't know are often the ones worth knowing most.

─────────────────────
#underground #${brand.cat?.toLowerCase()} #${brand.city?.toLowerCase().replace(/\s/g,'')} #niche #luxury #independentfashion #artisan #slowfashion #UNDER #unknownbrands #fashionfinds #${brand.continent?.toLowerCase() || 'global'}fashion #hiddentreasure #fashionculture #styleknowledge`;
}

// Instagram Card Canvas Generator
function InstagramCard({ brand, onCaption }) {
  const canvasRef = useRef(null);
  const [caption, setCaption] = useState("");

  useEffect(() => {
    if (!brand) return;
    const c = generateInstagramCaption(brand);
    setCaption(c);
    if (onCaption) onCaption(c);
  }, [brand]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !brand) return;
    const ctx = canvas.getContext("2d");
    const W = 1080, H = 1080;
    canvas.width = W; canvas.height = H;

    const color = brand.color || "#FF6B35";

    // Background
    ctx.fillStyle = "#050505";
    ctx.fillRect(0, 0, W, H);

    // Top color bar
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, W, 6);

    // Load brand image
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      // Image — top 55%
      ctx.save();
      ctx.drawImage(img, 0, 6, W, H * 0.56);

      // Gradient overlay
      const grad = ctx.createLinearGradient(0, H * 0.3, 0, H * 0.62);
      grad.addColorStop(0, "rgba(5,5,5,0)");
      grad.addColorStop(1, "rgba(5,5,5,0.98)");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, W, H * 0.62);
      ctx.restore();

      // Bottom panel
      ctx.fillStyle = "#0D0D0D";
      ctx.fillRect(0, H * 0.58, W, H * 0.42);

      // Color accent line
      ctx.fillStyle = color;
      ctx.fillRect(0, H * 0.58, W, 3);

      // ÜNDER logo top left
      ctx.fillStyle = color;
      ctx.font = "bold 42px 'Arial Black', sans-serif";
      ctx.letterSpacing = "8px";
      ctx.fillText("ÜNDER", 54, 72);

      // Rarity badge top right
      const rar = `◆ ${brand.rarity || brand.r} / 10`;
      ctx.fillStyle = color;
      ctx.fillRect(W - 200, 36, 160, 44);
      ctx.fillStyle = "#000";
      ctx.font = "bold 20px monospace";
      ctx.fillText(rar, W - 188, 64);

      // Brand name
      ctx.fillStyle = "#FFFFFF";
      ctx.font = "bold 96px 'Arial Black', sans-serif";
      const nameY = H * 0.62 + 90;
      ctx.fillText(brand.name, 54, nameY);

      // Sub / descriptor
      ctx.fillStyle = color;
      ctx.font = "24px monospace";
      ctx.fillText((brand.sub || "").toUpperCase(), 54, nameY + 44);

      // City · Country
      ctx.fillStyle = "rgba(255,255,255,0.4)";
      ctx.font = "22px monospace";
      ctx.fillText(`${brand.city}  ·  ${brand.country || brand.ctry}`, 54, nameY + 88);

      // Guide quote
      const quote = `"${brand.g || brand.guide || ''}"`;
      ctx.fillStyle = "rgba(255,255,255,0.6)";
      ctx.font = "italic 28px Georgia, serif";
      wrapText(ctx, quote, 54, nameY + 148, W - 108, 40);

      // Bottom bar
      ctx.fillStyle = color;
      ctx.fillRect(0, H - 6, W, 6);

      // Category tag
      ctx.fillStyle = color;
      ctx.fillRect(54, H - 76, 160, 40);
      ctx.fillStyle = "#000";
      ctx.font = "bold 18px monospace";
      ctx.fillText((brand.cat || "").toUpperCase(), 72, H - 50);

      // underground label
      ctx.fillStyle = "rgba(255,255,255,0.2)";
      ctx.font = "16px monospace";
      ctx.fillText("UNDERGROUND DISCOVERY", W - 340, H - 50);
    };
    img.onerror = () => {
      // Draw without image
      ctx.fillStyle = "#111";
      ctx.fillRect(0, 6, W, H * 0.55);
      ctx.fillStyle = color + "22";
      ctx.fillRect(0, 6, W, H * 0.55);
    };
    img.src = brand.img;
  }, [brand]);

  return (
    <canvas
      ref={canvasRef}
      style={{ width: "100%", borderRadius: 8, border: `1px solid rgba(255,255,255,0.08)` }}
    />
  );
}

function wrapText(ctx, text, x, y, maxW, lineH) {
  const words = text.split(" ");
  let line = "";
  for (let i = 0; i < words.length; i++) {
    const test = line + words[i] + " ";
    if (ctx.measureText(test).width > maxW && i > 0) {
      ctx.fillText(line, x, y);
      line = words[i] + " ";
      y += lineH;
    } else { line = test; }
  }
  ctx.fillText(line, x, y);
}

export default function Pipeline() {
  const [phase, setPhase] = useState("idle"); // idle | searching | reviewing | publishing
  const [log, setLog] = useState([]);
  const [finds, setFinds] = useState([]);
  const [selected, setSelected] = useState(null);
  const [caption, setCaption] = useState("");
  const [publishedCount, setPublishedCount] = useState(0);
  const [dbCount, setDbCount] = useState(null);
  const [searchRound, setSearchRound] = useState(0);

  const addLog = (msg, type = "info") => setLog(l => [...l, { msg, type, t: new Date().toLocaleTimeString() }]);

  useEffect(() => {
    fetch(`${SUPABASE_URL}/rest/v1/brands?select=id`, {
      headers: { "apikey": SUPABASE_KEY, "Authorization": `Bearer ${SUPABASE_KEY}` }
    }).then(r => r.json()).then(d => setDbCount(d.length)).catch(() => {});
  }, [publishedCount]);

  const runSearch = async () => {
    setPhase("searching");
    setFinds([]);
    setSelected(null);
    setLog([]);
    addLog("Initializing brand discovery engine...", "system");

    const allFinds = [];
    for (let i = 0; i < 3; i++) {
      addLog(`Search wave ${i + 1}/3 — querying fashion intelligence...`, "info");
      await new Promise(r => setTimeout(r, 600));
      try {
        const results = await claudeSearch(i);
        addLog(`Wave ${i + 1} returned ${results.length} candidates`, "success");
        for (const b of results) {
          addLog(`Scoring: ${b.name} (${b.city}) — rarity ${b.rarity || b.r}/10`, "brand");
          b.img = await getUnsplashImage(b.unsplash_query || b.name);
          b.color = PALETTE[allFinds.length % PALETTE.length];
          b._status = "pending";
          allFinds.push(b);
          setFinds([...allFinds]);
          await new Promise(r => setTimeout(r, 300));
        }
      } catch (e) {
        addLog(`Wave ${i + 1} error: ${e.message}`, "error");
      }
    }

    addLog(`Discovery complete. ${allFinds.length} brands found. Review and approve below.`, "system");
    setPhase("reviewing");
    if (allFinds.length > 0) setSelected(allFinds[0]);
  };

  const approve = async (brand) => {
    brand._status = "publishing";
    setFinds([...finds]);
    addLog(`Publishing ${brand.name} to database...`, "info");
    const ok = await publishToSupabase(brand);
    brand._status = ok ? "published" : "error";
    setFinds([...finds]);
    if (ok) {
      setPublishedCount(c => c + 1);
      addLog(`✓ ${brand.name} is now live on ÜNDER`, "success");
    } else {
      addLog(`✗ Failed to publish ${brand.name}`, "error");
    }
  };

  const reject = (brand) => {
    brand._status = "rejected";
    setFinds([...finds]);
    addLog(`Rejected: ${brand.name}`, "warn");
  };

  const downloadCard = () => {
    const canvas = document.querySelector("canvas");
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = `under-${selected?.name?.toLowerCase().replace(/\s/g, "-")}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  const copyCaption = () => {
    navigator.clipboard.writeText(caption);
  };

  const statusColor = s => ({ pending:"#444", publishing:"#FFD700", published:"#7CFF50", rejected:"#FF2D9B", error:"#FF4444" }[s] || "#444");
  const statusIcon = s => ({ pending:"◎", publishing:"◌", published:"✓", rejected:"✗", error:"!" }[s] || "◎");

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Mono:ital,wght@0,400;0,500;1,400&family=Syne:wght@400;600;700&family=Playfair+Display:ital@1&display=swap');
        *,*::before,*::after{margin:0;padding:0;box-sizing:border-box;}
        body{background:#050505;color:#fff;font-family:'Syne',sans-serif;min-height:100vh;}
        :root{
          --bg:#050505;--bg2:#0D0D0D;--bg3:#151515;--bg4:#1E1E1E;
          --wht:#fff;--dim:#444;--rule:rgba(255,255,255,0.06);
          --c1:#FF6B35;--c2:#00E5FF;--c3:#7CFF50;--c4:#FF2D9B;--c5:#A855F7;--c6:#00FFBB;--c7:#FFD700;
        }
        @keyframes colorShift{0%{color:var(--c1);}14%{color:var(--c2);}28%{color:var(--c3);}42%{color:var(--c4);}56%{color:var(--c5);}70%{color:var(--c6);}84%{color:var(--c7);}100%{color:var(--c1);}}
        @keyframes spin{to{transform:rotate(360deg);}}
        @keyframes pulse{0%,100%{opacity:.4;}50%{opacity:1;}}
        @keyframes slideIn{from{opacity:0;transform:translateY(12px);}to{opacity:1;transform:none;}}
        @keyframes glow{0%,100%{box-shadow:0 0 20px rgba(255,107,53,.2);}50%{box-shadow:0 0 40px rgba(255,107,53,.5);}}
        @keyframes scanline{0%{top:-10%;}100%{top:110%;}}

        .app{display:grid;grid-template-columns:320px 1fr 380px;grid-template-rows:auto 1fr;min-height:100vh;max-height:100vh;overflow:hidden;}
        
        /* TOP BAR */
        .topbar{grid-column:1/-1;display:flex;align-items:center;gap:20px;padding:14px 24px;border-bottom:1px solid var(--rule);background:rgba(5,5,5,.95);backdrop-filter:blur(20px);position:sticky;top:0;z-index:50;}
        .t-logo{font-family:'Bebas Neue',sans-serif;font-size:26px;letter-spacing:6px;animation:colorShift 7s linear infinite;}
        .t-slash{color:var(--rule);font-size:20px;}
        .t-title{font-family:'DM Mono',monospace;font-size:11px;letter-spacing:3px;text-transform:uppercase;color:var(--dim);}
        .t-stat{font-family:'DM Mono',monospace;font-size:10px;letter-spacing:2px;text-transform:uppercase;padding:5px 14px;border:1px solid var(--rule);border-radius:20px;color:var(--dim);}
        .t-stat span{animation:colorShift 7s linear infinite;}
        .t-run{margin-left:auto;font-family:'Bebas Neue',sans-serif;font-size:18px;letter-spacing:4px;padding:10px 32px;background:var(--c1);color:#000;border:none;cursor:pointer;border-radius:3px;transition:all .2s;position:relative;overflow:hidden;}
        .t-run:hover{transform:scale(1.04);box-shadow:0 0 30px rgba(255,107,53,.4);}
        .t-run:disabled{opacity:.4;cursor:not-allowed;transform:none;}
        .t-run.running{background:var(--bg3);color:var(--c7);border:1px solid var(--c7);animation:glow 2s ease infinite;}
        .spin{display:inline-block;animation:spin 1s linear infinite;}

        /* LEFT — FINDS LIST */
        .panel-left{border-right:1px solid var(--rule);overflow-y:auto;scrollbar-width:none;background:var(--bg2);}
        .panel-left::-webkit-scrollbar{display:none;}
        .pl-head{padding:16px;border-bottom:1px solid var(--rule);display:flex;align-items:center;justify-content:space-between;}
        .pl-label{font-family:'DM Mono',monospace;font-size:9px;letter-spacing:3px;text-transform:uppercase;color:var(--dim);}
        .pl-count{font-family:'Bebas Neue',sans-serif;font-size:20px;letter-spacing:2px;animation:colorShift 7s linear infinite;}
        .find-card{padding:14px 16px;border-bottom:1px solid var(--rule);cursor:pointer;transition:all .2s;animation:slideIn .3s ease both;position:relative;}
        .find-card:hover{background:var(--bg3);}
        .find-card.active{background:var(--bg3);border-left:3px solid currentColor;}
        .fc-top{display:flex;align-items:center;gap:10px;margin-bottom:6px;}
        .fc-dot{width:8px;height:8px;border-radius:50%;flex-shrink:0;}
        .fc-name{font-family:'Bebas Neue',sans-serif;font-size:18px;letter-spacing:2px;color:var(--wht);}
        .fc-rar{font-family:'DM Mono',monospace;font-size:9px;padding:2px 8px;border-radius:2px;color:#000;font-weight:700;margin-left:auto;flex-shrink:0;}
        .fc-sub{font-family:'DM Mono',monospace;font-size:9px;letter-spacing:1px;color:var(--dim);text-transform:uppercase;margin-bottom:3px;}
        .fc-loc{font-family:'Syne',sans-serif;font-size:10px;color:rgba(255,255,255,.25);}
        .fc-status{display:flex;align-items:center;gap:6px;margin-top:8px;}
        .fc-badge{font-family:'DM Mono',monospace;font-size:8px;letter-spacing:2px;text-transform:uppercase;padding:3px 10px;border-radius:2px;}
        .fc-actions{display:flex;gap:6px;margin-left:auto;}
        .fc-btn{font-family:'DM Mono',monospace;font-size:8px;letter-spacing:1px;text-transform:uppercase;padding:4px 12px;border:none;border-radius:2px;cursor:pointer;transition:all .2s;}
        .fc-btn.approve{background:var(--c3);color:#000;}
        .fc-btn.reject{background:var(--bg4);color:var(--dim);border:1px solid var(--rule);}
        .fc-btn:hover{transform:scale(1.05);}
        .fc-btn:disabled{opacity:.4;cursor:not-allowed;transform:none;}

        /* CENTER — PREVIEW */
        .panel-center{overflow-y:auto;scrollbar-width:none;padding:24px;}
        .panel-center::-webkit-scrollbar{display:none;}
        .pc-empty{display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;gap:16px;opacity:.3;}
        .pc-icon{font-size:60px;animation:pulse 3s ease infinite;}
        .pc-txt{font-family:'Bebas Neue',sans-serif;font-size:24px;letter-spacing:6px;animation:colorShift 7s linear infinite;}
        .pc-sub{font-family:'DM Mono',monospace;font-size:9px;letter-spacing:3px;text-transform:uppercase;color:var(--dim);}
        .brand-preview{animation:slideIn .35s ease both;}
        .bp-name{font-family:'Bebas Neue',sans-serif;font-size:48px;letter-spacing:4px;color:var(--wht);line-height:1;margin-bottom:4px;}
        .bp-sub{font-family:'DM Mono',monospace;font-size:10px;letter-spacing:3px;text-transform:uppercase;margin-bottom:12px;}
        .bp-story{font-family:'Playfair Display',serif;font-size:13px;font-style:italic;color:rgba(255,255,255,.55);line-height:1.7;margin-bottom:14px;padding:12px;background:var(--bg2);border-radius:6px;border-left:2px solid currentColor;}
        .bp-guide{font-family:'Playfair Display',serif;font-size:12px;font-style:italic;color:rgba(255,255,255,.4);line-height:1.6;margin-bottom:16px;}
        .bp-meta{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:20px;}
        .bp-tag{font-family:'DM Mono',monospace;font-size:8px;letter-spacing:2px;text-transform:uppercase;padding:4px 12px;border:1px solid var(--rule);border-radius:20px;color:var(--dim);}
        .bp-img{width:100%;border-radius:8px;object-fit:cover;height:280px;margin-bottom:16px;}
        .bp-ctas{display:flex;gap:10px;}
        .bp-cta{flex:1;padding:12px;border:none;border-radius:6px;font-family:'DM Mono',monospace;font-size:9px;letter-spacing:2px;text-transform:uppercase;cursor:pointer;transition:all .2s;font-weight:700;}
        .bp-cta.approve{color:#000;}
        .bp-cta.approve:hover{transform:scale(1.03);}
        .bp-cta.reject{background:var(--bg3);color:var(--dim);border:1px solid var(--rule);}
        .bp-cta.reject:hover{border-color:var(--c4);color:var(--c4);}

        /* RIGHT — INSTAGRAM + LOG */
        .panel-right{border-left:1px solid var(--rule);overflow-y:auto;scrollbar-width:none;background:var(--bg2);display:flex;flex-direction:column;}
        .panel-right::-webkit-scrollbar{display:none;}
        .pr-tabs{display:flex;border-bottom:1px solid var(--rule);}
        .pr-tab{flex:1;padding:12px;font-family:'DM Mono',monospace;font-size:8px;letter-spacing:2px;text-transform:uppercase;background:none;border:none;color:var(--dim);cursor:pointer;transition:all .2s;border-bottom:2px solid transparent;}
        .pr-tab.on{color:var(--wht);border-bottom-color:currentColor;animation:colorShift 7s linear infinite;}
        .pr-content{flex:1;overflow-y:auto;scrollbar-width:none;padding:16px;}
        .pr-content::-webkit-scrollbar{display:none;}

        /* Instagram card section */
        .ig-card-wrap{margin-bottom:16px;}
        .ig-actions{display:flex;gap:8px;margin-bottom:12px;}
        .ig-btn{flex:1;padding:10px;border:none;border-radius:6px;font-family:'DM Mono',monospace;font-size:8px;letter-spacing:2px;text-transform:uppercase;cursor:pointer;transition:all .2s;font-weight:700;}
        .ig-btn.dl{background:var(--c2);color:#000;}
        .ig-btn.cp{background:var(--bg3);border:1px solid var(--rule);color:var(--dim);}
        .ig-btn:hover{transform:scale(1.04);}
        .caption-box{background:var(--bg3);border:1px solid var(--rule);border-radius:6px;padding:12px;font-family:'DM Mono',monospace;font-size:9px;line-height:1.7;color:rgba(255,255,255,.5);white-space:pre-wrap;max-height:200px;overflow-y:auto;}

        /* Log */
        .log-wrap{display:flex;flex-direction:column;gap:0;}
        .log-line{display:flex;gap:10px;padding:8px 0;border-bottom:1px solid rgba(255,255,255,.03);animation:slideIn .2s ease both;}
        .log-t{font-family:'DM Mono',monospace;font-size:8px;color:rgba(255,255,255,.2);flex-shrink:0;padding-top:1px;}
        .log-m{font-family:'DM Mono',monospace;font-size:9px;line-height:1.5;}
        .log-m.info{color:rgba(255,255,255,.4);}
        .log-m.success{color:var(--c3);}
        .log-m.error{color:var(--c4);}
        .log-m.warn{color:var(--c7);}
        .log-m.system{color:var(--c2);}
        .log-m.brand{color:var(--c1);}

        /* Idle state */
        .idle-center{display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;gap:24px;text-align:center;padding:40px;}
        .idle-logo{font-family:'Bebas Neue',sans-serif;font-size:72px;letter-spacing:12px;animation:colorShift 7s linear infinite;}
        .idle-title{font-family:'Bebas Neue',sans-serif;font-size:28px;letter-spacing:6px;color:var(--wht);}
        .idle-sub{font-family:'Syne',sans-serif;font-size:13px;color:var(--dim);max-width:360px;line-height:1.7;}
        .idle-steps{display:flex;flex-direction:column;gap:12px;width:100%;max-width:340px;margin-top:8px;}
        .idle-step{display:flex;align-items:center;gap:14px;padding:12px 16px;background:var(--bg3);border-radius:6px;border:1px solid var(--rule);}
        .is-num{font-family:'Bebas Neue',sans-serif;font-size:22px;letter-spacing:2px;animation:colorShift 7s linear infinite;flex-shrink:0;}
        .is-txt{font-family:'DM Mono',monospace;font-size:9px;letter-spacing:1px;color:rgba(255,255,255,.4);text-align:left;}
      `}</style>

      <div className="app">

        {/* TOP BAR */}
        <div className="topbar">
          <div className="t-logo">ÜNDER</div>
          <div className="t-slash">/</div>
          <div className="t-title">Brand Discovery Pipeline</div>
          {dbCount !== null && (
            <div className="t-stat">DB: <span>{dbCount}</span> brands</div>
          )}
          {publishedCount > 0 && (
            <div className="t-stat">Session: <span style={{color:"var(--c3)"}}>{publishedCount}</span> published</div>
          )}
          <button
            className={`t-run${phase === "searching" ? " running" : ""}`}
            onClick={runSearch}
            disabled={phase === "searching"}
          >
            {phase === "searching" ? <><span className="spin">◌</span> Scanning…</> : "▶ Run Discovery"}
          </button>
        </div>

        {/* LEFT PANEL — finds list */}
        <div className="panel-left">
          <div className="pl-head">
            <div className="pl-label">Candidates</div>
            <div className="pl-count">{finds.length}</div>
          </div>
          {finds.length === 0 && phase !== "searching" && (
            <div style={{padding:"24px 16px",textAlign:"center"}}>
              <div style={{fontFamily:"'DM Mono',monospace",fontSize:9,letterSpacing:2,textTransform:"uppercase",color:"var(--dim)",lineHeight:1.8}}>
                Run discovery to find<br/>new underground brands
              </div>
            </div>
          )}
          {finds.map((b, i) => (
            <div
              key={i}
              className={`find-card${selected === b ? " active" : ""}`}
              style={{ borderLeftColor: selected === b ? b.color : "transparent" }}
              onClick={() => setSelected(b)}
            >
              <div className="fc-top">
                <div className="fc-dot" style={{ background: b.color }} />
                <div className="fc-name">{b.name}</div>
                <div className="fc-rar" style={{ background: b.color }}>{b.rarity || b.r}</div>
              </div>
              <div className="fc-sub">{b.sub}</div>
              <div className="fc-loc">{b.city} · {b.country || b.ctry}</div>
              <div className="fc-status">
                <div className="fc-badge" style={{
                  background: statusColor(b._status) + "22",
                  color: statusColor(b._status),
                  border: `1px solid ${statusColor(b._status)}44`
                }}>
                  {statusIcon(b._status)} {b._status}
                </div>
                {b._status === "pending" && (
                  <div className="fc-actions">
                    <button className="fc-btn approve" onClick={(e) => { e.stopPropagation(); approve(b); }}>Publish</button>
                    <button className="fc-btn reject" onClick={(e) => { e.stopPropagation(); reject(b); }}>Skip</button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* CENTER PANEL — brand preview */}
        <div className="panel-center">
          {!selected ? (
            phase === "idle" ? (
              <div className="idle-center">
                <div className="idle-logo">ÜNDER</div>
                <div className="idle-title">Discovery Engine</div>
                <div className="idle-sub">Claude searches the global fashion underground, qualifies each brand, and prepares Instagram content — ready for your approval.</div>
                <div className="idle-steps">
                  {[
                    ["01", "Claude scans 3 intelligence waves for hidden brands"],
                    ["02", "Each find scored on craft, rarity & celebrity adjacency"],
                    ["03", "Review candidates, approve to publish live to ÜNDER"],
                    ["04", "Download Instagram card + caption, ready to post"],
                  ].map(([n, t]) => (
                    <div key={n} className="idle-step">
                      <div className="is-num">{n}</div>
                      <div className="is-txt">{t}</div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="pc-empty">
                <div className="pc-icon">◎</div>
                <div className="pc-txt">Select a brand</div>
                <div className="pc-sub">Click any candidate to preview</div>
              </div>
            )
          ) : (
            <div className="brand-preview" key={selected.name}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                <div style={{ width: 10, height: 10, borderRadius: "50%", background: selected.color }} />
                <div style={{ fontFamily: "'DM Mono',monospace", fontSize: 8, letterSpacing: 3, textTransform: "uppercase", color: "var(--dim)" }}>
                  {selected.continent || selected.cont} · {selected.cat}
                </div>
              </div>
              <div className="bp-name">{selected.name}</div>
              <div className="bp-sub" style={{ color: selected.color }}>{selected.sub}</div>
              <img className="bp-img" src={selected.img} alt={selected.name} />
              <div className="bp-story" style={{ borderLeftColor: selected.color, color: "rgba(255,255,255,.55)" }}>
                {selected.story}
              </div>
              <div className="bp-guide">"{selected.g || selected.guide}"</div>
              <div className="bp-meta">
                {[selected.city, selected.country || selected.ctry, `${selected.rarity || selected.r}/10`, selected.cat].map(t => (
                  <div key={t} className="bp-tag">{t}</div>
                ))}
              </div>
              {selected._status === "pending" && (
                <div className="bp-ctas">
                  <button className="bp-cta approve" style={{ background: selected.color }} onClick={() => approve(selected)}>
                    ✓ Publish to ÜNDER
                  </button>
                  <button className="bp-cta reject" onClick={() => reject(selected)}>
                    ✗ Skip
                  </button>
                </div>
              )}
              {selected._status === "published" && (
                <div style={{ padding: 12, background: "rgba(124,255,80,.08)", border: "1px solid rgba(124,255,80,.2)", borderRadius: 6, fontFamily: "'DM Mono',monospace", fontSize: 9, letterSpacing: 2, textTransform: "uppercase", color: "var(--c3)" }}>
                  ✓ Live on ÜNDER
                </div>
              )}
            </div>
          )}
        </div>

        {/* RIGHT PANEL — Instagram + Log */}
        <div className="panel-right">
          <div className="pr-tabs">
            <button className="pr-tab on">Instagram</button>
            <button className="pr-tab" style={{ color: "var(--dim)" }} onClick={e => {
              e.currentTarget.parentElement.querySelectorAll(".pr-tab").forEach(t => t.classList.remove("on"));
              e.currentTarget.classList.add("on");
            }}>Log</button>
          </div>
          <div className="pr-content">
            {selected ? (
              <>
                <div className="ig-card-wrap">
                  <InstagramCard brand={selected} onCaption={setCaption} />
                </div>
                <div className="ig-actions">
                  <button className="ig-btn dl" onClick={downloadCard}>↓ Download Card</button>
                  <button className="ig-btn cp" onClick={copyCaption}>⎘ Copy Caption</button>
                </div>
                <div className="caption-box">{caption}</div>
              </>
            ) : (
              <div style={{ textAlign: "center", padding: "40px 0", fontFamily: "'DM Mono',monospace", fontSize: 9, letterSpacing: 2, textTransform: "uppercase", color: "var(--dim)", lineHeight: 2 }}>
                Select a brand<br />to generate<br />Instagram content
              </div>
            )}
            <div className="log-wrap" style={{ marginTop: 16 }}>
              {log.map((l, i) => (
                <div key={i} className="log-line">
                  <div className="log-t">{l.t}</div>
                  <div className={`log-m ${l.type}`}>{l.msg}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </>
  );
}
