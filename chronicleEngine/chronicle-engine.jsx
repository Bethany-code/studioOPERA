import { useState, useEffect, useRef } from "react";

const SAMPLE = `480 BC. You are Leonidas I, King of Sparta. Xerxes of Persia commands a vast host and has swept through northern Greece. City-states have surrendered or fallen silent. Athens itself lies evacuated.

You stand at Thermopylae — the Hot Gates — with 300 Spartans, 700 Thespians, and several thousand Greek allies. For two days you have held the narrow coastal pass against the Persian tide. But tonight, a treacherous shepherd named Ephialtes has revealed to Xerxes a hidden mountain path — the Anopaia trail — that will let Persian soldiers encircle your position by dawn.

Your seer Megistias has read the omens: the Spartans will die here. A breathless runner arrives from Admiral Themistocles at Artemisium — the Athenian fleet cannot hold without more time. A Persian envoy waits at your tent bearing Xerxes' terms: lay down your arms and rule Greece as satrap under the god-king. Your Spartan brothers look to you. The Phocian guards on the mountain trail have already fled.`;

const PARSE_SYS = `You are a History-to-Game Engine. Transform historical narratives into structured game data.
Return ONLY a valid JSON object. No markdown fences, no explanation, no preamble. Start with { and end with }.

{
  "title": "Epic 5-7 word game title",
  "era": "Historical period and year",
  "protagonist": { "id": "player", "name": "Player historical role", "faction": "Faction", "influence": 70, "resources": 65 },
  "actors": [
    { "id": "a1", "name": "Name", "faction": "Faction", "influence": 60, "resources": 50, "role": "ally" }
  ],
  "opening": {
    "id": "s1",
    "title": "Scene title in 3-5 words",
    "narrative": "Three immersive paragraphs in second person. Epic, historically grounded, emotionally charged. Ground the player in time, place, high stakes. Vivid sensory detail. End on the precipice of a fateful decision.",
    "choices": [
      { "id": "a", "text": "Action phrase max 8 words", "historical": true, "effects": { "accuracy": 10, "influence": 5, "resources": -10 }, "preview": "One sentence consequence hint." },
      { "id": "b", "text": "Action phrase max 8 words", "historical": false, "effects": { "accuracy": -15, "influence": 15, "resources": 5 }, "preview": "One sentence consequence hint." },
      { "id": "c", "text": "Action phrase max 8 words", "historical": false, "effects": { "accuracy": -5, "influence": -10, "resources": 20 }, "preview": "One sentence consequence hint." }
    ]
  }
}

Rules: exactly 3-4 choices; at least one historical: true; each choice has real strategic tradeoffs. Make it epic.`;

const CONTINUE_SYS = `You are a History-to-Game Engine generating the next scene in an interactive historical narrative.
Return ONLY valid JSON. No markdown fences, no preamble. Start with { and end with }.

Normal scene:
{
  "id": "sN",
  "title": "Scene title 3-5 words",
  "narrative": "Three paragraphs in second person. Show direct, visceral consequences of the previous choice. Reference earlier decisions. Escalate tension. Epic, immersive.",
  "isEnding": false,
  "choices": [
    { "id": "a", "text": "Action max 8 words", "historical": true, "effects": { "accuracy": 10, "influence": 5, "resources": -10 }, "preview": "Consequence hint." }
  ]
}

Ending scene — use when 5+ total choices have been made:
{
  "id": "s_end",
  "title": "Final scene title",
  "narrative": "Two paragraphs — the climactic moment, deeply consequential, historically resonant.",
  "isEnding": true,
  "endingType": "victory OR defeat OR historical OR divergent",
  "endingSummary": "Two paragraphs epilogue — how history unfolds from this moment, what legacy the player leaves. Reference their key decisions. Poetic and resonant."
}

For endings, no choices array. endingType: victory=succeeded on own terms, defeat=failure, historical=followed the real path, divergent=rewrote history.`;

