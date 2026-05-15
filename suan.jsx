import { useState, useEffect, useRef } from "react";

// ─── DATA ─────────────────────────────────────────────────────────────────────
const EVIDENCE = [
    {
        id: "mongol_armor",
        name: "Mongol-Era Lamellar Armor",
        description:
            "Lamellar plate construction with distinctive Yuan-dynasty riveting technique. This armament style did not appear in this region until the Mongolian invasions—1258 AD at the earliest. The victim is equipped with gear from 350 years in the future.",
        era: 1258,
        eraLabel: "~1258 AD",
        anomaly: true,
    },
    {
        id: "sat_that_tattoo",
        name: '"Sát Thát" Forearm Tattoo',
        description:
            '"Kill the Mongols." This war cry was popularized by General Trần Hưng Đạo during the campaigns of 1285–1288 AD. For this tattoo to exist in 938 AD is a categorical temporal impossibility. The Mongol Empire itself does not yet exist.',
        era: 1285,
        eraLabel: "1285–1288 AD",
        anomaly: true,
    },
    {
        id: "han_sword",
        name: "Southern Han Infantry Blade",
        description:
            "Standard-issue Southern Han sword. Consistent with 938 AD manufacturing techniques—iron content, tang construction, and grip wrapping all period-correct. No anomalies detected.",
        era: 938,
        eraLabel: "938 AD",
        anomaly: false,
    },
    {
        id: "boot_mud",
        name: "Mud from Victim's Boots",
        description:
            "Riverbank sediment. Contains trace pollen from a lotus cultivar not introduced to this delta until the late Lý Dynasty—approximately 1100s AD. Minor anomaly. The victim walked through the future.",
        era: 1100,
        eraLabel: "Est. 1100s AD",
        anomaly: true,
    },
];

const TESTIMONY = [
    {
        id: 0,
        text: "My name is Lý Đại. I am a soldier of the Southern Han. I crossed the Bạch Đằng River at dawn, two days past.",
        isLie: false,
        speaker: "LÝ ĐẠI",
        correctEvidence: null,
    },
    {
        id: 1,
        text: "I encountered this man near the northern embankment, alone. He saw me and drew his weapon. I had no choice.",
        isLie: false,
        speaker: "LÝ ĐẠI",
        correctEvidence: null,
    },
    {
        id: 2,
        text: "He wore the armor of a common Việt rebel — crude, locally-made. Nothing about his equipment was remarkable.",
        isLie: true,
        speaker: "LÝ ĐẠI",
        correctEvidence: "mongol_armor",
    },
    {
        id: 3,
        text: "I struck him down in self-defense. He died at my feet. I left his body at the bank. That is the complete truth.",
        isLie: false,
        speaker: "LÝ ĐẠI",
        correctEvidence: null,
    },
];

const SCENES = [
    {
        label: "938 AD. BẠCH ĐẰNG RIVER.",
        text: "Ngô Quyền's forces have destroyed the Southern Han fleet. Iron stakes in the riverbed, risen with the tide, tore the invaders apart. The battle is over. The river is still red.",
    },
    {
        label: "THE DISCOVERY",
        text: "A body. Male. Thirties. Found tangled in the stakes near the northern bank. A Southern Han soldier — Lý Đại — claims he killed this man in a skirmish, yesterday evening.",
    },
    {
        label: "THE ANOMALY",
        text: 'The body wears armor you have never seen. There is a tattoo on his forearm — three characters: "Sát Thát." You do not recognize the phrase. Your instinct fires. Something is wrong with the timeline.',
    },
    {
        label: "YOUR MISSION",
        text: "Examine the evidence. Identify the anachronisms. In the courtroom, find the line where the witness lies — and shatter it with the correct proof. The chronology of history depends on your precision.",
    },
];

