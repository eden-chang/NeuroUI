# NeuroUI

**React components with built-in cognitive accessibility.**

NeuroUI is an open-source component library where every component automatically adapts to users' sensory preferences. Motion sensitivity, information density, focus needs, reading comfort — handled out of the box.

Built on [W3C COGA design patterns](https://www.w3.org/TR/coga-usable/). Styled with Tailwind CSS. Designed for AI code generation.

---

## Why NeuroUI?

Most UI libraries handle basic WCAG compliance — ARIA attributes, keyboard navigation, screen reader support. That covers part of the picture. Cognitive accessibility is a different problem. Nearly 20% of the global population is neurodivergent, and existing component libraries do very little for them.

NeuroUI fills the gap between WCAG compliance and real cognitive accessibility. W3C published the COGA design patterns years ago. Nobody turned them into React components. Until now.

**What makes it different from other libraries:**

- Components look and feel like any modern UI library. They just behave better.
- Zero extra configuration. Wrap your app in `<NeuroProvider>`, and every component adapts to OS accessibility settings automatically.
- AI-friendly API. Simple, consistent props that code generators produce correctly on the first try.
- Works alongside your existing stack. Use it with shadcn/ui, Radix, Tailwind — no rewrites needed.

---

## Quick Start

### Install

```bash
npm install @neuroui/core @neuroui/components
```

### Wrap your app

```tsx
import { NeuroProvider } from '@neuroui/core';

function App() {
  return (
    <NeuroProvider>
      {/* Your app here */}
    </NeuroProvider>
  );
}
```

That's it. NeuroProvider detects OS settings like `prefers-reduced-motion` and `prefers-contrast`, then passes the right defaults to every NeuroUI component.

### Use components

```tsx
import { Button, Input, Card, Dialog } from '@neuroui/components';
import { useToast } from '@neuroui/components';

function Example() {
  const { toast } = useToast();

  return (
    <Card variant="elevated">
      <Card.Header>Sign Up</Card.Header>
      <Card.Body>
        <Input label="Email" type="email" hint="We won't share this" />
        <Input label="Password" type="password" />
        <Button
          variant="primary"
          onClick={() => toast({ title: 'Account created', variant: 'success' })}
        >
          Create Account
        </Button>
      </Card.Body>
    </Card>
  );
}
```

No accessibility props to remember. The components handle it.

---

## Sensory Profile

NeuroUI organizes accessibility preferences into a single sensory profile.

```typescript
interface SensoryProfile {
  motion: 'none' | 'reduced' | 'full';
  contrast: 'low' | 'normal' | 'high';
  density: 'minimal' | 'normal' | 'detailed';
  notifications: 'silent' | 'visual' | 'audio' | 'all';
  font: 'default' | 'dyslexia-friendly' | 'monospace';
  spacing: 'compact' | 'normal' | 'relaxed';
  focus: 'standard' | 'enhanced';
  timing: 'patient' | 'normal' | 'quick';
  flashSafety: boolean;
  colorVision: 'typical' | 'protanopia' | 'deuteranopia' | 'tritanopia' | 'achromatopsia';
  inputMethod: 'pointer' | 'keyboard' | 'touch' | 'switch' | 'voice';
}
```

### Auto-detection

NeuroProvider reads OS-level settings on mount:

| OS / Browser Setting | Profile Value |
|---|---|
| `prefers-reduced-motion: reduce` | `motion: 'reduced'` |
| `prefers-contrast: more` | `contrast: 'high'` |
| `prefers-contrast: less` | `contrast: 'low'` |

### Manual overrides

```tsx
<NeuroProvider profile={{ motion: 'none', density: 'minimal', timing: 'patient' }}>
  <App />
</NeuroProvider>
```

### Presets

```tsx
<NeuroProvider preset="calm">   {/* reduced motion, relaxed spacing, patient timing */}
<NeuroProvider preset="focus">  {/* enhanced focus rings, minimal density */}
```

---

## Hooks

Access the sensory profile from anywhere in your component tree.

```typescript
import { useNeuro, useMotionSafety, useCognitiveLoad, useReadability, useFocusMode } from '@neuroui/core';

// Full profile access
const { profile, setProfile, resetProfile } = useNeuro();

// Specific hooks
const { motionLevel, isMotionSafe } = useMotionSafety();
const { density, isDenseLayout } = useCognitiveLoad();
const { fontFamily, lineHeight, letterSpacing } = useReadability();
const { isFocusMode, toggleFocusMode } = useFocusMode();
```

Use these hooks to apply sensory-aware behavior to your own components — not just NeuroUI ones.

---

## Components

### Button

```tsx
<Button variant="primary" size="md">Save</Button>
<Button variant="danger" loading>Deleting...</Button>
<Button variant="outline" icon={<PlusIcon />}>Add Item</Button>
```

Variants: `primary` · `secondary` · `outline` · `ghost` · `danger`
Sizes: `sm` · `md` · `lg`

Sensory adaptations:
- Motion sensitivity → animations scale down or turn off
- Enhanced focus → larger, higher-contrast focus ring
- Minimum 44x44px touch target at all sizes

### Toast

```tsx
const { toast } = useToast();

toast({ title: 'File uploaded', variant: 'success' });
toast({ title: 'Error', description: 'Upload failed', variant: 'error' });
```

Variants: `info` · `success` · `warning` · `error`

Sensory adaptations:
- Patient timing → duration doubles, close button always visible, pauses on hover
- Minimal density → title only, one toast at a time
- Silent notifications → toasts are suppressed, queued for review
- No motion → appears instantly with no slide animation

### Dialog

```tsx
<Dialog open={open} onOpenChange={setOpen} title="Confirm deletion">
  <p>This action cannot be undone.</p>
  <Dialog.Actions>
    <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
    <Button variant="danger" onClick={handleDelete}>Delete</Button>
  </Dialog.Actions>
</Dialog>
```

Sensory adaptations:
- Motion sensitivity → fade only, no scale animation
- Enhanced focus → stronger backdrop dimming, visible focus trap
- Close button is always visible, never hidden behind gestures

### Input

```tsx
<Input label="Full name" placeholder="Jane Doe" />
<Input label="Email" type="email" hint="Used for account recovery" />
<Input label="Username" error="Already taken" />
```

Note: `label` is a required prop. NeuroUI enforces this at the type level. Placeholder-only inputs are a cognitive accessibility failure.

Sensory adaptations:
- Error states always use icon + text, never color alone
- Relaxed spacing → larger padding and font size
- Dyslexia-friendly font → applies when set in profile
- Enhanced focus → stronger focus ring, label always visible

### Card

```tsx
<Card variant="elevated" interactive>
  <Card.Header>Project Update</Card.Header>
  <Card.Body>Sprint 4 is complete.</Card.Body>
  <Card.Footer>
    <Button variant="ghost" size="sm">View Details</Button>
  </Card.Footer>
</Card>
```

Variants: `default` · `outlined` · `elevated`

Sensory adaptations:
- No motion → hover effects disabled
- Minimal density → increased padding
- Interactive cards are keyboard-navigable with clear focus indicators

---

## How It Works Under the Hood

NeuroProvider sets CSS custom properties on its root element. These properties change based on the active sensory profile.

```css
[data-neuro] {
  --neuro-transition-duration: 200ms;
  --neuro-spacing-base: 1rem;
  --neuro-font-family: system-ui, sans-serif;
  --neuro-line-height: 1.5;
  --neuro-focus-ring-width: 2px;
  --neuro-focus-ring-color: #2563eb;
}

/* When motion is set to 'none' */
[data-neuro-motion="none"] {
  --neuro-transition-duration: 0ms;
}

/* When spacing is set to 'relaxed' */
[data-neuro-spacing="relaxed"] {
  --neuro-spacing-base: 1.25rem;
  --neuro-line-height: 1.8;
}
```

Components consume these properties internally. You can also use them in your own CSS or Tailwind classes to build sensory-aware custom components.

---

## For AI Code Generators

NeuroUI ships with an `llms.txt` file that describes the full API in a format optimized for LLMs. If you use Cursor, Claude, Copilot, or similar tools, point them to the NeuroUI docs and they will generate correct code on the first try.

**Key rules for AI-generated code:**

1. Always wrap the app root with `<NeuroProvider>`.
2. Always provide a `label` prop for `Input`.
3. Use semantic variants (`variant="danger"`) instead of custom red styling.
4. Do not add custom motion or animation CSS. Components handle motion based on user preferences.
5. Use `className` for additional Tailwind styling.

---

## COGA Design Patterns

Every component maps to specific [W3C COGA objectives](https://www.w3.org/TR/coga-usable/).

| Objective | How NeuroUI Implements It |
|---|---|
| Help users focus | Enhanced focus mode, single-toast limit, FocusGuard |
| Provide clear feedback | Distinct button states, toast system, input error states |
| Support user preferences | SensoryProfile, OS auto-detection, manual overrides |
| Minimize cognitive load | Density settings, progressive disclosure |
| Allow enough time | Patient timing mode, pause-on-hover toasts |
| Prevent errors | Required input labels, confirmation dialogs |
| Use clear visual structure | Card hierarchy, consistent spacing |
| Make controls obvious | 44x44px minimum targets, always-visible close buttons |

---

## Roadmap

### v0.1 — Core Safety + Cognitive Accessibility

5 components (Button, Toast, Dialog, Input, Card), 9 sensory profile dimensions, 4 presets, 6 hooks, 264 tests. Covers: ADHD, autism, seizure disorders, motor disabilities, low vision, color blindness baseline, anxiety, dyslexia typography, hearing loss.

### v0.5 (current) — Visual Accessibility + Extended Components

15 components, 11 sensory profile dimensions, 5 presets, 8 hooks, 483 tests. Adds:

- **Color vision profiles**: `colorVision` field with CVD-safe palettes for protanopia, deuteranopia, tritanopia, achromatopsia
- **Input method awareness**: `inputMethod` field adapts targets, focus, and interaction for pointer/keyboard/touch/switch/voice
- **High contrast enforcement**: WCAG AAA (7:1) ratios when `contrast: 'high'`, Windows High Contrast Mode support
- **10 new components**: Select, Checkbox, Radio, Tabs, Accordion, Alert, Badge, Tooltip, Table, Navigation
- **@neuroui/cli**: `npx neuroui add <component>` — shadcn-style component installation
- **@neuroui/tailwind**: Tailwind plugin with `neuro-*` custom variants
- **Documentation site**: Astro + Starlight with component docs, hook docs, and guides

### v1.0 — Comprehensive Coverage

ESLint plugin, Figma tokens, simple language mode, ClearStep multi-step forms, date/number formatting, full COGA coverage, preference persistence, onboarding flow.

### v2.0 — Cross-Platform

React Native, Vue/Svelte ports, cross-device profile sync, AI-powered adaptive profiles.

---

## Contributing

Contributions are welcome. See [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines.

NeuroUI values feedback from neurodivergent users above all else. If you have ADHD, autism, dyslexia, or any other form of neurodivergence and want to share how these components work (or don't work) for you, please open an issue. Your experience shapes this project.

---

## License

[MIT](./LICENSE)
