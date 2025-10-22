### A1. Single-fire crossing
- For "BTC above 70000": ticks 69990 → 69999 → 70001 triggers once, no duplicates on 70003 or 69995 oscillations.

### A2. Repeat N minutes
- With repeat=15m, triggers at t0 and t0+15m if condition still true; suppress if condition false.

### A3. Snooze persistence
- Snoozed until ISO timestamp; no triggers before that time.

### A4. Why-moving endpoint
- Returns 15m % change + volume delta + 2–3 aligned headlines (±10m).

### M1. Push permission + registration (mobile)
- On first launch, app requests permission; if granted, token POSTed to /api/devices (200 OK).

### M2. Mobile notification actions
- Received push includes actions: Snooze 15m → sets snooze_until; Stop → active=false.

### M3. Local notification fallback
- If push denied, local notifications show repeats (when condition holds).

### M4. Deep link
- cryptoalert://coin/ETH opens ETH detail page.
