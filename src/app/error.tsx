"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error for monitoring (no console.log per Tier 1)
    void error;
  }, [error]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-cream">
      <div className="text-center p-8 max-w-sm">
        <p className="text-4xl mb-4">😥</p>
        <h2 className="text-lg font-bold text-dark-gray mb-2">문제가 발생했어요</h2>
        <p className="text-sm text-dark-gray/70 mb-6">
          잠시 후 다시 시도해 주세요.
        </p>
        <button
          onClick={reset}
          className="px-6 py-2 bg-soft-green text-white rounded-full text-sm font-medium hover:bg-soft-green/90 transition-colors"
        >
          다시 시도
        </button>
      </div>
    </div>
  );
}
