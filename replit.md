# Crypto Buzz - Real-Time Price Alerts PWA

A production-ready Progressive Web App for cryptocurrency price alerts with real-time streaming, trusted news, and iPhone-alarm-grade notifications.

## Overview

Crypto Buzz is a dark-mode-first, mobile-optimized PWA that provides:
- **Real-time price streaming** via WebSocket for BTC, ETH, SOL, and other top coins
- **Interactive price alerts** with drag-to-set target prices on charts
- **Trusted crypto news** from CryptoPanic with sentiment analysis (positive/negative/neutral)
- **Alert engine** that evaluates price conditions every 15 seconds
- **Browser notifications** for triggered alerts with snooze functionality
- **Beautiful mobile-first UI** with dark theme and crypto-specific design tokens

## Tech Stack

### Frontend
- **React 18** with TypeScript
- **Wouter** for client-side routing
- **TanStack Query v5** for data fetching and caching
- **Shadcn UI** components with Radix primitives
- **Tailwind CSS** with custom crypto design tokens
- **PWA manifest** for installable app experience

### Backend
- **Express.js** with TypeScript
- **PostgreSQL** database via Neon (serverless)
- **Drizzle ORM** for type-safe database queries
- **WebSocket server** for real-time price streaming
- **CoinMarketCap API** for live cryptocurrency prices
- **CryptoPanic API** for curated news with sentiment

### Services
- **Alert Engine**: Evaluates price conditions every 15s and triggers notifications
- **WebSocket Service**: Streams price updates every 10s to connected clients
- **News Ingestion**: Fetches and stores news every 2 minutes

## Project Structure

```
├── client/src/
│   ├── pages/
│   │   ├── Watchlist.tsx      # Homepage with price cards
│   │   ├── Coin.tsx            # Detail page with interactive chart
│   │   ├── Alerts.tsx          # Alert management
│   │   ├── News.tsx            # News feed with sentiment
│   │   └── Settings.tsx        # App preferences
│   ├── components/
│   │   ├── PriceCard.tsx       # Coin price display
│   │   ├── AlertCard.tsx       # Alert item
│   │   ├── NewsCard.tsx        # News article
│   │   ├── AlarmSheet.tsx      # Alert modal
│   │   └── BottomNav.tsx       # Mobile navigation
│   └── lib/
│       └── queryClient.ts      # React Query setup
├── server/
│   ├── routes.ts               # API endpoints
│   ├── storage.ts              # Database interface
│   ├── db.ts                   # Drizzle connection
│   └── services/
│       ├── coinmarketcap.ts    # Price data service
│       ├── cryptopanic.ts      # News service
│       ├── websocket.ts        # Real-time streaming
│       └── alert-engine.ts     # Alert evaluation
└── shared/
    └── schema.ts               # Shared types & DB schema
```

## Database Schema

### Users
- `id` (uuid): Primary key
- `email` (varchar): User email

### Watches
- `id` (uuid): Primary key
- `userId` (uuid): Foreign key to users
- `symbol` (varchar): Coin symbol (BTC, ETH, etc.)
- `cmcId` (varchar): CoinMarketCap ID
- `name` (varchar): Coin full name
- `createdAt` (timestamp): When added

### Alerts
- `id` (uuid): Primary key
- `userId` (uuid): Foreign key to users
- `symbol` (varchar): Coin symbol
- `type` (enum): 'price', 'pct_move', 'day_levels', 'vwap'
- `params` (jsonb): Alert parameters (level, direction, etc.)
- `active` (boolean): Whether alert is enabled
- `snoozeUntil` (timestamp): When snooze ends
- `createdAt` (timestamp): When created

### AlertFires
- `id` (uuid): Primary key
- `alertId` (uuid): Foreign key to alerts
- `symbol` (varchar): Coin symbol
- `price` (varchar): Price at trigger
- `firedAt` (timestamp): When triggered

