'use client';
import { useState, useRef, useEffect, useCallback } from "react";

const SUPA_URL = "https://geqqyxrmdxwwyyddxohc.supabase.co";
const SUPA_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdlcXF5eHJtZHh3d3l5ZGR4b2hjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI5OTU0NzcsImV4cCI6MjA4ODU3MTQ3N30.0E3K0sfEAicGq4cKBqk_N2TdIrLs10pNgrGe_KC-z6Y";

const PALETTE = ["#FF6B35","#00E5FF","#7CFF50","#FF2D9B","#A855F7","#00FFBB","#FFD700"];
const CATS    = ["Knitwear","Drape","Tailoring","Denim","Workwear","Minimal","Accs","Painting","Ceramic","Photo","Textile Art"];
const ART_CATS= ["Painting","Ceramic","Photo","Textile Art"];
const CONTS   = ["Africa","Americas","Asia","Europe","Oceania"];
const BLANK   = { name:"", sub:"", city:"", ctry:"", cont:"Europe", cat:"Minimal", r:"9.0", color:"#FF6B35", img:"", g:"", story:"" };

const POOL = {
  Knitwear:"https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=900&q=85",
  Drape:"https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=900&q=85",
  Tailoring:"https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=900&q=85",
  Denim:"https://images.unsplash.com/photo-1542272604-787c3835535d?w=900&q=85",
  Workwear:"https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=900&q=85",
  Minimal:"https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=900&q=85",
  Accs:"https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=900&q=85",
  Painting:"https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=900&q=85",
  Ceramic:"https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=900&q=85",
  Photo:"https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=900&q=85",
  "Textile Art":"https://images.unsplash.com/photo-1558171813-c36a2d4a9dcd?w=900&q=85",
};

function caption(b) {
  const art = ART_CATS.includes(b.cat);
  return `◆ ${(b.name||"").toUpperCase()} ◆\n\n${b.story||""}\n\n"${b.g||""}"\n\n📍 ${b.city||""} · Rarity ${b.r||""}/10\n\n${art?"The artists no one talks about are the ones collectors remember forever.":"The names you don't know are often the ones worth knowing most."}\n\n─────────────────────\n#underground #${(b.cat||"").toLowerCase().replace(/\s/g,"")} #${(b.city||"").toLowerCase().replace(/\s/g,"")} #niche #${art?"fineart #artcollector #contemporaryart":"independentfashion #artisan #slowfashion"} #UNDER #hiddenbrands #${(b.cont||"global").toLowerCase()}fashion #hiddentreasure`;
}

