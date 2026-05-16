import React, { useState, useEffect } from "react";

// ─── DATA (TRANSLATED TO VIETNAMESE) ──────────────────────────────────────────
const EVIDENCE = [
    {
        id: "mongol_armor",
        name: "Giáp Vảy Quân Mông Cổ",
        description: "Áo giáp vảy được chế tạo bằng kỹ thuật đinh tán thời Nguyên. Kiểu giáp này chưa từng xuất hiện cho đến khi quân Mông Cổ xâm lược—sớm nhất là năm 1258. Nạn nhân mặc trang bị từ 350 năm trong tương lai.",
        eraLabel: "Khoảng 1258 CN",
        anomaly: true,
    },
    {
        id: "sat_that_tattoo",
        name: 'Hình Xăm "Sát Thát"',
        description: '"Giết giặc Thát". Khẩu hiệu được Hưng Đạo Vương Trần Quốc Tuấn phổ biến năm 1285. Hình xăm này tồn tại vào năm 938 là vô lý về mặt thời gian. Đế quốc Mông Cổ còn chưa tồn tại.',
        eraLabel: "1285–1288 CN",
        anomaly: true,
    },
    {
        id: "han_sword",
        name: "Kiếm Bộ Binh Nam Hán",
        description: "Kiếm tiêu chuẩn của quân Nam Hán. Kỹ thuật rèn hoàn toàn phù hợp với năm 938. Không phát hiện sự bất thường.",
        eraLabel: "938 CN",
        anomaly: false,
    },
    {
        id: "boot_mud",
        name: "Bùn Từ Giày Nạn Nhân",
        description: "Bùn ven sông. Chứa phấn hoa của giống sen chưa từng du nhập vào vùng này cho đến cuối thời Lý (khoảng 1100). Nạn nhân đã bước đi qua tương lai.",
        eraLabel: "Khoảng 1100 CN",
        anomaly: true,
    },
];

const TESTIMONY = [
    { id: 0, text: "Tên tôi là Lý Đại. Tôi là lính bộ binh Nam Hán. Tôi đã vượt sông Bạch Đằng vào rạng sáng hai ngày trước.", speaker: "LÝ ĐẠI", isLie: false, correctEvidence: null },
    { id: 1, text: "Tôi chạm trán hắn ta gần bờ đê phía bắc. Hắn rút vũ khí ra, nên tôi không còn lựa chọn nào khác.", speaker: "LÝ ĐẠI", isLie: false, correctEvidence: null },
    { id: 2, text: "Hắn mặc áo giáp của một tên phản loạn người Việt bình thường — thô sơ, được tự rèn ở địa phương.", speaker: "LÝ ĐẠI", isLie: true, correctEvidence: "mongol_armor" },
    { id: 3, text: "Tôi đã hạ gục hắn để tự vệ. Hắn chết dưới chân tôi, và tôi bỏ xác hắn lại đó. Đó là sự thật.", speaker: "LÝ ĐẠI", isLie: false, correctEvidence: null },
];

const SCENES = [
    {
        label: "NĂM 938. SÔNG BẠCH ĐẰNG.",
        text: "Quân của Ngô Quyền đã tiêu diệt hạm đội Nam Hán. Những cọc sắt dưới lòng sông đã xé toạc chiến thuyền của quân xâm lược. Trận chiến đã kết thúc. Nước sông vẫn nhuộm màu máu.",
    },
    {
        label: "SỰ PHÁT HIỆN",
        text: "Một thi thể nam giới khoảng ba mươi tuổi được tìm thấy kẹt trong những cọc sắt. Một người lính Nam Hán — Lý Đại — khai rằng hắn đã giết người này trong một cuộc giao tranh tối qua.",
    },
    {
        label: "SỰ BẤT THƯỜNG",
        text: 'Thi thể mặc một bộ áo giáp mà bạn chưa từng thấy. Có một hình xăm trên cánh tay hắn: "Sát Thát". Trực giác của bạn mách bảo... Có gì đó sai lệch với dòng thời gian.',
    },
    {
        label: "NHIỆM VỤ",
        text: "Kiểm tra bằng chứng. Xác định những điểm sai lệch thời đại. Tại phiên tòa, hãy tìm ra câu nói dối của nhân chứng và đập tan nó bằng bằng chứng chính xác. Lịch sử phụ thuộc vào bạn.",
    },
];

