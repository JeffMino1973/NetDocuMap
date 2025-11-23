import { 
  type Device, 
  type InsertDevice, 
  type Port, 
  type InsertPort,
  type Alert,
  type InsertAlert,
  type DeviceHealth,
  type InsertDeviceHealth
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Device operations
  getDevices(): Promise<Device[]>;
  getDevice(id: string): Promise<Device | undefined>;
  createDevice(device: InsertDevice): Promise<Device>;
  updateDevice(id: string, device: InsertDevice): Promise<Device | undefined>;
  deleteDevice(id: string): Promise<boolean>;
  
  // Port operations
  getPorts(): Promise<Port[]>;
  getPort(id: string): Promise<Port | undefined>;
  getPortsByDevice(deviceId: string): Promise<Port[]>;
  createPort(port: InsertPort): Promise<Port>;
  updatePort(id: string, port: InsertPort): Promise<Port | undefined>;
  deletePort(id: string): Promise<boolean>;

  // Alert operations
  getAlerts(): Promise<Alert[]>;
  getAlert(id: string): Promise<Alert | undefined>;
  getAlertsByDevice(deviceId: string): Promise<Alert[]>;
  createAlert(alert: InsertAlert): Promise<Alert>;
  acknowledgeAlert(id: string, acknowledgedBy: string): Promise<Alert | undefined>;
  deleteAlert(id: string): Promise<boolean>;

  // Device Health operations
  getDeviceHealth(deviceId: string): Promise<DeviceHealth | undefined>;
  getAllDeviceHealth(): Promise<DeviceHealth[]>;
  updateDeviceHealth(deviceId: string, health: InsertDeviceHealth): Promise<DeviceHealth>;
}

export class MemStorage implements IStorage {
  private devices: Map<string, Device>;
  private ports: Map<string, Port>;
  private alerts: Map<string, Alert>;
  private deviceHealth: Map<string, DeviceHealth>;

  constructor() {
    this.devices = new Map();
    this.ports = new Map();
    this.alerts = new Map();
    this.deviceHealth = new Map();
    this.seedData();
  }

  private seedData() {
    // Seed with sample devices for demo purposes
    const sampleDevices: InsertDevice[] = [
      {
        name: "Main Building Router",
        type: "router",
        model: "Cisco ISR 4331",
        ipAddress: "192.168.1.1",
        macAddress: "00:1A:2B:3C:4D:5E",
        location: "Server Room A",
        status: "active",
        description: "Primary router for main building network",
      },
      {
        name: "Floor 2 Switch",
        type: "switch",
        model: "Cisco Catalyst 2960",
        ipAddress: "192.168.1.10",
        macAddress: "00:1A:2B:3C:4D:5F",
        location: "Floor 2 Closet",
        status: "active",
        description: "48-port switch for second floor",
      },
      {
        name: "Library Access Point",
        type: "access-point",
        model: "Ubiquiti UniFi AP",
        ipAddress: "192.168.1.20",
        location: "Library",
        status: "active",
        description: "WiFi access point for library area",
      },
    ];

    sampleDevices.forEach((device) => {
      const id = randomUUID();
      this.devices.set(id, { 
        ...device, 
        id,
        macAddress: device.macAddress ?? null,
        description: device.description ?? null
      });
    });

    // Seed with sample ports
    const deviceIds = Array.from(this.devices.keys());
    if (deviceIds.length > 0) {
      const samplePorts: InsertPort[] = [
        {
          deviceId: deviceIds[0],
          portNumber: "Gi0/0/0",
          portType: "ethernet",
          status: "active",
          connectedTo: "ISP Gateway",
          speed: "1 Gbps",
          description: "WAN connection",
        },
        {
          deviceId: deviceIds[0],
          portNumber: "Gi0/0/1",
          portType: "ethernet",
          status: "active",
          connectedTo: "Floor 2 Switch",
          speed: "1 Gbps",
        },
        {
          deviceId: deviceIds[1],
          portNumber: "Gi1/0/1",
          portType: "ethernet",
          status: "active",
          connectedTo: "Room 201 PC",
          speed: "1 Gbps",
        },
        {
          deviceId: deviceIds[1],
          portNumber: "Gi1/0/2",
          portType: "ethernet",
          status: "active",
          connectedTo: "Room 202 PC",
          speed: "1 Gbps",
        },
      ];

      samplePorts.forEach((port) => {
        const id = randomUUID();
        this.ports.set(id, { 
          ...port, 
          id,
          connectedTo: port.connectedTo ?? null,
          speed: port.speed ?? null,
          description: port.description ?? null
        });
      });
    }
  }

  // Device operations
  async getDevices(): Promise<Device[]> {
    return Array.from(this.devices.values());
  }

  async getDevice(id: string): Promise<Device | undefined> {
    return this.devices.get(id);
  }

  async createDevice(insertDevice: InsertDevice): Promise<Device> {
    const id = randomUUID();
    const device: Device = { 
      ...insertDevice, 
      id,
      macAddress: insertDevice.macAddress ?? null,
      description: insertDevice.description ?? null
    };
    this.devices.set(id, device);
    return device;
  }

