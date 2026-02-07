"use client";

import { useStore } from "@/store/useStore";

/**
 * AI 맞춤 추천 탭 — 추천 활동 3개 + 추천 교구 3개
 */
export default function RecommendTab() {
  const { child, recommendations, products } = useStore();
  const childName = child?.nickname || "아이";

  return (
    <div className="px-5">
      {/* 헤더 */}
      <div className="py-4">
        <h2 className="text-xl font-bold">💡 {childName}를 위한 맞춤 추천</h2>
        <p className="text-sm text-mid-gray mt-1">
          AI가 이번 주 기록을 분석했어요
        </p>
      </div>

      {/* 추천 활동 */}
      <div className="mb-6">
        <h3 className="text-base font-semibold mb-3">🎯 이번 주 추천 활동</h3>
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
              <button className="w-full mt-4 py-2.5 bg-soft-green-50 text-soft-green-600
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
      </div>

      {/* 추천 교구 */}
      <div className="mb-6">
        <h3 className="text-base font-semibold mb-3">🛒 추천 교구</h3>
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
      </div>

      {/* 안내 배너 */}
      <div className="info-banner mb-4">
        <div className="flex items-start gap-2">
          <span className="text-sm shrink-0">ℹ️</span>
          <p className="text-xs text-calm-blue-dark leading-relaxed">
            추천은 AI 분석 기반이며, 구매 시 수수료를 받을 수 있어요.
          </p>
        </div>
      </div>
    </div>
  );
}
