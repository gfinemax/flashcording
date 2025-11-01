# Flash AI Coding Agent

![Flash Logo](https://img.shields.io/badge/Flash-AI%20Coding%20Agent-blue?style=for-the-badge)
![Next.js](https://img.shields.io/badge/Next.js-14.2-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)
![React](https://img.shields.io/badge/React-19-blue?style=for-the-badge&logo=react)

AI 기반 코딩 에이전트와 게임화된 학습 경험을 제공하는 크로스 플랫폼 애플리케이션입니다.

## ✨ 주요 기능

### 🤖 AI 코딩 에이전트
- **자연어 → 코드**: 자연어로 요구사항을 입력하면 production-ready 코드 자동 생성
- **실시간 스트리밍**: 에이전트의 사고 과정과 코드 생성을 실시간으로 확인
- **Monaco Editor**: Syntax highlighting 및 코드 편집 기능
- **다중 언어 지원**: Python, JavaScript, TypeScript, Go, Rust 등

### 📊 게이미피케이션 시스템
- **레벨 & XP**: 활동에 따른 경험치 획득 및 레벨업
- **배지 시스템**: 다양한 성취에 대한 배지 수집
- **리더보드**: 전체/주간/월간 랭킹 시스템
- **활동 피드**: 실시간 활동 내역 추적

### 📝 코딩 퀴즈
- **다양한 문제 유형**: 객관식, 주관식, 코드 작성
- **카테고리별 분류**: Python, Git, React 등 주제별 학습
- **난이도 선택**: 초급, 중급, 고급 난이도
- **즉시 피드백**: 정답/오답 해설 및 XP 획득

### 🔄 Git 통합
- **Diff 뷰어**: 코드 변경사항을 시각적으로 확인
- **자동 커밋**: AI가 생성한 코드를 바로 커밋
- **변경 이력**: Git 히스토리 분석 및 표시

## 🚀 시작하기

### 필수 요구사항

- Node.js 18+ (LTS)
- pnpm (권장) 또는 npm
- Git

### 설치

1. **저장소 클론**
\`\`\`bash
git clone https://github.com/yourusername/flashcording.git
cd flashcording
\`\`\`

2. **의존성 설치**
\`\`\`bash
pnpm install
# 또는
npm install
\`\`\`

3. **환경 변수 설정**
\`\`\`bash
cp .env.example .env.local
\`\`\`

`.env.local` 파일을 열어 다음 값들을 설정하세요:

\`\`\`env
# Google OAuth (선택사항)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-nextauth-secret

# API Keys (선택사항 - 프론트엔드에서 직접 LLM 호출 시)
OPENAI_API_KEY=your-openai-api-key
ANTHROPIC_API_KEY=your-anthropic-api-key
\`\`\`

4. **개발 서버 실행**
\`\`\`bash
pnpm dev
# 또는
npm run dev
\`\`\`

5. **브라우저에서 접속**

[http://localhost:3000](http://localhost:3000) 으로 접속하세요.

## 📦 빌드

프로덕션 빌드를 생성하려면:

\`\`\`bash
pnpm build
pnpm start
\`\`\`

## 🏗️ 프로젝트 구조

\`\`\`
flashcording/
├── app/                      # Next.js App Router 페이지
│   ├── agent/               # AI 에이전트 워크스페이스
│   ├── diff/                # Git Diff/Commit 뷰어
│   ├── quiz/                # 코딩 퀴즈
│   ├── gamification/        # 게이미피케이션 대시보드
│   ├── settings/            # 사용자 설정
│   ├── login/               # 로그인 페이지
│   ├── register/            # 회원가입 페이지
│   └── api/                 # API 라우트
│       └── auth/            # NextAuth.js
├── components/              # React 컴포넌트
│   ├── ui/                  # Shadcn/ui 기본 컴포넌트
│   ├── app-sidebar.tsx      # 사이드바
│   ├── app-layout.tsx       # 레이아웃 래퍼
│   ├── code-editor.tsx      # Monaco Editor 래퍼
│   └── ...                  # 기타 컴포넌트
├── lib/                     # 유틸리티 & 비즈니스 로직
│   ├── api/                 # API 클라이언트
│   ├── store/               # Zustand 상태 관리
│   ├── mocks/               # Mock 데이터
│   └── types.ts             # TypeScript 타입 정의
├── hooks/                   # Custom React Hooks
├── styles/                  # 글로벌 스타일
└── public/                  # 정적 파일
\`\`\`

## 🎨 기술 스택

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **UI Library**: React 19
- **Styling**: Tailwind CSS
- **Component Library**: Radix UI + Shadcn/ui
- **State Management**: Zustand
- **Code Editor**: Monaco Editor
- **Animation**: Framer Motion
- **Forms**: React Hook Form + Zod

### Backend (예정)
- **Server**: Django + FastAPI
- **Database**: PostgreSQL
- **Authentication**: JWT
- **LLM**: OpenAI API, Anthropic Claude
- **Agent Framework**: LangGraph

## 🔐 인증

이 프로젝트는 NextAuth.js를 사용합니다:

- **Google OAuth**: 구글 계정으로 로그인
- **Email/Password**: 이메일과 비밀번호로 로그인
- **JWT**: 세션 관리

## 🎯 로드맵

### Phase 1: MVP ✅
- [x] 프로젝트 초기 설정
- [x] UI 컴포넌트 구현
- [x] 인증 시스템
- [x] AI 에이전트 UI
- [x] 퀴즈 시스템
- [x] 게이미피케이션 UI

### Phase 2: Backend 연동 (진행 중)
- [ ] Django 서버 구축
- [ ] PostgreSQL 데이터베이스 설계
- [ ] RESTful API 구현
- [ ] LangGraph 에이전트 통합
- [ ] 실제 코드 생성 기능

### Phase 3: 고급 기능
- [ ] Git 로컬 연동
- [ ] 코드 복잡도 분석
- [ ] 적응형 학습 알고리즘
- [ ] 모바일 앱 (React Native)

## 🤝 기여하기

기여는 언제나 환영합니다! 다음 과정을 따라주세요:

1. Fork the Project
2. Create your Feature Branch (\`git checkout -b feature/AmazingFeature\`)
3. Commit your Changes (\`git commit -m 'Add some AmazingFeature'\`)
4. Push to the Branch (\`git push origin feature/AmazingFeature\`)
5. Open a Pull Request

## 📝 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다.

## 📧 문의

프로젝트에 대한 질문이나 제안사항이 있으시면 이슈를 생성해주세요.

## 🙏 감사의 말

- [Next.js](https://nextjs.org/)
- [Shadcn/ui](https://ui.shadcn.com/)
- [Radix UI](https://www.radix-ui.com/)
- [Monaco Editor](https://microsoft.github.io/monaco-editor/)
- [Framer Motion](https://www.framer.com/motion/)

---

Made with ⚡ by Flash Team
