# 같이사 (Gateiseo)

> 공동구매 & 자동 정산 앱

친구들과 함께 장볼 품목을 실시간으로 공유하고, 구매 후 자동으로 n빵 정산해주는 서비스입니다.

## 기술 스택

| 구분 | 기술 |
|------|------|
| Frontend | Next.js 14, TypeScript, Tailwind CSS |
| Backend | Spring Boot 3, Java 17, JPA/Hibernate |
| Database | PostgreSQL |
| 인증 | Kakao OAuth 2.0 + JWT |
| 실시간 | WebSocket (STOMP) |
| 배포 | Vercel (FE) + Railway (BE) |

## 프로젝트 구조

```
gateiseo/
├── frontend/         # Next.js 앱
├── backend/          # Spring Boot 앱
└── docker-compose.yml
```

## 로컬 실행

```bash
# DB 실행
docker-compose up -d

# 백엔드
cd backend && ./gradlew bootRun

# 프론트엔드
cd frontend && npm install && npm run dev
```
