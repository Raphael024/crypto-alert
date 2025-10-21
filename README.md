# Crypto Buzz - Premium Cryptocurrency Tracking PWA

A production-ready Progressive Web App for cryptocurrency tracking with real-time price streaming, custom alerts, trusted news, and professional fintech UI inspired by industry-leading crypto applications.

![Crypto Buzz](https://img.shields.io/badge/Status-Production%20Ready-success)
![License](https://img.shields.io/badge/License-MIT-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)
![React](https://img.shields.io/badge/React-18-blue)

## ✨ Features

### Core Functionality
- **Real-time Price Streaming** - WebSocket-powered live updates for 200+ cryptocurrencies
- **Interactive Price Charts** - Time period filters (1H, 1D, 1W, 1M, 3M, 1Y, ALL) with volume/price toggle
- **Custom Price Alerts** - Multiple alert types with exchange selection and sound customization
- **Currency Calculator** - Convert crypto to fiat (USD, GBP, EUR, RUB, AUD, CAD) or other cryptocurrencies (BTC, ETH)
- **Crypto Wiki** - Comprehensive coin information including descriptions, whitepapers, and GitHub links
- **Trusted News Feed** - Curated cryptocurrency news with sentiment analysis (positive/negative/neutral)
- **Advanced Filtering** - Search, filter by sentiment, source, and quick category filters

### Premium UI/UX
- **Dark-Mode First Design** - Ultra-dark theme with premium gold accents
- **Mobile-Optimized** - Touch-friendly interface with bottom navigation
- **Cryptocurrency Logos** - Official logos from CoinMarketCap CDN for all 200+ coins
- **Inline Sparklines** - Visual price trends at a glance
- **Responsive Stats Grid** - Comprehensive market data display

## 🚀 Tech Stack

### Frontend
- **React 18** with TypeScript
- **Wouter** - Lightweight client-side routing
- **TanStack Query v5** - Powerful data fetching and caching
- **Shadcn UI** - Beautiful, accessible components built on Radix primitives
- **Tailwind CSS** - Utility-first styling with custom design tokens
- **Framer Motion** - Smooth animations

### Backend
- **Express.js** with TypeScript
- **PostgreSQL** - Serverless database via Neon
- **Drizzle ORM** - Type-safe database queries
- **WebSocket Server** - Real-time price streaming
- **CoinMarketCap API** - Live cryptocurrency data
- **CryptoPanic API** - Curated news with sentiment analysis

### Infrastructure
- **Vite** - Lightning-fast build tool
- **ESBuild** - Fast JavaScript bundler
- **TSX** - TypeScript execution engine

## 📁 Project Structure

```
crypto-buzz/
├── client/                 # Frontend application
│   ├── src/
│   │   ├── pages/          # Page components
│   │   │   ├── AllCryptos.tsx      # Top 200 coins list
│   │   │   ├── Coin.tsx            # Coin detail with charts
│   │   │   ├── Portfolios.tsx      # Portfolio tracking
│   │   │   ├── News.tsx            # News feed
│   │   │   ├── Alerts.tsx          # Alert management
│   │   │   └── Settings.tsx        # App settings
│   │   ├── components/     # Reusable components
│   │   │   ├── PriceCard.tsx       # Coin price display
│   │   │   ├── CustomAlertModal.tsx # Alert creation
│   │   │   ├── CalculatorModal.tsx # Currency converter
│   │   │   ├── WikiModal.tsx       # Coin information
│   │   │   ├── NewsFilterSheet.tsx # News filters
│   │   │   ├── NewsCard.tsx        # News article
│   │   │   └── BottomNav.tsx       # Mobile navigation
│   │   ├── lib/            # Utilities
│   │   │   └── queryClient.ts      # React Query setup
│   │   └── index.css       # Global styles & design tokens
│   └── index.html          # App entry point
├── server/                 # Backend application
│   ├── routes.ts           # API endpoints
│   ├── storage.ts          # Database interface
│   ├── db.ts               # Drizzle connection
│   ├── index.ts            # Server entry point
│   └── services/           # Business logic
│       ├── coinmarketcap.ts        # Price data service
│       ├── cryptopanic.ts          # News service
│       ├── websocket.ts            # Real-time streaming
│       └── alert-engine.ts         # Alert evaluation
├── shared/                 # Shared types & schemas
│   └── schema.ts           # Database & TypeScript types
├── drizzle/                # Database migrations
├── .env.example            # Environment variables template
├── package.json            # Dependencies
├── tsconfig.json           # TypeScript config
├── tailwind.config.ts      # Tailwind config
├── vite.config.ts          # Vite config
└── README.md               # This file
```

## 🛠️ Setup & Installation

### Prerequisites
- **Node.js** 18+ and npm
- **PostgreSQL** database (or use Replit's built-in database)
- **CoinMarketCap API Key** - [Get free key](https://coinmarketcap.com/api/)
- **CryptoPanic API Token** - [Get free token](https://cryptopanic.com/developers/api/)

### Installation Steps

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd crypto-buzz
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env` file in the root directory:
   ```env
   # Required
   DATABASE_URL=postgresql://user:password@host:5432/database
   COINMARKETCAP_API_KEY=your_coinmarketcap_api_key
   CRYPTOPANIC_TOKEN=your_cryptopanic_token
   
   # Optional (auto-generated if not provided)
   SESSION_SECRET=your_random_session_secret
   ```

4. **Initialize the database**
   ```bash
   npm run db:push
   ```

5. **Seed demo data (optional)**
   ```bash
   curl -X POST http://localhost:5000/api/seed
   ```

6. **Start development server**
   ```bash
   npm run dev
   ```

7. **Open your browser**
   
   Navigate to `http://localhost:5000`

## 🌐 API Documentation

### Prices
- `GET /api/prices?symbols=BTC,ETH` - Get current prices for specific coins
- `GET /api/coins/:symbol` - Get detailed coin data with stats
- `GET /api/top-coins?limit=200` - Get top cryptocurrencies by market cap

### Alerts
- `GET /api/alerts` - Get user's alerts
- `POST /api/alerts` - Create new alert
  ```json
  {
    "symbol": "BTC",
    "type": "price",
    "params": { "level": 70000, "direction": "above" },
    "exchange": "binance",
    "sound": "notification"
  }
  ```
- `PATCH /api/alerts/:id` - Update alert (toggle, snooze)
- `DELETE /api/alerts/:id` - Delete alert
- `GET /api/alerts/history` - Get triggered alert history

### News
- `GET /api/news` - Get latest news (default: 50 articles)
- `GET /api/news?currency=BTC` - Get news for specific cryptocurrency

### WebSocket Events
```javascript
// Client → Server
{ "type": "subscribe", "symbols": ["BTC", "ETH", "SOL"] }

// Server → Client (price update)
{
  "type": "price_update",
  "data": [
    { "symbol": "BTC", "price": 67500.23, "timestamp": 1234567890 }
  ]
}

// Server → Client (alert triggered)
{
  "type": "alert_triggered",
  "data": {
    "alertId": "abc-123",
    "symbol": "BTC",
    "price": 70000,
    "type": "price"
  }
}
```

## 🗄️ Database Schema

### Users
```sql
id          uuid PRIMARY KEY
email       varchar UNIQUE
created_at  timestamp
```

### Watches
```sql
id          uuid PRIMARY KEY
user_id     uuid REFERENCES users(id)
symbol      varchar
cmc_id      varchar
name        varchar
created_at  timestamp
```

### Alerts
```sql
id           uuid PRIMARY KEY
user_id      uuid REFERENCES users(id)
symbol       varchar
type         enum('price', 'pct_move', 'trending_news', ...)
params       jsonb
exchange     varchar
sound        varchar
active       boolean
snooze_until timestamp
created_at   timestamp
```

### NewsItems
```sql
id           varchar PRIMARY KEY
title        text
url          text
source       varchar
sentiment    enum('positive', 'negative', 'neutral')
currencies   text[]
published_at timestamp
score        varchar
created_at   timestamp
```

## 🎨 Design System

### Color Tokens
```css
/* Crypto-specific colors */
--crypto-bullish: hsl(142 76% 36%);   /* Green for gains */
--crypto-bearish: hsl(0 84% 60%);     /* Red for losses */
--crypto-warning: hsl(38 92% 50%);    /* Gold for alerts */
--crypto-critical: hsl(0 100% 50%);   /* Critical red */
--crypto-neutral: hsl(220 13% 35%);   /* Neutral gray */

/* Ultra-dark theme */
--background: hsl(0 0% 4%);           /* #0A0A0A */
--foreground: hsl(0 0% 98%);          /* #FAFAFA */
```

### Typography
- **Price displays**: Monospace font with tabular numbers
- **UI text**: System sans-serif stack
- **Headings**: Bold weights for hierarchy

## 🚀 Deployment

### Deploy to Replit
1. Import this repository to Replit
2. Add environment secrets in Secrets tab
3. Click "Run" to start the application
4. Click "Publish" to deploy to production

### Deploy to Vercel/Netlify
1. Build the application:
   ```bash
   npm run build
   ```
2. Deploy the `dist` folder
3. Set environment variables in hosting dashboard
4. Configure PostgreSQL connection string

### Environment Variables for Production
```env
NODE_ENV=production
DATABASE_URL=<production-database-url>
COINMARKETCAP_API_KEY=<your-api-key>
CRYPTOPANIC_TOKEN=<your-token>
SESSION_SECRET=<strong-random-secret>
```

## 🧪 Testing

Run end-to-end tests:
```bash
# Tests verify:
# - All pages load correctly
# - Navigation works
# - Price displays are accurate
# - Alert creation flow
# - Calculator conversions
# - News filtering
npm test
```

## 📱 Progressive Web App

This app is installable as a PWA:
1. Open in Chrome/Edge/Safari on mobile
2. Tap "Add to Home Screen"
3. Launch from home screen like a native app

Features:
- Offline-capable (service worker ready)
- App manifest with icons
- Mobile-first responsive design
- Touch-optimized interactions

## 🔒 Security

- API keys stored in environment variables
- Session management with secure cookies
- Input validation using Zod schemas
- SQL injection protection via Drizzle ORM
- XSS prevention with React's built-in escaping

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

MIT License - see LICENSE file for details

## 🙏 Acknowledgments

- **CoinMarketCap** - Cryptocurrency data and logos
- **CryptoPanic** - Curated crypto news with sentiment
- **Shadcn UI** - Beautiful component library
- **Radix UI** - Accessible primitives
- **Replit** - Development and hosting platform

## 📞 Support

For issues and questions:
- Create an issue on GitHub
- Check the documentation
- Review existing issues

## 🗺️ Roadmap

- [ ] User authentication with multiple providers
- [ ] Portfolio tracking with P&L calculations
- [ ] Advanced alert types (VWAP, RSI, custom indicators)
- [ ] Historical price charts with TradingView integration
- [ ] Push notifications via service worker
- [ ] Multi-currency fiat support
- [ ] Export data to CSV/PDF
- [ ] Dark/Light theme toggle
- [ ] Desktop PWA support

---

**Built with ❤️ for the crypto community**
