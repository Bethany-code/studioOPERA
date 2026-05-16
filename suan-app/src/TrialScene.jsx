import React, { useState, useEffect } from 'react';

const EVIDENCE = [
  { id: 'arrow', name: 'Mũi Tên Đúc Sắt', desc: '[Kiến thức]: Quân Nam Hán chủ yếu dùng cung tre, tên tre. Tên đúc sắt nguyên khối xuyên giáp là đặc trưng của kỵ binh Mông Cổ.' },
  { id: 'tide', name: 'Chiến Thuật Thủy Triều', desc: '[Kiến thức 938]: Tướng Ngô Quyền dụ địch khi triều dâng ngập cọc. Buổi chiều nước rút, cọc nhô lên đâm thủng thuyền địch.' },
  { id: 'armor', name: 'Áo Giáp Lông Thú', desc: '[Kiến thức]: Trang bị giữ ấm chống rét cực độ. Quân thủy chiến phương Nam không sử dụng loại giáp này.' },
  { id: 'tattoo', name: 'Hình xăm SÁT THÁT', desc: '[Kiến thức 1284]: Hào khí Đông A. Các binh sĩ nhà Trần tự xăm hai chữ này lên tay để thể hiện quyết tâm "Giết giặc Thát Đát" (Mông Cổ).' }
];

