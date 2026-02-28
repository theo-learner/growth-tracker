"use client";

import { useState } from "react";
import HomeTab from "@/components/home/HomeTab";
import ReportTab from "@/components/report/ReportTab";
import RecommendTab from "@/components/recommend/RecommendTab";
import MonthlyTab from "@/components/monthly/MonthlyTab";
import SettingsModal from "@/components/ui/SettingsModal";
import ParentGuide from "@/components/guide/ParentGuide";
import MaterialIcon from "@/components/ui/MaterialIcon";

type Tab = "home" | "report" | "recommend" | "monthly";

const TABS: { id: Tab; icon: string; label: string }[] = [
  { id: "home",      icon: "home",           label: "홈" },
  { id: "report",    icon: "show_chart",     label: "리포트" },
  { id: "recommend", icon: "sports_esports", label: "놀이" },
  { id: "monthly",   icon: "insights",       label: "추이" },
];

/**
 * 메인 앱 v3 — Stitch 디자인 적용
 * 헤더: child_care + 알림/가이드/설정 버튼
 * 탭 바: Material Symbols + Sky Blue 활성 인디케이터
 */
export default function MainApp() {
  const [activeTab, setActiveTab] = useState<Tab>("home");
  const [showSettings, setShowSettings] = useState(false);
  const [showGuide, setShowGuide] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-surface">
      {/* 상단 헤더 */}
      <header className="flex items-center justify-between px-5 pt-5 pb-2">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
            <MaterialIcon name="child_care" size={20} className="text-primary" />
          </div>
          <span className="text-base font-bold text-slate-900">성장 트래커</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowGuide(true)}
            className="w-9 h-9 rounded-full bg-white shadow-stitch-card border border-slate-100
                       flex items-center justify-center
                       hover:shadow-stitch-card-hover transition-all duration-200"
            aria-label="가이드"
          >
            <MaterialIcon name="menu_book" size={18} className="text-slate-600" />
          </button>
          <button
            onClick={() => setShowSettings(true)}
            className="w-9 h-9 rounded-full bg-white shadow-stitch-card border border-slate-100
                       flex items-center justify-center
                       hover:shadow-stitch-card-hover transition-all duration-200"
            aria-label="설정"
          >
            <MaterialIcon name="settings" size={18} className="text-slate-600" />
          </button>
        </div>
      </header>

      {/* 메인 콘텐츠 영역 — 탭별 배경 무드 */}
      <main className={`flex-1 overflow-y-auto transition-[background] duration-500 ${
        activeTab === "home"      ? "bg-home-bg"      :
        activeTab === "report"    ? "bg-report-bg"    :
        activeTab === "recommend" ? "bg-recommend-bg" :
                                    "bg-monthly-bg"
      }`}>
        {activeTab === "home"      && <HomeTab />}
        {activeTab === "report"    && <ReportTab />}
        {activeTab === "recommend" && <RecommendTab />}
        {activeTab === "monthly"   && <MonthlyTab />}
      </main>

      {/* 하단 탭 바 */}
      <nav className="shrink-0 w-full">
        <div className="bg-white/90 backdrop-blur-xl border-t border-slate-100
                        shadow-tab-bar safe-bottom">
          <div className="flex justify-around px-2 pt-2 pb-3">
            {TABS.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    relative flex flex-col items-center gap-1
                    min-w-[48px] py-1 px-3 rounded-xl
                    transition-all duration-200
                    ${isActive ? "text-primary" : "text-slate-400 hover:text-primary/60"}
                  `}
                >
                  {/* 활성 인디케이터 */}
                  {isActive && (
                    <div className="absolute -top-2 left-1/2 -translate-x-1/2
                                    w-6 h-0.5 rounded-full bg-primary
                                    animate-scale-in-sm" />
                  )}
                  <MaterialIcon
                    name={tab.icon}
                    size={22}
                    filled={isActive}
                    className={`transition-transform duration-200 ${isActive ? "scale-110" : ""}`}
                  />
                  <span className={`text-[10px] transition-all duration-200 leading-none ${
                    isActive ? "font-bold" : "font-medium"
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

      {/* 부모 가이드 모달 */}
      {showGuide && <ParentGuide onClose={() => setShowGuide(false)} />}
    </div>
  );
}