// ─── TYPEWRITER EFFECT ───────────────────────────────────────────────────────
function TypewriterText({ text, speed = 30, onComplete }) {
    const [disp, setDisp] = useState("");
    useEffect(() => {
        setDisp("");
        let i = 0;
        const t = setInterval(() => {
            setDisp(text.slice(0, i + 1));
            i++;
            if (i >= text.length) {
                clearInterval(t);
                if (onComplete) onComplete();
            }
        }, speed);
        return () => clearInterval(t);
    }, [text, speed, onComplete]);
    return <span>{disp}</span>;
}

// ─── MAIN APP ────────────────────────────────────────────────────────────────
export default function SuAn() {
    const [phase, setPhase] = useState("title"); // title, scene, investigation, courtroom, verdict
    const [discovered, setDiscovered] = useState([]);
    const [selected, setSelected] = useState(null);
    const [lineIdx, setLineIdx] = useState(0);
    const [gotcha, setGotcha] = useState(false);
    const [shakeScreen, setShakeScreen] = useState(false);
    const [verdictStatus, setVerdictStatus] = useState(null);
    const [wrongMsg, setWrongMsg] = useState(false);

    const triggerObjection = (result) => {
        setGotcha(true);
        setShakeScreen(true);
        setTimeout(() => setShakeScreen(false), 500);
        setTimeout(() => {
            setGotcha(false);
            if (result === "success") {
                setVerdictStatus("solved");
                setPhase("verdict");
            } else {
                setWrongMsg(true);
                setTimeout(() => setWrongMsg(false), 3000);
            }
        }, 2000);
    };

    const handleObjection = () => {
        if (!selected) {
            setWrongMsg(true);
            setTimeout(() => setWrongMsg(false), 3000);
            return;
        }
        const currentLine = TESTIMONY[lineIdx];
        if (currentLine.isLie && selected === currentLine.correctEvidence) {
            triggerObjection("success");
        } else {
            triggerObjection("fail");
        }
    };

    return (
        <div className={`relative w-[1280px] h-[720px] overflow-hidden bg-black font-sans text-white select-none ${shakeScreen ? 'animate-shake' : ''}`}>
            {phase === "title" && <TitleScreen onStart={() => setPhase("scene")} />}
            {phase === "scene" && <SceneIntro onContinue={() => setPhase("investigation")} />}
            {phase === "investigation" && (
                <Investigation 
                    discovered={discovered} 
                    setDiscovered={setDiscovered} 
                    onProceed={() => setPhase("courtroom")} 
                />
            )}
            {phase === "courtroom" && (
                <Courtroom 
                    lineIdx={lineIdx} 
                    setLineIdx={setLineIdx} 
                    discovered={discovered} 
                    selected={selected} 
                    setSelected={setSelected} 
                    onObjection={handleObjection} 
                    gotcha={gotcha}
                    wrongMsg={wrongMsg}
                />
            )}
            {phase === "verdict" && (
                <Verdict status={verdictStatus} onRestart={() => {
                    setDiscovered([]); setSelected(null); setLineIdx(0); setVerdictStatus(null); setPhase("title");
                }} />
            )}
        </div>
    );
}

// ─── 1. TITLE SCREEN ─────────────────────────────────────────────────────────
function TitleScreen({ onStart }) {
    return (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black">
            <div className="absolute inset-0 bg-cover bg-center opacity-30" style={{ backgroundImage: "url('https://placehold.co/1280x720/111/444?text=Historical+Battlefield')" }} />
            <div className="z-10 text-center">
                <h2 className="text-red-600 text-2xl tracking-[0.5em] font-bold mb-4">NĂM 938 — SÔNG BẠCH ĐẰNG</h2>
                <h1 className="text-[120px] font-black mb-2 text-white drop-shadow-[0_0_20px_rgba(255,0,0,0.8)]">SỬ ÁN</h1>
                <h3 className="text-3xl tracking-[0.4em] text-gray-400 mb-16">CHRONOS ATTORNEY</h3>
                <button 
                    onClick={onStart}
                    className="px-12 py-5 bg-red-700 hover:bg-red-600 text-white font-bold text-3xl border-4 border-double border-white shadow-[8px_8px_0_rgba(255,0,0,0.5)] transition-transform hover:scale-110"
                >
                    BẮT ĐẦU ĐIỀU TRA ►
                </button>
            </div>
        </div>
    );
}