const SCRIPT = {
  INTRO: [
    { speaker: 'Tướng Ngô Quyền', text: 'Trận chiến năm 938 đã tàn. Tướng Nam Hán là Hoằng Tháo đã bỏ mạng. Nhưng tên tù binh này lại khai nhận một chuyện nực cười về cái xác bí ẩn vướng trên cọc gỗ.' },
    { speaker: 'Thám Tử', text: 'Tôi là Thám tử Thời không. Cái xác này... không thuộc về trận chiến của ngài. Để bảo vệ dòng thời gian, chúng ta phải vạch trần hắn.' }
  ],
  TESTIMONY_1: [
    { speaker: 'Tù Binh Nam Hán', text: 'Trời đất quỷ thần ơi, tha mạng cho con! Con chỉ tự vệ thôi!' },
    { speaker: 'Tù Binh Nam Hán', text: 'Con đang cố bơi xuôi dòng Bạch Đằng để tẩu thoát...' },
    { speaker: 'Tù Binh Nam Hán', text: 'Thì tên phiến quân đó lao đến. Hắn mặc áo vải mỏng manh của dân An Nam!' },
    { speaker: 'Tù Binh Nam Hán', text: 'Con hoảng quá nên dùng cung tre bắn một mũi xuyên qua ngực hắn!' },
    { speaker: 'Tướng Ngô Quyền', text: 'Thám tử, hãy dùng HỒ SƠ BẰNG CHỨNG để tìm ra điểm mâu thuẫn (WEAK POINT) trong lời khai của hắn.' }
  ],
  CROSS_EXAM_1: [
    { speaker: 'Tù Binh Nam Hán', text: 'Trời đất quỷ thần ơi, tha mạng cho con! Con chỉ tự vệ thôi!' },
    { speaker: 'Tù Binh Nam Hán', text: 'Con đang cố bơi xuôi dòng Bạch Đằng để tẩu thoát...' },
    { speaker: 'Tù Binh Nam Hán', text: 'Thì tên phiến quân đó lao đến. Hắn mặc áo vải mỏng manh của dân An Nam!' },
    { speaker: 'Tù Binh Nam Hán', text: 'Con hoảng quá nên dùng cung tre bắn một mũi xuyên qua ngực hắn!', weakPoint: true, correctEvidence: 'arrow' }
  ],
  REBUTTAL_1: [
    { speaker: 'Thám Tử', text: 'Ngươi bắn hắn bằng cung tre? Nực cười!' },
    { speaker: 'Thám Tử', text: 'Vết thương chí mạng trên ngực nạn nhân bị gây ra bởi một mũi tên bọc sắt đặc. Kỹ thuật này là của dân cưỡi ngựa bắn cung phương Bắc, không phải của thủy binh Nam Hán!' },
    { speaker: 'Tù Binh Nam Hán', text: 'Kh... Khốn kiếp! Được rồi, ta thừa nhận ta không bắn hắn! Nhưng ta thực sự đã thấy cái xác đó nổi lên!' }
  ],
  TESTIMONY_2: [
    { speaker: 'Tù Binh Nam Hán', text: 'Lúc đó trời đã nhá nhem tối, nước sông Bạch Đằng đang dâng lên rất cao.' },
    { speaker: 'Tù Binh Nam Hán', text: 'Sóng đánh dữ dội khiến thuyền bè nghiêng ngả.' },
    { speaker: 'Tù Binh Nam Hán', text: 'Và rồi, ta thấy cái xác của hắn trôi lềnh bềnh trên mặt nước, vướng vào một thanh gỗ!' }
  ],
  CROSS_EXAM_2: [
    { speaker: 'Tù Binh Nam Hán', text: 'Lúc đó trời đã nhá nhem tối, nước sông Bạch Đằng đang dâng lên rất cao.' },
    { speaker: 'Tù Binh Nam Hán', text: 'Sóng đánh dữ dội khiến thuyền bè nghiêng ngả.' },
    { speaker: 'Tù Binh Nam Hán', text: 'Và rồi, ta thấy cái xác của hắn trôi lềnh bềnh trên mặt nước, vướng vào một thanh gỗ!', weakPoint: true, correctEvidence: 'tide' }
  ],
  CLIMAX: [
    { speaker: 'Thám Tử', text: 'Ngươi lại nói dối! Càng vùng vẫy, ngươi càng lộ rõ sự thiếu hiểu biết về chiến thuật Bạch Đằng!' },
    { speaker: 'Thám Tử', text: 'Ngươi nói lúc chập choạng tối, nước sông dâng cao? Đúng! Nhưng nạn nhân không hề nổi lềnh bềnh.' },
    { speaker: 'Thám Tử', text: 'Thi thể hắn bị ghim xuyên qua ngực bởi một cọc gỗ lim dưới đáy sông.' },
    { speaker: 'Tướng Ngô Quyền', text: 'Đúng vậy. Ta đã tính toán kỹ. Mũi cọc chỉ lộ ra khi **THỦY TRIỀU RÚT CẠN** vào buổi chiều. Nếu xác trôi đến vào buổi tối lúc nước dâng cao, nó không thể bị ghim sâu xuống đáy sông như thế được!' },
    { speaker: 'Tù Binh Nam Hán', text: 'GAAAAAH! Vậy hắn là ai?! Tại sao hắn lại mặc **Áo giáp lông thú** giữa xứ nóng này?! Các người định vu oan cho ta à?!' },
    { speaker: 'Thám Tử', text: 'Đó chính là câu trả lời. Chiếc áo giáp đó và hình xăm này.', autoFlash: ['armor', 'tattoo'] },
    { speaker: 'Thám Tử', text: 'Ngài Ngô Quyền, hai chữ \'Sát Thát\' trên tay người này không thuộc về thời đại của ngài.' },
    { speaker: 'Thám Tử', text: 'Nó là biểu tượng của Hào khí Đông A. 350 năm sau sự kiện hôm nay, vào năm 1288, Hưng Đạo Vương Trần Quốc Tuấn sẽ học lại chính chiến thuật cọc gỗ của ngài để đánh chìm hạm đội Mông Cổ.' },
    { speaker: 'Thám Tử', text: 'Người đàn ông này là một chiến binh nhà Trần anh dũng. Anh ta tử trận vào năm 1288, và một khe nứt thời gian đã đưa xác anh ta về năm 938.' },
    { speaker: 'Tù Binh Nam Hán', text: 'KHÔNGGGGG! TA CHỈ MƯỢN CÁI XÁC ĐỂ LẬP CÔNG MÀ THÔI! TA KHÔNG BIẾT GÌ VỀ NHÀ TRẦN HAY MÔNG CỔ HẾT!!!', shake: true }
  ],
  DEMO_END: [
    { speaker: 'Tướng Ngô Quyền', text: '350 năm sau, con cháu ta vẫn dùng dòng sông này để giữ nước... Quả là một viễn cảnh hào hùng. Cảm ơn ngươi, Thám tử Thời Không.' },
    { speaker: 'Hệ Thống', text: 'LỖ HỔNG LỊCH SỬ ĐĐƯỢC VÁ.' },
    { speaker: 'Hệ Thống', text: 'Cảm ơn bạn đã chơi bản DEMO. Trong phiên bản chính thức, người chơi có thể:\n- Trải nghiệm hơn 15 vụ án lịch sử từ thời Hai Bà Trưng đến Quang Trung.\n- Mở khóa thư viện "Sử Ký Tí Hon" với hình ảnh AI sinh động.\n- Thi đấu xếp hạng (Ranked Mode) tìm điểm sai lịch sử với người chơi khác.' }
  ]
};

