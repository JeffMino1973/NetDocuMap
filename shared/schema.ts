import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const devices = pgTable("devices", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  type: text("type").notNull(),
  model: text("model").notNull(),
  ipAddress: text("ip_address").notNull(),
  macAddress: text("mac_address"),
  location: text("location").notNull(),
  status: text("status").notNull(),
  description: text("description"),
});

export const ports = pgTable("ports", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  deviceId: varchar("device_id").notNull(),
  portNumber: text("port_number").notNull(),
  portType: text("port_type").notNull(),
  status: text("status").notNull(),
  connectedTo: text("connected_to"),
  speed: text("speed"),
  description: text("description"),
});

export const alerts = pgTable("alerts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  deviceId: varchar("device_id").notNull(),
  type: text("type").notNull(), // 'offline', 'online', 'error', 'warning', 'maintenance'
  message: text("message").notNull(),
  severity: text("severity").notNull(), // 'critical', 'warning', 'info'
  timestamp: timestamp("timestamp").notNull().defaultNow(),
  acknowledged: boolean("acknowledged").notNull().default(false),
  acknowledgedBy: text("acknowledged_by"),
  acknowledgedAt: timestamp("acknowledged_at"),
});

export const deviceHealth = pgTable("device_health", {
  deviceId: varchar("device_id").primaryKey(),
  lastChecked: timestamp("last_checked"),
  isOnline: boolean("is_online").notNull().default(false),
  responseTime: integer("response_time"), // in milliseconds
  uptime: integer("uptime").notNull().default(0), // percentage
  lastOnline: timestamp("last_online"),
  lastOffline: timestamp("last_offline"),
  consecutiveFailures: integer("consecutive_failures").notNull().default(0),
});

// Alert and device type enums
export const deviceTypes = [
  "router",
  "switch",
  "access-point",
  "server",
  "firewall",
] as const;

export const deviceStatuses = [
  "active",
  "inactive",
  "maintenance",
  "error",
] as const;

export const portTypes = [
  "ethernet",
  "fiber",
  "sfp",
  "usb",
  "console",
] as const;

export const portStatuses = [
  "active",
  "inactive",
  "error",
] as const;

export const alertTypes = [
  "offline",
  "online",
  "error",
  "warning",
  "maintenance",
  "performance",
] as const;

export const alertSeverities = [
  "critical",
  "warning",
  "info",
] as const;

// Insert schemas
export const insertDeviceSchema = createInsertSchema(devices).omit({
  id: true,
});

export const insertPortSchema = createInsertSchema(ports).omit({
  id: true,
});

export const insertAlertSchema = createInsertSchema(alerts).omit({
  id: true,
  timestamp: true,
  acknowledged: true,
  acknowledgedBy: true,
  acknowledgedAt: true,
}).extend({
  type: z.enum(alertTypes),
  severity: z.enum(alertSeverities),
});

export const insertDeviceHealthSchema = createInsertSchema(deviceHealth).omit({
  lastChecked: true,
}).extend({
  isOnline: z.coerce.boolean(),
  uptime: z.coerce.number().min(0).max(100),
  responseTime: z.coerce.number().min(0).nullable().optional(),
  consecutiveFailures: z.coerce.number().min(0),
  lastOnline: z.coerce.date().nullable().optional(),
  lastOffline: z.coerce.date().nullable().optional(),
});

// Types
export type InsertDevice = z.infer<typeof insertDeviceSchema>;
export type Device = typeof devices.$inferSelect;
export type InsertPort = z.infer<typeof insertPortSchema>;
export type Port = typeof ports.$inferSelect;
export type InsertAlert = z.infer<typeof insertAlertSchema>;
export type Alert = typeof alerts.$inferSelect;
export type InsertDeviceHealth = z.infer<typeof insertDeviceHealthSchema>;
export type DeviceHealth = typeof deviceHealth.$inferSelect;
