"use client";

import { useState } from "react";
import { useStore } from "@/store/useStore";

/**
 * Step 3: 기존 검사 결과 업로드 (선택) or "안 했어요" 버튼
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

  const handleSkip = () => {
    setHasExistingTest(false);
    completeOnboarding();
  };

  const handleComplete = () => {
    completeOnboarding();
  };

  return (
    <div className="animate-fadeIn">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold">
          혹시 받아둔 검사가 있나요? 📋
        </h1>
        <p className="text-sm text-mid-gray mt-2 leading-relaxed">
          있으면 올려주시면 AI가 더 정확하게 분석할 수 있어요.
          <br />
          없어도 괜찮아요!
        </p>
      </div>

      {/* 파일 업로드 영역 */}
      <div className="mb-6">
        <label
          className={`block w-full p-8 border-2 border-dashed rounded-card text-center cursor-pointer transition-all
            ${uploaded
              ? "border-primary bg-primary-50/30"
              : "border-light-gray bg-white hover:border-primary/40"
            }`}
        >
          <input
            type="file"
            accept="image/*,.pdf"
            onChange={handleFileSelect}
            className="hidden"
          />
          {uploaded ? (
            <>
              <div className="text-4xl mb-2">✅</div>
              <p className="font-semibold text-primary">{fileName}</p>
              <p className="text-xs text-mid-gray mt-1">파일 업로드 완료</p>
            </>
          ) : (
            <>
              <div className="text-4xl mb-2">📄</div>
              <p className="font-semibold text-dark-gray">검사 결과 업로드</p>
              <p className="text-xs text-mid-gray mt-1">
                사진 또는 PDF (K-WISC, 발달검사 등)
              </p>
              <div className="mt-3 inline-block px-4 py-2 bg-primary-50 text-primary rounded-button text-sm font-semibold">
                📎 파일 선택
              </div>
            </>
          )}
        </label>
      </div>

      {/* 구분선 */}
      <div className="flex items-center gap-3 mb-6">
        <div className="flex-1 h-px bg-light-gray" />
        <span className="text-xs text-mid-gray">또는</span>
        <div className="flex-1 h-px bg-light-gray" />
      </div>

      {/* 안 했어요 버튼 */}
      <button
        onClick={handleSkip}
        className="w-full py-3 mb-6 rounded-button font-medium text-base
                   bg-white text-mid-gray border border-light-gray
                   hover:border-primary/40 transition-all"
      >
        🙅 안 했어요 / 나중에
      </button>

      {/* 보안 안내 */}
      <p className="text-xs text-mid-gray text-center mb-6">
        🔒 업로드한 파일은 암호화되어 안전하게 보관됩니다.
      </p>

      {/* 네비게이션 */}
      <div className="flex gap-3">
        <button
          onClick={() => setOnboardingStep(2)}
          className="flex-1 h-12 rounded-button font-semibold text-base
                     bg-white text-mid-gray border border-light-gray
                     hover:border-primary/40 transition-all"
        >
          ← 이전
        </button>
        {uploaded && (
          <button
            onClick={handleComplete}
            className="flex-[2] h-12 btn-primary"
          >
            🌱 시작하기!
          </button>
        )}
      </div>
    </div>
  );
}