  async updateDevice(id: string, insertDevice: InsertDevice): Promise<Device | undefined> {
    const existing = this.devices.get(id);
    if (!existing) {
      return undefined;
    }
    const updated: Device = { 
      ...insertDevice, 
      id,
      macAddress: insertDevice.macAddress ?? null,
      description: insertDevice.description ?? null
    };
    this.devices.set(id, updated);
    return updated;
  }

  async deleteDevice(id: string): Promise<boolean> {
    const existed = this.devices.has(id);
    this.devices.delete(id);
    // Also delete associated ports
    const portsToDelete = Array.from(this.ports.entries())
      .filter(([, port]) => port.deviceId === id)
      .map(([portId]) => portId);
    portsToDelete.forEach((portId) => this.ports.delete(portId));
    return existed;
  }

  // Port operations
  async getPorts(): Promise<Port[]> {
    return Array.from(this.ports.values());
  }

  async getPort(id: string): Promise<Port | undefined> {
    return this.ports.get(id);
  }

  async getPortsByDevice(deviceId: string): Promise<Port[]> {
    return Array.from(this.ports.values()).filter((port) => port.deviceId === deviceId);
  }

  async createPort(insertPort: InsertPort): Promise<Port> {
    const id = randomUUID();
    const port: Port = { 
      ...insertPort, 
      id,
      connectedTo: insertPort.connectedTo ?? null,
      speed: insertPort.speed ?? null,
      description: insertPort.description ?? null
    };
    this.ports.set(id, port);
    return port;
  }

  async updatePort(id: string, insertPort: InsertPort): Promise<Port | undefined> {
    const existing = this.ports.get(id);
    if (!existing) {
      return undefined;
    }
    const updated: Port = { 
      ...insertPort, 
      id,
      connectedTo: insertPort.connectedTo ?? null,
      speed: insertPort.speed ?? null,
      description: insertPort.description ?? null
    };
    this.ports.set(id, updated);
    return updated;
  }

  async deletePort(id: string): Promise<boolean> {
    const existed = this.ports.has(id);
    this.ports.delete(id);
    return existed;
  }

  // Alert operations
  async getAlerts(): Promise<Alert[]> {
    return Array.from(this.alerts.values()).sort((a, b) => 
      b.timestamp.getTime() - a.timestamp.getTime()
    );
  }

  async getAlert(id: string): Promise<Alert | undefined> {
    return this.alerts.get(id);
  }

  async getAlertsByDevice(deviceId: string): Promise<Alert[]> {
    return Array.from(this.alerts.values())
      .filter((alert) => alert.deviceId === deviceId)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  async createAlert(insertAlert: InsertAlert): Promise<Alert> {
    const id = randomUUID();
    const alert: Alert = {
      deviceId: insertAlert.deviceId,
      type: insertAlert.type,
      message: insertAlert.message,
      severity: insertAlert.severity,
      id,
      timestamp: new Date(),
      acknowledged: false,
      acknowledgedBy: null,
      acknowledgedAt: null,
    };
    this.alerts.set(id, alert);
    return alert;
  }

  async acknowledgeAlert(id: string, acknowledgedBy: string): Promise<Alert | undefined> {
    const alert = this.alerts.get(id);
    if (!alert) {
      return undefined;
    }
    const updated: Alert = {
      ...alert,
      acknowledged: true,
      acknowledgedBy,
      acknowledgedAt: new Date(),
    };
    this.alerts.set(id, updated);
    return updated;
  }

  async deleteAlert(id: string): Promise<boolean> {
    const existed = this.alerts.has(id);
    this.alerts.delete(id);
    return existed;
  }

  // Device Health operations
  async getDeviceHealth(deviceId: string): Promise<DeviceHealth | undefined> {
    return this.deviceHealth.get(deviceId);
  }

  async getAllDeviceHealth(): Promise<DeviceHealth[]> {
    return Array.from(this.deviceHealth.values());
  }

  async updateDeviceHealth(deviceId: string, health: InsertDeviceHealth): Promise<DeviceHealth> {
    const updated: DeviceHealth = {
      deviceId,
      lastChecked: new Date(),
      isOnline: health.isOnline === true,
      responseTime: typeof health.responseTime === 'number' && !isNaN(health.responseTime) ? health.responseTime : null,
      uptime: typeof health.uptime === 'number' && !isNaN(health.uptime) ? health.uptime : 0,
      lastOnline: health.lastOnline instanceof Date ? health.lastOnline : null,
      lastOffline: health.lastOffline instanceof Date ? health.lastOffline : null,
      consecutiveFailures: typeof health.consecutiveFailures === 'number' && !isNaN(health.consecutiveFailures) ? health.consecutiveFailures : 0,
    };
    this.deviceHealth.set(deviceId, updated);
    return updated;
  }
}

export const storage = new MemStorage();
