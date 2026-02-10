/**
 * 데이터 내보내기 유틸리티 — CSV/JSON 형식
 */

import { ActivityRecord, ChildProfile } from "@/types";

// 활동 기록을 CSV 문자열로 변환
export function activitiesToCSV(activities: ActivityRecord[]): string {
  const headers = ["날짜", "시간", "유형", "내용", "상세"];
  
  const rows = activities.map((act) => {
    const date = new Date(act.timestamp);
    const dateStr = date.toLocaleDateString("ko-KR");
    const timeStr = date.toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" });
    
    const typeLabels: Record<string, string> = {
      photo: "사진",
      activity: "활동",
      question: "질문",
      reading: "독서",
      emotion: "감정",
    };
    
    let content = "";
    let detail = "";
    
    switch (act.type) {
      case "activity":
        const actData = act.data as { category: string; durationMin: number; detail?: string };
        content = actData.category;
        detail = `${actData.durationMin}분${actData.detail ? ` - ${actData.detail}` : ""}`;
        break;
      case "question":
        const qData = act.data as { quote: string; context?: string };
        content = qData.quote;
        detail = qData.context || "";
        break;
      case "reading":
        const rData = act.data as { bookTitle: string; readAlone: boolean; durationMin?: number };
        content = rData.bookTitle;
        detail = `${rData.readAlone ? "혼자" : "같이"}${rData.durationMin ? ` ${rData.durationMin}분` : ""}`;
        break;
      case "emotion":
        const eData = act.data as { emoji: string; label: string; note?: string };
        content = `${eData.emoji} ${eData.label}`;
        detail = eData.note || "";
        break;
      case "photo":
        const pData = act.data as { fileName: string; note?: string };
        content = pData.fileName;
        detail = pData.note || "";
        break;
    }
    
    // CSV 이스케이프 (쌍따옴표 처리)
    const escape = (str: string) => `"${str.replace(/"/g, '""')}"`;
    
    return [dateStr, timeStr, typeLabels[act.type] || act.type, escape(content), escape(detail)].join(",");
  });
  
  return [headers.join(","), ...rows].join("\n");
}

// 전체 데이터를 JSON으로 내보내기
export function exportAllDataAsJSON(data: {
  child: ChildProfile | null;
  activities: ActivityRecord[];
}): string {
  return JSON.stringify(data, null, 2);
}

// 파일 다운로드 트리거
export function downloadFile(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// CSV 내보내기
export function exportActivitiesCSV(activities: ActivityRecord[]): void {
  const csv = activitiesToCSV(activities);
  const date = new Date().toISOString().split("T")[0];
  downloadFile(csv, `성장트래커_기록_${date}.csv`, "text/csv;charset=utf-8");
}

// JSON 내보내기
export function exportAllDataJSON(child: ChildProfile | null, activities: ActivityRecord[]): void {
  const json = exportAllDataAsJSON({ child, activities });
  const date = new Date().toISOString().split("T")[0];
  downloadFile(json, `성장트래커_전체_${date}.json`, "application/json");
}
