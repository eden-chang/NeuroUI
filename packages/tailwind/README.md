# @neuroui/tailwind

Tailwind CSS plugin for NeuroUI sensory-adaptive variants.

## Installation

```bash
npm install @neuroui/tailwind
# or
pnpm add @neuroui/tailwind
```

## Usage

Add the plugin to your `tailwind.config.js`:

```js
import neuroPlugin from '@neuroui/tailwind';

export default {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  plugins: [neuroPlugin],
};
```

## Available Variants

The plugin adds the following variant selectors that respond to NeuroUI data attributes:

### Motion

- `neuro-motion-none:` - No animations
- `neuro-motion-reduced:` - Reduced motion
- `neuro-motion-full:` - Full animations

### Density

- `neuro-minimal:` - Minimal information density
- `neuro-detailed:` - Detailed information density

### Spacing

- `neuro-compact:` - Compact spacing
- `neuro-relaxed:` - Relaxed spacing

### Focus

- `neuro-focus-enhanced:` - Enhanced focus indicators

### Timing

- `neuro-patient:` - Slower timing for interactions

### Contrast

- `neuro-high-contrast:` - High contrast mode

### Flash Safety

- `neuro-flash-safe:` - Flash safety enabled

### Input Methods

- `neuro-touch:` - Touch input
- `neuro-keyboard:` - Keyboard input
- `neuro-switch:` - Switch control input
- `neuro-voice:` - Voice input

### Color Vision

- `neuro-cvd:` - Any color vision deficiency
- `neuro-protanopia:` - Protanopia (red-blind)
- `neuro-deuteranopia:` - Deuteranopia (green-blind)
- `neuro-tritanopia:` - Tritanopia (blue-blind)
- `neuro-achromatopsia:` - Achromatopsia (colorblind)

## Example

```jsx
<div className="
  p-4
  neuro-relaxed:p-6
  neuro-compact:p-2
  neuro-touch:p-8
  neuro-motion-none:transition-none
  neuro-high-contrast:border-2
">
  Content adapts to user preferences
</div>
```

## License

MIT
