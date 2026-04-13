# UI & Styling Architecture

This project follows the **Senior Frontend Architect Directive**, focusing on premium aesthetics and Zero-Latency UX.

## 🎨 Tailwind CSS v4.0

We use the latest **Tailwind CSS 4.0** engine. Unlike previous versions, it is **CSS-first**, which means theme variables are directly mapped from CSS variables in `globals.css`.

### Key Configuration
- **PostCSS Bridge**: `apps/web/postcss.config.mjs` enables the `@tailwindcss/postcss` plugin, ensuring the Turbopack/Next.js pipeline processes our styles.
- **Theme Variables**: In `apps/web/src/app/globals.css`, we use the `@theme` directive to map HSL color tokens directly to Tailwind utility names (`--color-primary`, `--color-background`, etc.).

## ✨ Premium Effects

We utilize a set of custom, highly polished effects in `src/components/premium/effects.tsx` to achieve a "Wow" factor.

- **BackgroundBeams**: SVG-animated paths with linear gradients that react to the dark theme.
- **TextReveal**: Staggered, spring-based text animations for headlines.
- **Spotlight**: A mouse-following or animated radial glow used in hero sections.
- **GlowCard**: A specialized card component with subtle border and background glow on hover.

## 🖋 Styling Guidelines

1. **Spring Animations**: Always use `framer-motion` with physics-based springs for interactive elements.
   - Recommended: `{ type: "spring", stiffness: 300, damping: 30 }`
2. **Micro-interactions**: Every button and link must have defined `hover:`, `focus-visible:`, `active:`, and `disabled:` states.
3. **No External CSS**: 100% of styling remains in Tailwind utility classes. Do not create new `.css` files unless for global base styles.
4. **Shadcn/Aceternity UI**: Stick to the established primitives in `src/components/ui`. Prioritize consistent padding (`p-6`, `p-4`) and semantic color tokens.

## ⚡ Zero-Latency UX
Where possible, implement **Skeleton Loaders** (e.g., `ProductGridSkeleton`) to provide immediate visual feedback while data is loading.
