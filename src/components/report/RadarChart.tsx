"use client";

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

/**
 * 6영역 레이더 차트 v2 — 통일된 컬러 팔레트 + 부드러운 그라데이션
 */
export default function RadarChart({ scores, prevScores }: RadarChartProps) {
  const domains: DomainKey[] = [
    "language", "visuospatial", "workingMemory",
    "processingSpeed", "logic", "fineMotor",
  ];

  const data = domains.map((key) => ({
    domain: DOMAIN_LABELS[key],
    current: scores[key],
    previous: prevScores[key],
    fullMark: 100,
  }));

  return (
    <div className="relative">
      {/* 차트 배경 — 은은한 그린 글로우 + 동심원 장식 */}
      <div
        className="absolute inset-0 flex items-center justify-center pointer-events-none"
        aria-hidden
      >
        <div
          className="w-48 h-48 rounded-full opacity-[0.05]"
          style={{ background: "radial-gradient(circle, #5CB87A 0%, transparent 65%)" }}
        />
        <div
          className="absolute w-32 h-32 rounded-full opacity-[0.03]"
          style={{ background: "radial-gradient(circle, #5CB87A 0%, transparent 60%)" }}
        />
      </div>

      <ResponsiveContainer width="100%" height={280}>
        <RechartsRadarChart data={data} cx="50%" cy="50%" outerRadius="72%">
          {/* 그리드 — 부드러운 회색 (브랜드 통일) */}
          <PolarGrid
            stroke="#E8E8E8"
            strokeWidth={0.8}
            strokeDasharray="3 3"
          />
          {/* 축 라벨 — 읽기 쉬운 크기, 브랜드 색상 */}
          <PolarAngleAxis
            dataKey="domain"
            tick={{
              fontSize: 11,
              fill: "#555555",
              fontWeight: 500,
            }}
          />
          {/* 지난 주 (점선 — 따뜻한 베이지 톤) */}
          <Radar
            name="지난 주"
            dataKey="previous"
            stroke="#D4C8B0"
            fill="#D4C8B0"
            fillOpacity={0.1}
            strokeWidth={1.5}
            strokeDasharray="5 4"
          />
          {/* 이번 주 (실선 — 브랜드 그린 + 그라데이션 필) */}
          <Radar
            name="이번 주"
            dataKey="current"
            stroke="#5CB87A"
            fill="url(#radarGreenGradient)"
            fillOpacity={0.28}
            strokeWidth={2.5}
            dot={{
              r: 3.5,
              fill: "#5CB87A",
              stroke: "#FFFFFF",
              strokeWidth: 2,
            }}
          />
          {/* 그라데이션 정의 — 더 부드러운 그린 */}
          <defs>
            <radialGradient id="radarGreenGradient" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#DCFCE7" stopOpacity={0.7} />
              <stop offset="60%" stopColor="#5CB87A" stopOpacity={0.25} />
              <stop offset="100%" stopColor="#5CB87A" stopOpacity={0.15} />
            </radialGradient>
          </defs>
        </RechartsRadarChart>
      </ResponsiveContainer>

      {/* 범례 — 하단 (세련된 디자인) */}
      <div className="flex items-center justify-center gap-6 mt-2 text-xs text-mid-gray">
        <span className="flex items-center gap-2">
          <span className="w-5 h-[3px] rounded-full bg-soft-green inline-block" />
          <span className="font-medium">이번 주</span>
        </span>
        <span className="flex items-center gap-2">
          <span
            className="w-5 h-[2px] inline-block rounded-full"
            style={{
              backgroundImage: "repeating-linear-gradient(90deg, #D4C8B0 0, #D4C8B0 3px, transparent 3px, transparent 6px)",
            }}
          />
          <span className="font-medium">지난 주</span>
        </span>
      </div>
    </div>
  );
}
