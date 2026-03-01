"use client";

import { useState, useEffect, useMemo } from "react";
import { useStore } from "@/store/useStore";
import { RecommendedActivity, RecommendedProduct, ActivityRecord, DomainKey } from "@/types";
import { callApi } from "@/lib/api-client";
import MaterialIcon from "@/components/ui/MaterialIcon";
import { getFocusArea } from "@/lib/focus-area";
import { interpretScore } from "@/lib/interpretation";

// 영역별 컬러 배너 (imageUrl 없을 때 폴백)
const DOMAIN_BANNER_COLORS: Record<string, string> = {
  verbalComprehension: "from-blue-100 to-blue-50",
  visualSpatial:       "from-purple-100 to-purple-50",
  fluidReasoning:      "from-teal-100 to-teal-50",
  workingMemory:       "from-orange-100 to-orange-50",
  processingSpeed:     "from-pink-100 to-pink-50",
};

const DOMAIN_BADGE_CLASSES: Record<string, string> = {
  verbalComprehension: "bg-blue-100 text-blue-700",
  visualSpatial:       "bg-purple-100 text-purple-700",
  fluidReasoning:      "bg-teal-100 text-teal-700",
  workingMemory:       "bg-orange-100 text-orange-700",
  processingSpeed:     "bg-pink-100 text-pink-700",
};

const DOMAIN_LABELS_KO: Record<string, string> = {
  verbalComprehension: "언어이해",
  visualSpatial:       "시공간",
  fluidReasoning:      "유동추론",
  workingMemory:       "작업기억",
  processingSpeed:     "처리속도",
};

/**
 * AI 맞춤 추천 탭 — Stitch 디자인 (성장 대시보드 / 맞춤 추천 활동 및 교구)
 */
