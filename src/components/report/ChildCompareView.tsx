"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { ChildProfile, PerChildData, DOMAIN_LABELS, DomainKey } from "@/types";

interface ChildCompareViewProps {
  childList: ChildProfile[];
  allChildData: Record<string, PerChildData>;
}

const DOMAIN_KEYS: DomainKey[] = [
  "verbalComprehension",
  "visualSpatial",
  "fluidReasoning",
  "workingMemory",
  "processingSpeed",
];

// 자녀별 색상
const COLORS = ["#2bbdee", "#E8918F"];

/**
 * 다자녀 발달 점수 비교 차트
 */
export default function ChildCompareView({
  childList,
  allChildData,
}: ChildCompareViewProps) {
  const displayChildren = childList.slice(0, 2);

  const chartData = DOMAIN_KEYS.map((key) => {
    const row: Record<string, string | number> = {
      domain: DOMAIN_LABELS[key],
    };
    displayChildren.forEach((c) => {
      const score =
        allChildData[c.id]?.weeklyReport?.scores[key] ?? 0;
      row[c.nickname] = score;
    });
    return row;
  });

  // 데이터가 하나도 없으면 안내
  const hasAnyData = displayChildren.some(
    (c) => allChildData[c.id]?.weeklyReport != null
  );

  if (!hasAnyData) {
    return (
      <div className="py-8 text-center text-sm text-mid-gray">
        아직 비교할 데이터가 없어요.
        <br />
        각 아이의 활동을 기록하면 비교 차트가 생성돼요!
      </div>
    );
  }

  return (
    <div>
      {/* 자녀별 색상 범례 */}
      <div className="flex gap-4 mb-4 justify-center">
        {displayChildren.map((c, i) => (
          <div key={c.id} className="flex items-center gap-1.5 text-sm font-medium">
            <span
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: COLORS[i] }}
            />
            {c.nickname}
          </div>
        ))}
      </div>

      <ResponsiveContainer width="100%" height={220}>
        <BarChart
          data={chartData}
          margin={{ top: 4, right: 4, left: -20, bottom: 0 }}
          barCategoryGap="25%"
          barGap={4}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
          <XAxis
            dataKey="domain"
            tick={{ fontSize: 11, fill: "#8a9bb0" }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            domain={[0, 100]}
            tick={{ fontSize: 10, fill: "#8a9bb0" }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            formatter={(value: number | undefined, name: string | undefined) => [value != null ? `${value}점` : "—", name ?? ""]}
            contentStyle={{
              borderRadius: 8,
              border: "1px solid #e8ecf0",
              fontSize: 12,
              boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
            }}
          />
          <Legend wrapperStyle={{ display: "none" }} />
          {displayChildren.map((c, i) => (
            <Bar
              key={c.id}
              dataKey={c.nickname}
              fill={COLORS[i]}
              radius={[4, 4, 0, 0]}
              maxBarSize={28}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>

      {/* 점수 텍스트 요약 */}
      <div className="mt-3 space-y-2">
        {DOMAIN_KEYS.map((key) => (
          <div key={key} className="flex items-center gap-2">
            <span className="text-xs text-mid-gray w-16 shrink-0">
              {DOMAIN_LABELS[key]}
            </span>
            <div className="flex-1 flex gap-2">
              {displayChildren.map((c, i) => {
                const score =
                  allChildData[c.id]?.weeklyReport?.scores[key];
                return (
                  <span
                    key={c.id}
                    className="text-xs font-semibold"
                    style={{ color: score != null ? COLORS[i] : "#cbd5e1" }}
                  >
                    {score != null ? `${score}점` : "—"}
                  </span>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
