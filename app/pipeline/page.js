'use client';
import { useState, useEffect, useRef, useCallback } from "react";

const SUPABASE_URL = "https://geqqyxrmdxwwyyddxohc.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdlcXF5eHJtZHh3d3l5ZGR4b2hjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI5OTU0NzcsImV4cCI6MjA4ODU3MTQ3N30.0E3K0sfEAicGq4cKBqk_N2TdIrLs10pNgrGe_KC-z6Y";

const PALETTE = ["#FF6B35","#00E5FF","#7CFF50","#FF2D9B","#A855F7","#00FFBB","#FFD700"];
const CATS = ["Knitwear","Drape","Tailoring","Denim","Workwear","Minimal","Accs","Painting","Ceramic","Photo","Textile Art"];
const ART_CATS = ["Painting","Ceramic","Photo","Textile Art"];
const CONTS = ["Africa","Americas","Asia","Europe","Oceania"];

const WAVES = [
  { id: 0, label: "Celebrity Off-Duty", icon: "◈", color: "#FF6B35", desc: "Brands A-listers wear privately" },
  { id: 1, label: "Instagram Underground", icon: "◎", color: "#00E5FF", desc: "Sub-10k follower gems" },
  { id: 2, label: "Craft Heritage", icon: "◆", color: "#7CFF50", desc: "Ancient technique, modern form" },
  { id: 3, label: "Art Collectors", icon: "◉", color: "#FF2D9B", desc: "Painters, ceramicists, artists" },
  { id: 4, label: "Streetwear Obscure", icon: "◐", color: "#A855F7", desc: "Underground urban culture" },
  { id: 5, label: "Wildcard", icon: "◑", color: "#FFD700", desc: "Unexpected finds, anywhere" },
];

const BLANK = { name:"", sub:"", city:"", ctry:"", cont:"Africa", cat:"Knitwear", r:9.0, color:"#FF6B35", img:"", g:"", story:"", _status:"new" };

// ── Unsplash pools by category
const IMG_POOLS = {
  Knitwear:     ["photo-1558618666-fcd25c85cd64","photo-1516762689617-e1cffcef479d","photo-1591085686350-798c0f9faa7f","photo-1578587018452-892bacefd3f2"],
  Drape:        ["photo-1490481651871-ab68de25d43d","photo-1469334031218-e382a71b716b","photo-1523381294911-8d3cead13475","photo-1515886657613-9f3515b0c78f"],
  Tailoring:    ["photo-1529139574466-a303027c1d8b","photo-1506629082955-511b1aa562c8","photo-1509631179647-0177331693ae","photo-1507679799987-c73779587ccf"],
  Denim:        ["photo-1542272604-787c3835535d","photo-1475178626620-a4d074967452","photo-1543163521-1bf539c55dd2","photo-1551698618-1dfe5d97d256"],
  Workwear:     ["photo-1556905055-8f358a7a47b2","photo-1523381210434-271e8be1f52b","photo-1585386959984-a4155224a1ad"],
  Minimal:      ["photo-1496747611176-843222e1e57c","photo-1517841905240-472988babdf9","photo-1539109136881-3be0616acf4b"],
  Accs:         ["photo-1534528741775-53994a69daeb","photo-1542291026-7eec264c27ff","photo-1606760227091-3dd870d97f1d"],
  Painting:     ["photo-1579783902614-a3fb3927b6a5","photo-1541961017774-22349e4a1262","photo-1578301978693-85fa9c0320b9","photo-1560421741-ef2981f9f5e9"],
  Ceramic:      ["photo-1565193566173-7a0ee3dbe261","photo-1493106641515-5b9b5426f72a","photo-1608197492685-5cb49b07b9c3","photo-1519638399535-1b036603ac77"],
  Photo:        ["photo-1502920917128-1aa500764cbd","photo-1452587925148-ce544e77e70d","photo-1554048612-b6a482bc67e5"],
  "Textile Art":["photo-1558171813-c36a2d4a9dcd","photo-1586023492125-27b2c045efd7","photo-1528360983277-13d401cdc186"],
};
const ALL_PHOTOS = Object.values(IMG_POOLS).flat();
function imgUrl(id, w=800) { return `https://images.unsplash.com/${id}?w=${w}&q=90`; }
function poolImg(cat) {
  const pool = IMG_POOLS[cat] || ALL_PHOTOS;
  return imgUrl(pool[Math.floor(Math.random() * pool.length)]);
}

// ── API helpers
async function runDiscoveryWave(waveIndex, selectedWaves) {
  const res = await fetch("/api/discover", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ wave: waveIndex, selectedWaves }),
  });
  const data = await res.json();
  return data.brands || [];
}

async function publishToSupabase(brand) {
  const payload = {
    name: brand.name, sub: brand.sub, city: brand.city,
    ctry: brand.ctry || brand.country, cont: brand.cont || brand.continent,
    cat: brand.cat, r: parseFloat(brand.r || brand.rarity || 9),
    color: brand.color, img: brand.img, g: brand.g, story: brand.story,
  };
  const res = await fetch(`${SUPABASE_URL}/rest/v1/brands`, {
    method: "POST",
    headers: { "Content-Type":"application/json","apikey":SUPABASE_KEY,"Authorization":`Bearer ${SUPABASE_KEY}`,"Prefer":"return=representation" },
    body: JSON.stringify(payload),
  });
  return res.ok;
}

async function updateInSupabase(id, brand) {
  const payload = {
    name: brand.name, sub: brand.sub, city: brand.city,
    ctry: brand.ctry || brand.country, cont: brand.cont || brand.continent,
    cat: brand.cat, r: parseFloat(brand.r || brand.rarity || 9),
    color: brand.color, img: brand.img, g: brand.g, story: brand.story,
  };
  const res = await fetch(`${SUPABASE_URL}/rest/v1/brands?id=eq.${id}`, {
    method: "PATCH",
    headers: { "Content-Type":"application/json","apikey":SUPABASE_KEY,"Authorization":`Bearer ${SUPABASE_KEY}`,"Prefer":"return=representation" },
    body: JSON.stringify(payload),
  });
  return res.ok;
}

async function deleteFromSupabase(id) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/brands?id=eq.${id}`, {
    method: "DELETE",
    headers: { "apikey":SUPABASE_KEY,"Authorization":`Bearer ${SUPABASE_KEY}` },
  });
  return res.ok;
}

async function fetchAllFromSupabase() {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/brands?select=*&order=r.desc`, {
    headers: { "apikey":SUPABASE_KEY,"Authorization":`Bearer ${SUPABASE_KEY}` },
  });
  return res.ok ? res.json() : [];
}

