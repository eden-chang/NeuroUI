# @neuroui/core

[![MIT License](https://img.shields.io/badge/license-MIT-blue.svg)](./LICENSE)
[![npm version](https://img.shields.io/npm/v/@neuroui/core.svg)](https://www.npmjs.com/package/@neuroui/core)

Sensory profile system and React hooks for cognitive accessibility.

## Install

```bash
npm install @neuroui/core
```

## Quick Start

```tsx
import { NeuroProvider, useNeuro } from '@neuroui/core';

function App() {
  return (
    <NeuroProvider preset="calm">
      <MyComponent />
    </NeuroProvider>
  );
}

function MyComponent() {
  const { profile, setProfile } = useNeuro();

  return (
    <div>
      <p>Motion: {profile.motion}</p>
      <button onClick={() => setProfile({ motion: 'reduced' })}>
        Reduce motion
      </button>
    </div>
  );
}
```

## Hooks

| Hook | Description |
|------|-------------|
| `useNeuro()` | Access the full sensory profile and update functions |
| `useMotionSafety()` | Motion preferences — animation durations, transition styles |
| `useCognitiveLoad()` | Density and spacing adaptations for information overload |
| `useReadability()` | Font family, line height, and letter spacing for reading comfort |
| `useFocusMode()` | Focus ring styles and keyboard navigation enhancements |
| `useFlashSafety()` | Flash/strobe detection and safe animation guards |
| `useColorVision()` | Color palette adaptations for color vision deficiencies |
| `useInputMethod()` | Input method detection (pointer, keyboard, touch, switch, voice) |

## SensoryProfile

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

## Presets

Use built-in presets for common configurations:

```tsx
<NeuroProvider preset="calm" />   // Reduced motion, minimal density
<NeuroProvider preset="focus" />  // Enhanced focus, reduced distractions
<NeuroProvider preset="safe" />   // Flash safety, reduced motion
```

## Docs

Full documentation at [neuroui.dev](https://neuroui.dev)

## Repository

[github.com/neuroui/neuroui](https://github.com/neuroui/neuroui)

## License

[MIT](./LICENSE)
