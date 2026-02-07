"use client";

import { useState } from "react";
import { useStore } from "@/store/useStore";
import { DomainKey, DOMAIN_LABELS } from "@/types";
import TrendChart from "./TrendChart";

const ALL_DOMAINS: DomainKey[] = [
  "language", "visuospatial", "workingMemory",
  "processingSpeed", "logic", "fineMotor",
];

/**
 * 월간 추이 탭 — 6개 영역별 꺾은선 + 3개월 예측 + 마일스톤
 */
export default function MonthlyTab() {
  const { child, monthlyData, milestones } = useStore();
  const childName = child?.nickname || "아이";
  const [selectedDomain, setSelectedDomain] = useState<DomainKey | "all">("all");

  const displayDomains = selectedDomain === "all" ? ALL_DOMAINS : [selectedDomain];

  return (
    <div className="px-5">
      {/* 헤더 */}
      <div className="py-4">
        <h2 className="text-xl font-bold">📈 {childName}의 성장 이야기</h2>
        <p className="text-sm text-mid-gray mt-1">최근 3개월 + AI 예측</p>
      </div>

      {/* 영역 필터 칩 — 부드러운 터치 피드백 */}
      <div className="flex flex-wrap gap-2 mb-4">
        <button
          onClick={() => setSelectedDomain("all")}
          className={`px-3.5 py-1.5 rounded-full text-xs font-semibold
                      transition-all duration-200 active:scale-95
            ${selectedDomain === "all"
              ? "bg-gradient-green text-white shadow-btn-green"
              : "bg-white text-dark-gray border border-light-gray shadow-card-active hover:border-soft-green/40"
            }`}
        >
          전체
        </button>
        {ALL_DOMAINS.map((d) => (
          <button
            key={d}
            onClick={() => setSelectedDomain(d)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold
                        transition-all duration-200 active:scale-95
              ${selectedDomain === d
                ? "bg-gradient-green text-white shadow-btn-green"
                : "bg-white text-dark-gray border border-light-gray shadow-card-active hover:border-soft-green/40"
              }`}
          >
            {DOMAIN_LABELS[d]}
          </button>
        ))}
      </div>

      {/* 영역별 그래프 — 차트 카드 */}
      <div className="space-y-4">
        {displayDomains.map((domain) => (
          <div key={domain} className="chart-card">
            <h3 className="text-sm font-bold text-dark-gray mb-1">{DOMAIN_LABELS[domain]}</h3>
            <div className="chart-area">
              <TrendChart data={monthlyData} domain={domain} />
            </div>
          </div>
        ))}
      </div>

      {/* 마일스톤 뱃지 — 프리미엄 카드 */}
      <div className="mt-6 mb-4">
        <h3 className="section-title">🏆 마일스톤 달성!</h3>
        <div className="card space-y-0">
          {milestones.map((ms, idx) => (
            <div key={ms.id} className={`flex items-center gap-3 py-3
                                         ${idx < milestones.length - 1 ? "border-b border-light-gray/40" : ""}`}>
              <div className="w-10 h-10 rounded-full bg-sunny-yellow-light/50
                              flex items-center justify-center shrink-0">
                <span className="text-xl">{ms.icon}</span>
              </div>
              <div>
                <p className="text-sm font-bold text-dark-gray">{ms.title}</p>
                <p className="text-xs text-mid-gray mt-0.5">{ms.achievedDate} 달성</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* AI 예측 카드 — 인사이트 스타일 */}
      <div className="card-insight mb-4">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-7 h-7 rounded-full bg-soft-green/15 flex items-center justify-center">
            <span className="text-sm">🔮</span>
          </div>
          <h3 className="text-sm font-bold text-soft-green-600">AI 예측</h3>
        </div>
        <div className="space-y-2.5">
          <p className="text-sm text-dark-gray leading-relaxed">
            &ldquo;지금 속도라면 3개월 후 시지각이 <span className="font-bold text-soft-green-600">상위 15%</span>에
            도달할 수 있어요!&rdquo;
          </p>
          <p className="text-sm text-dark-gray leading-relaxed">
            &ldquo;언어 영역도 꾸준히 성장 중이에요. 독서 습관이 큰 도움이 되고 있어요 📚&rdquo;
          </p>
        </div>
      </div>
    </div>
  );
}
