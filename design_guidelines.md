# Crypto Buzz - Design Guidelines

## Design Principles
**Core Focus:** Alert-first financial interface optimized for split-second decision making with iPhone-alarm-grade visual priority for critical notifications.

**Inspiration:** Coinbase clarity + Robinhood data visualization + Binance information density

---

## Color System

### Dark Mode (Primary)
```
Background: 10 8% 8% (primary) | 10 6% 12% (secondary) | 10 5% 16% (tertiary)
Text: 0 0% 98% (primary) | 0 0% 65% (secondary) | 0 0% 45% (tertiary)
```

### Alert & Price Movement
```
Bullish Green: 142 76% 36% | Bearish Red: 0 84% 60%
Warning Amber: 38 92% 50% | Critical Alert: 0 100% 50%
Neutral: 220 13% 35%
```

### Accent & Interactive
```
Primary Blue: 217 91% 60% (hover: 50%)
Secondary Purple: 262 83% 58%
Success: 142 71% 45%
```

### Light Mode
```
Background: 0 0% 100% (primary) | 220 14% 96% (secondary)
Text: 222 47% 11% | Borders: 220 13% 91%
```

---

## Typography

**Fonts:**
- Primary: 'Inter', system-ui, sans-serif
- Monospace (prices): 'JetBrains Mono', 'SF Mono', Consolas

**Scale:**
```
Hero Price: 48px font-bold tracking-tight (coin detail)
Large Alert: 36px font-bold (alarm sheet)
Section Title: 24px font-semibold (headers)
Card Title: 18px font-semibold (coin names)
Body: 16px font-normal (news)
Price Data: 16px font-mono font-medium (all numbers)
Small: 14px font-normal (metadata)
Caption: 12px font-medium uppercase tracking-wide (labels)
```

---

## Layout & Spacing

**Spacing Units:** 2, 3, 4, 6, 8, 12, 16
- Component padding: p-4 (cards) | p-6 (sections) | p-8 (pages)
- Vertical: space-y-4 (cards) | space-y-6 (sections) | space-y-8 (pages)
- Horizontal: gap-3 (icon+text) | gap-4 (buttons) | gap-6 (grid)

**Responsive Grid:**
```
Mobile: Single column, px-4 padding
Tablet (md:): grid-cols-2, max-w-4xl
Desktop (lg:): grid-cols-3, max-w-7xl
```

**Navigation:**
- Mobile: Fixed bottom tab bar (h-16, blur backdrop)
- Desktop: Left sidebar (w-64, border-r, collapsible)
- Active state: primary blue underline + icon color

---

## Components

### Cards

**Watchlist Card:**
```
bg-secondary rounded-xl p-4
Hover: border border-primary/20, scale(1.02)
Layout: Icon (h-10 w-10) | Symbol+Name | Price (font-mono text-2xl) | Change Badge
```

**News Card:**
```
bg-secondary rounded-lg p-4 border-l-4 (sentiment color)
Source: bg-tertiary rounded-full px-3 py-1 text-xs
Headline: font-semibold text-lg line-clamp-2
```

**Alert Rule Card:**
```
bg-secondary rounded-lg p-4
Left border: 4px alert color
Toggle: right side
```

### Interactive Elements

**Price Bell (Drag Target):**
```
Handle: w-12 h-12 circular with bell icon
Line: dashed border-2 (green above/red below)
Snap: scale animation on lock
Chart overlay: dotted line connection
```

**Preset Alerts:**
```
bg-tertiary hover:bg-primary/10 rounded-full px-4 py-2
Horizontal scroll (mobile) | Grid (desktop)
Labels: "+1%", "-5%", "Day High", "24h VWAP"
```

**Alarm Sheet (Triggered):**
```
Mobile: Full-screen overlay, blur backdrop
Header: Critical red bg, pulse animation, large price
Actions: "Stop" (bg-red-600) + "Snooze" (outline)
Mini chart: sparkline to trigger point
Top 3 headlines with sentiment
```

### Charts

**Price Chart:**
```
bg-tertiary rounded-lg
Line: stroke-width-2, gradient fill (opacity 20%)
Grid: subtle horizontal lines
Tooltip: bg-black/90 backdrop-blur rounded-md px-3 py-2
```

