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
  // 실제 데이터와 예측 데이터 분리
  const chartData = data.map((d) => ({
    month: d.month,
    value: d.scores[domain],
    predicted: d.predicted ? d.scores[domain] : undefined,
    actual: !d.predicted ? d.scores[domain] : undefined,
  }));

  // 예측 시작점을 연결하기 위해 마지막 실제 데이터를 예측에도 포함
  const lastActualIdx = data.findIndex((d) => d.predicted) - 1;
  if (lastActualIdx >= 0 && chartData[lastActualIdx]) {
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

        {/* 실제 데이터 영역 (연한 초록색) */}
        <Area
          type="monotone"
          dataKey="actual"
          stroke="none"
          fill="#6BBF8A"
          fillOpacity={0.1}
          connectNulls={false}
        />

        {/* 실제 데이터 라인 */}
        <Line
          type="monotone"
          dataKey="actual"
          stroke="#6BBF8A"
          strokeWidth={2}
          dot={{ fill: "#6BBF8A", r: 4 }}
          connectNulls={false}
        />

        {/* 예측 데이터 점선 */}
        <Line
          type="monotone"
          dataKey="predicted"
          stroke="#6BBF8A"
          strokeWidth={2}
          strokeDasharray="6 4"
          dot={{ fill: "white", stroke: "#6BBF8A", strokeWidth: 2, r: 4 }}
          connectNulls={false}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
