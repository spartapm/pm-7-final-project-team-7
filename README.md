# 이어(IEO)

대전에서 정형외과 MRI를 받을 수 있는 병원을 찾고, 전화·길찾기로 이어 주는 모바일 웹입니다.

## 실행

```bash
npm install
npm run db:setup   # 최초 1회: 테이블 생성 + 병원 스냅샷 시드
npm run dev
```

앱은 심평원 API를 실시간 호출하지 않습니다. 병원 목록은 Supabase `hospitals` 테이블을 읽고, 로컬 `data/hospitals.json`은 시드·백업용입니다.

## 환경 변수

로컬은 `.env.local`, Vercel은 Project Settings → Environment Variables에 넣습니다.

| 변수 | 필수 | 용도 |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | 앱 실행 | Supabase Project URL |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | 앱 실행 | Publishable key |
| `DATABASE_URL` | 스키마 적용 때만 | `postgresql://postgres:[DB-PASSWORD]@db.xxxx.supabase.co:5432/postgres` |
| `HIRA_KEY_A` | 스냅샷 갱신할 때만 | 병원정보·의료기관 상세 API 키 |
| `HIRA_KEY_B` | 스냅샷 갱신할 때만 | 비급여·코드조회 API 키 |

`NEXT_PUBLIC_` 값은 브라우저에 노출됩니다. Database password는 앱에 넣지 마세요.

테이블이 없으면:

```bash
npm run db:setup
```

또는 [SQL Editor](https://supabase.com/dashboard/project/oyvdztqdvwipkcytwfef/sql/new)에 `supabase/schema.sql`을 붙여넣고 Run 한 뒤 `npm run db:seed`.

병원 목록을 심평원에서 다시 받으려면:

```bash
HIRA_KEY_A='...' HIRA_KEY_B='...' npm run snapshot
```

스냅샷은 JSON을 갱신한 뒤 Supabase에도 upsert합니다.

직접 확인(🟢)은 `hospitals.confirmed_at` + `reservation_status=available` 이고 30일 이내일 때 표시됩니다.

## 화면

- S1 부위·지역 선택
- S2 병원 목록 (가까운 순 / 병원 종류 순)
- S3 병원 상세
- S4 전화 확인
- S5 결과 없음
- S6 병원 종류 안내