// ─── ROOT ─────────────────────────────────────────────────────────────────────
export default function SuAn() {
    const [phase, setPhase] = useState("title");
    const [discovered, setDiscovered] = useState([]);
    const [selected, setSelected] = useState(null);
    const [examining, setExamining] = useState(null);
    const [lineIdx, setLineIdx] = useState(0);
    const [objResult, setObjResult] = useState(null);
    const [accuracy, setAccuracy] = useState(100);
    const [stability, setStability] = useState(100);
    const [verdict, setVerdict] = useState(null);
    const [shaking, setShaking] = useState(false);
    const [glitching, setGlitching] = useState(false);
    const [objBanner, setObjBanner] = useState(false);

    const shake = () => {
        setShaking(true);
        setTimeout(() => setShaking(false), 700);
    };
    const glitch = () => {
        setGlitching(true);
        setTimeout(() => setGlitching(false), 900);
    };

    const examine = (ev) => {
        if (!discovered.includes(ev.id)) {
            setDiscovered((p) => [...p, ev.id]);
            if (ev.anomaly) {
                glitch();
                setStability((p) => Math.max(0, p - 15));
            }
        }
        setExamining(ev);
    };

    const handleObjection = () => {
        const line = TESTIMONY[lineIdx];
        if (!selected) {
            setObjResult("fail");
            setAccuracy((p) => Math.max(0, p - 20));
            shake();
            setTimeout(() => setObjResult(null), 2000);
            return;
        }
        if (line.isLie && selected === line.correctEvidence) {
            setObjBanner(true);
            shake();
            glitch();
            setTimeout(() => {
                setObjBanner(false);
                setPhase("verdict");
                setVerdict("solved");
            }, 2800);
        } else {
            setObjResult("fail");
            setAccuracy((p) => Math.max(0, p - 25));
            shake();
            setTimeout(() => setObjResult(null), 2000);
        }
    };

    const nextLine = () => {
        if (lineIdx < TESTIMONY.length - 1) {
            setLineIdx((p) => p + 1);
            setObjResult(null);
        } else {
            setPhase("verdict");
            setVerdict("failed");
        }
    };

    const restart = () => {
        setPhase("title");
        setDiscovered([]);
        setSelected(null);
        setExamining(null);
        setLineIdx(0);
        setObjResult(null);
        setAccuracy(100);
        setStability(100);
        setVerdict(null);
    };

    return (
        <div
            style={{
                fontFamily: "'Space Mono', monospace",
                background: "#000",
                minHeight: "100vh",
                color: "#fff",
                position: "relative",
                overflow: "hidden",
                animation: shaking ? "shake 0.7s both" : "none",
            }}
        >
            <GlobalStyles />
            <CRTLayer glitching={glitching} />

            {objBanner && <ObjectionBanner />}

            {phase === "title" && <TitleScreen onStart={() => setPhase("scene")} />}
            {phase === "scene" && <SceneIntro onContinue={() => setPhase("investigation")} />}
            {phase === "investigation" && (
                <Investigation
                    evidence={EVIDENCE}
                    discovered={discovered}
                    examining={examining}
                    selected={selected}
                    onExamine={examine}
                    onSelect={setSelected}
                    onProceed={() => setPhase("courtroom")}
                    accuracy={accuracy}
                    stability={stability}
                    glitching={glitching}
                />
            )}
            {phase === "courtroom" && (
                <Courtroom
                    testimony={TESTIMONY}
                    lineIdx={lineIdx}
                    evidence={EVIDENCE}
                    discovered={discovered}
                    selected={selected}
                    onSelect={setSelected}
                    onObjection={handleObjection}
                    onNext={nextLine}
                    objResult={objResult}
                    accuracy={accuracy}
                    stability={stability}
                />
            )}
            {phase === "verdict" && (
                <Verdict verdict={verdict} accuracy={accuracy} onRestart={restart} />
            )}
        </div>
    );
}

