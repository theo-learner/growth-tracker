"use client";

import { useState } from "react";
import HomeTab from "@/components/home/HomeTab";
import ReportTab from "@/components/report/ReportTab";
import RecommendTab from "@/components/recommend/RecommendTab";
import MonthlyTab from "@/components/monthly/MonthlyTab";
import SettingsModal from "@/components/ui/SettingsModal";

type Tab = "home" | "report" | "recommend" | "monthly";

const TABS: { id: Tab; icon: string; iconActive: string; label: string }[] = [
  { id: "home", icon: "🏠", iconActive: "🏡", label: "홈" },
  { id: "report", icon: "📊", iconActive: "📊", label: "리포트" },
  { id: "recommend", icon: "💡", iconActive: "💡", label: "추천" },
  { id: "monthly", icon: "📈", iconActive: "📈", label: "추이" },
];

/**
 * 메인 앱 v2 — 하단 탭 네비게이션 (디자인 개선)
 * 탭 바: 유리 효과 + 부드러운 그림자
 */
export default function MainApp() {
  const [activeTab, setActiveTab] = useState<Tab>("home");
  const [showSettings, setShowSettings] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-warm-beige">
      {/* 상단 바 — 미니멀 + 투명 */}
      <header className="flex items-center justify-between px-5 pt-4 pb-2">
        <div className="flex items-center gap-2">
          <span className="text-xl">🌱</span>
          <span className="text-sm font-semibold text-soft-green hidden">성장 트래커</span>
        </div>
        <button
          onClick={() => setShowSettings(true)}
          className="w-9 h-9 rounded-full bg-white/80 shadow-badge
                     flex items-center justify-center
                     hover:shadow-card transition-all duration-200"
          aria-label="설정"
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M9 11.25C10.2426 11.25 11.25 10.2426 11.25 9C11.25 7.75736 10.2426 6.75 9 6.75C7.75736 6.75 6.75 7.75736 6.75 9C6.75 10.2426 7.75736 11.25 9 11.25Z" stroke="#888" strokeWidth="1.5" strokeLinecap="round"/>
            <path d="M7.3 2.1L7.65 3.15C7.85 3.7 7.55 4.3 7 4.5L6.5 4.7C5.95 4.9 5.35 4.6 5.15 4.05L4.8 3M10.7 2.1L10.35 3.15C10.15 3.7 10.45 4.3 11 4.5L11.5 4.7C12.05 4.9 12.65 4.6 12.85 4.05L13.2 3" stroke="#888" strokeWidth="1.2" strokeLinecap="round" opacity="0.6"/>
          </svg>
        </button>
      </header>

      {/* 메인 콘텐츠 영역 */}
      <main className="flex-1 overflow-y-auto pb-24">
        {activeTab === "home" && <HomeTab />}
        {activeTab === "report" && <ReportTab />}
        {activeTab === "recommend" && <RecommendTab />}
        {activeTab === "monthly" && <MonthlyTab />}
      </main>

      {/* 하단 탭 바 — 글래스 모피즘 + 둥근 모서리 */}
      <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] z-50">
        <div className="mx-3 mb-2 px-4 pt-2.5 pb-3 rounded-2xl
                        glass-strong
                        shadow-tab-bar safe-bottom">
          <div className="flex justify-around">
            {TABS.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    relative flex flex-col items-center gap-0.5
                    min-w-[48px] py-1 px-3 rounded-xl
                    transition-all duration-200
                    ${isActive
                      ? "text-soft-green"
                      : "text-mid-gray hover:text-soft-green/60"
                    }
                  `}
                >
                  {/* 활성 인디케이터 — 부드러운 글로우 */}
                  {isActive && (
                    <div className="absolute -top-0.5 left-1/2 -translate-x-1/2
                                    w-5 h-1 rounded-full bg-soft-green
                                    shadow-btn-green animate-scale-in-sm" />
                  )}
                  <span className="text-xl transition-transform duration-200"
                        style={{ transform: isActive ? 'scale(1.12)' : 'scale(1)' }}>
                    {isActive ? tab.iconActive : tab.icon}
                  </span>
                  <span className={`text-[10px] transition-all duration-200 ${
                    isActive ? "font-bold text-soft-green-600" : "font-medium"
                  }`}>
                    {tab.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* 설정 모달 */}
      {showSettings && <SettingsModal onClose={() => setShowSettings(false)} />}
    </div>
  );
}
