# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.5.0] - Unreleased

15 components, 11 sensory dimensions, 5 presets, 8 hooks, 483 tests across 28 test files.

### Added

#### @neuroui/core
- `colorVision` sensory profile field — `'typical'` | `'protanopia'` | `'deuteranopia'` | `'tritanopia'` | `'achromatopsia'` — auto-swaps semantic color palette to CVD-safe values
- `inputMethod` sensory profile field — `'pointer'` | `'keyboard'` | `'touch'` | `'switch'` | `'voice'` — adapts target sizes, focus behavior, and interaction patterns per input method
- `useColorVision` hook — returns `colorVision` type and `needsColorRedundancy` boolean
- `useInputMethod` hook — returns `inputMethod`, `needsLargerTargets`, `needsVisibleLabels`
- `colorSafe` preset — deuteranopia palette, high contrast, enhanced focus
- Color-safe palette system: 4 CVD-specific palettes applied via CSS custom properties (`--neuro-color-success`, `--neuro-color-warning`, `--neuro-color-error`, `--neuro-color-info`)
- `pointer: coarse` media query auto-detection for touch input method
- WCAG AAA (7:1) contrast enforcement when `contrast: 'high'`
- Windows High Contrast Mode (`forced-colors: active`) system color fallbacks

#### @neuroui/components — new components
- `Select` — accessible dropdown with keyboard navigation, label required, error/hint states, sensory-aware
- `Checkbox` — accessible checkbox with 44px click area (includes label), checkmark icon (never color-only), sensory-aware
- `Radio` / `RadioGroup` — accessible radio group with arrow key navigation, filled-dot selected state, sensory-aware
- `Tabs` — accessible tabbed interface with arrow key navigation, overflow dropdown in minimal density, sensory-aware
- `Accordion` — accessible expand/collapse sections with progressive disclosure, single/multiple modes, sensory-aware
- `Alert` — static notification banner with icon + text + border (never color alone), closable option, sensory-aware
- `Badge` — status indicator with semantic icon, CVD-safe palette, minimum readable size
- `Tooltip` — accessible tooltip triggering on hover + focus + touch-hold (never hover-only), sensory-aware timing
- `Table` — accessible data table with sortable columns, striped rows, priority columns in minimal density, sensory-aware typography
- `Navigation` — accessible nav menu with active indicator (not color-only), no hover-only dropdowns, keyboard arrow navigation

#### @neuroui/components — existing component updates
- All 5 existing components now use `--neuro-color-*` CSS variables (palette swaps with `colorVision`)
- All components adapt to `inputMethod` (larger targets for touch/switch, visible labels for voice)
- All components support `forced-colors: active` (Windows High Contrast Mode)

#### @neuroui/cli (new package)
- `npx neuroui init` — project setup and config
- `npx neuroui add <component>` — copy component source into project (shadcn-style)
- `npx neuroui add --all` — add all components
- Component registry with metadata and dependency resolution

#### @neuroui/tailwind (new package)
- Tailwind CSS plugin with 20 `neuro-*` custom variants
- Motion variants: `neuro-motion-none`, `neuro-motion-reduced`, `neuro-motion-full`
- Density variants: `neuro-minimal`, `neuro-detailed`
- Spacing variants: `neuro-relaxed`, `neuro-compact`
- Focus variant: `neuro-focus-enhanced`
- Timing variant: `neuro-patient`
- Contrast variant: `neuro-high-contrast`
- Flash safety variant: `neuro-flash-safe`
- Input method variants: `neuro-touch`, `neuro-keyboard`, `neuro-switch`, `neuro-voice`
- Color vision variants: `neuro-cvd`, `neuro-protanopia`, `neuro-deuteranopia`, `neuro-tritanopia`, `neuro-achromatopsia`

#### Documentation
- Documentation site (Astro + Starlight) with interactive demos
- Interactive sensory profile playground
- Color vision simulator
- Component docs for all 15 components
- Hook docs for all 8 hooks
- Guides: color vision, motor accessibility, Tailwind plugin, AI code generation

### Changed

- `calm` preset updated: `motion` changed from `'reduced'` to `'none'`, added `density: 'minimal'`, `notifications: 'visual'`, `focus: 'enhanced'`
- SensoryProfile now has 11 dimensions (was 9)
- 5 presets (was 4, added `colorSafe`)

---

## [0.1.0] - 2026-02-16

### Added

#### @neuroui/core
- `NeuroProvider` — React context provider that manages sensory profiles, auto-detects OS accessibility settings (`prefers-reduced-motion`, `prefers-contrast`, `forced-colors`), and injects CSS custom properties
- `SensoryProfile` type with 9 dimensions: `motion`, `contrast`, `density`, `notifications`, `font`, `spacing`, `focus`, `timing`, `flashSafety`
- Built-in presets: `default`, `calm`, `focus`, `safe`
- `useNeuro` — access full profile with `setProfile` and `resetProfile`
- `useMotionSafety` — motion level and safety check
- `useCognitiveLoad` — density and layout density check
- `useReadability` — font family, line height, letter/word spacing, ligatures, max line length (BDA guidelines)
- `useFocusMode` — focus mode state and toggle
- `useFlashSafety` — seizure safety check (WCAG 2.3.1)
- CSS custom properties system: `--neuro-transition-duration`, `--neuro-spacing-*`, `--neuro-font-*`, `--neuro-focus-ring-*`, `--neuro-toast-duration`, `--neuro-flash-allowed`, `--neuro-word-spacing`, `--neuro-max-line-length`, `--neuro-font-variant-ligatures`
- `data-neuro-*` attributes on document root for CSS targeting
- localStorage persistence via `persist="localStorage"` prop
- `cn` utility (clsx + tailwind-merge)

#### @neuroui/components
- `Button` — 5 variants (primary, secondary, outline, ghost, danger), 3 sizes, loading state with flash-safe static dots, auto warning icon on danger variant, 44px min touch target
- `Toast` / `ToastProvider` / `Toaster` / `useToast` — 4 variants (info, success, warning, error) with icon + color + text redundancy, pause-on-hover, density-aware display, silent notification suppression
- `Dialog` / `Dialog.Actions` — accessible modal with focus trap, escape-to-close, scroll lock, density-aware padding, motion-aware animation
- `Input` — required label (TypeScript-enforced), hint text, error/success states with icon + text + border (never color alone), readability-aware typography
- `Card` / `Card.Header` / `Card.Body` / `Card.Footer` — 3 variants (default, outlined, elevated), interactive mode with keyboard navigation, spacing-aware sub-components

#### All components
- Respond to all 9 sensory profile dimensions
- `flashSafety: true` suppresses all animation/flashing
- Minimum 44x44px touch targets on interactive elements
- Full keyboard navigation
- Never use color as sole information carrier
- ARIA attributes and semantic HTML
- `data-neuro-component` attributes
- `className` pass-through for Tailwind CSS
- Dark mode support

#### Project
- `llms.txt` for AI/LLM integration
- 264 tests (Vitest + @testing-library/react)
- Full TypeScript strict mode, zero `any` types
- ESM + CJS dual output via tsup
- pnpm workspace monorepo
