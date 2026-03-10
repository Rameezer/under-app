'use client';
import { useState, useRef, useEffect, useCallback } from "react";

const SUPABASE_URL = "https://geqqyxrmdxwwyyddxohc.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdlcXF5eHJtZHh3d3l5ZGR4b2hjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI5OTU0NzcsImV4cCI6MjA4ODU3MTQ3N30.0E3K0sfEAicGq4cKBqk_N2TdIrLs10pNgrGe_KC-z6Y";

const PALETTE = ["#FF6B35","#00E5FF","#7CFF50","#FF2D9B","#A855F7","#00FFBB","#FFD700"];
const CATS    = ["Knitwear","Drape","Tailoring","Denim","Workwear","Minimal","Accs","Painting","Ceramic","Photo","Textile Art"];
const ART_CATS= ["Painting","Ceramic","Photo","Textile Art"];
const CONTS   = ["Africa","Americas","Asia","Europe","Oceania"];

const EMPTY = { name:"", sub:"", city:"", ctry:"", cont:"Africa", cat:"Knitwear", r:"9.2", color:"#FF6B35", img:"", g:"", story:"" };

// ── Supabase Storage upload
async function uploadImage(file) {
  const ext  = file.name.split(".").pop();
  const path = `brands/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
  const res  = await fetch(`${SUPABASE_URL}/storage/v1/object/brand-images/${path}`, {
    method: "POST",
    headers: {
      "apikey": SUPABASE_KEY,
      "Authorization": `Bearer ${SUPABASE_KEY}`,
      "Content-Type": file.type,
      "x-upsert": "true",
    },
    body: file,
  });
  if (!res.ok) throw new Error("Upload failed");
  return `${SUPABASE_URL}/storage/v1/object/public/brand-images/${path}`;
}

// ── Supabase DB insert
async function publishBrand(brand) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/brands`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "apikey": SUPABASE_KEY,
      "Authorization": `Bearer ${SUPABASE_KEY}`,
      "Prefer": "return=representation",
    },
    body: JSON.stringify({
      name: brand.name, sub: brand.sub, city: brand.city,
      ctry: brand.ctry, cont: brand.cont, cat: brand.cat,
      r: parseFloat(brand.r) || 9.0,
      color: brand.color, img: brand.img,
      g: brand.g, story: brand.story,
    }),
  });
  return res.ok;
}

// ── Instagram caption
function makeCaption(b) {
  const isArt = ART_CATS.includes(b.cat);
  return `◆ ${(b.name||"").toUpperCase()} ◆\n\n${b.story||""}\n\n"${b.g||""}"\n\n📍 ${b.city||""} · Rarity ${b.r||""}/10\n\n${isArt
    ? "The artists no one talks about are the ones collectors remember forever."
    : "The names you don't know are often the ones worth knowing most."
  }\n\n─────────────────────\n#underground #${(b.cat||"").toLowerCase().replace(/\s/g,"")} #${(b.city||"").toLowerCase().replace(/\s/g,"")} #niche #${isArt?"fineart #artcollector #contemporaryart":"luxury #independentfashion #artisan #slowfashion"} #UNDER #hiddenbrands #fashionfinds #${(b.cont||"global").toLowerCase()}${isArt?"art":"fashion"} #hiddentreasure #cultureknowledge`;
}

