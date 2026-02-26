interface MaterialIconProps {
  name: string;
  size?: number;
  className?: string;
  filled?: boolean;
}

/**
 * Material Symbols Outlined 래퍼
 * layout.tsx에서 폰트를 preload하므로 추가 import 불필요
 */
export default function MaterialIcon({
  name,
  size = 24,
  className = "",
  filled = false,
}: MaterialIconProps) {
  return (
    <span
      className={`material-symbols-outlined leading-none select-none ${className}`}
      style={{
        fontSize: size,
        fontVariationSettings: `'FILL' ${filled ? 1 : 0}, 'wght' 400, 'GRAD' 0, 'opsz' ${size}`,
      }}
      aria-hidden="true"
    >
      {name}
    </span>
  );
}
