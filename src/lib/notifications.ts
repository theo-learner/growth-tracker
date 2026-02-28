/**
 * 알림/리마인더 시스템 — Web Notifications API + localStorage
 */

export interface Reminder {
  id: string;
  time: string; // HH:MM 형식
  enabled: boolean;
  message: string;
}

const STORAGE_KEY = "growth-tracker-reminders";
const PERMISSION_KEY = "growth-tracker-notification-permission";

// 기본 리마인더 설정
const DEFAULT_REMINDERS: Reminder[] = [
  { id: "morning", time: "09:00", enabled: false, message: "☀️ 좋은 아침! 오늘 아이의 첫 기록을 남겨볼까요?" },
  { id: "evening", time: "20:00", enabled: false, message: "🌙 오늘 하루는 어땠나요? 아이 기록을 남겨보세요!" },
];

// 리마인더 목록 가져오기
export function getReminders(): Reminder[] {
  if (typeof window === "undefined") return DEFAULT_REMINDERS;
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return DEFAULT_REMINDERS;
  try {
    return JSON.parse(stored);
  } catch {
    return DEFAULT_REMINDERS;
  }
}

// 리마인더 저장
export function saveReminders(reminders: Reminder[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(reminders));
}

// 리마인더 업데이트
export function updateReminder(id: string, updates: Partial<Reminder>): Reminder[] {
  const reminders = getReminders();
  const updated = reminders.map((r) => (r.id === id ? { ...r, ...updates } : r));
  saveReminders(updated);
  return updated;
}

// 알림 권한 요청
export async function requestNotificationPermission(): Promise<boolean> {
  if (typeof window === "undefined" || !("Notification" in window)) {
    return false;
  }

  if (Notification.permission === "granted") {
    localStorage.setItem(PERMISSION_KEY, "granted");
    return true;
  }

  if (Notification.permission === "denied") {
    return false;
  }

  const permission = await Notification.requestPermission();
  localStorage.setItem(PERMISSION_KEY, permission);
  return permission === "granted";
}

// 알림 권한 상태 확인
export function getNotificationPermission(): NotificationPermission | "unsupported" {
  if (typeof window === "undefined" || !("Notification" in window)) {
    return "unsupported";
  }
  return Notification.permission;
}

// 알림 표시 (Service Worker 기반 — 백그라운드 지원)
export async function showNotification(title: string, body: string): Promise<void> {
  if (typeof window === "undefined" || !("Notification" in window)) return;
  if (Notification.permission !== "granted") return;

  // SW 등록이 있으면 SW를 통해 알림 (백그라운드/포그라운드 모두 동작)
  if ("serviceWorker" in navigator) {
    try {
      const registration = await navigator.serviceWorker.ready;
      await registration.showNotification(title, {
        body,
        icon: "/icons/icon-192.svg",
        badge: "/icons/icon-192.svg",
        tag: "growth-tracker-reminder",
        renotify: true,
      } as NotificationOptions);
      return;
    } catch {
      // SW 알림 실패 시 fallback
    }
  }

  // Fallback: 직접 Notification API (포그라운드 전용)
  new Notification(title, {
    body,
    icon: "/icons/icon-192.svg",
    badge: "/icons/icon-192.svg",
    tag: "growth-tracker",
  });
}

// 리마인더 스케줄링 (간단한 setInterval 기반)
let checkInterval: NodeJS.Timeout | null = null;

export function startReminderScheduler(): void {
  if (typeof window === "undefined") return;
  if (checkInterval) return; // 이미 실행 중

  const checkReminders = () => {
    const now = new Date();
    const currentTime = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;

    const reminders = getReminders();
    reminders.forEach((reminder) => {
      if (reminder.enabled && reminder.time === currentTime) {
        void showNotification("🌱 성장 트래커", reminder.message);
      }
    });
  };

  // 매 분마다 체크
  checkInterval = setInterval(checkReminders, 60000);
  // 초기 체크
  checkReminders();
}

export function stopReminderScheduler(): void {
  if (checkInterval) {
    clearInterval(checkInterval);
    checkInterval = null;
  }
}
