import React, { useState } from 'react';
import WorkshopHub from './WorkshopHub';
import TrialEngine from './TrialEngine';
import CaseBuilder from './CaseBuilder';

const demoCaseData = {
  caseTitle: "Nghịch Lý Bạch Đằng",
  initialNode: "investigation_1",
  courtRecord: {}, // Starts empty. Filled during investigation.
  evidenceDatabase: { // The master list of unlockables
    "arrow": { title: "Kho Mộc Bản - Binh Khí Ký", text: "Kỵ binh Mông Cổ nổi danh với mũi tên đúc sắt nguyên khối. Nam Hán dùng tên tre." },
    "tide": { title: "Ghi chép Thủy Văn Sông Bạch Đằng", text: "Cọc gỗ lim chỉ nhô lên đâm thủng thuyền khi pha triều rút cạn vào buổi chiều." },
    "tattoo": { title: "Đại Việt Sử Ký - Hào Khí Đông A", text: "Năm 1284, binh sĩ nhà Trần tự xăm hai chữ 'SÁT THÁT' lên tay." }
  },
  nodes: {
    "investigation_1": {
      type: "investigation",
      location: "Bãi cọc ngầm Bạch Đằng (Giai đoạn Khám Nghiệm)",
      interactables: [
        { 
          id: "inv_body", name: "Khám nghiệm y phục tử thi", 
          unlocksEvidence: "tattoo",
          archiveText: "Theo phong tục, [lính Nam Hán] thường mặc [giáp da nhẹ]. Tuy nhiên, thi thể này mặc [giáp lông thú] và có một [đặc điểm nhận dạng của quân đội nhà Trần năm 1284].",
          correctKeyword: "đặc điểm nhận dạng của quân đội nhà Trần năm 1284"
        },
        { 
          id: "inv_wound", name: "Kiểm tra vết thương chí mạng", 
          unlocksEvidence: "arrow",
          archiveText: "Khám nghiệm cho thấy [lồng ngực] bị xuyên thủng bởi một [mũi tên đúc sắt nguyên khối] chứ không phải [loại tên tre vót nhọn] thông thường của thủy binh.",
          correctKeyword: "mũi tên đúc sắt nguyên khối"
        },
        { 
          id: "inv_river", name: "Quan sát mực nước sông", 
          unlocksEvidence: "tide",
          archiveText: "Trời đang chập choạng tối, [sóng đánh dữ dội] do [nước sông đang dâng rất cao vào ban đêm], che lấp hoàn toàn [những bãi cọc nhọn] dưới đáy.",
          correctKeyword: "nước sông đang dâng rất cao vào ban đêm"
        }
      ],
      requiredEvidence: ["tattoo", "arrow", "tide"],
      nextNode: "intro_1"
    },
    "intro_1": {
      type: "dialogue",
      speaker: "Tướng Ngô Quyền",
      text: "Các manh mối đã thu thập đủ! Thám tử, hãy đối chất với tên lính Nam Hán này. Nhớ dùng nút [KHOAN ĐÃ] để ép hắn khai thêm chi tiết!",
      nextNode: "testimony_1"
    },
    "testimony_1": {
      type: "cross_examination",
      speaker: "Tù Binh Nam Hán",
      timeLimit: 30,
      lines: [
        { id: "L1", text: "Trời chập choạng tối, nước sông dâng rất cao, sóng đánh dữ dội." },
        { id: "L2", text: "Con thấy tên phiến quân đó bị thương, trôi dạt trên mặt nước.", pressable: true },
        { id: "L3", text: "Con hoảng quá nên rút vội cung tên tre bắn hắn để tự vệ." }
      ],
      hiddenLines: {
        "L2": { 
          id: "L2_hidden", speaker: "Tù Binh Nam Hán",
          text: "Hắn hoàn toàn không di chuyển! Lúc đó xác hắn đang bị kẹt cứng vào một cây cọc gỗ NHÔ LÊN trên mặt nước, nên ta mới nhắm trúng ngực hắn!" 
        }
      },
      branches: [
        { requiredLineId: "L2_hidden", requiredEvidence: "tide", triggerObjection: true, nextNode: "climax_1" }
      ],
      defaultFailText: "Thám Tử: Khoan đã, bằng chứng này không khớp với câu nói đó!",
      hpPenalty: 1
    },
    "climax_1": {
      type: "dialogue",
      speaker: "Thám Tử (Player)",
      text: "Ngươi nói dối! Nếu lúc đó là buổi tối nước dâng cao, toàn bộ bãi cọc đã chìm sâu! Cọc chỉ nhô lên khi triều rút vào buổi chiều!",
      nextNode: "climax_2"
    },
    "climax_2": {
      type: "dialogue",
      speaker: "Tướng Ngô Quyền",
      text: "Kết hợp với hình xăm SÁT THÁT, cái xác này là chiến binh nhà Trần năm 1288 bị nứt thời gian rơi về năm 938! Vụ án kết thúc!",
      nextNode: "victory"
    },
    "victory": {
      type: "end_screen",
      title: "LỖ HỔNG LỊCH SỬ ĐÃ ĐƯỢC VÁ",
      text: "Độ chính xác: 100%."
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
            mockCasePayload={demoCaseData} 
          />
        );
    }
  };

  return (
    <div className="w-full h-full bg-black flex items-center justify-center p-4">
        {/* Global wrapper matching prompt constraints: max-w-6xl mx-auto aspect-video */}
        <div className="relative w-full max-w-6xl mx-auto aspect-video bg-gray-900 overflow-hidden flex flex-col font-sans shadow-[0_0_50px_rgba(0,0,0,1)] ring-4 ring-gray-800">
            {renderScreen()}
        </div>
    </div>
  );
}
