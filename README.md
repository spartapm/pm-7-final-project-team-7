# 이어(IEO)

대전에서 정형외과 MRI를 받을 수 있는 병원을 찾고, 전화·길찾기로 이어 주는 모바일 웹입니다.

## 실행

```bash
npm install
npm run snapshot   # 심평원 스냅샷 갱신 (HIRA_KEY_A / HIRA_KEY_B)
npm run dev
```

환경 변수는 `.env.example`을 참고합니다. 앱은 심평원 API를 실시간 호출하지 않고 `data/hospitals.json`만 읽습니다.

## 환경 변수

로컬은 `.env.local`, Vercel은 Project Settings → Environment Variables에 넣습니다.

| 변수 | 필수 | 용도 |
|---|---|---|
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | 배포 시 권장 | GA4 측정 ID (`G-...`). 없어도 앱은 동작 |
| `HIRA_KEY_A` | 스냅샷 갱신할 때만 | 병원정보·의료기관 상세 API 키 |
| `HIRA_KEY_B` | 스냅샷 갱신할 때만 | 비급여·코드조회 API 키 |

Vercel에 올려 쓰기만 하면 `HIRA_KEY_*`는 넣지 않아도 됩니다. 병원 목록을 다시 받을 때만:

```bash
HIRA_KEY_A='...' HIRA_KEY_B='...' npm run snapshot
```


## 화면

- S1 부위·지역 선택
- S2 병원 목록 (가까운 순 / 병원 종류 순)
- S3 병원 상세
- S4 전화 확인
- S5 결과 없음
- S6 병원 종류 안내