### NewsItems
- `id` (varchar): External news ID
- `title` (text): Article title
- `url` (text): Article URL
- `source` (varchar): News source
- `sentiment` (enum): 'positive', 'negative', 'neutral'
- `currencies` (text[]): Related coins
- `publishedAt` (timestamp): Publication date
- `score` (varchar): Reliability score (0-100)
- `createdAt` (timestamp): When stored

## API Endpoints

### Watchlist
- `GET /api/watchlist` - Get user's watched coins
- `POST /api/watchlist` - Add coin to watchlist
- `DELETE /api/watchlist/:id` - Remove coin

### Alerts
- `GET /api/alerts` - Get user's alerts
- `POST /api/alerts` - Create new alert
- `PATCH /api/alerts/:id` - Update alert (toggle, snooze)
- `DELETE /api/alerts/:id` - Delete alert
- `GET /api/alerts/history` - Get triggered alerts

### Prices
- `GET /api/prices?symbols=BTC,ETH` - Get current prices
- `GET /api/coins/:symbol` - Get detailed coin data

### News
- `GET /api/news?currency=BTC` - Get news (optionally filtered)

### Utilities
- `POST /api/seed` - Seed demo data
- `GET /api/health` - Health check

## WebSocket Events

### Client → Server
```json
{
  "type": "subscribe",
  "symbols": ["BTC", "ETH", "SOL"]
}
```

### Server → Client
```json
{
  "type": "price_update",
  "data": [
    {
      "symbol": "BTC",
      "price": 106475.23,
      "timestamp": 1697565872000
    }
  ]
}
```

```json
{
  "type": "alert_triggered",
  "data": {
    "alertId": "abc-123",
    "symbol": "BTC",
    "price": 110000,
    "type": "price"
  }
}
```

## Environment Variables

### Required
- `DATABASE_URL`: PostgreSQL connection string (auto-provided by Replit)
- `COINMARKETCAP_API_KEY`: CoinMarketCap API key
- `CRYPTOPANIC_TOKEN`: CryptoPanic API token

### Optional
- `SESSION_SECRET`: Express session secret (auto-generated)

## Design System

### Colors
```css
/* Crypto-specific tokens */
--crypto-bullish: hsl(142 76% 36%);   /* Green for positive */
--crypto-bearish: hsl(0 84% 60%);      /* Red for negative */
--crypto-warning: hsl(38 92% 50%);     /* Amber for warnings */
--crypto-critical: hsl(0 100% 50%);    /* Red for alerts */
--crypto-neutral: hsl(220 13% 35%);    /* Gray for neutral */
```

### Typography
- **Mono fonts** for price displays (tabular numbers)
- **Sans-serif** for UI text
- **Dark mode first** with high contrast

### Components
- **PriceCard**: Sparkline charts, 24h change badges
- **AlertCard**: Border-left color indicates active status
- **NewsCard**: Sentiment badges with icons
- **AlarmSheet**: Full-screen modal with pulse animation

## Key Features

### Interactive Price Alerts
- Drag bell icon on chart to set target price
- Preset buttons: +1%, -5%, Day High, Day Low
- Alert types: Price level, % move, VWAP, daily levels

### Real-time Updates
- WebSocket streams prices every 10 seconds
- Alert engine checks conditions every 15 seconds
- React Query auto-refreshes on window focus

### News with Sentiment
- Curated from CryptoPanic
- Sentiment analysis (positive/negative/neutral)
- Reliability scores (0-100)
- Filtered by cryptocurrency

### Progressive Web App
- Installable on mobile devices
- Offline-capable (service worker ready)
- App manifest with icons
- Mobile-first responsive design

## Development

### Setup
1. Install dependencies: `npm install`
2. Push DB schema: `npm run db:push`
3. Start dev server: `npm run dev`
4. Seed demo data: `curl -X POST http://localhost:5000/api/seed`

### Testing
- E2E tests verify all pages and navigation
- Price card interactions tested
- Alert creation flow tested
- News feed and settings verified

