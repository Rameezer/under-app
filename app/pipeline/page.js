'use client';
import { useState, useEffect, useRef } from "react";

const SUPABASE_URL = "https://geqqyxrmdxwwyyddxohc.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdlcXF5eHJtZHh3d3l5ZGR4b2hjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI5OTU0NzcsImV4cCI6MjA4ODU3MTQ3N30.0E3K0sfEAicGq4cKBqk_N2TdIrLs10pNgrGe_KC-z6Y";

const PALETTE = ["#FF6B35","#00E5FF","#7CFF50","#FF2D9B","#A855F7","#00FFBB","#FFD700"];
const CATS = ["Knitwear","Drape","Tailoring","Denim","Workwear","Minimal","Accs"];
const CONTS = ["Africa","Americas","Asia","Europe","Oceania"];

const UNSPLASH_POOLS = {
  Knitwear: ["photo-1558618666-fcd25c85cd64","photo-1516762689617-e1cffcef479d","photo-1591085686350-798c0f9faa7f"],
  Drape:    ["photo-1490481651871-ab68de25d43d","photo-1469334031218-e382a71b716b","photo-1523381294911-8d3cead13475"],
  Tailoring:["photo-1529139574466-a303027c1d8b","photo-1506629082955-511b1aa562c8","photo-1509631179647-0177331693ae"],
  Denim:    ["photo-1542272604-787c3835535d","photo-1475178626620-a4d074967452","photo-1543163521-1bf539c55dd2"],
  Workwear: ["photo-1556905055-8f358a7a47b2","photo-1523381210434-271e8be1f52b","photo-1542272604-787c3835535d"],
  Minimal:  ["photo-1496747611176-843222e1e57c","photo-1517841905240-472988babdf9","photo-1515886657613-9f3515b0c78f"],
  Accs:     ["photo-1534528741775-53994a69daeb","photo-1542291026-7eec264c27ff","photo-1483985988355-763728e1935b"],
};
const ALL_PHOTOS = ["photo-1558618666-fcd25c85cd64","photo-1542272604-787c3835535d","photo-1504703395950-b89145a5425b","photo-1509631179647-0177331693ae","photo-1529139574466-a303027c1d8b","photo-1490481651871-ab68de25d43d","photo-1543163521-1bf539c55dd2","photo-1496747611176-843222e1e57c","photo-1517841905240-472988babdf9","photo-1475178626620-a4d074967452","photo-1469334031218-e382a71b716b","photo-1528360983277-13d401cdc186","photo-1523381294911-8d3cead13475","photo-1551803091-e20673f15770","photo-1534528741775-53994a69daeb","photo-1516762689617-e1cffcef479d","photo-1518611012118-696072aa579a","photo-1483985988355-763728e1935b","photo-1506629082955-511b1aa562c8","photo-1515886657613-9f3515b0c78f","photo-1591085686350-798c0f9faa7f","photo-1556905055-8f358a7a47b2","photo-1523381210434-271e8be1f52b","photo-1542291026-7eec264c27ff","photo-1483985988355-763728e1935b","photo-1504703395950-b89145a5425b","photo-1518611012118-696072aa579a","photo-1515886657613-9f3515b0c78f"];

function imgUrl(id) { return `https://images.unsplash.com/${id}?w=800&q=90`; }
function getDefaultImg(cat) {
  const pool = UNSPLASH_POOLS[cat] || ALL_PHOTOS;
  return imgUrl(pool[Math.floor(Math.random() * pool.length)]);
}

async function runDiscoveryWave(waveIndex) {
  const res = await fetch("/api/discover", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ wave: waveIndex }),
  });
  const data = await res.json();
  return data.brands || [];
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
      color: brand.color,
      img: brand.img,
      g: brand.g,
      story: brand.story,
    }),
  });
  return res.ok;
}

function generateCaption(b) {
  return `◆ ${b.name.toUpperCase()} ◆\n\n${b.story}\n\n"${b.g}"\n\n📍 ${b.city} · Rarity ${b.rarity || b.r}/10\n\nThe names you don't know are often the ones worth knowing most.\n\n─────────────────────\n#underground #${(b.cat||"").toLowerCase()} #${(b.city||"").toLowerCase().replace(/\s/g,"")} #niche #luxury #independentfashion #artisan #slowfashion #UNDER #unknownbrands #fashionfinds #${(b.continent||b.cont||"global").toLowerCase()}fashion #hiddentreasure #fashionculture #styleknowledge`;
}

function wrapText(ctx, text, x, y, maxW, lineH) {
  const words = text.split(" ");
  let line = "";
  for (let i = 0; i < words.length; i++) {
    const test = line + words[i] + " ";
    if (ctx.measureText(test).width > maxW && i > 0) {
      ctx.fillText(line.trim(), x, y);
      line = words[i] + " ";
      y += lineH;
    } else { line = test; }
  }
  ctx.fillText(line.trim(), x, y);
  return y;
}

