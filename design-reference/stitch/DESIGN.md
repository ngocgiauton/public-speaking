---
name: Champion Oratory
colors:
  surface: '#fcf9f8'
  surface-dim: '#dcd9d9'
  surface-bright: '#fcf9f8'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f6f3f2'
  surface-container: '#f0eded'
  surface-container-high: '#eae7e7'
  surface-container-highest: '#e5e2e1'
  on-surface: '#1b1c1c'
  on-surface-variant: '#4f4632'
  inverse-surface: '#303030'
  inverse-on-surface: '#f3f0ef'
  outline: '#827660'
  outline-variant: '#d4c5ab'
  surface-tint: '#785900'
  primary: '#785900'
  on-primary: '#ffffff'
  primary-container: '#ffc107'
  on-primary-container: '#6d5100'
  inverse-primary: '#fabd00'
  secondary: '#b81311'
  on-secondary: '#ffffff'
  secondary-container: '#dc3128'
  on-secondary-container: '#fffbff'
  tertiary: '#8b5000'
  on-tertiary: '#ffffff'
  tertiary-container: '#ffbe7e'
  on-tertiary-container: '#7e4900'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#ffdf9e'
  primary-fixed-dim: '#fabd00'
  on-primary-fixed: '#261a00'
  on-primary-fixed-variant: '#5b4300'
  secondary-fixed: '#ffdad5'
  secondary-fixed-dim: '#ffb4a9'
  on-secondary-fixed: '#410001'
  on-secondary-fixed-variant: '#930005'
  tertiary-fixed: '#ffdcbe'
  tertiary-fixed-dim: '#ffb870'
  on-tertiary-fixed: '#2c1600'
  on-tertiary-fixed-variant: '#693c00'
  background: '#fcf9f8'
  on-background: '#1b1c1c'
  surface-variant: '#e5e2e1'
typography:
  display-lg:
    fontFamily: Be Vietnam Pro
    fontSize: 48px
    fontWeight: '800'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Be Vietnam Pro
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
  headline-lg-mobile:
    fontFamily: Be Vietnam Pro
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 36px
  headline-md:
    fontFamily: Be Vietnam Pro
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  body-lg:
    fontFamily: Be Vietnam Pro
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Be Vietnam Pro
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-md:
    fontFamily: Be Vietnam Pro
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.01em
  label-sm:
    fontFamily: Be Vietnam Pro
    fontSize: 12px
    fontWeight: '700'
    lineHeight: 16px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 8px
  xs: 4px
  sm: 12px
  md: 24px
  lg: 48px
  xl: 80px
  gutter: 24px
  margin-mobile: 16px
  margin-desktop: 64px
---

## Brand & Style

The brand personality is **vibrant, courageous, and empowering**. It captures the energy of a child standing in the spotlight for the first time—full of warmth and budding confidence. The visual style is **Modern & High-Contrast**, utilizing a warm, sun-drenched palette to evoke optimism. 

To maintain a professional edge for parents while remaining approachable for children, the design system employs generous whitespace, thick purposeful strokes, and friendly rounded geometry. The absence of blue ensures a unique, warm-toned identity that feels like a constant "golden hour" of achievement. The emotional response should be one of "enthusiastic support"—a safe yet exciting space to find one's voice.

## Colors

The palette is derived from the warmth of a stage spotlight.
- **Primary (Gold/Yellow):** Used for key brand moments, primary CTAs, and highlighting achievements. It represents the "Gold Medal" standard.
- **Secondary (Red):** Used for urgent interactions, energetic accents, and secondary buttons. It provides the "pop" needed to break up the warmth.
- **Tertiary (Orange):** Acts as a bridge between yellow and red, used for progress bars, decorative elements, and energetic backgrounds.
- **Neutral:** A deep charcoal (not pure black) is used for text to maintain readability without harshness. 
- **Light Grey/White:** Used for surfaces and backgrounds to ensure the vibrant accents remain the hero of the interface.

**Strict Guideline:** Under no circumstances should any shade of blue or cool-toned violet be introduced to the interface.

## Typography

This design system uses **Be Vietnam Pro** exclusively to achieve a balance between "friendly" and "professional." 
- **Headlines:** Use heavy weights (700-800) with slight negative letter-spacing to create a "bold voice" effect.
- **Body:** Standard weights are used for readability, with 18px as the default for long-form content to accommodate younger readers.
- **Hierarchy:** Dramatic scale differences between headlines and body text emphasize the importance of the spoken word.

## Layout & Spacing

The layout follows a **Fluid Grid** system with an 8px base unit. 
- **Desktop:** 12-column grid with a maximum content width of 1280px.
- **Tablet:** 8-column grid with 24px margins.
- **Mobile:** 4-column grid with 16px margins.

The spacing rhythm is intentional: large "XL" gaps are used between major content sections to keep the UI from feeling overwhelming, while "MD" spacing is used within components to maintain a tight, organized structure. Components should feel "chunky" and easy to tap.

## Elevation & Depth

Visual hierarchy is achieved through **Tonal Layers** and **Ambient Shadows**.
- **Surface Elevation:** Instead of heavy shadows, use slight color shifts (e.g., a white card on a very light grey background) to define containers.
- **Shadows:** When depth is required (e.g., for buttons or active cards), use a warm-tinted shadow: `box-shadow: 0 8px 24px rgba(255, 152, 0, 0.15)`. This keeps the shadows "sunny" rather than "muddy."
- **Focus:** Active elements may use a subtle 2px solid Orange border instead of a shadow to maintain a clean, modern look.

## Shapes

The shape language is **Rounded**, communicating safety and approachability. 
- **Standard UI elements:** (Inputs, Small Buttons) use a `0.5rem` radius.
- **Large Containers:** (Cards, Hero sections) use a `1rem` (rounded-lg) radius.
- **Interactive Pill:** Secondary buttons and chips can utilize a fully rounded `9999px` radius to emphasize their "clickable" nature.

## Components

- **Buttons:** Primary buttons are Gold (#FFC107) with Bold Neutral text. Secondary buttons use an Orange (#FF9800) outline. All buttons have a minimum height of 48px to be "kid-friendly."
- **Chips:** Used for categories (e.g., "Beginner," "Advanced"). These use a Red (#F44336) background with white text or a light-orange tint background.
- **Cards:** Always white with a 1px soft-grey border or a very diffused warm shadow. Cards should have `24px` internal padding.
- **Input Fields:** Large, 16px text, with a 2px border that turns Gold when focused. Labels sit above the field in a bold, smaller font.
- **Checkboxes/Radios:** Use the Gold primary color for the "checked" state. Ensure the hit-box is at least 44x44px.
- **Progress Bars:** Thick 12px bars using an Orange-to-Yellow gradient to show movement and energy as students complete speech milestones.