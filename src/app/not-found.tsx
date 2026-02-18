import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-cream">
      <div className="text-center p-8 max-w-sm">
        <p className="text-4xl mb-4">🔍</p>
        <h2 className="text-lg font-bold text-dark-gray mb-2">페이지를 찾을 수 없어요</h2>
        <p className="text-sm text-dark-gray/70 mb-6">
          주소를 다시 확인해 주세요.
        </p>
        <Link
          href="/"
          className="px-6 py-2 bg-soft-green text-white rounded-full text-sm font-medium hover:bg-soft-green/90 transition-colors"
        >
          홈으로 돌아가기
        </Link>
      </div>
    </div>
  );
}
