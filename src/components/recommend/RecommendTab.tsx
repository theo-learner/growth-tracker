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
            <div key={i} className="bg-white rounded-card shadow-card p-4">
              <div className="flex items-start gap-3">
                <span className="text-2xl">{rec.icon}</span>
                <div className="flex-1">
                  <h4 className="font-semibold text-dark-gray">
                    {i + 1}️⃣ {rec.title}
                  </h4>
                  <p className="text-sm text-dark-gray mt-1 leading-relaxed">
                    &ldquo;{rec.description}&rdquo;
                  </p>
                  <div className="flex items-center gap-3 mt-2 text-xs text-mid-gray">
                    <span>📌 {rec.reason}</span>
                    <span>⏰ {rec.duration}</span>
                  </div>
                </div>
              </div>
              <button className="w-full mt-3 py-2 bg-soft-green/10 text-soft-green rounded-button text-sm font-semibold
                               hover:bg-soft-green/20 transition-all">
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
            <div key={i} className="bg-white rounded-card shadow-card p-4">
              <div className="flex items-start gap-3">
                <div className="w-16 h-16 bg-warm-beige rounded-button flex items-center justify-center text-3xl shrink-0">
                  {prod.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-dark-gray text-sm">
                    {prod.name}
                  </h4>
                  <p className="text-base font-bold text-dark-gray mt-1">
                    {prod.price}
                  </p>
                  <p className="text-xs text-mid-gray mt-1">
                    💬 &ldquo;{prod.reason}&rdquo;
                  </p>
                </div>
              </div>
              <a
                href={prod.link}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full mt-3 py-2 bg-sunny-yellow/20 text-dark-gray rounded-button text-sm font-semibold text-center
                         hover:bg-sunny-yellow/30 transition-all"
              >
                🛒 쿠팡에서 보기 →
              </a>
            </div>
          ))}
        </div>
      </div>

      {/* 안내 */}
      <div className="bg-calm-blue/10 rounded-button px-4 py-3 mb-4">
        <p className="text-xs text-calm-blue leading-relaxed">
          ℹ️ 추천은 AI 분석 기반이며, 구매 시 수수료를 받을 수 있어요.
        </p>
      </div>
    </div>
  );
}
