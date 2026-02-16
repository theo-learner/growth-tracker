"use client";

import { useState, useEffect } from "react";
import { useStore } from "@/store/useStore";
import { RecommendedActivity, RecommendedProduct, ActivityRecord } from "@/types";
import { callApi } from "@/lib/api-client";

/**
 * AI 맞춤 추천 탭 — API 연동 + 새로고침 기능
 */
export default function RecommendTab() {
  const { child, weeklyReport, recommendations: storeRecs, products: storeProds, addActivity } = useStore();
  const childName = child?.nickname || "아이";
  
  const [recommendations, setRecommendations] = useState<RecommendedActivity[]>(storeRecs);
  const [products, setProducts] = useState<RecommendedProduct[]>(storeProds);
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  // 스토어 데이터로 초기화
  useEffect(() => {
    setRecommendations(storeRecs);
    setProducts(storeProds);
  }, [storeRecs, storeProds]);

  // 추천 새로고침
  const refreshRecommendations = async () => {
    setLoading(true);
    try {
      const data = await callApi("/api/recommend", {
        method: "POST",
        body: JSON.stringify({
          childProfile: child,
          weeklyReport: weeklyReport,
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
    <div className="px-5">
      {/* 헤더 */}
      <div className="py-4 flex items-start justify-between">
        <div>
          <h2 className="text-xl font-bold">💡 {childName}를 위한 맞춤 추천</h2>
          <p className="text-sm text-mid-gray mt-1">
            AI가 이번 주 기록을 분석했어요
            {lastUpdated && <span className="text-xs"> · {lastUpdated} 업데이트</span>}
          </p>
        </div>
        <button
          onClick={refreshRecommendations}
          disabled={loading}
          className={`px-3 py-1.5 rounded-full text-xs font-semibold
                     ${loading 
                       ? "bg-gray-100 text-gray-400" 
                       : "bg-soft-green-50 text-soft-green-600 hover:bg-soft-green-100"
                     } transition-all`}
        >
          {loading ? "⏳ 분석 중..." : "🔄 새로고침"}
        </button>
      </div>

      {/* 추천 활동 */}
      <div className="mb-6">
        <h3 className="text-base font-semibold mb-3">🎯 이번 주 추천 활동</h3>
        {recommendations.length === 0 ? (
          <div className="card text-center py-6">
            <p className="text-3xl mb-2">🤔</p>
            <p className="text-sm text-mid-gray">기록을 더 남기면 맞춤 추천을 드릴 수 있어요!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {recommendations.map((rec, i) => (
              <div key={i} className="card">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-card bg-soft-green-50
                                  flex items-center justify-center shrink-0">
                    <span className="text-xl">{rec.icon}</span>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-dark-gray text-sm">
                      {rec.title}
                    </h4>
                    <p className="text-sm text-dark-gray/80 mt-1 leading-relaxed">
                      &ldquo;{rec.description}&rdquo;
                    </p>
                    <div className="flex items-center gap-3 mt-2 text-xs text-mid-gray">
                      <span className="flex items-center gap-1">📌 {rec.reason}</span>
                      <span className="flex items-center gap-1">⏰ {rec.duration}</span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => {
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
                    alert(`"${rec.title}" 활동이 기록에 추가되었어요! 🎉`);
                  }}
                  className="w-full mt-4 py-2.5 bg-soft-green-50 text-soft-green-600
                                 rounded-button text-sm font-bold
                                 border border-soft-green-100/50
                                 hover:bg-soft-green-100 hover:text-soft-green-700
                                 active:scale-[0.98]
                                 transition-all duration-200">
                  ▶️ 활동 시작하기
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 추천 교구 */}
      <div className="mb-6">
        <h3 className="text-base font-semibold mb-3">🛒 추천 교구</h3>
        {products.length === 0 ? (
          <div className="card text-center py-6">
            <p className="text-3xl mb-2">🛍️</p>
            <p className="text-sm text-mid-gray">아이 발달에 맞는 교구를 추천해 드릴게요!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {products.map((prod, i) => (
              <div key={i} className="card">
                <div className="flex items-start gap-3">
                  <div className="w-16 h-16 bg-warm-beige-100 rounded-card
                                  flex items-center justify-center text-3xl shrink-0
                                  border border-warm-beige-300/30">
                    {prod.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-dark-gray text-sm">
                      {prod.name}
                    </h4>
                    <p className="text-base font-bold text-soft-green-600 mt-1">
                      {prod.price}
                    </p>
                    <p className="text-xs text-mid-gray mt-1 leading-relaxed">
                      💬 &ldquo;{prod.reason}&rdquo;
                    </p>
                  </div>
                </div>
                <a
                  href={prod.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full mt-4 py-2.5 rounded-button text-sm font-bold text-center
                             border border-sunny-yellow-light
                             text-sunny-yellow-dark
                             hover:shadow-card active:scale-[0.98]
                             transition-all duration-200"
                  style={{ background: "linear-gradient(135deg, #FFFDF5 0%, #FFF8E0 100%)" }}
                >
                  🛒 쿠팡에서 보기 →
                </a>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 안내 배너 (공정위 문구 준수) */}
      <div className="info-banner mb-4 bg-gray-50 border border-gray-200">
        <div className="flex items-start gap-2">
          <span className="text-xs shrink-0 mt-0.5">📢</span>
          <p className="text-[11px] text-mid-gray leading-relaxed">
            추천 상품은 AI 분석 기반이며, 이 포스팅은 쿠팡 파트너스 활동의 일환으로, 이에 따른 일정액의 수수료를 제공받습니다.
          </p>
        </div>
      </div>
    </div>
  );
}
