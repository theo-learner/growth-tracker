import { useState, useEffect } from "react";

function easeOutQuart(t: number): number {
  return 1 - Math.pow(1 - t, 4);
}

/**
 * 0에서 target까지 카운트업 애니메이션 훅
 * @param target  최종 값
 * @param duration 애니메이션 시간 (ms)
 * @param delay    시작 딜레이 (ms) — 스태거 효과에 활용
 */
export function useCountUp(
  target: number,
  duration = 900,
  delay = 0,
): number {
  const [value, setValue] = useState(0);

  useEffect(() => {
    setValue(0);
    let frameId: number;
    const timerId = setTimeout(() => {
      const t0 = performance.now();
      const tick = (now: number) => {
        const t = Math.min((now - t0) / duration, 1);
        setValue(Math.round(target * easeOutQuart(t)));
        if (t < 1) frameId = requestAnimationFrame(tick);
      };
      frameId = requestAnimationFrame(tick);
    }, delay);

    return () => {
      clearTimeout(timerId);
      cancelAnimationFrame(frameId);
    };
  }, [target, duration, delay]);

  return value;
}
