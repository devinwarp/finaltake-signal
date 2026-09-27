---
version: alpha
name: FinalTake
description: A bright, conversion-focused marketing system with bold headlines, airy spacing, and polished gradient CTAs.
colors:
  primary: "#1f7fe0"
  primary-60: "#5aa0e8"
  primary-70: "#3b8fe4"
  secondary: "#13243f"
  tertiary: "#31c48d"
  neutral: "#f9f8f6"
  surface: "#ffffff"
  on-surface: "#13243f"
  muted: "#606876"
  border: "#e7e9ee"
  accent-2: "#f6c445"
  error: "#d64545"
typography:
  headline-display:
    fontFamily: "Plus Jakarta Sans"
    fontSize: "48px"
    fontWeight: 800
    lineHeight: 55.2px
    letterSpacing: "-1.2px"
  headline-lg:
    fontFamily: "Plus Jakarta Sans"
    fontSize: "38px"
    fontWeight: 800
    lineHeight: 40px
    letterSpacing: "-0.9px"
  headline-md:
    fontFamily: "Plus Jakarta Sans"
    fontSize: "29px"
    fontWeight: 700
    lineHeight: 35px
  headline-sm:
    fontFamily: "Noto Sans"
    fontSize: "23px"
    fontWeight: 600
    lineHeight: 28px
  body-lg:
    fontFamily: "Plus Jakarta Sans"
    fontSize: "18px"
    fontWeight: 400
    lineHeight: 28px
  body-md:
    fontFamily: "Plus Jakarta Sans"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: 26px
  body-sm:
    fontFamily: "Plus Jakarta Sans"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: 22px
  label-lg:
    fontFamily: "Plus Jakarta Sans"
    fontSize: "16px"
    fontWeight: 600
    lineHeight: 24px
  label-md:
    fontFamily: "Plus Jakarta Sans"
    fontSize: "14px"
    fontWeight: 600
    lineHeight: 20px
  label-sm:
    fontFamily: "Noto Sans"
    fontSize: "12px"
    fontWeight: 600
    lineHeight: 16px
    letterSpacing: "0.08em"
  overline:
    fontFamily: "Noto Sans"
    fontSize: "12px"
    fontWeight: 700
    lineHeight: 16px
    letterSpacing: "0.12em"
  nav-link:
    fontFamily: "Noto Sans"
    fontSize: "14px"
    fontWeight: 600
    lineHeight: 20px
rounded:
  none: "0px"
  sm: "4px"
  md: "8px"
  lg: "12px"
  xl: "24px"
  full: "9999px"
spacing:
  xs: "6px"
  sm: "16px"
  md: "32px"
  lg: "48px"
  xl: "80px"
  gutter: "24px"
  section: "96px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.surface}"
    typography: "{typography.label-lg}"
    rounded: "{rounded.full}"
    padding: "14px 24px"
    height: "44px"
  button-primary-hover:
    backgroundColor: "{colors.primary-70}"
    textColor: "{colors.surface}"
    typography: "{typography.label-lg}"
    rounded: "{rounded.full}"
    padding: "14px 24px"
    height: "44px"
  button-secondary:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.on-surface}"
    typography: "{typography.label-lg}"
    rounded: "{rounded.full}"
    padding: "14px 24px"
    height: "44px"
  button-link:
    backgroundColor: "transparent"
    textColor: "{colors.muted}"
    typography: "{typography.label-md}"
    rounded: "{rounded.none}"
    padding: "0px"
  card:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.on-surface}"
    rounded: "{rounded.lg}"
    padding: "10px 12px"
  input:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.on-surface}"
    typography: "{typography.body-md}"
    rounded: "{rounded.full}"
    padding: "12px 16px"
  chip:
    backgroundColor: "{colors.neutral}"
    textColor: "{colors.on-surface}"
    typography: "{typography.label-sm}"
    rounded: "{rounded.full}"
    padding: "6px 10px"
  nav-item:
    backgroundColor: "transparent"
    textColor: "{colors.muted}"
    typography: "{typography.nav-link}"
    rounded: "{rounded.none}"
    padding: "0px"
---

# FinalTake

## Overview
FinalTake feels like a modern SaaS launch page: optimistic, polished, and built to convert quickly. The visual tone is professional but lively, with a clean light canvas, strong dark typography, and playful gradient accents that keep the brand feeling creative rather than corporate. The layout is spacious and editorial, using large hero moments and concise supporting copy to guide attention toward primary actions.