function InstagramCanvas({ brand }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !brand) return;
    const ctx = canvas.getContext("2d");
    const W = 1080, H = 1080;
    canvas.width = W; canvas.height = H;
    const color = brand.color || "#FF6B35";

    ctx.fillStyle = "#050505";
    ctx.fillRect(0, 0, W, H);

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      // Image top 58%
      ctx.drawImage(img, 0, 0, W, H * 0.62);
      // Gradient over image
      const g1 = ctx.createLinearGradient(0, H * 0.28, 0, H * 0.62);
      g1.addColorStop(0, "rgba(5,5,5,0)");
      g1.addColorStop(1, "rgba(5,5,5,0.97)");
      ctx.fillStyle = g1;
      ctx.fillRect(0, 0, W, H * 0.62);
      // Bottom panel
      ctx.fillStyle = "#0D0D0D";
      ctx.fillRect(0, H * 0.60, W, H * 0.40);
      // Top color bar
      ctx.fillStyle = color;
      ctx.fillRect(0, 0, W, 7);
      // Bottom color bar
      ctx.fillStyle = color;
      ctx.fillRect(0, H - 7, W, 7);
      // Separator line
      ctx.fillStyle = color;
      ctx.fillRect(0, H * 0.60, W, 3);

      // ÜNDER top-left
      ctx.fillStyle = color;
      ctx.font = "700 48px 'Arial Black', Arial, sans-serif";
      ctx.fillText("ÜNDER", 52, 74);

      // Rarity badge top-right
      ctx.fillStyle = color;
      ctx.fillRect(W - 210, 28, 175, 52);
      ctx.fillStyle = "#000";
      ctx.font = "700 22px 'Courier New', monospace";
      ctx.fillText(`◆ ${brand.rarity || brand.r} / 10`, W - 198, 62);

      // Brand name
      const nameSize = brand.name.length > 12 ? 80 : 100;
      ctx.fillStyle = "#FFFFFF";
      ctx.font = `700 ${nameSize}px 'Arial Black', Arial, sans-serif`;
      ctx.fillText(brand.name, 52, H * 0.62 + 100);

      // Sub
      ctx.fillStyle = color;
      ctx.font = "500 24px 'Courier New', monospace";
      ctx.fillText((brand.sub || "").toUpperCase(), 52, H * 0.62 + 148);

      // City · Country
      ctx.fillStyle = "rgba(255,255,255,0.35)";
      ctx.font = "22px 'Courier New', monospace";
      ctx.fillText(`${brand.city || ""}  ·  ${brand.country || brand.ctry || ""}`, 52, H * 0.62 + 190);

      // Guide quote
      ctx.fillStyle = "rgba(255,255,255,0.55)";
      ctx.font = "italic 26px Georgia, serif";
      const quoteY = wrapText(ctx, `"${brand.g || ""}"`, 52, H * 0.62 + 248, W - 104, 38);

      // Category pill
      ctx.fillStyle = color;
      ctx.fillRect(52, H - 72, (brand.cat||"").length * 16 + 40, 42);
      ctx.fillStyle = "#000";
      ctx.font = "700 18px 'Courier New', monospace";
      ctx.fillText((brand.cat || "").toUpperCase(), 70, H - 44);

      // Underground label
      ctx.fillStyle = "rgba(255,255,255,0.18)";
      ctx.font = "16px 'Courier New', monospace";
      ctx.fillText("UNDERGROUND DISCOVERY · ÜNDER", W - 490, H - 44);
    };
    img.onerror = () => {
      ctx.fillStyle = color + "15";
      ctx.fillRect(0, 0, W, H * 0.60);
    };
    img.src = brand.img;
  }, [brand, brand?.img, brand?.color, brand?.name, brand?.sub, brand?.city, brand?.g, brand?.rarity, brand?.r, brand?.cat]);

  return (
    <canvas ref={canvasRef} style={{ width: "100%", borderRadius: 6, display: "block" }} />
  );
}

