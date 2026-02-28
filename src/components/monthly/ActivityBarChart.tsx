"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export interface ActivityBarData {
  category: string;
  count: number;
  minutes: number;
}

interface ActivityBarChartProps {
  data: ActivityBarData[];
  metric: "count" | "minutes";
}

/**
 * 카테고리별 활동 통계 가로 막대 차트 (lazy loading)
 */
export default function ActivityBarChart({ data, metric }: ActivityBarChartProps) {
  if (data.length === 0) return null;

  return (
    <ResponsiveContainer width="100%" height={Math.max(120, data.length * 36)}>
      <BarChart
        data={data}
        layout="vertical"
        margin={{ top: 0, right: 24, left: 4, bottom: 0 }}
        barCategoryGap="30%"
      >
        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f0f0f0" />
        <XAxis
          type="number"
          tick={{ fontSize: 10, fill: "#8a9bb0" }}
          axisLine={false}
          tickLine={false}
          allowDecimals={false}
        />
        <YAxis
          type="category"
          dataKey="category"
          tick={{ fontSize: 12, fill: "#4b5563" }}
          axisLine={false}
          tickLine={false}
          width={52}
        />
        <Tooltip
          formatter={(v: number | undefined) =>
            metric === "count"
              ? [`${v ?? 0}회`, "횟수" as const]
              : [`${v ?? 0}분`, "총 시간" as const]
          }
          contentStyle={{
            borderRadius: 8,
            border: "1px solid #e8ecf0",
            fontSize: 12,
            boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
          }}
        />
        <Bar
          dataKey={metric}
          fill="#2bbdee"
          radius={[0, 6, 6, 0]}
          maxBarSize={20}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
