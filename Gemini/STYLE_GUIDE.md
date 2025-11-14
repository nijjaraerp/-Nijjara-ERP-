# Style Guide: Nijjara ERP - Gemini Interface

## 1. Design Philosophy: "Orbital Interface"

The design is based on an "out of space" aesthetic, breaking conventional grid layouts in favor of a dynamic, orbital system. The core concept is a central star representing the main dashboard, with modules as orbiting planets. This creates a sense of exploration and discovery while maintaining an intuitive navigation hierarchy.

- **Layout:** Radial and circular, emphasizing fluid motion.
- **Aesthetic:** Holographic, neon-glow elements over a deep space background.
- **Interactions:** Delightful micro-interactions and fluid, physics-based animations.

## 2. Color Palette: Cosmic Theme

The palette uses a deep space background with vibrant, glowing accent colors for interactive elements.

| Role                | Color Code      | Swatch                                     | Description                                     |
|---------------------|-----------------|--------------------------------------------|-------------------------------------------------|
| **Background**      | `#000010`       | <div style="background:#000010;width:50px;height:20px;border:1px solid #fff;"></div> | Deep, near-black blue for the void of space.    |
| **Primary Glow**    | `#0D9488` (Teal) | <div style="background:#0D9488;width:50px;height:20px;"></div> | Main interactive elements, buttons, active states. |
| **Secondary Glow**  | `#A21CAF` (Fuchsia) | <div style="background:#A21CAF;width:50px;height:20px;"></div> | Secondary actions, highlights, notifications.   |
| **Tertiary Glow**   | `#6D28D9` (Violet) | <div style="background:#6D28D9;width:50px;height:20px;"></div> | Inactive or background orbital paths.           |
| **Font Color**      | `#E5E7EB`       | <div style="background:#E5E7EB;width:50px;height:20px;"></div> | Primary text, ensuring readability.             |
| **Font Secondary**  | `#9CA3AF`       | <div style="background:#9CA3AF;width:50px;height:20px;"></div> | Sub-headings and descriptive text.              |

## 3. Typography

The Cairo font is used for its modern, clean aesthetic which complements the futuristic theme.

- **Font Family:** 'Cairo', sans-serif
- **Headings (h1, h2):** Light weight (300), with a strong neon glow text-shadow.
- **Body Text (p, li):** Regular weight (400).
- **UI Elements (buttons, labels):** Semi-bold weight (600).

## 4. Iconography & Assets

- **Format:** All icons and structural assets are SVG to ensure scalability and crispness.
- **Style:** Minimalist, line-based icons with a subtle glow effect on hover.
- **Planets/Modules:** Represented by circular SVGs with unique radial gradients corresponding to their module type.

## 5. Animation & Micro-interactions

Animations are designed to be fluid and meaningful, guiding the user through the interface.

- **Orbital Motion:** Celestial bodies (modules) move along their paths with a gentle, continuous animation.
- **Hover Effect:**
  - **Orbits:** The orbital path brightens.
  - **Planets:** The planet emits a soft pulse of light and its rotation may speed up slightly.
- **Screen Transitions:** A "warp speed" or "zoom" effect where the selected planet moves to the center and expands, while the background stars streak outwards.
- **Button Clicks:** A subtle, inward press effect with a ripple of light.

## 6. Components

### 6.1. Orbital Nav
- **Description:** The main navigation system. A central element with other elements orbiting it.
- **States:**
  - `default`: Gentle rotation and glow.
  - `hover`: Increased glow, faster rotation.
  - `active`: The element zooms to the center, transforming into the main view for that module.

### 6.2. Holographic Panels
- **Description:** Used for displaying content like forms and tables.
- **Style:** Semi-transparent background with a blurred backdrop (`backdrop-filter: blur(10px)`), a fine neon border, and soft rounded corners.

### 6.3. Neon Buttons
- **Description:** Action buttons.
- **Style:** Text-based with a strong `text-shadow` to create a neon glow. No solid background color.
- **Hover/Click:** The glow intensifies and the text color brightens.
