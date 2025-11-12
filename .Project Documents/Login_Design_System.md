# Nijjara Login Design System

Version: 1.0

## Typography
- Primary Arabic font: Cairo (weights: 400 Regular, 600 SemiBold, 700 Bold)
- English fallback: system-ui, Segoe UI, Roboto
- Header:
  - Brand title: 48px (≈36pt), Cairo 700
  - Subtitle: 18px (≈14pt), Cairo 400
- Inputs & Button: 18px label text (Cairo 600 for button)

## Spacing
- Vertical spacing between header elements: 8px
- Input padding: 16px
- Input height: 48px
- Button min-width: 200px; height: 48px

## Colors
- Brand primary: #1e3a8a
- Brand hover: #2b4db5
- Brand focus: #3b82f6
- Error red: #dc2626
- Text primary: #ffffff
- Text muted: rgba(255,255,255,0.7)
- Background: dark blue/black gradient with particle orbs

## Components
### Input Field
- Height 48px; padding 16px; border-radius 2px
- States:
  - Normal: border 1.5px var(--color-text-muted), bg rgba(0,0,0,0.35)
  - Focus: border var(--brand-primary-focus), outline glow rgba(59,130,246,0.35)
  - Error: border var(--error-red), outline glow rgba(220,38,38,0.35)
- Placeholder (Arabic):
  - Username: "اسم المستخدم"
  - Password: "كلمة المرور"
- Text alignment: right (RTL)

### Header
- Remove legacy green boot text
- Centered brand title and subtitle
- Cairo font weights as specified

### Button
- Label: "تسجيل الدخول" (Arabic)
- Font: Cairo 600, 18px
- Min width: 200px; Height: 48px
- Background: brand primary; hover: brand hover; focus: brand focus with focus ring

## Background Animation
- Cinematic pan/zoom using CSS transforms (scale + slight translate3d)
- Duration: ~40s cycles; cross-fade across 3 scenes
- Hardware acceleration: will-change transform, opacity
- Reduced motion: disables animations, sets static low-opacity backdrop
- Asset format: WebP (scene1.webp, scene2.webp, scene3.webp)

## Accessibility
- WCAG 2.1 AA contrast ensured for text/buttons on dark background
- Focus ring visible and non-color-only cues
- Touch targets: >=48x48px (inputs, button)
- Arabic RTL tested: dir="rtl" on header and boot screen
- prefers-reduced-motion compliant

## Responsive
- Mobile: centered header, inputs full width, particle/cinematic scaling
- Desktop: consistent spacing and typography; header remains centered

## Implementation Notes
- Fonts loaded via Google Fonts Cairo
- Assets referenced at: frontend/Background Files/dist/scene{1..3}.webp (placeholders)
- If assets missing, backdrop gracefully degrades to particles
