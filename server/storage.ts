// Referenced from javascript_database blueprint
import { 
  users, watches, alerts, alertFires, newsItems,
  type User, type InsertUser,
  type Watch, type InsertWatch,
  type Alert, type InsertAlert,
  type AlertFire, type InsertAlertFire,
  type NewsItem, type InsertNewsItem
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc } from "drizzle-orm";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Watches
  getWatches(userId: string): Promise<Watch[]>;
  createWatch(watch: InsertWatch): Promise<Watch>;
  deleteWatch(id: string): Promise<void>;

  // Alerts
  getAlerts(userId: string): Promise<Alert[]>;
  getActiveAlerts(): Promise<Alert[]>;
  createAlert(alert: InsertAlert): Promise<Alert>;
  updateAlert(id: string, data: Partial<Alert>): Promise<Alert>;
  deleteAlert(id: string): Promise<void>;

  // Alert Fires
  getAlertFires(userId: string): Promise<AlertFire[]>;
  createAlertFire(fire: InsertAlertFire): Promise<AlertFire>;

  // News
  getNews(limit?: number): Promise<NewsItem[]>;
  getNewsByCurrency(currency: string): Promise<NewsItem[]>;
  createNews(news: InsertNewsItem): Promise<NewsItem>;
  upsertNews(news: InsertNewsItem): Promise<NewsItem>;
}

export class DatabaseStorage implements IStorage {
  // Users
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  // Watches
  async getWatches(userId: string): Promise<Watch[]> {
    return db.select().from(watches).where(eq(watches.userId, userId));
  }

  async createWatch(insertWatch: InsertWatch): Promise<Watch> {
    const [watch] = await db.insert(watches).values(insertWatch).returning();
    return watch;
  }

  async deleteWatch(id: string): Promise<void> {
    await db.delete(watches).where(eq(watches.id, id));
  }

  // Alerts
  async getAlerts(userId: string): Promise<Alert[]> {
    return db.select().from(alerts).where(eq(alerts.userId, userId)).orderBy(desc(alerts.createdAt));
  }

  async getActiveAlerts(): Promise<Alert[]> {
    return db.select().from(alerts).where(eq(alerts.active, true));
  }

  async createAlert(insertAlert: InsertAlert): Promise<Alert> {
    const [alert] = await db.insert(alerts).values(insertAlert).returning();
    return alert;
  }

  async updateAlert(id: string, data: Partial<Alert>): Promise<Alert> {
    const [alert] = await db.update(alerts).set(data).where(eq(alerts.id, id)).returning();
    return alert;
  }

  async deleteAlert(id: string): Promise<void> {
    await db.delete(alerts).where(eq(alerts.id, id));
  }

  // Alert Fires
  async getAlertFires(userId: string): Promise<AlertFire[]> {
    const userAlertIds = await db.select({ id: alerts.id }).from(alerts).where(eq(alerts.userId, userId));
    const alertIds = userAlertIds.map(a => a.id);
    
    if (alertIds.length === 0) return [];
    
    return db.select().from(alertFires)
      .where(eq(alertFires.alertId, alertIds[0])) // Simplified for now
      .orderBy(desc(alertFires.firedAt))
      .limit(50);
  }

  async createAlertFire(insertFire: InsertAlertFire): Promise<AlertFire> {
    const [fire] = await db.insert(alertFires).values(insertFire).returning();
    return fire;
  }

  // News
  async getNews(limit: number = 50): Promise<NewsItem[]> {
    return db.select().from(newsItems).orderBy(desc(newsItems.publishedAt)).limit(limit);
  }

  async getNewsByCurrency(currency: string): Promise<NewsItem[]> {
    const allNews = await db.select().from(newsItems).orderBy(desc(newsItems.publishedAt)).limit(100);
    return allNews.filter(news => news.currencies?.includes(currency));
  }

  async createNews(insertNews: InsertNewsItem): Promise<NewsItem> {
    const [news] = await db.insert(newsItems).values(insertNews).returning();
    return news;
  }

  async upsertNews(insertNews: InsertNewsItem): Promise<NewsItem> {
    // Try to find existing by URL
    const [existing] = await db.select().from(newsItems).where(eq(newsItems.url, insertNews.url));
    if (existing) return existing;
    
    return this.createNews(insertNews);
  }
}

export const storage = new DatabaseStorage();
