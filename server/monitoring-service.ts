import { storage } from "./storage";
import type { Device, Alert } from "@shared/schema";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

interface AlertRule {
  id: string;
  name: string;
  enabled: boolean;
  conditions: {
    deviceOffline?: boolean;
    consecutiveFailures?: number;
    responseTimeThreshold?: number;
  };
  severity: "critical" | "warning" | "info";
  notificationChannels: string[];
}

class MonitoringService {
  private monitoringInterval: NodeJS.Timeout | null = null;
  private readonly MONITORING_INTERVAL_MS = 60000; // 1 minute
  private readonly PING_TIMEOUT_MS = 5000;
  
  private alertRules: AlertRule[] = [
    {
      id: "device-offline",
      name: "Device Offline Alert",
      enabled: true,
      conditions: {
        deviceOffline: true,
        consecutiveFailures: 3,
      },
      severity: "critical",
      notificationChannels: ["console"],
    },
    {
      id: "high-latency",
      name: "High Latency Warning",
      enabled: true,
      conditions: {
        responseTimeThreshold: 500,
      },
      severity: "warning",
      notificationChannels: ["console"],
    },
  ];

  async start() {
    if (this.monitoringInterval) {
      console.log("[Monitoring] Service already running");
      return;
    }

    console.log("[Monitoring] Starting monitoring service...");
    
    // Run immediate initial check to populate baseline data
    await this.runMonitoringCycle();
    
    // Then start periodic checks
    this.monitoringInterval = setInterval(() => {
      this.runMonitoringCycle().catch(console.error);
    }, this.MONITORING_INTERVAL_MS);
  }

  stop() {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
      console.log("[Monitoring] Service stopped");
    }
  }

  private async runMonitoringCycle() {
    const devices = await storage.getDevices();
    console.log(`[Monitoring] Checking ${devices.length} devices...`);

    for (const device of devices) {
      await this.checkDeviceHealth(device);
    }
  }

  private async checkDeviceHealth(device: Device) {
    try {
      const { isOnline, responseTime } = await this.pingDevice(device.ipAddress);
      const existingHealth = await storage.getDeviceHealth(device.id);
      const consecutiveFailures = isOnline ? 0 : (existingHealth?.consecutiveFailures ?? 0) + 1;

      await storage.updateDeviceHealth(device.id, {
        deviceId: device.id,
        isOnline,
        responseTime,
        uptime: this.calculateUptime(existingHealth?.isOnline ?? false, isOnline),
        lastOnline: isOnline ? new Date() : existingHealth?.lastOnline ?? null,
        lastOffline: !isOnline ? new Date() : existingHealth?.lastOffline ?? null,
        consecutiveFailures,
      });

      // Only generate alerts in production mode
      if (process.env.NODE_ENV !== "development") {
        await this.evaluateAlertRules(device, {
          isOnline,
          responseTime,
          consecutiveFailures,
        });
      }

    } catch (error) {
      console.error(`[Monitoring] Error checking device ${device.name}:`, error);
    }
  }

  private async pingDevice(ipAddress: string): Promise<{ isOnline: boolean; responseTime: number | null }> {
    // Development mode: deterministic simulation based on IP hash
    if (process.env.NODE_ENV === "development") {
      // Use last octet of IP to determine status (deterministic)
      const lastOctet = parseInt(ipAddress.split('.').pop() || '0');
      const isOnline = lastOctet % 10 !== 0; // 90% devices online, deterministic
      const responseTime = isOnline ? (lastOctet % 50) + 20 : null; // 20-70ms based on IP
      return { isOnline, responseTime };
    }

    // Production mode: use actual ICMP ping
    try {
      const isWindows = process.platform === "win32";
      const pingCommand = isWindows
        ? `ping -n 1 -w ${this.PING_TIMEOUT_MS} ${ipAddress}`
        : `ping -c 1 -W ${Math.ceil(this.PING_TIMEOUT_MS / 1000)} ${ipAddress}`;

      const { stdout } = await execAsync(pingCommand);
      
      const timeMatch = isWindows
        ? stdout.match(/time[=<](\d+)ms/i)
        : stdout.match(/time=(\d+\.?\d*)\s*ms/i);
      
      const responseTime = timeMatch ? parseFloat(timeMatch[1]) : null;
      const isOnline = stdout.includes(isWindows ? "Reply from" : "bytes from");

      return { isOnline, responseTime };
    } catch (error) {
      return { isOnline: false, responseTime: null };
    }
  }

  private calculateUptime(wasOnline: boolean, isOnline: boolean): number {
    if (!isOnline) return 0;
    return 100;
  }

  private async evaluateAlertRules(
    device: Device,
    healthData: { isOnline: boolean; responseTime: number | null; consecutiveFailures: number }
  ) {
    for (const rule of this.alertRules) {
      if (!rule.enabled) continue;

      let shouldAlert = false;
      let alertMessage = "";

      if (rule.conditions.deviceOffline && !healthData.isOnline) {
        if (rule.conditions.consecutiveFailures && 
            healthData.consecutiveFailures >= rule.conditions.consecutiveFailures) {
          shouldAlert = true;
          alertMessage = `Device ${device.name} (${device.ipAddress}) has been offline for ${healthData.consecutiveFailures} consecutive checks`;
        }
      }

      if (rule.conditions.responseTimeThreshold && 
          healthData.responseTime && 
          healthData.responseTime > rule.conditions.responseTimeThreshold) {
        shouldAlert = true;
        alertMessage = `Device ${device.name} (${device.ipAddress}) has high latency: ${healthData.responseTime}ms`;
      }

      if (shouldAlert) {
        await this.createAlert(device.id, alertMessage, rule.severity, rule.notificationChannels);
      }
    }
  }

  private async createAlert(
    deviceId: string,
    message: string,
    severity: "critical" | "warning" | "info",
    notificationChannels: string[]
  ) {
    const existingAlerts = await storage.getAlertsByDevice(deviceId);
    const recentUnacknowledged = existingAlerts.find(
      (alert) => 
        !alert.acknowledged && 
        alert.message === message &&
        Date.now() - alert.timestamp.getTime() < 3600000
    );

    if (recentUnacknowledged) {
      return;
    }

    const alert = await storage.createAlert({
      deviceId,
      type: severity === "critical" ? "offline" : "warning",
      message,
      severity,
    });

    await this.sendNotifications(alert, notificationChannels);
  }

  private async sendNotifications(alert: Alert, channels: string[]) {
    for (const channel of channels) {
      switch (channel) {
        case "console":
          console.log(`[Alert] ${alert.severity.toUpperCase()}: ${alert.message}`);
          break;
        case "email":
          break;
        case "webhook":
          break;
      }
    }
  }

  getAlertRules(): AlertRule[] {
    return this.alertRules;
  }

  updateAlertRule(ruleId: string, updates: Partial<AlertRule>): boolean {
    const index = this.alertRules.findIndex(r => r.id === ruleId);
    if (index === -1) return false;
    
    this.alertRules[index] = { ...this.alertRules[index], ...updates };
    return true;
  }

  addAlertRule(rule: AlertRule): void {
    this.alertRules.push(rule);
  }
}

export const monitoringService = new MonitoringService();
