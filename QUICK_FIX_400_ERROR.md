# 🚨 Google OAuth 400 에러 빠른 해결

## 문제 원인

Google OAuth 클라이언트 ID와 Secret이 설정되지 않았거나 잘못되었습니다.

## ✅ 빠른 해결 (5분)

### 1단계: Google Cloud Console 접속

1. 🌐 https://console.cloud.google.com/ 접속
2. 프로젝트 만들기 (또는 기존 프로젝트 선택)

### 2단계: OAuth 동의 화면 (1분)

1. 왼쪽 메뉴 → **"API 및 서비스"** → **"OAuth 동의 화면"**
2. **외부** 선택 → **만들기**
3. 앱 정보:
   - 앱 이름: `Flash Dev`
   - 사용자 지원 이메일: **본인 Gmail**
   - 개발자 연락처: **본인 Gmail**
4. **저장 후 계속** (3번 클릭)
5. **테스트 사용자 추가** → 본인 Gmail 추가

### 3단계: OAuth 클라이언트 ID 생성 (2분)

1. 왼쪽 메뉴 → **"사용자 인증 정보"**
2. 상단 **"+ 사용자 인증 정보 만들기"** → **"OAuth 클라이언트 ID"**
3. 애플리케이션 유형: **웹 애플리케이션**
4. 이름: `Flash Web`
5. **승인된 리디렉션 URI** 추가:
   ```
   http://localhost:3000/api/auth/callback/google
   ```
   ⚠️ **정확히 이대로 입력!** (끝에 슬래시 없음)
6. **만들기** 클릭

### 4단계: 환경 변수 설정 (1분)

팝업에서 **클라이언트 ID**와 **클라이언트 보안 비밀** 복사

`.env.local` 파일 열기:

```env
# 아래 두 줄을 복사한 값으로 교체
GOOGLE_CLIENT_ID=여기에-복사한-클라이언트-ID
GOOGLE_CLIENT_SECRET=여기에-복사한-시크릿
```

### 5단계: 서버 재시작 (10초)

터미널에서:
```bash
# Ctrl + C (서버 중지)
# 다시 실행
pnpm run dev
```

### 6단계: 테스트

1. http://localhost:3000/login
2. **"Continue with Google"** 클릭
3. 계정 선택
4. ✅ 성공!

---

## 🐛 여전히 400 에러가 나면

### 체크리스트:

- [ ] 리디렉션 URI가 **정확히** `http://localhost:3000/api/auth/callback/google` 인가?
- [ ] Google Cloud Console에서 **테스트 사용자**에 본인 Gmail 추가했나?
- [ ] `.env.local`에 Client ID와 Secret을 **따옴표 없이** 복사했나?
- [ ] 서버를 **재시작**했나?
- [ ] 브라우저 **시크릿 모드**로 테스트해봤나?

### 에러 메시지별 해결:

**"redirect_uri_mismatch"**
→ 리디렉션 URI 다시 확인 (대소문자, 슬래시 정확히)

**"invalid_client"**
→ Client ID/Secret 복사 오류 → 다시 복사

**"access_denied"**
→ 테스트 사용자에 본인 Gmail 추가

---

## 🎯 정확한 설정 값

```env
# .env.local 파일
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=flash-dev-secret-2024-please-change-in-production
GOOGLE_CLIENT_ID=123456789012-abcdefghijklmnopqrstuvwxyz123456.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-abcdefghijklmnopqrstuvwx
```

**Google Cloud Console 리디렉션 URI:**
```
http://localhost:3000/api/auth/callback/google
```

---

## ✨ 성공 화면

로그인 성공 시:
```
✅ "Signed in with Google!"
→ /agent 페이지로 자동 이동
```

---

**문제가 계속되면 스크린샷과 함께 문의해주세요!** 📸