**Sparklines:**
```
h-8 w-20, single color (trend-based)
No axes, minimal weight
```

### Forms & Inputs

**Text Input:**
```
bg-tertiary border border-muted focus:border-primary rounded-lg px-4 py-3
Label: text-sm font-medium mb-2
Error: border-red-500, red helper text
```

**Toggle:**
```
w-11 h-6, bg-muted (off) / bg-primary (on)
Thumb: w-5 h-5, 200ms translate
```

### Buttons

```
Primary: bg-primary hover:bg-primary-hover text-white rounded-lg px-6 py-3 font-semibold
Destructive: bg-red-600 hover:bg-red-700 text-white
Secondary: outline border-2 border-muted hover:border-primary text-primary
Icon: hover:bg-tertiary p-2 rounded-md
```

### Badges

**Price Change:**
```
rounded-full px-2 py-1
Up: bg-green-500/10 text-green-500
Down: bg-red-500/10 text-red-500
Triangle icon + percentage
```

**Sentiment (News):**
```
text-xs px-2 py-1 rounded
Positive: bg-green-500/20
Negative: bg-red-500/20
Neutral: bg-neutral
```

---

## Animations

**Price Updates:**
- Flash bg-green-500/20 or bg-red-500/20 for 300ms on change
- Smooth number count with transform (no layout shift)

**Alert States:**
- Approaching: pulse scale(1.0→1.02) on border
- Fired: slide up 400ms ease-out, red pulse on header
- Dismiss: slide down + fade 300ms

**Interactive:**
- Card hover: scale(1.02) 200ms
- Button press: scale(0.98) 100ms
- Toggle: 200ms ease
- Chart tooltip: fade 150ms

**Forbidden:** Auto-carousels, parallax, decorative animations

---

## Page Layouts

### Watchlist (Home)
```
Header: Logo | Portfolio value | Bell+Settings
Search: Sticky, "Add Coin" action
Grid: Responsive cards (symbol, price, 24h%, sparkline)
Empty: Icon, message, "Add Coin" CTA
```

### Coin Detail
```
Hero chart: h-72 md:h-96 with drag bell overlay
Current price: Large monospace, real-time WebSocket
Stats: 3-col grid (High/Low, Volume, Market Cap)
Preset alerts: Horizontal scroll buttons
News: Per-coin feed, infinite scroll
```

### Alerts Management
```
Active: Card list (type, condition, price, toggle, edit/delete)
History: Collapsed accordion (timestamp, price, action)
Create: Fixed FAB (bottom-right desktop, center mobile)
```

### News Feed
```
Filter tabs: All | Bitcoin | Ethereum | Trending (sticky)
Cards: Source badge, headline, snippet, timestamp, sentiment
Infinite scroll with spinner
```

### Alarm Sheet
```
Backdrop: bg-black/60 backdrop-blur-sm
Header: Red alert bar, "BTC Price Alert Triggered!"
Price: Giant monospace + arrow
Mini chart: 15m sparkline to trigger
Why Moving: Top 3 headlines + 15m % change
Actions: Stop | Snooze (5/10/30m) | Set Follow-up
```

---

## Images

**Coin Icons:** CoinGecko API
- List: 32x32 rounded-full
- Detail: 64x64

**Empty States:** Illustrative icons (bell for alerts, chart for no data)

**News Thumbnails:** 16:9 aspect, rounded-lg, max-h-32 (if API provides)

**Hero (Landing only):** Abstract crypto visualization, h-screen, dark overlay bg-black/60

---

## Accessibility

- **Default:** Dark mode (crypto trader preference)
- **Contrast:** WCAG AA 4.5:1 minimum
- **Focus:** ring-2 ring-primary ring-offset-2 ring-offset-background
- **Screen Reader:** ARIA labels on icons, live regions for prices
- **Reduced Motion:** Disable non-critical animations, respect prefers-reduced-motion
- **Toggle:** Settings, localStorage persistence

---

## Tech Stack

```
Framework: Vite + React + TypeScript
Styling: Tailwind CSS 3.x (custom theme)
Icons: Heroicons (outline UI, solid alerts)
Charts: Recharts/Victory (interactive), custom SVG (sparklines)
State: React Query (server), Zustand (UI)
Real-time: Socket.IO WebSocket
PWA: Service Worker, Web Push API, manifest.webmanifest
```