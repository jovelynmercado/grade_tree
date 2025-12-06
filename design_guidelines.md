# Design Guidelines: BST Student Grade Management System

## Design Approach

**Selected System:** Material Design 3 (Modern, data-heavy educational tool)

**Rationale:** This is a utility-focused academic management system requiring clear information hierarchy, efficient data entry, and robust table/form patterns. Material Design provides excellent data visualization patterns, accessible form controls, and professional aesthetics suitable for educational institutions.

**Key Design Principles:**
- Clarity over decoration
- Scannable data layouts
- Efficient task completion
- Educational visualization focus

---

## Typography System

**Font Stack:** Google Fonts CDN
- **Primary:** Inter (headings, UI elements) - weights 400, 500, 600, 700
- **Secondary:** JetBrains Mono (BST visualization, Student IDs, technical data) - weights 400, 500

**Type Scale:**
- Page Titles: text-3xl font-semibold (Admin Dashboard, Student Profile)
- Section Headers: text-2xl font-semibold
- Card Titles: text-xl font-medium
- Table Headers: text-sm font-semibold uppercase tracking-wide
- Body Text: text-base
- Helper Text: text-sm
- Captions/Metadata: text-xs

---

## Layout & Spacing System

**Spacing Primitives:** Tailwind units of **2, 4, 6, 8, 12, 16**
- Component padding: p-6
- Card spacing: p-8
- Table cells: px-4 py-3
- Form fields: p-3
- Section margins: mb-8
- Widget gaps: gap-6

**Container Strategy:**
- Dashboard: max-w-7xl mx-auto px-6
- Forms: max-w-2xl
- Full-width tables: w-full with horizontal scroll
- BST Visualizer: Full viewport width container

**Grid Systems:**
- Dashboard Widgets: grid-cols-1 md:grid-cols-2 lg:grid-cols-4
- Student/Subject Cards: grid-cols-1 lg:grid-cols-2
- Forms: Single column, full-width inputs

---

## Component Library

### Navigation & Layout

**Admin Sidebar (Fixed Left):**
- Width: w-64
- Logo section at top (h-16)
- Navigation items with icons (Font Awesome)
- Active state indicator (left border accent)
- Grouped sections: Dashboard, Students, Subjects, Assessments, Reports, Settings

**Top Bar:**
- Height: h-16
- Right-aligned: User profile dropdown, notifications badge
- Breadcrumb navigation for deep pages

**Student Panel Top Navigation:**
- Horizontal nav bar
- Logo left, menu items center, profile right
- Sticky on scroll

### Dashboard Widgets

**Stat Cards (Admin Dashboard):**
- Grid layout: 4 across on desktop
- Each card: p-6, rounded-lg border
- Icon (top-left, large size w-12 h-12)
- Large number display (text-3xl font-bold)
- Label below (text-sm)
- Subtle trend indicator (+/- with small arrow)

**Quick Actions:**
- Floating action buttons OR prominent button group
- Primary actions: "Add Student", "Add Subject", "Record Grades"

### Data Tables

**Students/Subjects/Grades Tables:**
- Full-width responsive tables
- Sticky header (top-0 z-10)
- Alternating row backgrounds for scannability
- Sortable columns (arrow indicators)
- Compact row height (h-12)
- Actions column (right-aligned): Icon buttons for View/Edit/Delete
- Search bar above table (w-full md:w-96)
- Filters: Pill-style chips with x-close
- Pagination: Bottom center, showing "1-50 of 234"

### Forms

**Student/Subject/Assessment Forms:**
- Single column layout (max-w-2xl)
- Field groups with visible section dividers
- Label above input (text-sm font-medium mb-2)
- Input fields: h-11, px-4, rounded-md border
- Required field indicator: Red asterisk
- Helper text below inputs (text-sm)
- Action buttons footer: Cancel (secondary) + Save (primary), right-aligned

**Grade Entry Interface:**
- Table format with editable cells
- Student names fixed left column
- Assessment columns scrollable
- Inline editing: Click to activate input
- Auto-save indicator per cell
- Bulk CSV upload: Prominent button with icon
- Validation: Red border + error message below invalid cells

### BST Visualization

**Layout (Full Screen Modal or Dedicated Page):**
- Left Panel (w-80): Controls
  - Dropdown: "Build BST by: [Student ID / Grade / Score]"
  - Build Tree button (primary, full-width)
  - Toggle switches: Auto-balance, Show Steps
  - Search input with magnifying glass icon
  
- Center Canvas (flex-1):
  - SVG visualization area (min-h-screen)
  - Nodes: Circles with text labels
  - Connecting lines between nodes
  - Animated insert/search highlighting
  - Zoom controls (bottom-right corner)

- Right Panel (w-96): 
  - Operation Logs (scrollable)
  - Monospace font for technical output
  - Step-by-step traversal display
  - Comparison count metrics

**Node Design:**
- Circle shape (r-40px)
- Value inside (font-mono)
- Left/Right child indicators
- Highlight states: Default, Active, Found, Inserted

### Charts & Analytics

**Grade Distribution (Subject Analytics):**
- Bar chart or histogram
- Library: Recharts
- Full width of container
- Legend at top
- Tooltip on hover
- Height: h-80

**Performance Cards:**
- Top Performers: List with rank badges
- Low Performers: Flagged list with warning icons
- Average metrics: Large number with context

### Student Dashboard

**Grade Summary Cards:**
- Per-subject cards in grid
- Subject code + title header
- Assessment breakdown table (compact)
- Final grade prominent (text-4xl, right-aligned)
- PDF download button (icon + "Download Report")

**Profile Section:**
- Avatar placeholder (w-24 h-24 rounded-full)
- Student info: ID, Name, Email
- Enrolled subjects count
- Academic term indicator

---

## Visual Hierarchy & Patterns

**Information Density:**
- Admin: High density (maximize data per screen)
- Student: Medium density (focus on readability)

**Hierarchy Techniques:**
- Size contrast for importance
- Weight variation (medium vs. bold)
- Spacing to group related items
- Borders and dividers sparingly (only where needed)

**Interactive States:**
- Buttons: Standard hover/active (slight darken/scale)
- Table rows: Hover background change
- Form inputs: Focus ring
- Cards: Subtle elevation on hover

**Error & Success States:**
- Form validation: Red border + icon + message
- Success notifications: Toast (top-right, auto-dismiss)
- Empty states: Centered icon + text + CTA

---

## Icon Strategy

**Library:** Font Awesome 6 (CDN)

**Usage Map:**
- Dashboard: chart-line, users, book, clipboard-check
- Navigation: home, user-group, book-open, chart-bar, cog
- Actions: plus, pencil, trash, eye, download
- BST: sitemap, search, rotate
- Status: check-circle, exclamation-triangle

---

## Login Screens

**Layout:**
- Centered card (max-w-md)
- Logo at top
- Role selector tabs: Admin / Student (if needed, or separate routes)
- Email + Password fields
- "Forgot Password" link (text-sm, right-aligned)
- Sign In button (full-width, primary)
- Minimal background (no hero image needed)

---

## Accessibility & Consistency

- All inputs have visible labels
- Sufficient touch targets (min h-11)
- Keyboard navigation support
- Focus indicators clearly visible
- Error messages associated with fields
- Table headers use proper semantic markup
- Consistent button sizing across application

---

## Images

**No hero images required** - This is a utility application focused on functionality over marketing.

**Icon/Logo Usage:**
- Institutional logo in navigation (h-10)
- Empty state illustrations (centered, w-64)
- Profile avatar placeholders