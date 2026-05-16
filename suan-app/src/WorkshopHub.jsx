import React from 'react';
import { Play, Lock, Star, Shield, Users, Sparkles } from 'lucide-react';

export default function WorkshopHub({ onSelectCase, mockCasePayload, onOpenBuilder }) {
  const cases = [
    {
      id: 1,
      title: "Nghịch Lý Bạch Đằng",
      author: "TDTU_History",
      era: "938 AD",
      rating: "4.9/5",
      tags: ["Trending", "Official"],
      locked: false,
      payload: mockCasePayload,
      cover: "https://images.unsplash.com/photo-1599839619722-39751411ea63?q=80&w=600&auto=format&fit=crop",
    },
    {
      id: 2,
      title: "Bí ẩn Lông ngỗng Mỵ Châu",
      author: "K26_AI_Club",
      era: "Âu Lạc",
      rating: "4.5/5",
      tags: ["Staff Pick", "UGC"],
      locked: true,
      payload: null,
      cover: "https://images.unsplash.com/photo-1604323206456-118ea05e830c?q=80&w=600&auto=format&fit=crop",
    }
  ];

  return (
    <div className="w-full h-full bg-gray-900 text-white flex flex-col font-sans relative overflow-hidden select-none">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-20 bg-cover bg-center pointer-events-none" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1589829085413-56de8ae18c73?q=80&w=1280&auto=format&fit=crop')" }} />

      {/* Header */}
      <header className="px-10 py-8 border-b-8 border-red-700 bg-black/80 z-10 flex justify-between items-end shadow-[0_10px_30px_rgba(255,0,0,0.2)]">
        <div>
          <h2 className="text-red-500 font-bold tracking-[0.4em] text-xl mb-2">CHRONICLE ENGINE</h2>
          <h1 className="text-5xl font-black text-white drop-shadow-[4px_4px_0_rgba(255,0,0,0.8)] tracking-wider">
            SỬ ÁN WORKSHOP
          </h1>
        </div>
        <div className="text-gray-400 font-mono text-xl text-right tracking-widest bg-gray-800/80 px-6 py-2 border-2 border-gray-600">
          <div>COMMUNITY CASES</div>
          <div className="text-yellow-500">v2.0.4 - UGC ENABLED</div>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 p-10 z-10 overflow-y-auto">
        <button 
          onClick={onOpenBuilder}
          className="w-full mb-8 relative group overflow-hidden border-4 border-red-500 bg-black hover:border-red-400 transition-all duration-300 hover:shadow-[0_0_50px_rgba(255,0,0,0.6)] hover:-translate-y-1"
        >
          <div className="absolute inset-0 bg-red-900/40 transform group-hover:scale-105 transition-transform duration-500">
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1525268323446-0b135bb0c5dd?q=80&w=1280')] bg-cover bg-center opacity-30 mix-blend-overlay" />
          </div>
          <div className="relative p-8 flex items-center justify-center gap-6">
            <Sparkles className="w-12 h-12 text-yellow-500 animate-pulse" />
            <span className="text-4xl font-black text-white tracking-widest drop-shadow-[0_0_15px_rgba(255,0,0,1)]">
              + TẠO VỤ ÁN MỚI BẰNG AI (CASE BUILDER)
            </span>
            <Sparkles className="w-12 h-12 text-yellow-500 animate-pulse" />
          </div>
        </button>

        <h3 className="text-3xl font-bold mb-6 border-l-8 border-red-600 pl-4">SELECT A CASE</h3>
        
        <div className="grid grid-cols-2 gap-8">
          {cases.map((c) => (
            <div 
              key={c.id} 
              onClick={() => !c.locked && onSelectCase(c.payload)}
              className={`relative overflow-hidden group border-4 transition-all duration-300 ${
                c.locked 
                  ? 'border-gray-700 bg-gray-800 cursor-not-allowed opacity-80' 
                  : 'border-red-900 bg-black hover:border-red-500 cursor-pointer hover:-translate-y-2 hover:shadow-[0_20px_40px_rgba(255,0,0,0.3)]'
              }`}
            >
              {/* Cover Image */}
              <div 
                className="h-48 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
                style={{ backgroundImage: `url(${c.cover})` }}
              >
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
              </div>

              {/* Tags */}
              <div className="absolute top-4 left-4 flex gap-2">
                {c.tags.map(tag => (
                  <span key={tag} className="px-3 py-1 bg-red-700 text-white text-xs font-bold tracking-widest border border-white shadow-[2px_2px_0_#000]">
                    [{tag.toUpperCase()}]
                  </span>
                ))}
              </div>

              {/* Lock Overlay */}
              {c.locked && (
                <div className="absolute top-4 right-4 bg-black/80 p-3 border-2 border-gray-500">
                  <Lock className="w-6 h-6 text-gray-400" />
                </div>
              )}

              {/* Card Body */}
              <div className="p-6 relative">
                <h4 className="text-3xl font-black mb-3 text-white truncate group-hover:text-red-400 transition-colors">
                  {c.title}
                </h4>
                
                <div className="flex justify-between items-center text-gray-400 font-mono text-sm mb-4">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4" /> {c.author}
                  </div>
                  <div className="flex items-center gap-2 text-yellow-500 font-bold">
                    <Star className="w-4 h-4 fill-current" /> {c.rating}
                  </div>
                </div>

                <div className="flex justify-between items-end border-t-2 border-gray-800 pt-4 mt-2">
                  <div>
                    <div className="text-xs text-gray-500 tracking-widest mb-1">ERA</div>
                    <div className="text-xl font-bold text-white tracking-widest">{c.era}</div>
                  </div>
                  
                  {!c.locked && (
                    <button className="flex items-center gap-2 bg-white text-black px-6 py-2 font-bold hover:bg-red-600 hover:text-white transition-colors border-2 border-black shadow-[4px_4px_0_rgba(255,0,0,0.8)]">
                      <Play className="w-5 h-5 fill-current" /> BẮT ĐẦU
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
