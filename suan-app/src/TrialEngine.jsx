import React, { useState, useEffect, useRef } from 'react';
import { Heart, Briefcase, ChevronRight, ChevronLeft, AlertTriangle, Pause, Search } from 'lucide-react';

// Typewriter effect component
function TypewriterText({ text, speed = 30, onComplete, isPaused }) {
    const [disp, setDisp] = useState("");
    useEffect(() => {
        setDisp("");
        let i = 0;
        const t = setInterval(() => {
            if (!isPaused) {
                setDisp(prev => text.slice(0, i + 1));
                i++;
                if (i >= text.length) {
                    clearInterval(t);
                    if (onComplete) onComplete();
                }
            }
        }, speed);
        return () => clearInterval(t);
    }, [text, speed, onComplete, isPaused]);
    return <span>{disp}</span>;
}

export default function TrialEngine({ caseData, onExit }) {
    const [hp, setHp] = useState(5);
    const [currentNodeId, setCurrentNodeId] = useState(caseData.initialNode);
    // Inventory is the object keys of courtRecord in demo
    const inventory = Object.keys(caseData.courtRecord || {}).map(key => ({ id: key, ...caseData.courtRecord[key] }));
    const [selectedEvidence, setSelectedEvidence] = useState(null);
    
    // UI States
    const [lineIdx, setLineIdx] = useState(0);
    const [showInventory, setShowInventory] = useState(false);
    
    // Effects
    const [objectionActive, setObjectionActive] = useState(false);
    const [shakeScreen, setShakeScreen] = useState(false);
    const [hitStop, setHitStop] = useState(false);
    const [damageFlash, setDamageFlash] = useState(false);
    const [deskSlam, setDeskSlam] = useState(false);
    const [showKhoanDa, setShowKhoanDa] = useState(false);
    
    const [msg, setMsg] = useState(null);
    const [isPaused, setIsPaused] = useState(false);
    
    // Timer
    const [timeLeft, setTimeLeft] = useState(30);

    // Current Node Logic
    const currentNode = caseData.nodes[currentNodeId];
    const isCrossExamination = currentNode?.type === "cross_examination";
    
    // Manage expanded lines from pressing
    const [expandedLines, setExpandedLines] = useState([]);

    useEffect(() => {
        setLineIdx(0);
        setExpandedLines([]);
        if (isCrossExamination) {
            setTimeLeft(currentNode.timeLimit || 30);
        }
    }, [currentNodeId, isCrossExamination, currentNode]);

    // Timer Logic
    useEffect(() => {
        if (!isCrossExamination || isPaused || objectionActive || showKhoanDa || hitStop) return;
        
        const t = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 0.1) {
                    triggerDamage();
                    return currentNode.timeLimit || 30;
                }
                return prev - 0.1;
            });
        }, 100);
        return () => clearInterval(t);
    }, [isCrossExamination, isPaused, objectionActive, showKhoanDa, hitStop, currentNode]);

    // Handlers
    const showMessage = (text) => {
        setMsg(text);
        setTimeout(() => setMsg(null), 3000);
    };

    const triggerDamage = () => {
        setHp(prev => prev - (currentNode?.hpPenalty || 1));
        setDamageFlash(true);
        setTimeout(() => setDamageFlash(false), 200);
    };

    const triggerObjectionEffect = (callback) => {
        setHitStop(true);
        setTimeout(() => {
            setHitStop(false);
            setObjectionActive(true);
            setShakeScreen(true);
            setTimeout(() => setShakeScreen(false), 500);
            
            setTimeout(() => {
                setObjectionActive(false);
                if (callback) callback();
            }, 1500);
        }, 400); // Hit stop duration
    };

    const handleObjection = () => {
        if (!selectedEvidence) {
            showMessage("BẠN PHẢI CHỌN MỘT VẬT CHỨNG TRONG HỒ SƠ ĐỂ XUẤT TRÌNH!");
            return;
        }

        if (isCrossExamination) {
            // Check if current line is an expanded line and it matches branch
            const currentLine = getActiveLines()[lineIdx];
            
            const branch = currentNode.branches?.find(b => b.requiredLineId === currentLine.id && b.requiredEvidence === selectedEvidence);
            
            if (branch) {
                if (branch.triggerObjection) {
                    triggerObjectionEffect(() => {
                        setCurrentNodeId(branch.nextNode);
                    });
                } else {
                    setCurrentNodeId(branch.nextNode);
                }
                return;
            }
            
            // Fail
            triggerDamage();
            showMessage(currentNode.defaultFailText || "Bằng chứng này không khớp với lời khai!");
        } else {
            showMessage("Không thể xuất trình lúc này!");
        }
    };

    const handlePress = () => {
        setDeskSlam(true);
        setShowKhoanDa(true);
        setTimeout(() => {
            setDeskSlam(false);
        }, 100);
        
        setTimeout(() => {
            setShowKhoanDa(false);
            
            // Reveal hidden line
            const currentLine = getActiveLines()[lineIdx];
            if (currentLine.pressable && currentNode.hiddenLines && currentNode.hiddenLines[currentLine.id]) {
                const hiddenLine = currentNode.hiddenLines[currentLine.id];
                if (!expandedLines.find(l => l.line.id === hiddenLine.id)) {
                    setExpandedLines(prev => {
                        const next = [...prev, { parentId: currentLine.id, line: hiddenLine }];
                        return next;
                    });
                    // Move to the newly revealed line (which will be right after the current one)
                    setTimeout(() => setLineIdx(prev => prev + 1), 50);
                }
            }
        }, 800);
    };

    // Game Over
    if (hp <= 0) {
        return (
            <div className="w-full h-full bg-black flex flex-col items-center justify-center p-20 select-none">
                <h1 className="text-8xl font-black text-red-700 mb-8 drop-shadow-[0_0_20px_rgba(255,0,0,0.8)] tracking-widest">
                    BẾ TẮC
                </h1>
                <p className="text-3xl text-gray-400 font-mono max-w-4xl text-center mb-16 leading-relaxed bg-gray-900 p-8 border-t-4 border-b-4 border-red-900">
                    Bạn đã thất bại trong việc tìm ra sự thật.
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

    // End Screen
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

    const getActiveLines = () => {
        if (!isCrossExamination) return [];
        let lines = [];
        currentNode.lines.forEach(line => {
            lines.push(line);
            const expanded = expandedLines.filter(el => el.parentId === line.id);
            expanded.forEach(el => lines.push(el.line));
        });
        return lines;
    };

    const activeLines = getActiveLines();
    const currentLineObj = isCrossExamination ? activeLines[lineIdx] : null;
    let currentText = currentNode.text || "";
    if (isCrossExamination) {
        currentText = currentLineObj?.text || "";
    }

    // Main Render
    return (
        <div className={`relative w-full h-full bg-gray-900 overflow-hidden font-sans select-none flex flex-col 
            ${deskSlam ? 'translate-y-4 transition-transform duration-75' : 'transition-transform duration-75'}
            ${shakeScreen ? 'animate-bounce' : ''}
            ${hitStop ? 'invert bg-black' : ''}
        `}>
            {damageFlash && <div className="absolute inset-0 bg-red-500/50 z-50 pointer-events-none" />}
            
            {/* Top Bar (h-12) */}
            <div className="h-12 flex-none bg-black border-b border-gray-700 flex justify-between items-center px-4 z-20 shadow-md">
                <div className="flex items-center gap-4">
                    <h1 className="text-red-500 font-bold tracking-[0.2em] text-sm border border-red-900 px-2 py-0.5 bg-gray-900">
                        {caseData.caseTitle?.toUpperCase()}
                    </h1>
                </div>
                
                {isCrossExamination && (
                    <div className="flex-1 px-8 flex items-center gap-4">
                        <span className="text-white text-xs font-bold tracking-widest whitespace-nowrap">THỜI GIAN</span>
                        <div className="flex-1 h-3 bg-gray-800 border border-gray-600 relative overflow-hidden">
                            <div 
                                className={`absolute left-0 top-0 h-full transition-all duration-100 ease-linear ${timeLeft < 10 ? 'bg-red-500 animate-pulse' : 'bg-green-500'}`}
                                style={{ width: `${(timeLeft / (currentNode.timeLimit || 30)) * 100}%` }}
                            />
                        </div>
                    </div>
                )}
                
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

            {/* Middle Stage */}
            <div className="flex-1 relative flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 bg-black opacity-80 pointer-events-none z-0" />
                <div className="absolute inset-0 bg-cover bg-center pointer-events-none mix-blend-overlay" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1589829085413-56de8ae18c73?q=80&w=1280&auto=format&fit=crop')" }} />
                
                <div className="absolute bottom-0 flex justify-center pointer-events-none z-10">
                    <div 
                        className="w-[500px] h-[600px] bg-center bg-cover border-8 border-gray-800 shadow-[0_0_50px_rgba(0,0,0,0.9)] animate-breathe"
                        style={{ backgroundImage: `url('https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=600&auto=format&fit=crop')` }}
                    >
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-90" />
                    </div>
                </div>

                {/* Action Menu - Top Right */}
                <div className="absolute top-4 right-4 flex flex-col items-end gap-4 z-20">
                    <button 
                        onClick={() => setShowInventory(true)}
                        className={`flex items-center gap-2 px-6 py-3 font-bold tracking-widest text-lg border-4 shadow-[4px_4px_0_rgba(0,0,0,0.9)] transition-all bg-yellow-600 text-white border-yellow-800 hover:bg-yellow-500 hover:scale-105`}
                    >
                        <Briefcase className="w-6 h-6" /> HỒ SƠ
                    </button>
                </div>
            </div>

            {/* Dialogue Box */}
            <div className="h-1/3 w-full bg-black/90 border-t-4 border-gray-400 p-6 relative flex flex-col z-30 shadow-[0_-10px_30px_rgba(0,0,0,0.8)]">
                <div className="absolute -top-6 left-4 bg-white text-black border-4 border-black px-6 py-1 transform -skew-x-12 shadow-[4px_4px_0_rgba(0,0,0,0.8)] z-40">
                    <span className="block transform skew-x-12 font-black text-xl tracking-widest">
                        {isCrossExamination ? (currentLineObj?.speaker || currentNode.speaker) : currentNode.speaker}
                    </span>
                </div>

                <div className="flex-1 mt-4 overflow-y-auto pr-4">
                    <div className="text-white text-3xl leading-relaxed font-mono drop-shadow-md">
                        <TypewriterText key={`${currentNodeId}-${lineIdx}`} text={currentText} speed={25} isPaused={hitStop} />
                    </div>
                </div>

                <div className="mt-4 flex justify-between gap-4 items-end shrink-0 pointer-events-none">
                    <div className="flex gap-4 pointer-events-auto">
                        {isCrossExamination && currentLineObj?.pressable && (
                            <button 
                                onClick={handlePress}
                                className="px-8 py-3 bg-blue-700 text-white font-black text-2xl tracking-[0.1em] border-2 border-blue-400 hover:border-white shadow-[4px_4px_0_rgba(0,0,255,0.6)] transition-transform hover:-translate-y-1 hover:bg-blue-600"
                            >
                                KHOAN ĐÃ!
                            </button>
                        )}
                        {isCrossExamination && (
                            <button 
                                onClick={handleObjection}
                                className="px-8 py-3 bg-red-700 text-white font-black text-2xl tracking-[0.1em] border-2 border-red-400 hover:border-white shadow-[4px_4px_0_rgba(255,0,0,0.6)] transition-transform hover:-translate-y-1 hover:bg-red-600"
                            >
                                XUẤT TRÌNH
                            </button>
                        )}
                    </div>

                    <div className="flex gap-4 pointer-events-auto">
                        {isCrossExamination && (
                            <div className="flex gap-1 border-2 border-gray-600 bg-black p-1">
                                <button 
                                    onClick={() => lineIdx > 0 && setLineIdx(lineIdx - 1)}
                                    className={`p-3 transition-colors ${lineIdx > 0 ? 'text-white hover:bg-white hover:text-black' : 'text-gray-700'}`}
                                    disabled={lineIdx === 0}
                                >
                                    <ChevronLeft className="w-8 h-8" />
                                </button>
                                <button 
                                    onClick={() => lineIdx < activeLines.length - 1 ? setLineIdx(lineIdx + 1) : null}
                                    className={`p-3 transition-colors ${lineIdx < activeLines.length - 1 ? 'text-white hover:bg-white hover:text-black' : 'text-gray-700'}`}
                                    disabled={lineIdx === activeLines.length - 1}
                                >
                                    <ChevronRight className="w-8 h-8" />
                                </button>
                            </div>
                        )}
                        {!isCrossExamination && (
                            <button 
                                onClick={() => setCurrentNodeId(currentNode.nextNode)}
                                className="px-8 py-4 bg-white text-black font-bold text-2xl border-4 border-black hover:bg-gray-300 shadow-[6px_6px_0_rgba(255,255,255,0.3)] transition-transform hover:-translate-y-1 flex items-center gap-2"
                            >
                                TIẾP TỤC <ChevronRight className="w-8 h-8" />
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Overlays */}
            {msg && (
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-black/95 border-4 border-red-600 px-8 py-4 text-2xl font-bold text-red-500 z-50 shadow-[0_0_40px_rgba(255,0,0,0.6)] flex items-center gap-4">
                    <AlertTriangle className="w-8 h-8" /> {msg}
                </div>
            )}

            {objectionActive && (
                <div className="absolute inset-0 flex items-center justify-center z-50 bg-black/60 pointer-events-none backdrop-blur-sm">
                    <h1 
                        className="text-[150px] font-black text-red-600 transform -rotate-12 italic z-10 scale-150 animate-[ping_0.3s_reverse]"
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

            {showKhoanDa && (
                <div className="absolute inset-0 flex items-center justify-center z-50 pointer-events-none">
                    <h1 
                        className="text-[120px] font-black text-blue-500 transform rotate-6 italic z-10 scale-125 animate-pulse"
                        style={{ 
                            WebkitTextStroke: '4px white', 
                            textShadow: '10px 10px 0 #000, 20px 20px 0 rgba(0,0,255,0.8)'
                        }}
                    >
                        KHOAN ĐÃ!
                    </h1>
                </div>
            )}

            {/* Full-Screen Inventory Modal */}
            {showInventory && (
                <div className="absolute inset-0 z-50 bg-[#e6ddc5] flex flex-col font-serif">
                    <div className="h-16 bg-[#2c1810] flex justify-between items-center px-8 border-b-8 border-[#1a0f0a] shadow-lg">
                        <h2 className="text-[#e6ddc5] text-3xl font-bold tracking-[0.3em]">HỒ SƠ VỤ ÁN</h2>
                        <button onClick={() => setShowInventory(false)} className="text-[#e6ddc5] hover:text-white text-xl font-bold border-2 border-[#e6ddc5] px-4 py-1">
                            ĐÓNG [X]
                        </button>
                    </div>
                    <div className="flex-1 flex overflow-hidden p-8 gap-8">
                        {/* Evidence List */}
                        <div className="w-1/3 border-r-4 border-[#8c7355] pr-8 overflow-y-auto space-y-4 scrollbar-thin scrollbar-thumb-[#8c7355] scrollbar-track-transparent">
                            {inventory.map(ev => {
                                const isSelected = selectedEvidence === ev.id;
                                return (
                                    <button 
                                        key={ev.id} 
                                        onClick={() => setSelectedEvidence(isSelected ? null : ev.id)}
                                        className={`w-full text-left p-4 border-4 transition-all ${
                                            isSelected 
                                                ? 'bg-[#8c7355] border-[#2c1810] text-white shadow-inner scale-105' 
                                                : 'bg-[#d4c3a3] border-[#a68f6f] text-[#2c1810] hover:bg-[#c4b393]'
                                        }`}
                                    >
                                        <div className="font-bold text-xl mb-1 truncate">{ev.title}</div>
                                        {isSelected && <div className="text-sm font-bold tracking-widest text-[#2c1810] flex items-center gap-2"><Briefcase className="w-4 h-4"/> ĐANG TRANG BỊ</div>}
                                    </button>
                                )
                            })}
                        </div>
                        {/* Evidence Details */}
                        <div className="flex-1 bg-[#f0e8d5] border-4 border-[#8c7355] p-10 shadow-inner relative">
                            {selectedEvidence ? (
                                <>
                                    <h3 className="text-4xl font-bold text-[#2c1810] mb-6 border-b-2 border-[#8c7355] pb-4">
                                        {inventory.find(e => e.id === selectedEvidence)?.title}
                                    </h3>
                                    <p className="text-2xl text-[#3a2218] leading-relaxed whitespace-pre-wrap">
                                        {inventory.find(e => e.id === selectedEvidence)?.text}
                                    </p>
                                    <div className="absolute bottom-10 right-10 opacity-20">
                                        <Briefcase className="w-48 h-48 text-[#8c7355]"/>
                                    </div>
                                </>
                            ) : (
                                <div className="h-full flex items-center justify-center text-[#a68f6f] text-2xl font-bold italic">
                                    CHỌN MỘT TÀI LIỆU ĐỂ ĐỌC
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
            
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
