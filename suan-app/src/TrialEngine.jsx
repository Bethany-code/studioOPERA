import React, { useState, useEffect } from 'react';
import { Heart, Briefcase, ChevronRight, ChevronLeft, AlertTriangle, Pause, Search } from 'lucide-react';

// Typewriter effect component
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

export default function TrialEngine({ caseData, onExit }) {
    const [hp, setHp] = useState(5);
    const [currentNodeId, setCurrentNodeId] = useState(caseData.initialNode);
    const [inventory, setInventory] = useState(caseData.inventory || []);
    const [selectedEvidence, setSelectedEvidence] = useState(null);
    
    // UI States
    const [lineIdx, setLineIdx] = useState(0);
    const [showInventory, setShowInventory] = useState(false);
    const [objectionActive, setObjectionActive] = useState(false);
    const [shakeScreen, setShakeScreen] = useState(false);
    const [msg, setMsg] = useState(null); // Temporary messages
    const [isPaused, setIsPaused] = useState(false);
    const [investigationText, setInvestigationText] = useState("");

    const currentNode = caseData.nodes[currentNodeId];

    // Reset line index when moving to a new node
    useEffect(() => {
        setLineIdx(0);
        setInvestigationText("");
    }, [currentNodeId]);

    // Handle game over
    if (hp <= 0) {
        return (
            <div className="w-full h-full bg-black flex flex-col items-center justify-center p-20 select-none">
                <h1 className="text-8xl font-black text-red-700 mb-8 drop-shadow-[0_0_20px_rgba(255,0,0,0.8)] tracking-widest">
                    BẾ TẮC
                </h1>
                <p className="text-3xl text-gray-400 font-mono max-w-4xl text-center mb-16 leading-relaxed bg-gray-900 p-8 border-t-4 border-b-4 border-red-900">
                    Bạn đã hết manh mối. Lời nói dối trở thành sự thật, và dòng thời gian đã bị thay đổi mãi mãi.
                </p>
                <button 
                    onClick={onExit}
                    className="px-12 py-6 bg-red-800 text-white font-bold text-3xl border-4 border-white hover:bg-red-600 transition-colors shadow-[8px_8px_0_rgba(255,0,0,0.5)]"
                >
                    TRỞ VỀ WORKSHOP
                </button>
            </div>
        );
    }

    if (!currentNode) {
        return <div className="text-white">Lỗi Dữ Liệu: Node "{currentNodeId}" không tồn tại.</div>;
    }

    // Handlers
    const showMessage = (text) => {
        setMsg(text);
        setTimeout(() => setMsg(null), 3000);
    };

    const triggerSuccessObjection = (nextNodeId) => {
        setObjectionActive(true);
        setShakeScreen(true);
        setTimeout(() => setShakeScreen(false), 500);
        
        setTimeout(() => {
            setObjectionActive(false);
            setCurrentNodeId(nextNodeId);
        }, 2000);
    };

    const handleObjection = () => {
        if (!selectedEvidence) {
            showMessage("BẠN PHẢI CHỌN MỘT VẬT CHỨNG ĐỂ PHẢN ĐỐI!");
            return;
        }

        if (currentNode.type === "cross_examination") {
            if (lineIdx === currentNode.weakPointIndex) {
                const branch = currentNode.branches.find(b => b.requiredEvidence === selectedEvidence);
                if (branch) {
                    if (branch.triggerObjection) {
                        triggerSuccessObjection(branch.nextNode);
                    } else {
                        setCurrentNodeId(branch.nextNode);
                    }
                    return;
                }
            }
            
            // Fail condition
            const penalty = currentNode.hpPenalty || 1;
            setHp(prev => prev - penalty);
            showMessage(currentNode.defaultFailText || "Bằng chứng này không khớp với lời khai!");
            setShakeScreen(true);
            setTimeout(() => setShakeScreen(false), 300);
        } else {
            showMessage("Không thể phản đối lúc này!");
        }
    };

    const handleInteract = (interactable) => {
        setInvestigationText(interactable.text);
        if (interactable.unlocksEvidence && !inventory.some(e => e.id === interactable.unlocksEvidence)) {
            const evData = caseData.evidenceDatabase[interactable.unlocksEvidence];
            if (evData) {
                setInventory(prev => [...prev, { id: interactable.unlocksEvidence, ...evData }]);
                showMessage(`Đã thu thập: ${evData.name}`);
            }
        }
    };

    // Render end screen node early
    if (currentNode.type === "end_screen") {
        return (
            <div className="w-full h-full bg-black flex flex-col items-center justify-center p-20 select-none">
                <h1 className="text-6xl font-black text-white mb-12 border-b-8 border-red-600 pb-6 drop-shadow-[0_0_15px_rgba(255,0,0,0.5)]">
                    {currentNode.title}
                </h1>
                <p className="text-3xl text-gray-300 font-mono mb-16 max-w-4xl text-center leading-relaxed bg-gray-900/50 p-10 border-4 border-gray-800">
                    {currentNode.text}
                </p>
                <button 
                    onClick={onExit}
                    className="px-10 py-5 bg-white text-black font-bold text-3xl border-4 border-black hover:bg-gray-300 transition-colors shadow-[6px_6px_0_rgba(255,0,0,1)]"
                >
                    HOÀN THÀNH VỤ ÁN
                </button>
            </div>
        );
    }

    // Current text logic
    let currentText = currentNode.text || "";
    if (currentNode.type === "cross_examination") {
        currentText = currentNode.lines[lineIdx];
    } else if (currentNode.type === "investigation") {
        currentText = investigationText || currentNode.description;
    }

    const hasAllEvidence = currentNode.type === "investigation" && 
        currentNode.requiredEvidenceToProceed.every(reqId => inventory.some(e => e.id === reqId));

    return (
        <div className={`relative w-full h-full bg-gray-900 overflow-hidden font-sans select-none flex flex-col ${shakeScreen ? 'animate-shake' : ''}`}>
            
            {/* Top Bar (h-12) */}
            <div className="h-12 flex-none bg-black border-b border-gray-700 flex justify-between items-center px-4 z-20 shadow-md">
                <div className="flex items-center gap-4">
                    <h1 className="text-red-500 font-bold tracking-[0.2em] text-sm border border-red-900 px-2 py-0.5 bg-gray-900">
                        {caseData.caseTitle.toUpperCase()}
                    </h1>
                    <div className="text-gray-300 text-sm font-mono flex items-center gap-2">
                        <span>L/A:</span>
                        <span className="text-white bg-gray-800 px-2 rounded">
                            {currentNode.type === "investigation" ? currentNode.location : "Phiên Tòa"}
                        </span>
                    </div>
                </div>
                
                <div className="flex items-center gap-6">
                    {/* HP Bar */}
                    <div className="flex gap-1 items-center bg-gray-900 border border-gray-700 p-1">
                        {Array.from({ length: 5 }).map((_, i) => (
                            <Heart 
                                key={i} 
                                className={`w-5 h-5 ${i < hp ? 'text-red-600 fill-current drop-shadow-[0_0_5px_rgba(255,0,0,0.8)]' : 'text-gray-700'}`} 
                            />
                        ))}
                    </div>
                    
                    <button onClick={() => setIsPaused(true)} className="text-gray-400 hover:text-white">
                        <Pause className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Middle Stage (flex-1) */}
            <div className="flex-1 relative flex items-center justify-center overflow-hidden">
                {/* Background Image / Atmosphere */}
                <div className="absolute inset-0 bg-cover bg-center opacity-40 pointer-events-none" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1589829085413-56de8ae18c73?q=80&w=1280&auto=format&fit=crop')" }} />
                
                {/* Character Portrait or Scene */}
                {currentNode.type !== "investigation" && (
                    <div className="absolute bottom-0 flex justify-center pointer-events-none">
                        <div 
                            className="w-[450px] h-[550px] bg-center bg-cover border-8 border-gray-800 shadow-[0_0_50px_rgba(0,0,0,0.9)] animate-breathe"
                            style={{ backgroundImage: `url('https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=600&auto=format&fit=crop')` }}
                        >
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                        </div>
                    </div>
                )}
                
                {currentNode.type === "investigation" && (
                    <div className="absolute inset-0 bg-cover bg-center opacity-50 pointer-events-none" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1456324504439-367cee3b3c32?q=80&w=1280&auto=format&fit=crop')" }} />
                )}

                {/* Action Menu (Aligned to RIGHT) */}
                <div className="absolute top-4 right-4 flex flex-col items-end gap-4 z-20">
                    <button 
                        onClick={() => setShowInventory(!showInventory)}
                        className={`flex items-center gap-2 px-4 py-2 font-bold tracking-widest border-2 shadow-[2px_2px_0_rgba(0,0,0,0.8)] transition-all ${
                            showInventory 
                                ? 'bg-white text-black border-black' 
                                : 'bg-black/80 text-white border-gray-400 hover:border-white hover:bg-black'
                        }`}
                    >
                        <Briefcase className="w-5 h-5" /> {showInventory ? "ĐÓNG HỒ SƠ" : "HỒ SƠ VỤ ÁN"}
                    </button>
                    
                    {/* Investigation Actions */}
                    {currentNode.type === "investigation" && (
                        <div className="flex flex-col gap-2 mt-4 items-end">
                            {currentNode.interactables.map(act => {
                                const isDiscovered = inventory.some(e => e.id === act.unlocksEvidence);
                                return (
                                    <button 
                                        key={act.id}
                                        onClick={() => handleInteract(act)}
                                        className={`px-4 py-2 flex items-center gap-2 border-2 shadow-[2px_2px_0_rgba(0,0,0,0.8)] font-bold transition-all ${
                                            isDiscovered 
                                                ? 'bg-gray-800 text-gray-400 border-gray-600' 
                                                : 'bg-black/90 text-white border-yellow-500 hover:bg-yellow-900/30'
                                        }`}
                                    >
                                        <Search className="w-4 h-4" />
                                        {act.name}
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Inventory Sidebar (Floating in Middle Stage) */}
                {showInventory && (
                    <div className="absolute top-16 right-4 w-96 max-h-[80%] bg-black/95 border-4 border-gray-500 p-4 z-30 overflow-y-auto shadow-[0_0_30px_rgba(0,0,0,0.8)] backdrop-blur-md">
                        <h2 className="text-white text-xl font-black mb-4 tracking-widest border-b-4 border-red-700 pb-2">
                            BẰNG CHỨNG
                        </h2>
                        <div className="space-y-3">
                            {inventory.length === 0 && <div className="text-gray-500 italic">Chưa có bằng chứng.</div>}
                            {inventory.map(ev => {
                                const isSelected = selectedEvidence === ev.id;
                                return (
                                    <div 
                                        key={ev.id} 
                                        onClick={() => setSelectedEvidence(isSelected ? null : ev.id)}
                                        className={`p-3 border-2 cursor-pointer transition-all ${
                                            isSelected 
                                                ? 'bg-red-900 border-red-400 shadow-[0_0_15px_rgba(255,0,0,0.5)]' 
                                                : 'bg-gray-900 border-gray-700 hover:border-gray-400'
                                        }`}
                                    >
                                        <div className="text-white font-bold text-lg mb-1">{ev.name}</div>
                                        <div className="text-gray-400 text-xs font-mono leading-relaxed">{ev.desc}</div>
                                        {isSelected && <div className="mt-2 text-red-300 font-bold tracking-widest text-[10px] flex items-center gap-1"><AlertTriangle className="w-3 h-3"/> ĐANG TRANG BỊ</div>}
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                )}
            </div>

            {/* Error Message Overlay (Floating) */}
            {msg && (
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-black/95 border-4 border-red-600 px-8 py-4 text-2xl font-bold text-red-500 z-50 shadow-[0_0_40px_rgba(255,0,0,0.6)] flex items-center gap-4 animate-[shake_0.2s_ease-in-out]">
                    <AlertTriangle className="w-8 h-8" /> {msg}
                </div>
            )}

            {/* Dialogue Box (Fixed h-1/3 bottom-0 w-full) */}
            <div className="h-1/3 w-full bg-black/90 border-t-4 border-gray-500 p-6 relative flex flex-col z-30 shadow-[0_-10px_30px_rgba(0,0,0,0.8)] backdrop-blur-md">
                
                {/* Speaker Name Tag (Absolute positioned above border) */}
                <div className="absolute -top-6 left-4 bg-white text-black border-4 border-black px-6 py-1 transform -skew-x-12 shadow-[4px_4px_0_rgba(0,0,0,0.8)] z-40">
                    <span className="block transform skew-x-12 font-black text-xl tracking-widest">
                        {currentNode.type === "investigation" ? "Suy Luận" : currentNode.speaker}
                    </span>
                </div>

                {/* Status Indicator / Phase Text */}
                {currentNode.type === "cross_examination" && (
                    <div className="absolute top-2 right-4 text-yellow-400 font-mono text-sm tracking-widest border border-yellow-900 bg-black px-2">
                        THẨM VẤN LỜI KHAI ({lineIdx + 1}/{currentNode.lines.length})
                    </div>
                )}
                {selectedEvidence && (
                    <div className="absolute top-2 right-4 bg-red-800 text-white px-3 py-1 border border-white font-bold tracking-widest text-xs flex items-center gap-2">
                        <Briefcase className="w-3 h-3"/> ĐANG TRANG BỊ: {inventory.find(e => e.id === selectedEvidence)?.name}
                    </div>
                )}

                {/* Text Content (overflow-y-auto) */}
                <div className="flex-1 mt-4 overflow-y-auto pr-4 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-transparent">
                    <div className="text-white text-2xl leading-relaxed font-mono drop-shadow-md">
                        <TypewriterText key={`${currentNodeId}-${lineIdx}-${investigationText}`} text={currentText} speed={25} />
                    </div>
                </div>

                {/* Navigation Controls */}
                <div className="mt-4 flex justify-end gap-4 items-center shrink-0">
                    {currentNode.type === "investigation" && hasAllEvidence && (
                        <button 
                            onClick={() => setCurrentNodeId(currentNode.nextNode)}
                            className="px-6 py-3 bg-yellow-500 text-black font-bold text-xl border-2 border-black hover:bg-yellow-400 shadow-[4px_4px_0_rgba(255,255,255,0.3)] transition-transform hover:-translate-y-1 flex items-center gap-2"
                        >
                            ĐÃ TÌM ĐỦ MANH MỐI <ChevronRight className="w-6 h-6" />
                        </button>
                    )}

                    {currentNode.type === "cross_examination" && (
                        <>
                            <div className="flex gap-1 border-2 border-gray-600 bg-black p-1">
                                <button 
                                    onClick={() => lineIdx > 0 && setLineIdx(lineIdx - 1)}
                                    className={`p-2 transition-colors ${lineIdx > 0 ? 'text-white hover:bg-white hover:text-black' : 'text-gray-700'}`}
                                    disabled={lineIdx === 0}
                                >
                                    <ChevronLeft className="w-6 h-6" />
                                </button>
                                <button 
                                    onClick={() => lineIdx < currentNode.lines.length - 1 ? setLineIdx(lineIdx + 1) : null}
                                    className={`p-2 transition-colors ${lineIdx < currentNode.lines.length - 1 ? 'text-white hover:bg-white hover:text-black' : 'text-gray-700'}`}
                                    disabled={lineIdx === currentNode.lines.length - 1}
                                >
                                    <ChevronRight className="w-6 h-6" />
                                </button>
                            </div>
                            <button 
                                onClick={handleObjection}
                                className="px-6 py-3 bg-red-700 text-white font-black text-xl tracking-[0.1em] border-2 border-red-400 hover:border-white shadow-[4px_4px_0_rgba(255,0,0,0.6)] transition-transform hover:-translate-y-1 hover:bg-red-600"
                            >
                                PHẢN ĐỐI!
                            </button>
                        </>
                    )}

                    {currentNode.type === "dialogue" && (
                        <button 
                            onClick={() => setCurrentNodeId(currentNode.nextNode)}
                            className="px-6 py-3 bg-white text-black font-bold text-xl border-2 border-black hover:bg-gray-300 shadow-[4px_4px_0_rgba(255,255,255,0.3)] transition-transform hover:-translate-y-1 flex items-center gap-2"
                        >
                            TIẾP TỤC <ChevronRight className="w-6 h-6" />
                        </button>
                    )}
                </div>
            </div>

            {/* "Gotcha" Graphic (PHẢN ĐỐI!) */}
            {objectionActive && (
                <div className="absolute inset-0 flex items-center justify-center z-50 bg-black/60 pointer-events-none backdrop-blur-sm">
                    <div className="animate-ping absolute inset-0 bg-red-600/40" />
                    <h1 
                        className="text-[150px] font-black text-red-600 transform -rotate-12 italic z-10"
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

            {/* Pause Menu Overlay */}
            {isPaused && (
                <div className="absolute inset-0 z-50 bg-black/90 flex flex-col items-center justify-center backdrop-blur-md">
                    <h1 className="text-5xl font-black text-white mb-10 tracking-[0.2em] border-b-4 border-red-600 pb-4">
                        ĐÃ TẠM DỪNG
                    </h1>
                    <div className="flex flex-col gap-4 w-80">
                        <button 
                            onClick={() => setIsPaused(false)}
                            className="px-6 py-3 bg-white text-black font-bold text-xl border-2 border-black hover:bg-gray-300 shadow-[4px_4px_0_rgba(255,255,255,0.3)] transition-transform hover:-translate-y-1"
                        >
                            TIẾP TỤC
                        </button>
                        <button 
                            onClick={onExit}
                            className="px-6 py-3 bg-red-700 text-white font-bold text-xl border-2 border-red-400 hover:border-white shadow-[4px_4px_0_rgba(255,0,0,0.6)] transition-transform hover:-translate-y-1"
                        >
                            TRỞ VỀ WORKSHOP
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