// ── Canvas renderer
function IGCanvas({ brand, canvasRef }) {
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !brand) return;
    const ctx = canvas.getContext("2d");
    const W = 1080, H = 1080;
    canvas.width = W; canvas.height = H;
    const color = brand.color || "#FF6B35";

    const render = (imgEl) => {
      // BG
      ctx.fillStyle = "#050505"; ctx.fillRect(0,0,W,H);
      if (imgEl) {
        ctx.drawImage(imgEl, 0, 0, W, H*0.62);
        const g = ctx.createLinearGradient(0, H*0.2, 0, H*0.62);
        g.addColorStop(0,"rgba(5,5,5,0)"); g.addColorStop(1,"rgba(5,5,5,0.98)");
        ctx.fillStyle=g; ctx.fillRect(0,0,W,H*0.62);
      } else {
        ctx.fillStyle=color+"18"; ctx.fillRect(0,0,W,H*0.62);
      }
      // Bottom panel
      ctx.fillStyle="#0A0A0A"; ctx.fillRect(0,H*0.60,W,H*0.40);
      // Color bars
      ctx.fillStyle=color; ctx.fillRect(0,0,W,8);
      ctx.fillStyle=color; ctx.fillRect(0,H-8,W,8);
      ctx.fillStyle=color+"88"; ctx.fillRect(0,H*0.60,W,3);
      // ÜNDER logo
      ctx.fillStyle=color; ctx.font="bold 52px 'Arial Black',sans-serif";
      ctx.fillText("ÜNDER",52,78);
      // Rarity badge
      ctx.fillStyle=color; ctx.fillRect(W-220,26,185,54);
      ctx.fillStyle="#000"; ctx.font="bold 22px 'Courier New',monospace";
      ctx.fillText(`◆ ${brand.r||"?"} / 10`,W-206,63);
      // Brand name
      const sz=(brand.name||"").length>14?70:(brand.name||"").length>10?86:104;
      ctx.fillStyle="#fff"; ctx.font=`bold ${sz}px 'Arial Black',sans-serif`;
      ctx.fillText(brand.name||"",52,H*0.62+106);
      // Sub
      ctx.fillStyle=color; ctx.font="500 24px 'Courier New',monospace";
      ctx.fillText((brand.sub||"").toUpperCase(),52,H*0.62+154);
      // Location
      ctx.fillStyle="rgba(255,255,255,0.3)"; ctx.font="20px 'Courier New',monospace";
      ctx.fillText(`${brand.city||""}  ·  ${brand.ctry||""}`,52,H*0.62+194);
      // Guide quote (word wrap)
      ctx.fillStyle="rgba(255,255,255,0.55)"; ctx.font="italic 27px Georgia,serif";
      const words=(`"${brand.g||""}"`).split(" "); let line="",y=H*0.62+252;
      for(const w of words){
        const t=line+w+" ";
        if(ctx.measureText(t).width>W-108&&line){ctx.fillText(line.trim(),52,y);line=w+" ";y+=40;}
        else line=t;
      }
      ctx.fillText(line.trim(),52,y);
      // Cat pill
      const cw=(brand.cat||"").length*16+44;
      ctx.fillStyle=color; ctx.fillRect(52,H-78,cw,44);
      ctx.fillStyle="#000"; ctx.font="bold 18px 'Courier New',monospace";
      ctx.fillText((brand.cat||"").toUpperCase(),70,H-50);
      // Footer label
      ctx.fillStyle="rgba(255,255,255,0.14)"; ctx.font="15px 'Courier New',monospace";
      ctx.fillText("UNDERGROUND DISCOVERY · ÜNDER",W-498,H-50);
    };

    if (brand.img) {
      const img=new Image(); img.crossOrigin="anonymous";
      img.onload=()=>render(img); img.onerror=()=>render(null);
      img.src=brand.img;
    } else render(null);
  }, [brand?.name,brand?.sub,brand?.city,brand?.ctry,brand?.g,brand?.r,brand?.cat,brand?.color,brand?.img]);

  return <canvas ref={canvasRef} style={{width:"100%",display:"block",borderRadius:6}} />;
}

