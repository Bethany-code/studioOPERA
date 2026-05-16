import React, { useState } from 'react';
import WorkshopHub from './WorkshopHub';
import TrialEngine from './TrialEngine';
import CaseBuilder from './CaseBuilder';

const demoCaseData = {
  caseTitle: "Nghịch Lý Bạch Đằng",
  initialNode: "intro_1",
  courtRecord: {
    "arrow": { 
      title: "Kho Mộc Bản - Binh Khí Ký", 
      text: "Quân Nam Hán chủ yếu là thủy binh phương Nam, trang bị nhẹ, sử dụng cung nỏ bằng tre. Ngược lại, kỵ binh Mông Cổ nổi danh với mũi tên đúc sắt nguyên khối." 
    },
    "tide": { 
      title: "Ghi chép Thủy Văn Sông Bạch Đằng", 
      text: "Biên độ dao động thủy triều cực đại đạt 3 mét. Trận chiến năm 938 khai thác triệt để hiện tượng này: cọc gỗ lim được đóng ở mực nước thấp nhất, lực lượng phục kích phải đợi đến khi pha triều rút cạn vào buổi chiều, cọc mới nhô lên mặt nước để đâm thủng thuyền địch." 
    },
    "tattoo": { 
      title: "Đại Việt Sử Ký - Hào Khí Đông A", 
      text: "Năm 1284, đối mặt với quân Mông Cổ, các binh sĩ nhà Trần tự xăm hai chữ 'SÁT THÁT' (Giết Thát Đát) lên tay để thể hiện quyết tâm tử chiến." 
    }
  },
  nodes: {
    "intro_1": {
      type: "dialogue",
      speaker: "Tướng Ngô Quyền",
      text: "Thám tử, hãy nghe tên lính Nam Hán này khai báo về cái xác bí ẩn vướng trên cọc gỗ. Hãy dùng [HỒ SƠ] để tìm ra điểm dối trá của hắn!",
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
          id: "L2_hidden", 
          speaker: "Tù Binh Nam Hán",
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
      text: "Lời khai của ngươi đã tự sát! Ngươi nói trời tối, nước dâng RẤT CAO, nhưng cái xác lại vướng vào cọc gỗ NHÔ LÊN mặt nước?",
      nextNode: "climax_2"
    },
    "climax_2": {
      type: "dialogue",
      speaker: "Thám Tử (Player)",
      text: "Đọc lại [Ghi chép Thủy Văn] đi! Cọc của Tướng Ngô Quyền chỉ nhô lên khi triều rút cạn vào buổi chiều. Nếu là buổi tối nước dâng, toàn bộ bãi cọc đã chìm sâu dưới đáy sông!",
      nextNode: "climax_3"
    },
    "climax_3": {
      type: "dialogue",
      speaker: "Tướng Ngô Quyền",
      text: "Chính xác. Ngươi không hề bắn hắn vào buổi tối. Kết hợp với hình xăm SÁT THÁT, cái xác này là chiến binh nhà Trần năm 1288 bị nứt thời gian rơi về năm 938!",
      nextNode: "victory"
    },
    "victory": {
      type: "end_screen",
      title: "LỖ HỔNG LỊCH SỬ ĐÃ ĐƯỢC VÁ",
      text: "Độ chính xác: 100%. Lịch sử đã được bảo vệ thành công."
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
        <div className="relative w-full max-w-6xl mx-auto aspect-video bg-gray-900 overflow-hidden flex flex-col shadow-[0_0_50px_rgba(0,0,0,1)] ring-4 ring-gray-800">
            {renderScreen()}
        </div>
    </div>
  );
}
