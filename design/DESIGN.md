---
name: EcoPulse Intelligence
colors:
  surface: '#faf8ff'
  surface-dim: '#d2d9f4'
  surface-bright: '#faf8ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f3ff'
  surface-container: '#eaedff'
  surface-container-high: '#e2e7ff'
  surface-container-highest: '#dae2fd'
  on-surface: '#131b2e'
  on-surface-variant: '#3d4a42'
  inverse-surface: '#283044'
  inverse-on-surface: '#eef0ff'
  outline: '#6d7a72'
  outline-variant: '#bccac0'
  surface-tint: '#006c4a'
  primary: '#006948'
  on-primary: '#ffffff'
  primary-container: '#00855d'
  on-primary-container: '#f5fff7'
  inverse-primary: '#68dba9'
  secondary: '#006a61'
  on-secondary: '#ffffff'
  secondary-container: '#86f2e4'
  on-secondary-container: '#006f66'
  tertiary: '#0051d5'
  on-tertiary: '#ffffff'
  tertiary-container: '#316bf3'
  on-tertiary-container: '#fefcff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#85f8c4'
  primary-fixed-dim: '#68dba9'
  on-primary-fixed: '#002114'
  on-primary-fixed-variant: '#005137'
  secondary-fixed: '#89f5e7'
  secondary-fixed-dim: '#6bd8cb'
  on-secondary-fixed: '#00201d'
  on-secondary-fixed-variant: '#005049'
  tertiary-fixed: '#dbe1ff'
  tertiary-fixed-dim: '#b4c5ff'
  on-tertiary-fixed: '#00174b'
  on-tertiary-fixed-variant: '#003ea8'
  background: '#faf8ff'
  on-background: '#131b2e'
  surface-variant: '#dae2fd'
typography:
  display-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 48px
    fontWeight: '800'
    lineHeight: 56px
    letterSpacing: -0.03em
  display-lg-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 34px
    fontWeight: '800'
    lineHeight: 42px
    letterSpacing: -0.02em
  headline-xl:
    fontFamily: Plus Jakarta Sans
    fontSize: 36px
    fontWeight: '700'
    lineHeight: 44px
    letterSpacing: -0.025em
  headline-xl-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 36px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 36px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 22px
    fontWeight: '600'
    lineHeight: 30px
    letterSpacing: -0.015em
  headline-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 26px
    letterSpacing: -0.01em
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 26px
    letterSpacing: -0.005em
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 22px
    letterSpacing: 0em
  body-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 18px
    letterSpacing: 0.005em
  label-lg:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.01em
  label-md:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.02em
  label-sm:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: '700'
    lineHeight: 14px
    letterSpacing: 0.05em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1.5rem
  gutter-mobile: 1rem
  margin: 2rem
  margin-mobile: 1rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2.5rem
---

## Brand & Style

The design system embodies modern ecological stewardship fused with enterprise-grade operational intelligence. Designed for smart city municipal administrators, campus facility managers, sanitation officers, and student innovators, the platform transitions environmental management away from messy, industrial tropes toward a crisp, precision-engineered analytical tool.

The emotional baseline is calculated confidence, immaculate hygiene, and progressive technological control. The interface strikes a balance between:
- **Clean Modernism & Technical Authority:** Vast, airy, high-contrast layouts structured around data density, telemetry status indicators, and real-time sensor streams.
- **Ecological Precision:** Fresh botanical emerald tones combined with clinical seafoam and teal accents, avoiding muddy earth colors in favor of sharp, digital vitality.
- **Tactile Data Clarity:** Semi-flat panels with microscopic borders, luminous container highlights, and disciplined typography engineered for fast incident response.

## Colors

The palette balances clean environmental action with mission-critical monitoring. The primary tone is an intense emerald green (`#059669`) signaling operational vitality and sustainable throughput. The secondary teal (`#0D9488`) supports IoT connectivity states and sanitization parameters, while the tertiary cobalt blue (`#2563EB`) isolates artificial intelligence metrics and automated routing logic.

The foundation avoids pure blinding whites, leveraging a bio-calibrated off-white canvas (`#F8FAFC` to `#F1F5F9`) paired with deep slate neutrals (`#0F172A`) for high-contrast legibility.

### Semantic & Status Application
- **Surface Foundations:** Background `canvas` (`#F8FAFC`), elevated surface panels (`#FFFFFF`), and nested telemetry sub-containers (`#F1F5F9`).
- **Critical Status (Waste Overflow / Sensor Fault):** `#E11D48` (Crimson) on `#FFE4E6` background.
- **Warning Status (Bin Capacity > 80% / Disinfection Due):** `#D97706` (Amber) on `#FEF3C7` background.
- **Operational / Healthy (Sterilized / Active AI Stream):** `#059669` (Emerald) on `#DCFCE7` background.
- **System Borders:** Strict low-contrast structural gray (`#E2E8F0`), active focus borders (`#059669`).

## Typography

The typographic hierarchy uses **Plus Jakarta Sans** for headlines and display layers, bringing a geometric, contemporary authority to analytical readouts, and **Inter** for all data tables, inputs, labels, and analytical metrics where ultra-clean optical legibility is paramount.

### Typographic Rules
- Numeric metrics within IoT status widgets must use tabular numeric lining (`font-feature-settings: 'tnum' on, 'cv05' on`) to eliminate jitter during real-time fill-level updates.
- Metric values (such as capacity percentages, air quality indexes, and microbial levels) leverage `headline-xl` or `headline-lg` combined with an adjacent `label-sm` unit token.
- All badge metadata and system status indicators apply `label-sm` with full uppercase transformation and positive tracking (`0.05em`).

