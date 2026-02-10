# 🌱 AI 성장 트래커 (Growth Tracker)

아이의 일상 기록을 통해 발달 상태를 분석하고 맞춤형 가이드를 제공하는 AI 비서입니다.

## 🚀 주요 기능
- **간편 기록**: 활동, 독서, 질문, 감정, 사진 등 다양한 형식 지원
- **AI 분석**: Claude AI 기반 일일 인사이트 및 주간 리포트
- **맞춤 추천**: 아이 발달 단계에 맞는 활동 및 교구 추천
- **프라이버시**: 기본 데이터 로컬 저장, PWA 지원

## 🛠️ 기술 스택
- Framework: **Next.js 14** (App Router)
- Language: **TypeScript**
- AI: **Claude 3 Haiku** (분석) / **Sonnet** (추천)
- Styling: **Tailwind CSS**
- State: **Zustand** (Persistence)

## 📦 배포 방법 (Vercel)

이 프로젝트는 **Next.js API Routes**를 사용하므로 **Vercel** 배포를 권장합니다.

1. [Vercel](https://vercel.com)에 로그인 후 **"Add New Project"** 클릭
2. GitHub 리포지토리(`growth-tracker`) 연결
3. **Environment Variables** 설정:
   - `ANTHROPIC_API_KEY`: (Claude API 키 입력)
4. **Deploy** 클릭

> **주의**: GitHub Pages와 같은 정적 호스팅에서는 AI 분석 기능(`/api/*`)이 작동하지 않습니다.
