export default function Loading() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-cream">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-soft-green border-t-transparent mx-auto mb-4" />
        <p className="text-dark-gray text-sm">로딩 중...</p>
      </div>
    </div>
  );
}
