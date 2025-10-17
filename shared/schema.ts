import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, boolean, json, decimal, pgEnum } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

// Enums
export const alertTypeEnum = pgEnum('alert_type', ['price', 'pct_move', 'day_levels', 'vwap']);
export const sentimentEnum = pgEnum('sentiment', ['positive', 'negative', 'neutral']);

// Users table
export const users = pgTable("users", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
  email: text("email").unique(),
  pushEndpoint: json("push_endpoint"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Watches table (user's watchlist)
export const watches = pgTable("watches", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id", { length: 36 }).references(() => users.id, { onDelete: 'cascade' }),
  symbol: text("symbol").notNull(), // e.g., BTC, ETH
  cmcId: text("cmc_id").notNull(), // CoinMarketCap ID
  name: text("name").notNull(), // Bitcoin, Ethereum
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Alerts table
export const alerts = pgTable("alerts", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id", { length: 36 }).references(() => users.id, { onDelete: 'cascade' }),
  symbol: text("symbol").notNull(),
  type: alertTypeEnum("type").notNull(),
  params: json("params").notNull(), // { level, direction, windowMins, pct, ... }
  active: boolean("active").default(true).notNull(),
  snoozeUntil: timestamp("snooze_until"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Alert fires (history)
export const alertFires = pgTable("alert_fires", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
  alertId: varchar("alert_id", { length: 36 }).references(() => alerts.id, { onDelete: 'cascade' }).notNull(),
  symbol: text("symbol").notNull(),
  price: decimal("price", { precision: 18, scale: 8 }).notNull(),
  firedAt: timestamp("fired_at").defaultNow().notNull(),
});

// News items
export const newsItems = pgTable("news_items", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  url: text("url").notNull().unique(),
  source: text("source").notNull(),
  sentiment: sentimentEnum("sentiment").default('neutral'),
  currencies: text("currencies").array(),
  publishedAt: timestamp("published_at").notNull(),
  score: decimal("score", { precision: 5, scale: 2 }), // reliability score
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  watches: many(watches),
  alerts: many(alerts),
}));

export const watchesRelations = relations(watches, ({ one }) => ({
  user: one(users, {
    fields: [watches.userId],
    references: [users.id],
  }),
}));

export const alertsRelations = relations(alerts, ({ one, many }) => ({
  user: one(users, {
    fields: [alerts.userId],
    references: [users.id],
  }),
  fires: many(alertFires),
}));

export const alertFiresRelations = relations(alertFires, ({ one }) => ({
  alert: one(alerts, {
    fields: [alertFires.alertId],
    references: [alerts.id],
  }),
}));

// Zod schemas for validation
export const insertUserSchema = createInsertSchema(users).pick({
  email: true,
  pushEndpoint: true,
});

export const insertWatchSchema = createInsertSchema(watches).pick({
  userId: true,
  symbol: true,
  cmcId: true,
  name: true,
});

export const insertAlertSchema = createInsertSchema(alerts).pick({
  userId: true,
  symbol: true,
  type: true,
  params: true,
  active: true,
});

export const insertAlertFireSchema = createInsertSchema(alertFires).pick({
  alertId: true,
  symbol: true,
  price: true,
});

export const insertNewsItemSchema = createInsertSchema(newsItems).pick({
  title: true,
  url: true,
  source: true,
  sentiment: true,
  currencies: true,
  publishedAt: true,
  score: true,
});

// TypeScript types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Watch = typeof watches.$inferSelect;
export type InsertWatch = z.infer<typeof insertWatchSchema>;

export type Alert = typeof alerts.$inferSelect;
export type InsertAlert = z.infer<typeof insertAlertSchema>;
export type AlertType = Alert['type'];

export type AlertFire = typeof alertFires.$inferSelect;
export type InsertAlertFire = z.infer<typeof insertAlertFireSchema>;

export type NewsItem = typeof newsItems.$inferSelect;
export type InsertNewsItem = z.infer<typeof insertNewsItemSchema>;

// API response types
export type CoinPrice = {
  symbol: string;
  name: string;
  price: number;
  change24h: number;
  volume24h: number;
  marketCap: number;
  high24h: number;
  low24h: number;
  sparkline?: number[];
};

export type PriceUpdate = {
  symbol: string;
  price: number;
  timestamp: number;
};

export type AlertCondition = {
  type: AlertType;
  symbol: string;
  params: {
    level?: number;
    direction?: 'above' | 'below';
    pct?: number;
    windowMins?: number;
  };
};