// ─── GLOBAL STYLES ────────────────────────────────────────────────────────────
function GlobalStyles() {
    return (
        <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Space+Mono:ital,wght@0,400;0,700;1,400&display=swap');

      *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

      @keyframes shake {
        10%, 90% { transform: translate3d(-3px, 1px, 0); }
        20%, 80% { transform: translate3d(6px, -2px, 0); }
        30%, 50%, 70% { transform: translate3d(-10px, 3px, 0); }
        40%, 60% { transform: translate3d(10px, -3px, 0); }
      }

      @keyframes glitch-clip {
        0%   { clip-path: inset(0 0 90% 0); transform: translate(-6px, 0); }
        20%  { clip-path: inset(80% 0 0 0); transform: translate(6px, 0); }
        40%  { clip-path: inset(40% 0 40% 0); transform: translate(-3px, 2px); }
        60%  { clip-path: inset(20% 0 70% 0); transform: translate(4px, -2px); }
        80%  { clip-path: inset(60% 0 10% 0); transform: translate(-2px, 0); }
        100% { clip-path: inset(0 0 0 0); transform: translate(0); }
      }

      @keyframes objIn {
        0%   { transform: translate(-50%, -50%) scaleX(0) skewX(-8deg); opacity: 0; }
        15%  { transform: translate(-50%, -50%) scaleX(1.05) skewX(-8deg); opacity: 1; }
        25%  { transform: translate(-50%, -50%) scaleX(1) skewX(-8deg); opacity: 1; }
        80%  { transform: translate(-50%, -50%) scaleX(1) skewX(-8deg); opacity: 1; }
        100% { transform: translate(-50%, -50%) scaleX(1.2) skewX(-8deg); opacity: 0; }
      }

      @keyframes scanline {
        0%   { top: -4px; }
        100% { top: 100vh; }
      }

      @keyframes blink {
        0%, 100% { opacity: 1; }
        50% { opacity: 0; }
      }

      @keyframes fadeIn {
        from { opacity: 0; transform: translateY(8px); }
        to   { opacity: 1; transform: translateY(0); }
      }

      @keyframes pulse-red {
        0%, 100% { box-shadow: 0 0 0 0 rgba(255,0,0,0.4); }
        50%       { box-shadow: 0 0 0 8px rgba(255,0,0,0); }
      }

      .ev-card {
        cursor: pointer;
        transition: all 0.12s;
        border: 1px solid rgba(255,255,255,0.15);
        padding: 14px 16px;
        margin-bottom: 6px;
        position: relative;
      }
      .ev-card:hover {
        border-color: #fff;
        background: rgba(255,255,255,0.04);
        transform: translate(-2px, -2px);
        box-shadow: 3px 3px 0 rgba(255,255,255,0.3);
      }
      .ev-card.selected {
        background: #FF0000;
        border-color: #FF0000;
        color: #000;
      }
      .ev-card.selected:hover {
        background: #cc0000;
      }

      .btn {
        cursor: pointer;
        font-family: 'Space Mono', monospace;
        transition: all 0.12s;
        letter-spacing: 0.12em;
        border: none;
      }
      .btn:hover { opacity: 0.85; transform: translateY(-1px); }
      .btn:active { transform: translateY(0); }

      .btn-ghost {
        background: transparent;
        color: rgba(255,255,255,0.5);
        border: 1px solid rgba(255,255,255,0.2);
      }
      .btn-ghost:hover {
        color: #fff;
        border-color: #fff;
        opacity: 1;
      }

      .btn-obj {
        background: #FF0000;
        color: #fff;
        font-family: 'Bebas Neue', Impact, sans-serif;
        letter-spacing: 0.15em;
        cursor: pointer;
        border: none;
        transition: all 0.12s;
        animation: pulse-red 2s infinite;
      }
      .btn-obj:hover {
        transform: scale(1.04);
        box-shadow: 0 0 40px rgba(255,0,0,0.5);
        opacity: 1;
      }

      .stat-bar {
        height: 2px;
        background: rgba(255,255,255,0.1);
        width: 72px;
        margin-top: 4px;
      }
      .stat-bar-fill {
        height: 100%;
        transition: width 0.4s;
      }

      .testimony-past { opacity: 0.35; }
      .testimony-future { opacity: 0.12; filter: blur(1.5px); pointer-events: none; }
      .testimony-current { border-left: 3px solid #FF0000; background: rgba(255,0,0,0.04); }
    `}</style>
    );
}

// ─── CRT LAYER ────────────────────────────────────────────────────────────────
function CRTLayer({ glitching }) {
    return (
        <>
            {/* scanlines */}
            <div
                style={{
                    position: "fixed",
                    inset: 0,
                    background:
                        "repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,0,0,0.08) 3px, rgba(0,0,0,0.08) 4px)",
                    pointerEvents: "none",
                    zIndex: 9000,
                }}
            />
            {/* moving scanline */}
            <div
                style={{
                    position: "fixed",
                    left: 0,
                    right: 0,
                    height: "3px",
                    background: "rgba(255,255,255,0.025)",
                    animation: "scanline 4s linear infinite",
                    pointerEvents: "none",
                    zIndex: 9001,
                }}
            />
            {/* glitch overlay */}
            {glitching && (
                <div
                    style={{
                        position: "fixed",
                        inset: 0,
                        background: "rgba(255,0,0,0.06)",
                        pointerEvents: "none",
                        zIndex: 9002,
                        animation: "glitch-clip 0.9s steps(3) both",
                    }}
                />
            )}
        </>
    );
}

// ─── OBJECTION BANNER ─────────────────────────────────────────────────────────
function ObjectionBanner() {
    return (
        <div
            style={{
                position: "fixed",
                inset: 0,
                background: "rgba(0,0,0,0.75)",
                zIndex: 10000,
                pointerEvents: "none",
            }}
        >
            <div
                style={{
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    fontFamily: "'Bebas Neue', Impact, sans-serif",
                    fontSize: "clamp(72px, 14vw, 148px)",
                    color: "#FF0000",
                    letterSpacing: "0.08em",
                    whiteSpace: "nowrap",
                    textShadow: "6px 6px 0 #fff, -6px -6px 0 #000, 10px 0 0 rgba(255,255,255,0.3)",
                    animation: "objIn 2.8s ease-in-out both",
                    transformOrigin: "center",
                }}
            >
                PHẢN ĐỐI!
            </div>
            <div
                style={{
                    position: "absolute",
                    bottom: "20%",
                    left: "50%",
                    transform: "translateX(-50%)",
                    fontFamily: "'Space Mono', monospace",
                    fontSize: "12px",
                    letterSpacing: "0.3em",
                    color: "rgba(255,255,255,0.6)",
                    animation: "fadeIn 0.6s 0.8s both",
                }}
            >
                TEMPORAL PARADOX CONFIRMED — TIMELINE BREACH
            </div>
        </div>
    );
}

// ─── TITLE ────────────────────────────────────────────────────────────────────
function TitleScreen({ onStart }) {
    return (
        <div
            style={{
                minHeight: "100vh",
                padding: "clamp(24px, 5vw, 64px)",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                position: "relative",
                animation: "fadeIn 0.6s both",
            }}
        >
            {/* red accent bar */}
            <div style={{ width: "3px", height: "100px", background: "#FF0000", marginBottom: "28px" }} />

            <div
                style={{
                    fontSize: "10px",
                    letterSpacing: "0.4em",
                    color: "#FF0000",
                    marginBottom: "12px",
                }}
            >
                938 AD — BẠCH ĐẰNG RIVER — TEMPORAL ANOMALY CLASS-IV
            </div>

            <div
                style={{
                    fontFamily: "'Bebas Neue', Impact, sans-serif",
                    fontSize: "clamp(56px, 14vw, 148px)",
                    lineHeight: 0.88,
                    letterSpacing: "-0.01em",
                    marginBottom: "12px",
                }}
            >
                SỬ ÁN
            </div>

            <div
                style={{
                    fontFamily: "'Bebas Neue', Impact, sans-serif",
                    fontSize: "clamp(16px, 3.5vw, 32px)",
                    color: "#FF0000",
                    letterSpacing: "0.35em",
                    marginBottom: "40px",
                }}
            >
                THE CHRONOS ATTORNEY ENGINE
            </div>

            <div style={{ width: "100%", maxWidth: "520px", height: "1px", background: "rgba(255,255,255,0.2)", marginBottom: "32px" }} />

            <div
                style={{
                    fontSize: "12px",
                    lineHeight: 2,
                    color: "rgba(255,255,255,0.6)",
                    maxWidth: "420px",
                    marginBottom: "48px",
                }}
            >
                A body has been found on the banks of the Bạch Đằng River.
                <br />
                The suspect claims he killed the man yesterday.
                <br />
                The evidence is 350 years older than the victim.
                <br />
                <br />
                <span style={{ color: "#FF0000" }}>The timeline has been fractured.</span>
                <br />
                You must restore it.
            </div>

            <button
                className="btn"
                onClick={onStart}
                style={{
                    background: "#fff",
                    color: "#000",
                    padding: "16px 52px",
                    fontFamily: "'Bebas Neue', Impact, sans-serif",
                    fontSize: "22px",
                    letterSpacing: "0.2em",
                    width: "fit-content",
                    boxShadow: "5px 5px 0 #FF0000",
                }}
            >
                BẮT ĐẦU ĐIỀU TRA →
            </button>

            {/* decorative pixel grid */}
            <div
                style={{
                    position: "absolute",
                    right: "clamp(24px, 6vw, 80px)",
                    top: "50%",
                    transform: "translateY(-50%)",
                    display: "grid",
                    gridTemplateColumns: "repeat(10, 10px)",
                    gap: "6px",
                    opacity: 0.12,
                }}
            >
                {Array.from({ length: 80 }).map((_, i) => (
                    <div
                        key={i}
                        style={{
                            width: "10px",
                            height: "10px",
                            background: i % 4 === 0 ? "#FF0000" : "#fff",
                        }}
                    />
                ))}
            </div>

            {/* version tag */}
            <div
                style={{
                    position: "absolute",
                    bottom: "24px",
                    right: "24px",
                    fontSize: "9px",
                    color: "rgba(255,255,255,0.15)",
                    letterSpacing: "0.25em",
                }}
            >
                BUILD 938.01 — CHRONOS ENGINE v1
            </div>
        </div>
    );
}

// ─── SCENE INTRO ─────────────────────────────────────────────────────────────
function SceneIntro({ onContinue }) {
    const [step, setStep] = useState(0);
    const sc = SCENES[step];

    return (
        <div
            key={step}
            style={{
                minHeight: "100vh",
                padding: "clamp(24px, 5vw, 64px)",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                maxWidth: "720px",
                animation: "fadeIn 0.4s both",
            }}
        >
            <div style={{ fontSize: "9px", letterSpacing: "0.4em", color: "#FF0000", marginBottom: "6px" }}>
                {`[ ${step + 1} / ${SCENES.length} ] — HỒ SƠ VỤ ÁN / CASE FILE`}
            </div>

            <div
                style={{
                    fontFamily: "'Bebas Neue', Impact, sans-serif",
                    fontSize: "clamp(28px, 6vw, 56px)",
                    letterSpacing: "0.06em",
                    marginBottom: "28px",
                    lineHeight: 1,
                }}
            >
                {sc.label}
            </div>

            <div
                style={{
                    fontSize: "13px",
                    lineHeight: 2.1,
                    color: "rgba(255,255,255,0.75)",
                    borderLeft: "3px solid #FF0000",
                    paddingLeft: "24px",
                    marginBottom: "48px",
                    maxWidth: "560px",
                }}
            >
                {sc.text}
            </div>

            {/* progress dots */}
            <div style={{ display: "flex", gap: "8px", marginBottom: "32px" }}>
                {SCENES.map((_, i) => (
                    <div
                        key={i}
                        style={{
                            width: i === step ? "24px" : "8px",
                            height: "3px",
                            background: i <= step ? "#FF0000" : "rgba(255,255,255,0.15)",
                            transition: "all 0.3s",
                        }}
                    />
                ))}
            </div>

            <button
                className="btn btn-ghost"
                onClick={() => (step < SCENES.length - 1 ? setStep((s) => s + 1) : onContinue())}
                style={{ padding: "12px 32px", fontSize: "11px", width: "fit-content" }}
            >
                {step < SCENES.length - 1 ? "TIẾP THEO →" : "BẮT ĐẦU ĐIỀU TRA →"}
            </button>
        </div>
    );
}

// ─── INVESTIGATION ────────────────────────────────────────────────────────────
function Investigation({ evidence, discovered, examining, selected, onExamine, onSelect, onProceed, accuracy, stability, glitching }) {
    return (
        <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
            {/* top bar */}
            <div
                style={{
                    borderBottom: "1px solid rgba(255,255,255,0.1)",
                    padding: "14px 28px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                }}
            >
                <div>
                    <div style={{ fontFamily: "'Bebas Neue', Impact, sans-serif", fontSize: "22px", letterSpacing: "0.12em" }}>
                        ĐIỀU TRA HIỆN TRƯỜNG
                    </div>
                    <div style={{ fontSize: "9px", color: "rgba(255,255,255,0.3)", letterSpacing: "0.25em", marginTop: "2px" }}>
                        INVESTIGATION MODE — 938 AD — BẠCH ĐẰNG RIVER
                    </div>
                </div>
                <div style={{ display: "flex", gap: "28px" }}>
                    <StatBlock label="ACCURACY" value={accuracy} />
                    <StatBlock label="STABILITY" value={stability} />
                </div>
            </div>

            <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
                {/* evidence list */}
                <div
                    style={{
                        width: "300px",
                        minWidth: "300px",
                        borderRight: "1px solid rgba(255,255,255,0.08)",
                        padding: "24px 20px",
                        overflowY: "auto",
                    }}
                >
                    <div style={{ fontSize: "9px", letterSpacing: "0.35em", color: "#FF0000", marginBottom: "16px" }}>
                        VẬT CHỨNG / EVIDENCE BAG
                    </div>

                    {evidence.map((ev) => {
                        const found = discovered.includes(ev.id);
                        const isSel = selected === ev.id;
                        return (
                            <div
                                key={ev.id}
                                className={`ev-card${isSel ? " selected" : ""}`}
                                onClick={() => onExamine(ev)}
                            >
                                <div style={{ fontSize: "10px", fontWeight: 700, marginBottom: "4px" }}>
                                    {found ? ev.name : "[ CHƯA KIỂM TRA ]"}
                                </div>
                                {found ? (
                                    <div
                                        style={{
                                            fontSize: "8px",
                                            letterSpacing: "0.2em",
                                            color: isSel ? "rgba(0,0,0,0.55)" : ev.anomaly ? "#FF0000" : "rgba(255,255,255,0.35)",
                                            marginTop: "2px",
                                        }}
                                    >
                                        {ev.eraLabel} {ev.anomaly ? "⚠ ANOMALY" : "✓ PERIOD-CORRECT"}
                                    </div>
                                ) : (
                                    <div style={{ fontSize: "8px", color: "rgba(255,255,255,0.2)", letterSpacing: "0.15em" }}>
                                        CLICK TO EXAMINE
                                    </div>
                                )}
                            </div>
                        );
                    })}

                    <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: "16px", marginTop: "16px" }}>
                        <div style={{ fontSize: "9px", color: "rgba(255,255,255,0.25)", marginBottom: "14px", letterSpacing: "0.15em" }}>
                            {discovered.length}/{evidence.length} ITEMS EXAMINED
                        </div>
                        {discovered.length > 0 && (
                            <button
                                className="btn"
                                onClick={onProceed}
                                style={{
                                    background: "#FF0000",
                                    color: "#fff",
                                    padding: "12px 20px",
                                    fontFamily: "'Bebas Neue', Impact, sans-serif",
                                    fontSize: "18px",
                                    letterSpacing: "0.15em",
                                    width: "100%",
                                }}
                            >
                                VÀO PHÒNG XỬ ÁN →
                            </button>
                        )}
                    </div>
                </div>

                {/* examine panel */}
                <div style={{ flex: 1, padding: "32px", overflowY: "auto" }}>
                    {examining ? (
                        <div style={{ animation: "fadeIn 0.3s both" }}>
                            <div style={{ fontSize: "9px", color: "#FF0000", letterSpacing: "0.35em", marginBottom: "20px" }}>
                                ĐANG KIỂM TRA / EXAMINING
                            </div>

                            <div
                                style={{
                                    border: "1px solid rgba(255,255,255,0.12)",
                                    padding: "28px",
                                    marginBottom: "24px",
                                    position: "relative",
                                    animation: examining.anomaly && glitching ? "glitch-clip 0.9s steps(3) both" : "none",
                                }}
                            >
                                {/* Pixel art icon */}
                                <div
                                    style={{
                                        width: "120px",
                                        height: "120px",
                                        background: "#0a0a0a",
                                        border: "1px solid rgba(255,255,255,0.08)",
                                        marginBottom: "24px",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        imageRendering: "pixelated",
                                    }}
                                >
                                    <PixelIcon id={examining.id} />
                                </div>

                                <div
                                    style={{
                                        fontFamily: "'Bebas Neue', Impact, sans-serif",
                                        fontSize: "clamp(24px, 4vw, 40px)",
                                        letterSpacing: "0.04em",
                                        marginBottom: "16px",
                                        lineHeight: 1.1,
                                    }}
                                >
                                    {examining.name}
                                </div>

                                <div
                                    style={{
                                        fontSize: "12px",
                                        lineHeight: 2,
                                        color: "rgba(255,255,255,0.65)",
                                        maxWidth: "520px",
                                        marginBottom: "24px",
                                    }}
                                >
                                    {examining.description}
                                </div>

                                {examining.anomaly && (
                                    <div
                                        style={{
                                            background: "#FF0000",
                                            color: "#fff",
                                            padding: "10px 18px",
                                            fontSize: "10px",
                                            letterSpacing: "0.25em",
                                            display: "inline-block",
                                            marginBottom: "20px",
                                        }}
                                    >
                                        ⚠ TEMPORAL ANOMALY DETECTED — {examining.eraLabel}
                                    </div>
                                )}

                                <div
                                    style={{
                                        position: "absolute",
                                        top: "10px",
                                        right: "12px",
                                        fontSize: "8px",
                                        color: "rgba(255,255,255,0.12)",
                                        letterSpacing: "0.2em",
                                    }}
                                >
                                    EVIDENCE/{examining.id.toUpperCase()}
                                </div>
                            </div>

                            <button
                                className="btn btn-ghost"
                                onClick={() => onSelect(selected === examining.id ? null : examining.id)}
                                style={{
                                    padding: "12px 28px",
                                    fontSize: "10px",
                                    background: selected === examining.id ? "rgba(255,0,0,0.15)" : "transparent",
                                    borderColor: selected === examining.id ? "#FF0000" : "rgba(255,255,255,0.2)",
                                    color: selected === examining.id ? "#FF0000" : "rgba(255,255,255,0.5)",
                                }}
                            >
                                {selected === examining.id ? "✓ VẬT CHỨNG ĐANG ĐƯỢC CHỌN" : "CHỌN VẬT CHỨNG NÀY ĐỂ PHẢN ĐỐI"}
                            </button>
                        </div>
                    ) : (
                        <div
                            style={{
                                height: "100%",
                                display: "flex",
                                flexDirection: "column",
                                justifyContent: "center",
                                opacity: 0.18,
                            }}
                        >
                            <div
                                style={{
                                    fontFamily: "'Bebas Neue', Impact, sans-serif",
                                    fontSize: "clamp(48px, 10vw, 96px)",
                                    lineHeight: 0.9,
                                }}
                            >
                                CHỌN
                                <br />
                                VẬT
                                <br />
                                CHỨNG
                            </div>
                            <div style={{ fontSize: "10px", marginTop: "20px", letterSpacing: "0.25em" }}>
                                SELECT AN ITEM FROM THE LEFT →
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

// ─── COURTROOM ────────────────────────────────────────────────────────────────
function Courtroom({ testimony, lineIdx, evidence, discovered, selected, onSelect, onObjection, onNext, objResult, accuracy, stability }) {
    const current = testimony[lineIdx];
    const availableEvidence = evidence.filter((e) => discovered.includes(e.id));

    return (
        <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
            {/* header */}
            <div
                style={{
                    borderBottom: "1px solid rgba(255,255,255,0.08)",
                    padding: "12px 28px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                }}
            >
                <div>
                    <div
                        style={{
                            fontFamily: "'Bebas Neue', Impact, sans-serif",
                            fontSize: "20px",
                            letterSpacing: "0.15em",
                            color: "#FF0000",
                        }}
                    >
                        PHIÊN TÒA / COURTROOM
                    </div>
                    <div style={{ fontSize: "8px", color: "rgba(255,255,255,0.25)", letterSpacing: "0.25em", marginTop: "2px" }}>
                        LỜI KHAI {lineIdx + 1} / {testimony.length} — 938 AD
                    </div>
                </div>
                <div style={{ display: "flex", gap: "24px" }}>
                    <StatBlock label="ACCURACY" value={accuracy} />
                    <StatBlock label="STABILITY" value={stability} />
                </div>
            </div>

            <div style={{ display: "flex", flex: 1 }}>
                {/* main testimony */}
                <div
                    style={{
                        flex: 1,
                        padding: "28px 32px",
                        display: "flex",
                        flexDirection: "column",
                    }}
                >
                    {/* witness tag */}
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "10px",
                            padding: "8px 16px",
                            border: "1px solid rgba(255,255,255,0.1)",
                            marginBottom: "28px",
                            width: "fit-content",
                        }}
                    >
                        <div
                            style={{
                                width: "7px",
                                height: "7px",
                                background: "#FF0000",
                                animation: "blink 1s step-end infinite",
                            }}
                        />
                        <div style={{ fontSize: "9px", color: "#FF0000", letterSpacing: "0.3em" }}>
                            NHÂN CHỨNG: {current.speaker}
                        </div>
                    </div>

                    {/* all lines */}
                    <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "2px" }}>
                        {testimony.map((line, idx) => {
                            let cls = "";
                            if (idx < lineIdx) cls = "testimony-past";
                            else if (idx > lineIdx) cls = "testimony-future";
                            else cls = "testimony-current";

                            return (
                                <div
                                    key={line.id}
                                    className={cls}
                                    style={{
                                        padding: idx === lineIdx ? "20px 24px" : "12px 24px",
                                        transition: "all 0.3s",
                                    }}
                                >
                                    <div
                                        style={{
                                            fontSize: "8px",
                                            color: idx === lineIdx ? "rgba(255,255,255,0.35)" : "rgba(255,255,255,0.15)",
                                            letterSpacing: "0.25em",
                                            marginBottom: "6px",
                                        }}
                                    >
                                        [{String(idx + 1).padStart(2, "0")}]
                                    </div>
                                    <div
                                        style={{
                                            fontSize: idx === lineIdx ? "14px" : "12px",
                                            lineHeight: 1.9,
                                            fontStyle: "italic",
                                            color: idx === lineIdx ? "#fff" : "rgba(255,255,255,0.4)",
                                        }}
                                    >
                                        "{line.text}"
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* feedback */}
                    {objResult && (
                        <div
                            style={{
                                padding: "14px 20px",
                                background: objResult === "success" ? "#FF0000" : "rgba(255,30,30,0.08)",
                                border: `1px solid ${objResult === "success" ? "#FF0000" : "rgba(255,0,0,0.3)"}`,
                                marginTop: "16px",
                                fontSize: "10px",
                                letterSpacing: "0.2em",
                                animation: "fadeIn 0.2s both",
                            }}
                        >
                            {objResult === "success"
                                ? "✓ PARADOX CONFIRMED — TIMELINE BREACH LOGGED"
                                : "✗ INCORRECT — VẬT CHỨNG KHÔNG PHÙ HỢP VỚI LỜI KHAI NÀY"}
                        </div>
                    )}

                    {/* actions */}
                    <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
                        <button
                            className="btn btn-obj"
                            onClick={onObjection}
                            style={{ flex: 1, padding: "18px 0", fontSize: "32px" }}
                        >
                            PHẢN ĐỐI!
                        </button>
                        <button
                            className="btn btn-ghost"
                            onClick={onNext}
                            style={{ padding: "18px 24px", fontSize: "10px", whiteSpace: "nowrap" }}
                        >
                            TIẾP →
                        </button>
                    </div>
                </div>

                {/* evidence sidebar */}
                <div
                    style={{
                        width: "240px",
                        minWidth: "240px",
                        borderLeft: "1px solid rgba(255,255,255,0.07)",
                        padding: "24px 16px",
                        overflowY: "auto",
                    }}
                >
                    <div style={{ fontSize: "8px", letterSpacing: "0.35em", color: "#FF0000", marginBottom: "14px" }}>
                        TÚI VẬT CHỨNG
                    </div>

                    {selected && (
                        <div
                            style={{
                                padding: "8px 12px",
                                background: "rgba(255,0,0,0.08)",
                                border: "1px solid rgba(255,0,0,0.25)",
                                marginBottom: "14px",
                                fontSize: "8px",
                                color: "#FF0000",
                                letterSpacing: "0.12em",
                            }}
                        >
                            ▶ {evidence.find((e) => e.id === selected)?.name}
                        </div>
                    )}

                    {availableEvidence.length === 0 && (
                        <div style={{ fontSize: "9px", color: "rgba(255,255,255,0.15)", letterSpacing: "0.15em" }}>
                            KHÔNG CÓ VẬT CHỨNG
                            <br />
                            <br />
                            Quay lại điều tra hiện trường.
                        </div>
                    )}

                    {availableEvidence.map((ev) => {
                        const isSel = selected === ev.id;
                        return (
                            <div
                                key={ev.id}
                                className={`ev-card${isSel ? " selected" : ""}`}
                                onClick={() => onSelect(isSel ? null : ev.id)}
                                style={{ padding: "12px 14px" }}
                            >
                                <div style={{ fontSize: "9px", fontWeight: 700, color: isSel ? "#000" : "#fff", marginBottom: "3px" }}>
                                    {ev.name}
                                </div>
                                <div
                                    style={{
                                        fontSize: "7px",
                                        letterSpacing: "0.2em",
                                        color: isSel ? "rgba(0,0,0,0.5)" : ev.anomaly ? "#FF0000" : "rgba(255,255,255,0.3)",
                                    }}
                                >
                                    {ev.eraLabel}
                                </div>
                            </div>
                        );
                    })}

                    <div
                        style={{
                            marginTop: "24px",
                            paddingTop: "16px",
                            borderTop: "1px solid rgba(255,255,255,0.05)",
                            fontSize: "8px",
                            color: "rgba(255,255,255,0.18)",
                            lineHeight: 1.8,
                        }}
                    >
                        Chọn vật chứng, rồi bấm PHẢN ĐỐI! khi nhân chứng đang nói dối.
                    </div>
                </div>
            </div>
        </div>
    );
}

// ─── VERDICT ─────────────────────────────────────────────────────────────────
function Verdict({ verdict, accuracy, onRestart }) {
    const solved = verdict === "solved";
    return (
        <div
            style={{
                minHeight: "100vh",
                padding: "clamp(24px, 5vw, 64px)",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                animation: "fadeIn 0.6s both",
            }}
        >
            <div style={{ fontSize: "9px", letterSpacing: "0.4em", color: solved ? "#FF0000" : "rgba(255,255,255,0.4)", marginBottom: "20px" }}>
                {solved ? "TIMELINE RESTORED — CASE CLOSED" : "TIMELINE COLLAPSE — CASE UNSOLVED"}
            </div>

            <div
                style={{
                    fontFamily: "'Bebas Neue', Impact, sans-serif",
                    fontSize: "clamp(52px, 12vw, 108px)",
                    lineHeight: 0.88,
                    marginBottom: "32px",
                    color: solved ? "#fff" : "rgba(255,255,255,0.4)",
                }}
            >
                {solved ? (
                    <>
                        NGHỊCH LÝ
                        <br />
                        <span style={{ color: "#FF0000" }}>ĐÃ ĐƯỢC GIẢI</span>
                    </>
                ) : (
                    <>
                        NGHỊCH LÝ
                        <br />
                        MÃI TỒN TẠI
                    </>
                )}
            </div>

            <div
                style={{
                    fontSize: "12px",
                    lineHeight: 2.1,
                    color: "rgba(255,255,255,0.6)",
                    maxWidth: "520px",
                    marginBottom: "20px",
                    borderLeft: `3px solid ${solved ? "#FF0000" : "rgba(255,255,255,0.15)"}`,
                    paddingLeft: "22px",
                }}
            >
                {solved
                    ? 'The suspect claimed the victim wore "crude, locally-made armor." The Mongol-era lamellar construction proves this is a lie. The victim existed in—or was transported from—a time 350 years in the future. Lý Đại knows more than he admits. The paradox is confirmed. The timeline can be repaired.'
                    : "The testimony concluded without a successful objection. The lie stands unchallenged. The fabricated account becomes the historical record. The temporal anomaly propagates forward, unseen, corrupting 350 years of history."}
            </div>

            {solved && (
                <div style={{ fontSize: "10px", color: "#FF0000", letterSpacing: "0.15em", marginBottom: "40px" }}>
                    ĐỘ CHÍNH XÁC LỊCH SỬ: {accuracy}%
                </div>
            )}

            <button
                className="btn btn-ghost"
                onClick={onRestart}
                style={{ padding: "14px 36px", fontSize: "10px", width: "fit-content" }}
            >
                ← CHƠI LẠI / RESTART
            </button>
        </div>
    );
}

// ─── HELPERS ──────────────────────────────────────────────────────────────────
function StatBlock({ label, value }) {
    const danger = value < 50;
    return (
        <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: "7px", letterSpacing: "0.3em", color: "rgba(255,255,255,0.3)", marginBottom: "3px" }}>
                {label}
            </div>
            <div
                style={{
                    fontFamily: "'Bebas Neue', Impact, sans-serif",
                    fontSize: "22px",
                    color: danger ? "#FF0000" : "#fff",
                    lineHeight: 1,
                }}
            >
                {value}%
            </div>
            <div className="stat-bar">
                <div
                    className="stat-bar-fill"
                    style={{ width: `${value}%`, background: danger ? "#FF0000" : "#fff" }}
                />
            </div>
        </div>
    );
}

function PixelIcon({ id }) {
    const size = 80;
    const scale = 5; // each "pixel" = 5×5 real pixels
    const icons = {
        mongol_armor: [
            [0, 0, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 1, 1, 2, 2, 2, 2, 1, 1, 0, 0, 0, 0, 0, 0, 0],
            [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0],
            [1, 1, 3, 3, 3, 3, 3, 3, 1, 1, 0, 0, 0, 0, 0, 0],
            [1, 1, 3, 1, 1, 1, 1, 3, 1, 1, 0, 0, 0, 0, 0, 0],
            [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0],
            [0, 1, 3, 3, 3, 3, 3, 3, 1, 0, 0, 0, 0, 0, 0, 0],
            [0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0],
        ],
        sat_that_tattoo: [
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0],
            [0, 1, 4, 4, 4, 4, 4, 4, 4, 4, 4, 1, 0, 0, 0, 0],
            [0, 1, 4, 2, 0, 2, 0, 0, 2, 0, 4, 1, 0, 0, 0, 0],
            [0, 1, 4, 2, 0, 2, 0, 0, 2, 0, 4, 1, 0, 0, 0, 0],
            [0, 1, 4, 2, 2, 2, 0, 0, 2, 2, 4, 1, 0, 0, 0, 0],
            [0, 1, 4, 4, 4, 4, 4, 4, 4, 4, 4, 1, 0, 0, 0, 0],
            [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0],
        ],
        han_sword: [
            [0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 1, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 1, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 1, 1, 1, 1, 1, 3, 1, 1, 1, 1, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 1, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        ],
        boot_mud: [
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 6, 6, 6, 6, 0, 0, 6, 6, 6, 6, 0, 0, 0, 0],
            [0, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 0, 0, 0],
            [0, 6, 7, 6, 7, 6, 7, 6, 7, 6, 7, 6, 6, 0, 0, 0],
            [0, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 0, 0, 0],
            [0, 0, 6, 6, 7, 6, 6, 7, 6, 6, 7, 6, 0, 0, 0, 0],
            [0, 0, 0, 6, 6, 6, 6, 6, 6, 6, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        ],
    };

    const palette = {
        0: "transparent",
        1: "#aaa",      // steel
        2: "#FF0000",   // red
        3: "#777",      // dark steel
        4: "#c8a87a",   // skin
        5: "#654321",   // wood
        6: "#4a3728",   // dark mud
        7: "#6a5545",   // light mud
    };

    const grid = icons[id] || icons.boot_mud;
    const cols = grid[0].length;
    const rows = grid.length;
    const W = cols * scale;
    const H = rows * scale;

    return (
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ imageRendering: "pixelated" }}>
            {grid.map((row, r) =>
                row.map((cell, c) =>
                    cell !== 0 ? (
                        <rect
                            key={`${r}-${c}`}
                            x={c * scale}
                            y={r * scale}
                            width={scale}
                            height={scale}
                            fill={palette[cell] || "#fff"}
                        />
                    ) : null
                )
            )}
        </svg>
    );
}