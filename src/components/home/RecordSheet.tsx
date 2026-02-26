"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { useStore } from "@/store/useStore";
import { ActivityType, ActivityRecord } from "@/types";

interface RecordSheetProps {
  type: ActivityType;
  onClose: () => void;
}

const ACTIVITY_CATEGORIES = [
  { value: "퍼즐", emoji: "🧩" },
  { value: "블록", emoji: "🏗️" },
  { value: "학습", emoji: "✏️" },
  { value: "미술", emoji: "🎨" },
  { value: "운동", emoji: "🏃" },
  { value: "기타", emoji: "📝" },
];

const EMOTION_OPTIONS = [
  { emoji: "😊", label: "행복" },
  { emoji: "😐", label: "보통" },
  { emoji: "😤", label: "짜증" },
  { emoji: "😢", label: "슬픔" },
  { emoji: "😴", label: "피곤" },
  { emoji: "🤩", label: "신남" },
];

/**
 * 바텀시트 형태의 기록 입력 UI
 */
export default function RecordSheet({ type, onClose }: RecordSheetProps) {
  const addActivity = useStore((s) => s.addActivity);
  const fileRef = useRef<HTMLInputElement>(null);

  // 공통 상태
  const [note, setNote] = useState("");
  // 활동 기록용
  const [category, setCategory] = useState("");
  const [duration, setDuration] = useState("");
  // 독서 기록용
  const [bookTitle, setBookTitle] = useState("");
  const [readAlone, setReadAlone] = useState(false);
  // 질문 기록용
  const [quote, setQuote] = useState("");
  const [context, setContext] = useState("");
  // 감정 기록용
  const [selectedEmotion, setSelectedEmotion] = useState<{ emoji: string; label: string } | null>(null);
  // 사진용
  const [fileName, setFileName] = useState("");
  const [imageData, setImageData] = useState<string | null>(null);

  // 이미지 파일 처리
  const handleImageSelect = (file: File) => {
    setFileName(file.name);
    const reader = new FileReader();
    reader.onloadend = () => {
      setImageData(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    const id = `act-${Date.now()}`;
    const timestamp = new Date().toISOString();
    let record: ActivityRecord;

    switch (type) {
      case "activity": {
        if (!category) return;
        // duration 검증: 양수이며 합리적인 범위 (0~600분 = 10시간)
        const durationNum = parseInt(duration) || 0;
        if (durationNum < 0 || durationNum > 600) {
          alert("소요 시간은 0~600분 사이로 입력해주세요.");
          return;
        }
        record = { id, type, timestamp, data: { category, durationMin: durationNum, detail: note } };
        break;
      }
      case "question":
        if (!quote.trim()) return;
        // 최대 길이 검증
        if (quote.trim().length > 500) {
          alert("질문은 500자 이내로 입력해주세요.");
          return;
        }
        record = { id, type, timestamp, data: { quote: quote.trim(), context: context.trim() || undefined } };
        break;
      case "reading": {
        if (!bookTitle.trim()) return;
        if (bookTitle.trim().length > 200) {
          alert("책 제목은 200자 이내로 입력해주세요.");
          return;
        }
        const readDuration = duration ? parseInt(duration) : undefined;
        if (readDuration !== undefined && (readDuration < 0 || readDuration > 600)) {
          alert("읽은 시간은 0~600분 사이로 입력해주세요.");
          return;
        }
        record = {
          id, type, timestamp,
          data: { bookTitle: bookTitle.trim(), readAlone, durationMin: readDuration },
        };
        break;
      }
      case "emotion":
        if (!selectedEmotion) return;
        if (note.trim().length > 200) {
          alert("메모는 200자 이내로 입력해주세요.");
          return;
        }
        record = {
          id, type, timestamp,
          data: { emoji: selectedEmotion.emoji, label: selectedEmotion.label, note: note.trim() || undefined },
        };
        break;
      case "photo":
        if (note.trim().length > 200) {
          alert("메모는 200자 이내로 입력해주세요.");
          return;
        }
        record = {
          id, type, timestamp,
          data: { 
            fileName: fileName || "photo.jpg", 
            note: note.trim() || undefined,
            imageData: imageData || undefined,
          },
        };
        break;
      default:
        return;
    }

    addActivity(record);
    onClose();
  };

  const titles: Record<ActivityType, string> = {
    photo: "📸 사진 올리기",
    activity: "⏱️ 활동 기록",
    question: "💬 아이 질문 기록",
    reading: "📖 독서 기록",
    emotion: "😤 감정 메모",
  };

  return (
    <>
      {/* 백드롭 — 블러 효과 */}
      <div 
        className="bottom-sheet-backdrop" 
        onClick={onClose}
        role="presentation"
        aria-hidden="true"
      />

      {/* 바텀시트 — 프리미엄 라운드 */}
      <div className="bottom-sheet" role="dialog" aria-modal="true" aria-labelledby="record-sheet-title">
        {/* 핸들 */}
        <div className="bottom-sheet-handle" />

        <div className="px-5 pb-8 max-h-[70vh] overflow-y-auto">
          {/* 헤더 */}
          <div className="flex items-center justify-between mb-4">
            <h3 id="record-sheet-title" className="text-lg font-bold">{titles[type]}</h3>
            <button 
              onClick={onClose} 
              className="text-mid-gray text-xl hover:text-dark-gray transition-colors"
              aria-label="닫기"
              type="button"
            >
              ✕
            </button>
          </div>

          {/* 타입별 폼 */}
          {type === "photo" && (
            <div className="space-y-4">
              <button
                onClick={() => fileRef.current?.click()}
                className="w-full py-8 border-2 border-dashed border-light-gray rounded-card text-center hover:border-soft-green transition-all"
              >
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) handleImageSelect(f);
                  }}
                />
                {imageData ? (
                  <div className="relative">
                    <Image 
                      src={imageData} 
                      alt="미리보기" 
                      width={320}
                      height={160}
                      className="max-h-40 mx-auto rounded-lg object-contain"
                      unoptimized
                    />
                    <p className="text-xs text-soft-green mt-2">✅ {fileName}</p>
                  </div>
                ) : (
                  <>
                    <p className="text-3xl mb-2">📷</p>
                    <p className="text-sm text-mid-gray">탭해서 사진 선택</p>
                  </>
                )}
              </button>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="메모 (선택)"
                className="w-full h-20 px-3 py-2 border border-light-gray rounded-button text-sm resize-none
                           focus:outline-none focus:border-soft-green"
              />
            </div>
          )}

          {type === "activity" && (
            <div className="space-y-4">
              <div>
                <p className="text-sm font-semibold mb-2">활동 종류</p>
                <div className="grid grid-cols-3 gap-2">
                  {ACTIVITY_CATEGORIES.map((cat) => (
                    <button
                      key={cat.value}
                      onClick={() => setCategory(cat.value)}
                      className={`py-3 rounded-card text-center text-sm font-medium transition-all
                        ${category === cat.value
                          ? "bg-soft-green text-white shadow-md"
                          : "bg-warm-beige text-dark-gray hover:bg-soft-green/10"
                        }`}
                    >
                      <span className="text-xl block mb-1">{cat.emoji}</span>
                      {cat.value}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-sm font-semibold mb-2">소요 시간 (분)</p>
                <input
                  type="number"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  placeholder="예: 30"
                  className="w-full h-12 px-4 border border-light-gray rounded-button text-base
                             focus:outline-none focus:border-soft-green"
                />
              </div>
              <div>
                <p className="text-sm font-semibold mb-2">메모 (선택)</p>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="예: 72조각 공룡 퍼즐 혼자 완성!"
                  className="w-full h-20 px-3 py-2 border border-light-gray rounded-button text-sm resize-none
                             focus:outline-none focus:border-soft-green"
                />
              </div>
            </div>
          )}

          {type === "question" && (
            <div className="space-y-4">
              <div>
                <p className="text-sm font-semibold mb-2">아이가 한 질문</p>
                <textarea
                  value={quote}
                  onChange={(e) => setQuote(e.target.value)}
                  placeholder='예: "엄마 왜 달은 낮에도 있어?"'
                  className="w-full h-24 px-3 py-2 border border-light-gray rounded-button text-sm resize-none
                             focus:outline-none focus:border-soft-green"
                />
              </div>
              <div>
                <p className="text-sm font-semibold mb-2">상황 (선택)</p>
                <input
                  type="text"
                  value={context}
                  onChange={(e) => setContext(e.target.value)}
                  placeholder="예: 산책 중에 갑자기"
                  className="w-full h-12 px-4 border border-light-gray rounded-button text-sm
                             focus:outline-none focus:border-soft-green"
                />
              </div>
            </div>
          )}

          {type === "reading" && (
            <div className="space-y-4">
              <div>
                <p className="text-sm font-semibold mb-2">책 제목</p>
                <input
                  type="text"
                  value={bookTitle}
                  onChange={(e) => setBookTitle(e.target.value)}
                  placeholder="예: 구름빵"
                  className="w-full h-12 px-4 border border-light-gray rounded-button text-base
                             focus:outline-none focus:border-soft-green"
                />
              </div>
              <div>
                <p className="text-sm font-semibold mb-2">읽기 방식</p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setReadAlone(false)}
                    className={`flex-1 py-3 rounded-button font-medium text-sm transition-all
                      ${!readAlone ? "bg-soft-green text-white" : "bg-warm-beige text-dark-gray"}`}
                  >
                    📖 같이 읽음
                  </button>
                  <button
                    onClick={() => setReadAlone(true)}
                    className={`flex-1 py-3 rounded-button font-medium text-sm transition-all
                      ${readAlone ? "bg-soft-green text-white" : "bg-warm-beige text-dark-gray"}`}
                  >
                    🧑 혼자 읽음
                  </button>
                </div>
              </div>
              <div>
                <p className="text-sm font-semibold mb-2">읽은 시간 (분, 선택)</p>
                <input
                  type="number"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  placeholder="예: 20"
                  className="w-full h-12 px-4 border border-light-gray rounded-button text-sm
                             focus:outline-none focus:border-soft-green"
                />
              </div>
            </div>
          )}

          {type === "emotion" && (
            <div className="space-y-4">
              <div>
                <p className="text-sm font-semibold mb-2">오늘 아이 기분</p>
                <div className="grid grid-cols-3 gap-2">
                  {EMOTION_OPTIONS.map((em) => (
                    <button
                      key={em.label}
                      onClick={() => setSelectedEmotion(em)}
                      className={`py-3 rounded-card text-center transition-all
                        ${selectedEmotion?.label === em.label
                          ? "bg-soft-green text-white shadow-md"
                          : "bg-warm-beige text-dark-gray hover:bg-soft-green/10"
                        }`}
                    >
                      <span className="text-2xl block mb-1">{em.emoji}</span>
                      <span className="text-xs font-medium">{em.label}</span>
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-sm font-semibold mb-2">한줄 메모 (선택)</p>
                <input
                  type="text"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="예: 퍼즐 완성하고 뿌듯해했어요"
                  className="w-full h-12 px-4 border border-light-gray rounded-button text-sm
                             focus:outline-none focus:border-soft-green"
                />
              </div>
            </div>
          )}

          {/* 저장 버튼 */}
          <button
            onClick={handleSave}
            className="w-full h-12 mt-6 rounded-button font-semibold text-base
                       bg-soft-green text-white shadow-md
                       hover:bg-soft-green/90 active:scale-[0.98] transition-all"
          >
            ✅ 기록 완료
          </button>
        </div>
      </div>
    </>
  );
}
