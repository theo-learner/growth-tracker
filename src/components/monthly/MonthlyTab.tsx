"use client";

import { useState, lazy, Suspense, useEffect } from "react";
import { useStore } from "@/store/useStore";
import { DomainKey, DOMAIN_LABELS } from "@/types";
import MaterialIcon from "@/components/ui/MaterialIcon";

const TrendChart = lazy(() => import("./TrendChart"));

const ALL_DOMAINS: DomainKey[] = [
  "verbalComprehension", "visualSpatial", "fluidReasoning",
  "workingMemory", "processingSpeed",
];

// 영역별 델타 배지 색상
const DOMAIN_BADGE: Record<DomainKey, string> = {
  verbalComprehension: "bg-blue-50 text-blue-700",
  visualSpatial:       "bg-purple-50 text-purple-700",
  fluidReasoning:      "bg-teal-50 text-teal-700",
  workingMemory:       "bg-orange-50 text-orange-700",
  processingSpeed:     "bg-pink-50 text-pink-700",
};

/**
 * 월간 추이 탭 — Stitch 디자인 (Dashboard - Clean & Professional)
 */
export default function MonthlyTab() {
  const { child, monthlyData, milestones, weeklyReport, recalculateMonthlyData } = useStore();
  const childName = child?.nickname || "아이";
  const [selectedDomain, setSelectedDomain] = useState<DomainKey | "all">("all");

  // 기존 사용자를 위한 1회 재계산
  useEffect(() => {
    recalculateMonthlyData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const displayDomains = selectedDomain === "all" ? ALL_DOMAINS : [selectedDomain];

  // 최근 2개월 점수 변화
  const getDelta = (domain: DomainKey): number | null => {
    const actual = monthlyData.filter((d) => !d.predicted);
    if (actual.length < 2) return null;
    return actual[actual.length - 1].scores[domain] - actual[actual.length - 2].scores[domain];
  };

  return (
    <div className="pb-6">
      {/* 헤더 — sticky + backdrop-blur */}
      <div className="sticky top-0 z-10 bg-surface-100/80 backdrop-blur-md
                      border-b border-surface-300/50 px-4 pt-5 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-primary-50 flex items-center justify-center shrink-0">
            <MaterialIcon name="monitoring" size={20} className="text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-dark-gray">{childName}의 성장 이야기</h2>
            <p className="text-xs text-mid-gray">최근 3개월 · AI 예측 포함</p>
          </div>
        </div>
      </div>

      <div className="px-4 mt-5 space-y-6">
        {/* 영역 필터 — 가로 스크롤 */}
        <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-1">
          <FilterChip
            label="전체"
            active={selectedDomain === "all"}
            onClick={() => setSelectedDomain("all")}
          />
          {ALL_DOMAINS.map((d) => (
            <FilterChip
              key={d}
              label={DOMAIN_LABELS[d]}
              active={selectedDomain === d}
              onClick={() => setSelectedDomain(d)}
            />
          ))}
        </div>

        {/* 영역별 차트 카드 */}
        <div className="space-y-4">
          {displayDomains.map((domain) => {
            const delta = getDelta(domain);
            const currentScore = weeklyReport?.scores[domain];
            return (
              <div key={domain}
                className="bg-white rounded-xl border border-surface-300/60 shadow-stitch-card overflow-hidden">
                {/* 카드 헤더 */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-surface-200">
                  <div>
                    <h3 className="text-base font-bold text-dark-gray">{DOMAIN_LABELS[domain]}</h3>
                    {currentScore !== undefined && (
                      <p className="text-xs text-mid-gray mt-0.5">
                        현재 <span className="font-bold text-dark-gray">{currentScore}점</span>
                      </p>
                    )}
                  </div>
                  {delta !== null && (
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-lg ${
                      delta > 0
                        ? "bg-emerald-50 text-emerald-700"
                        : delta < 0
                        ? "bg-rose-50 text-rose-600"
                        : "bg-surface-200 text-mid-gray"
                    }`}>
                      {delta > 0 ? "+" : ""}{delta}점
                    </span>
                  )}
                </div>
                {/* 차트 */}
                <div className="px-4 py-4 bg-surface-100">
                  <Suspense fallback={
                    <div className="h-40 flex items-center justify-center text-sm text-mid-gray">
                      차트 로딩 중...
                    </div>
                  }>
                    <TrendChart data={monthlyData} domain={domain} />
                  </Suspense>
                </div>
              </div>
            );
          })}
        </div>

        {/* AI 예측 — Stitch bg-primary/5 bullet 스타일 */}
        <section>
          <div className="flex items-center gap-2 mb-3">
            <MaterialIcon name="psychology" size={20} className="text-primary" />
            <h3 className="text-base font-bold text-dark-gray">AI 예측</h3>
          </div>
          <div className="bg-primary-50 border border-primary-100 rounded-xl p-5 space-y-4">
            {[
              {
                title: "시공간 영역 상위권 진입 예측",
                body: "지금 속도라면 3개월 후 시공간 영역이 상위 15%에 도달할 수 있어요!",
              },
              {
                title: "언어 영역 꾸준한 성장 중",
                body: "독서 활동이 언어이해 점수에 긍정적인 영향을 주고 있어요.",
              },
            ].map((item, i) => (
              <div key={i} className="flex gap-3">
                <div className="w-2 h-2 rounded-full bg-primary mt-2 shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-dark-gray">{item.title}</p>
                  <p className="text-sm text-mid-gray leading-relaxed mt-1">{item.body}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 마일스톤 — check_circle + 달성일 */}
        {milestones.length > 0 && (
          <section className="pb-2">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <MaterialIcon name="task_alt" size={20} className="text-primary" />
                <h3 className="text-base font-bold text-dark-gray">마일스톤 달성!</h3>
              </div>
              <span className="text-xs text-mid-gray font-medium">{milestones.length}개 완료</span>
            </div>
            <div className="bg-white rounded-xl border border-surface-300/60 shadow-stitch-card
                            divide-y divide-surface-200">
              {milestones.map((ms) => (
                <div key={ms.id} className="flex items-center justify-between px-4 py-3.5">
                  <div className="flex items-center gap-3">
                    <MaterialIcon name="check_circle" size={22} className="text-emerald-500" filled />
                    <div>
                      <p className="text-sm font-medium text-dark-gray">{ms.title}</p>
                      <p className="text-xs text-mid-gray mt-0.5">{ms.achievedDate} 달성</p>
                    </div>
                  </div>
                  <span className={`text-[11px] font-bold px-2 py-1 rounded shrink-0 ml-3
                                    ${DOMAIN_BADGE[ms.id as DomainKey] ?? "bg-surface-200 text-mid-gray"}`}>
                    {ms.icon}
                  </span>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

// ─── 필터 칩 ──────────────────────────────────────────────────────────────────

interface FilterChipProps {
  label: string;
  active: boolean;
  onClick: () => void;
}

function FilterChip({ label, active, onClick }: FilterChipProps) {
  return (
    <button
      onClick={onClick}
      className={`flex-none px-4 py-1.5 rounded-full text-sm font-semibold
                  transition-all duration-200 active:scale-95 whitespace-nowrap
                  ${active
                    ? "bg-primary text-white shadow-stitch-btn"
                    : "bg-white text-mid-gray border border-surface-300 shadow-stitch-card hover:border-primary/40"
                  }`}
    >
      {label}
    </button>
  );
}
