# Network Documentation System

## Overview

NetDoc is a professional network documentation application designed for managing school network infrastructure. The system provides a comprehensive interface for tracking network devices (routers, switches, access points, firewalls, servers), their port configurations, physical locations, and network topology. Built with a focus on clarity and efficiency, it enables IT administrators to maintain accurate records of their network infrastructure with enterprise-grade organization and visualization capabilities.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework**: React with TypeScript using Vite as the build tool and development server.

**UI Component System**: Shadcn/ui component library built on Radix UI primitives, styled with Tailwind CSS. The design follows Material Design and Carbon Design System principles optimized for data-heavy enterprise applications. Components are located in `client/src/components/ui/` with custom business components in `client/src/components/`.

**Routing**: Wouter for lightweight client-side routing. Main routes include Dashboard (`/`), Devices (`/devices`), Device Detail (`/devices/:id`), Ports (`/ports`), Network Topology (`/topology`), Locations (`/locations`), Monitoring (`/monitoring`), and Alerts (`/alerts`).

**State Management**: TanStack Query (React Query) for server state management with aggressive caching (`staleTime: Infinity`) to minimize unnecessary network requests. Query client configured with custom fetch functions for standardized API communication.

**Form Handling**: React Hook Form with Zod for schema validation, integrated through `@hookform/resolvers`.

**Styling Strategy**: Tailwind CSS with custom design tokens defined in CSS variables for theming. Supports light/dark mode with theme toggle persisted to localStorage. Custom spacing scale and shadow system for consistent elevation.

### Backend Architecture

**Server Framework**: Express.js running on Node.js with TypeScript.

**API Design**: RESTful API with routes organized in `server/routes.ts`. Standard CRUD operations for devices and ports:
- `GET /api/devices` - List all devices
- `GET /api/devices/:id` - Get single device
- `POST /api/devices` - Create device
- `PATCH /api/devices/:id` - Update device
- `DELETE /api/devices/:id` - Delete device
- Similar pattern for `/api/ports`

**Validation**: Zod schemas defined in `shared/schema.ts` used for both client-side type safety and server-side request validation. Uses `zod-validation-error` for user-friendly error messages.

**Development vs Production**: Vite middleware integration in development for HMR and asset serving. Production builds compile client to `dist/public` and server to `dist` with esbuild bundling.

### Data Storage

**ORM**: Drizzle ORM configured for PostgreSQL (via `@neondatabase/serverless` driver).

**Schema Design**: Four primary tables defined in `shared/schema.ts`:

- **devices**: Stores network device information (id, name, type, model, ipAddress, macAddress, location, status, description)
- **ports**: Stores port configurations (id, deviceId, portNumber, portType, status, connectedTo, speed, description)
- **alerts**: Stores network alerts (id, deviceId, type, message, severity, timestamp, acknowledged, acknowledgedBy, acknowledgedAt)
- **deviceHealth**: Stores real-time device health metrics (deviceId, lastChecked, isOnline, responseTime, uptime, lastOnline, lastOffline, consecutiveFailures)

**Current Implementation**: In-memory storage (`MemStorage` class in `server/storage.ts`) with sample seed data for development. Designed to be swapped with database-backed storage implementing the `IStorage` interface.

**Migration Strategy**: Drizzle Kit configured (`drizzle.config.ts`) for database migrations with schema located in `./shared/schema.ts` and migrations output to `./migrations`. Uses `DATABASE_URL` environment variable for PostgreSQL connection.

### Design System

**Typography**: Inter font family for UI text with Roboto Mono for technical data (IP addresses, MAC addresses). Font weights: 400 (body), 500 (technical), 600 (headers).

**Color System**: HSL-based design tokens with semantic naming (primary, secondary, muted, accent, destructive). Separate tokens for card, popover, and sidebar contexts. Custom border colors using CSS variable composition.

**Layout Structure**: 
- Sidebar navigation (collapsible, responsive) using custom Shadcn sidebar component
- Header bar with theme toggle and sidebar trigger
- Main content area with scrollable pages
- Grid-based responsive layouts (1 column mobile, 2-4 columns desktop)