const SPEAKER_COLORS = {
  'Tướng Ngô Quyền': 'bg-red-900/40',
  'Thám Tử': 'bg-blue-900/40',
  'Tù Binh Nam Hán': 'bg-green-900/40',
  'Hệ Thống': 'bg-purple-900/40',
};

function EvidenceMenu({ isOpen, onClose, onPresent, selectedEvidence, setSelectedEvidence }) {
  if (!isOpen) return null;
  return (
    <div className="absolute inset-0 bg-black/95 z-50 flex flex-col p-8 text-white animate-in fade-in duration-200">
      <div className="flex justify-between items-center mb-8 border-b-4 border-gray-700 pb-4">
        <h2 className="text-4xl font-black text-yellow-500 tracking-widest drop-shadow-md">HỒ SƠ BẰNG CHỨNG</h2>
        <button onClick={onClose} className="text-2xl font-bold text-gray-400 hover:text-red-400 transition-colors">✖ ĐÓNG (ESC)</button>
      </div>
      
      <div className="flex-1 flex gap-8 h-full overflow-hidden">
        <div className="w-1/3 space-y-4 overflow-y-auto pr-4 custom-scrollbar">
          {EVIDENCE.map(item => (
            <button 
              key={item.id}
              onClick={() => setSelectedEvidence(item.id)}
              className={`w-full text-left p-5 border-4 rounded-xl transition-all ${selectedEvidence === item.id ? 'bg-blue-900 border-blue-400 scale-105 shadow-[0_0_15px_rgba(96,165,250,0.5)]' : 'bg-gray-800 border-gray-600 hover:bg-gray-700 hover:border-gray-500'}`}
            >
              <div className="font-bold text-xl">{item.name}</div>
            </button>
          ))}
        </div>
        
        <div className="w-2/3 bg-gray-900 border-4 border-gray-600 rounded-xl p-8 flex flex-col relative overflow-hidden shadow-inner">
          {selectedEvidence ? (
            <div className="animate-in slide-in-from-right-8 duration-300 h-full flex flex-col">
              {(() => {
                const item = EVIDENCE.find(e => e.id === selectedEvidence);
                return (
                  <>
                    <div className="absolute -top-10 -right-10 text-9xl opacity-5">🔍</div>
                    <h3 className="text-4xl font-black mb-6 text-blue-300 drop-shadow-md">{item.name}</h3>
                    <p className="text-2xl leading-relaxed whitespace-pre-wrap text-gray-200 font-medium z-10">{item.desc}</p>
                    <div className="mt-auto flex justify-end z-10 pt-8 border-t-2 border-gray-700">
                      <button 
                        onClick={() => onPresent(item.id)}
                        className="px-10 py-5 bg-red-600 hover:bg-red-500 text-white font-black text-2xl rounded-xl shadow-[0_0_20px_rgba(220,38,38,0.8)] animate-pulse hover:scale-105 transition-transform tracking-widest border-2 border-red-300"
                      >
                        XUẤT TRÌNH CỚ NÀY!
                      </button>
                    </div>
                  </>
                )
              })()}
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-gray-500 text-2xl font-bold italic animate-pulse">
              Chọn một bằng chứng để xem chi tiết
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function DialogueBox({ speaker, text, onNext, isCrossExam, onPrev, onPresent }) {
  const [displayLength, setDisplayLength] = useState(0);
  const totalLength = text.replace(/\*\*/g, '').length;
  const isTyping = displayLength < totalLength;

  useEffect(() => {
    setDisplayLength(0);
    const timer = setInterval(() => {
      setDisplayLength(l => Math.min(l + 1, totalLength));
    }, 30);
    return () => clearInterval(timer);
  }, [text, totalLength]);

  const handleClick = () => {
    if (isTyping) {
      setDisplayLength(totalLength);
    } else if (!isCrossExam) {
      if (onNext) onNext();
    }
  };

  const renderTypedText = () => {
    let count = 0;
    const elements = [];
    const lines = text.split('\n');
    
    lines.forEach((line, lineIdx) => {
      const parts = line.split(/(\*\*.*?\*\*)/g);
      parts.forEach((part, partIdx) => {
        const isBold = part.startsWith('**') && part.endsWith('**');
        const actualText = isBold ? part.slice(2, -2) : part;
        
        if (count >= displayLength) return;
        
        const remainingChars = displayLength - count;
        const textToShow = actualText.slice(0, remainingChars);
        count += actualText.length;
        
        elements.push(
          isBold ? (
            <strong key={`${lineIdx}-${partIdx}`} className="text-red-400 font-bold text-[1.1em] drop-shadow-[0_0_8px_rgba(248,113,113,0.8)]">
              {textToShow}
            </strong>
          ) : (
            <span key={`${lineIdx}-${partIdx}`}>{textToShow}</span>
          )
        );
      });
      
      if (count < displayLength && lineIdx < lines.length - 1) {
        elements.push(<br key={`br-${lineIdx}`} />);
        count++; 
      }
    });
    return elements;
  };

  return (
    <div 
      onClick={!isCrossExam ? handleClick : undefined} 
      className={`absolute bottom-0 w-full h-[32%] bg-black/85 border-t-[6px] border-double border-gray-400 flex flex-col z-20 shadow-[0_-10px_30px_rgba(0,0,0,0.8)] ${!isCrossExam ? 'cursor-pointer hover:bg-black/90 transition-colors' : ''}`}
    >
      {speaker && (
        <div className="absolute -top-12 left-6 bg-gray-900 border-4 border-gray-400 px-8 py-2 text-blue-300 font-black text-2xl rounded-t-lg drop-shadow-xl shadow-black z-30 tracking-wide">
          {speaker}
        </div>
      )}
      
      <div className="flex-1 p-8 pb-20 text-white text-[1.4rem] leading-relaxed font-sans cursor-pointer overflow-y-auto" onClick={isCrossExam ? () => { if (isTyping) setDisplayLength(totalLength); } : undefined}>
        {renderTypedText()}
      </div>

      {!isTyping && !isCrossExam && (
        <div className="absolute bottom-6 right-8 text-red-500 animate-pulse text-4xl font-black drop-shadow-lg">
          ▼
        </div>
      )}

      {!isTyping && isCrossExam && (
        <div className="absolute bottom-5 w-full left-0 px-8 flex justify-between items-center text-sm font-bold z-30">
           <button 
             onClick={(e) => { e.stopPropagation(); onPrev(); }} 
             className="px-6 py-3 border-2 bg-blue-900 border-blue-400 text-white hover:bg-blue-700 transition-colors shadow-lg rounded-lg text-lg flex items-center gap-2"
           >
             <span>◀</span> QUAY LẠI
           </button>
           
           <button 
             onClick={(e) => { e.stopPropagation(); onPresent(); }}
             className="px-12 py-4 bg-red-700 border-4 border-red-400 text-white hover:bg-red-500 hover:scale-105 transition-all text-2xl drop-shadow-2xl font-black tracking-widest rounded-xl shadow-[0_0_20px_rgba(220,38,38,0.6)]"
           >
             XUẤT TRÌNH (E)
           </button>

           <button 
             onClick={(e) => { e.stopPropagation(); onNext(); }} 
             className="px-6 py-3 border-2 bg-blue-900 border-blue-400 text-white hover:bg-blue-700 transition-colors shadow-lg rounded-lg text-lg flex items-center gap-2"
           >
             TIẾP THEO <span>▶</span>
           </button>
        </div>
      )}
    </div>
  );
}

export default function TrialScene() {
  const [phase, setPhase] = useState('DISCLAIMER');
  const [currentLine, setCurrentLine] = useState(0);
  const [hp, setHp] = useState(5);
  const [selectedEvidence, setSelectedEvidence] = useState(null);
  const [evidenceMenuOpen, setEvidenceMenuOpen] = useState(false);
  
  const [objectionTriggered, setObjectionTriggered] = useState(false);
  const [shakeScreen, setShakeScreen] = useState(false);
  const [flashMsg, setFlashMsg] = useState(null);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key.toLowerCase() === 'e' && phase !== 'DISCLAIMER' && phase !== 'DEMO_END' && hp > 0) {
        setEvidenceMenuOpen(prev => !prev);
      }
      if (e.key === 'Escape') {
        setEvidenceMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [phase, hp]);

  const scriptLines = SCRIPT[phase] || [];
  const currentLineData = scriptLines[currentLine];
  const isCrossExam = phase.includes('CROSS_EXAM');

  const advancePhase = () => {
    switch (phase) {
      case 'INTRO': setPhase('TESTIMONY_1'); break;
      case 'TESTIMONY_1': setPhase('CROSS_EXAM_1'); break;
      case 'REBUTTAL_1': setPhase('TESTIMONY_2'); break;
      case 'TESTIMONY_2': setPhase('CROSS_EXAM_2'); break;
      case 'CLIMAX': setPhase('DEMO_END'); break;
      default: break;
    }
    setCurrentLine(0);
  };

  const handleNext = () => {
    if (isCrossExam) {
      setCurrentLine(c => (c + 1) % scriptLines.length);
    } else {
      if (currentLine < scriptLines.length - 1) {
        setCurrentLine(c => c + 1);
      } else {
        advancePhase();
      }
    }
  };

  const handlePrev = () => {
    if (isCrossExam) {
      setCurrentLine(c => (c - 1 + scriptLines.length) % scriptLines.length);
    }
  };

  const handlePresentEvidence = (evidenceId) => {
    setEvidenceMenuOpen(false);
    
    if (currentLineData && currentLineData.weakPoint && currentLineData.correctEvidence === evidenceId) {
      setObjectionTriggered(true);
      setTimeout(() => {
        setObjectionTriggered(false);
        if (phase === 'CROSS_EXAM_1') setPhase('REBUTTAL_1');
        if (phase === 'CROSS_EXAM_2') setPhase('CLIMAX');
        setCurrentLine(0);
        setSelectedEvidence(null);
      }, 1500);
    } else {
      setHp(h => Math.max(0, h - 1));
      setShakeScreen(true);
      setFlashMsg("SAI BẰNG CHỨNG! -1 HP");
      setTimeout(() => {
        setShakeScreen(false);
        setFlashMsg(null);
      }, 1000);
    }
  };

  if (phase === 'DISCLAIMER') {
    return (
      <div className="w-screen h-screen bg-black flex items-center justify-center p-4 font-sans selection:bg-red-500/30">
        <div className="relative w-full max-w-5xl aspect-video bg-black flex flex-col items-center justify-center border-4 border-gray-700 p-12 text-center text-white shadow-[0_0_50px_rgba(0,0,0,1)]">
          <div className="text-5xl font-black text-yellow-500 mb-4 drop-shadow-[0_0_15px_rgba(234,179,8,0.5)] tracking-wider">SỬ ÁN: NGHỊCH LÝ BẠCH ĐẰNG</div>
          <div className="text-2xl font-bold text-gray-400 mb-16 italic tracking-widest">Chronos Attorney: The Bach Dang Paradox</div>
          
          <div className="text-3xl font-mono text-green-400 mb-10 animate-pulse bg-green-900/20 px-8 py-3 border border-green-500/50 rounded">HỆ THỐNG XUYÊN KHÔNG ĐANG KHỞI ĐỘNG...</div>
          <div className="text-xl text-gray-300 mb-4 font-medium">Lưu ý: Đây là phiên bản Demo tham gia TDTU Vibe Coding 2026.</div>
          <div className="text-xl text-yellow-100/70 mb-16 font-medium">Mục tiêu: Áp dụng cơ chế suy luận logic để tìm ra Lỗ hổng Lịch sử.</div>
          
          <button 
            onClick={() => setPhase('INTRO')}
            className="px-12 py-5 bg-blue-800 hover:bg-blue-600 text-white font-black text-3xl border-4 border-blue-400 rounded-xl transition-all hover:scale-110 shadow-[0_0_30px_rgba(37,99,235,0.6)]"
          >
            BẮT ĐẦU DEMO
          </button>
        </div>
      </div>
    );
  }

  if (hp <= 0) {
    return (
      <div className="w-screen h-screen bg-black flex items-center justify-center p-4 font-sans">
        <div className="relative w-full max-w-5xl aspect-video bg-red-950 border-4 border-red-700 flex flex-col items-center justify-center text-center text-white">
          <h1 className="text-8xl font-black text-red-500 mb-8 tracking-widest drop-shadow-[0_0_30px_rgba(239,68,68,0.8)]">THẤT BẠI</h1>
          <p className="text-3xl text-gray-300 mb-16 font-medium">Dòng thời gian đã bị đảo lộn vĩnh viễn...</p>
          <button 
             onClick={() => window.location.reload()}
             className="px-10 py-5 bg-gray-900 hover:bg-gray-800 border-4 border-red-500 text-white font-black text-3xl rounded-xl transition-transform hover:scale-105 shadow-[0_0_20px_rgba(220,38,38,0.4)]"
           >
             THỬ LẠI TRANH LUẬN
           </button>
        </div>
      </div>
    );
  }

  if (phase === 'DEMO_END') {
    const endLines = SCRIPT['DEMO_END'];
    return (
      <div className="w-screen h-screen bg-black flex items-center justify-center p-4 font-sans">
        <div className="relative w-full max-w-5xl aspect-video bg-gray-900 border-4 border-gray-400 p-12 flex flex-col items-center justify-center shadow-2xl overflow-hidden">
           <div className="absolute inset-0 bg-blue-900/10" />
           <h1 className="text-6xl font-black text-yellow-400 mb-12 tracking-widest drop-shadow-[0_0_20px_rgba(250,204,21,0.5)] z-10">HOÀN THÀNH DEMO</h1>
           
           <div className="space-y-8 max-w-4xl text-left z-10 w-full bg-black/60 p-10 rounded-2xl border-2 border-gray-700 shadow-2xl">
             <div className="text-blue-300 font-bold text-2xl leading-relaxed">
               <span className="text-gray-400 uppercase tracking-wider text-xl">{endLines[0].speaker}:</span><br/>
               <span className="text-white font-medium">{endLines[0].text}</span>
             </div>
             
             <div className="text-green-400 font-black text-3xl text-center border-y-2 border-green-600/50 py-6 my-8 animate-pulse bg-green-900/20 tracking-widest">
               {endLines[1].text}
             </div>
             
             <div className="text-gray-200 whitespace-pre-wrap leading-loose text-xl">
               <span className="font-bold text-purple-400 block mb-2">{endLines[2].speaker}:</span>
               {endLines[2].text}
             </div>
           </div>

           <button 
             onClick={() => window.location.reload()}
             className="mt-12 px-12 py-5 bg-yellow-500 hover:bg-yellow-400 text-black font-black text-3xl rounded-xl shadow-[0_0_30px_rgba(234,179,8,0.6)] transition-all hover:scale-110 z-10 border-4 border-yellow-200"
           >
             CHƠI LẠI DEMO
           </button>
        </div>
      </div>
    );
  }

  const bgLayerColor = SPEAKER_COLORS[currentLineData?.speaker] || 'bg-gray-800';
  const isInfiniteShake = currentLineData?.shake;

  return (
    <div className="w-screen h-screen bg-black flex items-center justify-center p-4 font-sans select-none overflow-hidden">
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-12px); }
          20%, 40%, 60%, 80% { transform: translateX(12px); }
        }
        .animate-shake {
          animation: shake 0.5s cubic-bezier(.36,.07,.19,.97) both;
        }
        .animate-shake-infinite {
          animation: shake 0.1s infinite !important;
        }
        .text-shadow-objection {
          text-shadow: 
            -6px -6px 0 #fff, 6px -6px 0 #fff, -6px 6px 0 #fff, 6px 6px 0 #fff,
            -12px -12px 0 #000, 12px -12px 0 #000, -12px 12px 0 #000, 12px 12px 0 #000,
             15px 15px 30px rgba(0,0,0,0.9);
        }
        .flash-msg {
          animation: flashOut 1.2s forwards cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }
        @keyframes flashOut {
          0% { opacity: 0; transform: scale(0.5); }
          20% { opacity: 1; transform: scale(1.1); }
          80% { opacity: 1; transform: scale(1.1); }
          100% { opacity: 0; transform: scale(1.3); }
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(0,0,0,0.3);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(100,116,139,0.8);
          border-radius: 10px;
        }
      `}</style>

      <div className={`relative w-full max-w-5xl aspect-video bg-gray-900 border-[6px] border-gray-700 shadow-[0_0_50px_rgba(0,0,0,1)] overflow-hidden ${shakeScreen ? 'animate-shake' : ''} ${isInfiniteShake ? 'animate-shake-infinite' : ''}`}>
        
        {/* Dynamic Background */}
        <div className={`absolute inset-0 transition-colors duration-700 ${bgLayerColor}`}>
          <div className="absolute bottom-[32%] w-full h-[2px] bg-gray-500/30"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-20 pointer-events-none">
            <div className="w-[900px] h-[500px] border-[30px] border-gray-400 rounded-full blur-[60px]"></div>
          </div>
          {/* subtle stripes */}
          <div className="absolute inset-0 bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,rgba(0,0,0,0.1)_10px,rgba(0,0,0,0.1)_20px)] mix-blend-overlay"></div>
        </div>

        {/* Top Left HP Bar */}
        <div className="absolute top-6 left-6 z-30 flex items-center gap-3 bg-black/60 px-4 py-2 rounded-full border-2 border-gray-600 shadow-lg">
          <span className="text-white font-black text-2xl drop-shadow-md mr-1 tracking-wider text-yellow-400">HP</span>
          {[...Array(5)].map((_, i) => (
            <div 
              key={i} 
              className={`w-8 h-8 rounded-full border-[3px] transition-all duration-300 ${i < hp ? 'bg-green-500 border-green-200 shadow-[0_0_15px_#22c55e]' : 'bg-gray-800 border-gray-600'}`} 
            />
          ))}
        </div>

        {/* Top Right Watermark */}
        <div className="absolute top-6 right-6 z-30 text-gray-400 font-bold text-sm opacity-60 select-none tracking-widest bg-black/40 px-3 py-1 rounded">
          TDTU VIBE CODING 2026 - VERTICAL SLICE DEMO v0.9
        </div>

        {/* Evidence Button Toggle */}
        <button 
          onClick={() => setEvidenceMenuOpen(true)}
          className="absolute top-20 right-6 z-30 bg-blue-800 border-4 border-blue-400 text-white px-6 py-3 font-black text-xl rounded-xl hover:bg-blue-600 shadow-[0_0_20px_rgba(37,99,235,0.5)] transition-transform hover:scale-105"
        >
          HỒ SƠ (E)
        </button>

        {/* Phase Labels overlay */}
        {phase.includes('CROSS_EXAM') && (
          <div className="absolute top-8 left-1/2 transform -translate-x-1/2 z-20 bg-red-700/90 text-white font-black px-8 py-2 border-4 border-red-300 shadow-[0_0_20px_rgba(220,38,38,0.8)] text-2xl tracking-[0.2em] uppercase rounded animate-pulse">
            Cuộc Thẩm Vấn Chéo
          </div>
        )}
        {phase.includes('TESTIMONY') && (
          <div className="absolute top-8 left-1/2 transform -translate-x-1/2 z-20 bg-green-700/90 text-white font-black px-8 py-2 border-4 border-green-300 shadow-[0_0_20px_rgba(22,163,74,0.8)] text-2xl tracking-[0.2em] uppercase rounded">
            Lời Khai Nhân Chứng
          </div>
        )}

        {/* Auto Flash Objects (Climax) */}
        {currentLineData?.autoFlash && (
          <div className="absolute inset-0 flex justify-center items-center pointer-events-none gap-12 z-10 pb-40">
            {currentLineData.autoFlash.map(id => {
              const item = EVIDENCE.find(e => e.id === id);
              return (
                <div key={id} className="bg-gray-900 border-8 border-yellow-500 p-8 rounded-3xl text-center shadow-[0_0_50px_rgba(234,179,8,0.6)] animate-pulse flex flex-col items-center">
                   <div className="text-8xl mb-4 drop-shadow-lg">🔍</div>
                   <div className="text-white text-3xl font-black tracking-widest text-yellow-300">{item.name}</div>
                </div>
              );
            })}
          </div>
        )}

        {/* "PHẢN ĐỐI!" Graphic */}
        {objectionTriggered && (
          <div className="absolute inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <div className="text-red-600 font-black text-[180px] italic tracking-widest text-shadow-objection animate-bounce scale-110 -rotate-3">
              PHẢN ĐỐI!
            </div>
          </div>
        )}

        {/* Flash Message */}
        {flashMsg && (
          <div className="absolute inset-0 z-[60] flex items-center justify-center pointer-events-none">
            <div className="text-red-500 font-black text-7xl flash-msg text-shadow-objection text-center uppercase tracking-widest drop-shadow-2xl">
              {flashMsg}
            </div>
          </div>
        )}

        {/* Dialogue Box */}
        {currentLineData && (
          <DialogueBox 
            key={`${phase}-${currentLine}`}
            speaker={currentLineData.speaker}
            text={currentLineData.text}
            onNext={handleNext}
            onPrev={handlePrev}
            isCrossExam={isCrossExam}
            onPresent={() => setEvidenceMenuOpen(true)}
          />
        )}

        {/* Evidence Menu Modal */}
        <EvidenceMenu 
          isOpen={evidenceMenuOpen}
          onClose={() => setEvidenceMenuOpen(false)}
          onPresent={handlePresentEvidence}
          selectedEvidence={selectedEvidence}
          setSelectedEvidence={setSelectedEvidence}
        />
      </div>
    </div>
  );
}
