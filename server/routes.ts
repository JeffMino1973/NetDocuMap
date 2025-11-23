import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertDeviceSchema, insertPortSchema, insertAlertSchema, insertDeviceHealthSchema } from "@shared/schema";
import { fromZodError } from "zod-validation-error";
import { monitoringService } from "./monitoring-service";

export async function registerRoutes(app: Express): Promise<Server> {
  // Device routes
  app.get("/api/devices", async (_req, res) => {
    try {
      const devices = await storage.getDevices();
      res.json(devices);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch devices" });
    }
  });

  app.get("/api/devices/:id", async (req, res) => {
    try {
      const device = await storage.getDevice(req.params.id);
      if (!device) {
        return res.status(404).json({ message: "Device not found" });
      }
      res.json(device);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch device" });
    }
  });

  app.post("/api/devices", async (req, res) => {
    try {
      const result = insertDeviceSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ 
          message: fromZodError(result.error).message 
        });
      }
      const device = await storage.createDevice(result.data);
      res.status(201).json(device);
    } catch (error) {
      res.status(500).json({ message: "Failed to create device" });
    }
  });

  app.patch("/api/devices/:id", async (req, res) => {
    try {
      const result = insertDeviceSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ 
          message: fromZodError(result.error).message 
        });
      }
      const device = await storage.updateDevice(req.params.id, result.data);
      if (!device) {
        return res.status(404).json({ message: "Device not found" });
      }
      res.json(device);
    } catch (error) {
      res.status(500).json({ message: "Failed to update device" });
    }
  });

  app.delete("/api/devices/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteDevice(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: "Device not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete device" });
    }
  });

  // Port routes
  app.get("/api/ports", async (_req, res) => {
    try {
      const ports = await storage.getPorts();
      res.json(ports);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch ports" });
    }
  });

  app.get("/api/ports/:id", async (req, res) => {
    try {
      const port = await storage.getPort(req.params.id);
      if (!port) {
        return res.status(404).json({ message: "Port not found" });
      }
      res.json(port);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch port" });
    }
  });

  app.get("/api/devices/:deviceId/ports", async (req, res) => {
    try {
      const ports = await storage.getPortsByDevice(req.params.deviceId);
      res.json(ports);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch device ports" });
    }
  });

  app.post("/api/ports", async (req, res) => {
    try {
      const result = insertPortSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ 
          message: fromZodError(result.error).message 
        });
      }
      const port = await storage.createPort(result.data);
      res.status(201).json(port);
    } catch (error) {
      res.status(500).json({ message: "Failed to create port" });
    }
  });

  app.patch("/api/ports/:id", async (req, res) => {
    try {
      const result = insertPortSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ 
          message: fromZodError(result.error).message 
        });
      }
      const port = await storage.updatePort(req.params.id, result.data);
      if (!port) {
        return res.status(404).json({ message: "Port not found" });
      }
      res.json(port);
    } catch (error) {
      res.status(500).json({ message: "Failed to update port" });
    }
  });

  app.delete("/api/ports/:id", async (req, res) => {
    try {
      const deleted = await storage.deletePort(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: "Port not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete port" });
    }
  });

  // Alert routes
  app.get("/api/alerts", async (_req, res) => {
    try {
      const alerts = await storage.getAlerts();
      res.json(alerts);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch alerts" });
    }
  });

  app.get("/api/alerts/device/:deviceId", async (req, res) => {
    try {
      const alerts = await storage.getAlertsByDevice(req.params.deviceId);
      res.json(alerts);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch device alerts" });
    }
  });

  app.post("/api/alerts", async (req, res) => {
    try {
      const result = insertAlertSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ 
          message: fromZodError(result.error).message 
        });
      }
      const alert = await storage.createAlert(result.data);
      res.status(201).json(alert);
    } catch (error) {
      res.status(500).json({ message: "Failed to create alert" });
    }
  });

  app.patch("/api/alerts/:id/acknowledge", async (req, res) => {
    try {
      const { acknowledgedBy } = req.body;
      if (!acknowledgedBy) {
        return res.status(400).json({ message: "acknowledgedBy is required" });
      }
      const alert = await storage.acknowledgeAlert(req.params.id, acknowledgedBy);
      if (!alert) {
        return res.status(404).json({ message: "Alert not found" });
      }
      res.json(alert);
    } catch (error) {
      res.status(500).json({ message: "Failed to acknowledge alert" });
    }
  });

  // Device Health routes
  app.get("/api/device-health", async (_req, res) => {
    try {
      const health = await storage.getAllDeviceHealth();
      res.json(health);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch device health" });
    }
  });

  app.get("/api/device-health/:deviceId", async (req, res) => {
    try {
      const health = await storage.getDeviceHealth(req.params.deviceId);
      if (!health) {
        return res.status(404).json({ message: "Device health not found" });
      }
      res.json(health);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch device health" });
    }
  });

  app.put("/api/device-health/:deviceId", async (req, res) => {
    try {
      const result = insertDeviceHealthSchema.safeParse({
        ...req.body,
        deviceId: req.params.deviceId,
      });
      
      if (!result.success) {
        return res.status(400).json({ 
          message: fromZodError(result.error).message 
        });
      }
      
      const health = await storage.updateDeviceHealth(req.params.deviceId, result.data);
      res.json(health);
    } catch (error) {
      res.status(500).json({ message: "Failed to update device health" });
    }
  });

  // Alert Rules routes
  app.get("/api/alert-rules", async (_req, res) => {
    try {
      const rules = monitoringService.getAlertRules();
      res.json(rules);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch alert rules" });
    }
  });

  app.patch("/api/alert-rules/:id", async (req, res) => {
    try {
      const success = monitoringService.updateAlertRule(req.params.id, req.body);
      if (!success) {
        return res.status(404).json({ message: "Alert rule not found" });
      }
      const rules = monitoringService.getAlertRules();
      const updated = rules.find(r => r.id === req.params.id);
      res.json(updated);
    } catch (error) {
      res.status(500).json({ message: "Failed to update alert rule" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