**Component Patterns**:
- Status badges with icons for device/port states
- Device type icons mapped to specific Lucide icons
- Dialogs for create/edit operations
- Alert dialogs for destructive actions
- Tables with filtering and search capabilities

## Monitoring & Alerts System

**Real-Time Monitoring Service**: Background service (`server/monitoring-service.ts`) that automatically checks device health every 60 seconds using ping/ICMP tests. Monitors response times, tracks consecutive failures, and maintains uptime statistics.

**Automated Health Checks**:
- Ping-based connectivity testing for all devices
- Response time measurement in milliseconds
- Consecutive failure tracking for reliability
- Last online/offline timestamp recording
- Automatic health record updates via `PUT /api/device-health/:deviceId`

**Alert Rules Engine**: Configurable alert rules with conditions for:
- Device offline detection (with consecutive failure threshold)
- High latency warnings (response time thresholds)
- Automatic alert generation when conditions are met
- Duplicate alert prevention (1-hour cooldown for same message)

**Alert Management**:
- Server-controlled alert creation with automatic timestamps
- Three severity levels: critical, warning, info
- Alert acknowledgement system with user tracking
- Alert type enum: offline, online, error, warning, maintenance, performance

**Notification System**: Extensible notification channels including console logging (implemented), with stubs for email and webhook notifications.

**API Endpoints**:
- `GET /api/alerts` - List all alerts
- `GET /api/alerts/device/:deviceId` - Get alerts for specific device
- `POST /api/alerts` - Create alert (server-controlled fields)
- `PATCH /api/alerts/:id/acknowledge` - Acknowledge alert
- `GET /api/device-health` - Get all device health records
- `GET /api/device-health/:deviceId` - Get health for specific device
- `PUT /api/device-health/:deviceId` - Update device health (with Zod validation)
- `GET /api/alert-rules` - Get configured alert rules
- `PATCH /api/alert-rules/:id` - Update alert rule configuration

**Monitoring UI**: Dedicated Monitoring page (`/monitoring`) displaying:
- Real-time device status overview cards (total, online, offline, avg uptime)
- Per-device health status with response times and failure counts
- Auto-refreshing data (30-second intervals)
- Alert rules configuration with enable/disable toggles
- Visual status indicators and trend information

**Alerts UI**: Separate Alerts page (`/alerts`) showing:
- Unacknowledged alerts with severity badges
- Alert acknowledgement workflow
- Acknowledged alerts history
- Alert statistics (unacknowledged, acknowledged, total counts)
- Automatic timestamp parsing for JSON responses

**Data Integrity**: 
- Zod schema validation with type coercion for device health updates
- Server-controlled alert timestamps and acknowledgement metadata
- Enum enforcement for alert types and severities
- Robust field normalization in storage layer (null handling, type checking)

## External Dependencies

### Core Framework Dependencies
- **React 18+**: UI library
- **Vite**: Build tool and dev server
- **Express**: Backend HTTP server
- **TypeScript**: Type safety across full stack

### Database & ORM
- **Drizzle ORM**: TypeScript ORM for PostgreSQL
- **@neondatabase/serverless**: PostgreSQL driver for serverless environments
- **Drizzle Kit**: Migration tool
- **Drizzle Zod**: Integration between Drizzle and Zod schemas

### UI Component Libraries
- **Radix UI**: Unstyled, accessible component primitives (20+ components including Dialog, Dropdown, Select, etc.)
- **Tailwind CSS**: Utility-first CSS framework
- **Lucide React**: Icon library
- **class-variance-authority**: Variant-based component styling
- **cmdk**: Command palette component

### Form & Validation
- **React Hook Form**: Form state management
- **Zod**: Schema validation
- **@hookform/resolvers**: React Hook Form + Zod integration

### Data Fetching & State
- **TanStack Query**: Server state management
- **date-fns**: Date formatting and manipulation

### Development Tools
- **Replit-specific plugins**: Runtime error overlay, dev banner, cartographer (development only)
- **tsx**: TypeScript execution for development
- **esbuild**: Production server bundling