// ── Caption generator
function generateCaption(b) {
  const isArt = ART_CATS.includes(b.cat);
  const tag = isArt ? "artist" : "brand";
  return `◆ ${(b.name||"").toUpperCase()} ◆\n\n${b.story||""}\n\n"${b.g||""}"\n\n📍 ${b.city||""} · Rarity ${b.r||b.rarity||""}/10\n\n${isArt ? "The artists no one talks about are the ones collectors remember forever." : "The names you don't know are often the ones worth knowing most."}\n\n─────────────────────\n#underground #${(b.cat||"").toLowerCase().replace(/\s/g,"")} #${(b.city||"").toLowerCase().replace(/\s/g,"")} #niche #${isArt?"fineart #artcollector #contemporaryart #underground"+tag:"luxury #independentfashion #artisan #slowfashion"} #UNDER #hidden${tag} #${tag}finds #${(b.cont||"global").toLowerCase()}${isArt?"art":"fashion"} #hiddentreasure #cultureknowledge #under${tag}`;
}

// ── Instagram canvas
function InstagramCanvas({ brand }) {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !brand) return;
    const ctx = canvas.getContext("2d");
    const W = 1080, H = 1080;
    canvas.width = W; canvas.height = H;
    const color = brand.color || "#FF6B35";

    const draw = (imgEl) => {
      ctx.fillStyle = "#050505";
      ctx.fillRect(0, 0, W, H);
      if (imgEl) {
        ctx.drawImage(imgEl, 0, 0, W, H * 0.62);
        const g1 = ctx.createLinearGradient(0, H * 0.25, 0, H * 0.62);
        g1.addColorStop(0, "rgba(5,5,5,0)");
        g1.addColorStop(1, "rgba(5,5,5,0.98)");
        ctx.fillStyle = g1; ctx.fillRect(0, 0, W, H * 0.62);
      }
      ctx.fillStyle = "#0D0D0D"; ctx.fillRect(0, H * 0.60, W, H * 0.40);
      ctx.fillStyle = color; ctx.fillRect(0, 0, W, 8);
      ctx.fillStyle = color; ctx.fillRect(0, H - 8, W, 8);
      ctx.fillStyle = color + "AA"; ctx.fillRect(0, H * 0.60, W, 3);

      ctx.fillStyle = color;
      ctx.font = "bold 52px 'Arial Black', sans-serif";
      ctx.fillText("ÜNDER", 54, 76);

      ctx.fillStyle = color; ctx.fillRect(W - 220, 26, 185, 54);
      ctx.fillStyle = "#000"; ctx.font = "bold 22px 'Courier New', monospace";
      ctx.fillText(`◆ ${brand.r || brand.rarity || ""} / 10`, W - 206, 62);

      const nameSize = (brand.name||"").length > 14 ? 72 : (brand.name||"").length > 10 ? 86 : 102;
      ctx.fillStyle = "#FFFFFF";
      ctx.font = `bold ${nameSize}px 'Arial Black', sans-serif`;
      ctx.fillText(brand.name || "", 54, H * 0.62 + 104);

      ctx.fillStyle = color; ctx.font = "500 24px 'Courier New', monospace";
      ctx.fillText((brand.sub || "").toUpperCase(), 54, H * 0.62 + 152);

      ctx.fillStyle = "rgba(255,255,255,0.32)"; ctx.font = "20px 'Courier New', monospace";
      ctx.fillText(`${brand.city||""}  ·  ${brand.ctry||brand.country||""}`, 54, H * 0.62 + 192);

      ctx.fillStyle = "rgba(255,255,255,0.55)"; ctx.font = "italic 27px Georgia, serif";
      const g = `"${brand.g||""}"`;
      const words = g.split(" "); let line = "", y = H * 0.62 + 248;
      for (const w of words) {
        const test = line + w + " ";
        if (ctx.measureText(test).width > W - 108 && line) { ctx.fillText(line.trim(), 54, y); line = w + " "; y += 40; }
        else line = test;
      }
      ctx.fillText(line.trim(), 54, y);

      const catW = (brand.cat||"").length * 16 + 44;
      ctx.fillStyle = color; ctx.fillRect(54, H - 76, catW, 44);
      ctx.fillStyle = "#000"; ctx.font = "bold 18px 'Courier New', monospace";
      ctx.fillText((brand.cat||"").toUpperCase(), 72, H - 48);

      ctx.fillStyle = "rgba(255,255,255,0.15)"; ctx.font = "15px 'Courier New', monospace";
      ctx.fillText("UNDERGROUND DISCOVERY · ÜNDER", W - 500, H - 48);
    };

    if (brand.img) {
      const img = new Image(); img.crossOrigin = "anonymous";
      img.onload = () => draw(img);
      img.onerror = () => draw(null);
      img.src = brand.img;
    } else draw(null);
  }, [brand?.name, brand?.sub, brand?.city, brand?.ctry, brand?.country, brand?.g, brand?.r, brand?.rarity, brand?.cat, brand?.color, brand?.img]);

  return <canvas ref={canvasRef} style={{ width:"100%", borderRadius:4, display:"block" }} />;
}