// ─── 2. SCENE INTRO ──────────────────────────────────────────────────────────
function SceneIntro({ onContinue }) {
    const [step, setStep] = useState(0);
    const current = SCENES[step];

    return (
        <div className="absolute inset-0 bg-black p-20 flex flex-col justify-center">
            <div className="absolute inset-0 bg-cover bg-center opacity-20" style={{ backgroundImage: "url('https://placehold.co/1280x720/111/333?text=River+Bank')" }} />
            <div className="z-10 max-w-5xl mx-auto">
                <h3 className="text-red-600 font-bold tracking-widest mb-4 text-2xl">HỒ SƠ VỤ ÁN ({step + 1}/{SCENES.length})</h3>
                <h1 className="text-6xl font-black text-white mb-8 border-b-4 border-red-600 pb-4 inline-block">{current.label}</h1>
                <p className="text-4xl leading-normal text-gray-300 font-mono mb-16 border-l-8 border-red-600 pl-8 bg-black/60 p-8 min-h-[200px]">
                    <TypewriterText key={step} text={current.text} speed={25} />
                </p>
                <button 
                    onClick={() => step < SCENES.length - 1 ? setStep(step + 1) : onContinue()}
                    className="px-10 py-4 bg-white text-black font-bold text-2xl hover:bg-gray-300 border-4 border-black shadow-[6px_6px_0_rgba(255,0,0,1)] transition-transform hover:-translate-y-1"
                >
                    {step < SCENES.length - 1 ? "TIẾP THEO ►" : "KHÁM NGHIỆM HIỆN TRƯỜNG ►"}
                </button>
            </div>
        </div>
    );
}

