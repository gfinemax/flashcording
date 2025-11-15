# Backend Integration Guide

프론트엔드와 백엔드 API를 연동하는 방법을 설명합니다.

## 개요

Flash AI Coding Agent 프론트엔드는 다음 백엔드 서비스들과 통합됩니다:

1. **Django Backend** (Port 8000) - 사용자 인증, 퀴즈, 게이미피케이션
2. **FastAPI LLM Backend** (Port 8001) - AI 코드 생성
3. **Desktop Backend** (Port 5000) - Git 작업

## 환경 설정

### 1. 환경 변수 설정

`.env.example` 파일을 `.env.local`로 복사하고 필요한 값을 설정하세요:

```bash
cp .env.example .env.local
```

### 2. 주요 환경 변수

```env
# Django 백엔드 URL
NEXT_PUBLIC_API_URL=http://localhost:8000

# FastAPI LLM 백엔드 URL
NEXT_PUBLIC_LLM_API_URL=http://localhost:8001

# Desktop 백엔드 포트
NEXT_PUBLIC_DESKTOP_BACKEND_PORT=5000

# Mock 데이터 사용 여부 (백엔드 없이 개발할 때)
NEXT_PUBLIC_ENABLE_MOCK_DATA=false
```

## 통합된 기능

### 1. 인증 (Authentication)

**파일**: `lib/services/auth.ts`

**엔드포인트**:
- `POST /api/users/login` - 로그인
- `POST /api/users/register` - 회원가입
- `POST /api/users/refresh` - 토큰 갱신
- `GET /api/users/me` - 현재 사용자 정보

**사용 예시**:
```typescript
import { login } from "@/lib/services/auth"

const response = await login({ email, password })
localStorage.setItem("access_token", response.access_token)
```

### 2. 퀴즈 (Quiz)

**파일**: `lib/services/quiz.ts`

**엔드포인트**:
- `GET /api/quizzes/pools` - 퀴즈 풀 목록
- `POST /api/quizzes/sessions` - 퀴즈 세션 시작
- `POST /api/quizzes/answers` - 답변 제출
- `POST /api/quizzes/complete` - 퀴즈 완료

**사용 예시**:
```typescript
import { getQuizPools, startQuizSession } from "@/lib/services/quiz"

const pools = await getQuizPools()
const session = await startQuizSession(poolId)
```

### 3. AI 에이전트 (Agent)

**파일**: `lib/services/agent.ts`

**엔드포인트**:
- `POST /api/generate` - 코드 생성
- `POST /api/generate/stream` - 스트리밍 코드 생성
- `GET /api/context/analyze` - 프로젝트 컨텍스트 분석
- `POST /api/validate` - 코드 검증

**사용 예시**:
```typescript
import { generateCodeStream } from "@/lib/services/agent"

await generateCodeStream(
  { prompt, language, project_context: { git_history: true } },
  {
    onThinkingStep: (step) => console.log(step),
    onCodeChunk: (chunk) => console.log(chunk),
    onComplete: (response) => console.log(response),
  }
)
```

### 4. 게이미피케이션 (Gamification)

**파일**: `lib/services/gamification.ts`

**엔드포인트**:
- `GET /api/gamification/badges` - 뱃지 목록
- `GET /api/gamification/leaderboard` - 리더보드
- `GET /api/gamification/activities` - 활동 피드
- `GET /api/gamification/stats` - 사용자 통계
- `POST /api/gamification/exp` - 경험치 추가

**사용 예시**:
```typescript
import { getBadges, getLeaderboard } from "@/lib/services/gamification"

const badges = await getBadges()
const leaderboard = await getLeaderboard(10)
```

### 5. Git 작업 (Git Operations)

**파일**: `lib/services/git.ts`

**엔드포인트**:
- `GET /api/git/status` - Git 상태
- `GET /api/git/log` - 커밋 히스토리
- `POST /api/git/commit` - 커밋 생성
- `GET /api/git/diff` - Diff 조회

**사용 예시**:
```typescript
import { getGitStatus, createCommit } from "@/lib/services/git"

const status = await getGitStatus()
const result = await createCommit({ message: "feat: add feature", files: ["src/file.ts"] })
```

## Mock 모드

백엔드가 준비되지 않았을 때는 Mock 모드를 사용할 수 있습니다:

```env
NEXT_PUBLIC_ENABLE_MOCK_DATA=true
```

이 설정을 활성화하면:
- 모든 API 호출이 mock 데이터를 반환합니다
- 백엔드 서버 없이 프론트엔드 개발이 가능합니다
- 실제 API 구조와 동일한 인터페이스를 유지합니다

## API 클라이언트 설정

**파일**: `lib/api/client.ts`

두 개의 Axios 클라이언트가 구성되어 있습니다:

1. **apiClient** - Django 백엔드용
   - 자동 JWT 토큰 인증
   - 토큰 갱신 로직 포함
   - 401 에러 시 자동 리다이렉트

2. **llmClient** - FastAPI LLM 백엔드용
   - LLM API 전용
   - 긴 타임아웃 설정 (30초)

## 에러 핸들링

모든 API 호출은 try-catch로 감싸고, 실패 시 mock 데이터로 폴백합니다:

```typescript
try {
  if (!env.enableMockData) {
    const data = await apiCall()
    return data
  }
  return mockData
} catch (error) {
  toast.error("API call failed")
  return mockData // Graceful degradation
}
```

## 개발 워크플로우

### 백엔드 없이 개발

```bash
# .env.local
NEXT_PUBLIC_ENABLE_MOCK_DATA=true

npm run dev
```

### 백엔드와 함께 개발

1. 백엔드 서버 시작:
   ```bash
   # Django backend
   cd backend
   python manage.py runserver 8000

   # FastAPI LLM backend
   cd llm-backend
   uvicorn main:app --port 8001

   # Desktop backend
   cd desktop-backend
   python server.py --port 5000
   ```

2. 프론트엔드 시작:
   ```bash
   # .env.local
   NEXT_PUBLIC_ENABLE_MOCK_DATA=false

   npm run dev
   ```

## 타입 안전성

모든 API 서비스는 TypeScript로 작성되어 있으며, 요청/응답 타입이 정의되어 있습니다:

```typescript
export interface LoginRequest {
  email: string
  password: string
}

export interface AuthResponse {
  access_token: string
  refresh_token: string
  user: {
    id: string
    email: string
    username: string
    level: number
    exp: number
  }
}
```

## 디버깅

브라우저 콘솔에서 API 호출을 확인할 수 있습니다:

```javascript
// Axios 인터셉터가 모든 요청/응답을 로깅합니다
apiClient.interceptors.request.use(config => {
  console.log('API Request:', config)
  return config
})
```

## 다음 단계

1. 백엔드 API 엔드포인트 구현
2. API 스펙 문서화 (Swagger/OpenAPI)
3. 통합 테스트 작성
4. 프로덕션 환경 설정

## 문의

통합 관련 문제가 있으면 이슈를 생성해주세요.
