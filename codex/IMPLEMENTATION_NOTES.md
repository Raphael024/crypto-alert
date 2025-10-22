## Single-fire crossing
- Cache prev price per (symbol, alertId). Fire only on true cross (prev < level && now >= level) or (prev > level && now <= level).
- Persist last_fired_at; gate duplicates with minimal cool-off or repeat window.

## Repeat intervals
- Schema: alerts.repeat_interval_minutes int NULL, alerts.last_fired_at timestamptz NULL.
- Fire if no last_fired_at or now >= last_fired_at + repeat.

## Snooze persistence
- Skip evaluation if now < snooze_until.

## Why-moving
- Compute 15m % price and volume deltas; fetch CryptoPanic recent; correlate by timestamp ±10m.

## Mobile (Capacitor)
- One webDir: client/dist. Build client before cap sync.
- iOS: Push capability, Background Modes (Remote notifications), categories for actions.
- Android: FCM, notification channel "alerts", action intents.
- Client registers token → POST /api/devices → server sends pushes filtered by user.
