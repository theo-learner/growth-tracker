"use client";

import {
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";
import { MonthlyDataPoint, DomainKey } from "@/types";

interface TrendChartProps {
  data: MonthlyDataPoint[];
  domain: DomainKey;
}

/**
 * 영역별 꺾은선 그래프 — 실제 데이터 + 3개월 예측 점선
 */
export default function TrendChart({ data, domain }: TrendChartProps) {
  // 데이터 유효성 검증
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-40">
        <p className="text-sm text-mid-gray">데이터가 없습니다</p>
      </div>
    );
  }

  // 실제 데이터와 예측 데이터 분리
  const chartData = data.map((d) => ({
    month: d.month,
    value: d.scores[domain],
    predicted: d.predicted ? d.scores[domain] : undefined,
    actual: !d.predicted ? d.scores[domain] : undefined,
  }));

  // 예측 시작점을 연결하기 위해 마지막 실제 데이터를 예측에도 포함
  const firstPredictedIdx = data.findIndex((d) => d.predicted);
  const lastActualIdx = firstPredictedIdx > 0 ? firstPredictedIdx - 1 : -1;
  if (lastActualIdx >= 0 && lastActualIdx < chartData.length && chartData[lastActualIdx]) {
    chartData[lastActualIdx].predicted = chartData[lastActualIdx].value;
  }

  return (
    <ResponsiveContainer width="100%" height={160}>
      <AreaChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#E8E8E8" vertical={false} />
        <XAxis
          dataKey="month"
          tick={{ fontSize: 11, fill: "#888888" }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          domain={[40, 100]}
          tick={{ fontSize: 10, fill: "#888888" }}
          axisLine={false}
          tickLine={false}
        />

        {/* 예측 영역 (연한 노란색) */}
        <Area
          type="monotone"
          dataKey="predicted"
          stroke="none"
          fill="#FFD966"
          fillOpacity={0.15}
          connectNulls={false}
        />

        {/* 실제 데이터 영역 (sky blue 연한) */}
        <Area
          type="monotone"
          dataKey="actual"
          stroke="none"
          fill="#2bbdee"
          fillOpacity={0.08}
          connectNulls={false}
        />

        {/* 실제 데이터 라인 */}
        <Line
          type="monotone"
          dataKey="actual"
          stroke="#2bbdee"
          strokeWidth={2}
          dot={{ fill: "#2bbdee", r: 4 }}
          connectNulls={false}
        />

        {/* 예측 데이터 점선 */}
        <Line
          type="monotone"
          dataKey="predicted"
          stroke="#2bbdee"
          strokeWidth={2}
          strokeDasharray="6 4"
          dot={{ fill: "white", stroke: "#2bbdee", strokeWidth: 2, r: 4 }}
          connectNulls={false}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
