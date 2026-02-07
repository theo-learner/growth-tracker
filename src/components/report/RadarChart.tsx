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
 * 6영역 레이더 차트 — Recharts 기반
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
  }));

  return (
    <ResponsiveContainer width="100%" height={280}>
      <RechartsRadarChart data={data} cx="50%" cy="50%" outerRadius="75%">
        <PolarGrid stroke="#E8E8E8" />
        <PolarAngleAxis
          dataKey="domain"
          tick={{ fontSize: 12, fill: "#333333" }}
        />
        {/* 지난 주 (점선 효과 - 연한 색상) */}
        <Radar
          name="지난 주"
          dataKey="previous"
          stroke="#E8E8E8"
          fill="#E8E8E8"
          fillOpacity={0.2}
          strokeWidth={1.5}
          strokeDasharray="4 4"
        />
        {/* 이번 주 (실선) */}
        <Radar
          name="이번 주"
          dataKey="current"
          stroke="#6BBF8A"
          fill="#6BBF8A"
          fillOpacity={0.25}
          strokeWidth={2}
        />
      </RechartsRadarChart>
    </ResponsiveContainer>
  );
}