// ── Instagram Card (pure canvas, 1080×1080)
function IGCard({ b }) {
  const ref = useRef(null);

  const draw = useCallback((imgEl) => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const W = 1080, H = 1080;
    canvas.width = W; canvas.height = H;
    const col = b.color || "#FF6B35";

    // ── full bg
    ctx.fillStyle = "#050505"; ctx.fillRect(0,0,W,H);

    // ── photo zone (top 62%)
    if (imgEl) {
      // cover-fit the image
      const iw = imgEl.naturalWidth, ih = imgEl.naturalHeight;
      const scale = Math.max(W/iw, (H*0.62)/ih);
      const sw = iw*scale, sh = ih*scale;
      const sx = (W-sw)/2, sy = ((H*0.62)-sh)/2;
      ctx.drawImage(imgEl, sx, sy, sw, sh);
    } else {
      // gradient placeholder
      const gp = ctx.createLinearGradient(0,0,W,H*0.62);
      gp.addColorStop(0, col+"33"); gp.addColorStop(1,"#050505");
      ctx.fillStyle = gp; ctx.fillRect(0,0,W,H*0.62);
    }

    // ── gradient overlay on photo
    const g1 = ctx.createLinearGradient(0,0,0,H*0.62);
    g1.addColorStop(0,"rgba(5,5,5,0.15)");
    g1.addColorStop(0.6,"rgba(5,5,5,0.1)");
    g1.addColorStop(1,"rgba(5,5,5,0.97)");
    ctx.fillStyle = g1; ctx.fillRect(0,0,W,H*0.62);

    // ── bottom info panel
    ctx.fillStyle = "#080808"; ctx.fillRect(0,H*0.615,W,H*0.385);

    // ── accent line
    ctx.fillStyle = col; ctx.fillRect(0,H*0.615,W,4);

    // ── top bar: ÜNDER wordmark + rarity
    ctx.fillStyle = col;
    ctx.font = "bold 48px Arial, sans-serif";
    ctx.fillText("ÜNDER", 48, 70);

    // rarity pill
    const rarW = 170, rarH = 46, rarX = W-rarW-40, rarY = 28;
    ctx.fillStyle = col;
    ctx.beginPath(); ctx.roundRect(rarX, rarY, rarW, rarH, 4); ctx.fill();
    ctx.fillStyle = "#000";
    ctx.font = "bold 20px 'Courier New', monospace";
    ctx.fillText(`◆ ${b.r||"?"} / 10`, rarX+18, rarY+30);

    // ── brand name (big)
    const nameY = H*0.615 + 92;
    const nameSize = (b.name||"").length > 16 ? 64 : (b.name||"").length > 11 ? 80 : 100;
    ctx.fillStyle = "#FFFFFF";
    ctx.font = `bold ${nameSize}px Arial, sans-serif`;
    ctx.fillText((b.name||"").toUpperCase(), 48, nameY);

    // ── sub descriptor
    ctx.fillStyle = col;
    ctx.font = "500 22px 'Courier New', monospace";
    ctx.fillText((b.sub||"").toUpperCase(), 50, nameY+46);

    // ── location
    ctx.fillStyle = "rgba(255,255,255,0.35)";
    ctx.font = "18px 'Courier New', monospace";
    ctx.fillText(`${b.city||""}  ·  ${b.ctry||""}`, 50, nameY+82);

    // ── guide quote (word-wrapped)
    ctx.fillStyle = "rgba(255,255,255,0.6)";
    ctx.font = "italic 24px Georgia, serif";
    const qWords = `"${b.g||""}"`.split(" ");
    let line = "", qy = nameY + 128;
    for (const w of qWords) {
      const test = line + w + " ";
      if (ctx.measureText(test).width > W - 100 && line) {
        ctx.fillText(line.trim(), 50, qy); line = w + " "; qy += 36;
      } else line = test;
    }
    ctx.fillText(line.trim(), 50, qy);

    // ── bottom: category pill + footer
    const catW = (b.cat||"").length * 15 + 40;
    ctx.fillStyle = col;
    ctx.beginPath(); ctx.roundRect(48, H-68, catW, 36, 3); ctx.fill();
    ctx.fillStyle = "#000";
    ctx.font = "bold 15px 'Courier New', monospace";
    ctx.fillText((b.cat||"").toUpperCase(), 64, H-45);

    ctx.fillStyle = "rgba(255,255,255,0.12)";
    ctx.font = "13px 'Courier New', monospace";
    ctx.fillText("UNDERGROUND DISCOVERY · ÜNDER", W-440, H-48);

    // ── frame border (thin)
    ctx.strokeStyle = col+"44"; ctx.lineWidth = 3;
    ctx.strokeRect(1.5,1.5,W-3,H-3);
  }, [b.name, b.sub, b.city, b.ctry, b.g, b.r, b.cat, b.color, b.img]);

  useEffect(() => {
    const imgUrl = b.img || POOL[b.cat] || POOL.Minimal;
    const img = new Image();
    // Don't use crossOrigin for blob URLs (local files)
    if (!imgUrl.startsWith("blob:")) img.crossOrigin = "anonymous";
    img.onload = () => draw(img);
    img.onerror = () => draw(null);
    img.src = imgUrl;
  }, [b.name, b.sub, b.city, b.ctry, b.g, b.r, b.cat, b.color, b.img, draw]);

  const download = () => {
    const c = ref.current; if (!c) return;
    const a = document.createElement("a");
    a.download = `under-${(b.name||"brand").toLowerCase().replace(/\s+/g,"-")}.png`;
    a.href = c.toDataURL("image/png"); a.click();
  };

  return (
    <div style={{display:"flex",flexDirection:"column",gap:8}}>
      <canvas ref={ref} style={{width:"100%",display:"block",borderRadius:4,border:"1px solid rgba(255,255,255,0.06)"}} />
      <div style={{display:"flex",gap:8}}>
        <button onClick={download} style={{flex:1,padding:"10px 0",background:b.color||"#FF6B35",border:"none",color:"#000",fontFamily:"'DM Mono',monospace",fontSize:9,letterSpacing:3,textTransform:"uppercase",cursor:"pointer",borderRadius:3,fontWeight:700}}>↓ Download PNG</button>
        <button onClick={()=>navigator.clipboard.writeText(caption(b))} style={{flex:1,padding:"10px 0",background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.1)",color:"rgba(255,255,255,0.6)",fontFamily:"'DM Mono',monospace",fontSize:9,letterSpacing:3,textTransform:"uppercase",cursor:"pointer",borderRadius:3,fontWeight:700}}>⎘ Copy Caption</button>
      </div>
      <div style={{fontFamily:"'DM Mono',monospace",fontSize:10,color:"rgba(255,255,255,0.25)",lineHeight:1.85,padding:"10px 12px",background:"rgba(255,255,255,0.025)",borderRadius:3,border:"1px solid rgba(255,255,255,0.05)",whiteSpace:"pre-wrap",maxHeight:220,overflowY:"auto"}}>
        {caption(b)}
      </div>
    </div>
  );
}

