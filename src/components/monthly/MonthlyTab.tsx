"use client";

import { useState, lazy, Suspense } from "react";
import { useStore } from "@/store/useStore";
import { DomainKey, DOMAIN_LABELS } from "@/types";
import MaterialIcon from "@/components/ui/MaterialIcon";

const TrendChart = lazy(() => import("./TrendChart"));

const ALL_DOMAINS: DomainKey[] = [
  "verbalComprehension", "visualSpatial", "fluidReasoning",
  "workingMemory", "processingSpeed",
];

/**
 * 월간 추이 탭 v3 — Stitch 디자인 적용
 */
export default function MonthlyTab() {
  const { child, monthlyData, milestones } = useStore();
  const childName = child?.nickname || "아이";
  const [selectedDomain, setSelectedDomain] = useState<DomainKey | "all">("all");

  const displayDomains = selectedDomain === "all" ? ALL_DOMAINS : [selectedDomain];

  return (
    <div className="px-5 pb-4">
      {/* 헤더 */}
      <div className="py-5">
        <div className="flex items-center gap-2">
          <MaterialIcon name="insights" size={22} className="text-primary" />
          <h2 className="text-xl font-bold text-slate-900">{childName}의 성장 이야기</h2>
        </div>
        <p className="text-sm text-slate-500 mt-1">최근 3개월 + AI 예측</p>
      </div>

      {/* 영역 필터 칩 */}
      <div className="flex flex-wrap gap-2 mb-4">
        <button
          onClick={() => setSelectedDomain("all")}
          className={`px-3.5 py-1.5 rounded-full text-xs font-semibold
                      transition-all duration-200 active:scale-95
            ${selectedDomain === "all"
              ? "text-white shadow-stitch-btn"
              : "bg-white text-slate-700 border border-slate-200 shadow-stitch-card hover:border-primary/40"
            }`}
          style={selectedDomain === "all"
            ? { background: "var(--gradient-primary)" }
            : undefined}
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
                ? "text-white shadow-stitch-btn"
                : "bg-white text-slate-700 border border-slate-200 shadow-stitch-card hover:border-primary/40"
              }`}
            style={selectedDomain === d
              ? { background: "var(--gradient-primary)" }
              : undefined}
          >
            {DOMAIN_LABELS[d]}
          </button>
        ))}
      </div>

      {/* 영역별 그래프 */}
      <div className="space-y-4">
        {displayDomains.map((domain) => (
          <div key={domain} className="bg-white rounded-xl border border-slate-100 shadow-stitch-card p-4">
            <h3 className="text-sm font-bold text-slate-900 mb-1">{DOMAIN_LABELS[domain]}</h3>
            <div className="rounded-xl p-3 mt-2 bg-surface-100">
              <Suspense fallback={
                <div className="h-48 flex items-center justify-center text-sm text-slate-400">
                  차트 로딩 중...
                </div>
              }>
                <TrendChart data={monthlyData} domain={domain} />
              </Suspense>
            </div>
          </div>
        ))}
      </div>

      {/* 마일스톤 */}
      <div className="mt-6 mb-4">
        <div className="flex items-center gap-2 mb-3">
          <MaterialIcon name="emoji_events" size={18} className="text-yellow-500" filled />
          <h3 className="text-base font-bold text-slate-900">마일스톤 달성!</h3>
        </div>
        <div className="bg-white rounded-xl border border-slate-100 shadow-stitch-card divide-y divide-slate-50">
          {milestones.map((ms) => (
            <div key={ms.id} className="flex items-center gap-3 px-4 py-3">
              <div className="w-10 h-10 rounded-full bg-yellow-50 flex items-center justify-center shrink-0">
                <span className="text-xl">{ms.icon}</span>
              </div>
              <div>
                <p className="text-sm font-bold text-slate-800">{ms.title}</p>
                <p className="text-xs text-slate-400 mt-0.5">{ms.achievedDate} 달성</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* AI 예측 카드 */}
      <div className="card-insight mb-4">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center">
            <MaterialIcon name="auto_awesome" size={16} className="text-primary" />
          </div>
          <h3 className="text-sm font-bold text-primary-700">AI 예측</h3>
        </div>
        <div className="space-y-2.5">
          <p className="text-sm text-slate-700 leading-relaxed">
            &ldquo;지금 속도라면 3개월 후 시지각이 <span className="font-bold text-primary-700">상위 15%</span>에
            도달할 수 있어요!&rdquo;
          </p>
          <p className="text-sm text-slate-700 leading-relaxed">
            &ldquo;언어 영역도 꾸준히 성장 중이에요. 독서 습관이 큰 도움이 되고 있어요 📚&rdquo;
          </p>
        </div>
      </div>
    </div>
  );
}
