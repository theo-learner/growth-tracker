import type { Config } from "tailwindcss";

// ============================================
// AI 성장 트래커 — Tailwind 설정 v3
// 프리미엄 부모 친화적 디자인 시스템
// Soft Green + Warm Beige 기조
// 6개 발달 영역별 고유 색상 (레이더 차트용)
// ============================================

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // ─── Primary — 자연스러운 소프트 그린 ───
        "soft-green": {
          DEFAULT: "#5CB87A",
          50: "#F0FDF4",
          100: "#DCFCE7",
          200: "#BBF7D0",
          300: "#86EFAC",
          400: "#5CB87A",
          500: "#4CAF6E",
          600: "#38A55B",
          700: "#2D8A4A",
          800: "#1E6B37",
          900: "#14532D",
        },

        // ─── Background — 따뜻한 베이지/크림 ───
        "warm-beige": {
          DEFAULT: "#F5F0E8",
          50: "#FDFCFA",
          100: "#FAF7F2",
          200: "#F5F0E8",
          300: "#EDE5D6",
          400: "#E0D5C1",
        },

        // ─── Secondary — 보조 색상 ───
        "sunny-yellow": {
          DEFAULT: "#F5C542",
          light: "#FFF0B8",
          dark: "#D4A520",
        },
        "calm-blue": {
          DEFAULT: "#6BA3C7",
          light: "#D4E8F5",
          dark: "#4A7FA3",
        },
        "soft-coral": {
          DEFAULT: "#E8918F",
          light: "#FDE0DF",
          dark: "#D4625F",
        },

        // ─── 웩슬러 5대 영역별 고유 색상 (레이더 차트/뱃지용) ───
        "domain": {
          // 언어이해 (Verbal Comprehension) — 따뜻한 블루
          "verbalComprehension": "#5B9BD5",
          "verbalComprehension-light": "#D6E8F7",
          "verbalComprehension-bg": "#EEF4FB",
          // 시공간 (Visual Spatial) — 보라/퍼플
          "visualSpatial": "#9B72CF",
          "visualSpatial-light": "#E6D9F5",
          "visualSpatial-bg": "#F3EDF9",
          // 유동추론 (Fluid Reasoning) — 틸/청록
          "fluidReasoning": "#4BBFA0",
          "fluidReasoning-light": "#C9F0E2",
          "fluidReasoning-bg": "#EEFAF5",
          // 작업기억 (Working Memory) — 오렌지
          "workingMemory": "#E8935A",
          "workingMemory-light": "#FAE0CC",
          "workingMemory-bg": "#FDF2EA",
          // 처리속도 (Processing Speed) — 핑크/코럴
          "processingSpeed": "#E07788",
          "processingSpeed-light": "#FADCE1",
          "processingSpeed-bg": "#FDF0F2",
        },

        // ─── Neutral — 텍스트/구분선 ───
        "dark-gray": "#2C2C2C",
        "mid-gray": "#8C8C8C",
        "light-gray": "#E8E4DE",
      },

      fontFamily: {
        pretendard: [
          "Pretendard Variable",
          "Pretendard",
          "-apple-system",
          "BlinkMacSystemFont",
          "system-ui",
          "Roboto",
          "sans-serif",
        ],
      },

      borderRadius: {
        card: "16px",
        "cardLg": "20px",
        button: "12px",
        badge: "20px",
      },

      boxShadow: {
        // 카드 — 따뜻하고 입체적인 그림자 (멀티 레이어)
        "card":
          "0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.05), 0 0 0 1px rgba(0,0,0,0.02)",
        "card-hover":
          "0 4px 12px rgba(0,0,0,0.06), 0 12px 32px -4px rgba(0,0,0,0.08), 0 0 0 1px rgba(0,0,0,0.02)",
        "card-active":
          "0 1px 2px rgba(0,0,0,0.04), 0 0 0 1px rgba(0,0,0,0.02)",
        // 카드 — 그린 틴트 (인사이트 카드)
        "card-green":
          "0 1px 3px rgba(92,184,122,0.06), 0 4px 16px rgba(92,184,122,0.1), 0 0 0 1px rgba(92,184,122,0.06)",
        // 버튼 — 그린 글로우
        "btn-green":
          "0 2px 6px rgba(92,184,122,0.25), 0 4px 14px rgba(92,184,122,0.18)",
        "btn-green-hover":
          "0 4px 12px rgba(92,184,122,0.3), 0 8px 24px rgba(92,184,122,0.2)",
        // 인풋 포커스
        "input-focus":
          "0 0 0 3px rgba(92,184,122,0.12), 0 1px 3px rgba(0,0,0,0.04)",
        // 뱃지
        "badge":
          "0 1px 3px rgba(0,0,0,0.06), 0 0 0 1px rgba(0,0,0,0.03)",
        // 탭 바 — 부드러운 올림
        "tab-bar":
          "0 -4px 20px rgba(0,0,0,0.06), 0 -1px 6px rgba(0,0,0,0.03)",
        // 인사이트 카드
        "insight":
          "0 2px 8px rgba(92,184,122,0.1), 0 8px 24px rgba(92,184,122,0.06)",
        // 플로팅 액션
        "float":
          "0 4px 16px rgba(0,0,0,0.1), 0 8px 32px rgba(0,0,0,0.06)",
        // 온보딩 스텝 — 활성 도트 글로우
        "step-active":
          "0 0 0 4px rgba(92,184,122,0.15), 0 2px 8px rgba(92,184,122,0.2)",
        // 내부 — 인셋 (차트 배경용)
        "inner":
          "inset 0 1px 4px rgba(0,0,0,0.04)",
      },

      // 커스텀 애니메이션 — 부드럽고 자연스러운 모션
      animation: {
        "fade-in": "fadeIn 0.35s ease-out forwards",
        "fade-in-up": "fadeInUp 0.4s ease-out forwards",
        "fade-in-down": "fadeInDown 0.35s ease-out forwards",
        "slide-up": "slideUp 0.35s cubic-bezier(0.16, 1, 0.3, 1)",
        "slide-down": "slideDown 0.35s ease-out",
        "scale-in": "scaleIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
        "scale-in-sm": "scaleInSm 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)",
        "pulse-soft": "pulseSoft 2.5s ease-in-out infinite",
        "bounce-gentle": "bounceGentle 2s ease-in-out infinite",
        "progress-fill": "progressFill 0.8s ease-out forwards",
        "shimmer": "shimmer 2s infinite linear",
        "float": "float 3s ease-in-out infinite",
        "wiggle": "wiggle 0.4s ease-in-out",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        fadeInUp: {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        fadeInDown: {
          "0%": { opacity: "0", transform: "translateY(-12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideUp: {
          "0%": { transform: "translateY(100%)" },
          "100%": { transform: "translateY(0)" },
        },
        slideDown: {
          "0%": { transform: "translateY(-20px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        scaleIn: {
          "0%": { transform: "scale(0.85)", opacity: "0" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        scaleInSm: {
          "0%": { transform: "scale(0.92)", opacity: "0" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        pulseSoft: {
          "0%, 100%": { opacity: "0.7" },
          "50%": { opacity: "1" },
        },
        bounceGentle: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-4px)" },
        },
        progressFill: {
          "0%": { width: "0%" },
          "100%": { width: "var(--progress-width, 0%)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-6px)" },
        },
        wiggle: {
          "0%, 100%": { transform: "rotate(0deg)" },
          "25%": { transform: "rotate(-3deg)" },
          "75%": { transform: "rotate(3deg)" },
        },
      },

      // 트랜지션 — 자연스러운 easing 커브
      transitionTimingFunction: {
        "ease-soft": "cubic-bezier(0.25, 0.1, 0.25, 1)",
        "ease-bounce": "cubic-bezier(0.34, 1.56, 0.64, 1)",
        "ease-spring": "cubic-bezier(0.16, 1, 0.3, 1)",
      },
      transitionDuration: {
        "250": "250ms",
        "350": "350ms",
        "400": "400ms",
      },

      // 배경 이미지 — 미세 패턴/그라데이션용
      backgroundImage: {
        "warm-gradient": "linear-gradient(180deg, #FAF7F2 0%, #F5F0E8 50%, #FAF7F2 100%)",
        "green-gradient": "linear-gradient(135deg, #5CB87A 0%, #4CAF6E 100%)",
        "green-soft-gradient": "linear-gradient(135deg, #DCFCE7 0%, #F0FDF4 100%)",
        "card-gradient": "linear-gradient(180deg, #FFFFFF 0%, #FDFCF9 100%)",
        "insight-gradient": "linear-gradient(135deg, #F0FDF4 0%, #DCFCE7 40%, #F0FDF4 100%)",
        "highlight-gradient": "linear-gradient(135deg, #FFFDF5 0%, #FFF8E0 100%)",
        "shimmer-gradient":
          "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.5) 50%, transparent 100%)",
      },
      backgroundSize: {
        "shimmer": "200% 100%",
      },
    },
  },
  plugins: [],
};
export default config;
