# Cloudflare 배포 (호스팅케이알 도메인 + Cloudflare Workers, 전부 무료 플랜)

카페24 대신 Cloudflare 에 올립니다. PHP 는 쓰지 않고 `worker.js` 가 같은 주소(`admin/api.php?action=…`)로 관리자 API 를 제공하므로
`admin.html`, `js/admin.js`, 고객 화면은 그대로입니다.

| 역할 | Cloudflare 서비스 | 무료 한도 |
|---|---|---|
| 정적 페이지 | Workers Static Assets | 무제한 요청 |
| 관리자 API·문의 접수 | Workers | 하루 10만 요청 |
| 콘텐츠·문의·통계 저장 | D1 (`baewoong-db`) | 5GB, 읽기 500만/일 |
| 사진 저장 | R2 (`baewoong-uploads`) | 10GB, 전송량 무료 |
| 문의 알림 메일(선택) | Resend | 월 3,000통 |

## 1. 계정
- Cloudflare 계정은 **고객(배웅) 이메일로 가입**하고 홍스랩 계정을 멤버(관리자)로 초대하는 것을 권장합니다. 인계 시 그대로 넘기면 됩니다.
  계정 홈 → Manage Account → Members → Invite.
- 도메인은 호스팅케이알에서 고객 명의로 구매합니다.

## 2. 처음 한 번 (프로젝트 폴더에서)
```powershell
npx wrangler login                         # 브라우저로 Cloudflare 로그인 (고객 계정에 초대받은 뒤 그 계정 선택)
npx wrangler d1 create baewoong-db         # 출력된 database_id 를 wrangler.jsonc 의 REPLACE_WITH_D1_ID 자리에 붙여넣기
npx wrangler r2 bucket create baewoong-uploads
npx wrangler d1 migrations apply baewoong-db --remote
```

## 3. 시크릿 (반드시 **별도 PowerShell 창**에서. Claude Code 안에서 실행하면 빈 값이 들어갑니다)
```powershell
npx wrangler secret put SESSION_SECRET     # 아무 긴 무작위 문자열 (관리자 로그인 쿠키 서명에 섞임)
npx wrangler secret put RESEND_API_KEY     # 문의 알림 메일을 쓸 때만. Resend 가입 → 도메인 인증 → API Key
```
메일을 쓰면 `wrangler.jsonc` 의 `MAIL_FROM` 에 보내는 주소(예: `no-reply@도메인`)를 적고 다시 배포합니다.

## 4. 배포
```powershell
npx wrangler deploy
```
끝나면 `https://baewoong.<계정>.workers.dev` 주소가 나옵니다. 여기서 `/admin.html` 을 열어 관리자 비밀번호를 처음 설정합니다.

## 5. 도메인 연결 (호스팅케이알 → Cloudflare)
1. Cloudflare 대시보드 → Add a domain → 구매한 도메인 입력 → Free 플랜 → 안내되는 네임서버 2개 확인.
2. 호스팅케이알 → 도메인 관리 → 네임서버 변경 → Cloudflare 네임서버 2개 입력 (반영 수 분~수 시간).
3. Cloudflare → Workers & Pages → `baewoong` → Settings → Domains & Routes → Add → Custom domain → `도메인`, `www.도메인` 추가.
   SSL 인증서는 자동 발급됩니다.
4. `index.html` 등의 `og:url`, `sitemap`, `robots.txt` 의 주소를 새 도메인으로 바꿔 다시 배포합니다.

## 6. 운영 메모
- 콘텐츠는 D1 `settings.content` 에 저장되고 `/data/content.js` 가 그 값으로 만들어집니다. 저장소의 `data/content.js` 는 저장 전 기본값입니다.
- 사진은 R2 에 `uploads/연월/파일` 로 들어가고 같은 경로로 서빙됩니다.
- 비밀번호를 잊으면: `npx wrangler d1 execute baewoong-db --remote --command "DELETE FROM settings WHERE key='auth'"` 후 관리자 페이지에서 다시 설정.
- 문의 백업: `npx wrangler d1 execute baewoong-db --remote --command "SELECT data FROM inquiries" --json > inquiries.json`
- 로그 보기: `npx wrangler tail`