export default function Studio() {
  const [brand, setBrand]   = useState({...BLANK});
  const [intel, setIntel]   = useState("");
  const [phase, setPhase]   = useState("idle"); // idle|generating|editing|publishing|done
  const [imgFile, setImgFile]   = useState(null);
  const [imgPreview, setImgPreview] = useState("");
  const [regenField, setRegenField] = useState(null);
  const [toast, setToast]   = useState("");
  const [tab, setTab]       = useState("card");
  const [published, setPublished] = useState(false);

  const set = (k,v) => setBrand(b=>({...b,[k]:v}));
  const toast_ = (m,dur=3000) => { setToast(m); setTimeout(()=>setToast(""),dur); };

  // ── photo
  const handleFile = (file) => {
    if (!file?.type.startsWith("image/")) return;
    setImgFile(file);
    const url = URL.createObjectURL(file);
    setImgPreview(url);
    setBrand(b=>({...b, img:url}));
  };

  // ── generate
  const generate = async () => {
    if (!intel.trim()) { toast_("Add some intel first"); return; }
    setPhase("generating");
    try {
      const res = await fetch("/api/studio-generate", {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ intel, existing: brand }),
      });
      if (!res.ok) throw new Error("API error");
      const data = await res.json();
      setBrand(b => {
        const next = {...b, ...data};
        // keep local image if we have one
        if (imgPreview) next.img = imgPreview;
        return next;
      });
      setPhase("editing");
      setTab("card");
    } catch(e) {
      toast_("Generation failed — try again");
      setPhase("idle");
    }
  };

  const regenField_ = async (field) => {
    setRegenField(field);
    try {
      const res = await fetch("/api/studio-generate", {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ intel, existing: brand, regenField: field }),
      });
      const data = await res.json();
      if (data[field]) set(field, data[field]);
    } catch(e) {}
    setRegenField(null);
  };

  // ── upload image to Supabase Storage
  const uploadImg = async (file) => {
    const ext = (file.name.split(".").pop()||"jpg").toLowerCase();
    const path = `brands/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const res = await fetch(`${SUPA_URL}/storage/v1/object/brand-images/${path}`, {
      method:"POST",
      headers:{ "apikey":SUPA_KEY, "Authorization":`Bearer ${SUPA_KEY}`, "Content-Type":file.type||"image/jpeg", "x-upsert":"true", "cache-control":"3600" },
      body: file,
    });
    if (!res.ok) throw new Error("Storage upload failed: " + res.status);
    return `${SUPA_URL}/storage/v1/object/public/brand-images/${path}`;
  };

  // ── publish to Supabase DB
  const publish = async () => {
    if (!brand.name) { toast_("Name is required"); return; }
    setPhase("publishing");

    let finalImg = POOL[brand.cat] || POOL.Minimal;

    if (imgFile) {
      try {
        finalImg = await uploadImg(imgFile);
        toast_("✓ Photo uploaded");
      } catch(e) {
        // Storage bucket not set up — use Unsplash pool image
        finalImg = POOL[brand.cat] || POOL.Minimal;
        toast_("No storage bucket — using placeholder image");
      }
    } else if (brand.img && !brand.img.startsWith("blob:")) {
      finalImg = brand.img;
    }

    const payload = {
      name: brand.name, sub: brand.sub, city: brand.city,
      ctry: brand.ctry, cont: brand.cont, cat: brand.cat,
      r: parseFloat(brand.r)||9.0, color: brand.color,
      img: finalImg, g: brand.g, story: brand.story,
    };

    const res = await fetch(`${SUPA_URL}/rest/v1/brands`, {
      method:"POST",
      headers:{ "Content-Type":"application/json", "apikey":SUPA_KEY, "Authorization":`Bearer ${SUPA_KEY}`, "Prefer":"return=representation" },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      setBrand(b=>({...b, img:finalImg}));
      setPhase("done"); setPublished(true);
      toast_("✓ Live on ÜNDER!", 4000);
    } else {
      const err = await res.text();
      console.error("Publish failed:", err);
      toast_("Publish failed — check console");
      setPhase("editing");
    }
  };

  const reset = () => {
    setBrand({...BLANK}); setIntel(""); setPhase("idle");
    setImgFile(null); setImgPreview(""); setPublished(false); setTab("card");
  };

  const isArt = ART_CATS.includes(brand.cat);
  const hasContent = phase==="editing"||phase==="done"||phase==="publishing";

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Mono:wght@300;400;500&family=Syne:wght@400;500;600;700&family=Playfair+Display:ital,wght@1,400;1,500&display=swap');
        *,*::before,*::after{margin:0;padding:0;box-sizing:border-box;}
        html,body{height:100%;background:#050505;color:#fff;font-family:'Syne',sans-serif;}
        :root{--bg:#050505;--bg2:#080808;--bg3:#0F0F0F;--bg4:#161616;--dim:#3A3A3A;--dim2:#555;--dim3:#777;--rule:rgba(255,255,255,0.05);--rule2:rgba(255,255,255,0.09);}
        @keyframes colorShift{0%{color:#FF6B35;}14%{color:#00E5FF;}28%{color:#7CFF50;}42%{color:#FF2D9B;}56%{color:#A855F7;}70%{color:#00FFBB;}84%{color:#FFD700;}100%{color:#FF6B35;}}
        @keyframes spin{to{transform:rotate(360deg);}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(10px);}to{opacity:1;transform:none;}}
        @keyframes pulse{0%,100%{opacity:.3;}50%{opacity:1;}}
        @keyframes toast{0%{opacity:0;transform:translateX(-50%) translateY(8px);}100%{opacity:1;transform:translateX(-50%) translateY(0);}}

        .layout{display:grid;grid-template-columns:1fr 400px;grid-template-rows:50px 1fr;height:100vh;overflow:hidden;}
        
        .topbar{grid-column:1/-1;display:flex;align-items:center;border-bottom:1px solid var(--rule);background:var(--bg2);}
        .tb-logo{font-family:'Bebas Neue',sans-serif;font-size:20px;letter-spacing:6px;animation:colorShift 7s linear infinite;padding:0 20px;border-right:1px solid var(--rule);height:100%;display:flex;align-items:center;}
        .tb-label{font-family:'DM Mono',monospace;font-size:8px;letter-spacing:4px;text-transform:uppercase;color:var(--dim3);padding:0 18px;border-right:1px solid var(--rule);height:100%;display:flex;align-items:center;}
        .tb-status{padding:0 16px;font-family:'DM Mono',monospace;font-size:8px;letter-spacing:3px;text-transform:uppercase;color:var(--dim3);display:flex;align-items:center;gap:8px;}
        .tb-dot{width:5px;height:5px;border-radius:50%;}
        .tb-spacer{flex:1;}
        .tb-new{height:100%;padding:0 20px;border:none;border-left:1px solid var(--rule);background:none;color:var(--dim3);font-family:'DM Mono',monospace;font-size:8px;letter-spacing:3px;text-transform:uppercase;cursor:pointer;transition:all .2s;}
        .tb-new:hover{color:#fff;background:var(--bg3);}
        
        .left{overflow-y:auto;scrollbar-width:none;padding:24px 28px 80px;}
        .left::-webkit-scrollbar{display:none;}
        
        .step-row{display:flex;align-items:center;gap:10px;margin:22px 0 10px;}
        .step-row:first-child{margin-top:0;}
        .step-n{font-family:'Bebas Neue',sans-serif;font-size:12px;letter-spacing:2px;animation:colorShift 7s linear infinite;flex-shrink:0;}
        .step-line{flex:1;height:1px;background:var(--rule2);}
        .step-lbl{font-family:'DM Mono',monospace;font-size:7px;letter-spacing:4px;text-transform:uppercase;color:var(--dim3);}
        
        .photo-empty{border:1px dashed rgba(255,255,255,0.09);border-radius:6px;padding:28px 20px;text-align:center;display:flex;flex-direction:column;align-items:center;gap:10px;}
        .photo-empty:hover{border-color:rgba(255,255,255,0.18);}
        .photo-icon{font-size:26px;opacity:.3;}
        .photo-title{font-family:'Bebas Neue',sans-serif;font-size:20px;letter-spacing:5px;animation:colorShift 7s linear infinite;}
        .photo-sub{font-family:'DM Mono',monospace;font-size:7px;letter-spacing:2px;text-transform:uppercase;color:var(--dim2);line-height:1.7;}
        .photo-btn{display:inline-block;padding:9px 22px;background:var(--bg4);border:1px solid rgba(255,255,255,.1);color:rgba(255,255,255,.55);font-family:'DM Mono',monospace;font-size:8px;letter-spacing:3px;text-transform:uppercase;border-radius:3px;cursor:pointer;margin-top:4px;transition:all .2s;}
        .photo-btn:hover{border-color:rgba(255,255,255,.3);color:#fff;}
        .photo-preview{border-radius:6px;overflow:hidden;position:relative;}
        .photo-img{width:100%;height:240px;object-fit:cover;display:block;}
        .photo-change{position:absolute;bottom:10px;right:10px;display:inline-block;padding:5px 12px;background:rgba(5,5,5,.75);border:1px solid rgba(255,255,255,.2);color:rgba(255,255,255,.65);font-family:'DM Mono',monospace;font-size:7px;letter-spacing:2px;text-transform:uppercase;border-radius:3px;cursor:pointer;backdrop-filter:blur(6px);}
        .photo-change:hover{color:#fff;border-color:rgba(255,255,255,.45);}
        
        .intel-ta{width:100%;background:var(--bg3);border:1px solid var(--rule2);padding:12px 14px;color:rgba(255,255,255,.75);font-family:'Syne',sans-serif;font-size:13px;border-radius:4px;outline:none;resize:none;line-height:1.75;}
        .intel-ta:focus{border-color:rgba(255,255,255,.14);}
        .intel-ta::placeholder{color:var(--dim2);}
        .intel-hint{font-family:'DM Mono',monospace;font-size:7px;letter-spacing:2px;text-transform:uppercase;color:var(--dim);margin-top:6px;line-height:1.8;}
        .intel-chips{display:flex;flex-wrap:wrap;gap:5px;margin-top:8px;}
        .intel-chip{font-family:'DM Mono',monospace;font-size:7px;letter-spacing:1px;padding:3px 10px;background:var(--bg4);border:1px solid var(--rule2);color:var(--dim3);border-radius:20px;cursor:pointer;transition:all .15s;}
        .intel-chip:hover{border-color:rgba(255,255,255,.2);color:rgba(255,255,255,.6);}
        
        .gen-btn{width:100%;padding:15px;font-family:'Bebas Neue',sans-serif;font-size:19px;letter-spacing:5px;border:none;cursor:pointer;border-radius:4px;color:#000;transition:all .2s;display:flex;align-items:center;justify-content:center;gap:10px;font-weight:700;}
        .gen-btn:hover:not(:disabled){filter:brightness(1.1);transform:scale(1.01);}
        .gen-btn:disabled{opacity:.4;cursor:not-allowed;transform:none;}
        
        .fields{display:flex;flex-direction:column;gap:1px;animation:fadeUp .3s ease both;}
        .frow{display:flex;align-items:flex-start;border-radius:4px;transition:background .15s;}
        .frow:hover{background:var(--bg3);}
        .flbl{font-family:'DM Mono',monospace;font-size:7px;letter-spacing:2px;text-transform:uppercase;color:var(--dim2);width:52px;flex-shrink:0;padding:13px 10px 0 10px;line-height:1;}
        .finput{flex:1;background:transparent;border:none;color:#fff;font-family:'Syne',sans-serif;font-size:13px;outline:none;padding:9px 6px;min-width:0;}
        .finput.big{font-family:'Bebas Neue',sans-serif;font-size:30px;letter-spacing:3px;padding:4px 6px;}
        .finput.sub{font-family:'DM Mono',monospace;font-size:9px;letter-spacing:2px;text-transform:uppercase;}
        .fta{flex:1;background:rgba(255,255,255,.025);border:1px solid var(--rule);color:rgba(255,255,255,.6);padding:8px 10px;font-family:'Playfair Display',serif;font-size:12px;font-style:italic;border-radius:3px;outline:none;resize:vertical;line-height:1.7;min-height:60px;margin:6px 0;}
        .fta.sm{min-height:42px;}
        .fsel{background:var(--bg4);border:1px solid var(--rule2);color:#fff;padding:6px 8px;font-family:'DM Mono',monospace;font-size:8px;letter-spacing:1px;border-radius:3px;outline:none;cursor:pointer;flex:1;}
        .fregen{font-family:'DM Mono',monospace;font-size:10px;padding:8px 9px;background:none;border:none;color:var(--dim);cursor:pointer;border-radius:3px;transition:all .15s;flex-shrink:0;}
        .fregen:hover{color:rgba(255,255,255,.5);background:var(--bg4);}
        .fregen.spin{animation:spin .6s linear infinite;}
        .swatch{width:22px;height:22px;border-radius:50%;cursor:pointer;border:2px solid transparent;transition:all .15s;flex-shrink:0;}
        .swatch:hover,.swatch.on{border-color:#fff;transform:scale(1.2);}
        .hexin{background:var(--bg4);border:1px solid;padding:4px 8px;font-family:'DM Mono',monospace;font-size:9px;letter-spacing:2px;border-radius:3px;outline:none;width:82px;}
        
        .actions{display:flex;gap:8px;margin-top:8px;}
        .act{flex:1;padding:13px;border:none;border-radius:4px;font-family:'DM Mono',monospace;font-size:8px;letter-spacing:3px;text-transform:uppercase;cursor:pointer;font-weight:700;transition:all .2s;}
        .act:hover:not(:disabled){filter:brightness(1.1);transform:scale(1.01);}
        .act:disabled{opacity:.4;cursor:not-allowed;}
        .act-sec{background:var(--bg3);border:1px solid var(--rule2);color:var(--dim3);}
        .act-sec:hover{border-color:rgba(255,255,255,.2)!important;color:#fff!important;}
        .done-box{padding:16px;border-radius:6px;text-align:center;animation:fadeUp .3s ease;}
        .done-logo{font-family:'Bebas Neue',sans-serif;font-size:40px;letter-spacing:10px;animation:colorShift 7s linear infinite;}
        
        .right{border-left:1px solid var(--rule);display:flex;flex-direction:column;background:var(--bg2);overflow:hidden;}
        .rtabs{display:flex;border-bottom:1px solid var(--rule);flex-shrink:0;}
        .rtab{flex:1;padding:11px 6px;font-family:'DM Mono',monospace;font-size:7px;letter-spacing:2px;text-transform:uppercase;background:none;border:none;color:var(--dim2);cursor:pointer;border-bottom:2px solid transparent;transition:all .2s;}
        .rtab.on{color:#fff;border-bottom-color:#fff;}
        .rbody{flex:1;overflow-y:auto;scrollbar-width:none;padding:12px;}
        .rbody::-webkit-scrollbar{display:none;}
        .empty-state{display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;gap:10px;opacity:.15;}
        .empty-icon{font-size:32px;}
        .empty-lbl{font-family:'DM Mono',monospace;font-size:8px;letter-spacing:3px;text-transform:uppercase;}
        
        .toast{position:fixed;bottom:24px;left:50%;transform:translateX(-50%);background:var(--bg3);border:1px solid var(--rule2);padding:8px 20px;border-radius:24px;font-family:'DM Mono',monospace;font-size:9px;letter-spacing:2px;text-transform:uppercase;color:#fff;z-index:999;animation:toast .2s ease;white-space:nowrap;backdrop-filter:blur(12px);}
      `}</style>

      <div className="layout">
        {/* TOPBAR */}
        <div className="topbar">
          <div className="tb-logo">ÜNDER</div>
          <div className="tb-label">◈ Studio</div>
          <div className="tb-status">
            <div className="tb-dot" style={{background:{idle:"#3A3A3A",generating:"#FFD700",editing:"#00E5FF",publishing:"#FF6B35",done:"#7CFF50"}[phase]||"#3A3A3A", animation:phase==="generating"||phase==="publishing"?"pulse 1s ease infinite":""}} />
            <span>{{idle:"Ready",generating:"AI writing…",editing:"Editing",publishing:"Publishing…",done:"Live ✓"}[phase]}</span>
          </div>
          <div className="tb-spacer"/>
          <button className="tb-new" onClick={reset}>+ New Entry</button>
        </div>

        {/* LEFT */}
        <div className="left">

          {/* 01 PHOTO */}
          <div className="step-row"><span className="step-n">01</span><div className="step-line"/><span className="step-lbl">Photo</span></div>
          {imgPreview ? (
            <div className="photo-preview">
              <img src={imgPreview} alt="" className="photo-img" />
              <label htmlFor="photo-file" className="photo-change">Change Photo
                <input id="photo-file" type="file" accept="image/*" style={{display:"none"}} onChange={e=>{if(e.target.files[0])handleFile(e.target.files[0]);}} />
              </label>
            </div>
          ) : (
            <label htmlFor="photo-file" style={{display:"block",cursor:"pointer"}}>
              <div className="photo-empty">
                <div className="photo-icon">📷</div>
                <div className="photo-title">Add a Photo</div>
                <div className="photo-sub">From laptop or phone · JPG / PNG / WEBP</div>
                <span className="photo-btn">Browse Files</span>
              </div>
              <input id="photo-file" type="file" accept="image/*" style={{display:"none"}} onChange={e=>{if(e.target.files[0])handleFile(e.target.files[0]);}} />
            </label>
          )}

          {/* 02 INTEL */}
          <div className="step-row"><span className="step-n">02</span><div className="step-line"/><span className="step-lbl">Your Intel</span></div>
          <textarea className="intel-ta" rows={4} value={intel} onChange={e=>setIntel(e.target.value)}
            placeholder="Drop everything you know. Name, city, founder, what they make, materials, vibe, how you found them. Raw notes are fine." />
          <div className="intel-hint">The more specific → the better Claude's output</div>
          <div className="intel-chips">
            {["Caroline Hodgson, cyanotype, North Wales","Ahmed, Karachi, hand-dyed linen, ex-architect","Natural indigo, Lagos, 800 followers, tiny batches","Ceramic artist, Oaxaca, celebrities collect"].map(ex=>(
              <button key={ex} className="intel-chip" onClick={()=>setIntel(ex)}>{ex}</button>
            ))}
          </div>

          {/* 03 GENERATE */}
          <div className="step-row"><span className="step-n">03</span><div className="step-line"/><span className="step-lbl">AI Generation</span></div>
          <button className="gen-btn" style={{background:brand.color||"#FF6B35"}}
            onClick={generate} disabled={phase==="generating"||phase==="publishing"||!intel.trim()}>
            {phase==="generating"
              ? <><span style={{display:"inline-block",animation:"spin 1s linear infinite"}}>◌</span>Writing in ÜNDER's voice…</>
              : hasContent ? "↺ Regenerate Everything" : "◈ Generate with AI"}
          </button>

          {/* 04 EDIT */}
          {hasContent && (<>
            <div className="step-row"><span className="step-n">04</span><div className="step-line"/><span className="step-lbl">Edit & Refine</span></div>
            <div className="fields">
              {/* Name */}
              <div className="frow">
                <div className="flbl">Name</div>
                <input className="finput big" style={{color:brand.color}} value={brand.name} onChange={e=>set("name",e.target.value)} />
                <button className={`fregen${regenField==="name"?" spin":""}`} onClick={()=>regenField_("name")}>↺</button>
              </div>
              {/* Sub */}
              <div className="frow">
                <div className="flbl">Sub</div>
                <input className="finput sub" style={{color:(brand.color||"#fff")+"bb"}} value={brand.sub} onChange={e=>set("sub",e.target.value)} />
                <button className={`fregen${regenField==="sub"?" spin":""}`} onClick={()=>regenField_("sub")}>↺</button>
              </div>
              {/* Story */}
              <div className="frow" style={{flexDirection:"column",gap:0}}>
                <div style={{display:"flex",alignItems:"center"}}>
                  <div className="flbl">Story</div>
                  <button className={`fregen${regenField==="story"?" spin":""}`} onClick={()=>regenField_("story")}>↺</button>
                </div>
                <textarea className="fta" value={brand.story} rows={3} onChange={e=>set("story",e.target.value)} />
              </div>
              {/* Quote */}
              <div className="frow" style={{flexDirection:"column"}}>
                <div style={{display:"flex",alignItems:"center"}}>
                  <div className="flbl">Quote</div>
                  <button className={`fregen${regenField==="g"?" spin":""}`} onClick={()=>regenField_("g")}>↺</button>
                </div>
                <textarea className="fta sm" value={brand.g} rows={2} onChange={e=>set("g",e.target.value)} />
              </div>
              {/* Location */}
              <div className="frow" style={{alignItems:"center",gap:6,padding:"4px 6px"}}>
                <div className="flbl">Location</div>
                <input className="finput" style={{flex:2}} placeholder="City" value={brand.city} onChange={e=>set("city",e.target.value)} />
                <input className="finput" style={{flex:1,maxWidth:60}} placeholder="CC" value={brand.ctry} onChange={e=>set("ctry",e.target.value)} />
              </div>
              {/* Cat + Cont */}
              <div className="frow" style={{alignItems:"center",gap:6,padding:"4px 6px"}}>
                <div className="flbl">Type</div>
                <select className="fsel" value={brand.cat} onChange={e=>set("cat",e.target.value)}>
                  <optgroup label="Fashion">{CATS.filter(c=>!ART_CATS.includes(c)).map(c=><option key={c}>{c}</option>)}</optgroup>
                  <optgroup label="Art">{ART_CATS.map(c=><option key={c}>{c}</option>)}</optgroup>
                </select>
                <select className="fsel" value={brand.cont} onChange={e=>set("cont",e.target.value)}>
                  {CONTS.map(c=><option key={c}>{c}</option>)}
                </select>
              </div>
              {/* Rarity */}
              <div className="frow" style={{alignItems:"center",padding:"4px 6px"}}>
                <div className="flbl">Rarity</div>
                <input className="finput" type="number" min="1" max="10" step="0.1" style={{width:60}} value={brand.r} onChange={e=>set("r",e.target.value)} />
                <span style={{fontFamily:"'DM Mono',monospace",fontSize:9,color:"var(--dim2)",marginLeft:6}}>/10</span>
                <button className={`fregen${regenField==="r"?" spin":""}`} onClick={()=>regenField_("r")}>↺</button>
              </div>
              {/* Color */}
              <div className="frow" style={{alignItems:"center",flexWrap:"wrap",gap:6,padding:"8px 6px"}}>
                <div className="flbl">Color</div>
                {PALETTE.map(c=>(
                  <div key={c} className={`swatch${brand.color===c?" on":""}`} style={{background:c}} onClick={()=>set("color",c)} />
                ))}
                <input className="hexin" value={brand.color} style={{borderColor:brand.color,color:brand.color}} onChange={e=>set("color",e.target.value)} />
              </div>
            </div>

            {/* 05 PUBLISH */}
            <div className="step-row" style={{marginTop:16}}><span className="step-n">05</span><div className="step-line"/><span className="step-lbl">Publish</span></div>
            {published ? (
              <div className="done-box" style={{background:(brand.color||"#7CFF50")+"14",border:`1px solid ${brand.color||"#7CFF50"}30`}}>
                <div className="done-logo">ÜNDER</div>
                <div style={{fontFamily:"'DM Mono',monospace",fontSize:8,letterSpacing:3,textTransform:"uppercase",color:"#7CFF50",marginTop:6}}>Now Live</div>
                <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:20,letterSpacing:4,marginTop:4}}>{brand.name}</div>
                <div className="actions" style={{marginTop:12}}>
                  <button className="act" style={{background:brand.color,color:"#000"}} onClick={reset}>+ Add Another</button>
                  <button className="act act-sec" onClick={()=>window.open("/","_blank")}>View Site →</button>
                </div>
              </div>
            ) : (
              <div className="actions">
                <button className="act" style={{background:brand.color,color:"#000",flex:2}} onClick={publish} disabled={phase==="publishing"}>
                  {phase==="publishing"?"Publishing…":"✓ Add to ÜNDER"}
                </button>
                <button className="act act-sec" onClick={reset}>Reset</button>
              </div>
            )}
          </>)}
        </div>

        {/* RIGHT */}
        <div className="right">
          <div className="rtabs">
            {[["card","◈ IG Card"],["caption","✦ Caption"],["profile","◎ Profile"]].map(([t,l])=>(
              <button key={t} className={`rtab${tab===t?" on":""}`} onClick={()=>setTab(t)}>{l}</button>
            ))}
          </div>
          <div className="rbody">
            {tab==="card" && (
              hasContent || imgPreview ? (
                <IGCard b={brand} />
              ) : (
                <div className="empty-state"><div className="empty-icon">◈</div><div className="empty-lbl">Generate first</div></div>
              )
            )}
            {tab==="caption" && (
              hasContent ? (
                <div>
                  <button onClick={()=>navigator.clipboard.writeText(caption(brand))} style={{width:"100%",padding:"10px",background:"rgba(255,255,255,0.05)",border:"1px solid var(--rule2)",color:"rgba(255,255,255,0.5)",fontFamily:"'DM Mono',monospace",fontSize:8,letterSpacing:3,textTransform:"uppercase",cursor:"pointer",borderRadius:3,marginBottom:10}}>⎘ Copy Full Caption</button>
                  <div style={{fontFamily:"'DM Mono',monospace",fontSize:10,color:"rgba(255,255,255,0.3)",lineHeight:1.9,whiteSpace:"pre-wrap"}}>{caption(brand)}</div>
                </div>
              ) : <div className="empty-state"><div className="empty-icon">✦</div><div className="empty-lbl">Generate first</div></div>
            )}
            {tab==="profile" && (
              hasContent ? (
                <div style={{display:"flex",flexDirection:"column",gap:12}}>
                  {(imgPreview||brand.img)&&<img src={imgPreview||brand.img} alt="" style={{width:"100%",borderRadius:4,border:"1px solid var(--rule)"}} />}
                  <div style={{padding:14,background:"var(--bg3)",border:"1px solid var(--rule2)",borderRadius:4}}>
                    <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:28,letterSpacing:4,color:brand.color}}>{brand.name}</div>
                    <div style={{fontFamily:"'DM Mono',monospace",fontSize:8,letterSpacing:2,textTransform:"uppercase",color:brand.color+"aa",marginTop:3}}>{brand.sub}</div>
                    <div style={{fontFamily:"'Syne',sans-serif",fontSize:10,color:"var(--dim3)",marginTop:2}}>{[brand.city,brand.ctry,brand.cont].filter(Boolean).join(" · ")}</div>
                    <div style={{display:"flex",gap:6,marginTop:8,flexWrap:"wrap"}}>
                      {brand.cat&&<span style={{fontFamily:"'DM Mono',monospace",fontSize:7,letterSpacing:1,textTransform:"uppercase",padding:"3px 10px",background:brand.color,color:"#000",borderRadius:20,fontWeight:700}}>{brand.cat}</span>}
                      {brand.r&&<span style={{fontFamily:"'DM Mono',monospace",fontSize:7,letterSpacing:1,textTransform:"uppercase",padding:"3px 10px",background:brand.color,color:"#000",borderRadius:20,fontWeight:700}}>◆ {brand.r}/10</span>}
                    </div>
                    {brand.story&&<div style={{fontFamily:"'Playfair Display',serif",fontSize:12,fontStyle:"italic",color:"rgba(255,255,255,.5)",lineHeight:1.75,marginTop:12,paddingTop:12,borderTop:"1px solid var(--rule)"}}>{brand.story}</div>}
                    {brand.g&&<div style={{fontFamily:"'Playfair Display',serif",fontSize:12,fontStyle:"italic",color:"rgba(255,255,255,.4)",lineHeight:1.65,marginTop:8,paddingLeft:12,borderLeft:`2px solid ${brand.color}`}}>"{brand.g}"</div>}
                  </div>
                </div>
              ) : <div className="empty-state"><div className="empty-icon">◎</div><div className="empty-lbl">Generate first</div></div>
            )}
          </div>
        </div>
      </div>
      {toast&&<div className="toast">{toast}</div>}
    </>
  );
}
