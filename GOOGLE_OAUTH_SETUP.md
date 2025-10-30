# Google OAuth 설정 가이드

Flash AI Coding Agent에서 Google 로그인을 사용하려면 Google Cloud Console에서 OAuth 2.0 클라이언트 ID를 생성해야 합니다.

## 🔧 설정 단계

### 1. Google Cloud Console 접속

1. [Google Cloud Console](https://console.cloud.google.com/)에 접속
2. 프로젝트가 없다면 새 프로젝트 생성
3. 기존 프로젝트 선택 또는 새로 생성한 프로젝트 선택

### 2. OAuth 동의 화면 설정

1. 왼쪽 메뉴에서 **"API 및 서비스"** → **"OAuth 동의 화면"** 선택
2. 사용자 유형 선택:
   - **외부**: 모든 Google 계정으로 로그인 가능 (권장)
   - **내부**: 조직 내부 사용자만 가능
3. **만들기** 클릭
4. **앱 정보 입력**:
   - 앱 이름: `Flash AI Coding Agent`
   - 사용자 지원 이메일: 본인 이메일
   - 앱 로고: (선택사항)
   - 승인된 도메인: `localhost` (개발용)
5. **범위 추가 또는 삭제**:
   - `email`
   - `profile`
   - `openid`
6. **저장 후 계속**

### 3. 사용자 인증 정보 생성

1. 왼쪽 메뉴에서 **"사용자 인증 정보"** 선택
2. 상단의 **"+ 사용자 인증 정보 만들기"** 클릭
3. **"OAuth 클라이언트 ID"** 선택
4. 애플리케이션 유형: **"웹 애플리케이션"** 선택
5. 이름 입력: `Flash Web Client`
6. **승인된 자바스크립트 원본** 추가:
   ```
   http://localhost:3000
   ```
7. **승인된 리디렉션 URI** 추가:
   ```
   http://localhost:3000/api/auth/callback/google
   ```
8. **만들기** 클릭

### 4. 클라이언트 ID와 Secret 복사

생성 완료 후 팝업에서:
- **클라이언트 ID** 복사
- **클라이언트 보안 비밀** 복사

## 📝 환경 변수 설정

프로젝트 루트의 `.env.local` 파일을 열고 아래 값을 업데이트:

```env
# Google OAuth
GOOGLE_CLIENT_ID=your-actual-client-id-here
GOOGLE_CLIENT_SECRET=your-actual-client-secret-here
```

**예시**:
```env
GOOGLE_CLIENT_ID=123456789-abcdefghijklmnop.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-abc123def456ghi789
```

## 🔐 NextAuth Secret 생성

더 안전한 NextAuth secret을 생성하려면:

```bash
openssl rand -base64 32
```

또는 Node.js로:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

생성된 값을 `.env.local`에 추가:

```env
NEXTAUTH_SECRET=your-generated-secret-here
```

## 🚀 서버 재시작

환경 변수를 업데이트한 후 개발 서버를 재시작:

```bash
# 서버 중지 (Ctrl + C)
# 서버 재시작
pnpm run dev
```

## ✅ 테스트

1. 브라우저에서 http://localhost:3000/login 접속
2. **"Continue with Google"** 버튼 클릭
3. Google 계정 선택
4. 권한 승인
5. `/agent` 페이지로 리디렉션 확인

## 🌐 프로덕션 배포

프로덕션 환경에서는:

1. Google Cloud Console에서 **승인된 자바스크립트 원본**에 프로덕션 도메인 추가:
   ```
   https://yourdomain.com
   ```

2. **승인된 리디렉션 URI**에 프로덕션 콜백 URL 추가:
   ```
   https://yourdomain.com/api/auth/callback/google
   ```

3. `.env.production` 또는 호스팅 플랫폼 환경 변수에 설정:
   ```env
   NEXTAUTH_URL=https://yourdomain.com
   NEXTAUTH_SECRET=production-secret-min-32-characters
   GOOGLE_CLIENT_ID=your-production-client-id
   GOOGLE_CLIENT_SECRET=your-production-client-secret
   ```

## 🐛 문제 해결

### "Error: invalid_client"
- 클라이언트 ID와 Secret이 정확한지 확인
- `.env.local` 파일이 프로젝트 루트에 있는지 확인
- 서버를 재시작했는지 확인

### "Error: redirect_uri_mismatch"
- Google Cloud Console의 리디렉션 URI가 정확한지 확인
- `http://localhost:3000/api/auth/callback/google` 형식 확인
- 프로토콜(http/https), 포트 번호 확인

### 로그인 후 페이지가 로드되지 않음
- `NEXTAUTH_URL`이 현재 도메인과 일치하는지 확인
- 브라우저 콘솔에서 에러 메시지 확인
- 네트워크 탭에서 API 응답 확인

## 📚 참고 문서

- [NextAuth.js Documentation](https://next-auth.js.org/)
- [Google OAuth Documentation](https://developers.google.com/identity/protocols/oauth2)
- [NextAuth Google Provider](https://next-auth.js.org/providers/google)

---

**구현 완료!** 🎉

이제 Flash AI Coding Agent에서 Google 계정으로 간편하게 로그인할 수 있습니다.