export default function Studio() {
  // ── State
  const [brand, setBrand]           = useState({...EMPTY});
  const [intel, setIntel]           = useState("");
  const [phase, setPhase]           = useState("idle"); // idle | generating | editing | uploading | publishing | done
  const [streamText, setStreamText] = useState("");
  const [dragOver, setDragOver]     = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [copied, setCopied]         = useState(false);
  const [published, setPublished]   = useState(false);
  const [imgFile, setImgFile]       = useState(null);
  const [imgPreview, setImgPreview] = useState("");
  const [activeField, setActiveField] = useState(null);
  const [regenField, setRegenField] = useState(null);
  const [toast, setToast]           = useState("");

  const canvasRef   = useRef(null);
  const intelRef    = useRef(null);

  const set = (k,v) => setBrand(b=>({...b,[k]:v}));

  const showToast = (msg) => { setToast(msg); setTimeout(()=>setToast(""),2500); };

  // ── Image handling
  const handleImageFile = (file) => {
    if (!file || !file.type.startsWith("image/")) return;
    setImgFile(file);
    const url = URL.createObjectURL(file);
    setImgPreview(url);
    setBrand(b=>({...b, img:url}));
  };

  const onDrop = (e) => {
    e.preventDefault(); setDragOver(false);
    handleImageFile(e.dataTransfer.files[0]);
  };

  // ── AI Generation
  const generate = async () => {
    if (!intel.trim()) { showToast("Add some intel first"); return; }
    setPhase("generating"); setStreamText("");

    try {
      const res = await fetch("/api/studio-generate", {
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ intel, existing: brand }),
      });

      if (!res.ok) throw new Error("API error");
      const data = await res.json();

      // Animate the generated content appearing field by field
      const fields = ["name","sub","city","ctry","cont","cat","r","color","g","story"];
      for (const f of fields) {
        if (data[f]) {
          await new Promise(r=>setTimeout(r,80));
          setBrand(b=>({...b,[f]:data[f]}));
          setStreamText(f);
        }
      }
      setStreamText("");
      setPhase("editing");
    } catch(e) {
      showToast("Generation failed — try again");
      setPhase("idle");
    }
  };

  // ── Regen single field
  const regenSingle = async (field) => {
    setRegenField(field);
    try {
      const res = await fetch("/api/studio-generate", {
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ intel, existing: brand, regenField: field }),
      });
      const data = await res.json();
      if (data[field]) setBrand(b=>({...b,[field]:data[field]}));
    } catch(e) { showToast("Regen failed"); }
    setRegenField(null);
  };

  // ── Publish
  const publish = async () => {
    if (!brand.name) { showToast("Name is required"); return; }
    setPhase("uploading");

    let finalImg = brand.img;

    // Upload local file to Supabase Storage if we have one
    if (imgFile) {
      try {
        setUploadProgress(30);
        finalImg = await uploadImage(imgFile);
        setUploadProgress(70);
        setBrand(b=>({...b, img:finalImg}));
      } catch(e) {
        // Fall back to preview URL or Unsplash
        showToast("Image upload failed — using URL instead");
      }
    }

    setPhase("publishing");
    const ok = await publishBrand({...brand, img:finalImg});
    if (ok) {
      setPhase("done");
      setPublished(true);
      showToast("✓ Live on ÜNDER");
    } else {
      showToast("Publish failed — check console");
      setPhase("editing");
    }
    setUploadProgress(0);
  };

  // ── Reset
  const reset = () => {
    setBrand({...EMPTY}); setIntel(""); setPhase("idle");
    setImgFile(null); setImgPreview(""); setPublished(false);
    setStreamText(""); setUploadProgress(0);
  };

  const downloadCard = () => {
    const c = canvasRef.current; if(!c) return;
    const a = document.createElement("a");
    a.download = `under-${(brand.name||"brand").toLowerCase().replace(/\s/g,"-")}.png`;
    a.href = c.toDataURL("image/png"); a.click();
  };

  const isArt = ART_CATS.includes(brand.cat);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Mono:ital,wght@0,300;0,400;0,500;1,400&family=Syne:wght@400;500;600;700&family=Playfair+Display:ital,wght@1,400;1,500&display=swap');
        *,*::before,*::after{margin:0;padding:0;box-sizing:border-box;}
        html,body{height:100%;background:#050505;color:#fff;font-family:'Syne',sans-serif;overflow:hidden;}
        :root{
          --bg:#050505;--bg2:#080808;--bg3:#0F0F0F;--bg4:#161616;--bg5:#1E1E1E;
          --dim:#3A3A3A;--dim2:#555;--dim3:#777;
          --rule:rgba(255,255,255,0.04);--rule2:rgba(255,255,255,0.08);
          --c1:#FF6B35;--c2:#00E5FF;--c3:#7CFF50;--c4:#FF2D9B;--c5:#A855F7;--c6:#00FFBB;--c7:#FFD700;
        }
        @keyframes colorShift{0%{color:var(--c1);}14%{color:var(--c2);}28%{color:var(--c3);}42%{color:var(--c4);}56%{color:var(--c5);}70%{color:var(--c6);}84%{color:var(--c7);}100%{color:var(--c1);}}
        @keyframes bgShift{0%{background:var(--c1);}14%{background:var(--c2);}28%{background:var(--c3);}42%{background:var(--c4);}56%{background:var(--c5);}70%{background:var(--c6);}84%{background:var(--c7);}100%{background:var(--c1);}}
        @keyframes spin{to{transform:rotate(360deg);}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(12px);}to{opacity:1;transform:none;}}
        @keyframes fadeIn{from{opacity:0;}to{opacity:1;}}
        @keyframes glow{0%,100%{box-shadow:0 0 0 rgba(255,255,255,0);}50%{box-shadow:0 0 30px rgba(255,255,255,0.06);}}
        @keyframes fieldPop{0%{background:rgba(255,255,255,0.06);}100%{background:transparent;}}
        @keyframes toastIn{0%{opacity:0;transform:translateY(10px) translateX(-50%);}100%{opacity:1;transform:translateY(0) translateX(-50%);}}
        @keyframes pulse{0%,100%{opacity:0.3;}50%{opacity:1;}}
        @keyframes scanline{0%{transform:translateY(-100%);}100%{transform:translateY(100vh);}}
        @keyframes appear{from{opacity:0;transform:scale(0.97);}to{opacity:1;transform:scale(1);}}

        .layout{display:grid;grid-template-columns:1fr 420px;grid-template-rows:52px 1fr;height:100vh;}

        /* ── TOPBAR */
        .tb{grid-column:1/-1;display:flex;align-items:center;gap:0;border-bottom:1px solid var(--rule);background:var(--bg2);z-index:50;}
        .tb-logo{font-family:'Bebas Neue',sans-serif;font-size:22px;letter-spacing:6px;animation:colorShift 7s linear infinite;padding:0 22px;border-right:1px solid var(--rule);height:100%;display:flex;align-items:center;flex-shrink:0;}
        .tb-title{font-family:'DM Mono',monospace;font-size:9px;letter-spacing:4px;text-transform:uppercase;color:var(--dim3);padding:0 18px;border-right:1px solid var(--rule);height:100%;display:flex;align-items:center;flex-shrink:0;}
        .tb-phase{padding:0 18px;font-family:'DM Mono',monospace;font-size:8px;letter-spacing:3px;text-transform:uppercase;display:flex;align-items:center;gap:8px;}
        .tb-dot{width:6px;height:6px;border-radius:50%;flex-shrink:0;}
        .tb-spacer{flex:1;}
        .tb-new{padding:0 22px;font-family:'DM Mono',monospace;font-size:8px;letter-spacing:3px;text-transform:uppercase;background:none;border:none;color:var(--dim3);cursor:pointer;height:100%;border-left:1px solid var(--rule);transition:all .2s;display:flex;align-items:center;gap:8px;}
        .tb-new:hover{color:var(--wht);background:var(--bg3);}

        /* ── LEFT — workspace */
        .workspace{overflow-y:auto;scrollbar-width:none;padding:28px 32px 60px;display:flex;flex-direction:column;gap:0;}
        .workspace::-webkit-scrollbar{display:none;}

        /* ── STEP HEADER */
        .step{display:flex;align-items:center;gap:12px;margin-bottom:12px;margin-top:28px;}
        .step:first-child{margin-top:0;}
        .step-n{font-family:'Bebas Neue',sans-serif;font-size:13px;letter-spacing:2px;width:22px;text-align:center;animation:colorShift 7s linear infinite;flex-shrink:0;}
        .step-line{flex:1;height:1px;background:var(--rule2);}
        .step-label{font-family:'DM Mono',monospace;font-size:8px;letter-spacing:4px;text-transform:uppercase;color:var(--dim3);flex-shrink:0;}

        /* ── DROP ZONE */
        .dropzone{border:1px dashed var(--rule2);border-radius:8px;transition:all .25s;cursor:pointer;position:relative;overflow:hidden;}
        .dropzone.over{border-color:rgba(255,255,255,.4);background:rgba(255,255,255,.02);}
        .dropzone.has-img{border-style:solid;border-color:var(--rule2);}
        .dz-inner{display:flex;flex-direction:column;align-items:center;justify-content:center;padding:40px 24px;gap:14px;text-align:center;}
        .dz-icon{font-size:32px;opacity:.25;transition:all .25s;}
        .dropzone.over .dz-icon{opacity:.6;transform:scale(1.1);}
        .dz-title{font-family:'Bebas Neue',sans-serif;font-size:22px;letter-spacing:5px;animation:colorShift 7s linear infinite;}
        .dz-sub{font-family:'DM Mono',monospace;font-size:8px;letter-spacing:3px;text-transform:uppercase;color:var(--dim3);line-height:1.8;}
        .dz-btn{font-family:'DM Mono',monospace;font-size:8px;letter-spacing:3px;text-transform:uppercase;padding:8px 22px;background:var(--bg4);border:1px solid var(--rule2);color:var(--dim3);cursor:pointer;border-radius:3px;transition:all .2s;}
        .dz-btn:hover{border-color:rgba(255,255,255,.3);color:#fff;}
        .dz-preview{width:100%;height:280px;object-fit:cover;display:block;border-radius:6px;cursor:pointer;}
        .dz-change{position:absolute;bottom:10px;right:10px;font-family:'DM Mono',monospace;font-size:7px;letter-spacing:2px;text-transform:uppercase;padding:5px 12px;background:rgba(5,5,5,.8);border:1px solid rgba(255,255,255,.15);color:rgba(255,255,255,.5);cursor:pointer;border-radius:3px;backdrop-filter:blur(8px);transition:all .2s;}
        .dz-change:hover{color:#fff;border-color:rgba(255,255,255,.4);}

        /* ── INTEL BOX */
        .intel-wrap{position:relative;}
        .intel-ta{width:100%;background:var(--bg3);border:1px solid var(--rule2);border-radius:8px;padding:16px;font-family:'Syne',sans-serif;font-size:13px;color:rgba(255,255,255,.75);outline:none;resize:none;line-height:1.8;transition:border-color .2s;min-height:110px;}
        .intel-ta:focus{border-color:rgba(255,255,255,.15);}
        .intel-ta::placeholder{color:var(--dim2);}
        .intel-hint{font-family:'DM Mono',monospace;font-size:7px;letter-spacing:2px;text-transform:uppercase;color:var(--dim);margin-top:7px;line-height:1.8;}
        .intel-examples{display:flex;flex-wrap:wrap;gap:6px;margin-top:10px;}
        .intel-ex{font-family:'DM Mono',monospace;font-size:7px;letter-spacing:1px;padding:4px 11px;background:var(--bg4);border:1px solid var(--rule2);color:var(--dim3);border-radius:20px;cursor:pointer;transition:all .15s;}
        .intel-ex:hover{border-color:rgba(255,255,255,.2);color:rgba(255,255,255,.6);}

        /* ── GENERATE BUTTON */
        .gen-btn{width:100%;padding:16px;font-family:'Bebas Neue',sans-serif;font-size:20px;letter-spacing:6px;border:none;cursor:pointer;border-radius:6px;transition:all .25s;position:relative;overflow:hidden;display:flex;align-items:center;justify-content:center;gap:12px;}
        .gen-btn::before{content:'';position:absolute;inset:0;background:linear-gradient(135deg,rgba(255,255,255,.06) 0%,transparent 60%);pointer-events:none;}
        .gen-btn:hover:not(:disabled){transform:scale(1.01);filter:brightness(1.08);}
        .gen-btn:disabled{opacity:.5;cursor:not-allowed;transform:none;}
        .gen-icon{font-size:18px;}

        /* ── FIELD EDITOR */
        .fields{display:flex;flex-direction:column;gap:2px;animation:appear .3s ease both;}
        .field-row{display:grid;grid-template-columns:100px 1fr auto;align-items:start;gap:0;border-radius:6px;transition:background .2s;padding:2px 0;}
        .field-row:hover{background:var(--bg3);}
        .field-lbl{font-family:'DM Mono',monospace;font-size:7px;letter-spacing:3px;text-transform:uppercase;color:var(--dim2);padding:12px 14px 12px 12px;flex-shrink:0;line-height:1;padding-top:14px;}
        .field-val{padding:10px 8px;}
        .field-in{background:transparent;border:none;color:#fff;font-family:'Syne',sans-serif;font-size:13px;outline:none;width:100%;transition:all .2s;}
        .field-in.name-in{font-family:'Bebas Neue',sans-serif;font-size:32px;letter-spacing:4px;}
        .field-in.sub-in{font-family:'DM Mono',monospace;font-size:9px;letter-spacing:2px;text-transform:uppercase;}
        .field-in.story-in,.field-in.g-in{font-family:'Playfair Display',serif;font-size:13px;font-style:italic;color:rgba(255,255,255,.65);resize:none;line-height:1.75;width:100%;}
        .field-in.story-in{min-height:70px;}
        .field-in.g-in{min-height:44px;}
        .field-sel{background:var(--bg4);border:1px solid var(--rule2);color:#fff;padding:6px 9px;font-family:'DM Mono',monospace;font-size:8px;letter-spacing:1px;border-radius:3px;outline:none;cursor:pointer;}
        .field-animated{animation:fieldPop .6s ease;}
        .regen-btn{font-family:'DM Mono',monospace;font-size:8px;padding:8px 10px;background:none;border:none;color:var(--dim);cursor:pointer;border-radius:3px;transition:all .15s;flex-shrink:0;white-space:nowrap;}
        .regen-btn:hover{color:rgba(255,255,255,.5);background:var(--bg4);}
        .regen-btn.spinning{animation:spin .6s linear infinite;}

        /* ── COLOR PICKER */
        .color-swatches{display:flex;gap:7px;padding:10px 8px;align-items:center;flex-wrap:wrap;}
        .swatch{width:24px;height:24px;border-radius:50%;cursor:pointer;border:2px solid transparent;transition:all .15s;}
        .swatch:hover,.swatch.on{border-color:#fff;transform:scale(1.2);}
        .hex-in{background:var(--bg4);border:1px solid;padding:5px 9px;font-family:'DM Mono',monospace;font-size:9px;letter-spacing:2px;border-radius:3px;outline:none;width:90px;}

        /* ── ACTIONS */
        .actions{display:flex;gap:10px;margin-top:4px;}
        .act-btn{flex:1;padding:14px;border:none;border-radius:6px;font-family:'DM Mono',monospace;font-size:9px;letter-spacing:3px;text-transform:uppercase;cursor:pointer;font-weight:700;transition:all .2s;display:flex;align-items:center;justify-content:center;gap:8px;}
        .act-pub{color:#000;}
        .act-pub:hover{filter:brightness(1.1);transform:scale(1.02);}
        .act-sec{background:var(--bg3);border:1px solid var(--rule2);color:var(--dim3);}
        .act-sec:hover{border-color:rgba(255,255,255,.2);color:#fff;}

        /* ── DONE STATE */
        .done-banner{padding:20px;border-radius:8px;text-align:center;animation:fadeUp .4s ease;}
        .done-logo{font-family:'Bebas Neue',sans-serif;font-size:48px;letter-spacing:10px;animation:colorShift 7s linear infinite;}
        .done-msg{font-family:'DM Mono',monospace;font-size:9px;letter-spacing:3px;text-transform:uppercase;color:var(--c3);margin-top:8px;}
        .done-name{font-family:'Bebas Neue',sans-serif;font-size:22px;letter-spacing:4px;color:#fff;margin-top:4px;}
        .done-btns{display:flex;gap:8px;margin-top:16px;}

        /* ── UPLOAD PROGRESS */
        .progress-bar{height:2px;background:var(--rule);border-radius:1px;overflow:hidden;margin-top:8px;}
        .progress-fill{height:100%;transition:width .4s ease;border-radius:1px;}

        /* ── RIGHT — preview */
        .preview{border-left:1px solid var(--rule);display:flex;flex-direction:column;background:var(--bg2);overflow:hidden;}
        .prev-tabs{display:flex;border-bottom:1px solid var(--rule);flex-shrink:0;}
        .prev-tab{flex:1;padding:11px 8px;font-family:'DM Mono',monospace;font-size:7px;letter-spacing:2px;text-transform:uppercase;background:none;border:none;color:var(--dim2);cursor:pointer;border-bottom:2px solid transparent;transition:all .2s;}
        .prev-tab.on{color:#fff;border-bottom-color:currentColor;}
        .prev-body{flex:1;overflow-y:auto;scrollbar-width:none;padding:14px;}
        .prev-body::-webkit-scrollbar{display:none;}
        .ig-btns{display:flex;gap:7px;margin:9px 0;}
        .ig-btn{flex:1;padding:9px;border:none;border-radius:4px;font-family:'DM Mono',monospace;font-size:7px;letter-spacing:2px;text-transform:uppercase;cursor:pointer;font-weight:700;transition:all .15s;}
        .ig-btn:hover{transform:scale(1.03);}
        .ig-dl{background:var(--c2);color:#000;}
        .ig-cp{background:var(--bg3);border:1px solid var(--rule2);color:var(--dim3);}
        .ig-caption{background:var(--bg3);border:1px solid var(--rule);border-radius:4px;padding:10px;font-family:'DM Mono',monospace;font-size:7px;line-height:1.9;color:rgba(255,255,255,.35);white-space:pre-wrap;max-height:300px;overflow-y:auto;}

        /* ── ABOUT panel */
        .about{padding:16px;display:flex;flex-direction:column;gap:16px;}
        .about-card{background:var(--bg3);border:1px solid var(--rule2);border-radius:6px;padding:14px;}
        .about-n{font-family:'Bebas Neue',sans-serif;font-size:28px;letter-spacing:4px;line-height:1;}
        .about-sub{font-family:'DM Mono',monospace;font-size:8px;letter-spacing:2px;text-transform:uppercase;margin-top:4px;}
        .about-loc{font-family:'Syne',sans-serif;font-size:10px;color:var(--dim3);margin-top:3px;}
        .about-story{font-family:'Playfair Display',serif;font-size:12px;font-style:italic;color:rgba(255,255,255,.55);line-height:1.75;margin-top:12px;padding-top:12px;border-top:1px solid var(--rule);}
        .about-g{margin-top:10px;padding:10px 12px;border-left:2px solid;font-family:'Playfair Display',serif;font-size:12px;font-style:italic;color:rgba(255,255,255,.45);line-height:1.65;}
        .about-meta{display:flex;gap:7px;flex-wrap:wrap;margin-top:10px;}
        .about-pill{font-family:'DM Mono',monospace;font-size:7px;letter-spacing:1px;text-transform:uppercase;padding:3px 10px;border-radius:20px;color:#000;font-weight:700;}

        /* ── TOAST */
        .toast{position:fixed;bottom:28px;left:50%;transform:translateX(-50%);background:var(--bg3);border:1px solid var(--rule2);padding:9px 22px;border-radius:24px;font-family:'DM Mono',monospace;font-size:9px;letter-spacing:2px;text-transform:uppercase;color:#fff;z-index:999;animation:toastIn .25s ease;white-space:nowrap;backdrop-filter:blur(12px);}

        /* ── GENERATING OVERLAY */
        .gen-overlay{position:absolute;inset:0;background:rgba(5,5,5,.85);backdrop-filter:blur(8px);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:16px;border-radius:6px;z-index:10;}
        .gen-spinner{font-size:32px;animation:spin 1s linear infinite;animation:colorShift 7s linear infinite,spin 1.2s linear infinite;}
        .gen-status{font-family:'DM Mono',monospace;font-size:9px;letter-spacing:4px;text-transform:uppercase;color:var(--dim3);}
        .gen-field{font-family:'Bebas Neue',sans-serif;font-size:18px;letter-spacing:4px;animation:colorShift 7s linear infinite;}
      `}</style>

      <div className="layout">

        {/* ── TOPBAR */}
        <div className="tb">
          <div className="tb-logo">ÜNDER</div>
          <div className="tb-title">◈ Studio — Add New Entry</div>
          <div className="tb-phase">
            <div className="tb-dot" style={{background: phase==="done"?"var(--c3)":phase==="idle"?"var(--dim)":"var(--c7)", animation: phase==="generating"||phase==="uploading"||phase==="publishing"?"pulse 1s ease infinite":""}} />
            <span style={{color:"var(--dim3)"}}>
              {{idle:"Ready",generating:"AI Writing…",editing:"Editing",uploading:"Uploading image…",publishing:"Publishing…",done:"Live ✓"}[phase]}
            </span>
          </div>
          <div className="tb-spacer"/>
          <button className="tb-new" onClick={reset}>
            + New Entry
          </button>
        </div>

        {/* ── LEFT — workspace */}
        <div className="workspace">

          {/* STEP 1 — Image */}
          <div className="step"><div className="step-n">01</div><div className="step-line"/><div className="step-label">Photo</div></div>
          <label
            className={`dropzone${dragOver?" over":""}${imgPreview?" has-img":""}`}
            onDragOver={e=>{e.preventDefault();setDragOver(true);}}
            onDragLeave={()=>setDragOver(false)}
            onDrop={onDrop}
            style={{display:"block",cursor:"pointer"}}
          >
            <input type="file" accept="image/*" style={{display:"none"}} onChange={e=>{if(e.target.files[0])handleImageFile(e.target.files[0]);}} />
            {imgPreview ? (
              <>
                <img src={imgPreview} alt="" className="dz-preview" />
                <span className="dz-change">Change Photo</span>
              </>
            ) : (
              <div className="dz-inner">
                <div className="dz-icon">⬡</div>
                <div className="dz-title">Drop Photo Here</div>
                <div className="dz-sub">Or click to upload from laptop<br/>JPG · PNG · WEBP</div>
                <span className="dz-btn">Browse Files</span>
              </div>
            )}
          </label>

          {/* STEP 2 — Intel */}
          <div className="step"><div className="step-n">02</div><div className="step-line"/><div className="step-label">Your Intel</div></div>
          <div className="intel-wrap">
            <textarea ref={intelRef} className="intel-ta" rows={4}
              value={intel} onChange={e=>setIntel(e.target.value)}
              placeholder="Drop everything you know. Name, city, founder, what they make, materials, vibe, how you found them, who wears them. Raw is fine."
            />
            <div className="intel-hint">The more specific, the better the output → Claude transforms this into ÜNDER's voice</div>
            <div className="intel-examples">
              {["Ahmed. Karachi. Hand-dyed linen. Ex-architect.","Natural indigo. Lagos. Tiny batches. 800 followers.","Ceramic artist. Oaxaca. Celebrities collect. No website.","Leather. Florence. 3rd generation. No PR ever."].map(ex=>(
                <button key={ex} className="intel-ex" onClick={()=>setIntel(ex)}>{ex}</button>
              ))}
            </div>
          </div>

          {/* STEP 3 — Generate */}
          <div className="step"><div className="step-n">03</div><div className="step-line"/><div className="step-label">AI Generation</div></div>
          <button className="gen-btn" style={{background: PALETTE[0], color:"#000"}}
            onClick={generate} disabled={phase==="generating"||phase==="publishing"||phase==="uploading"||!intel.trim()}>
            {phase==="generating"
              ? <><span style={{animation:"spin 1s linear infinite",display:"inline-block"}}>◌</span>Writing in ÜNDER's voice…</>
              : <><span className="gen-icon">◈</span>{phase==="editing"||phase==="done"?"Regenerate Everything":"Generate with AI"}</>
            }
          </button>

          {/* STEP 4 — Edit fields (shown after generation) */}
          {(phase==="editing"||phase==="done")&&(
            <>
              <div className="step"><div className="step-n">04</div><div className="step-line"/><div className="step-label">Edit & Refine</div></div>
              <div className="fields">

                {/* Name */}
                <div className="field-row" style={{alignItems:"center"}}>
                  <div className="field-lbl">Name</div>
                  <div className="field-val" style={{flex:1}}>
                    <input className={`field-in name-in${streamText==="name"?" field-animated":""}`}
                      value={brand.name} onChange={e=>set("name",e.target.value)}
                      style={{color:brand.color}} />
                  </div>
                  <button className={`regen-btn${regenField==="name"?" spinning":""}`} onClick={()=>regenSingle("name")}>↺</button>
                </div>

                {/* Sub */}
                <div className="field-row" style={{alignItems:"center"}}>
                  <div className="field-lbl">Sub</div>
                  <div className="field-val" style={{flex:1}}>
                    <input className={`field-in sub-in${streamText==="sub"?" field-animated":""}`}
                      value={brand.sub} onChange={e=>set("sub",e.target.value)}
                      style={{color:brand.color+"aa"}} />
                  </div>
                  <button className={`regen-btn${regenField==="sub"?" spinning":""}`} onClick={()=>regenSingle("sub")}>↺</button>
                </div>

                {/* Story */}
                <div className="field-row">
                  <div className="field-lbl">Story</div>
                  <div className="field-val" style={{flex:1}}>
                    <textarea className={`field-in story-in${streamText==="story"?" field-animated":""}`}
                      value={brand.story} onChange={e=>set("story",e.target.value)} rows={3} />
                  </div>
                  <button className={`regen-btn${regenField==="story"?" spinning":""}`} onClick={()=>regenSingle("story")}>↺</button>
                </div>

                {/* Guide quote */}
                <div className="field-row">
                  <div className="field-lbl">Quote</div>
                  <div className="field-val" style={{flex:1}}>
                    <textarea className={`field-in g-in${streamText==="g"?" field-animated":""}`}
                      value={brand.g} onChange={e=>set("g",e.target.value)} rows={2} />
                  </div>
                  <button className={`regen-btn${regenField==="g"?" spinning":""}`} onClick={()=>regenSingle("g")}>↺</button>
                </div>

                {/* Location row */}
                <div className="field-row" style={{alignItems:"center"}}>
                  <div className="field-lbl">Location</div>
                  <div className="field-val" style={{flex:1,display:"flex",gap:8}}>
                    <input className="field-in" style={{flex:2}} placeholder="City" value={brand.city} onChange={e=>set("city",e.target.value)} />
                    <input className="field-in" style={{flex:1,width:60}} placeholder="CC" value={brand.ctry} onChange={e=>set("ctry",e.target.value)} />
                  </div>
                </div>

                {/* Category + Continent */}
                <div className="field-row" style={{alignItems:"center"}}>
                  <div className="field-lbl">Category</div>
                  <div className="field-val" style={{flex:1,display:"flex",gap:8}}>
                    <select className="field-sel" value={brand.cat} onChange={e=>set("cat",e.target.value)}>
                      <optgroup label="── Fashion"><option disabled>Fashion</option>{CATS.filter(c=>!ART_CATS.includes(c)).map(c=><option key={c}>{c}</option>)}</optgroup>
                      <optgroup label="── Art"><option disabled>Art</option>{ART_CATS.map(c=><option key={c}>{c}</option>)}</optgroup>
                    </select>
                    <select className="field-sel" value={brand.cont} onChange={e=>set("cont",e.target.value)}>
                      {CONTS.map(c=><option key={c}>{c}</option>)}
                    </select>
                  </div>
                </div>

                {/* Rarity */}
                <div className="field-row" style={{alignItems:"center"}}>
                  <div className="field-lbl">Rarity</div>
                  <div className="field-val" style={{flex:1}}>
                    <input className="field-in" type="number" min="1" max="10" step="0.1" value={brand.r} onChange={e=>set("r",e.target.value)} style={{width:80}} />
                    <span style={{fontFamily:"'DM Mono',monospace",fontSize:10,color:"var(--dim2)",marginLeft:8}}>/ 10</span>
                  </div>
                  <button className={`regen-btn${regenField==="r"?" spinning":""}`} onClick={()=>regenSingle("r")}>↺</button>
                </div>

                {/* Color */}
                <div className="field-row" style={{alignItems:"center"}}>
                  <div className="field-lbl">Color</div>
                  <div className="color-swatches">
                    {PALETTE.map(c=>(
                      <div key={c} className={`swatch${brand.color===c?" on":""}`} style={{background:c}} onClick={()=>set("color",c)} />
                    ))}
                    <input className="hex-in" value={brand.color} style={{borderColor:brand.color,color:brand.color}}
                      onChange={e=>{const v=e.target.value;set("color",v);}} />
                  </div>
                </div>
              </div>

              {/* STEP 5 — Publish */}
              <div className="step"><div className="step-n">05</div><div className="step-line"/><div className="step-label">Publish</div></div>
              {!published ? (
                <>
                  {(phase==="uploading"||phase==="publishing")&&<div className="progress-bar"><div className="progress-fill" style={{width:`${uploadProgress||50}%`,background:brand.color}}/></div>}
                  <div className="actions">
                    <button className="act-btn act-pub" style={{background:brand.color}}
                      onClick={publish} disabled={phase==="uploading"||phase==="publishing"}>
                      {phase==="uploading"?"Uploading photo…":phase==="publishing"?"Publishing…":"✓ Add to ÜNDER"}
                    </button>
                    <button className="act-btn act-sec" onClick={reset}>Reset</button>
                  </div>
                </>
              ) : (
                <div className="done-banner" style={{background:brand.color+"12",border:`1px solid ${brand.color}30`}}>
                  <div className="done-logo">ÜNDER</div>
                  <div className="done-msg">Now live</div>
                  <div className="done-name">{brand.name}</div>
                  <div className="done-btns">
                    <button className="act-btn act-pub" style={{background:brand.color,flex:1}} onClick={reset}>+ Add Another</button>
                    <button className="act-btn act-sec" onClick={()=>window.open("/","_blank")}>View Site →</button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* ── RIGHT — preview */}
        <div className="preview">
          <div className="prev-tabs">
            {[["card","◈ Card"],["about","◎ Profile"],["caption","✦ Caption"]].map(([t,l])=>(
              <button key={t} className={`prev-tab${(activeField||"card")===t?" on":""}`} onClick={()=>setActiveField(t)}>{l}</button>
            ))}
          </div>
          <div className="prev-body">
            {(activeField||"card")==="card"&&(
              <>
                <IGCanvas brand={brand} canvasRef={canvasRef} />
                <div className="ig-btns">
                  <button className="ig-btn ig-dl" onClick={downloadCard}>↓ Download PNG</button>
                  <button className="ig-btn ig-cp" onClick={()=>{navigator.clipboard.writeText(makeCaption(brand));setCopied(true);setTimeout(()=>setCopied(false),2000);}}>
                    {copied?"✓ Copied":"⎘ Copy Caption"}
                  </button>
                </div>
              </>
            )}
            {(activeField||"card")==="about"&&(
              <div className="about">
                <div className="about-card">
                  <div className="about-n" style={{color:brand.color||"#fff"}}>{brand.name||"Brand Name"}</div>
                  <div className="about-sub" style={{color:brand.color||"var(--dim3)"}}>{brand.sub||"Craft descriptor"}</div>
                  <div className="about-loc">{[brand.city,brand.ctry,brand.cont].filter(Boolean).join(" · ")||"City · Country"}</div>
                  <div className="about-meta">
                    {brand.cat&&<span className="about-pill" style={{background:brand.color||"#fff"}}>{brand.cat}</span>}
                    {brand.r&&<span className="about-pill" style={{background:brand.color||"#fff"}}>◆ {brand.r}/10</span>}
                  </div>
                  {brand.story&&<div className="about-story">{brand.story}</div>}
                  {brand.g&&<div className="about-g" style={{borderLeftColor:brand.color}}>"{brand.g}"</div>}
                </div>
                {imgPreview&&<img src={imgPreview} alt="" style={{width:"100%",borderRadius:6,border:"1px solid var(--rule)"}} />}
              </div>
            )}
            {(activeField||"card")==="caption"&&(
              <>
                <div className="ig-btns">
                  <button className="ig-btn ig-cp" style={{flex:1}} onClick={()=>{navigator.clipboard.writeText(makeCaption(brand));setCopied(true);setTimeout(()=>setCopied(false),2000);}}>
                    {copied?"✓ Copied":"⎘ Copy Full Caption"}
                  </button>
                </div>
                <div className="ig-caption">{makeCaption(brand)}</div>
              </>
            )}
          </div>
        </div>
      </div>

      {toast&&<div className="toast">{toast}</div>}
    </>
  );
}