## Production Deployment

The app is designed for Replit's deployment system:
1. Database migrations handled by Drizzle
2. WebSocket server runs on same port as HTTP
3. Environment secrets managed securely
4. Health check endpoint at `/api/health`

## Recent Changes

### Oct 20, 2025 - Cryptocurrency Logos & Enhanced Alert Modal
- ✅ **Cryptocurrency Logos** - All 200 coins now display circular logos from CoinMarketCap CDN
  - Added `logoUrl` field to CoinPrice schema
  - Updated CoinMarketCap service to fetch logo URLs from API
  - Logos display as 32-40px circular images with rounded-full styling
  - Integrated on All Cryptos page with coin name and symbol
- ✅ **Custom Alert Modal** - Industry-standard alert creation UI following fintech best practices
  - Full-screen Sheet modal with comprehensive options
  - Coin selector with real-time search (filters through 200+ coins)
  - Dual alert modes: Target Price or Percentage Change
  - Direction toggles: Above (green) or Below (red) with visual feedback
  - Alert sound selector with 5 preset options (Chime, Bell, Ding, Alert, Whistle)
  - One-time alert toggle (auto-disable after first trigger)
  - Multi-channel notifications: Push (enabled), Email (coming soon)
  - Visual percentage change calculator from current price
  - Success/error toast notifications
- ✅ **Bug Fixes**
  - Fixed apiRequest parameter order (method, url, data)
  - Added comprehensive error handling and logging
  - Improved mutation success callbacks with cache invalidation

### Oct 19, 2025 - Complete UI Rebuild
- ✅ **All Cryptos page** - Displays top 200 cryptocurrencies with inline sparklines, market stats header, numbered ranking, and red/green percentage badges
- ✅ **Alerts page** - Recommended alert toggles (Trending News, Breaking News, Important Updates, Price Spikes, Volume Spikes, Trading Spikes) with descriptions and icons
- ✅ **Settings page** - Grouped sections (Premium: Premium Features, Referral Program, Manage Subscription, Customer Support; General: Interface, Apple Watch, Sync/Backup, App Theme, Siri Shortcuts, Security, Exchange Import, Address Import)
- ✅ **News page** - Cleaner layout with prominent source names, timestamps, sentiment badges, and filter buttons (All, Portfolio, Crypto, Fiat)
- ✅ **Portfolios page** - Basic structure with empty state for future portfolio tracking
- ✅ **Navigation** - Updated to 5-tab structure: Portfolios, Cryptos, News, Alerts, Settings
- ✅ **Design system** - Ultra-dark theme (hsl(0 0% 4%)) with premium gold accents (hsl(38 92% 50%))

### Backend Updates
- ✅ CoinMarketCap service enhanced to fetch top 200 coins with market stats, sparklines, and logo URLs
- ✅ Database schema expanded with portfolios, user settings, and new alert types
- ✅ API endpoint added for top coins (/api/top-coins)
- ✅ Alert types support: price, pct_move, trending_news, breaking_news, price_spike, volume_spike, trading_spike

### Testing
- ✅ E2E testing completed successfully on mobile viewport
- ✅ All pages verified: navigation, layout, data display, interactions
- ✅ Recommended alert toggles functional
- ✅ Custom alert creation flow tested (price and percentage modes)
- ✅ Cryptocurrency logos verified across all 200 coins

## Known Issues

- WebSocket handshake occasionally shows 400 errors (does not affect functionality)
- News ingestion runs every 2 minutes (first fetch may be empty)
- Demo user authentication (production should use real auth)

## Future Enhancements

- [ ] User authentication with Replit Auth
- [ ] Advanced alert types (VWAP crossing, RSI levels)
- [ ] Portfolio tracking with P&L
- [ ] Price alert sound customization
- [ ] Push notification service worker
- [ ] Historical price charts with TradingView
- [ ] Multi-currency support (EUR, GBP)
- [ ] Export alert history to CSV
