## Phase 1 — Alert Reliability
1) Single-fire on price cross
2) Repeat every N minutes
3) Snooze persistence
4) Service worker notification actions (web)
5) Alert history UI

## Phase 2 — Advanced Alerts
6) Percentage move alerts (1/5/15% over 1m/5m/15m)
7) Day high/low
8) VWAP crossing
9) RSI(14) overbought/oversold
10) Volume spike (Z-score baseline)

## Phase 3 — "Why Is It Moving?"
11) /api/why-moving?symbol=BTC – combine 15m % price + volume delta + 3 headlines (sentiment + time alignment)

## Phase 6 — Mobile-Native (Capacitor)
12) Capacitor bootstrap (ios/android projects, bundle IDs)
13) Push notifications (APNs/FCM) + device token registration endpoint
14) Mobile notification actions: Snooze 15m / Stop
15) Local notifications fallback
16) Deep links (cryptoalert://coin/BTC)
17) Brand assets (icons/splash), status bar styling
18) Store readiness docs (signing, release checklist)