export default function ChronicleEngine() {
  const [phase, setPhase] = useState("input");
  const [inputText, setInputText] = useState("");
  const [gameData, setGameData] = useState(null);
  const [currentNode, setCurrentNode] = useState(null);
  const [choiceHistory, setChoiceHistory] = useState([]);
  const [accuracy, setAccuracy] = useState(100);
  const [protagonist, setProtagonist] = useState(null);
  const [actors, setActors] = useState([]);
  const [displayText, setDisplayText] = useState("");
  const [endingText, setEndingText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [choicesVisible, setChoicesVisible] = useState(false);
  const [error, setError] = useState(null);
  const typeRef = useRef(null);

  // Typewriter — narrative
  useEffect(() => {
    if (phase !== "playing" || !currentNode?.narrative) return;
    setDisplayText("");
    setChoicesVisible(false);
    setIsTyping(true);
    let i = 0;
    const text = currentNode.narrative;
    clearInterval(typeRef.current);
    typeRef.current = setInterval(() => {
      i++;
      setDisplayText(text.slice(0, i));
      if (i >= text.length) {
        clearInterval(typeRef.current);
        setIsTyping(false);
        setTimeout(() => setChoicesVisible(true), 500);
      }
    }, 19);
    return () => clearInterval(typeRef.current);
  }, [currentNode?.id, phase]);

  // Typewriter — ending
  useEffect(() => {
    if (phase !== "ending" || !currentNode) return;
    const full = [currentNode.narrative, currentNode.endingSummary]
      .filter(Boolean)
      .join("\n\n");
    setEndingText("");
    let i = 0;
    clearInterval(typeRef.current);
    typeRef.current = setInterval(() => {
      i++;
      setEndingText(full.slice(0, i));
      if (i >= full.length) clearInterval(typeRef.current);
    }, 22);
    return () => clearInterval(typeRef.current);
  }, [phase]);

  async function callClaude(system, msg) {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1000,
        system,
        messages: [{ role: "user", content: msg }],
      }),
    });
    const data = await res.json();
    const raw = data.content?.find((b) => b.type === "text")?.text ?? "";
    const clean = raw
      .replace(/^```(?:json)?\s*/m, "")
      .replace(/\s*```\s*$/m, "")
      .trim();
    return JSON.parse(clean);
  }

  async function startGame() {
    if (!inputText.trim()) return;
    setPhase("parsing");
    setError(null);
    try {
      const r = await callClaude(
        PARSE_SYS,
        `Create a game from this historical narrative:\n\n${inputText.trim()}`
      );
      setGameData(r);
      setProtagonist(r.protagonist);
      setActors(r.actors || []);
      setCurrentNode(r.opening);
      setAccuracy(100);
      setChoiceHistory([]);
      setPhase("playing");
    } catch (e) {
      console.error(e);
      setError("Parsing failed — try a more detailed historical narrative.");
      setPhase("input");
    }
  }

  async function makeChoice(choice) {
    if (phase !== "playing") return;
    const newAcc = Math.max(0, Math.min(100, accuracy + (choice.effects?.accuracy ?? 0)));
    const newInf = protagonist
      ? Math.max(0, Math.min(100, protagonist.influence + (choice.effects?.influence ?? 0)))
      : 50;
    const newRes = protagonist
      ? Math.max(0, Math.min(100, protagonist.resources + (choice.effects?.resources ?? 0)))
      : 50;
    setAccuracy(newAcc);
    setProtagonist((p) => (p ? { ...p, influence: newInf, resources: newRes } : p));
    const hist = [
      ...choiceHistory,
      { title: currentNode.title, choice: choice.text, historical: choice.historical },
    ];
    setChoiceHistory(hist);
    setPhase("generating");
    try {
      const ctx = `Game: "${gameData?.title}" (${gameData?.era})
Protagonist: ${protagonist?.name}, ${protagonist?.faction}
Total choices this playthrough: ${hist.length}
Decision log: ${hist.map((h, i) => `${i + 1}.[${h.historical ? "HIST" : "ALT"}] "${h.choice}"`).join(" → ")}
Historical accuracy: ${newAcc}%  |  Influence: ${newInf}  |  Resources: ${newRes}
Previous scene: "${currentNode.title}"
Player chose: "${choice.text}" — ${choice.preview ?? ""}`;
      const next = await callClaude(CONTINUE_SYS, ctx);
      setCurrentNode(next);
      setPhase(next.isEnding ? "ending" : "playing");
    } catch (e) {
      console.error(e);
      setError("Scene generation failed — please try again.");
      setPhase("playing");
    }
  }

  function skipTyping() {
    if (!isTyping || !currentNode) return;
    clearInterval(typeRef.current);
    setDisplayText(currentNode.narrative);
    setIsTyping(false);
    setTimeout(() => setChoicesVisible(true), 200);
  }

  function reset() {
    clearInterval(typeRef.current);
    setPhase("input");
    setGameData(null);
    setCurrentNode(null);
    setChoiceHistory([]);
    setAccuracy(100);
    setProtagonist(null);
    setActors([]);
    setError(null);
    setDisplayText("");
    setEndingText("");
  }

  const accColor =
    accuracy >= 70 ? "#5aaa4a" : accuracy >= 40 ? "#c9a227" : "#d94040";

  function Paras({ text, style = {} }) {
    return text
      .split(/\n\n+/)
      .filter(Boolean)
      .map((p, i) => (
        <p key={i} style={{ marginBottom: "1.4em", ...style }}>
          {p}
        </p>
      ));
  }

  const BADGES = ["I", "II", "III", "IV", "V"];

  const css = `
    @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,600&family=Courier+Prime:wght@400;700&display=swap');
    *{box-sizing:border-box;margin:0;padding:0;}
    html,body{background:#07050303;min-height:100%;}
    
    :root {
      --bg:#07050302;--s1:#0d0a05;--s2:#110e06;--s3:#161109;
      --text:#e0c882;--dim:#7a6638;--faint:#3a2a10;
      --gold:#c9a227;--gold2:#f0c843;
      --border:#251c08;--border2:#2e2310;
      --red:#c44040;--green:#4ca040;
    }

    .hg{min-height:100vh;background:var(--bg);color:var(--text);font-family:'Cormorant Garamond',Georgia,serif;position:relative;}
    .hg::before{content:'';position:fixed;inset:0;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23n)' opacity='0.035'/%3E%3C/svg%3E");pointer-events:none;z-index:0;opacity:1;}
    .hg>*{position:relative;z-index:1;}

    /* ───── INPUT ───── */
    .inp{max-width:680px;margin:0 auto;padding:72px 24px;display:flex;flex-direction:column;align-items:center;gap:30px;}
    .inp-logo{text-align:center;}
    .inp-logo-title{font-family:'Cinzel',serif;font-size:clamp(32px,7vw,58px);font-weight:700;color:var(--gold);letter-spacing:.05em;line-height:1.1;text-shadow:0 0 60px rgba(201,162,39,.45);}
    .inp-logo-sub{font-family:'Cinzel',serif;font-size:11px;color:#4a3818;letter-spacing:.28em;text-transform:uppercase;margin-top:10px;}
    .inp-rule{width:100%;height:1px;background:linear-gradient(90deg,transparent,var(--border2),transparent);position:relative;}
    .inp-rule::before{content:'✦';position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);background:var(--bg);padding:0 14px;color:#3a2a10;font-size:13px;}
    .inp-ta{width:100%;min-height:210px;background:var(--s2);border:1px solid var(--border);border-top:2px solid #5a4010;color:var(--text);font-family:'Cormorant Garamond',serif;font-size:17px;line-height:1.75;padding:20px;resize:vertical;outline:none;transition:border-color .2s,box-shadow .2s;}
    .inp-ta:focus{border-color:var(--gold);box-shadow:0 0 28px rgba(201,162,39,.1);}
    .inp-ta::placeholder{color:#2e1e08;font-style:italic;}
    .inp-row{display:flex;gap:10px;width:100%;}
    .btn{font-family:'Cinzel',serif;letter-spacing:.12em;font-size:12px;text-transform:uppercase;padding:13px 22px;cursor:pointer;border:none;transition:all .2s;font-weight:600;}
    .btn-gold{background:var(--gold);color:#07050302;flex:1;}
    .btn-gold:hover:not(:disabled){background:var(--gold2);box-shadow:0 4px 28px rgba(201,162,39,.4);transform:translateY(-1px);}
    .btn-gold:disabled{opacity:.35;cursor:not-allowed;}
    .btn-ghost{background:transparent;color:var(--dim);border:1px solid var(--border);}
    .btn-ghost:hover{color:var(--gold);border-color:var(--gold);}
    .inp-hint{font-family:'Courier Prime',monospace;font-size:12px;color:#2e1e08;text-align:center;line-height:1.65;}
    .err{color:#d06060;font-family:'Courier Prime',monospace;font-size:13px;padding:10px 16px;border:1px solid #4a1a1a;background:rgba(120,20,20,.12);width:100%;text-align:center;}

    /* ───── PARSE LOADING ───── */
    .load{display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:100vh;gap:22px;}
    .load-title{font-family:'Cinzel',serif;font-size:19px;color:var(--gold);letter-spacing:.16em;}
    .load-sub{color:var(--dim);font-size:16px;font-style:italic;}
    .spinner{width:50px;height:50px;border:2px solid var(--border2);border-top-color:var(--gold);border-radius:50%;animation:spin 1.1s linear infinite;}
    @keyframes spin{to{transform:rotate(360deg);}}
    .dots{display:flex;gap:7px;}
    .dots span{width:7px;height:7px;background:var(--gold);border-radius:50%;animation:bub 1.4s ease-in-out infinite;}
    .dots span:nth-child(2){animation-delay:.2s;}
    .dots span:nth-child(3){animation-delay:.4s;}
    @keyframes bub{0%,80%,100%{opacity:.2;transform:scale(.7);}40%{opacity:1;transform:scale(1);}}

    /* ───── TOPBAR ───── */
    .topbar{background:var(--s1);border-bottom:1px solid var(--border);padding:10px 20px;display:flex;align-items:center;gap:14px;position:sticky;top:0;z-index:50;}
    .topbar-title{font-family:'Cinzel',serif;font-size:14px;color:var(--gold);flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;letter-spacing:.06em;}
    .acc-grp{display:flex;align-items:center;gap:8px;flex-shrink:0;}
    .acc-lbl{font-family:'Courier Prime',monospace;font-size:10px;color:#4a3818;letter-spacing:.12em;text-transform:uppercase;}
    .acc-track{width:96px;height:5px;background:var(--border2);position:relative;}
    .acc-fill{height:100%;transition:width .5s,background .5s;}
    .acc-pct{font-family:'Courier Prime',monospace;font-size:12px;min-width:32px;text-align:right;}
    .btn-exit{background:none;border:1px solid var(--border);color:var(--faint);font-family:'Cinzel',serif;font-size:10px;padding:5px 10px;cursor:pointer;letter-spacing:.1em;transition:all .2s;}
    .btn-exit:hover{border-color:var(--gold);color:var(--gold);}

    /* ───── GAME BODY ───── */
    .game{display:flex;flex-direction:column;min-height:100vh;}
    .body{display:flex;flex:1;}
    
    .sidebar{width:224px;flex-shrink:0;background:var(--s1);border-right:1px solid var(--border);padding:20px 14px;display:flex;flex-direction:column;gap:0;overflow-y:auto;}
    @media(max-width:680px){.sidebar{display:none;}}
    .sid-sec{margin-bottom:22px;}
    .sid-lbl{font-family:'Cinzel',serif;font-size:9px;color:#3a2a10;letter-spacing:.28em;text-transform:uppercase;border-bottom:1px solid var(--border);padding-bottom:5px;margin-bottom:11px;}
    .actor{margin-bottom:14px;}
    .actor-name{font-family:'Cinzel',serif;font-size:11px;color:#d4ba78;font-weight:600;}
    .actor-fac{font-size:11px;color:#3a2a10;font-style:italic;margin:2px 0 7px;}
    .srow{display:flex;align-items:center;gap:6px;margin-bottom:4px;}
    .skey{font-family:'Courier Prime',monospace;font-size:9px;color:#3a2a10;width:20px;text-transform:uppercase;}
    .sbar{flex:1;height:3px;background:var(--border);}
    .sfill{height:100%;transition:width .45s;}
    .sval{font-family:'Courier Prime',monospace;font-size:9px;color:var(--faint);width:22px;text-align:right;}
    .sid-era{font-family:'Courier Prime',monospace;font-size:10px;color:#3a2a10;line-height:1.55;margin-top:auto;}

    .main{flex:1;padding:28px 32px;max-width:760px;}
    @media(max-width:680px){.main{padding:20px 16px;}}
    .scene-num{font-family:'Courier Prime',monospace;font-size:10px;color:#3a2a10;letter-spacing:.22em;text-transform:uppercase;margin-bottom:6px;}
    .scene-title{font-family:'Cinzel',serif;font-size:clamp(18px,2.8vw,26px);color:var(--gold);font-weight:600;margin-bottom:24px;line-height:1.3;letter-spacing:.04em;}
    .narr{font-size:18px;line-height:1.85;color:#ddc87e;font-style:italic;cursor:pointer;min-height:100px;}
    .narr p{margin-bottom:1.35em;}
    .cursor{display:inline-block;width:2px;height:1.1em;background:var(--gold);animation:blink .75s step-end infinite;vertical-align:text-bottom;margin-left:2px;}
    @keyframes blink{50%{opacity:0;}}
    .skip-hint{font-family:'Courier Prime',monospace;font-size:10px;color:#251a08;text-align:right;margin-top:5px;}

    /* ───── CHOICES ───── */
    .choices-wrap{margin-top:30px;}
    .choices-lbl{font-family:'Courier Prime',monospace;font-size:10px;color:#3a2a10;letter-spacing:.22em;text-transform:uppercase;margin-bottom:10px;}
    .choice{width:100%;background:var(--s2);border:1px solid var(--border);padding:14px 18px;cursor:pointer;text-align:left;display:flex;flex-direction:column;gap:6px;margin-bottom:8px;transition:border-color .18s,background .18s,transform .18s,box-shadow .18s;opacity:0;transform:translateY(6px);animation:cin .3s ease forwards;}
    .choice:nth-child(2){animation-delay:.07s;}
    .choice:nth-child(3){animation-delay:.14s;}
    .choice:nth-child(4){animation-delay:.21s;}
    @keyframes cin{to{opacity:1;transform:none;}}
    .choice:hover{border-color:var(--gold);background:var(--s3);transform:translateX(3px);box-shadow:inset 3px 0 0 var(--gold);}
    .c-top{display:flex;gap:10px;align-items:flex-start;}
    .c-badge{font-family:'Cinzel',serif;font-size:11px;color:#3a2a10;width:18px;flex-shrink:0;padding-top:2px;font-weight:700;transition:color .18s;}
    .choice:hover .c-badge{color:var(--gold);}
    .c-text{font-family:'Cormorant Garamond',serif;font-size:17px;font-weight:600;color:var(--text);line-height:1.4;}
    .c-tags{display:flex;flex-wrap:wrap;gap:5px;padding-left:28px;}
    .tag{font-family:'Courier Prime',monospace;font-size:9px;padding:2px 5px;border:1px solid;letter-spacing:.04em;}
    .t-h{border-color:#2a5a24;color:var(--green);}
    .t-a{border-color:#2e2010;color:#4a3818;}
    .t-p{border-color:#2a5a24;color:var(--green);}
    .t-n{border-color:#5a1a1a;color:var(--red);}
    .c-prev{font-family:'Cormorant Garamond',serif;font-size:13px;color:#3a2a10;font-style:italic;padding-left:28px;}
    
    .gen{display:flex;flex-direction:column;align-items:center;gap:14px;padding:52px;color:var(--dim);}
    .gen span{font-family:'Cinzel',serif;font-size:13px;letter-spacing:.12em;color:var(--dim);}

    /* ───── BREADCRUMB ───── */
    .breadcrumb{padding:10px 20px;border-top:1px solid var(--border);display:flex;gap:5px;flex-wrap:wrap;align-items:center;background:var(--s1);}
    .bc{font-family:'Courier Prime',monospace;font-size:10px;color:#251808;display:flex;align-items:center;gap:5px;}
    .bc.cur{color:var(--faint);}
    .bc-dot{width:5px;height:5px;border-radius:50%;flex-shrink:0;}
    .bc-sep{color:#1e1206;}

    /* ───── ENDING ───── */
    .end{max-width:680px;margin:0 auto;padding:64px 24px;display:flex;flex-direction:column;gap:28px;}
    .end-type{font-family:'Cinzel',serif;font-size:10px;letter-spacing:.32em;text-transform:uppercase;padding:6px 16px;border:1px solid;display:inline-block;}
    .end-title{font-family:'Cinzel',serif;font-size:clamp(26px,5vw,44px);font-weight:700;color:var(--gold);line-height:1.2;}
    .end-narr{font-size:18px;line-height:1.85;font-style:italic;color:#ddc87e;}
    .end-narr p{margin-bottom:1.4em;}
    .end-stats{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;}
    @media(max-width:480px){.end-stats{grid-template-columns:1fr;}}
    .end-stat{background:var(--s2);border:1px solid var(--border);padding:18px;text-align:center;}
    .end-v{font-family:'Cinzel',serif;font-size:28px;font-weight:700;}
    .end-k{font-family:'Courier Prime',monospace;font-size:10px;color:#3a2a10;text-transform:uppercase;letter-spacing:.15em;margin-top:5px;}
  `;

  // ─── PHASES ────────────────────────────────────────────

  if (phase === "input")
    return (
      <>
        <style>{css}</style>
        <div className="hg">
          <div className="inp">
            <div className="inp-logo">
              <div className="inp-logo-title">Chronicle Engine</div>
              <div className="inp-logo-sub">History-to-Game Narrative System</div>
            </div>
            <div className="inp-rule" />
            <textarea
              className="inp-ta"
              placeholder="Paste a historical narrative — a battle, a political crisis, a fateful decision. The more vivid and detailed, the richer the game…"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              rows={10}
            />
            {error && <div className="err">⚠ {error}</div>}
            <div className="inp-row">
              <button className="btn btn-ghost" onClick={() => setInputText(SAMPLE)}>
                Load Sample
              </button>
              <button
                className="btn btn-gold"
                onClick={startGame}
                disabled={!inputText.trim()}
              >
                Begin Chronicle →
              </button>
            </div>
            <div className="inp-hint">
              Any historical narrative works — battles, sieges, political crises, diplomatic standoffs.
              <br />
              The engine extracts actors, stakes, and generates branching decisions.
            </div>
          </div>
        </div>
      </>
    );

  if (phase === "parsing")
    return (
      <>
        <style>{css}</style>
        <div className="hg">
          <div className="load">
            <div className="spinner" />
            <div className="load-title">The Chronicler Reads</div>
            <div className="load-sub">Extracting actors, stakes, and branching paths…</div>
            <div className="dots">
              <span />
              <span />
              <span />
            </div>
          </div>
        </div>
      </>
    );

  if (phase === "ending" && currentNode) {
    const tmap = {
      victory: { label: "Victory", color: "#5aaa4a" },
      defeat: { label: "Defeat", color: "#d94040" },
      historical: { label: "The Historical Path", color: "#c9a227" },
      divergent: { label: "A New History", color: "#9a70d4" },
    };
    const t = tmap[currentNode.endingType] ?? tmap.historical;
    const histCount = choiceHistory.filter((h) => h.historical).length;
    const fullEnd = [currentNode.narrative, currentNode.endingSummary]
      .filter(Boolean)
      .join("\n\n");
    return (
      <>
        <style>{css}</style>
        <div className="hg">
          <div className="end">
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <div
                className="end-type"
                style={{ borderColor: t.color, color: t.color }}
              >
                {t.label}
              </div>
              <div className="end-title">{gameData?.title}</div>
            </div>
            <div className="end-narr">
              {endingText
                .split(/\n\n+/)
                .filter(Boolean)
                .map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
              {endingText.length < fullEnd.length && (
                <span className="cursor" />
              )}
            </div>
            <div className="inp-rule" />
            <div className="end-stats">
              <div className="end-stat">
                <div className="end-v" style={{ color: accColor }}>
                  {accuracy}%
                </div>
                <div className="end-k">Historical Accuracy</div>
              </div>
              <div className="end-stat">
                <div className="end-v" style={{ color: "#c9a227" }}>
                  {choiceHistory.length}
                </div>
                <div className="end-k">Decisions Made</div>
              </div>
              <div className="end-stat">
                <div className="end-v" style={{ color: "#5aaa4a" }}>
                  {histCount}/{choiceHistory.length}
                </div>
                <div className="end-k">Historical Paths</div>
              </div>
            </div>
            <button
              className="btn btn-gold"
              onClick={reset}
              style={{ width: "100%" }}
            >
              ← Begin New Chronicle
            </button>
          </div>
        </div>
      </>
    );
  }

  // ─── GAME ──────────────────────────────────────────────
  return (
    <>
      <style>{css}</style>
      <div className="hg">
        <div className="game">
          <div className="topbar">
            <div className="topbar-title">{gameData?.title ?? "Chronicle"}</div>
            <div className="acc-grp">
              <div className="acc-lbl">Accuracy</div>
              <div className="acc-track">
                <div
                  className="acc-fill"
                  style={{ width: `${accuracy}%`, background: accColor }}
                />
              </div>
              <div className="acc-pct" style={{ color: accColor }}>
                {accuracy}%
              </div>
            </div>
            <button className="btn-exit" onClick={reset}>
              EXIT
            </button>
          </div>

          <div className="body">
            {/* Sidebar */}
            <div className="sidebar">
              {protagonist && (
                <div className="sid-sec">
                  <div className="sid-lbl">Protagonist</div>
                  <div className="actor">
                    <div className="actor-name">{protagonist.name}</div>
                    <div className="actor-fac">{protagonist.faction}</div>
                    <div className="srow">
                      <div className="skey">Inf</div>
                      <div className="sbar">
                        <div
                          className="sfill"
                          style={{ width: `${protagonist.influence}%`, background: "#c9a227" }}
                        />
                      </div>
                      <div className="sval">{protagonist.influence}</div>
                    </div>
                    <div className="srow">
                      <div className="skey">Res</div>
                      <div className="sbar">
                        <div
                          className="sfill"
                          style={{ width: `${protagonist.resources}%`, background: "#6a8830" }}
                        />
                      </div>
                      <div className="sval">{protagonist.resources}</div>
                    </div>
                  </div>
                </div>
              )}

              {actors.length > 0 && (
                <div className="sid-sec">
                  <div className="sid-lbl">Key Actors</div>
                  {actors.slice(0, 5).map((a) => (
                    <div key={a.id} className="actor">
                      <div className="actor-name" style={{ fontSize: "10px" }}>
                        {a.name}
                      </div>
                      <div className="actor-fac" style={{ fontSize: "10px" }}>
                        {a.faction} · {a.role}
                      </div>
                      <div className="srow">
                        <div className="skey">Inf</div>
                        <div className="sbar">
                          <div
                            className="sfill"
                            style={{
                              width: `${a.influence}%`,
                              background: a.role === "enemy" ? "#8b3030" : "#4a8a28",
                            }}
                          />
                        </div>
                        <div className="sval">{a.influence}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div style={{ marginTop: "auto" }}>
                <div className="sid-lbl">Era</div>
                <div className="sid-era">{gameData?.era}</div>
              </div>
            </div>

            {/* Main */}
            <div className="main">
              {phase === "generating" ? (
                <div className="gen">
                  <div className="spinner" />
                  <span>The Chronicle Continues…</span>
                  <div className="dots">
                    <span />
                    <span />
                    <span />
                  </div>
                </div>
              ) : currentNode ? (
                <>
                  <div className="scene-num">
                    Scene {choiceHistory.length + 1}
                    {gameData?.era ? ` · ${gameData.era}` : ""}
                  </div>
                  <div className="scene-title">{currentNode.title}</div>

                  <div className="narr" onClick={skipTyping}>
                    {displayText
                      .split(/\n\n+/)
                      .filter(Boolean)
                      .map((p, i) => (
                        <p key={i}>{p}</p>
                      ))}
                    {isTyping && <span className="cursor" />}
                  </div>
                  {isTyping && (
                    <div className="skip-hint">[ click to skip ]</div>
                  )}

                  {choicesVisible && currentNode.choices?.length > 0 && (
                    <div className="choices-wrap">
                      <div className="choices-lbl">Your Decision</div>
                      {currentNode.choices.map((c, i) => {
                        const a = c.effects?.accuracy ?? 0;
                        const inf = c.effects?.influence ?? 0;
                        return (
                          <button
                            key={c.id}
                            className="choice"
                            onClick={() => makeChoice(c)}
                          >
                            <div className="c-top">
                              <div className="c-badge">{BADGES[i] ?? i + 1}</div>
                              <div className="c-text">{c.text}</div>
                            </div>
                            <div className="c-tags">
                              <span className={`tag ${c.historical ? "t-h" : "t-a"}`}>
                                {c.historical ? "Historical" : "Alternate"}
                              </span>
                              {a !== 0 && (
                                <span className={`tag ${a > 0 ? "t-p" : "t-n"}`}>
                                  {a > 0 ? "+" : ""}{a}% acc
                                </span>
                              )}
                              {inf !== 0 && (
                                <span className={`tag ${inf > 0 ? "t-p" : "t-n"}`}>
                                  {inf > 0 ? "+" : ""}{inf} inf
                                </span>
                              )}
                            </div>
                            {c.preview && (
                              <div className="c-prev">{c.preview}</div>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {error && (
                    <div className="err" style={{ marginTop: "16px" }}>
                      ⚠ {error}
                    </div>
                  )}
                </>
              ) : null}
            </div>
          </div>

          {/* Breadcrumb trail */}
          {choiceHistory.length > 0 && (
            <div className="breadcrumb">
              {choiceHistory.map((h, i) => (
                <div key={i} className="bc">
                  <div
                    className="bc-dot"
                    style={{ background: h.historical ? "#4ca040" : "#3a2a10" }}
                  />
                  <span title={`Chose: ${h.choice}`}>{h.title}</span>
                  <span className="bc-sep">›</span>
                </div>
              ))}
              <div className="bc cur">
                <div className="bc-dot" style={{ background: "#c9a227" }} />
                <span>{currentNode?.title ?? "…"}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
