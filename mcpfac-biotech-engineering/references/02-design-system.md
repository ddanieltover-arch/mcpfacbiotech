# Volume 2 — UI/UX Design System, Component Library, Layout Standards, Brand Guidelines

## Design Philosophy

The site should read as a modern international biotechnology company, not a
generic online shop — closer to a hybrid of Sigma Aldrich, Thermo Fisher
Scientific, and Merck Life Science, with modern SaaS-dashboard and
Apple-level UI consistency. It should immediately communicate: scientific
precision, trust, professionalism, innovation, laboratory excellence,
premium quality, global distribution, research focus.

**Every page should be:** beautiful, fast, easy to use, scientifically
professional, conversion-focused. Every interface decision should reduce
cognitive load.

## Brand Identity

- Brand name: MCPFAC BIOTECH
- Use the supplied company logo as-is throughout — do not redraw or alter it.
- Extract the primary color palette from the logo and apply it consistently
  across the design system.

## Color System

Palette derived from the logo:

- **Primary — Deep Laboratory Green:** buttons, navigation, links, icons, highlights, active states
- **Secondary — Natural Green:** cards, badges, progress indicators, product highlights, success messages
- **Accent — Leaf Green:** used sparingly — hover states, interactive elements, notifications, scientific illustrations
- **Background:** pure white, light laboratory grey, very soft green tint. Keep the interface clean; avoid dark backgrounds except where specifically required.
- **Neutral palette:** white, off-white, light grey, medium grey, dark grey, black — used to create hierarchy.
- **Status colors:** success = emerald green, warning = amber, error = soft red, information = blue.

## Typography

- Primary font: Inter
- Secondary font: Manrope
- Fallback: system-ui
- Font scale: Display → Hero Headlines → Page Titles → Section Titles → Card
  Titles → Body Large → Body → Caption → Small Labels → Button Labels → Navigation
- Maintain consistent vertical rhythm across all pages.

## Spacing System

8-point spacing scale. Allowed increments (px): 4, 8, 12, 16, 20, 24, 32, 40,
48, 64, 80, 96. Avoid arbitrary spacing values.

## Border Radius

Consistent scale: Small, Medium, Large, Extra Large, Rounded Full. Buttons,
inputs, cards, and dialogs should share the same radius language.

## Shadow System

Subtle elevation only — avoid harsh shadows:
- Level 1 — cards
- Level 2 — hover
- Level 3 — dialogs
- Level 4 — navigation

## Iconography

Lucide React. Icons should be minimal, consistent, outlined, professional,
and scientifically appropriate.

## Imagery

High-quality laboratory imagery only — scientists, laboratories,
microscopes, DNA, cells, peptides, research equipment, glassware,
biotechnology, chemical structures, laboratory processes. Avoid generic
stock imagery where possible.

## Illustrations

Minimal line work: scientific diagrams, DNA strands, molecular structures,
lab equipment, research workflows. No cartoon-style graphics.

## Button System

- **Primary:** filled, green background, white text, rounded, hover
  animation, loading/disabled/focus states
- **Secondary:** outlined, green border, transparent background, hover fill
- **Ghost:** transparent, minimal, used in navigation
- **Danger:** red, requires confirmation

## Input Components

Every form control must support: normal, hover, focused, error, success,
disabled, loading, required, optional, autocomplete, keyboard navigation.

## Card Design

Rounded corners, soft shadow, hover elevation, consistent padding,
responsive layout, optional image, optional actions, loading skeleton.

## Product Card

Displays: product image, product name, SKU, purity, CAS number, price or
"Request Quote", availability, wishlist button, compare button, quick view,
add to cart, hover animation.

## Product Detail Page

Contains: product gallery with image zoom, breadcrumb, category, product
title, product code, availability, purity, CAS number, molecular formula,
molecular weight, sequence, storage, solubility, description,
specifications, downloads (COA / MSDS / HPLC), shipping information,
research disclaimer, FAQ, related products, recently viewed, frequently
bought together, review section, quote request, add to wishlist, compare,
add to cart.

> Note: downloadable documents (COA/MSDS/HPLC) and the "research disclaimer"
> copy are content the platform *distributes* — see the Scope Note in
> Volume 1 regarding who authors that content. The engineering work here is
> the download/document-management feature, not authoring the documents.

## Navigation

**Desktop:** sticky header, mega menu, dropdown categories, search bar,
wishlist, compare, cart, customer menu, language selector, contact button.

**Mobile:** drawer menu, sticky bottom actions, search, wishlist, cart,
profile, responsive categories.

## Footer

Company information, quick links, product categories, research resources,
downloads, blog, FAQ, contact, email, newsletter, copyright, privacy
policy, terms, shipping policy, returns.

## Homepage Structure

Hero → company introduction → featured categories → featured products →
"why choose MCPFAC" → research standards → quality assurance → certificates
→ laboratory process → global shipping → research articles → testimonials →
newsletter → footer.

## Category Page

Banner, category description, filter sidebar, sort, search, grid/list
toggle, pagination, product cards, related categories, FAQ.

## Search Experience

Instant search, search suggestions, popular searches, category suggestions,
recent searches, no-result recommendations.

## Filter System

Filters: category, purity, availability, price, research type, application,
sequence length, storage condition, molecular weight, CAS number.
Sort by: newest, most popular, A–Z, price.

## Animation System

Framer Motion only. Animations must be fast, natural, professional, subtle:
fade in, slide up, scale, hover lift, button ripple, page transition,
skeleton loading. Never over-animate.

## Responsive Breakpoints

Mobile, tablet, laptop, desktop, ultra-wide — every page optimized for all
viewport sizes.

## Accessibility

Every component must include: ARIA labels, keyboard support, focus
indicators, semantic HTML, screen reader compatibility, proper contrast
ratios, accessible form validation.

## Component Library

Reusable components to define: Header, Footer, Sidebar, Breadcrumb, Hero,
Button, Input, Textarea, Select, Checkbox, Radio, Switch, Badge, Tag, Card,
Product Card, Category Card, Article Card, Modal, Drawer, Popover, Tooltip,
Dropdown, Accordion, Tabs, Pagination, Table, Toast, Alert, Skeleton,
Loader, Carousel, Image Gallery, Search Bar, Filter Panel, Timeline,
Statistics Card, Newsletter Form, Contact Form, Quote Form, Login Form,
Register Form, Forgot Password Form, Profile Card, Order Card, Invoice
Card, Download Card, Support Ticket Card, Review Card, FAQ Accordion.

## Page Design Consistency

Every page follows the same design language. Never redesign components
differently on separate pages — reuse components and maintain consistent
spacing, typography, colors, interactions, and animations across the whole
app.

## Design Review Checklist

Before considering any page complete, verify: visual consistency,
responsive layout, accessibility, loading states, empty states, error
states, hover interactions, keyboard navigation, mobile usability,
performance, scientific branding, professional appearance. If anything
fails, refine before proceeding.

## UI Generation Rules

When generating any new page:

1. Reuse existing components.
2. Avoid duplicate UI patterns.
3. Prefer composition over custom implementations.
4. Keep layouts clean and spacious.
5. Optimize for desktop and mobile simultaneously.
6. Use scientific imagery and iconography appropriately.
7. Ensure every interaction has clear visual feedback.
8. Follow the established design tokens for colors, spacing, typography, and elevation.
