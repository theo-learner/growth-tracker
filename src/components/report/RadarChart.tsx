"use client";

import { useState, useEffect } from "react";
import {
  Radar,
  RadarChart as RechartsRadarChart,
  PolarGrid,
  PolarAngleAxis,
  ResponsiveContainer,
} from "recharts";
import { DomainKey, DOMAIN_LABELS } from "@/types";

interface RadarChartProps {
  scores: Record<DomainKey, number>;
  prevScores: Record<DomainKey, number>;
}

const domains: DomainKey[] = [
  "verbalComprehension", "visualSpatial", "fluidReasoning",
  "workingMemory", "processingSpeed",
];

const ZERO = Object.fromEntries(domains.map((k) => [k, 0])) as Record<DomainKey, number>;

function easeOutQuart(t: number): number {
  return 1 - Math.pow(1 - t, 4);
}

/** 0에서 targets 값까지 duration ms 동안 보간 후 onUpdate 호출 */
function animateTo(
  targets: Record<DomainKey, number>,
  duration: number,
  delay: number,
  onUpdate: (v: Record<DomainKey, number>) => void,
): () => void {
  let frameId: number;
  const timerId = setTimeout(() => {
    const t0 = performance.now();
    const tick = (now: number) => {
      const t = Math.min((now - t0) / duration, 1);
      const eased = easeOutQuart(t);
      onUpdate(
        Object.fromEntries(domains.map((k) => [k, targets[k] * eased])) as Record<DomainKey, number>,
      );
      if (t < 1) frameId = requestAnimationFrame(tick);
    };
    frameId = requestAnimationFrame(tick);
  }, delay);

  return () => {
    clearTimeout(timerId);
    cancelAnimationFrame(frameId);
  };
}

/**
 * 6영역 레이더 차트 — 드로 애니메이션
 * 지난 주(점선) → 0→값 800ms, 이번 주(실선) → 300ms 딜레이 후 1200ms
 */
export default function RadarChart({ scores, prevScores }: RadarChartProps) {
  const [displayPrev, setDisplayPrev] = useState<Record<DomainKey, number>>(ZERO);
  const [displayCurr, setDisplayCurr] = useState<Record<DomainKey, number>>(ZERO);

  useEffect(() => {
    setDisplayPrev(ZERO);
    setDisplayCurr(ZERO);

    const cancelPrev = animateTo(prevScores, 800, 0, setDisplayPrev);
    const cancelCurr = animateTo(scores, 1200, 300, setDisplayCurr);

    return () => {
      cancelPrev();
      cancelCurr();
    };
  }, [scores, prevScores]);

  if (!scores || !prevScores) {
    return (
      <div className="flex items-center justify-center h-[280px]">
        <p className="text-sm text-mid-gray">데이터가 없습니다</p>
      </div>
    );
  }

  const data = domains.map((key) => ({
    domain: DOMAIN_LABELS[key],
    current: displayCurr[key],
    previous: displayPrev[key],
    fullMark: 100,
  }));

  return (
    <div className="relative">
      {/* 배경 글로우 */}
      <div
        className="absolute inset-0 flex items-center justify-center pointer-events-none"
        aria-hidden
      >
        <div
          className="w-48 h-48 rounded-full opacity-[0.05]"
          style={{ background: "radial-gradient(circle, #2bbdee 0%, transparent 65%)" }}
        />
      </div>

      <ResponsiveContainer width="100%" height={280}>
        <RechartsRadarChart data={data} cx="50%" cy="50%" outerRadius="72%">
          <PolarGrid stroke="#E8E8E8" strokeWidth={0.8} strokeDasharray="3 3" />
          <PolarAngleAxis
            dataKey="domain"
            tick={{ fontSize: 11, fill: "#555555", fontWeight: 500 }}
          />

          {/* 지난 주 */}
          <Radar
            name="지난 주"
            dataKey="previous"
            stroke="#D4C8B0"
            fill="#D4C8B0"
            fillOpacity={0.1}
            strokeWidth={1.5}
            strokeDasharray="5 4"
            isAnimationActive={false}
          />

          {/* 이번 주 */}
          <Radar
            name="이번 주"
            dataKey="current"
            stroke="#2bbdee"
            fill="url(#radarBlueGradient)"
            fillOpacity={0.28}
            strokeWidth={2.5}
            dot={{ r: 3.5, fill: "#2bbdee", stroke: "#FFFFFF", strokeWidth: 2 }}
            isAnimationActive={false}
          />

          <defs>
            <radialGradient id="radarBlueGradient" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#e0f4fe" stopOpacity={0.7} />
              <stop offset="60%" stopColor="#2bbdee" stopOpacity={0.25} />
              <stop offset="100%" stopColor="#2bbdee" stopOpacity={0.15} />
            </radialGradient>
          </defs>
        </RechartsRadarChart>
      </ResponsiveContainer>

      {/* 범례 */}
      <div className="flex items-center justify-center gap-6 mt-2 text-xs text-slate-500">
        <span className="flex items-center gap-2">
          <span className="w-5 h-[3px] rounded-full bg-primary inline-block" />
          <span className="font-medium">이번 주</span>
        </span>
        <span className="flex items-center gap-2">
          <span
            className="w-5 h-[2px] inline-block rounded-full"
            style={{
              backgroundImage:
                "repeating-linear-gradient(90deg, #D4C8B0 0, #D4C8B0 3px, transparent 3px, transparent 6px)",
            }}
          />
          <span className="font-medium">지난 주</span>
        </span>
      </div>
    </div>
  );
}
