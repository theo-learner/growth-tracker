"use client";

import { useState } from "react";
import HomeTab from "@/components/home/HomeTab";
import ReportTab from "@/components/report/ReportTab";
import RecommendTab from "@/components/recommend/RecommendTab";
import MonthlyTab from "@/components/monthly/MonthlyTab";
import SettingsModal from "@/components/ui/SettingsModal";

type Tab = "home" | "report" | "recommend" | "monthly";

const TABS: { id: Tab; icon: string; label: string }[] = [
  { id: "home", icon: "🏠", label: "홈" },
  { id: "report", icon: "📊", label: "리포트" },
  { id: "recommend", icon: "💡", label: "추천" },
  { id: "monthly", icon: "📈", label: "추이" },
];

/**
 * 메인 앱 — 하단 탭 네비게이션
 */
export default function MainApp() {
  const [activeTab, setActiveTab] = useState<Tab>("home");
  const [showSettings, setShowSettings] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-warm-beige">
      {/* 상단 바 */}
      <header className="flex items-center justify-between px-5 pt-3 pb-2">
        <span className="text-lg">🌱</span>
        <button
          onClick={() => setShowSettings(true)}
          className="text-lg p-1"
          aria-label="설정"
        >
          ⚙️
        </button>
      </header>

      {/* 메인 콘텐츠 영역 */}
      <main className="flex-1 overflow-y-auto pb-24">
        {activeTab === "home" && <HomeTab />}
        {activeTab === "report" && <ReportTab />}
        {activeTab === "recommend" && <RecommendTab />}
        {activeTab === "monthly" && <MonthlyTab />}
      </main>

      {/* 하단 탭 바 */}
      <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] bg-white border-t border-light-gray px-4 pb-5 pt-2 z-50">
        <div className="flex justify-around">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center gap-0.5 min-w-[48px] py-1 transition-colors
                ${activeTab === tab.id ? "text-soft-green" : "text-mid-gray"}`}
            >
              <span className="text-xl">{tab.icon}</span>
              <span className="text-[11px] font-medium">{tab.label}</span>
            </button>
          ))}
        </div>
      </nav>

      {/* 설정 모달 */}
      {showSettings && <SettingsModal onClose={() => setShowSettings(false)} />}
    </div>
  );
}
