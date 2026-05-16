import React, { useState } from 'react';
import { ArrowLeft, Sparkles, Send } from 'lucide-react';

export default function CaseBuilder({ onBack, onPublish }) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedJson, setGeneratedJson] = useState(null);

  const handleGenerate = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      setGeneratedJson(`{
  "caseTitle": "Nghịch Lý Bạch Đằng",
  "initialNode": "investigation_1",
  "courtRecord": {},
  "evidenceDatabase": {
    "arrow": { "title": "Kho Mộc Bản", "text": "Kỵ binh Mông Cổ nổi danh với mũi tên đúc sắt..." },
    "tide": { "title": "Ghi chép Thủy Văn", "text": "Cọc gỗ lim chỉ nhô lên đâm thủng thuyền khi pha triều rút cạn..." },
    "tattoo": { "title": "Hào Khí Đông A", "text": "Năm 1284, binh sĩ tự xăm chữ SÁT THÁT..." }
  },
  "nodes": {
    "investigation_1": {
      "type": "investigation",
      "location": "Bãi cọc ngầm Bạch Đằng (Khám Nghiệm)",
      "interactables": [
        { 
          "id": "inv_body", 
          "name": "Khám nghiệm tử thi", 
          "unlocksEvidence": "tattoo", 
          "archiveText": "Tuy nhiên, thi thể này mặc giáp lông thú và có một [đặc điểm nhận dạng của nhà Trần].",
          "correctKeyword": "đặc điểm nhận dạng của nhà Trần"
        }
      ],
      "requiredEvidence": ["tattoo"],
      "nextNode": "intro_1"
    }
    // ... Additional Nodes (Cross Examination)
  }
}`);
    }, 2000);
  };

  return (
    <div className="w-full h-full bg-gray-900 text-white flex flex-col font-sans">
      <header className="flex items-center p-6 border-b border-gray-800 bg-black">
        <button onClick={onBack} className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
          <ArrowLeft className="w-5 h-5" /> Trở về Hub
        </button>
        <h1 className="ml-auto text-2xl font-bold tracking-widest text-red-500">
          CASE BUILDER <span className="text-gray-500 text-sm">Powered by AI</span>
        </h1>
      </header>

      <div className="flex-1 flex p-6 gap-6 overflow-hidden">
        {/* Left Column */}
        <div className="w-1/2 flex flex-col bg-black p-4 border border-gray-700 rounded-lg shadow-xl relative">
          <div className="absolute inset-0 opacity-10 bg-[url('https://images.unsplash.com/photo-1456324504439-367cee3b3c32?q=80&w=1280')] bg-cover bg-center mix-blend-overlay pointer-events-none" />
          <h2 className="text-lg font-bold mb-4 z-10 flex items-center gap-2">
            1. MÔ TẢ VỤ ÁN LỊCH SỬ <Sparkles className="w-4 h-4 text-yellow-500" />
          </h2>
          <textarea 
            className="flex-1 bg-gray-900 border border-gray-600 rounded p-4 text-gray-300 resize-none focus:outline-none focus:border-red-500 z-10"
            placeholder="Nhập tóm tắt sự kiện lịch sử vào đây... (Ví dụ: Trận Ngọc Hồi Đống Đa)"
          ></textarea>
        </div>

        {/* Right Column */}
        <div className="w-1/2 flex flex-col bg-black p-4 border border-gray-700 rounded-lg shadow-xl relative">
          <h2 className="text-lg font-bold mb-4">2. SINH CẤU TRÚC JSON</h2>
          
          <div className="flex-1 bg-gray-900 border border-gray-600 rounded p-4 overflow-y-auto font-mono text-sm mb-4 relative">
            {isGenerating ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-red-500">
                <div className="w-12 h-12 border-4 border-red-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                <div className="animate-pulse font-bold tracking-widest">ĐANG PHÂN TÍCH LỊCH SỬ...</div>
              </div>
            ) : generatedJson ? (
              <pre className="text-green-400 whitespace-pre-wrap">{generatedJson}</pre>
            ) : (
              <div className="text-gray-600 flex items-center justify-center h-full text-center">
                Dữ liệu JSON sẽ hiển thị ở đây sau khi AI xử lý.
              </div>
            )}
          </div>

          {!generatedJson ? (
            <button 
              onClick={handleGenerate}
              disabled={isGenerating}
              className="w-full py-4 bg-red-600 hover:bg-red-500 text-white font-bold rounded shadow-[0_0_20px_rgba(255,0,0,0.4)] hover:shadow-[0_0_30px_rgba(255,0,0,0.6)] transition-all flex items-center justify-center gap-2"
            >
              <Sparkles className="w-5 h-5" />
              TẠO CẤU TRÚC JSON (Powered by AI)
            </button>
          ) : (
            <button 
              onClick={onPublish}
              className="w-full py-4 bg-white text-black hover:bg-gray-200 font-bold rounded shadow-[0_0_20px_rgba(255,255,255,0.4)] transition-all flex items-center justify-center gap-2"
            >
              <Send className="w-5 h-5" />
              PUBLISH TO WORKSHOP
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
