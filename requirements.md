# Flash AI Coding Agent - Product Requirements Document (PRD) v3.0

## 1. 제품 개요

### 1.1 제품 비전
Flash는 AI 기반 코딩 에이전트(LangGraph)를 활용하여 개발자의 생산성을 향상시키고, 게임화된 학습 경험을 통해 코딩 실력을 향상시키는 **크로스 플랫폼 애플리케이션**입니다.

### 1.2 핵심 가치 제안
- **AI 코딩 어시스턴트**: LangGraph 기반 에이전트가 Git 분석, 커밋 생성, 코드 리뷰 자동화
- **로컬 실행**: Desktop Backend가 로컬에서 Git 작업 수행, 민감한 코드 보호
- **실시간 피드백**: Diff/Commit 결과를 시각적으로 확인하고 즉시 적용
- **학습 게임화**: 퀴즈와 배지 시스템으로 코딩 스킬 향상 동기 부여
- **진행 상황 추적**: 레벨, XP, 리더보드를 통한 성장 가시화
- **크로스 플랫폼**: 데스크톱과 모바일에서 동일한 학습 경험 제공

### 1.3 시스템 아키텍처
\`\`\`
┌─────────────────────────────────────────────┐
│  Desktop Frontend (Electron/Tauri + React)  │
│  - UI/UX Layer                              │
│  - Monaco Editor                            │
│  - Redux/Zustand State Management           │
└──────────────┬──────────────────────────────┘
               │ IPC
┌──────────────▼──────────────────────────────┐
│  Desktop Backend (Python 3.11)              │
│  - LangGraph Agent Module                   │
│  - Git Analyzer Module                      │
│  - Git Commit Module                        │
│  - Local Embedding Model (optional)         │
└──────────────┬──────────────────────────────┘
               │ REST API (Axios)
┌──────────────▼──────────────────────────────┐
│  Django Server (공통 서버)                  │
│  - 인증/유저 관리                           │
│  - Quiz Engine Module                       │
│  - Gamification Engine Module               │
│  - 작업 큐 관리 (Celery + Redis)            │
└──────────────┬──────────────────────────────┘
               │
┌──────────────▼──────────────────────────────┐
│  FastAPI Server (LLM 서버)                  │
│  - LangChain Agent                          │
│  - LLM API 호출 (OpenAI, Anthropic)         │
│  - 트레이스/비용 집계                       │
└─────────────────────────────────────────────┘
               │
┌──────────────▼──────────────────────────────┐
│  Mobile App (React Native / Flutter)        │
│  - 학습/퀴즈 UI                             │
│  - 프로필/레벨 확인                         │
│  - 데스크톱 앱과 데이터 동기화              │
└─────────────────────────────────────────────┘
\`\`\`

---

## 2. 모듈 아키텍처

### 2.1 코딩 에이전트 모듈 (LangGraph + OpenAI API)

**역할**: 사용자의 자연어 입력을 분석하고 LLM을 통해 Python/Flask 코드를 생성

**기술 스택**:
- Backend: Python 3.11+, LangGraph, LangChain, OpenAI API
- Local model: llama.cpp / HuggingFace SLM (optional)
- Git CLI 연동: GitPython
- Logging: Python logging, rich

**입출력 포맷**:
- 입력(Input): 자연어 명령(JSON 형식)
  \`\`\`json
  {
    "prompt": "Flask 로그인 페이지 만들어줘",
    "context": {
      "project_path": "/path/to/project",
      "file_structure": ["app.py", "templates/"]
    }
  }
  \`\`\`
- 출력(Output): 생성된 코드(JSON)
  \`\`\`json
  {
    "code": "app.py content...",
    "explanation": "Flask 로그인 페이지를 생성했습니다...",
    "files": [
      {"path": "app.py", "content": "..."},
      {"path": "templates/login.html", "content": "..."}
    ]
  }
  \`\`\`

**세부 태스크**:
- LangGraph 상태 그래프 설계 (StateGraph, Node, Transition 정의)
- 사용자 입력 분석 → LLM 호출 로직 구현
- API Key 관리 및 보안 처리
- 코드 생성용 프롬프트 엔지니어링 (명령 + 컨텍스트 + 정책)
- 결과를 JSON 포맷으로 리턴
- 에러 핸들링 및 재시도 로직

---

### 2.2 로컬 분석 및 Git 연동 모듈

**역할**: 로컬 파일 구조와 Git 기록을 분석하여 컨텍스트 생성 및 자동 커밋 수행

**기술 스택**:
- Python (os, glob, GitPython, json)
- Local embedding model (sentence-transformers 등)
- AST 파싱 (ast 모듈)

**입출력 포맷**:
- 입력: 프로젝트 루트 경로 (`project_path`)
- 출력: 파일 구조 트리 및 요약 JSON
  \`\`\`json
  {
    "summary": "이 프로젝트는 Flask 기반 로그인 시스템입니다.",
    "file_list": ["app.py", "templates/login.html", "requirements.txt"],
    "git_history": [
      {"commit": "a1b2c3d", "message": "Initial commit", "date": "2025-10-28"}
    ],
    "complexity": "medium",
    "main_technologies": ["Flask", "SQLAlchemy", "Jinja2"]
  }
  \`\`\`

**세부 태스크**:
- 로컬 Git 히스토리 분석 (`git log`, `git diff`)
- 주요 파일 내용 요약 (LLM or embedding)
- 코드 복잡도 분석 (AST 기반)
- 코드 생성 프롬프트에 요약정보 자동 추가
- 자동 커밋 및 브랜치 생성 (`git commit -m`, `git checkout -b`)
- 커밋 전 사용자 확인 모달 구현 (데스크톱 앱 UI 연동)
- .gitignore 파일 존중 및 민감 정보 필터링

---

### 2.3 백엔드 서버 (Django + PostgreSQL)

**역할**: 사용자 데이터, 학습 콘텐츠, 퀴즈, 활동 로그 관리

**기술 스택**:
- Django 5+, Django REST Framework
- PostgreSQL 14+
- JWT 인증 (djangorestframework-simplejwt)
- Celery + Redis (비동기 분석 및 퀴즈 스케줄용)
- Docker (배포용)

**API 스펙**:

| 기능 | 메서드 | 엔드포인트 | 요청 | 응답 |
|------|--------|-----------|------|------|
| 회원가입 | POST | /api/users/register | `{email, password, username}` | `{user_id, token}` |
| 로그인 | POST | /api/users/login | `{email, password}` | `{access_token, refresh_token}` |
| 토큰 갱신 | POST | /api/users/refresh | `{refresh_token}` | `{access_token}` |
| 프로필 조회 | GET | /api/users/profile | `Authorization: Bearer {token}` | `{user_info, level, exp}` |
| 코드 분석 요청 | POST | /api/analyze | `{code, metadata, user_id}` | `{analysis_report, recommendations}` |
| 퀴즈 목록 | GET | /api/quizzes | `?tag=python&difficulty=hard` | `{quiz_list}` |
| 퀴즈 세션 시작 | POST | /api/quiz/sessions | `{pool_id, num_questions}` | `{session_id, questions}` |
| 답안 제출 | POST | /api/quiz/sessions/{id}/answers | `{question_id, answer}` | `{is_correct, explanation}` |
| 활동 로그 기록 | POST | /api/activity | `{event, context}` | `{status, exp_gained}` |
| 레벨 정보 | GET | /api/activity/level | `Authorization: Bearer {token}` | `{level, exp, next_level_exp}` |
| 배지 목록 | GET | /api/gami/badges | `?status=earned` | `{badges}` |
| 리더보드 | GET | /api/gami/leaderboard | `?period=weekly` | `{rankings}` |

**세부 태스크**:
- Django 프로젝트 세팅 및 DB 연동
- 사용자 모델 + 인증 API (JWT)
- 학습/퀴즈/활동 로그용 REST API
- Celery 기반 비동기 코드 분석 엔진 연결
- PostgreSQL 스키마 설계 (users, quizzes, activities, badges)
- API 문서화 (Swagger/OpenAPI)
- 단위 테스트 및 통합 테스트

---

### 2.4 데스크톱 앱 (Electron / Tauri + React)

**역할**: 사용자 인터페이스(UI), 백엔드 서버 및 코딩 에이전트와의 연결

**기술 스택**:
- Electron.js 또는 Tauri + React 18+
- TypeScript
- IPC(Inter-Process Communication) / Axios REST 호출
- Redux Toolkit 또는 Zustand 상태 관리
- Monaco Editor (Syntax highlighting)
- Tailwind CSS + shadcn/ui
- Framer Motion (애니메이션)

**입출력 포맷**:
- 입력: 자연어 명령, 코드 생성 요청, 로그인 정보
- 출력: 생성된 코드, 분석 리포트, 퀴즈 결과, 레벨 정보

**UI 구성요소**:
- 인트로 화면 (Mesh Gradient SVG)
- 명령 입력창 (자연어 프롬프트)
- 코드 결과창 (Monaco Editor - Syntax Highlighted)
- Diff 뷰어 (Monaco Diff Editor)
- 설정 메뉴 (API Key, Git 경로 등)
- 학습/퀴즈 탭
- 프로필/레벨 대시보드

**세부 태스크**:
- 기술 스택 선정 (Electron or Tauri)
- 앱 초기화 및 빌드 환경 설정
- IPC 통신 구조 설계 및 구현
- API 통신 모듈 (Axios + 인터셉터)
- UI 레이아웃 설계 (5개 주요 페이지)
- Monaco Editor 통합 (코드 표시, Diff 뷰)
- 상태 관리 구현 (Redux/Zustand)
- 로컬 스토리지 (토큰, 설정 저장)
- 자동 업데이트 기능
- 크로스 플랫폼 빌드 (Windows, macOS, Linux)

---

### 2.5 학습/퀴즈 엔진 모듈

**역할**: 사용자 코드 수준 분석 및 맞춤형 퀴즈 제공

**기술 스택**:
- Python (Django 서버)
- Django ORM + DRF
- 모델: Scikit-learn (복잡도 기반 분류)
- AST 파싱 (코드 복잡도 분석)
- DB: PostgreSQL (퀴즈/결과 저장)

**입출력 포맷**:
- 입력: 제출 코드, 유저 ID
  \`\`\`json
  {
    "user_id": 123,
    "code": "def login():\n    pass",
    "language": "python"
  }
  \`\`\`
- 출력: 분석 결과, 추천 학습 콘텐츠 목록
  \`\`\`json
  {
    "level": "중급",
    "complexity_score": 45,
    "recommendations": [
      {
        "topic": "Flask Blueprints",
        "reason": "코드 구조화 개선 필요"
      },
      {
        "topic": "Jinja2 Template Inheritance",
        "reason": "템플릿 재사용성 향상"
      }
    ],
    "suggested_quizzes": [5, 12, 18]
  }
  \`\`\`

**세부 태스크**:
- 코드 복잡도/패턴 분석 엔진 (AST 기반)
- 사용자 수준 분류 모델 (초급/중급/고급)
- 퀴즈 데이터 모델 및 API
- 퀴즈 UI (문제/정답/해설 보기)
- 적응형 학습 알고리즘 (사용자 약점 파악)
- 퀴즈 풀 관리 (카테고리, 난이도, 태그)
- 채점 로직 (객관식, 주관식, 코드 작성형)

---

### 2.6 게이미피케이션 & 사용자 활동 모듈

**역할**: 경험치/레벨 시스템, 활동 로그 기록, 배지 관리

**기술 스택**:
- Django (서버)
- PostgreSQL (activity_log, badges, user_progress 테이블)
- React / Tauri (UI 표시)
- Recharts (통계 시각화)

**입출력 포맷**:
- 입력: 사용자 이벤트
  \`\`\`json
  {
    "user_id": 123,
    "event": "quiz_solved",
    "context": {
      "quiz_id": 5,
      "score": 80,
      "time_spent": 120
    }
  }
  \`\`\`
- 출력: 누적 경험치 및 레벨 정보
  \`\`\`json
  {
    "level": 3,
    "exp": 1200,
    "next_level_exp": 1500,
    "exp_gained": 50,
    "badges_unlocked": ["quiz_master"],
    "streak_days": 7
  }
  \`\`\`

**경험치 정책**:
| 활동 | 경험치 |
|------|--------|
| 첫 커밋 | 100 XP |
| 퀴즈 완료 (정답) | 50 XP |
| 퀴즈 완료 (오답) | 10 XP |
| 코드 생성 | 30 XP |
| 연속 활동 (일일) | 20 XP |
| 배지 획득 | 200 XP |

**배지 시스템**:
| 배지 | 조건 | 희귀도 |
|------|------|--------|
| 첫 걸음 | 첫 로그인 | 일반 |
| 커밋 마스터 | 10개 커밋 | 일반 |
| 퀴즈 왕 | 50개 퀴즈 완료 | 레어 |
| 코드 장인 | 100개 코드 생성 | 레어 |
| 불굴의 의지 | 30일 연속 활동 | 에픽 |

**세부 태스크**:
- 활동별 경험치 정책 설계
- API: `/api/activity/log`, `/api/activity/level`
- 배지 시스템 구현 (조건 체크, 자동 부여)
- 프로필 UI: 레벨바/경험치 표시
- 리더보드 구현 (주간/월간/전체)
- 활동 피드 (타임라인)
- 리워드 교환 시스템

---

### 2.7 모바일 앱 (React Native / Flutter)

**역할**: 모바일 환경에서 학습/퀴즈/레벨 확인 기능 제공

**기술 스택**:
- React Native (권장) 또는 Flutter
- REST API 연동 (Axios / Dio)
- Secure Storage (토큰 보관)
- React Navigation / Flutter Navigator
- Redux / Provider (상태 관리)

**주요 기능**:
- 로그인/회원가입
- 퀴즈 풀기 (객관식, 주관식)
- 프로필 및 레벨 확인
- 배지 갤러리
- 리더보드
- 학습 진행 상황 동기화

**세부 태스크**:
- 프로젝트 초기 세팅 (React Native / Flutter)
- 로그인 / 학습 / 퀴즈 UI 구현
- 데스크톱 앱과 데이터 동기화 API 연동
- 푸시 알림 (학습 리마인더)
- 오프라인 모드 (로컬 캐싱)
- 앱 스토어 배포 (iOS, Android)

---

## 3. 모듈 간 데이터 흐름

### 3.1 코드 생성 플로우
\`\`\`
1. 사용자 (Desktop Frontend)
   ↓ 자연어 명령 입력
2. Desktop Backend (IPC)
   ↓ 프로젝트 컨텍스트 수집 (Git 분석)
3. Desktop Backend → Django Server
   ↓ POST /agent/jobs/request (작업 요청)
4. Django Server → FastAPI Server
   ↓ LLM 호출 (코드 생성)
5. FastAPI Server → Django Server
   ↓ 생성된 코드 반환
6. Django Server → Desktop Backend
   ↓ 작업 완료 알림
7. Desktop Backend → Desktop Frontend (IPC)
   ↓ 코드 표시 (Monaco Editor)
8. 사용자 확인 후 커밋 실행
   ↓ Desktop Backend (GitPython)
9. Desktop Backend → Django Server
   ↓ POST /git/{project_id}/commits (커밋 메타데이터)
10. Django Server → Gamification Module
    ↓ 경험치 부여 (POST /api/activity)
\`\`\`

### 3.2 퀴즈 플로우
\`\`\`
1. 사용자 (Desktop/Mobile Frontend)
   ↓ 퀴즈 풀 선택
2. Frontend → Django Server
   ↓ GET /api/quizzes?tag=python
3. Django Server (Quiz Engine)
   ↓ 퀴즈 목록 반환
4. 사용자 퀴즈 시작
   ↓ POST /api/quiz/sessions
5. Django Server
   ↓ 세션 생성 및 문제 반환
6. 사용자 답안 제출
   ↓ POST /api/quiz/sessions/{id}/answers
7. Django Server (Quiz Engine)
   ↓ 채점 및 피드백
8. Django Server → Gamification Module
   ↓ 경험치 부여 (POST /api/activity)
9. Frontend
   ↓ 결과 표시 (정답/오답, 해설, XP 획득)
\`\`\`

### 3.3 레벨업 플로우
\`\`\`
1. 사용자 활동 (커밋, 퀴즈 등)
   ↓ POST /api/activity
2. Django Server (Gamification Module)
   ↓ 경험치 계산 및 누적
3. 레벨업 조건 체크
   ↓ if exp >= next_level_exp
4. 레벨업 처리
   ↓ level += 1, 배지 체크
5. Frontend
   ↓ 레벨업 애니메이션 표시
6. 배지 획득 시
   ↓ 배지 알림 모달
\`\`\`

---

## 4. 기능 요구사항

### 4.1 인트로 화면 (Landing/Splash)
**목적**: 사용자의 첫 인상을 결정하고 제품의 혁신성을 전달

**UI 요소**:
- 현재 mesh gradient SVG 애니메이션을 배경으로 활용
- 중앙에 "Flash" 로고와 태그라인
- "시작하기" CTA 버튼
- 로그인/회원가입 링크

**기술 요구사항**:
- 3초 후 자동으로 메인 화면으로 전환 (옵션)
- 부드러운 페이드 인/아웃 트랜지션
- 반응형 디자인 (데스크톱 우선)

---

### 4.2 코딩 에이전트 페이지 (Agent Workspace)
**목적**: AI 에이전트와 상호작용하며 코딩 작업을 수행하는 메인 워크스페이스

#### 4.2.1 레이아웃 구조
\`\`\`
┌─────────────────────────────────────────────┐
│  Header (프로젝트 선택, 사용자 프로필)        │
├──────────┬──────────────────────────────────┤
│          │                                  │
│ Sidebar  │   Main Workspace                 │
│          │                                  │
│ - 프로젝트│   ┌──────────────────────────┐  │
│ - 히스토리│   │  Command Input           │  │
│ - 설정   │   │  (프롬프트 입력창)        │  │
│          │   └──────────────────────────┘  │
│          │                                  │
│          │   ┌──────────────────────────┐  │
│          │   │  Agent Response          │  │
│          │   │  (실시간 스트리밍 출력)   │  │
│          │   │  - Monaco Editor         │  │
│          │   │  - Syntax Highlighting   │  │
│          │   │  - 진행 상태 표시        │  │
│          │   └──────────────────────────┘  │
│          │                                  │
│          │   [작업 실행] [취소] [저장]     │
└──────────┴──────────────────────────────────┘
\`\`\`

#### 4.2.2 핵심 기능
1. **명령 입력 인터페이스**
   - 자연어 프롬프트 입력
   - 템플릿 제안 (예: "README 생성", "코드 리팩토링", "버그 수정")
   - 파일/폴더 드래그 앤 드롭 지원

2. **실시간 에이전트 응답**
   - 스트리밍 방식으로 응답 표시
   - Monaco Editor로 코드 표시 및 편집
   - Syntax highlighting (언어별 자동 감지)
   - 진행 단계 표시 (분석 중 → 코드 생성 중 → 완료)
   - 에이전트 사고 과정 표시 (옵션)

3. **프로젝트 관리**
   - Git 프로젝트 등록 (POST /git/projects/register)
   - 프로젝트 스캔 상태 표시
   - 최근 작업 히스토리

4. **설정 메뉴**
   - API Key 관리
   - Git 경로 설정
   - 에이전트 동작 커스터마이징

#### 4.2.3 IPC 통신 구조
**Frontend → Backend (IPC)**:
- `agent:request-job`: 작업 요청
- `agent:start-job`: 작업 시작
- `agent:cancel-job`: 작업 취소
- `git:register-project`: 프로젝트 등록
- `git:scan-project`: 프로젝트 스캔

**Backend → Frontend (IPC)**:
- `agent:progress`: 진행 상황 업데이트
- `agent:complete`: 작업 완료
- `agent:error`: 에러 발생
- `git:scan-complete`: 스캔 완료

---

### 4.3 Diff/Commit 결과 페이지
**목적**: 에이전트가 생성한 코드 변경사항을 검토하고 커밋 실행

#### 4.3.1 레이아웃 구조
\`\`\`
┌─────────────────────────────────────────────┐
│  Header (← 뒤로가기, 프로젝트명)             │
├─────────────────────────────────────────────┤
│  Commit Summary                             │
│  ┌───────────────────────────────────────┐  │
│  │ Feat: Add user authentication         │  │
│  │ 작성자: AI Agent | 시간: 2분 전       │  │
│  └───────────────────────────────────────┘  │
├─────────────────────────────────────────────┤
│  File Changes (3 files)                     │
│  ┌───────────────────────────────────────┐  │
│  │ ✓ src/auth.py          +45 -12       │  │
│  │ ✓ src/models.py        +23 -5        │  │
│  │ ✓ tests/test_auth.py   +67 -0        │  │
│  └───────────────────────────────────────┘  │
├─────────────────────────────────────────────┤
│  Diff Viewer (Monaco Editor - Split View)   │
│  ┌─────────────────┬─────────────────────┐  │
│  │ Before          │ After               │  │
│  │ 1  def login(): │ 1  def login():     │  │
│  │ 2    pass       │ 2    # New code     │  │
│  │                 │ 3    return True    │  │
│  └─────────────────┴─────────────────────┘  │
├─────────────────────────────────────────────┤
│  Actions                                    │
│  [커밋 실행] [수정] [거부] [다운로드 Patch] │
└─────────────────────────────────────────────┘
\`\`\`

#### 4.3.2 핵심 기능
1. **Diff 시각화 (Monaco Editor)**
   - Monaco Editor의 Diff Editor 사용
   - Side-by-side 또는 Inline diff 뷰
   - 라인별 변경사항 하이라이팅 (추가: 초록, 삭제: 빨강)
   - 파일 트리 네비게이션
   - 코드 접기/펼치기
   - 언어별 Syntax highlighting

2. **커밋 메타데이터**
   - 자동 생성된 커밋 메시지 (수정 가능)
   - 변경 파일 목록 및 통계
   - 영향받는 코드 라인 수

3. **인터랙션**
   - 개별 파일 선택/해제
   - 커밋 메시지 편집 (Monaco Editor)
   - Patch 파일 다운로드
   - 로컬 Git에 직접 커밋 실행 (IPC 통신)

---

### 4.4 코딩 퀴즈 페이지
**목적**: 게임화된 학습 경험을 통해 코딩 실력 향상

#### 4.4.1 레이아웃 구조
\`\`\`
┌─────────────────────────────────────────────┐
│  Header (퀴즈 카테고리, 진행률)              │
├─────────────────────────────────────────────┤
│  Quiz Pool Selection                        │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐       │
│  │ Python  │ │   Git   │ │  React  │       │
│  │ 기초    │ │ 브랜칭  │ │  Hooks  │       │
│  │ 10개    │ │ 15개    │ │ 8개     │       │
│  └─────────┘ └─────────┘ └─────────┘       │
├─────────────────────────────────────────────┤
│  Active Quiz Session                        │
│  ┌───────────────────────────────────────┐  │
│  │ Question 3/10          ⏱️ 02:45       │  │
│  │                                       │  │
│  │ 다음 중 Git rebase의 장점은?         │  │
│  │                                       │  │
│  │ ○ A) 커밋 히스토리를 선형으로 유지   │  │
│  │ ○ B) 충돌 해결이 더 쉬움             │  │
│  │ ○ C) 원격 저장소와 자동 동기화       │  │
│  │ ○ D) 브랜치 삭제가 자동화됨          │  │
│  │                                       │  │
│  │ [이전] [힌트 보기] [다음]            │  │
│  └───────────────────────────────────────┘  │
├─────────────────────────────────────────────┤
│  Progress & Stats                           │
│  정답률: 70% | 연속 정답: 3 | XP: +50      │
└─────────────────────────────────────────────┘
\`\`\`

#### 4.4.2 핵심 기능
1. **퀴즈 풀 선택**
   - 카테고리별 필터링 (Python, Git, React 등)
   - 난이도 표시 (초급, 중급, 고급)
   - 완료율 및 추천 퀴즈 표시

2. **퀴즈 세션**
   - 객관식/주관식/코드 작성 문제
   - 코드 작성 문제는 Monaco Editor 사용
   - 타이머 (선택적)
   - 힌트 시스템 (XP 차감)
   - 즉시 피드백 또는 세션 종료 후 채점

3. **결과 화면**
   - 정답/오답 상세 해설
   - 획득 XP 및 배지
   - 약점 분석 및 추천 학습 경로

4. **히스토리**
   - 과거 퀴즈 기록
   - 정오답 통계
   - 재도전 기능

---

### 4.5 Gamification 페이지
**목적**: 사용자의 성장을 시각화하고 동기 부여

#### 4.5.1 레이아웃 구조
\`\`\`
┌─────────────────────────────────────────────┐
│  Header (프로필, 알림)                       │
├─────────────────────────────────────────────┤
│  User Profile Card                          │
│  ┌───────────────────────────────────────┐  │
│  │ 오학동                                │  │
│  │ Level 12 | 2,450 XP / 3,000 XP       │  │
│  │ ████████░░ 82%                        │  │
│  │ 15 배지 | 7일 연속 활동               │  │
│  └───────────────────────────────────────┘  │
├─────────────────────────────────────────────┤
│  Badges & Achievements                      │
│  ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐          │
│  │ 첫커밋│ │퀴즈왕│ │코드장│ │잠김 │          │
│  └─────┘ └─────┘ └─────┘ └─────┘          │
├─────────────────────────────────────────────┤
│  Leaderboard                                │
│  ┌───────────────────────────────────────┐  │
│  │ 1. 김철수    3,890 XP                │  │
│  │ 2. 이영희    3,120 XP                │  │
│  │ 3. 박민수    2,850 XP                │  │
│  │ ...                                   │  │
│  │ 12. 오학동 (나) 2,450 XP             │  │
│  └───────────────────────────────────────┘  │
├─────────────────────────────────────────────┤
│  Recent Activities                          │
│  • 2시간 전: Python 퀴즈 완료 (+50 XP)     │
│  • 5시간 전: 첫 커밋 배지 획득            │
│  • 1일 전: Git 브랜칭 퀴즈 완료 (+30 XP)   │
└─────────────────────────────────────────────┘
\`\`\`

#### 4.5.2 핵심 기능
1. **프로필 대시보드**
   - 현재 레벨 및 XP 진행률
   - 연속 활동 일수 (Streak)
   - 총 배지 수 및 주요 성취

2. **배지 시스템**
   - 획득한 배지 갤러리
   - 잠금 해제 조건 표시
   - 희귀도별 분류 (일반, 레어, 에픽)

3. **리더보드**
   - 주간/월간/전체 랭킹
   - 친구/그룹 필터링
   - 내 순위 하이라이트

4. **활동 피드**
   - 최근 활동 타임라인
   - XP 획득 내역
   - 배지 획득 알림

5. **리워드 교환**
   - XP로 아이템 구매 (테마, 아바타 등)
   - 쿠폰/혜택 교환

---

## 5. 개발 환경 규약

### 5.1 Python 백엔드 규약
**Python 버전**: Python 3.11

**가상환경 생성**:
\`\`\`bash
# python 기본 기능으로 생성
python3.11 -m venv .venv

# uv venv 기능으로 생성 (권장)
uv venv --python 3.11 .venv
\`\`\`

**가상환경 활성화**:
\`\`\`bash
# Linux/Mac
source .venv/bin/activate

# Windows PowerShell
.venv\Scripts\Activate
\`\`\`

**의존성 설치**:
\`\`\`bash
# 공통 + 개발 도구
pip install -r requirements/common.txt -r requirements/dev.txt

# Desktop Backend 전용
pip install -r desktop_backend/requirements.txt
\`\`\`

### 5.2 프론트엔드 규약
**Node.js 버전**: Node.js 18+ (LTS)

**패키지 설치**:
\`\`\`bash
# npm 사용
npm install

# pnpm 사용 (권장)
pnpm install
\`\`\`

**개발 서버 실행**:
\`\`\`bash
# Electron
npm run dev

# Tauri
npm run tauri dev
\`\`\`

---

## 6. 우선순위 및 로드맵

### Phase 1 (MVP - 8주)
**Week 1-2: 기반 구축**
- Django 프로젝트 세팅 및 DB 스키마 설계
- 인증 API 구현 (회원가입, 로그인, JWT)
- Electron 앱 초기화 및 기본 UI 레이아웃
- 인트로 화면 구현

**Week 3-4: 코딩 에이전트 모듈**
- LangGraph 상태 그래프 설계
- Desktop Backend 구현 (Python)
- IPC 통신 구조 구현
- 코딩 에이전트 페이지 UI (Monaco Editor 통합)
- 프로젝트 등록 및 스캔 기능

**Week 5-6: Git 연동 및 Diff 뷰어**
- Git 분석 모듈 구현 (GitPython)
- Diff/Commit 결과 페이지 (Monaco Diff Editor)
- 로컬 Git 커밋 실행 기능
- 커밋 메타데이터 API 연동

**Week 7-8: 테스트 및 배포**
- 통합 테스트
- 버그 수정
- 크로스 플랫폼 빌드 (Windows, macOS)
- 베타 배포

### Phase 2 (학습 기능 - 6주)
**Week 9-10: 퀴즈 엔진**
- Quiz Engine 모듈 구현 (Django)
- 퀴즈 데이터 모델 및 API
- 퀴즈 페이지 UI (객관식, 주관식)
- 채점 로직 구현

**Week 11-12: Gamification**
- Gamification Engine 모듈 구현
- 경험치/레벨 시스템
- 배지 시스템
- Gamification 페이지 UI

**Week 13-14: 고급 기능**
- 코드 작성형 퀴즈 (Monaco Editor)
- 리더보드
- 활동 피드
- 추천 알고리즘

### Phase 3 (모바일 및 고급 기능 - 6주)
**Week 15-16: 모바일 앱**
- React Native 프로젝트 세팅
- 로그인/퀴즈 UI 구현
- API 연동
- 데이터 동기화

**Week 17-18: 고급 AI 기능**
- 코드 복잡도 분석 (AST)
- 적응형 학습 알고리즘
- 사용자 수준 분류 모델
- 맞춤형 추천

**Week 19-20: 최적화 및 배포**
- 성능 최적화
- 보안 강화
- 앱 스토어 배포 (iOS, Android)
- 정식 출시

---

## 7. 성공 지표 (KPI)

- **사용자 참여**: DAU/MAU 비율 > 30%
- **에이전트 사용**: 주당 평균 작업 요청 > 10회
- **학습 효과**: 퀴즈 정답률 향상 > 15% (4주 기준)
- **리텐션**: 7일 리텐션 > 40%, 30일 리텐션 > 20%
- **에이전트 성공률**: 작업 완료율 > 85%
- **코드 품질**: 생성된 코드의 사용자 수락률 > 70%
- **학습 진행**: 평균 레벨 > 5 (3개월 기준)

---

## 8. 비기능 요구사항

### 8.1 성능
- 앱 시작 시간: 3초 이내
- 페이지 전환: 1초 이내
- 에이전트 응답 스트리밍: 실시간 (지연 < 500ms)
- Monaco Editor 로딩: 2초 이내
- API 응답 시간: 95th percentile < 500ms

### 8.2 보안
- JWT 토큰 Secure Storage (Electron: electron-store, Tauri: Tauri Store)
- API Key 암호화 저장 (AES-256)
- IPC 통신 검증 (허용된 채널만 사용)
- XSS/CSRF 방어
- SQL Injection 방어 (ORM 사용)
- 민감 정보 필터링 (.env, API keys)

### 8.3 접근성
- WCAG 2.1 AA 준수
- 키보드 네비게이션 지원
- 스크린 리더 호환
- 고대비 모드 지원

### 8.4 크로스 플랫폼
- Windows 10/11 지원
- macOS 11+ 지원
- Linux (Ubuntu 20.04+) 지원
- iOS 14+ (모바일)
- Android 8+ (모바일)

---

## 9. 디자인 가이드라인

### 9.1 컬러 팔레트
- **Primary**: 에너지 넘치는 블루/시안 (#0EA5E9, #06B6D4) - 혁신, 기술
- **Secondary**: 따뜻한 오렌지/앰버 (#F59E0B, #FB923C) - 성취, 보상
- **Accent**: 생동감 있는 그린 (#10B981, #34D399) - 성장, 진행
- **Neutral**: 다크 그레이 + 화이트 (#1F2937, #F9FAFB) - 가독성
- **Error**: 레드 (#EF4444)
- **Warning**: 옐로우 (#FBBF24)

### 9.2 타이포그래피
- **Heading**: Inter 또는 Geist (Bold, 24-48px)
- **Body**: Inter 또는 Geist (Regular, 14-16px)
- **Code**: Fira Code 또는 JetBrains Mono (Monospace, 14px)
- **Line Height**: 1.5 (Body), 1.2 (Heading)

### 9.3 UI 원칙
- **명확성**: 복잡한 기능도 직관적으로
- **피드백**: 모든 액션에 즉각적인 반응
- **일관성**: 컴포넌트 재사용 극대화
- **즐거움**: 마이크로 인터랙션으로 재미 요소 추가
- **접근성**: 모든 사용자가 사용 가능하도록

---

## 10. 기술적 고려사항

### 10.1 Electron vs Tauri 선택 기준
**Electron 선택 시**:
- 풍부한 생태계와 커뮤니티
- Monaco Editor 통합 용이
- Node.js 기반 백엔드 통합 가능
- 빠른 개발 속도

**Tauri 선택 시**:
- 작은 번들 크기 (< 10MB)
- 낮은 메모리 사용량
- Rust 기반 보안 강화
- 네이티브 성능

**권장**: Electron (Monaco Editor 통합 및 개발 속도 우선)

### 10.2 상태 관리 선택 기준
**Redux Toolkit 선택 시**:
- 복잡한 전역 상태 (에이전트 작업 큐, 프로젝트 목록 등)
- 시간 여행 디버깅 필요
- 미들웨어 활용 (로깅, 에러 처리)

**Zustand 선택 시**:
- 간단한 전역 상태
- 작은 번들 크기
- 빠른 개발 속도

**권장**: Zustand (경량화 및 개발 속도 우선) + React Query (서버 상태)

### 10.3 IPC 통신 패턴
**요청-응답 패턴**:
\`\`\`typescript
// Frontend
const result = await ipcRenderer.invoke('git:get-commits', projectId);

// Backend
ipcMain.handle('git:get-commits', async (event, projectId) => {
  return await getCommits(projectId);
});
\`\`\`

**이벤트 스트리밍 패턴**:
\`\`\`typescript
// Frontend
ipcRenderer.on('agent:progress', (event, data) => {
  updateProgress(data);
});

// Backend
mainWindow.webContents.send('agent:progress', {
  percent: 50,
  message: 'Analyzing files...'
});
\`\`\`

---

이 PRD는 Flash AI Coding Agent의 완전한 제품 명세서로, 모듈 기반 백로그를 반영하여 7개의 주요 모듈과 상세한 개발 로드맵을 포함합니다. 데스크톱 앱(Electron/Tauri + React), 로컬 백엔드(Python 3.11), 서버(Django + FastAPI), 모바일 앱(React Native)을 아우르는 크로스 플랫폼 솔루션입니다.