export default function RecommendTab() {
  const { child, weeklyReport, temperament, monthlyData, recommendations: storeRecs, products: storeProds, addActivity } = useStore();
  const childName = child?.nickname || "아이";

  const [recommendations, setRecommendations] = useState<RecommendedActivity[]>(storeRecs);
  const [products, setProducts] = useState<RecommendedProduct[]>(storeProds);
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  const focusArea = useMemo(() => {
    if (!weeklyReport) return null;
    return getFocusArea(weeklyReport);
  }, [weeklyReport]);

  useEffect(() => {
    setRecommendations(storeRecs);
    setProducts(storeProds);
  }, [storeRecs, storeProds]);

  const refreshRecommendations = async () => {
    setLoading(true);
    try {
      const data = await callApi("/api/recommend", {
        method: "POST",
        body: JSON.stringify({
          childProfile: child,
          weeklyReport,
          temperament,
          monthlyData,
        }),
      });
      setRecommendations(data.activities || []);
      setProducts(data.products || []);
      setLastUpdated(new Date().toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" }));
    } catch (e) {
      console.error("추천 새로고침 실패:", e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pb-6">
      {/* 헤더 — sticky + backdrop-blur */}
      <div className="sticky top-0 z-10 bg-surface-100/80 backdrop-blur-md px-4 pt-5 pb-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-dark-gray">{childName}를 위한 맞춤 추천</h2>
            <div className="flex items-center gap-1.5 mt-0.5">
              <MaterialIcon name="auto_awesome" size={14} className="text-primary" />
              <p className="text-xs text-mid-gray">
                AI가 최근 기록을 분석했어요
                {lastUpdated && <span> · {lastUpdated} 업데이트</span>}
              </p>
            </div>
          </div>
          <button
            onClick={refreshRecommendations}
            disabled={loading}
            aria-label="추천 새로고침"
            className="flex h-10 w-10 items-center justify-center rounded-full
                       bg-white shadow-stitch-card border border-surface-300/60
                       disabled:opacity-50 transition-all active:scale-95"
          >
            <MaterialIcon
              name="refresh"
              size={20}
              className={`text-mid-gray ${loading ? "animate-spin" : ""}`}
            />
          </button>
        </div>
      </div>

      <div className="px-4 space-y-8 mt-4">

        {/* 이번 주 집중 영역 카드 */}
        {focusArea && (() => {
          const interp = interpretScore(focusArea.score);
          return (
            <section>
              <h3 className="text-base font-bold text-dark-gray mb-3 flex items-center gap-2">
                <MaterialIcon name="my_location" size={18} className="text-primary" />
                이번 주 집중 영역
              </h3>
              <div className={`rounded-xl border p-5 ${interp.bgColor} ${interp.borderColor}`}>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 rounded-xl bg-white/80 shadow-stitch-card flex items-center justify-center">
                    <span className="text-2xl">{interp.emoji}</span>
                  </div>
                  <div>
                    <p className="text-lg font-bold text-dark-gray">{focusArea.label}</p>
                    <p className={`text-xs font-semibold ${interp.textColor}`}>현재 {focusArea.score}점 · {interp.message}</p>
                  </div>
                </div>
                <p className="text-sm text-dark-gray leading-relaxed">{focusArea.explanation}</p>
              </div>
            </section>
          );
        })()}

        {/* 비용 없는 놀이 */}
        {focusArea && (
          <section>
            <h3 className="text-base font-bold text-dark-gray mb-3 flex items-center gap-2">
              <MaterialIcon name="volunteer_activism" size={18} className="text-primary" />
              지금 당장 해볼 수 있는 놀이
              <span className="text-xs font-normal text-mid-gray">무료</span>
            </h3>
            <div className="space-y-2">
              {focusArea.freePlayIdeas.map((idea, i) => (
                <div key={i} className="flex items-center gap-3 bg-white rounded-xl border border-slate-100 shadow-stitch-card p-3">
                  <span className="text-2xl shrink-0">{idea.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-dark-gray">{idea.title}</p>
                    <p className="text-xs text-mid-gray">{idea.description}</p>
                  </div>
                  <span className="text-[10px] font-bold text-primary-600 bg-primary-50 px-2 py-1 rounded-full shrink-0">
                    {idea.duration}
                  </span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 추천 활동 섹션 */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-dark-gray">추천 활동</h3>
              {focusArea && (
                <p className="text-xs text-mid-gray mt-0.5">{focusArea.label} 강화 중심</p>
              )}
            </div>
            <span className="text-primary-600 text-sm font-semibold">전체 보기</span>
          </div>

          {recommendations.length === 0 ? (
            <div className="bg-white rounded-xl border border-surface-300/60 shadow-stitch-card
                            p-8 text-center">
              <MaterialIcon name="psychology" size={40} className="text-surface-400 mx-auto mb-2" />
              <p className="text-sm text-mid-gray">기록을 더 남기면 맞춤 활동을 추천해 드려요!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {recommendations.map((rec, i) => (
                <ActivityCard
                  key={i}
                  rec={rec}
                  onStart={() => {
                    const record: ActivityRecord = {
                      id: `act-${Date.now()}`,
                      type: "activity",
                      timestamp: new Date().toISOString(),
                      data: {
                        category: rec.title,
                        durationMin: parseInt(rec.duration) || 30,
                        detail: rec.description,
                      },
                    };
                    addActivity(record);
                    alert(`"${rec.title}" 활동이 기록에 추가되었어요!`);
                  }}
                />
              ))}
            </div>
          )}
        </section>

        {/* 추천 교구 섹션 */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-dark-gray">추천 교구</h3>
            <span className="text-primary-600 text-sm font-semibold">전체 상품 보기</span>
          </div>

          {products.length === 0 ? (
            <div className="bg-white rounded-xl border border-surface-300/60 shadow-stitch-card
                            p-8 text-center">
              <MaterialIcon name="toys" size={40} className="text-surface-400 mx-auto mb-2" />
              <p className="text-sm text-mid-gray">발달에 맞는 교구를 추천해 드릴게요!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {products.map((prod, i) => (
                <ProductCard key={i} prod={prod} />
              ))}
            </div>
          )}
        </section>

        {/* 공정위 문구 */}
        <div className="bg-surface-200 rounded-xl border border-surface-300/60 px-4 py-3">
          <div className="flex items-start gap-2">
            <MaterialIcon name="info" size={14} className="text-mid-gray shrink-0 mt-0.5" />
            <p className="text-[11px] text-mid-gray leading-relaxed">
              추천 상품은 AI 분석 기반이며, 이 포스팅은 쿠팡 파트너스 활동의 일환으로, 이에 따른 일정액의 수수료를 제공받습니다.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── 활동 카드 ────────────────────────────────────────────────────────────────

interface ActivityCardProps {
  rec: RecommendedActivity;
  onStart: () => void;
}

function ActivityCard({ rec, onStart }: ActivityCardProps) {
  const primaryDomain = rec.domains?.[0] as DomainKey | undefined;
  const bannerGradient = primaryDomain
    ? (DOMAIN_BANNER_COLORS[primaryDomain] ?? "from-primary-100 to-primary-50")
    : "from-primary-100 to-primary-50";

  return (
    <div className="bg-white rounded-xl overflow-hidden shadow-stitch-card border border-surface-300/60
                    transition-shadow hover:shadow-stitch-card-hover">
      {/* 이미지 / 컬러 배너 */}
      <div className="aspect-video w-full overflow-hidden">
        {rec.imageUrl ? (
          <img
            src={rec.imageUrl}
            alt={rec.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className={`w-full h-full bg-gradient-to-r ${bannerGradient}
                           flex items-center justify-center`}>
            <span className="text-5xl opacity-80">{rec.icon}</span>
          </div>
        )}
      </div>

      <div className="p-4">
        <h4 className="text-base font-bold text-dark-gray">{rec.title}</h4>
        <p className="text-sm text-mid-gray mt-1 leading-relaxed">{rec.description}</p>

        {/* 추천 이유 */}
        {rec.reason && (
          <div className="flex items-start gap-1.5 mt-2">
            <MaterialIcon name="push_pin" size={12} className="text-mid-gray mt-0.5 shrink-0" />
            <p className="text-xs text-mid-gray">{rec.reason}</p>
          </div>
        )}

        {/* 태그 — 영역 + 소요시간 */}
        <div className="mt-3 flex flex-wrap gap-2">
          {rec.domains?.map((d) => (
            <span
              key={d}
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-badge
                          text-[11px] font-bold uppercase tracking-wide
                          ${DOMAIN_BADGE_CLASSES[d] ?? "bg-primary-100 text-primary-700"}`}
            >
              <MaterialIcon name="psychology" size={13} />
              {DOMAIN_LABELS_KO[d] ?? d}
            </span>
          ))}
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-badge
                           bg-surface-200 text-mid-gray text-[11px] font-bold uppercase tracking-wide">
            <MaterialIcon name="schedule" size={13} />
            {rec.duration}
          </span>
        </div>

        <button
          onClick={onStart}
          className="btn-primary mt-4 flex items-center justify-center gap-2"
        >
          <MaterialIcon name="play_circle" size={18} filled />
          활동 시작하기
        </button>
      </div>
    </div>
  );
}

// ─── 교구 카드 ────────────────────────────────────────────────────────────────

interface ProductCardProps {
  prod: RecommendedProduct;
}

function ProductCard({ prod }: ProductCardProps) {
  return (
    <div className="flex gap-4 bg-white p-3 rounded-xl shadow-stitch-card border border-surface-300/60">
      {/* 썸네일 */}
      <div className="h-24 w-24 shrink-0 rounded-lg bg-surface-200 overflow-hidden
                      flex items-center justify-center">
        {prod.imageUrl ? (
          <img
            src={prod.imageUrl}
            alt={prod.name}
            className="h-full w-full object-cover"
          />
        ) : (
          <span className="text-4xl">{prod.icon}</span>
        )}
      </div>

      {/* 정보 */}
      <div className="flex flex-col justify-between py-1 flex-1 min-w-0">
        <div>
          <h4 className="text-sm font-bold text-dark-gray line-clamp-1">{prod.name}</h4>
          <p className="text-[11px] text-mid-gray mt-0.5 italic line-clamp-2">
            &ldquo;{prod.review ?? prod.reason}&rdquo;
          </p>
          <p className="text-primary-600 font-bold mt-1 text-sm">{prod.price}</p>
        </div>
        <a
          href={prod.link}
          target="_blank"
          rel="noopener noreferrer"
          className="self-end flex items-center gap-1
                     text-[12px] font-bold text-dark-gray
                     border border-surface-300 px-3 py-1 rounded-lg
                     hover:bg-surface-200 active:scale-[0.97]
                     transition-all duration-150"
        >
          쿠팡에서 보기
          <MaterialIcon name="open_in_new" size={14} />
        </a>
      </div>
    </div>
  );
}
