import React, { useState } from 'react';
import WorkshopHub from './WorkshopHub';
import TrialEngine from './TrialEngine';
import CaseBuilder from './CaseBuilder';

const MOCK_CASE_DATA = {
  caseTitle: "Nghịch Lý Bạch Đằng",
  initialNode: "investigation_1",
  inventory: [], // Starts empty, filled during investigation
  evidenceDatabase: {
    "arrow": { name: "Mũi Tên Đúc Sắt", desc: "[KT]: Kỵ binh Mông Cổ dùng tên sắt. Nam Hán dùng tên tre." },
    "tide": { name: "Chiến Thuật Thủy Triều", desc: "[KT 938]: Cọc nhô lên đâm thuyền khi nước rút cạn vào buổi chiều." },
    "tattoo": { name: "Hình xăm SÁT THÁT", desc: "[KT 1284]: Hào khí nhà Trần. Nghĩa là 'Giết Thát Đát'." }
  },
  nodes: {
    "investigation_1": {
      type: "investigation",
      location: "Bờ sông Bạch Đằng (Giai đoạn thu thập)",
      description: "Bạn phát hiện một cái xác kẹt giữa bãi cọc. Hãy thu thập đủ 3 manh mối trước khi mở phiên tòa.",
      interactables: [
        { id: "inv_1", name: "Khám nghiệm tử thi", unlocksEvidence: "tattoo", text: "Bạn lật tay áo nạn nhân. Có hình xăm SÁT THÁT." },
        { id: "inv_2", name: "Kiểm tra vết thương", unlocksEvidence: "arrow", text: "Vết thương bị đâm bởi mũi tên đúc sắt nguyên khối." },
        { id: "inv_3", name: "Quan sát mặt nước", unlocksEvidence: "tide", text: "Nước sông đang dâng cao dần vào buổi tối." }
      ],
      requiredEvidenceToProceed: ["tattoo", "arrow", "tide"],
      nextNode: "court_intro"
    },
    "court_intro": {
      type: "dialogue",
      speaker: "Tướng Ngô Quyền",
      text: "Các manh mối đã thu thập đủ. Hãy bắt đầu chất vấn tên tù binh Nam Hán này!",
      nextNode: "testimony_1"
    },
    "testimony_1": {
      type: "cross_examination",
      speaker: "Tù Binh Nam Hán",
      lines: [
        "Trời chập choạng tối, nước sông dâng rất cao...",
        "Tên phiến quân đó mặc áo vải mỏng manh lao tới...",
        "Con hoảng quá nên dùng cung tre bắn xuyên qua ngực hắn!"
      ],
      weakPointIndex: 2, // The lie is the bamboo arrow
      branches: [
        { requiredEvidence: "arrow", triggerObjection: true, nextNode: "rebuttal_1" }
      ],
      defaultFailText: "Thám Tử: Bằng chứng này không khớp với lời khai!",
      hpPenalty: 1
    },
    "rebuttal_1": {
      type: "dialogue",
      speaker: "Thám Tử (Player)",
      text: "Ngươi nói dối! Vết thương do mũi tên đúc sắt của kỵ binh phương Bắc gây ra, không phải tên tre của Nam Hán!",
      nextNode: "testimony_2"
    },
    "testimony_2": {
      type: "cross_examination",
      speaker: "Tù Binh Nam Hán",
      lines: [
        "Ta... ta thừa nhận ta không bắn hắn!",
        "Nhưng ta thấy xác hắn nổi lềnh bềnh trên mặt nước dâng cao...",
        "Nó vướng vào một thanh gỗ ngầm!"
      ],
      weakPointIndex: 1, // The lie is floating at high tide
      branches: [
        { requiredEvidence: "tide", triggerObjection: true, nextNode: "rebuttal_2" }
      ],
      defaultFailText: "Thám Tử: Không đúng! Lời khai này mâu thuẫn với yếu tố khác!",
      hpPenalty: 1
    },
    "rebuttal_2": {
      type: "dialogue",
      speaker: "Thám Tử (Player)",
      text: "Xác hắn không nổi lềnh bềnh! Nó bị GHIM CHẶT vào cọc dưới đáy sông. Mũi cọc chỉ nhô ra khi triều rút cạn lúc chiều!",
      nextNode: "climax_twist"
    },
    "climax_twist": {
      type: "dialogue",
      speaker: "Thám Tử (Player)",
      text: "Kết hợp với hình xăm SÁT THÁT, người này tử trận năm 1288 (thời Trần) và rơi vào nứt gãy thời gian về đây!",
      nextNode: "victory"
    },
    "victory": {
      type: "end_screen",
      title: "LỖ HỔNG LỊCH SỬ ĐÃ ĐƯỢC VÁ",
      text: "Độ chính xác: 100%. Lịch sử đã được bảo vệ."
    }
  }
};

export default function App() {
  const [currentScreen, setCurrentScreen] = useState('hub'); // 'hub', 'builder', 'trial'
  const [activeCase, setActiveCase] = useState(null);

  const renderScreen = () => {
    switch (currentScreen) {
      case 'builder':
        return (
          <CaseBuilder 
            onBack={() => setCurrentScreen('hub')} 
            onPublish={() => setCurrentScreen('hub')} 
          />
        );
      case 'trial':
        return (
          <TrialEngine 
            caseData={activeCase} 
            onExit={() => {
              setActiveCase(null);
              setCurrentScreen('hub');
            }} 
          />
        );
      case 'hub':
      default:
        return (
          <WorkshopHub 
            onSelectCase={(c) => {
              setActiveCase(c);
              setCurrentScreen('trial');
            }} 
            onOpenBuilder={() => setCurrentScreen('builder')}
            mockCasePayload={MOCK_CASE_DATA} 
          />
        );
    }
  };

  return (
    <div className="w-full h-full bg-black flex items-center justify-center p-4">
        {/* Global wrapper matching prompt constraints: max-w-6xl mx-auto aspect-video */}
        <div className="relative w-full max-w-6xl mx-auto aspect-video bg-gray-900 overflow-hidden flex flex-col shadow-[0_0_50px_rgba(0,0,0,1)] ring-4 ring-gray-800">
            {renderScreen()}
        </div>
    </div>
  );
}