// ─── 3. INVESTIGATION ────────────────────────────────────────────────────────
function Investigation({ discovered, setDiscovered, onProceed }) {
    const [examining, setExamining] = useState(null);

    const handleExamine = (ev) => {
        setExamining(ev);
        if (!discovered.includes(ev.id)) {
            setDiscovered([...discovered, ev.id]);
        }
    };

    const allDiscovered = discovered.length === EVIDENCE.length;

    return (
        <div className="absolute inset-0 flex bg-gray-900">
            {/* Left List */}
            <div className="w-[450px] bg-black border-r-4 border-gray-700 p-8 flex flex-col overflow-y-auto">
                <h2 className="text-4xl font-black text-white mb-8 border-b-4 border-red-600 pb-4">HIỆN TRƯỜNG</h2>
                <div className="flex-1 space-y-4">
                    {EVIDENCE.map(ev => {
                        const isFound = discovered.includes(ev.id);
                        return (
                            <button 
                                key={ev.id}
                                onClick={() => handleExamine(ev)}
                                className={`w-full text-left p-6 border-2 transition-all ${isFound ? 'border-red-500 bg-red-900/30 text-white' : 'border-gray-600 bg-gray-800 text-gray-400 hover:border-gray-400'}`}
                            >
                                <div className="font-bold text-2xl">{isFound ? ev.name : "??? (Chưa kiểm tra)"}</div>
                            </button>
                        );
                    })}
                </div>
                {allDiscovered && (
                    <button 
                        onClick={onProceed}
                        className="mt-8 px-6 py-5 bg-red-700 text-white font-bold text-2xl border-4 border-white shadow-[6px_6px_0_rgba(255,0,0,0.5)] animate-pulse"
                    >
                        ĐẾN PHIÊN TÒA ►
                    </button>
                )}
            </div>
            
            {/* Right Details */}
            <div className="flex-1 p-12 flex flex-col items-center justify-center relative">
                <div className="absolute inset-0 opacity-10 bg-[url('https://placehold.co/1280x720/000/FFF?text=Grid')] pointer-events-none" />
                
                {examining ? (
                    <div className="bg-black/90 border-4 border-red-500 p-12 max-w-3xl text-center shadow-[0_0_40px_rgba(255,0,0,0.3)] animate-fadeIn z-10">
                        <div className="w-64 h-64 mx-auto mb-8 border-4 border-white bg-gray-800 flex items-center justify-center bg-cover" style={{ backgroundImage: `url('https://placehold.co/400x400/333/FFF?text=${examining.name.replace(/\s/g, '+')}')` }} />
                        <h1 className="text-5xl font-black text-white mb-6">{examining.name}</h1>
                        <p className="text-2xl text-gray-300 font-mono mb-8 leading-relaxed text-left">{examining.description}</p>
                        {examining.anomaly && (
                            <div className="inline-block px-6 py-3 bg-red-600 text-white font-bold tracking-widest border-2 border-white animate-pulse text-xl">
                                ⚠ PHÁT HIỆN LỖI THỜI GIAN: {examining.eraLabel}
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="text-4xl text-gray-500 font-bold tracking-widest text-center opacity-50 z-10 bg-black/50 p-8 border-4 border-gray-700 border-dashed">
                        HÃY CHỌN MỘT VẬT CHỨNG BÊN TRÁI<br/>ĐỂ KIỂM TRA
                    </div>
                )}
            </div>
        </div>
    );
}

// ─── 4. COURTROOM ────────────────────────────────────────────────────────────
function Courtroom({ lineIdx, setLineIdx, discovered, selected, setSelected, onObjection, gotcha, wrongMsg }) {
    const current = TESTIMONY[lineIdx];
    const availableEvidence = EVIDENCE.filter((e) => discovered.includes(e.id));
    const [showSidebar, setShowSidebar] = useState(false);

    return (
        <div className="absolute inset-0">
            {/* Background Image Placeholder */}
            <div className="absolute inset-0 bg-cover bg-center opacity-40" style={{ backgroundImage: "url('https://placehold.co/1280x720/222/555?text=Courtroom+Background')" }} />

            {/* Character Sprite Placeholder */}
            <div className="absolute inset-x-0 bottom-[15%] flex justify-center pointer-events-none">
                <div 
                    className="w-[500px] h-[750px] bg-center bg-no-repeat bg-contain animate-breathe drop-shadow-[0_0_20px_rgba(0,0,0,0.8)]"
                    style={{ backgroundImage: "url('https://placehold.co/500x750/transparent/white?text=Ly+Dai+Sprite')" }}
                />
            </div>

            {/* Top UI */}
            <div className="absolute top-0 left-0 right-0 p-8 flex justify-between z-10">
                <div>
                    <h1 className="text-5xl font-black text-red-500 drop-shadow-md tracking-widest mb-2">THẨM VẤN</h1>
                    <h2 className="text-2xl text-white tracking-widest font-bold">LỜI KHAI {lineIdx + 1} / {TESTIMONY.length}</h2>
                </div>
                <button 
                    onClick={() => setShowSidebar(!showSidebar)}
                    className="px-8 py-3 bg-black/90 text-white font-bold text-xl tracking-widest border-2 border-gray-400 hover:border-white hover:text-yellow-400 shadow-[6px_6px_0_rgba(0,0,0,0.8)] transition-transform hover:scale-105"
                >
                    {showSidebar ? "ĐÓNG TÚI VẬT CHỨNG" : "MỞ TÚI VẬT CHỨNG"}
                </button>
            </div>

            {/* Evidence Sidebar */}
            {showSidebar && (
                <div className="absolute top-28 right-8 w-[400px] bottom-[35%] bg-black/95 border-4 border-double border-gray-400 p-6 z-20 overflow-y-auto shadow-2xl">
                    <h2 className="text-yellow-400 text-2xl font-bold mb-6 tracking-widest border-b-2 border-gray-600 pb-4">TÚI VẬT CHỨNG</h2>
                    <div className="space-y-4">
                        {availableEvidence.map(ev => {
                            const isSel = selected === ev.id;
                            return (
                                <div 
                                    key={ev.id} 
                                    onClick={() => setSelected(isSel ? null : ev.id)}
                                    className={`p-5 border-4 cursor-pointer transition-colors ${isSel ? 'bg-red-900 border-red-500' : 'bg-black border-gray-600 hover:border-white hover:bg-white/10'}`}
                                >
                                    <div className="text-white font-bold text-xl">{ev.name}</div>
                                    <div className="text-gray-400 text-sm mt-2 font-mono tracking-widest">{ev.eraLabel}</div>
                                </div>
                            )
                        })}
                    </div>
                </div>
            )}

            {/* Wrong message overlay */}
            {wrongMsg && (
                <div className="absolute top-[25%] left-1/2 transform -translate-x-1/2 bg-black/90 border-4 border-red-600 px-10 py-6 text-3xl font-bold text-red-500 z-50 animate-pulse shadow-[0_0_30px_rgba(255,0,0,0.5)]">
                    {!selected ? "✗ BẠN PHẢI CHỌN MỘT VẬT CHỨNG ĐỂ PHẢN ĐỐI!" : "✗ VẬT CHỨNG NÀY KHÔNG MÂU THUẪN VỚI LỜI KHAI NÀY!"}
                </div>
            )}

            {/* Dialogue Box Area */}
            <div className="absolute bottom-0 left-0 w-full h-[32%] bg-black/85 border-t-4 border-double border-gray-400 p-8 flex flex-col justify-center z-10 shadow-[0_-10px_20px_rgba(0,0,0,0.5)] backdrop-blur-sm">
                
                {/* Selected Evidence Indicator */}
                {selected && (
                    <div className="absolute -top-16 right-16 bg-red-800 text-white px-8 py-3 border-2 border-white shadow-[6px_6px_0_rgba(0,0,0,1)] animate-pulse font-bold tracking-widest flex items-center gap-2 text-xl">
                        <span>ĐANG CHỌN: {EVIDENCE.find(e => e.id === selected)?.name}</span>
                    </div>
                )}

                {/* Name Badge */}
                <div className="absolute -top-8 left-16 bg-gray-200 text-black border-4 border-black px-10 py-2 transform -skew-x-12 shadow-[6px_6px_0_rgba(0,0,0,0.8)]">
                    <span className="block transform skew-x-12 font-black text-4xl tracking-widest">
                        {current.speaker}
                    </span>
                </div>

                {/* Text Area */}
                <div className="text-white text-3xl leading-relaxed font-mono mt-6 ml-8 drop-shadow-md w-[75%]">
                    <TypewriterText key={current.id} text={`"${current.text}"`} speed={35} />
                </div>

                {/* Action Buttons */}
                <div className="absolute bottom-8 right-12 flex gap-4">
                    <button 
                        onClick={onObjection}
                        className="px-8 py-4 bg-red-700 text-white font-black text-3xl tracking-widest border-4 border-red-400 hover:border-white shadow-[6px_6px_0_rgba(255,0,0,0.5)] transition-transform hover:scale-105"
                    >
                        PHẢN ĐỐI!
                    </button>
                    <div className="flex gap-2 border-4 border-gray-600 bg-black/50 p-1">
                        <button 
                            onClick={() => lineIdx > 0 && setLineIdx(lineIdx - 1)}
                            className={`px-6 py-4 font-bold text-3xl transition-colors ${lineIdx > 0 ? 'text-white hover:bg-white hover:text-black' : 'text-gray-700'}`}
                            disabled={lineIdx === 0}
                        >
                            ◀
                        </button>
                        <button 
                            onClick={() => lineIdx < TESTIMONY.length - 1 && setLineIdx(lineIdx + 1)}
                            className={`px-6 py-4 font-bold text-3xl transition-colors ${lineIdx < TESTIMONY.length - 1 ? 'text-white hover:bg-white hover:text-black' : 'text-gray-700'}`}
                            disabled={lineIdx === TESTIMONY.length - 1}
                        >
                            ▶
                        </button>
                    </div>
                </div>
            </div>

            {/* "Gotcha" Graphic (PHẢN ĐỐI!) */}
            {gotcha && (
                <div className="absolute inset-0 flex items-center justify-center z-50 bg-black/40 pointer-events-none">
                    <div className="animate-ping absolute inset-0 bg-red-600/30" />
                    <h1 
                        className="text-[200px] font-black text-red-600 transform -rotate-12 italic"
                        style={{ 
                            WebkitTextStroke: '6px white', 
                            textShadow: '15px 15px 0 #000, 30px 30px 0 rgba(255,0,0,0.8)',
                            filter: 'drop-shadow(0 0 50px red)'
                        }}
                    >
                        PHẢN ĐỐI!
                    </h1>
                </div>
            )}
        </div>
    );
}

// ─── 5. VERDICT ──────────────────────────────────────────────────────────────
function Verdict({ status, onRestart }) {
    const solved = status === "solved";
    return (
        <div className="absolute inset-0 bg-black flex flex-col items-center justify-center p-20 text-center">
            <h1 className={`text-[100px] font-black mb-12 ${solved ? 'text-red-600 drop-shadow-[0_0_20px_rgba(255,0,0,0.8)]' : 'text-gray-600'}`}>
                {solved ? "NGHỊCH LÝ ĐÃ ĐƯỢC GIẢI" : "BẾ TẮC"}
            </h1>
            <p className="text-3xl font-mono text-gray-300 max-w-5xl mb-16 leading-relaxed bg-black/50 p-10 border-l-8 border-red-600">
                {solved 
                    ? 'Nhân chứng khai nạn nhân mặc "giáp của quân phản loạn thô sơ". Nhưng kỹ thuật đinh tán của Giáp Vảy chứng minh điều ngược lại. Nạn nhân đến từ thời đại 350 năm trong tương lai. Sự dối trá đã bị vạch trần. Dòng thời gian đã được sửa chữa.'
                    : 'Bạn không thể tìm ra kẽ hở trong lời khai. Sự dối trá trở thành lịch sử. Sự bất thường của dòng thời gian sẽ tiếp tục lan rộng và phá hủy 350 năm lịch sử.'}
            </p>
            <button 
                onClick={onRestart}
                className="px-10 py-5 bg-white text-black font-bold text-3xl hover:bg-gray-300 border-4 border-black shadow-[8px_8px_0_rgba(255,0,0,1)] transition-transform hover:-translate-y-1"
            >
                CHƠI LẠI TỪ ĐẦU
            </button>
        </div>
    );
}