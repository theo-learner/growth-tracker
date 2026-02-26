"use client";

import { useState } from "react";
import { useStore } from "@/store/useStore";
import MaterialIcon from "@/components/ui/MaterialIcon";

/**
 * Step 3: 검사 결과 업로드 — Stitch K-DST 스타일
 */
export default function Step3TestUpload() {
  const { setHasExistingTest, completeOnboarding, setOnboardingStep } = useStore();
  const [uploaded, setUploaded] = useState(false);
  const [fileName, setFileName] = useState("");

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
      setUploaded(true);
      setHasExistingTest(true);
    }
  };

  return (
    <div className="animate-fadeIn space-y-6">
      {/* 섹션 헤더 */}
      <div>
        <h2 className="text-2xl font-bold text-dark-gray tracking-tight">
          혹시 받아둔 검사가 있나요?
        </h2>
        <p className="text-sm text-mid-gray mt-1.5 leading-relaxed">
          있으면 올려주시면 AI가 더 정확하게 분석할 수 있어요. 없어도 괜찮아요!
        </p>
      </div>

      {/* 파일 업로드 카드 */}
      <label className={`block w-full rounded-xl border-2 border-dashed text-center
                          cursor-pointer transition-all duration-200
                          ${uploaded
                            ? "border-primary bg-primary-50/40 p-8"
                            : "border-surface-300 bg-white hover:border-primary/50 p-8"
                          }`}>
        <input
          type="file"
          accept="image/*,.pdf"
          onChange={handleFileSelect}
          className="hidden"
        />
        {uploaded ? (
          <>
            <div className="w-14 h-14 mx-auto rounded-full bg-emerald-50 flex items-center justify-center mb-3">
              <MaterialIcon name="check_circle" size={32} className="text-emerald-500" filled />
            </div>
            <p className="font-bold text-primary-700">{fileName}</p>
            <p className="text-xs text-mid-gray mt-1">파일 업로드 완료</p>
          </>
        ) : (
          <>
            <div className="w-14 h-14 mx-auto rounded-xl bg-primary-50 flex items-center justify-center mb-3">
              <MaterialIcon name="upload_file" size={28} className="text-primary" />
            </div>
            <p className="font-semibold text-dark-gray">검사 결과 업로드</p>
            <p className="text-xs text-mid-gray mt-1 mb-4">
              사진 또는 PDF (K-WISC, K-DST, 발달검사 등)
            </p>
            <span className="inline-flex items-center gap-1.5 px-4 py-2
                             bg-primary-50 text-primary rounded-lg text-sm font-semibold">
              <MaterialIcon name="attach_file" size={16} />
              파일 선택
            </span>
          </>
        )}
      </label>

      {/* 보안 안내 */}
      <div className="flex items-center gap-2 px-1">
        <MaterialIcon name="lock" size={14} className="text-mid-gray shrink-0" />
        <p className="text-xs text-mid-gray">업로드한 파일은 기기에만 저장됩니다.</p>
      </div>

      {/* 구분선 */}
      <div className="flex items-center gap-3">
        <div className="flex-1 h-px bg-surface-300" />
        <span className="text-xs text-mid-gray">또는</span>
        <div className="flex-1 h-px bg-surface-300" />
      </div>

      {/* 건너뛰기 */}
      <button
        onClick={() => { setHasExistingTest(false); completeOnboarding(); }}
        className="w-full flex items-center justify-between p-4 rounded-xl border-2
                   border-surface-200 bg-white text-left
                   hover:border-primary/40 transition-colors duration-200"
      >
        <div>
          <p className="font-semibold text-sm text-dark-gray">검사 없이 시작하기</p>
          <p className="text-xs text-mid-gray mt-0.5">일상 기록만으로도 분석할 수 있어요</p>
        </div>
        <MaterialIcon name="arrow_forward" size={20} className="text-mid-gray shrink-0" />
      </button>

      {/* 업로드 후 완료 버튼 */}
      {uploaded && (
        <button
          onClick={() => completeOnboarding()}
          className="btn-primary animate-fade-in"
        >
          🌱 시작하기!
        </button>
      )}

      {/* 이전 */}
      <button
        onClick={() => setOnboardingStep(2)}
        className="w-full py-3 text-sm font-medium text-mid-gray
                   hover:text-dark-gray transition-colors"
      >
        ← 이전 단계로
      </button>
    </div>
  );
}
