"use client";

import { useMemo } from "react";
import { useStore } from "@/store/useStore";
import { calculateMonths, getKDSTChecklist } from "@/data/k-dst";
import MaterialIcon from "@/components/ui/MaterialIcon";

const DOMAIN_COLORS: Record<string, string> = {
  대근육: "bg-blue-100 text-blue-700",
  소근육: "bg-purple-100 text-purple-700",
  인지: "bg-teal-100 text-teal-700",
  언어: "bg-primary-100 text-primary-700",
  사회성: "bg-orange-100 text-orange-700",
  자조: "bg-rose-100 text-rose-700",
};

export default function KDSTChecklist() {
  const { child, activeChildId, kdstChecks, toggleKDSTCheck } = useStore();

  const checklist = useMemo(() => {
    if (!child) return null;
    // birthDate 우선, 없으면 age 기반 추정
    const months = child.birthDate
      ? calculateMonths(child.birthDate)
      : child.age === 4
        ? 50
        : child.age === 5
          ? 64
          : 66;
    return getKDSTChecklist(months);
  }, [child]);

  if (!checklist) return null;

  const totalTasks = checklist.tasks.length;
  const checkedCount = checklist.tasks.filter((_, i) => {
    const key = `${activeChildId}_${checklist.range}_${i}`;
    return !!kdstChecks[key];
  }).length;

  const progressPercent = Math.round((checkedCount / totalTasks) * 100);

  return (
    <div className="bg-white rounded-xl border border-slate-100 shadow-stitch-card p-4">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <h4 className="text-sm font-bold text-dark-gray flex items-center gap-1.5">
            <MaterialIcon name="checklist" size={16} className="text-primary" />
            이 시기 발달 과업
          </h4>
          <p className="text-xs text-mid-gray mt-0.5">K-DST {checklist.range} 기준</p>
        </div>
        <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
          checkedCount === totalTasks
            ? "bg-primary-50 text-primary-700"
            : "bg-surface text-mid-gray"
        }`}>
          {checkedCount}/{totalTasks} 달성
        </span>
      </div>

      {/* 프로그레스 바 */}
      <div className="w-full h-1.5 bg-surface-200 rounded-full mb-4 overflow-hidden">
        <div
          className="h-full bg-primary rounded-full transition-all duration-500"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* 체크리스트 */}
      <div className="space-y-2">
        {checklist.tasks.map((task, i) => {
          const key = `${activeChildId}_${checklist.range}_${i}`;
          const isChecked = !!kdstChecks[key];
          const domainColor = DOMAIN_COLORS[task.domain] ?? "bg-surface-200 text-mid-gray";
          return (
            <button
              key={i}
              onClick={() => toggleKDSTCheck(key)}
              className={`w-full flex items-start gap-3 px-3 py-2.5 rounded-xl text-left transition-all ${
                isChecked ? "bg-primary-50" : "bg-surface hover:bg-surface-200"
              }`}
            >
              <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 mt-0.5 transition-all ${
                isChecked ? "bg-primary border-primary" : "border-slate-300"
              }`}>
                {isChecked && (
                  <MaterialIcon name="check" size={13} className="text-white" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <span className={`inline-block text-[10px] font-bold px-1.5 py-0.5 rounded-full mb-1 ${domainColor}`}>
                  {task.domain}
                </span>
                <p className={`text-sm leading-snug ${
                  isChecked ? "text-mid-gray line-through" : "text-dark-gray"
                }`}>
                  {task.question}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      {/* 완료 메시지 */}
      {checkedCount === totalTasks && totalTasks > 0 && (
        <div className="mt-3 bg-primary-50 rounded-xl px-4 py-3 flex items-center gap-2">
          <span className="text-lg">🎉</span>
          <p className="text-sm font-semibold text-primary-700">이 시기 발달 과업을 모두 달성했어요!</p>
        </div>
      )}
    </div>
  );
}
