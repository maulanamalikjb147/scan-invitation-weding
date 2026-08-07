---
name: Aurelian Noir
colors:
  surface: '#131410'
  surface-dim: '#131410'
  surface-bright: '#393a35'
  surface-container-lowest: '#0e0f0b'
  surface-container-low: '#1b1c18'
  surface-container: '#1f201c'
  surface-container-high: '#2a2a26'
  surface-container-highest: '#343530'
  on-surface: '#e4e3db'
  on-surface-variant: '#d1c5b4'
  inverse-surface: '#e4e3db'
  inverse-on-surface: '#30312c'
  outline: '#9a8f80'
  outline-variant: '#4e4639'
  surface-tint: '#e9c176'
  primary: '#e9c176'
  on-primary: '#412d00'
  primary-container: '#c5a059'
  on-primary-container: '#4e3700'
  inverse-primary: '#775a19'
  secondary: '#c8c7bf'
  on-secondary: '#30312b'
  secondary-container: '#494943'
  on-secondary-container: '#b9b9b1'
  tertiary: '#c8c7be'
  on-tertiary: '#30312b'
  tertiary-container: '#a6a69d'
  on-tertiary-container: '#3b3c35'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#ffdea5'
  primary-fixed-dim: '#e9c176'
  on-primary-fixed: '#261900'
  on-primary-fixed-variant: '#5d4201'
  secondary-fixed: '#e4e3da'
  secondary-fixed-dim: '#c8c7bf'
  on-secondary-fixed: '#1b1c17'
  on-secondary-fixed-variant: '#474741'
  tertiary-fixed: '#e4e3d9'
  tertiary-fixed-dim: '#c8c7be'
  on-tertiary-fixed: '#1b1c16'
  on-tertiary-fixed-variant: '#474740'
  background: '#131410'
  on-background: '#e4e3db'
  surface-variant: '#343530'
typography:
  display-lg:
    fontFamily: Playfair Display
    fontSize: 64px
    fontWeight: '700'
    lineHeight: 72px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Playfair Display
    fontSize: 40px
    fontWeight: '600'
    lineHeight: 48px
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Playfair Display
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
  headline-md:
    fontFamily: Playfair Display
    fontSize: 24px
    fontWeight: '500'
    lineHeight: 32px
  body-lg:
    fontFamily: Source Serif 4
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Source Serif 4
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
    letterSpacing: 0.05em
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.08em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  base: 8px
  container-max: 1200px
  gutter: 24px
  margin-mobile: 20px
  margin-desktop: 64px
  stack-sm: 12px
  stack-md: 24px
  stack-lg: 48px
---

## Brand & Style

The design system embodies a "Midnight Luxury" aesthetic, blending the intellectual depth of editorial publishing with the exclusivity of a high-end concierge service. It targets an audience that values legacy, precision, and quiet confidence.

The style is a fusion of **Minimalism** and **Modern Corporate**, utilizing expansive whitespace (negative space) to allow the high-contrast typography and gold accents to breathe. The emotional response is one of "Atmospheric Authority"—feeling established, expensive, and meticulously curated. Visual elements are sparse but intentional, favoring structural integrity over decorative clutter.

## Colors

This design system utilizes a high-contrast dark palette. The foundation is `#131410`, a deep, "off-black" olive-toned neutral that provides more warmth and depth than pure black. 

The primary accent is **Sophisticated Gold (#C5A059)**, used exclusively for primary actions, active states, and critical highlights. Secondary and tertiary tones are derived from the neutral base to create subtle layering for containers and surfaces. Text follows a strict hierarchy: high-white for headers and muted parchment tones for supporting copy to reduce eye strain in dark mode.

## Typography

The typographic system is built on a "Serif-on-Serif" pairing to reinforce the editorial feel. **Playfair Display** handles all major headings with dramatic high-contrast strokes. **Source Serif 4** provides exceptional legibility for body text, maintaining the classical aesthetic while ensuring long-form readability.

Functional UI elements (labels, captions, buttons) switch to **Inter**, a neutral sans-serif, to provide clarity and a modern technical edge. Labels should predominantly use uppercase with generous letter spacing to distinguish them from narrative content.

## Layout & Spacing

The layout follows a **Fixed Grid** philosophy for desktop to maintain an "artboard" feel, centering content within a 1200px max-width container. 

A 12-column system is used for desktop (64px margins), collapsing to a 4-column system for mobile (20px margins). Vertical rhythm is strictly enforced through an 8px base unit. Component stacking should lean towards "generous," favoring `stack-lg` (48px) between major sections to prevent the dark interface from feeling cramped.

## Elevation & Depth

In this design system, depth is communicated through **Tonal Layers** rather than traditional shadows. Surfaces closer to the user are lighter in value:
- **Level 0 (Background):** `#131410`
- **Level 1 (Cards/Sheet):** `#1A1B16`
- **Level 2 (Popovers/Modals):** `#262721`

A **Low-contrast outline** of `white / 0.08 opacity` is applied to all Level 1 and Level 2 containers to provide edge definition against the dark background. Shadows, if used, are reserved for the highest level (Modals), appearing as large, soft blurs (`40px blur, 0.4 opacity`) with a slight `#000000` tint.

## Shapes

The shape language is **Soft**, utilizing a 0.25rem (4px) base radius. This minimal rounding retains the architectural strength of sharp corners while subtly removing the "harshness" often associated with digital brutalism. 

Interactive elements like buttons and input fields follow this 4px rule. Large containers (cards) may scale to `rounded-lg` (8px) for a softer peripheral feel. Circular shapes are strictly forbidden except for user avatars and radio buttons.

## Components

- **Buttons:** Primary buttons use a solid `#C5A059` (Gold) fill with `#131410` text. Secondary buttons use a ghost style: a gold 1px border and gold text.
- **Inputs:** Fields use the `#1A1B16` surface color with a bottom-border only (2px) in the inactive state. Upon focus, the border transitions to a full 1px gold outline.
- **Chips:** Small, rectangular shapes with the `label-sm` typography. They use the tertiary background with a 1px gold border only when in an "active" or "selected" state.
- **Lists:** Items are separated by subtle horizontal rules (`white / 0.05 opacity`). Hover states trigger a slight background shift to `#1A1B16`.
- **Cards:** No shadows. Cards use the Level 1 surface color with a 1px perimeter stroke of `white / 0.08`.
- **Navigation:** Active navigation links are indicated by a 2px gold underline or a gold vertical "pip" to the left of the label.