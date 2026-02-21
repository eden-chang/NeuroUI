# @neuroui/components

[![MIT License](https://img.shields.io/badge/license-MIT-blue.svg)](./LICENSE)
[![npm version](https://img.shields.io/npm/v/@neuroui/components.svg)](https://www.npmjs.com/package/@neuroui/components)

Beautiful React UI components with built-in cognitive accessibility.

Every component automatically adapts to users' sensory preferences — motion sensitivity, information density, focus needs, and reading comfort.

## Install

```bash
npm install @neuroui/core @neuroui/components
```

## Quick Start

```tsx
import { NeuroProvider } from '@neuroui/core';
import { Button, Input, Card } from '@neuroui/components';

function App() {
  return (
    <NeuroProvider>
      <Card>
        <h2>Sign Up</h2>
        <Input placeholder="Email" type="email" />
        <Input placeholder="Password" type="password" />
        <Button variant="default">Create Account</Button>
      </Card>
    </NeuroProvider>
  );
}
```

## Components

| Component | Description |
|-----------|-------------|
| `Button` | Accessible button with size and variant adaptations |
| `Input` | Text input with focus and spacing adaptations |
| `Select` | Dropdown select with keyboard navigation |
| `Checkbox` | Checkbox with accessible target sizes |
| `Radio` / `RadioGroup` | Radio buttons with group management |
| `Card` | Content container with density-aware padding |
| `Dialog` | Modal dialog with focus trapping and motion-safe transitions |
| `Tabs` | Tabbed interface with keyboard navigation |
| `Accordion` | Collapsible sections with motion-safe animations |
| `Alert` | Status messages with notification-level awareness |
| `Badge` | Inline status indicators with color vision support |
| `Tooltip` | Contextual help with timing and density adaptations |
| `Navigation` | Nav component with focus and input method adaptations |
| `Table` | Data table with density and spacing adaptations |
| `Toast` / `Toaster` | Toast notifications respecting notification preferences |

## Peer Dependencies

| Package | Version |
|---------|---------|
| `react` | >= 18.0.0 |
| `react-dom` | >= 18.0.0 |
| `@neuroui/core` | >= 0.5.0 |
| `tailwindcss` | >= 3.4.0 (optional) |

## Docs

Full documentation and interactive demos at [neuroui.dev](https://neuroui.dev)

## Repository

[github.com/neuroui/neuroui](https://github.com/neuroui/neuroui)

## License

[MIT](./LICENSE)