## Layout & Spacing

The layout model is built on an adaptive 12-column responsive fluid grid designed to display large streams of hardware telemetry and route operations without visual clustering.

### Breakpoints & Canvas Bounds
- **Desktop (>= 1280px):** 12-column grid, `margin`: `2rem`, `gutter`: `1.5rem`. Maximum layout canvas bound: `1600px` centered.
- **Tablet (768px - 1279px):** 8-column grid, `margin`: `1.5rem`, `gutter`: `1.25rem`. Complex monitoring matrices collapse from 4-across to 2-across cards.
- **Mobile (< 768px):** 4-column grid, `margin-mobile`: `1rem`, `gutter-mobile`: `1rem`. Side navigation collapses into a dedicated bottom app bar; diagnostic panels stack vertically.

### Rhythm & Density Principles
- Micro-spacing (`space-xs`, `space-sm`) is strictly reserved for interior chip structures, metric-to-label gaps, and sensor status dots.
- Standard structural flow (`space-md`, `space-lg`) dictates inner card padding, form inputs, and modular dashboard widgets.
- Deep separation (`space-xl`) isolates major dashboard domains (e.g., AI classification cameras vs. fleet route maps).

## Elevation & Depth

This system avoids heavy drop shadows, opting for **crisp, low-contrast structural outlines combined with ambient emerald-tinted diffusion** to project an architectural, laboratory-grade aesthetic.

### Depth Hierarchy
1. **Canvas (Base Level):** Raw background tinted in off-white stone (`#F8FAFC`). No elevation.
2. **Surface Containers (Level 1):** Solid `#FFFFFF` backgrounds bound by a 1px border (`#E2E8F0`). Enhanced by an ambient, dispersed shadow: `0px 4px 20px -2px rgba(15, 23, 42, 0.04)`.
3. **Interactive & Hover Cards (Level 2):** Elevated interactive state for smart bin status modules. 1px active border (`#CBD5E1`) with emerald undertone shadow: `0px 8px 24px -4px rgba(5, 150, 105, 0.08)`.
4. **Floating Overlays & AI Telemetry Tooltips (Level 3):** Dropdown selectors, route waypoints, and video feed inspection overlays. Shadow: `0px 16px 36px -6px rgba(15, 23, 42, 0.12)`.
5. **Modal System Windows (Level 4):** Central operational dispatch overlays. Backdrop blur filter of `blur(8px)` with `rgba(15, 23, 42, 0.4)` scrim.

## Shapes

The design uses **Level 2 (Rounded)** shape tokens to reinforce a clean, non-aggressive, yet structured aesthetic suitable for both physical civic interfaces and technical web platforms.

### Shape Distribution
- **Cards, Telemetry Containers & Maps:** `rounded-lg` (1rem / 16px) for approachable boundaries that retain high information packing efficiency.
- **Inputs, Buttons, and Data Selectors:** `rounded` (0.5rem / 8px) to retain technical precision and clear tap target definitions.
- **Status Badges, IoT Fill Rings, and AI Target Nodes:** Completely pill-shaped (`9999px`) to immediately distinguish floating metadata from rectangular content cards.

## Components

### Buttons
- **Primary Action (e.g., "Dispatch Sanitization Unit"):** Solid `#059669` emerald fill, white typography (`label-md`), 0.5rem radius, zero default border. Hover transitions to `#047857` with an ambient glow (`box-shadow: 0 4px 14px rgba(5, 150, 105, 0.35)`). Active state applies a subtle down-scale (`scale: 0.98`).
- **Secondary Action (e.g., "Reroute Fleet"):** Outlined 1px `#0D9488`, transparent background, text color `#0F172A`. Hover fills with `#F0FDFA` (teal 50).
- **Critical Action (e.g., "Trigger Emergency Flush"):** Solid `#E11D48`, white text, with `#FFE4E6` hover aura.

### Status Chips & Badges
- Strict three-element pattern: 6px pulsing ping indicator + uppercase `label-sm` typography + tint background.
- **Bio-Hazard / Contaminated:** Background `#FFE4E6`, text `#9F1239`, border `#FECDD3`.
- **Optimal / Sanitized:** Background `#DCFCE7`, text `#166534`, border `#BBF7D0`.
- **Active AI Classifier:** Background `#EFF6FF`, text `#1E40AF`, border `#BFDBFE`.

### Input Fields & Controls
- **Form Controls:** 40px height, background `#FFFFFF`, border 1px `#CBD5E1`. Inner text `body-md` in `#0F172A`. On focus: 1px border `#059669` coupled with a 3px ring of `#A7F3D0` (emerald 200).
- **Checkboxes & Radios:** 18px box size with 4px border radius for checkboxes, full circle for radios. Default `#CBD5E1` border; selected state fills `#059669` featuring a crisp white geometric icon checkmark.

### Telemetry Cards (Smart Bins & Sanitization Units)
- Structured with a header zone (`label-lg` title, bin ID, and battery/network icon), central metric section (circular progress gauge for fill capacity), and a bottom actions row (last cleaned timestamp and quick dispatch trigger).
- Background `#FFFFFF` with `#E2E8F0` border, elevated to Level 2 on hover.

### AI Waste Classification Card
- Split component featuring a live camera frame overlay with bounding boxes (`#059669` for wet/organic, `#2563EB` for recyclable dry, `#D97706` for hazardous electronic waste) flanked by real-time classification confidence bars (e.g., "Polyethylene Terephthalate - 98.4%").

### Route Optimization Matrix
- Integrated vector map card surrounded by clean telemetry chips specifying current diesel/electric vehicle efficiency, route stops completed, and dynamic obstacle rerouting indicators.