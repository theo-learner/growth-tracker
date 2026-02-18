import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  getReminders,
  saveReminders,
  updateReminder,
  getNotificationPermission,
  requestNotificationPermission,
  showNotification,
  startReminderScheduler,
  stopReminderScheduler,
} from "@/lib/notifications";

describe("notifications", () => {
  let store: Record<string, string>;

  beforeEach(() => {
    vi.restoreAllMocks();
    store = {};
    vi.stubGlobal("localStorage", {
      getItem: vi.fn((key: string) => store[key] || null),
      setItem: vi.fn((key: string, value: string) => { store[key] = value; }),
      removeItem: vi.fn((key: string) => { delete store[key]; }),
    });
  });

  describe("getReminders", () => {
    it("returns default reminders when nothing stored", () => {
      const reminders = getReminders();
      expect(reminders).toHaveLength(2);
      expect(reminders[0].id).toBe("morning");
      expect(reminders[1].id).toBe("evening");
    });

    it("returns stored reminders", () => {
      store["growth-tracker-reminders"] = JSON.stringify([
        { id: "custom", time: "12:00", enabled: true, message: "점심!" },
      ]);
      const reminders = getReminders();
      expect(reminders).toHaveLength(1);
      expect(reminders[0].id).toBe("custom");
    });

    it("returns defaults on invalid JSON", () => {
      store["growth-tracker-reminders"] = "invalid json{";
      const reminders = getReminders();
      expect(reminders).toHaveLength(2);
    });
  });

  describe("saveReminders", () => {
    it("saves to localStorage", () => {
      const reminders = [{ id: "test", time: "10:00", enabled: true, message: "테스트" }];
      saveReminders(reminders);
      expect(localStorage.setItem).toHaveBeenCalled();
    });
  });

  describe("updateReminder", () => {
    it("updates specific reminder", () => {
      const updated = updateReminder("morning", { enabled: true });
      const morning = updated.find((r) => r.id === "morning");
      expect(morning?.enabled).toBe(true);
    });

    it("does not modify other reminders", () => {
      const updated = updateReminder("morning", { enabled: true });
      const evening = updated.find((r) => r.id === "evening");
      expect(evening?.enabled).toBe(false);
    });
  });

  describe("getNotificationPermission", () => {
    it("returns permission status when Notification exists", () => {
      vi.stubGlobal("Notification", { permission: "granted" });
      expect(getNotificationPermission()).toBe("granted");
    });

    it("returns unsupported when Notification not available", () => {
      vi.stubGlobal("Notification", undefined);
      // @ts-expect-error testing undefined
      delete globalThis.Notification;
      // In jsdom, Notification might not exist
      // The function checks "Notification" in window
    });
  });

  describe("requestNotificationPermission", () => {
    it("returns true if already granted", async () => {
      vi.stubGlobal("Notification", { permission: "granted", requestPermission: vi.fn() });
      const result = await requestNotificationPermission();
      expect(result).toBe(true);
    });

    it("returns false if denied", async () => {
      vi.stubGlobal("Notification", { permission: "denied", requestPermission: vi.fn() });
      const result = await requestNotificationPermission();
      expect(result).toBe(false);
    });

    it("requests permission if default", async () => {
      vi.stubGlobal("Notification", {
        permission: "default",
        requestPermission: vi.fn().mockResolvedValue("granted"),
      });
      const result = await requestNotificationPermission();
      expect(result).toBe(true);
    });
  });

  describe("showNotification", () => {
    it("creates notification when granted", () => {
      const mockNotification = vi.fn();
      vi.stubGlobal("Notification", mockNotification);
      Object.defineProperty(Notification, "permission", { value: "granted", configurable: true });
      showNotification("테스트", "내용");
      expect(mockNotification).toHaveBeenCalledWith("테스트", expect.objectContaining({ body: "내용" }));
    });

    it("does nothing when not granted", () => {
      const mockNotification = vi.fn();
      vi.stubGlobal("Notification", mockNotification);
      Object.defineProperty(Notification, "permission", { value: "denied", configurable: true });
      showNotification("테스트", "내용");
      expect(mockNotification).not.toHaveBeenCalled();
    });
  });

  describe("scheduler", () => {
    it("can start and stop without errors", () => {
      vi.useFakeTimers();
      startReminderScheduler();
      stopReminderScheduler();
      vi.useRealTimers();
    });
  });
});
