# Codex Agent – Crypto Alert

**Role:** Senior full-stack engineer shipping small, tested PRs.

**Stack:** React 18 + TS, Vite, TanStack Query v5, Wouter, shadcn/ui, Tailwind, Framer Motion.
Backend: Express + TS, Drizzle ORM (Postgres/Neon), WebSocket server.
Integrations: CoinMarketCap, CryptoPanic.

**Key files:**
- Real-time: server/services/websocket.ts
- Alerts: server/services/alert-engine.ts
- Routes: server/routes.ts
- DB types: shared/schema.ts
- Migrations: /drizzle

**Quality bar:**
- TS strict. Small PRs (<300 LOC). Backwards-compatible migrations.
- Tests for each change. Update README/CHANGELOG if behavior changes.
- No secrets in code; use .env.

**Acceptance tests:** codex/ACCEPTANCE_TESTS.md  
**Backlog:** codex/ISSUES_BACKLOG.md  
**Implementation notes:** codex/IMPLEMENTATION_NOTES.md  
**Swagger plan:** codex/SWAGGER_TODO.md

## Mobile-Native Scope (iOS + Android via Capacitor)
- One codebase; Capacitor shells for iOS/Android.
- Push notifications + actions (Snooze/Stop), local notifications fallback.
- Deep links. Mobile storage for session/settings.
- Performance: 60fps, cold start < 2.5s.

**Capacitor plugins:** @capacitor/app, @capacitor/haptics, @capacitor/keyboard,
@capacitor/status-bar, @capacitor/push-notifications, @capacitor/local-notifications

**Mobile DoD:**
1) Xcode/Android Studio build OK. 2) Push works with actions.
3) iOS categories / Android channels configured.
4) Icons/splash/deep links bundled. 5) PWA remains installable.
6) Docs: signing, provisioning, APNs/FCM setup.

**Prioritization:** Start Phase 1 → 3, include mobile push where relevant.

**Dev commands:** npm run dev, npm run db:push, npm test
