# Network Documentation App Design Guidelines

## Design Approach
**System:** Material Design-inspired with Carbon Design System influences for data-heavy enterprise applications
**Rationale:** Professional IT tool requiring clarity, efficiency, and robust data visualization. Drawing from enterprise network management tools like Cisco DNA Center and monitoring dashboards.

## Core Design Principles
1. **Information Hierarchy** - Critical network data must be immediately scannable
2. **Dense but Organized** - Maximize data display without overwhelming users
3. **Quick Actions** - Common tasks (add device, edit port) accessible within 1-2 clicks
4. **Visual Status Indicators** - Network health visible at a glance

## Typography
- **Primary Font:** Inter (Google Fonts) - Excellent legibility for technical data
- **Headers:** Font weight 600, sizes: text-2xl (dashboard), text-xl (sections), text-lg (cards)
- **Body Text:** Font weight 400, text-sm for data tables, text-base for forms
- **Technical Data:** Font weight 500, mono font (Roboto Mono) for IP addresses, MAC addresses, port numbers

## Layout System
**Spacing Units:** Tailwind 2, 4, 6, 8, 12 for consistent rhythm
- Component padding: p-4 to p-6
- Section margins: mb-6 to mb-8
- Card spacing: gap-4 to gap-6 in grids

## Application Structure

### Dashboard Layout (Landing Page)
**Top Navigation Bar** (h-16, border-b)
- Logo/app name on left
- Global search bar (max-w-md, centered area)
- Quick action button "Add Device" (primary)
- User avatar/settings on right

**Main Content Area** (two-column when space allows)
Left sidebar (w-64, border-r, sticky):
- Navigation sections: Dashboard, Devices, Topology, Ports, Locations
- Active state indicators
- Collapsible on mobile

Main panel (flex-1, p-6):
- Stats overview cards (grid-cols-1 md:grid-cols-4, gap-4)
  - Total Devices (with icon)
  - Active Ports (with icon)
  - Locations (with icon)
  - Critical Alerts (with icon)
- Recent activity section
- Quick access device list (first 10 items, link to full view)

### Device Management Pages

**Device List View**
- Action bar: Search input, filter dropdowns (Type, Location, Status), "Add Device" button
- Data table with columns: Device Name, Type (with icon), IP Address, Location, Ports, Status (badge), Actions
- Rows: hover state, clickable to device detail
- Pagination controls at bottom
- Sortable column headers

**Device Detail View**
- Breadcrumb navigation
- Device header card:
  - Device name (text-2xl), edit/delete icons
  - Grid layout (2 columns): Model, IP, MAC, Location, Status, Last Updated
- Tabs: Overview, Ports, Connections, Configuration
- Port table showing all ports with: Port Number, Type, Status, Connected To, Speed
- Visual port map (if applicable) - grid showing port layout

**Network Topology View**
- Full-screen canvas area
- Toolbar: Zoom controls, view options (grid/list), filter by type
- Interactive SVG/Canvas visualization
  - Nodes represent devices (different shapes/sizes by type)
  - Lines represent connections
  - Hover shows device info tooltip
  - Click opens device detail sidebar
- Legend showing device types and connection states

### Forms (Add/Edit Device)
Modal overlay (max-w-2xl):
- Clear header with title and close button
- Form sections with subtle dividers
- Input groups: Label (text-sm, font-medium, mb-1), Input (p-2, border, rounded)
- Required field indicators
- Form fields: Device Name, Type (dropdown), Model, IP Address, MAC Address, Location (dropdown), Description (textarea)
- Footer: Cancel (secondary) and Save (primary) buttons

## Component Library

**Cards:** rounded-lg, border, p-4 to p-6, shadow-sm, hover:shadow-md transition
**Buttons:** 
- Primary: px-4, py-2, rounded-md, font-medium
- Secondary: outlined variant
- Icon buttons: p-2, rounded for actions

**Tables:** 
- Header row: font-medium, border-b-2
- Rows: border-b, hover state
- Compact spacing: py-2, px-4

**Status Badges:** 
- Rounded-full, px-3, py-1, text-xs, font-medium
- States: Active, Inactive, Error, Maintenance

**Icons:** Heroicons (via CDN) - outline style for UI, solid for status indicators

**Search Input:** 
- Icon prefix (magnifying glass)
- Rounded-lg, border
- Placeholder text

**Dropdowns/Selects:**
- Consistent with input styling
- Chevron icon indicator

## Network Topology Visualization
- Device nodes: Rectangles (switches), circles (routers), rounded squares (access points)
- Connection lines: Different styles for cable types (solid, dashed)
- Interactive: Drag to reposition, zoom/pan controls
- Mini-map in corner for navigation

## Responsive Behavior
- Desktop (lg+): Full sidebar + main content
- Tablet (md): Collapsible sidebar, stack stats 2x2
- Mobile: Hidden sidebar (hamburger menu), stack all cards single column, simplified table view (card-based)

## No Hero Image
This is a utility dashboard - no marketing hero needed. Application opens directly to functional dashboard.

## Data Visualization
Use simple, clean charts where helpful:
- Device distribution (donut chart)
- Port utilization (horizontal bar)
- Keep visualizations minimal, data-focused