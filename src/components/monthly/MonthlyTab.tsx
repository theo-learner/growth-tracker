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

      {/* 영역 필터 칩 */}
      <div className="flex flex-wrap gap-2 mb-4">
        <button
          onClick={() => setSelectedDomain("all")}
          className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all
            ${selectedDomain === "all"
              ? "bg-soft-green text-white"
              : "bg-white text-dark-gray border border-light-gray"
            }`}
        >
          전체
        </button>
        {ALL_DOMAINS.map((d) => (
          <button
            key={d}
            onClick={() => setSelectedDomain(d)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all
              ${selectedDomain === d
                ? "bg-soft-green text-white"
                : "bg-white text-dark-gray border border-light-gray"
              }`}
          >
            {DOMAIN_LABELS[d]}
          </button>
        ))}
      </div>

      {/* 영역별 그래프 */}
      <div className="space-y-4">
        {displayDomains.map((domain) => (
          <div key={domain} className="bg-white rounded-card shadow-card p-4">
            <h3 className="text-sm font-semibold mb-2">{DOMAIN_LABELS[domain]}</h3>
            <TrendChart data={monthlyData} domain={domain} />
          </div>
        ))}
      </div>

      {/* 마일스톤 뱃지 */}
      <div className="mt-6 mb-4">
        <h3 className="text-base font-semibold mb-3">🏆 마일스톤 달성!</h3>
        <div className="bg-white rounded-card shadow-card p-4 space-y-3">
          {milestones.map((ms) => (
            <div key={ms.id} className="flex items-center gap-3">
              <span className="text-2xl">{ms.icon}</span>
              <div>
                <p className="text-sm font-semibold text-dark-gray">{ms.title}</p>
                <p className="text-xs text-mid-gray">{ms.achievedDate} 달성</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* AI 예측 카드 */}
      <div className="bg-gradient-to-br from-soft-green/10 to-sunny-yellow/10 rounded-card p-4 mb-4">
        <h3 className="text-sm font-semibold mb-2">🔮 AI 예측</h3>
        <p className="text-sm text-dark-gray leading-relaxed">
          &ldquo;지금 속도라면 3개월 후 시지각이 <span className="font-bold text-soft-green">상위 15%</span>에
          도달할 수 있어요!&rdquo;
        </p>
        <p className="text-sm text-dark-gray leading-relaxed mt-2">
          &ldquo;언어 영역도 꾸준히 성장 중이에요. 독서 습관이 큰 도움이 되고 있어요 📚&rdquo;
        </p>
      </div>
    </div>
  );
}
