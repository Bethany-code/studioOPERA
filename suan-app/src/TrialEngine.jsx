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
    
    // Inventory management
    const [inventoryIds, setInventoryIds] = useState(Object.keys(caseData.courtRecord || {}));
    const inventory = inventoryIds.map(id => ({ 
        id, 
        ...(caseData.evidenceDatabase?.[id] || caseData.courtRecord?.[id]) 
    })).filter(e => e.title);
    
    const [selectedEvidence, setSelectedEvidence] = useState(null);
    
    // UI States
    const [lineIdx, setLineIdx] = useState(0);
    const [showInventory, setShowInventory] = useState(false);
    const [activeInteractable, setActiveInteractable] = useState(null);
    
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
    const isInvestigation = currentNode?.type === "investigation";
    
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
        if (!isCrossExamination || isPaused || objectionActive || showKhoanDa || hitStop || showInventory) return;
        
        const t = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 0.1) {
                    showMessage("Hết thời gian! Hãy bình tĩnh suy nghĩ và nghe lại lời khai từ đầu.");
                    setLineIdx(0);
                    return currentNode.timeLimit || 30;
                }
                return prev - 0.1;
            });
        }, 100);
        return () => clearInterval(t);
    }, [isCrossExamination, isPaused, objectionActive, showKhoanDa, hitStop, showInventory, currentNode]);

    // Handlers
    const showMessage = (text) => {
        setMsg(text);
        setTimeout(() => setMsg(null), 3000);
    };

    const triggerDamage = () => {
        setDamageFlash(true);
        setTimeout(() => setDamageFlash(false), 200);
        setHp(prev => {
            const nextHp = prev - (currentNode?.hpPenalty || 1);
            if (nextHp <= 0) {
                showMessage("Đừng bỏ cuộc! Hãy thử suy luận theo hướng khác.");
                return 1; // Educational forgiveness: Never drop below 1 HP
            }
            return nextHp;
        });
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
            const currentLine = getActiveLines()[lineIdx];
            const branch = currentNode.branches?.find(b => b.requiredLineId === currentLine.id && b.requiredEvidence === selectedEvidence);
            
            if (branch) {
                if (branch.triggerObjection) {
                    triggerObjectionEffect(() => setCurrentNodeId(branch.nextNode));
                } else {
                    setCurrentNodeId(branch.nextNode);
                }
                return;
            }
            
            triggerDamage();
            showMessage(currentNode.defaultFailText || "Bằng chứng này không khớp với lời khai!");
        } else {
            showMessage("Không thể xuất trình lúc này!");
        }
    };

    const handlePress = () => {
        setDeskSlam(true);
        setShowKhoanDa(true);
        setTimeout(() => setDeskSlam(false), 100);
        
        setTimeout(() => {
            setShowKhoanDa(false);
            const currentLine = getActiveLines()[lineIdx];
            if (currentLine.pressable && currentNode.hiddenLines && currentNode.hiddenLines[currentLine.id]) {
                const hiddenLine = currentNode.hiddenLines[currentLine.id];
                if (!expandedLines.find(l => l.line.id === hiddenLine.id)) {
                    setExpandedLines(prev => [...prev, { parentId: currentLine.id, line: hiddenLine }]);
                    setTimeout(() => setLineIdx(prev => prev + 1), 50);
                }
            }
        }, 800);
    };

    const handleKeywordClick = (word, interactable) => {
        if (word === interactable.correctKeyword) {
            if (!inventoryIds.includes(interactable.unlocksEvidence)) {
                setInventoryIds(prev => [...prev, interactable.unlocksEvidence]);
                showMessage("Đã tìm ra manh mối quan trọng!");
            }
            setActiveInteractable(null);
        } else {
            triggerDamage();
            showMessage("Suy luận sai! Hãy đọc kỹ lại.");
        }
    };

    const renderArchiveText = (text, interactable) => {
        const parts = text.split(/\[([^\]]+)\]/g);
        return parts.map((part, index) => {
            if (index % 2 === 1) {
                const isDiscovered = inventoryIds.includes(interactable.unlocksEvidence) && part === interactable.correctKeyword;
                return (
                    <span 
                        key={index} 
                        className={`font-bold transition-colors ${
                            isDiscovered 
                                ? 'text-green-500 cursor-default' 
                                : 'cursor-pointer text-yellow-600 hover:text-yellow-400 border-b-2 border-yellow-600 border-dotted'
                        }`}
                        onClick={() => !isDiscovered && handleKeywordClick(part, interactable)}
                    >
                        {part}
                    </span>
                );
            }
            return <span key={index}>{part}</span>;
        });
    };

    if (!currentNode) return <div className="text-white">Lỗi Dữ Liệu: Node "{currentNodeId}" không tồn tại.</div>;

    if (currentNode.type === "end_screen") {
        return (
            <div className="w-full h-full bg-black flex flex-col items-center justify-center p-20 select-none">
                <h1 className="text-6xl font-black text-white mb-12 border-b-8 border-red-600 pb-6 drop-shadow-[0_0_15px_rgba(255,0,0,0.5)]">{currentNode.title}</h1>
                <p className="text-3xl text-gray-300 font-mono mb-16 max-w-4xl text-center leading-relaxed bg-gray-900/50 p-10 border-4 border-gray-800">{currentNode.text}</p>
                <button onClick={onExit} className="px-10 py-5 bg-white text-black font-bold text-3xl border-4 border-black hover:bg-gray-300 transition-colors shadow-[6px_6px_0_rgba(255,0,0,1)]">
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
    if (isCrossExamination) currentText = currentLineObj?.text || "";

    const hasAllEvidence = isInvestigation && currentNode.requiredEvidence?.every(reqId => inventoryIds.includes(reqId));

    return (
        <div className={`relative w-full h-full bg-gray-900 overflow-hidden font-sans select-none flex flex-col 
            ${deskSlam ? 'translate-y-4 transition-transform duration-75' : 'transition-transform duration-75'}
            ${shakeScreen ? 'animate-bounce' : ''}
            ${hitStop ? 'invert bg-black' : ''}
        `}>
            {damageFlash && <div className="absolute inset-0 bg-red-500/50 z-50 pointer-events-none" />}
            
            {/* Top Bar */}
            <div className="h-12 flex-none bg-black border-b border-gray-700 flex justify-between items-center px-4 z-20 shadow-md">
                <div className="flex items-center gap-6">
                    {/* HP Bar */}
                    <div className="flex gap-1 items-center bg-gray-900 border border-gray-700 p-1">
                        {Array.from({ length: 5 }).map((_, i) => (
                            <Heart key={i} className={`w-5 h-5 ${i < hp ? 'text-red-600 fill-current drop-shadow-[0_0_5px_rgba(255,0,0,0.8)]' : 'text-gray-700'}`} />
                        ))}
                    </div>
                </div>
                
                {isCrossExamination && (
                    <div className="flex-1 px-8 flex items-center gap-4 justify-end">
                        <span className="text-white text-xs font-bold tracking-widest whitespace-nowrap">THỜI GIAN</span>
                        <div className="w-1/2 h-3 bg-gray-800 border border-gray-600 relative overflow-hidden">
                            <div 
                                className={`absolute left-0 top-0 h-full transition-all duration-100 ease-linear ${timeLeft < 10 ? 'bg-red-500 animate-pulse' : 'bg-green-500'}`}
                                style={{ width: `${(timeLeft / (currentNode.timeLimit || 30)) * 100}%` }}
                            />
                        </div>
                    </div>
                )}
                
                <div className="flex items-center gap-4 ml-6">
                    <button onClick={() => setIsPaused(true)} className="text-gray-400 hover:text-white"><Pause className="w-5 h-5" /></button>
                </div>
            </div>

            {/* Middle Stage */}
            <div className="flex-1 relative flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 bg-black opacity-80 pointer-events-none z-0" />
                <div className="absolute inset-0 bg-cover bg-center pointer-events-none mix-blend-overlay" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1589829085413-56de8ae18c73?q=80&w=1280&auto=format&fit=crop')" }} />
                
                {/* Character Sprites */}
                {!isInvestigation && (
                    <div className="absolute bottom-1/3 w-full flex justify-center pointer-events-none z-10">
                        <div className="w-[30vw] min-w-[250px] max-w-[400px] aspect-[4/5] bg-center bg-cover border-8 border-gray-800 shadow-[0_0_50px_rgba(0,0,0,0.9)] animate-breathe" style={{ backgroundImage: `url('https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=600&auto=format&fit=crop')` }}>
                            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-90" />
                        </div>
                    </div>
                )}

                {/* Investigation Location */}
                {isInvestigation && (
                    <div className="absolute top-8 left-8 bg-black/80 border-4 border-yellow-700 px-6 py-3 shadow-[4px_4px_0_rgba(0,0,0,1)] z-20">
                        <h2 className="text-yellow-500 font-black text-2xl tracking-widest">{currentNode.location}</h2>
                    </div>
                )}

                {/* Investigation Interactables */}
                {isInvestigation && !activeInteractable && (
                    <div className="absolute inset-0 top-16 bottom-1/3 z-20 flex items-center justify-center gap-8 px-10">
                        {currentNode.interactables?.map(act => {
                            const isDiscovered = inventoryIds.includes(act.unlocksEvidence);
                            const bgImg = act.id.includes("body") ? "https://images.unsplash.com/photo-1506466010722-395aa2bef877?q=80&w=400" : 
                                          act.id.includes("wound") ? "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?q=80&w=400" : 
                                          "https://images.unsplash.com/photo-1437482078695-73f5ca6c96e2?q=80&w=400";
                            return (
                                <button 
                                    key={act.id}
                                    onClick={() => setActiveInteractable(act)}
                                    className={`relative flex-1 max-w-sm aspect-square border-8 shadow-[10px_10px_0_rgba(0,0,0,0.8)] overflow-hidden group transition-transform hover:-translate-y-4 ${
                                        isDiscovered 
                                            ? 'border-gray-600 grayscale opacity-80' 
                                            : 'border-[#8c7355] hover:border-yellow-500'
                                    }`}
                                >
                                    <div className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110" style={{ backgroundImage: `url(${bgImg})` }} />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-transparent" />
                                    <div className="absolute bottom-6 left-0 right-0 px-4 text-center">
                                        <h3 className={`font-black text-2xl tracking-widest drop-shadow-[0_2px_4px_rgba(0,0,0,1)] ${isDiscovered ? 'text-gray-400' : 'text-yellow-500'}`}>{act.name}</h3>
                                        <div className="mt-4 flex justify-center">
                                            <Search className={`w-10 h-10 ${isDiscovered ? 'text-gray-600' : 'text-white animate-pulse'}`} />
                                        </div>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                )}

                {/* Investigation Archive Modal (Tàng Thư Các) */}
                {activeInteractable && (
                    <div className="absolute inset-0 bg-black/90 z-30 flex items-center justify-center p-12 backdrop-blur-sm">
                        <div className="bg-[#2c1810] border-8 border-[#8c7355] w-full max-w-4xl p-10 relative shadow-[0_0_50px_rgba(0,0,0,1)]">
                            <button 
                                onClick={() => setActiveInteractable(null)} 
                                className="absolute -top-6 -right-6 bg-red-800 border-4 border-black text-white px-6 py-2 font-black text-xl hover:bg-red-600 shadow-[4px_4px_0_rgba(0,0,0,1)]"
                            >
                                X
                            </button>
                            <h3 className="text-yellow-500 text-4xl font-black mb-8 border-b-4 border-[#8c7355] pb-4">TÀNG THƯ CÁC: {activeInteractable.name}</h3>
                            <div className="bg-[#f0e8d5] p-8 border-4 border-[#1a0f0a] font-serif text-3xl leading-relaxed text-[#2c1810] shadow-inner">
                                {renderArchiveText(activeInteractable.archiveText, activeInteractable)}
                            </div>
                            <p className="mt-6 text-gray-400 font-mono text-center italic">* Nhấp vào những từ khóa đáng ngờ để tìm manh mối *</p>
                        </div>
                    </div>
                )}

                {/* Action Menu - Top Right */}
                {!isInvestigation && (
                    <div className="absolute top-4 right-4 flex flex-col items-end gap-4 z-20">
                        <button 
                            onClick={() => setShowInventory(true)}
                            className={`flex items-center gap-2 px-6 py-3 font-bold tracking-widest text-lg border-4 shadow-[4px_4px_0_rgba(0,0,0,0.9)] transition-all bg-yellow-600 text-white border-yellow-800 hover:bg-yellow-500 hover:scale-105`}
                        >
                            <Briefcase className="w-6 h-6" /> HỒ SƠ
                        </button>
                    </div>
                )}
            </div>

            {/* Dialogue Box */}
            <div className="h-1/3 w-full bg-black/95 border-t-4 border-gray-400 p-6 relative flex flex-col z-30 absolute bottom-0">
                {!isInvestigation && (
                    <div className="absolute -top-6 left-4 bg-white text-black border-4 border-black px-6 py-1 transform -skew-x-12 shadow-[4px_4px_0_rgba(0,0,0,0.8)] z-40">
                        <span className="block transform skew-x-12 font-black text-xl tracking-widest">
                            {isCrossExamination ? (currentLineObj?.speaker || currentNode.speaker) : currentNode.speaker}
                        </span>
                    </div>
                )}

                <div className="flex-1 mt-4 overflow-y-auto pr-4">
                    <div className="text-white text-3xl leading-relaxed font-mono drop-shadow-md">
                        {!isInvestigation && <TypewriterText key={`${currentNodeId}-${lineIdx}`} text={currentText} speed={25} isPaused={hitStop} />}
                        {isInvestigation && (
                            <div className="text-gray-400 italic text-2xl">
                                Bạn đang ở trong khu vực khám nghiệm. Hãy tìm kiếm các manh mối xung quanh.
                            </div>
                        )}
                    </div>
                </div>

                <div className="mt-4 flex justify-between gap-4 items-end shrink-0 pointer-events-none">
                    <div className="flex gap-4 pointer-events-auto">
                        {isCrossExamination && currentLineObj?.pressable && (
                            <button onClick={handlePress} className="px-8 py-3 bg-blue-700 text-white font-black text-2xl tracking-[0.1em] border-2 border-blue-400 hover:border-white shadow-[4px_4px_0_rgba(0,0,255,0.6)] transition-transform hover:-translate-y-1 hover:bg-blue-600">
                                KHOAN ĐÃ!
                            </button>
                        )}
                        {isCrossExamination && (
                            <button onClick={handleObjection} className="px-8 py-3 bg-red-700 text-white font-black text-2xl tracking-[0.1em] border-2 border-red-400 hover:border-white shadow-[4px_4px_0_rgba(255,0,0,0.6)] transition-transform hover:-translate-y-1 hover:bg-red-600">
                                XUẤT TRÌNH
                            </button>
                        )}
                    </div>

                    <div className="flex gap-4 pointer-events-auto">
                        {isCrossExamination && (
                            <div className="flex gap-1 border-2 border-gray-600 bg-black p-1">
                                <button onClick={() => lineIdx > 0 && setLineIdx(lineIdx - 1)} className={`p-3 transition-colors ${lineIdx > 0 ? 'text-white hover:bg-white hover:text-black' : 'text-gray-700'}`} disabled={lineIdx === 0}>
                                    <ChevronLeft className="w-8 h-8" />
                                </button>
                                <button onClick={() => lineIdx < activeLines.length - 1 ? setLineIdx(lineIdx + 1) : null} className={`p-3 transition-colors ${lineIdx < activeLines.length - 1 ? 'text-white hover:bg-white hover:text-black' : 'text-gray-700'}`} disabled={lineIdx === activeLines.length - 1}>
                                    <ChevronRight className="w-8 h-8" />
                                </button>
                            </div>
                        )}
                        {(!isCrossExamination && !isInvestigation) && (
                            <button onClick={() => setCurrentNodeId(currentNode.nextNode)} className="px-8 py-4 bg-white text-black font-bold text-2xl border-4 border-black hover:bg-gray-300 shadow-[6px_6px_0_rgba(255,255,255,0.3)] transition-transform hover:-translate-y-1 flex items-center gap-2">
                                TIẾP TỤC <ChevronRight className="w-8 h-8" />
                            </button>
                        )}
                        {isInvestigation && hasAllEvidence && (
                            <button 
                                onClick={() => setCurrentNodeId(currentNode.nextNode)} 
                                className="px-8 py-4 bg-green-600 text-white font-bold text-2xl border-4 border-white hover:bg-green-500 shadow-[0_0_20px_rgba(0,255,0,0.8)] animate-pulse transition-transform hover:-translate-y-1 flex items-center gap-2"
                            >
                                TIẾN VÀO PHIÊN TÒA <ChevronRight className="w-8 h-8" />
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
                    <h1 className="text-[150px] font-black text-red-600 transform -rotate-12 italic z-10 scale-150 animate-[ping_0.3s_reverse]" style={{ WebkitTextStroke: '6px white', textShadow: '15px 15px 0 #000, 30px 30px 0 rgba(255,0,0,0.8)', filter: 'drop-shadow(0 0 50px red)' }}>
                        PHẢN ĐỐI!
                    </h1>
                </div>
            )}

            {showKhoanDa && (
                <div className="absolute inset-0 flex items-center justify-center z-50 pointer-events-none">
                    <h1 className="text-[120px] font-black text-blue-500 transform rotate-6 italic z-10 scale-125 animate-pulse" style={{ WebkitTextStroke: '4px white', textShadow: '10px 10px 0 #000, 20px 20px 0 rgba(0,0,255,0.8)' }}>
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
                        <div className="w-1/3 border-r-4 border-[#8c7355] pr-8 overflow-y-auto space-y-4 scrollbar-thin scrollbar-thumb-[#8c7355] scrollbar-track-transparent">
                            {inventory.length === 0 && <div className="text-[#8c7355] italic text-2xl font-bold text-center mt-10">Chưa có manh mối nào.</div>}
                            {inventory.map(ev => {
                                const isSelected = selectedEvidence === ev.id;
                                return (
                                    <button 
                                        key={ev.id} 
                                        onClick={() => setSelectedEvidence(isSelected ? null : ev.id)}
                                        className={`w-full text-left p-4 border-4 transition-all ${
                                            isSelected ? 'bg-[#8c7355] border-[#2c1810] text-white shadow-inner scale-105' : 'bg-[#d4c3a3] border-[#a68f6f] text-[#2c1810] hover:bg-[#c4b393]'
                                        }`}
                                    >
                                        <div className="font-bold text-xl mb-1 truncate">{ev.title}</div>
                                        {isSelected && <div className="text-sm font-bold tracking-widest text-[#2c1810] flex items-center gap-2"><Briefcase className="w-4 h-4"/> ĐANG TRANG BỊ</div>}
                                    </button>
                                )
                            })}
                        </div>
                        <div className="flex-1 bg-[#f0e8d5] border-4 border-[#8c7355] p-10 shadow-inner relative">
                            {selectedEvidence ? (
                                <>
                                    <h3 className="text-4xl font-bold text-[#2c1810] mb-6 border-b-2 border-[#8c7355] pb-4">{inventory.find(e => e.id === selectedEvidence)?.title}</h3>
                                    <p className="text-2xl text-[#3a2218] leading-relaxed whitespace-pre-wrap">{inventory.find(e => e.id === selectedEvidence)?.text}</p>
                                    <div className="absolute bottom-10 right-10 opacity-20"><Briefcase className="w-48 h-48 text-[#8c7355]"/></div>
                                </>
                            ) : (
                                <div className="h-full flex items-center justify-center text-[#a68f6f] text-2xl font-bold italic">CHỌN MỘT TÀI LIỆU ĐỂ ĐỌC</div>
                            )}
                        </div>
                    </div>
                </div>
            )}
            
            {isPaused && (
                <div className="absolute inset-0 z-50 bg-black/90 flex flex-col items-center justify-center backdrop-blur-md">
                    <h1 className="text-5xl font-black text-white mb-10 tracking-[0.2em] border-b-4 border-red-600 pb-4">ĐÃ TẠM DỪNG</h1>
                    <div className="flex flex-col gap-4 w-80">
                        <button onClick={() => setIsPaused(false)} className="px-6 py-3 bg-white text-black font-bold text-xl border-2 border-black hover:bg-gray-300 shadow-[4px_4px_0_rgba(255,255,255,0.3)] transition-transform hover:-translate-y-1">
                            TIẾP TỤC
                        </button>
                        <button onClick={onExit} className="px-6 py-3 bg-red-700 text-white font-bold text-xl border-2 border-red-400 hover:border-white shadow-[4px_4px_0_rgba(255,0,0,0.6)] transition-transform hover:-translate-y-1">
                            TRỞ VỀ WORKSHOP
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