// ── Edit Panel (shared between Discover, Create, and DB modes)
function EditPanel({ editing, onChange, onPublish, onUpdate, onDelete, onSkip, mode }) {
  const [imgPickerOpen, setImgPickerOpen] = useState(false);
  const [imgSearchUrl, setImgSearchUrl] = useState("");
  const [customHex, setCustomHex] = useState(editing?.color || "");
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => { setCustomHex(editing?.color || ""); }, [editing?.color]);

  const set = (k, v) => onChange({ ...editing, [k]: v });
  const isArt = ART_CATS.includes(editing?.cat);

  if (!editing) return (
    <div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",height:"100%",gap:12,opacity:.2}}>
      <div style={{fontSize:48}}>◎</div>
      <div style={{fontFamily:"'DM Mono',monospace",fontSize:9,letterSpacing:3,textTransform:"uppercase"}}>Select or create</div>
    </div>
  );

  return (
    <div className="edit-panel">
      {/* Name */}
      <div className="ep-section">
        <div className="ep-label">Name</div>
        <input className="ep-input ep-name" value={editing.name||""} onChange={e=>set("name",e.target.value)} placeholder="Brand or Artist Name" />
        <input className="ep-input ep-sub" value={editing.sub||""} onChange={e=>set("sub",e.target.value)} placeholder={isArt?"Medium descriptor…":"Craft descriptor…"} style={{marginTop:6,color:(editing.color||"#fff")+"aa"}} />
      </div>

      {/* Image */}
      <div className="ep-section">
        <div className="ep-label">Image <span className="ep-hint">click to change</span></div>
        {editing.img
          ? <img src={editing.img} alt="" className="ep-img" onClick={()=>setImgPickerOpen(true)} />
          : <div className="ep-img-empty" onClick={()=>setImgPickerOpen(true)}>+ Pick Image</div>
        }
      </div>

      {/* Story */}
      <div className="ep-section">
        <div className="ep-label">Story</div>
        <textarea className="ep-ta" value={editing.story||""} onChange={e=>set("story",e.target.value)} rows={3} placeholder="2 sentences. Include founder name and what makes them extraordinary." />
      </div>

      {/* Guide Quote */}
      <div className="ep-section">
        <div className="ep-label">Guide Quote <span className="ep-hint">max 15 words, poetic</span></div>
        <textarea className="ep-ta ep-ta-sm" value={editing.g||""} onChange={e=>set("g",e.target.value)} rows={2} placeholder="Short, punchy, specific." />
      </div>

      {/* Location + Rarity */}
      <div className="ep-section">
        <div className="ep-label">Location & Rarity</div>
        <div className="ep-row">
          <input className="ep-input" value={editing.city||""} onChange={e=>set("city",e.target.value)} placeholder="City" style={{flex:1}} />
          <input className="ep-input" value={editing.ctry||editing.country||""} onChange={e=>set("ctry",e.target.value)} placeholder="CC" style={{width:54}} />
          <input className="ep-input" value={editing.r||editing.rarity||""} onChange={e=>set("r",e.target.value)} placeholder="9.0" style={{width:62,textAlign:"center"}} />
        </div>
      </div>

      {/* Category + Continent */}
      <div className="ep-section">
        <div className="ep-label">Category & Region</div>
        <div className="ep-row">
          <select className="ep-sel" value={editing.cat||""} onChange={e=>set("cat",e.target.value)}>
            <optgroup label="── Fashion ──">
              {CATS.filter(c=>!ART_CATS.includes(c)).map(c=><option key={c}>{c}</option>)}
            </optgroup>
            <optgroup label="── Art ──">
              {ART_CATS.map(c=><option key={c}>{c}</option>)}
            </optgroup>
          </select>
          <select className="ep-sel" value={editing.cont||editing.continent||""} onChange={e=>set("cont",e.target.value)}>
            {CONTS.map(c=><option key={c}>{c}</option>)}
          </select>
        </div>
      </div>

      {/* Color */}
      <div className="ep-section">
        <div className="ep-label">Color</div>
        <div className="ep-color-row">
          {PALETTE.map(c=>(
            <div key={c} className={`ep-swatch${editing.color===c?" on":""}`} style={{background:c}} onClick={()=>set("color",c)} />
          ))}
          <div className="ep-hex-wrap">
            <input className="ep-hex" value={customHex} placeholder="#custom"
              onChange={e=>{setCustomHex(e.target.value);if(/^#[0-9A-Fa-f]{6}$/.test(e.target.value))set("color",e.target.value);}}
              style={{borderColor: editing.color, color: editing.color}}
            />
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="ep-actions">
        {mode === "discover" && editing._status === "pending" && <>
          <button className="ep-btn ep-pub" style={{background:editing.color}} onClick={onPublish}>✓ Publish Live</button>
          <button className="ep-btn ep-skip" onClick={onSkip}>✗ Skip</button>
        </>}
        {mode === "discover" && editing._status === "published" && (
          <div className="ep-live">✓ Live on ÜNDER</div>
        )}
        {mode === "create" && (
          <button className="ep-btn ep-pub" style={{background:editing.color}} onClick={onPublish}>+ Add to ÜNDER</button>
        )}
        {mode === "db" && <>
          <button className="ep-btn ep-pub" style={{background:editing.color}} onClick={onUpdate}>↑ Save Changes</button>
          <button className="ep-btn ep-del" onClick={()=>setConfirmDelete(true)}>✕ Delete</button>
        </>}
      </div>

      {confirmDelete && (
        <div className="ep-confirm">
          <div className="ep-confirm-txt">Delete "{editing.name}" permanently?</div>
          <div className="ep-row" style={{gap:8,marginTop:8}}>
            <button className="ep-btn ep-del" style={{flex:1}} onClick={()=>{onDelete();setConfirmDelete(false);}}>Yes, Delete</button>
            <button className="ep-btn ep-skip" style={{flex:1}} onClick={()=>setConfirmDelete(false)}>Cancel</button>
          </div>
        </div>
      )}

      {/* Image Picker */}
      {imgPickerOpen && (
        <div className="picker-over" onClick={()=>setImgPickerOpen(false)}>
          <div className="picker-box" onClick={e=>e.stopPropagation()}>
            <div className="picker-hd">
              <div className="picker-title">Pick Image</div>
              <button className="picker-close" onClick={()=>setImgPickerOpen(false)}>✕</button>
            </div>
            <div className="picker-grid">
              {(IMG_POOLS[editing.cat] || ALL_PHOTOS.slice(0,24)).map((id,i)=>(
                <img key={i} src={imgUrl(id,400)} alt="" className="picker-img"
                  onClick={()=>{set("img",imgUrl(id));setImgPickerOpen(false);}} />
              ))}
              {ALL_PHOTOS.map((id,i)=>(
                <img key={"a"+i} src={imgUrl(id,400)} alt="" className="picker-img"
                  onClick={()=>{set("img",imgUrl(id));setImgPickerOpen(false);}} />
              ))}
            </div>
            <div className="picker-url-row">
              <input className="picker-url-in" placeholder="Or paste any image URL and press Enter…"
                value={imgSearchUrl} onChange={e=>setImgSearchUrl(e.target.value)}
                onKeyDown={e=>{if(e.key==="Enter"&&imgSearchUrl){set("img",imgSearchUrl);setImgPickerOpen(false);setImgSearchUrl("");}}}
              />
              <button className="picker-url-btn" onClick={()=>{if(imgSearchUrl){set("img",imgSearchUrl);setImgPickerOpen(false);setImgSearchUrl("");}}}>Use</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main pipeline
export default function Pipeline() {
  const [mode, setMode] = useState("discover"); // discover | create | db
  const [phase, setPhase] = useState("idle");
  const [log, setLog] = useState([]);
  const [finds, setFinds] = useState([]);
  const [dbRecords, setDbRecords] = useState([]);
  const [dbLoading, setDbLoading] = useState(false);
  const [selected, setSelected] = useState(null);
  const [editing, setEditing] = useState(null);
  const [rightTab, setRightTab] = useState("instagram");
  const [publishedCount, setPublishedCount] = useState(0);
  const [copied, setCopied] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");
  const [selectedWaves, setSelectedWaves] = useState([0,1,2,3,4,5]);
  const [dbSearch, setDbSearch] = useState("");
  const [dbFilter, setDbFilter] = useState("All");
  const logRef = useRef(null);

  const addLog = (msg, type="info") => setLog(l=>[...l,{msg,type,t:new Date().toLocaleTimeString()}]);

  // Scroll log to bottom
  useEffect(() => { if(logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight; }, [log]);

  // Load DB when switching to db mode
  useEffect(() => {
    if (mode === "db") {
      setDbLoading(true);
      fetchAllFromSupabase().then(d=>{setDbRecords(d);setDbLoading(false);}).catch(()=>setDbLoading(false));
    }
  }, [mode, publishedCount]);

  const selectFind = useCallback((b) => {
    setSelected(b);
    setEditing({...b});
  }, []);

  const updateEditing = useCallback((updated) => {
    setEditing(updated);
    if (mode === "discover" && selected) {
      setFinds(f => f.map(b => b === selected ? {...b, ...updated} : b));
      setSelected(s => ({...s,...updated}));
    }
    if (mode === "db" && selected) {
      setDbRecords(d => d.map(b => b.id === selected.id ? {...b,...updated} : b));
      setSelected(s => ({...s,...updated}));
    }
  }, [mode, selected]);

  // ── Discover
  const runSearch = async () => {
    setPhase("searching");
    setFinds([]); setSelected(null); setEditing(null); setLog([]);
    addLog("Initializing discovery engine…","system");
    const allFinds = [];
    const wavesToRun = WAVES.filter(w => selectedWaves.includes(w.id));
    for (const wave of wavesToRun) {
      addLog(`${wave.icon} Wave: ${wave.label} — ${wave.desc}`, "info");
      await new Promise(r=>setTimeout(r,300));
      try {
        const results = await runDiscoveryWave(wave.id, selectedWaves);
        addLog(`  ↳ ${results.length} finds returned`, "success");
        for (const b of results) {
          b.img = poolImg(b.cat);
          b.color = PALETTE[allFinds.length % PALETTE.length];
          b._status = "pending";
          allFinds.push(b);
          setFinds([...allFinds]);
          addLog(`  ◆ ${b.name} — ${b.city} · ${b.cat} · Rarity ${b.rarity||b.r}`, "brand");
          await new Promise(r=>setTimeout(r,150));
        }
      } catch(e) {
        addLog(`  ✗ Wave error: ${e.message}`, "error");
      }
    }
    addLog(`Complete — ${allFinds.length} candidates ready.`, "system");
    setPhase("reviewing");
    if (allFinds.length > 0) selectFind(allFinds[0]);
  };

  const publishFind = async () => {
    if (!editing || !selected) return;
    const brand = editing;
    setFinds(f => f.map(b => b === selected ? {...b, _status:"publishing"} : b));
    addLog(`Publishing ${brand.name}…`, "info");
    const ok = await publishToSupabase(brand);
    const status = ok ? "published" : "error";
    setFinds(f => f.map(b => b === selected ? {...b, _status:status} : b));
    setSelected(s=>({...s,_status:status}));
    setEditing(e=>({...e,_status:status}));
    if (ok) { setPublishedCount(c=>c+1); addLog(`✓ ${brand.name} is now live on ÜNDER`, "success"); }
    else addLog(`✗ Failed to publish ${brand.name}`, "error");
  };

  const skipFind = () => {
    if (!selected) return;
    setFinds(f => f.map(b => b === selected ? {...b, _status:"rejected"} : b));
    setSelected(s=>({...s,_status:"rejected"}));
    setEditing(e=>({...e,_status:"rejected"}));
    addLog(`Skipped: ${selected.name}`, "warn");
    // Auto-advance to next pending
    const next = finds.find(b => b !== selected && b._status === "pending");
    if (next) selectFind(next);
  };

  // ── Create
  const createNew = async () => {
    if (!editing || !editing.name) return;
    addLog(`Creating ${editing.name}…`, "info");
    const ok = await publishToSupabase(editing);
    if (ok) {
      setPublishedCount(c=>c+1);
      addLog(`✓ ${editing.name} added to ÜNDER`, "success");
      setSaveMsg("✓ Added to ÜNDER");
      setEditing({...BLANK});
      setTimeout(()=>setSaveMsg(""),3000);
    } else {
      addLog(`✗ Failed to create ${editing.name}`, "error");
    }
  };

  // ── DB edit/delete
  const saveDbEdit = async () => {
    if (!editing || !editing.id) return;
    setSaveMsg("Saving…");
    const ok = await updateInSupabase(editing.id, editing);
    if (ok) {
      setDbRecords(d => d.map(b => b.id === editing.id ? {...b,...editing} : b));
      setSaveMsg("✓ Saved");
      addLog(`✓ Updated: ${editing.name}`, "success");
    } else {
      setSaveMsg("✗ Failed");
      addLog(`✗ Update failed: ${editing.name}`, "error");
    }
    setTimeout(()=>setSaveMsg(""),2500);
  };

  const deleteDbEntry = async () => {
    if (!editing?.id) return;
    const ok = await deleteFromSupabase(editing.id);
    if (ok) {
      setDbRecords(d => d.filter(b => b.id !== editing.id));
      setEditing(null); setSelected(null);
      addLog(`✗ Deleted: ${editing.name}`, "warn");
    }
  };

  // ── DB filtered list
  const filteredDb = dbRecords.filter(b => {
    const matchSearch = !dbSearch || [b.name,b.city,b.sub,b.ctry].some(s=>(s||"").toLowerCase().includes(dbSearch.toLowerCase()));
    const matchFilter = dbFilter === "All" || (dbFilter === "Art" ? ART_CATS.includes(b.cat) : !ART_CATS.includes(b.cat));
    return matchSearch && matchFilter;
  });

  const statusColor = s=>({pending:"#666",publishing:"#FFD700",published:"#7CFF50",rejected:"#333",error:"#FF4444",new:"#A855F7",publishing:"#FFD700"}[s]||"#555");
  const statusIcon  = s=>({pending:"◎",publishing:"◌",published:"✓",rejected:"—",error:"!",new:"+"}[s]||"◎");

  const leftItems = mode==="discover" ? finds : mode==="db" ? filteredDb : [];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Mono:ital,wght@0,400;0,500;1,400&family=Syne:wght@400;600;700&family=Playfair+Display:ital@1&display=swap');
        *,*::before,*::after{margin:0;padding:0;box-sizing:border-box;}
        html,body{height:100%;overflow:hidden;background:#050505;color:#fff;font-family:'Syne',sans-serif;}
        :root{
          --bg:#050505;--bg2:#0A0A0A;--bg3:#111;--bg4:#1A1A1A;--bg5:#222;
          --wht:#fff;--dim:#444;--dim2:#666;--rule:rgba(255,255,255,0.05);
          --c1:#FF6B35;--c2:#00E5FF;--c3:#7CFF50;--c4:#FF2D9B;--c5:#A855F7;--c6:#00FFBB;--c7:#FFD700;
        }
        @keyframes colorShift{0%{color:var(--c1);}14%{color:var(--c2);}28%{color:var(--c3);}42%{color:var(--c4);}56%{color:var(--c5);}70%{color:var(--c6);}84%{color:var(--c7);}100%{color:var(--c1);}}
        @keyframes bgShift{0%{background:var(--c1);}14%{background:var(--c2);}28%{background:var(--c3);}42%{background:var(--c4);}56%{background:var(--c5);}70%{background:var(--c6);}84%{background:var(--c7);}100%{background:var(--c1);}}
        @keyframes spin{to{transform:rotate(360deg);}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(10px);}to{opacity:1;transform:none;}}
        @keyframes pulse{0%,100%{opacity:.2;}50%{opacity:.6;}}
        @keyframes blink{0%,100%{opacity:1;}50%{opacity:.2;}}

        .layout{display:grid;grid-template-columns:280px 1fr 360px;grid-template-rows:52px 1fr;height:100vh;overflow:hidden;}

        /* ── TOPBAR */
        .tb{grid-column:1/-1;display:flex;align-items:center;gap:0;border-bottom:1px solid var(--rule);background:var(--bg2);z-index:50;padding:0 0 0 0;}
        .tb-logo{font-family:'Bebas Neue',sans-serif;font-size:22px;letter-spacing:6px;animation:colorShift 7s linear infinite;flex-shrink:0;padding:0 20px;border-right:1px solid var(--rule);height:100%;display:flex;align-items:center;}
        .tb-modes{display:flex;height:100%;border-right:1px solid var(--rule);}
        .tb-mode{padding:0 18px;font-family:'DM Mono',monospace;font-size:8px;letter-spacing:3px;text-transform:uppercase;background:none;border:none;color:var(--dim2);cursor:pointer;border-bottom:2px solid transparent;transition:all .2s;height:100%;display:flex;align-items:center;gap:7px;white-space:nowrap;}
        .tb-mode.on{color:var(--wht);border-bottom-color:currentColor;}
        .tb-mode-icon{font-size:13px;}
        .tb-spacer{flex:1;}
        .tb-stat{padding:0 14px;border-left:1px solid var(--rule);font-family:'DM Mono',monospace;font-size:8px;letter-spacing:1px;color:var(--dim2);height:100%;display:flex;align-items:center;gap:6px;white-space:nowrap;}
        .tb-stat b{letter-spacing:0;}
        .tb-run{height:100%;padding:0 28px;font-family:'Bebas Neue',sans-serif;font-size:17px;letter-spacing:3px;background:var(--c1);color:#000;border:none;cursor:pointer;transition:all .2s;flex-shrink:0;border-left:1px solid var(--rule);}
        .tb-run:hover{filter:brightness(1.1);}
        .tb-run:disabled{background:var(--bg3);color:var(--c7);border-left-color:var(--c7);animation:none;cursor:not-allowed;}
        .tb-run-inner{display:flex;align-items:center;gap:8px;}
        .spin{display:inline-block;animation:spin .8s linear infinite;}

        /* ── LEFT PANEL */
        .left{border-right:1px solid var(--rule);overflow:hidden;display:flex;flex-direction:column;background:var(--bg2);}
        .left-hd{padding:10px 14px;border-bottom:1px solid var(--rule);flex-shrink:0;display:flex;flex-direction:column;gap:8px;}
        .left-title-row{display:flex;align-items:center;justify-content:space-between;}
        .left-lbl{font-family:'DM Mono',monospace;font-size:8px;letter-spacing:3px;text-transform:uppercase;color:var(--dim2);}
        .left-ct{font-family:'Bebas Neue',sans-serif;font-size:24px;letter-spacing:2px;animation:colorShift 7s linear infinite;}
        .left-search{background:var(--bg3);border:1px solid var(--rule);color:var(--wht);padding:6px 10px;border-radius:3px;font-family:'DM Mono',monospace;font-size:9px;width:100%;outline:none;letter-spacing:1px;}
        .left-filters{display:flex;gap:4px;}
        .left-filter{font-family:'DM Mono',monospace;font-size:7px;letter-spacing:2px;text-transform:uppercase;padding:3px 9px;background:none;border:1px solid var(--rule);color:var(--dim2);cursor:pointer;border-radius:2px;transition:all .15s;}
        .left-filter.on{background:var(--wht);color:#000;border-color:var(--wht);}
        .left-list{flex:1;overflow-y:auto;scrollbar-width:none;}
        .left-list::-webkit-scrollbar{display:none;}
        .left-empty{padding:24px 14px;font-family:'DM Mono',monospace;font-size:8px;letter-spacing:2px;text-transform:uppercase;color:var(--dim);text-align:center;line-height:2;}

        /* ── WAVE SELECTOR */
        .wave-sel{padding:10px 14px;border-top:1px solid var(--rule);flex-shrink:0;}
        .wave-sel-lbl{font-family:'DM Mono',monospace;font-size:7px;letter-spacing:3px;text-transform:uppercase;color:var(--dim2);margin-bottom:7px;}
        .wave-pills{display:flex;flex-wrap:wrap;gap:4px;}
        .wave-pill{font-family:'DM Mono',monospace;font-size:7px;letter-spacing:1px;padding:3px 9px;border:1px solid var(--rule);border-radius:20px;cursor:pointer;transition:all .15s;background:none;color:var(--dim2);}
        .wave-pill.on{color:#000;border-color:transparent;}

        /* ── CARD in left list */
        .card{padding:10px 14px;border-bottom:1px solid var(--rule);cursor:pointer;transition:background .12s;border-left:3px solid transparent;animation:fadeUp .25s ease both;}
        .card:hover{background:var(--bg3);}
        .card.active{background:var(--bg3);}
        .card-row1{display:flex;align-items:center;gap:7px;margin-bottom:3px;}
        .card-dot{width:7px;height:7px;border-radius:50%;flex-shrink:0;}
        .card-name{font-family:'Bebas Neue',sans-serif;font-size:15px;letter-spacing:2px;flex:1;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
        .card-r{font-family:'DM Mono',monospace;font-size:8px;padding:2px 6px;color:#000;font-weight:700;flex-shrink:0;border-radius:2px;}
        .card-sub{font-family:'DM Mono',monospace;font-size:7px;letter-spacing:1px;color:var(--dim2);text-transform:uppercase;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;margin-bottom:2px;}
        .card-loc{font-family:'Syne',sans-serif;font-size:9px;color:rgba(255,255,255,.2);margin-bottom:6px;}
        .card-foot{display:flex;align-items:center;gap:6px;}
        .card-status{font-family:'DM Mono',monospace;font-size:7px;letter-spacing:1px;text-transform:uppercase;padding:2px 7px;border-radius:2px;}
        .card-btns{margin-left:auto;display:flex;gap:3px;}
        .card-btn{font-family:'DM Mono',monospace;font-size:7px;letter-spacing:1px;text-transform:uppercase;padding:3px 9px;border:none;cursor:pointer;border-radius:2px;transition:all .15s;}
        .card-btn.p{background:var(--c3);color:#000;}
        .card-btn.s{background:var(--bg4);color:var(--dim2);border:1px solid var(--rule);}

        /* ── CENTER */
        .center{overflow-y:auto;scrollbar-width:none;background:var(--bg);}
        .center::-webkit-scrollbar{display:none;}

        /* ── IDLE screen */
        .idle{display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;gap:16px;padding:40px;text-align:center;}
        .idle-logo{font-family:'Bebas Neue',sans-serif;font-size:56px;letter-spacing:12px;animation:colorShift 7s linear infinite;}
        .idle-h{font-family:'Bebas Neue',sans-serif;font-size:20px;letter-spacing:5px;color:rgba(255,255,255,.5);}
        .idle-p{font-family:'Syne',sans-serif;font-size:11px;color:var(--dim2);max-width:280px;line-height:1.8;}
        .idle-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px;width:100%;max-width:320px;}
        .idle-step{background:var(--bg3);border:1px solid var(--rule);border-radius:4px;padding:12px;text-align:left;}
        .idle-n{font-family:'Bebas Neue',sans-serif;font-size:22px;letter-spacing:2px;animation:colorShift 7s linear infinite;}
        .idle-t{font-family:'DM Mono',monospace;font-size:8px;letter-spacing:1px;color:var(--dim2);line-height:1.6;margin-top:3px;}

        /* ── EDIT PANEL */
        .edit-panel{padding:18px;padding-bottom:40px;}
        .ep-section{margin-bottom:14px;}
        .ep-label{font-family:'DM Mono',monospace;font-size:7px;letter-spacing:3px;text-transform:uppercase;color:var(--dim2);margin-bottom:6px;display:flex;align-items:center;gap:8px;}
        .ep-label::after{content:'';flex:1;height:1px;background:var(--rule);}
        .ep-hint{font-size:7px;letter-spacing:1px;color:var(--dim);text-transform:lowercase;margin-left:2px;}
        .ep-input{width:100%;background:var(--bg3);border:1px solid var(--rule);color:var(--wht);padding:8px 10px;font-family:'Syne',sans-serif;font-size:12px;border-radius:3px;outline:none;transition:border-color .2s;}
        .ep-input:focus{border-color:rgba(255,255,255,.2);}
        .ep-name{font-family:'Bebas Neue',sans-serif;font-size:36px;letter-spacing:4px;padding:4px 0;background:transparent;border:none;border-bottom:1px solid var(--rule);border-radius:0;}
        .ep-sub{font-family:'DM Mono',monospace;font-size:9px;letter-spacing:2px;text-transform:uppercase;}
        .ep-ta{width:100%;background:var(--bg3);border:1px solid var(--rule);color:rgba(255,255,255,.65);padding:10px;font-family:'Playfair Display',serif;font-size:12px;font-style:italic;border-radius:3px;outline:none;resize:vertical;line-height:1.75;transition:border-color .2s;}
        .ep-ta:focus{border-color:rgba(255,255,255,.2);}
        .ep-ta-sm{min-height:60px;font-size:13px;}
        .ep-row{display:flex;gap:7px;}
        .ep-sel{background:var(--bg3);border:1px solid var(--rule);color:var(--wht);padding:7px 9px;font-family:'DM Mono',monospace;font-size:8px;letter-spacing:1px;border-radius:3px;outline:none;cursor:pointer;flex:1;}
        .ep-img{width:100%;height:180px;object-fit:cover;border-radius:4px;cursor:pointer;border:1px solid var(--rule);transition:opacity .2s;display:block;}
        .ep-img:hover{opacity:.75;}
        .ep-img-empty{width:100%;height:120px;border:1px dashed var(--rule);border-radius:4px;display:flex;align-items:center;justify-content:center;cursor:pointer;font-family:'DM Mono',monospace;font-size:9px;letter-spacing:3px;text-transform:uppercase;color:var(--dim2);transition:all .2s;}
        .ep-img-empty:hover{border-color:var(--wht);color:var(--wht);}
        .ep-color-row{display:flex;align-items:center;gap:7px;flex-wrap:wrap;}
        .ep-swatch{width:26px;height:26px;border-radius:50%;cursor:pointer;border:2px solid transparent;transition:all .15s;flex-shrink:0;}
        .ep-swatch:hover,.ep-swatch.on{border-color:#fff;transform:scale(1.18);}
        .ep-hex-wrap{flex:1;}
        .ep-hex{width:100%;background:var(--bg3);border:1px solid;padding:5px 9px;font-family:'DM Mono',monospace;font-size:9px;letter-spacing:2px;border-radius:3px;outline:none;}
        .ep-actions{display:flex;gap:8px;margin-top:18px;padding-top:14px;border-top:1px solid var(--rule);}
        .ep-btn{flex:1;padding:11px;border:none;border-radius:3px;font-family:'DM Mono',monospace;font-size:8px;letter-spacing:2px;text-transform:uppercase;cursor:pointer;font-weight:700;transition:all .2s;}
        .ep-pub{color:#000;}
        .ep-pub:hover{filter:brightness(1.1);transform:scale(1.02);}
        .ep-skip{background:var(--bg3);color:var(--dim2);border:1px solid var(--rule);}
        .ep-skip:hover{border-color:var(--c4);color:var(--c4);}
        .ep-del{background:rgba(255,45,45,.1);color:#FF4444;border:1px solid rgba(255,45,45,.2);}
        .ep-del:hover{background:rgba(255,45,45,.2);}
        .ep-live{padding:10px 14px;background:rgba(124,255,80,.06);border:1px solid rgba(124,255,80,.2);border-radius:3px;font-family:'DM Mono',monospace;font-size:8px;letter-spacing:2px;text-transform:uppercase;color:var(--c3);text-align:center;}
        .ep-confirm{margin-top:10px;padding:12px;background:rgba(255,45,45,.06);border:1px solid rgba(255,45,45,.15);border-radius:4px;}
        .ep-confirm-txt{font-family:'DM Mono',monospace;font-size:8px;letter-spacing:2px;text-transform:uppercase;color:#FF4444;margin-bottom:4px;}

        /* ── IMAGE PICKER */
        .picker-over{position:fixed;inset:0;z-index:300;background:rgba(0,0,0,.9);backdrop-filter:blur(20px);display:flex;align-items:center;justify-content:center;padding:20px;}
        .picker-box{background:var(--bg2);border:1px solid var(--rule);border-radius:8px;width:100%;max-width:680px;max-height:82vh;display:flex;flex-direction:column;}
        .picker-hd{display:flex;align-items:center;gap:12px;padding:12px 16px;border-bottom:1px solid var(--rule);flex-shrink:0;}
        .picker-title{font-family:'Bebas Neue',sans-serif;font-size:18px;letter-spacing:4px;animation:colorShift 7s linear infinite;flex:1;}
        .picker-close{background:none;border:none;color:var(--dim2);font-size:16px;cursor:pointer;padding:4px;}
        .picker-grid{display:grid;grid-template-columns:repeat(5,1fr);gap:5px;padding:12px;overflow-y:auto;scrollbar-width:thin;}
        .picker-img{width:100%;aspect-ratio:1;object-fit:cover;border-radius:3px;cursor:pointer;border:2px solid transparent;transition:all .15s;}
        .picker-img:hover{border-color:#fff;transform:scale(1.04);}
        .picker-url-row{display:flex;gap:7px;padding:10px 12px;border-top:1px solid var(--rule);flex-shrink:0;}
        .picker-url-in{flex:1;background:var(--bg3);border:1px solid var(--rule);color:var(--wht);padding:7px 11px;border-radius:3px;font-family:'DM Mono',monospace;font-size:8px;letter-spacing:1px;outline:none;}
        .picker-url-btn{background:var(--c2);color:#000;border:none;padding:7px 14px;border-radius:3px;font-family:'DM Mono',monospace;font-size:8px;letter-spacing:1px;cursor:pointer;font-weight:700;}

        /* ── RIGHT PANEL */
        .right{border-left:1px solid var(--rule);display:flex;flex-direction:column;background:var(--bg2);overflow:hidden;}
        .r-tabs{display:flex;border-bottom:1px solid var(--rule);flex-shrink:0;}
        .r-tab{flex:1;padding:10px 8px;font-family:'DM Mono',monospace;font-size:7px;letter-spacing:2px;text-transform:uppercase;background:none;border:none;color:var(--dim2);cursor:pointer;border-bottom:2px solid transparent;transition:all .2s;}
        .r-tab.on{color:var(--wht);border-bottom-color:currentColor;}
        .r-body{flex:1;overflow-y:auto;scrollbar-width:none;padding:12px;}
        .r-body::-webkit-scrollbar{display:none;}
        .ig-btns{display:flex;gap:7px;margin:9px 0;}
        .ig-btn{flex:1;padding:9px;border:none;border-radius:3px;font-family:'DM Mono',monospace;font-size:7px;letter-spacing:2px;text-transform:uppercase;cursor:pointer;font-weight:700;transition:all .15s;}
        .ig-btn:hover{transform:scale(1.03);}
        .ig-dl{background:var(--c2);color:#000;}
        .ig-cp{background:var(--bg3);border:1px solid var(--rule);color:var(--dim2);}
        .ig-caption{background:var(--bg3);border:1px solid var(--rule);border-radius:3px;padding:9px;font-family:'DM Mono',monospace;font-size:7px;line-height:1.9;color:rgba(255,255,255,.35);white-space:pre-wrap;max-height:200px;overflow-y:auto;}
        .save-banner{margin-bottom:8px;padding:8px 10px;border-radius:3px;font-family:'DM Mono',monospace;font-size:8px;letter-spacing:2px;text-transform:uppercase;text-align:center;background:rgba(124,255,80,.07);border:1px solid rgba(124,255,80,.2);color:var(--c3);}

        /* ── LOG */
        .log-entry{display:flex;gap:7px;padding:5px 0;border-bottom:1px solid rgba(255,255,255,.02);animation:fadeUp .15s ease both;}
        .log-t{font-family:'DM Mono',monospace;font-size:6px;color:rgba(255,255,255,.12);flex-shrink:0;padding-top:2px;width:52px;}
        .log-m{font-family:'DM Mono',monospace;font-size:8px;line-height:1.5;flex:1;}
        .log-m.info{color:rgba(255,255,255,.28);}
        .log-m.success{color:var(--c3);}
        .log-m.error{color:var(--c4);}
        .log-m.warn{color:var(--c7);}
        .log-m.system{color:var(--c2);}
        .log-m.brand{color:var(--c1);}
      `}</style>

      <div className="layout">

        {/* ── TOPBAR */}
        <div className="tb">
          <div className="tb-logo">ÜNDER</div>
          <div className="tb-modes">
            {[
              ["discover","◈","Discovery"],
              ["create","＋","Create"],
              ["db","◎","Database"],
            ].map(([m,icon,lbl])=>(
              <button key={m} className={`tb-mode${mode===m?" on":""}`} onClick={()=>{setMode(m);setEditing(m==="create"?{...BLANK}:null);setSelected(null);}}>
                <span className="tb-mode-icon">{icon}</span>{lbl}
              </button>
            ))}
          </div>
          <div className="tb-spacer"/>
          {mode==="db"&&<div className="tb-stat">DB: <b style={{animation:"colorShift 7s linear infinite"}}>{dbRecords.length}</b> entries</div>}
          {publishedCount>0&&<div className="tb-stat">Session: <b style={{color:"var(--c3)"}}>{publishedCount}</b> published</div>}
          {saveMsg&&<div className="tb-stat" style={{color:"var(--c3)"}}>{saveMsg}</div>}
          {mode==="discover"&&(
            <button className="tb-run" onClick={runSearch} disabled={phase==="searching"}>
              <span className="tb-run-inner">
                {phase==="searching"?<><span className="spin">◌</span>Scanning…</>:"▶ Run Discovery"}
              </span>
            </button>
          )}
        </div>

        {/* ── LEFT */}
        <div className="left">
          <div className="left-hd">
            <div className="left-title-row">
              <div className="left-lbl">{mode==="discover"?"Candidates":mode==="db"?"Live Database":"New Entry"}</div>
              <div className="left-ct">{leftItems.length||""}</div>
            </div>
            {(mode==="db"||mode==="discover")&&(
              <input className="left-search" placeholder="Search…" value={dbSearch} onChange={e=>setDbSearch(e.target.value)} />
            )}
            {mode==="db"&&(
              <div className="left-filters">
                {["All","Fashion","Art"].map(f=>(
                  <button key={f} className={`left-filter${dbFilter===f?" on":""}`} onClick={()=>setDbFilter(f)}>{f}</button>
                ))}
              </div>
            )}
          </div>

          <div className="left-list">
            {leftItems.length===0&&(
              <div className="left-empty">
                {mode==="discover"?"Run discovery\nto find brands":mode==="db"?"Loading database…":"Fill in the form\nto add a new entry"}
              </div>
            )}
            {leftItems.map((b,i)=>(
              <div key={b.id||i} className={`card${selected===b||(mode==="db"&&editing?.id===b.id)?" active":""}`}
                style={{borderLeftColor:(selected===b||(mode==="db"&&editing?.id===b.id))?b.color:"transparent",animationDelay:`${i*.03}s`}}
                onClick={()=>{setSelected(b);setEditing({...b});}}>
                <div className="card-row1">
                  <div className="card-dot" style={{background:b.color||"#666"}}/>
                  <div className="card-name">{b.name}</div>
                  <div className="card-r" style={{background:b.color||"#666"}}>{b.r||b.rarity}</div>
                </div>
                <div className="card-sub">{b.sub}</div>
                <div className="card-loc">{b.city} · {b.ctry||b.country} · {b.cat}</div>
                {mode==="discover"&&(
                  <div className="card-foot">
                    <div className="card-status" style={{background:(statusColor(b._status)+"22"),color:statusColor(b._status),border:`1px solid ${statusColor(b._status)}33`}}>
                      {statusIcon(b._status)} {b._status}
                    </div>
                    {b._status==="pending"&&(
                      <div className="card-btns" onClick={e=>e.stopPropagation()}>
                        <button className="card-btn p" onClick={()=>{setSelected(b);setEditing({...b});setTimeout(()=>publishFind(),50);}}>✓</button>
                        <button className="card-btn s" onClick={()=>{setSelected(b);setEditing({...b});setTimeout(()=>skipFind(),50);}}>✗</button>
                      </div>
                    )}
                  </div>
                )}
                {mode==="db"&&(
                  <div className="card-foot">
                    <div className="card-status" style={{background:"rgba(255,255,255,.04)",color:"var(--dim2)",border:"1px solid var(--rule)"}}>
                      ◎ {b.cat}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Wave selector — only in discover mode */}
          {mode==="discover"&&(
            <div className="wave-sel">
              <div className="wave-sel-lbl">Active Waves</div>
              <div className="wave-pills">
                {WAVES.map(w=>(
                  <button key={w.id} className={`wave-pill${selectedWaves.includes(w.id)?" on":""}`}
                    style={selectedWaves.includes(w.id)?{background:w.color,borderColor:w.color}:{}}
                    onClick={()=>setSelectedWaves(s=>s.includes(w.id)?s.filter(x=>x!==w.id):[...s,w.id])}>
                    {w.icon} {w.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ── CENTER */}
        <div className="center">
          {mode==="discover"&&!editing&&(
            <div className="idle">
              <div className="idle-logo">ÜNDER</div>
              <div className="idle-h">Discovery Engine v3</div>
              <div className="idle-p">Web-search powered brand & artist intelligence. Select your waves, then run.</div>
              <div className="idle-grid">
                {WAVES.map(w=>(
                  <div key={w.id} className="idle-step">
                    <div className="idle-n" style={{color:w.color}}>{w.icon}</div>
                    <div className="idle-t"><b style={{color:w.color}}>{w.label}</b><br/>{w.desc}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
          {(editing||(mode==="create"))&&(
            <EditPanel
              editing={mode==="create"&&!editing?{...BLANK}:editing}
              onChange={updateEditing}
              onPublish={mode==="create"?createNew:publishFind}
              onUpdate={saveDbEdit}
              onDelete={deleteDbEntry}
              onSkip={skipFind}
              mode={mode==="discover"?mode:mode}
            />
          )}
        </div>

        {/* ── RIGHT */}
        <div className="right">
          <div className="r-tabs">
            {[["instagram","◈ Card"],["log","◎ Log"]].map(([t,lbl])=>(
              <button key={t} className={`r-tab${rightTab===t?" on":""}`} onClick={()=>setRightTab(t)}>{lbl}</button>
            ))}
          </div>
          <div className="r-body" ref={t=>{if(rightTab==="log")logRef.current=t;}}>
            {rightTab==="instagram"?(
              editing?(
                <>
                  {saveMsg&&<div className="save-banner">{saveMsg}</div>}
                  <InstagramCanvas brand={editing}/>
                  <div className="ig-btns">
                    <button className="ig-btn ig-dl" onClick={()=>{
                      const c=document.querySelector("canvas");if(!c)return;
                      const a=document.createElement("a");a.download=`under-${(editing.name||"brand").toLowerCase().replace(/\s/g,"-")}.png`;a.href=c.toDataURL("image/png");a.click();
                    }}>↓ PNG</button>
                    <button className="ig-btn ig-cp" onClick={()=>{
                      navigator.clipboard.writeText(generateCaption(editing));
                      setCopied(true);setTimeout(()=>setCopied(false),2000);
                    }}>{copied?"✓ Copied":"⎘ Caption"}</button>
                  </div>
                  <div className="ig-caption">{generateCaption(editing)}</div>
                </>
              ):(
                <div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",height:"100%",gap:10,opacity:.2}}>
                  <div style={{fontSize:36}}>◎</div>
                  <div style={{fontFamily:"'DM Mono',monospace",fontSize:8,letterSpacing:3,textTransform:"uppercase"}}>Select a find</div>
                </div>
              )
            ):(
              <div>
                {log.length===0&&<div style={{fontFamily:"'DM Mono',monospace",fontSize:8,letterSpacing:2,textTransform:"uppercase",color:"var(--dim)",textAlign:"center",paddingTop:20}}>Log empty</div>}
                {log.map((l,i)=>(
                  <div key={i} className="log-entry">
                    <div className="log-t">{l.t}</div>
                    <div className={`log-m ${l.type}`}>{l.msg}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
    </>
  );
}