## Colors
- **Primary (#1F7FE0):** A bright, confident blue used for the main CTA, interactive accents, and UI emphasis. It signals trust and momentum without becoming heavy.
- **Secondary (#13243F):** A deep navy used for headlines, core body text, and the dark hero mockup. It anchors the system and provides strong contrast against the light background.
- **Tertiary (#31C48D):** A fresh green accent that supports gradient blends and adds a growth-oriented, energetic feel to promotional actions.
- **Neutral (#F9F8F6):** A soft off-white background that keeps the page warm and airy instead of stark. It lets cards, shadows, and dark typography stand out cleanly.
- **Surface (#FFFFFF):** The primary surface color for cards, pills, and buttons. It keeps components crisp and readable across the layout.
- **On-surface (#13243F):** The default text color on white surfaces. Use it for labels, navigation, and standard UI text.
- **Muted (#606876):** A subdued slate used for secondary navigation text, helper copy, and less prominent interface labels.
- **Border (#E7E9EE):** A very light border color for chips, cards, and button outlines. It maintains structure without adding visual noise.
- **Accent-2 (#F6C445):** A warm gold accent visible in gradient compositions and highlight moments. It adds warmth and a subtle celebratory feel.
- **Error (#D64545):** Reserved for validation and destructive states; it should remain rare and highly legible.

## Typography
FinalTake uses two sans-serif families: Plus Jakarta Sans for the main brand voice and Noto Sans for smaller utility and navigation text. Headlines are extremely bold, compact, and slightly tightened with negative letter-spacing, giving the page a strong startup-launch energy. Body copy stays readable and calm with generous line-height, while labels and overlines are more compact and often uppercased or letter-spaced for a refined, editorial feel.

- **headline-display / headline-lg:** Use Plus Jakarta Sans at 48px and 38px with weight 800 for the hero and major section titles.
- **headline-md:** Use Plus Jakarta Sans at 29px with weight 700 for supporting section headings.
- **headline-sm:** Use Noto Sans at 23px with weight 600 for smaller page headings or media titles.
- **body-lg / body-md / body-sm:** Use Plus Jakarta Sans for paragraph text, helper copy, and feature descriptions.
- **label-lg / label-md:** Use Plus Jakarta Sans at medium sizes and semibold weights for buttons and interactive text.
- **label-sm / overline:** Use Noto Sans with uppercase tracking for micro-labels such as section eyebrow text and nav utilities.
- **nav-link:** Use Noto Sans 14px semibold for top navigation items, keeping the header light and functional.

## Layout
The composition uses a wide, centered marketing container with ample horizontal breathing room and a strong left-right hero split. Content is organized into clear vertical bands: navigation, hero, feature proof points, and a subsequent media section. Spacing follows a restrained rhythm based on 6px, 16px, 32px, 48px, and 80px increments, with larger section gaps and tighter intra-component padding.

The overall system feels fluid rather than grid-heavy: cards and buttons align to consistent baselines, but the page allows large asymmetric hero artwork and floating callouts. Section padding should be generous, with large top and bottom spacing around key narrative moments. Cards and small overlays rely on compact internal padding so they read as lightweight layers rather than dense content blocks.

## Elevation & Depth
Elevation is subtle and selective. Most of the page is flat, relying on contrast, whitespace, and borders instead of heavy layering. When depth is needed, it comes from soft drop shadows on buttons, cards, and floating UI snippets, especially around the hero callouts and primary CTA.

Borders are light and often paired with white surfaces to preserve the clean aesthetic. The dark hero mockup creates visual weight through color contrast rather than shadow complexity. Use shadows sparingly and keep them soft; the design should feel crisp, not glossy or material-heavy.

## Shapes
The shape language is rounded and friendly, with pill-shaped buttons and soft 12px card corners. Interactive elements favor a high-radius, approachable look, while small cards and overlays use moderate radii to remain structured. The overall feel is polished and accessible, avoiding sharp geometry and avoiding overly bubbly silhouettes.

## Components
### Buttons
- **Primary button (`button-primary`):** Use the bright blue fill with white text and full pill rounding. It is the dominant CTA and should feel energetic and prominent. Keep padding at 14px 24px and a 44px height for a balanced, tap-friendly target.
- **Primary hover (`button-primary-hover`):** Shift slightly deeper in blue to reinforce interactivity. Maintain the same size, radius, and typography.
- **Secondary button (`button-secondary`):** Use a white background with a light border and dark text. This is the calm alternative CTA, used for actions like “Watch demos.”
- **Link button (`button-link`):** Reserve for low-emphasis utility actions. It should remain text-only, muted, and understated.
- Buttons should retain pill geometry, semibold labels, and soft shadows only on the primary action.

### Cards
- **Card (`card`):** White cards with a light border, 12px radius, and compact padding create the system’s default container style. Use them for small info panels, previews, and media overlays.
- Cards should feel airy and functional, with shadows only when the card is meant to float above the page.

### Inputs
- Inputs should mirror the button and card language: white surface, light border, rounded-full or large-radius corners, and comfortable vertical padding.
- Focus states should be highly visible but not noisy; lean on border color and subtle blue emphasis rather than large glow effects.

### Chips and tags
- Small chips should use neutral fills, rounded-full shapes, and compact label text.
- Keep them visually lightweight so they support hierarchy instead of competing with primary content.

### Navigation
- Navigation items use muted text, simple spacing, and no decorative background.
- The brand mark should remain small and crisp, letting the hero content dominate the page.

### Hero and media treatment
- Large hero headlines should be bold, tightly tracked, and split across lines for emphasis.
- Gradient text accents can be used on standout phrases to echo the CTA’s blue-to-green energy.
- Media/mockup panels should use dark navy fills with minimal internal ornament, so floating cards and labels feel vivid against them.

## Do's and Don'ts
- Do keep the page spacious and editorial, with large gaps around major sections.
- Don't crowd the hero with too many competing elements or dense text blocks.
- Do use Plus Jakarta Sans for primary communication and Noto Sans for utility/navigation details.
- Don't mix too many type styles or introduce serif fonts.
- Do use pill-shaped CTAs with bold color contrast and clear hierarchy.
- Don't replace the primary blue with saturated alternatives that weaken brand recognition.
- Do rely on light borders and soft shadows for depth.
- Don't introduce heavy neumorphism, harsh shadows, or dark card stacks.
- Do keep supporting copy muted and concise.
- Don't let secondary text overpower the headline or primary CTA.