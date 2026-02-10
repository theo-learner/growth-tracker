"use client";

import { useState } from "react";

interface GuideItem {
  id: string;
  emoji: string;
  title: string;
  content: string[];
}

const GUIDE_ITEMS: GuideItem[] = [
  {
    id: "domains",
    emoji: "🧠",
    title: "6개 발달 영역이란?",
    content: [
      "**언어**: 말하기, 듣기, 어휘력, 표현력",
      "**시지각**: 공간 인식, 도형 이해, 시각적 기억",
      "**작업기억**: 정보를 잠시 기억하고 활용하는 능력",
      "**처리속도**: 빠르고 정확하게 정보를 처리하는 능력",
      "**논리**: 문제 해결, 패턴 인식, 추론 능력",
      "**소근육**: 손가락 조작, 그리기, 오리기 등",
    ],
  },
  {
    id: "record-tips",
    emoji: "📝",
    title: "효과적인 기록 방법",
    content: [
      "• 하루 2-3개 기록이면 충분해요",
      "• 완벽하지 않아도 괜찮아요, 간단히 메모하세요",
      "• 아이가 한 질문, 특이한 행동을 기록해보세요",
      "• 사진과 함께 기록하면 더 좋아요",
      "• 매일 같은 시간에 기록하면 습관이 됩니다",
    ],
  },
  {
    id: "age-guide",
    emoji: "👶",
    title: "연령별 발달 가이드",
    content: [
      "**만 4세**: 질문이 폭발하는 시기! '왜?'를 많이 물어요",
      "**만 5세**: 친구 관계가 중요해지고, 규칙을 이해해요",
      "**만 6세**: 학교 준비, 읽기/쓰기에 관심이 생겨요",
      "",
      "💡 각 아이마다 속도가 달라요. 비교보다 성장에 집중하세요!",
    ],
  },
  {
    id: "play-ideas",
    emoji: "🎮",
    title: "영역별 추천 놀이",
    content: [
      "**언어**: 끝말잇기, 수수께끼, 동화 읽기",
      "**시지각**: 퍼즐, 블록, 숨은그림찾기",
      "**작업기억**: 카드 뒤집기, 순서 기억하기",
      "**처리속도**: 미로 찾기, 빠른 색칠하기",
      "**논리**: 보드게임, 패턴 맞추기",
      "**소근육**: 가위질, 구슬 꿰기, 점토 놀이",
    ],
  },
  {
    id: "faq",
    emoji: "❓",
    title: "자주 묻는 질문",
    content: [
      "**Q: 점수가 낮으면 문제가 있는 건가요?**",
      "A: 아니요! 점수는 상대적 위치일 뿐, 아이마다 강점이 달라요.",
      "",
      "**Q: 얼마나 자주 기록해야 하나요?**",
      "A: 매일 1-3개면 충분해요. 부담 갖지 마세요!",
      "",
      "**Q: AI 분석은 정확한가요?**",
      "A: 참고용이에요. 걱정되면 전문가 상담을 권해드려요.",
    ],
  },
];

export default function ParentGuide({ onClose }: { onClose: () => void }) {
  const [expandedId, setExpandedId] = useState<string | null>("domains");

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <>
      <div className="bottom-sheet-backdrop" onClick={onClose} />
      <div className="fixed inset-x-0 bottom-0 top-16 left-1/2 -translate-x-1/2 w-full max-w-[430px] bg-white rounded-t-[24px] z-50 animate-slideUp overflow-hidden flex flex-col"
           style={{ boxShadow: "0 -8px 40px rgba(0,0,0,0.08)" }}>
        <div className="bottom-sheet-handle" />

        <div className="px-5 pb-2">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold">📚 부모 가이드</h3>
            <button onClick={onClose} className="text-mid-gray text-xl">✕</button>
          </div>
          <p className="text-sm text-mid-gray mt-1">
            아이 발달에 대해 알아보세요
          </p>
        </div>

        <div className="flex-1 overflow-y-auto px-5 pb-8">
          <div className="space-y-3 mt-4">
            {GUIDE_ITEMS.map((item) => (
              <div
                key={item.id}
                className="bg-warm-beige rounded-card overflow-hidden"
              >
                <button
                  onClick={() => toggleExpand(item.id)}
                  className="w-full px-4 py-3 flex items-center justify-between text-left"
                >
                  <span className="flex items-center gap-2 font-semibold text-sm">
                    <span className="text-lg">{item.emoji}</span>
                    {item.title}
                  </span>
                  <span className="text-mid-gray transition-transform duration-200"
                        style={{ transform: expandedId === item.id ? "rotate(180deg)" : "rotate(0)" }}>
                    ▼
                  </span>
                </button>
                
                {expandedId === item.id && (
                  <div className="px-4 pb-4 pt-1 border-t border-white/50">
                    <div className="space-y-1.5 text-sm text-dark-gray/90 leading-relaxed">
                      {item.content.map((line, i) => (
                        <p key={i} dangerouslySetInnerHTML={{
                          __html: line
                            .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-soft-green-700">$1</strong>')
                        }} />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* 추가 자료 링크 */}
          <div className="mt-6 p-4 bg-calm-blue-light/50 rounded-card">
            <p className="text-sm font-semibold mb-2">📎 더 알아보기 (대한민국 공식 자료)</p>
            <div className="space-y-2 text-sm">
              <a href="https://health.kdca.go.kr/healthinfo/biz/health/gnrlzHealthInfo/gnrlzHealthInfo/gnrlzHealthInfoView.do?cntnts_sn=5270" 
                 target="_blank" rel="noopener noreferrer"
                 className="block text-calm-blue hover:underline">
                • 질병관리청 소아 성장/발달 가이드
              </a>
              <a href="https://www.nhis.or.kr/nhis/healthin/wbhaca04500m01.do" 
                 target="_blank" rel="noopener noreferrer"
                 className="block text-calm-blue hover:underline">
                • 국민건강보험공단 영유아 건강검진 안내
              </a>
              <a href="http://central.childcare.go.kr/ccef/community/parentData/ParentDataSl.jsp" 
                 target="_blank" rel="noopener noreferrer"
                 className="block text-calm-blue hover:underline">
                • 중앙육아종합지원센터 육아 정보
              </a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