### Desktop Application & Deployment
- **Electron**: Desktop application wrapper for Windows deployment
- **electron-builder**: Creates professional Windows installers (NSIS and Portable)
- **Windows Build System**: Automated build pipeline (`build-windows.js`) creates production-ready installers

### Special Considerations
- No authentication system currently implemented
- Session management infrastructure present (connect-pg-simple) but not actively used
- Application expects PostgreSQL but will work with in-memory storage until database provisioned
- Design guidelines document (`design_guidelines.md`) specifies Material Design and Carbon Design System influences for future development

## Windows Desktop Application

### Overview
NetDoc can be packaged as a standalone Windows desktop application using Electron. This allows distribution as a native Windows program without requiring users to install Node.js, run terminal commands, or manage a web server manually.

### Architecture
**Electron Wrapper** (`electron/main.js`): Launches embedded Node.js Express server on localhost:5000, creates native window with Chromium rendering engine, provides Windows-native menu bar, system tray integration, and auto-start capabilities.

**Build Pipeline**: Frontend build (Vite) → Backend build (esbuild CommonJS) → Electron packaging → Windows installers (NSIS + Portable).

### Installer Types

**NSIS Installer** (`NetDoc-Setup-{version}.exe`):
- Professional installation wizard with customizable installation directory
- Desktop and Start Menu shortcuts
- Integrates with Windows Add/Remove Programs
- Automatic uninstaller creation
- Recommended for standard deployments in schools and organizations
- File size: ~150-200 MB (includes Chromium and Node.js runtime)

**Portable Executable** (`NetDoc-Portable-{version}.exe`):
- No installation required - runs directly from any location
- Suitable for USB drives, network shares, and testing scenarios
- No admin rights required
- Leaves no registry entries or system modifications
- File size: ~150-200 MB

### Building Windows Installers

**First Time Setup:**
```bash
node setup-electron.cjs  # Configures package.json (run once)
```

**Quick Build:**
```bash
node build-windows.js
```

**Manual Build Steps:**
1. Build frontend: Build React app with Vite → creates `dist/` folder
2. Package with Electron: electron-builder packages frontend + server source + dependencies → creates installers in `release/` folder

**Build Configuration:**
- `electron-builder.config.js`: Defines app ID, product name, icon, NSIS options, file inclusions/exclusions
- `build/icon.png`: Application icon (512x512 PNG, auto-converted to .ico by electron-builder)
- `electron/main.js`: Electron main process that spawns Express server and creates native window

### Distribution & Deployment

**Internal Network Deployment:**
- Network share distribution: Place installer on file server for IT staff access
- Group Policy deployment: Use NSIS installer with Windows domain GPO
- SCCM/Intune support: Can be packaged for enterprise management systems

**Portable Deployment:**
- USB drive deployment for field technicians
- Network share execution without local installation
- Quick demonstration tool for management presentations

### Production Considerations

**Code Signing (Recommended):**
- Prevents Windows SmartScreen warnings
- Requires code signing certificate from trusted CA (DigiCert, Sectigo, GlobalSign)
- Configure in electron-builder.config.js with certificate file and password

**Auto-Updates:**
- Electron supports auto-update mechanisms
- Requires release server for update manifest hosting
- Not currently implemented but infrastructure is present

**Security:**
- Context isolation enabled (prevents Node.js access from renderer)
- No remote module support
- Server runs on localhost only (not exposed to network)

### Build Artifacts
- `release/NetDoc-Setup-{version}.exe`: NSIS installer
- `release/NetDoc-Portable-{version}.exe`: Portable version
- `dist/`: Frontend build output (Vite)

**Runtime Architecture:**
- Packaged app includes TypeScript server source code
- Server runs via tsx runtime (tsx moved to production dependencies)
- Electron spawns server with `ELECTRON_RUN_AS_NODE=1` environment variable
- This makes Electron's process.execPath run as pure Node.js instead of relaunching Electron
- No pre-bundling needed - maintains ES module compatibility

### Documentation
- `BUILD.md`: Comprehensive build documentation with troubleshooting
- `README-WINDOWS-BUILD.md`: Quick-start guide for Windows builds
- `LICENSE.txt`: MIT license included in installer