export default function Pipeline() {
  const [phase, setPhase] = useState("idle");
  const [log, setLog] = useState([]);
  const [finds, setFinds] = useState([]);
  const [selected, setSelected] = useState(null);
  const [editing, setEditing] = useState(null); // live edit copy
  const [rightTab, setRightTab] = useState("instagram");
  const [imgPickerOpen, setImgPickerOpen] = useState(false);
  const [imgSearch, setImgSearch] = useState("");
  const [dbCount, setDbCount] = useState(null);
  const [publishedCount, setPublishedCount] = useState(0);
  const [copied, setCopied] = useState(false);

  const addLog = (msg, type = "info") =>
    setLog(l => [...l, { msg, type, t: new Date().toLocaleTimeString() }]);

  useEffect(() => {
    fetch(`${SUPABASE_URL}/rest/v1/brands?select=id`, {
      headers: { "apikey": SUPABASE_KEY, "Authorization": `Bearer ${SUPABASE_KEY}` }
    }).then(r => r.json()).then(d => setDbCount(d.length)).catch(() => {});
  }, [publishedCount]);

  // Sync editing when selected changes
  useEffect(() => {
    if (selected) setEditing({ ...selected });
  }, [selected?.name]);

  const selectBrand = (b) => {
    setSelected(b);
    setEditing({ ...b });
    setImgPickerOpen(false);
  };

  const updateEdit = (key, val) => {
    setEditing(e => ({ ...e, [key]: val }));
    // also update the finds array so left panel reflects
    setFinds(f => f.map(b => b === selected ? { ...b, [key]: val } : b));
    setSelected(s => ({ ...s, [key]: val }));
  };

  const runSearch = async () => {
    setPhase("searching");
    setFinds([]);
    setSelected(null);
    setEditing(null);
    setLog([]);
    addLog("Initializing brand discovery engine...", "system");
    const allFinds = [];
    for (let i = 0; i < 3; i++) {
      addLog(`Search wave ${i + 1}/3 — querying fashion intelligence...`, "info");
      await new Promise(r => setTimeout(r, 400));
      try {
        const results = await runDiscoveryWave(i);
        addLog(`Wave ${i + 1}: ${results.length} candidates found`, "success");
        for (const b of results) {
          b.img = getDefaultImg(b.cat);
          b.color = PALETTE[allFinds.length % PALETTE.length];
          b._status = "pending";
          allFinds.push(b);
          setFinds([...allFinds]);
          addLog(`◆ ${b.name} — ${b.city} · Rarity ${b.rarity || b.r}`, "brand");
          await new Promise(r => setTimeout(r, 200));
        }
      } catch (e) {
        addLog(`Wave ${i + 1} error: ${e.message}`, "error");
      }
    }
    addLog(`Complete. ${allFinds.length} brands ready for review.`, "system");
    setPhase("reviewing");
    if (allFinds.length > 0) selectBrand(allFinds[0]);
  };

  const approve = async (b) => {
    const brand = editing && selected === b ? editing : b;
    b._status = "publishing";
    setFinds([...finds]);
    addLog(`Publishing ${brand.name}...`, "info");
    const ok = await publishToSupabase(brand);
    b._status = ok ? "published" : "error";
    setFinds([...finds]);
    if (ok) {
      setPublishedCount(c => c + 1);
      addLog(`✓ ${brand.name} is now live on ÜNDER`, "success");
    } else {
      addLog(`✗ Failed: ${brand.name}`, "error");
    }
  };

  const reject = (b) => {
    b._status = "rejected";
    setFinds([...finds]);
    addLog(`Skipped: ${b.name}`, "warn");
  };

  const downloadCard = () => {
    const canvas = document.querySelector("canvas");
    if (!canvas) return;
    const a = document.createElement("a");
    a.download = `under-${(editing?.name || "brand").toLowerCase().replace(/\s/g, "-")}.png`;
    a.href = canvas.toDataURL("image/png");
    a.click();
  };

  const copyCaption = () => {
    if (!editing) return;
    navigator.clipboard.writeText(generateCaption(editing));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Image picker photos — filtered by search keyword matching pool
  const pickerPhotos = imgSearch.trim()
    ? ALL_PHOTOS.filter((_, i) => i % 3 === (imgSearch.length % 3)) // deterministic variety by query
    : ALL_PHOTOS;

  const statusColor = s => ({ pending:"#444", publishing:"#FFD700", published:"#7CFF50", rejected:"#333", error:"#FF4444" }[s] || "#444");
  const statusIcon  = s => ({ pending:"◎", publishing:"◌", published:"✓", rejected:"✗", error:"!" }[s] || "◎");

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Mono:ital,wght@0,400;0,500;1,400&family=Syne:wght@400;600;700&family=Playfair+Display:ital@1&display=swap');
        *,*::before,*::after{margin:0;padding:0;box-sizing:border-box;}
        html,body{height:100%;overflow:hidden;background:#050505;color:#fff;font-family:'Syne',sans-serif;}
        :root{--bg:#050505;--bg2:#0D0D0D;--bg3:#151515;--bg4:#1E1E1E;--wht:#fff;--dim:#555;--rule:rgba(255,255,255,0.06);--glass:rgba(5,5,5,0.9);--c1:#FF6B35;--c2:#00E5FF;--c3:#7CFF50;--c4:#FF2D9B;--c5:#A855F7;--c6:#00FFBB;--c7:#FFD700;}
        @keyframes colorShift{0%{color:var(--c1);}14%{color:var(--c2);}28%{color:var(--c3);}42%{color:var(--c4);}56%{color:var(--c5);}70%{color:var(--c6);}84%{color:var(--c7);}100%{color:var(--c1);}}
        @keyframes spin{to{transform:rotate(360deg);}}
        @keyframes fadeIn{from{opacity:0;transform:translateY(8px);}to{opacity:1;transform:none;}}
        @keyframes pulse{0%,100%{opacity:.3;}50%{opacity:.8;}}
        @keyframes glow{0%,100%{box-shadow:0 0 20px rgba(255,215,0,.15);}50%{box-shadow:0 0 40px rgba(255,215,0,.4);}}

        .app{display:grid;grid-template-columns:300px 1fr 380px;grid-template-rows:56px 1fr;height:100vh;overflow:hidden;}

        /* TOPBAR */
        .tb{grid-column:1/-1;display:flex;align-items:center;gap:16px;padding:0 20px;border-bottom:1px solid var(--rule);background:var(--bg2);z-index:50;}
        .tb-logo{font-family:'Bebas Neue',sans-serif;font-size:24px;letter-spacing:5px;animation:colorShift 7s linear infinite;flex-shrink:0;}
        .tb-div{color:var(--rule);font-size:18px;}
        .tb-title{font-family:'DM Mono',monospace;font-size:10px;letter-spacing:3px;text-transform:uppercase;color:var(--dim);}
        .tb-chip{font-family:'DM Mono',monospace;font-size:9px;letter-spacing:2px;text-transform:uppercase;padding:4px 12px;border:1px solid var(--rule);border-radius:20px;color:var(--dim);flex-shrink:0;}
        .tb-chip b{animation:colorShift 7s linear infinite;}
        .tb-run{margin-left:auto;font-family:'Bebas Neue',sans-serif;font-size:16px;letter-spacing:3px;padding:8px 28px;background:var(--c1);color:#000;border:none;cursor:pointer;transition:all .2s;flex-shrink:0;}
        .tb-run:hover{transform:scale(1.04);box-shadow:0 0 24px rgba(255,107,53,.4);}
        .tb-run:disabled{opacity:.4;cursor:not-allowed;transform:none;background:var(--bg3);color:var(--c7);border:1px solid var(--c7);animation:glow 2s ease infinite;}
        .spin{display:inline-block;animation:spin 1s linear infinite;}

        /* LEFT */
        .left{border-right:1px solid var(--rule);overflow-y:auto;scrollbar-width:none;background:var(--bg2);}
        .left::-webkit-scrollbar{display:none;}
        .left-hd{padding:12px 14px;border-bottom:1px solid var(--rule);display:flex;align-items:center;justify-content:space-between;}
        .left-lbl{font-family:'DM Mono',monospace;font-size:8px;letter-spacing:3px;text-transform:uppercase;color:var(--dim);}
        .left-ct{font-family:'Bebas Neue',sans-serif;font-size:22px;letter-spacing:2px;animation:colorShift 7s linear infinite;}
        .fc{padding:12px 14px;border-bottom:1px solid var(--rule);cursor:pointer;transition:background .15s;animation:fadeIn .3s ease both;border-left:3px solid transparent;}
        .fc:hover{background:var(--bg3);}
        .fc.active{background:var(--bg3);}
        .fc-row{display:flex;align-items:center;gap:8px;margin-bottom:4px;}
        .fc-dot{width:7px;height:7px;border-radius:50%;flex-shrink:0;}
        .fc-name{font-family:'Bebas Neue',sans-serif;font-size:16px;letter-spacing:2px;flex:1;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
        .fc-r{font-family:'DM Mono',monospace;font-size:8px;padding:2px 7px;color:#000;font-weight:700;flex-shrink:0;}
        .fc-sub{font-family:'DM Mono',monospace;font-size:8px;letter-spacing:1px;color:var(--dim);text-transform:uppercase;margin-bottom:2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
        .fc-loc{font-family:'Syne',sans-serif;font-size:9px;color:rgba(255,255,255,.2);margin-bottom:6px;}
        .fc-foot{display:flex;align-items:center;gap:6px;}
        .fc-badge{font-family:'DM Mono',monospace;font-size:7px;letter-spacing:1px;text-transform:uppercase;padding:2px 8px;border-radius:2px;flex-shrink:0;}
        .fc-btns{display:flex;gap:4px;margin-left:auto;}
        .fc-btn{font-family:'DM Mono',monospace;font-size:7px;letter-spacing:1px;text-transform:uppercase;padding:3px 10px;border:none;cursor:pointer;border-radius:2px;transition:all .15s;}
        .fc-btn.pub{background:var(--c3);color:#000;}
        .fc-btn.skip{background:var(--bg4);color:var(--dim);border:1px solid var(--rule);}
        .fc-btn:hover:not(:disabled){transform:scale(1.06);}
        .fc-btn:disabled{opacity:.4;cursor:not-allowed;}

        /* CENTER */
        .center{overflow-y:auto;scrollbar-width:none;padding:0;}
        .center::-webkit-scrollbar{display:none;}
        .idle{display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;gap:20px;padding:40px;text-align:center;}
        .idle-logo{font-family:'Bebas Neue',sans-serif;font-size:64px;letter-spacing:10px;animation:colorShift 7s linear infinite;}
        .idle-h{font-family:'Bebas Neue',sans-serif;font-size:22px;letter-spacing:5px;color:var(--wht);}
        .idle-p{font-family:'Syne',sans-serif;font-size:12px;color:var(--dim);max-width:320px;line-height:1.7;}
        .idle-steps{width:100%;max-width:300px;display:flex;flex-direction:column;gap:8px;}
        .is{display:flex;gap:12px;align-items:center;padding:10px 14px;background:var(--bg3);border-radius:4px;border:1px solid var(--rule);}
        .is-n{font-family:'Bebas Neue',sans-serif;font-size:20px;letter-spacing:2px;animation:colorShift 7s linear infinite;flex-shrink:0;}
        .is-t{font-family:'DM Mono',monospace;font-size:8px;letter-spacing:1px;color:rgba(255,255,255,.35);text-align:left;line-height:1.5;}

        /* EDIT PANEL */
        .edit{padding:20px;animation:fadeIn .25s ease both;}
        .ed-header{display:flex;align-items:flex-start;gap:12px;margin-bottom:16px;}
        .ed-dot{width:10px;height:10px;border-radius:50%;margin-top:4px;flex-shrink:0;}
        .ed-name-wrap{flex:1;}
        .ed-input{width:100%;background:var(--bg3);border:1px solid var(--rule);color:var(--wht);padding:8px 12px;font-family:inherit;font-size:inherit;border-radius:4px;outline:none;transition:border-color .2s;}
        .ed-input:focus{border-color:currentColor;}
        .ed-name{font-family:'Bebas Neue',sans-serif;font-size:42px;letter-spacing:4px;margin-bottom:0;}
        .ed-sub-inp{font-family:'DM Mono',monospace;font-size:10px;letter-spacing:2px;text-transform:uppercase;margin-top:4px;}
        .ed-section{margin-bottom:14px;}
        .ed-label{font-family:'DM Mono',monospace;font-size:8px;letter-spacing:3px;text-transform:uppercase;color:var(--dim);margin-bottom:6px;display:flex;align-items:center;gap:8px;}
        .ed-label::after{content:'';flex:1;height:1px;background:var(--rule);}
        .ed-textarea{width:100%;background:var(--bg3);border:1px solid var(--rule);color:rgba(255,255,255,.7);padding:10px 12px;font-family:'Playfair Display',serif;font-size:13px;font-style:italic;border-radius:4px;outline:none;resize:vertical;min-height:80px;line-height:1.7;transition:border-color .2s;}
        .ed-textarea:focus{border-color:rgba(255,255,255,.2);}
        .ed-row{display:flex;gap:8px;}
        .ed-sel{background:var(--bg3);border:1px solid var(--rule);color:var(--wht);padding:7px 10px;font-family:'DM Mono',monospace;font-size:9px;letter-spacing:1px;border-radius:4px;outline:none;cursor:pointer;flex:1;}
        .ed-num{width:80px;text-align:center;}
        .ed-img-preview{width:100%;height:200px;object-fit:cover;border-radius:6px;border:1px solid var(--rule);cursor:pointer;transition:opacity .2s;}
        .ed-img-preview:hover{opacity:.8;}
        .ed-img-hint{font-family:'DM Mono',monospace;font-size:8px;letter-spacing:2px;text-transform:uppercase;color:var(--dim);margin-top:5px;text-align:center;}
        .color-row{display:flex;gap:6px;margin-top:6px;}
        .color-swatch{width:28px;height:28px;border-radius:50%;cursor:pointer;border:2px solid transparent;transition:all .2s;}
        .color-swatch:hover,.color-swatch.on{border-color:#fff;transform:scale(1.15);}
        .ed-actions{display:flex;gap:10px;margin-top:20px;padding-top:16px;border-top:1px solid var(--rule);}
        .ed-btn{flex:1;padding:12px;border:none;border-radius:4px;font-family:'DM Mono',monospace;font-size:9px;letter-spacing:2px;text-transform:uppercase;cursor:pointer;transition:all .2s;font-weight:700;}
        .ed-btn.pub{color:#000;}
        .ed-btn.pub:hover{transform:scale(1.03);filter:brightness(1.1);}
        .ed-btn.skip{background:var(--bg3);color:var(--dim);border:1px solid var(--rule);}
        .ed-btn.skip:hover{border-color:var(--c4);color:var(--c4);}
        .ed-published{padding:10px 14px;background:rgba(124,255,80,.07);border:1px solid rgba(124,255,80,.2);border-radius:4px;font-family:'DM Mono',monospace;font-size:9px;letter-spacing:2px;text-transform:uppercase;color:var(--c3);}

        /* IMG PICKER MODAL */
        .picker-over{position:fixed;inset:0;z-index:200;background:rgba(0,0,0,.88);backdrop-filter:blur(16px);display:flex;align-items:center;justify-content:center;padding:24px;}
        .picker-box{background:var(--bg2);border-radius:10px;width:100%;max-width:700px;max-height:80vh;display:flex;flex-direction:column;border:1px solid var(--rule);}
        .picker-hd{display:flex;align-items:center;gap:12px;padding:14px 16px;border-bottom:1px solid var(--rule);}
        .picker-title{font-family:'Bebas Neue',sans-serif;font-size:20px;letter-spacing:4px;animation:colorShift 7s linear infinite;}
        .picker-search{flex:1;background:var(--bg3);border:1px solid var(--rule);color:var(--wht);padding:7px 14px;border-radius:20px;font-family:'Syne',sans-serif;font-size:12px;outline:none;}
        .picker-close{background:none;border:none;color:var(--dim);font-size:18px;cursor:pointer;padding:4px 8px;}
        .picker-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:6px;padding:14px;overflow-y:auto;scrollbar-width:thin;}
        .picker-img{width:100%;aspect-ratio:1;object-fit:cover;border-radius:4px;cursor:pointer;border:2px solid transparent;transition:all .2s;}
        .picker-img:hover{border-color:#fff;transform:scale(1.03);}
        .picker-url{padding:10px 14px;border-top:1px solid var(--rule);display:flex;gap:8px;}
        .picker-url-in{flex:1;background:var(--bg3);border:1px solid var(--rule);color:var(--wht);padding:7px 12px;border-radius:4px;font-family:'DM Mono',monospace;font-size:9px;outline:none;}
        .picker-url-btn{background:var(--c2);color:#000;border:none;padding:7px 16px;border-radius:4px;font-family:'DM Mono',monospace;font-size:9px;letter-spacing:1px;cursor:pointer;font-weight:700;}

        /* RIGHT */
        .right{border-left:1px solid var(--rule);display:flex;flex-direction:column;background:var(--bg2);overflow:hidden;}
        .r-tabs{display:flex;border-bottom:1px solid var(--rule);flex-shrink:0;}
        .r-tab{flex:1;padding:10px;font-family:'DM Mono',monospace;font-size:8px;letter-spacing:2px;text-transform:uppercase;background:none;border:none;color:var(--dim);cursor:pointer;transition:all .2s;border-bottom:2px solid transparent;}
        .r-tab.on{color:var(--wht);border-bottom-color:currentColor;}
        .r-body{flex:1;overflow-y:auto;scrollbar-width:none;padding:14px;}
        .r-body::-webkit-scrollbar{display:none;}
        .ig-actions{display:flex;gap:8px;margin-top:10px;margin-bottom:10px;}
        .ig-btn{flex:1;padding:9px;border:none;border-radius:4px;font-family:'DM Mono',monospace;font-size:8px;letter-spacing:2px;text-transform:uppercase;cursor:pointer;transition:all .2s;font-weight:700;}
        .ig-btn.dl{background:var(--c2);color:#000;}
        .ig-btn.cp{background:var(--bg3);border:1px solid var(--rule);color:var(--dim);}
        .ig-btn:hover{transform:scale(1.04);}
        .ig-caption{background:var(--bg3);border:1px solid var(--rule);border-radius:4px;padding:10px;font-family:'DM Mono',monospace;font-size:8px;line-height:1.8;color:rgba(255,255,255,.4);white-space:pre-wrap;max-height:220px;overflow-y:auto;}
        .log-entry{display:flex;gap:8px;padding:6px 0;border-bottom:1px solid rgba(255,255,255,.025);animation:fadeIn .2s ease both;}
        .log-time{font-family:'DM Mono',monospace;font-size:7px;color:rgba(255,255,255,.15);flex-shrink:0;padding-top:1px;}
        .log-msg{font-family:'DM Mono',monospace;font-size:8px;line-height:1.5;}
        .log-msg.info{color:rgba(255,255,255,.35);}
        .log-msg.success{color:var(--c3);}
        .log-msg.error{color:var(--c4);}
        .log-msg.warn{color:var(--c7);}
        .log-msg.system{color:var(--c2);}
        .log-msg.brand{color:var(--c1);}
        .no-select{display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;gap:10px;opacity:.25;}
        .no-select-icon{font-size:40px;animation:pulse 3s ease infinite;}
        .no-select-txt{font-family:'DM Mono',monospace;font-size:8px;letter-spacing:3px;text-transform:uppercase;}
      `}</style>

      <div className="app">

        {/* TOPBAR */}
        <div className="tb">
          <div className="tb-logo">ÜNDER</div>
          <div className="tb-div">/</div>
          <div className="tb-title">Discovery Pipeline</div>
          {dbCount !== null && <div className="tb-chip">DB: <b>{dbCount}</b> brands</div>}
          {publishedCount > 0 && <div className="tb-chip">Session: <b style={{color:"var(--c3)"}}>{publishedCount}</b> published</div>}
          <button className="tb-run" onClick={runSearch} disabled={phase === "searching"}>
            {phase === "searching" ? <><span className="spin">◌</span> Scanning…</> : "▶ Run Discovery"}
          </button>
        </div>

        {/* LEFT — candidates */}
        <div className="left">
          <div className="left-hd">
            <div className="left-lbl">Candidates</div>
            <div className="left-ct">{finds.length}</div>
          </div>
          {finds.length === 0 && (
            <div style={{padding:"20px 14px",fontFamily:"'DM Mono',monospace",fontSize:8,letterSpacing:2,textTransform:"uppercase",color:"var(--dim)",lineHeight:2,textAlign:"center"}}>
              Run discovery<br/>to find brands
            </div>
          )}
          {finds.map((b, i) => (
            <div key={i} className={`fc${selected === b ? " active" : ""}`}
              style={{ borderLeftColor: selected === b ? b.color : "transparent" }}
              onClick={() => selectBrand(b)}>
              <div className="fc-row">
                <div className="fc-dot" style={{background: b.color}} />
                <div className="fc-name">{b.name}</div>
                <div className="fc-r" style={{background: b.color}}>{b.rarity || b.r}</div>
              </div>
              <div className="fc-sub">{b.sub}</div>
              <div className="fc-loc">{b.city} · {b.country || b.ctry}</div>
              <div className="fc-foot">
                <div className="fc-badge" style={{background: statusColor(b._status)+"22", color: statusColor(b._status), border:`1px solid ${statusColor(b._status)}33`}}>
                  {statusIcon(b._status)} {b._status}
                </div>
                {b._status === "pending" && (
                  <div className="fc-btns" onClick={e => e.stopPropagation()}>
                    <button className="fc-btn pub" onClick={() => approve(b)}>Publish</button>
                    <button className="fc-btn skip" onClick={() => reject(b)}>Skip</button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* CENTER — editor */}
        <div className="center">
          {!editing ? (
            <div className="idle">
              <div className="idle-logo">ÜNDER</div>
              <div className="idle-h">Discovery Engine</div>
              <div className="idle-p">Claude scans the global fashion underground, qualifies each find, and lets you edit everything before publishing live.</div>
              <div className="idle-steps">
                {[["01","Claude runs 3 search waves for hidden brands"],["02","Each brand scored on craft, rarity & celebrity adjacency"],["03","Edit name, story, image, color before publishing"],["04","One click publishes live + generates Instagram content"]].map(([n,t]) => (
                  <div key={n} className="is"><div className="is-n">{n}</div><div className="is-t">{t}</div></div>
                ))}
              </div>
            </div>
          ) : (
            <div className="edit" key={editing.name}>

              {/* Name + sub */}
              <div className="ed-header">
                <div className="ed-dot" style={{background: editing.color}} />
                <div className="ed-name-wrap">
                  <input className="ed-input ed-name"
                    value={editing.name || ""}
                    onChange={e => updateEdit("name", e.target.value)}
                    style={{color: editing.color, background:"transparent", border:"none", borderBottom:"1px solid var(--rule)", borderRadius:0, padding:"4px 0", fontSize:42, fontFamily:"'Bebas Neue',sans-serif", letterSpacing:4}}
                  />
                  <input className="ed-input ed-sub-inp"
                    value={editing.sub || ""}
                    onChange={e => updateEdit("sub", e.target.value)}
                    placeholder="Craft descriptor..."
                    style={{marginTop:6, color: editing.color + "aa"}}
                  />
                </div>
              </div>

              {/* Image */}
              <div className="ed-section">
                <div className="ed-label">Image</div>
                <img className="ed-img-preview" src={editing.img} alt="" onClick={() => setImgPickerOpen(true)} />
                <div className="ed-img-hint">↑ click to change image</div>
              </div>

              {/* Story */}
              <div className="ed-section">
                <div className="ed-label">Story</div>
                <textarea className="ed-textarea"
                  value={editing.story || ""}
                  onChange={e => updateEdit("story", e.target.value)}
                  rows={3}
                />
              </div>

              {/* Guide quote */}
              <div className="ed-section">
                <div className="ed-label">Guide Quote</div>
                <textarea className="ed-textarea"
                  value={editing.g || ""}
                  onChange={e => updateEdit("g", e.target.value)}
                  rows={2}
                  style={{minHeight:54}}
                />
              </div>

              {/* Meta row */}
              <div className="ed-section">
                <div className="ed-label">Details</div>
                <div className="ed-row">
                  <input className="ed-input" placeholder="City" value={editing.city || ""} onChange={e => updateEdit("city", e.target.value)} style={{flex:1}} />
                  <input className="ed-input" placeholder="Country" value={editing.country || editing.ctry || ""} onChange={e => updateEdit("ctry", e.target.value)} style={{width:70}} />
                  <input className="ed-input ed-num" placeholder="Rarity" value={editing.rarity || editing.r || ""} onChange={e => updateEdit("rarity", e.target.value)} />
                </div>
                <div className="ed-row" style={{marginTop:6}}>
                  <select className="ed-sel" value={editing.cat || ""} onChange={e => updateEdit("cat", e.target.value)}>
                    {CATS.map(c => <option key={c}>{c}</option>)}
                  </select>
                  <select className="ed-sel" value={editing.continent || editing.cont || ""} onChange={e => updateEdit("cont", e.target.value)}>
                    {CONTS.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              {/* Color */}
              <div className="ed-section">
                <div className="ed-label">Color</div>
                <div className="color-row">
                  {PALETTE.map(c => (
                    <div key={c} className={`color-swatch${editing.color === c ? " on" : ""}`}
                      style={{background: c}}
                      onClick={() => updateEdit("color", c)}
                    />
                  ))}
                </div>
              </div>

              {/* Actions */}
              {selected?._status === "pending" && (
                <div className="ed-actions">
                  <button className="ed-btn pub" style={{background: editing.color}} onClick={() => approve(selected)}>
                    ✓ Publish to ÜNDER
                  </button>
                  <button className="ed-btn skip" onClick={() => reject(selected)}>
                    ✗ Skip
                  </button>
                </div>
              )}
              {selected?._status === "published" && (
                <div className="ed-published" style={{marginTop:16}}>✓ Live on ÜNDER</div>
              )}
            </div>
          )}
        </div>

        {/* RIGHT — Instagram + Log */}
        <div className="right">
          <div className="r-tabs">
            {["instagram","log"].map(t => (
              <button key={t} className={`r-tab${rightTab===t?" on":""}`} onClick={() => setRightTab(t)}>
                {t === "instagram" ? "Instagram" : "Log"}
              </button>
            ))}
          </div>
          <div className="r-body">
            {rightTab === "instagram" ? (
              editing ? (
                <>
                  <InstagramCanvas brand={editing} />
                  <div className="ig-actions">
                    <button className="ig-btn dl" onClick={downloadCard}>↓ Download PNG</button>
                    <button className="ig-btn cp" onClick={copyCaption}>{copied ? "✓ Copied!" : "⎘ Copy Caption"}</button>
                  </div>
                  <div className="ig-caption">{generateCaption(editing)}</div>
                </>
              ) : (
                <div className="no-select">
                  <div className="no-select-icon">◎</div>
                  <div className="no-select-txt">Select a brand</div>
                </div>
              )
            ) : (
              <div>
                {log.length === 0 && (
                  <div style={{fontFamily:"'DM Mono',monospace",fontSize:8,letterSpacing:2,textTransform:"uppercase",color:"var(--dim)",textAlign:"center",paddingTop:24}}>
                    Log is empty
                  </div>
                )}
                {log.map((l, i) => (
                  <div key={i} className="log-entry">
                    <div className="log-time">{l.t}</div>
                    <div className={`log-msg ${l.type}`}>{l.msg}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* IMAGE PICKER MODAL */}
      {imgPickerOpen && (
        <div className="picker-over" onClick={() => setImgPickerOpen(false)}>
          <div className="picker-box" onClick={e => e.stopPropagation()}>
            <div className="picker-hd">
              <div className="picker-title">Pick Image</div>
              <input className="picker-search" placeholder="Search keyword (decorative)…"
                value={imgSearch} onChange={e => setImgSearch(e.target.value)} autoFocus />
              <button className="picker-close" onClick={() => setImgPickerOpen(false)}>✕</button>
            </div>
            <div className="picker-grid">
              {ALL_PHOTOS.map((id, i) => (
                <img key={i} className="picker-img" src={imgUrl(id)} alt=""
                  onClick={() => { updateEdit("img", imgUrl(id)); setImgPickerOpen(false); }} />
              ))}
            </div>
            <div className="picker-url">
              <input className="picker-url-in" placeholder="Or paste any image URL…"
                onKeyDown={e => {
                  if (e.key === "Enter" && e.target.value) {
                    updateEdit("img", e.target.value);
                    setImgPickerOpen(false);
                  }
                }}
              />
              <button className="picker-url-btn" onClick={() => {
                const inp = document.querySelector(".picker-url-in");
                if (inp?.value) { updateEdit("img", inp.value); setImgPickerOpen(false); }
              }}>Use URL</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
