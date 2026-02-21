# Contributing to NeuroUI

Thank you for your interest in contributing to NeuroUI! This project aims to bring real cognitive accessibility to the React ecosystem, and every contribution — code, docs, bug reports, or lived-experience feedback — helps make that happen.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Ways to Contribute](#ways-to-contribute)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Project Structure](#project-structure)
- [Coding Standards](#coding-standards)
- [Writing Components](#writing-components)
- [Writing Tests](#writing-tests)
- [Commit Messages](#commit-messages)
- [Pull Requests](#pull-requests)
- [Reporting Bugs](#reporting-bugs)
- [Requesting Features](#requesting-features)
- [Lived-Experience Feedback](#lived-experience-feedback)

---

## Code of Conduct

Be respectful. Be kind. Remember that NeuroUI exists for people whose needs are often overlooked. Discrimination, harassment, and ableism have no place here.

---

## Ways to Contribute

- **Report bugs** — Found something broken? [Open an issue](#reporting-bugs).
- **Fix bugs** — Check the [issue tracker](https://github.com/neuroui/neuroui/issues) for confirmed bugs.
- **Add features** — Propose or implement new components, hooks, or sensory adaptations.
- **Improve docs** — Fix typos, clarify explanations, add examples.
- **Share your experience** — If you're neurodivergent, your [feedback](#lived-experience-feedback) is the most valuable contribution of all.
- **Write tests** — More coverage means fewer regressions.

---

## Getting Started

### Prerequisites

- **Node.js** >= 18
- **pnpm** >= 9 (`npm install -g pnpm`)
- **Git**

### Setup

```bash
# 1. Fork and clone the repository
git clone https://github.com/<your-username>/neuroui.git
cd neuroui

# 2. Install dependencies
pnpm install

# 3. Build all packages
pnpm build

# 4. Run tests to verify everything works
pnpm test
```

---

## Development Workflow

### Common Commands

| Command | Description |
|---|---|
| `pnpm build` | Build all packages |
| `pnpm dev` | Start all packages in watch mode |
| `pnpm test` | Run all tests once |
| `pnpm test:watch` | Run tests in watch mode |
| `pnpm lint` | Lint all files |
| `pnpm lint:fix` | Lint and auto-fix |
| `pnpm format` | Format all files with Prettier |
| `pnpm format:check` | Check formatting without changes |
| `pnpm typecheck` | Type-check all packages |
| `pnpm clean` | Remove all build artifacts and `node_modules` |

### Typical workflow

```bash
# 1. Create a feature branch
git checkout -b feat/my-feature

# 2. Start development mode
pnpm dev

# 3. Make your changes

# 4. Run checks
pnpm typecheck
pnpm lint
pnpm test

# 5. Commit and push
git add <files>
git commit -m "feat: add my feature"
git push origin feat/my-feature

# 6. Open a pull request
```

---

## Project Structure

```
neuroui/
├── packages/
│   ├── core/             # Sensory profile types, provider, hooks, defaults
│   │   └── src/
│   │       ├── types.ts          # SensoryProfile, SensoryProfileOverrides
│   │       ├── defaults.ts       # Default profile values, presets
│   │       ├── provider.tsx      # NeuroProvider context
│   │       ├── media.ts          # OS media query detection
│   │       └── hooks/            # useMotionSafety, useCognitiveLoad, etc.
│   ├── components/       # React components with sensory adaptations
│   │   └── src/
│   │       ├── button/
│   │       ├── input/
│   │       ├── dialog/
│   │       ├── toast/
│   │       ├── card/
│   │       └── ...               # 15 components total
│   ├── cli/              # CLI tool (npx neuroui add <component>)
│   └── tailwind/         # Tailwind CSS plugin (neuro-* variants)
├── apps/
│   └── docs/             # Documentation site (Astro + Starlight)
├── vitest.config.ts      # Test configuration
├── tsconfig.base.json    # Shared TypeScript config
└── package.json          # Root workspace scripts
```

Each package builds independently with **tsup** (ESM + CJS output) and has its own `tsconfig.json` extending `tsconfig.base.json`.

---

## Coding Standards

### TypeScript

- Strict mode enabled. No `any` types unless absolutely unavoidable.
- Use explicit type annotations for function parameters and return types.
- Prefer `interface` for object shapes, `type` for unions/intersections.
- Use `SensoryProfileOverrides` (partial) for consumer-facing APIs, `SensoryProfile` (full) for internal logic.

### React

- All components use `forwardRef`.
- Every component sets `data-neuro-component="ComponentName"` on its root element.
- Use the `cn()` utility (from `clsx` + `tailwind-merge`) for className merging.
- Compound components use `Object.assign(Component, { Sub: SubComponent })`.
- All hooks call `useNeuro()` internally and return typed result objects.

### Formatting

- **Prettier** handles formatting — don't fight it.
- **ESLint** catches code quality issues.
- Run `pnpm lint:fix && pnpm format` before committing.

### Naming Conventions

- `camelCase` for variables and functions
- `PascalCase` for components, types, and interfaces
- File names match the default export (e.g., `Button.tsx` exports `Button`)

---

## Writing Components

Every NeuroUI component must:

1. **Accept `className` and `ref`** — Use `forwardRef` and merge classNames with `cn()`.
2. **Set `data-neuro-component`** — For styling hooks and debugging.
3. **Consume sensory profile via hooks** — Use `useNeuro()`, `useMotionSafety()`, etc.
4. **Adapt to sensory preferences** — Motion, spacing, density, focus, timing, color vision, and input method must all be considered.
5. **Meet WCAG 2.1 AA** — Keyboard navigation, ARIA attributes, color contrast, focus management.
6. **Enforce cognitive accessibility at the type level** — e.g., `Input` requires a `label` prop.

### Component template

```tsx
import { forwardRef, type ComponentPropsWithoutRef } from 'react';
import { useNeuro, cn } from '@neuroui/core';

interface MyComponentProps extends ComponentPropsWithoutRef<'div'> {
  variant?: 'default' | 'outlined';
}

const MyComponent = forwardRef<HTMLDivElement, MyComponentProps>(
  ({ variant = 'default', className, children, ...props }, ref) => {
    const { profile } = useNeuro();

    return (
      <div
        ref={ref}
        data-neuro-component="MyComponent"
        className={cn('base-styles', className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);

MyComponent.displayName = 'MyComponent';
export { MyComponent };
```

---

## Writing Tests

Tests use **Vitest** with **@testing-library/react** and **jsdom**.

### Conventions

- Test files live next to the source: `Button.test.tsx` beside `Button.tsx`.
- Use the `renderWithProfile(overrides, jsx)` helper to render components inside `NeuroProvider` with specific sensory profile settings.
- Test **every sensory adaptation** — each profile dimension that affects the component needs at least one test.
- Test keyboard navigation and ARIA attributes.

### Test template

```tsx
import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithProfile } from '../../test-utils';
import { MyComponent } from './MyComponent';

describe('MyComponent', () => {
  it('renders with default props', () => {
    renderWithProfile({}, <MyComponent>Hello</MyComponent>);
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });

  it('sets data-neuro-component attribute', () => {
    renderWithProfile({}, <MyComponent>Hello</MyComponent>);
    expect(screen.getByText('Hello')).toHaveAttribute(
      'data-neuro-component',
      'MyComponent'
    );
  });

  it('adapts to reduced motion', () => {
    renderWithProfile(
      { motion: 'none' },
      <MyComponent>Hello</MyComponent>
    );
    // Assert motion-specific behavior
  });

  it('adapts to enhanced focus', () => {
    renderWithProfile(
      { focus: 'enhanced' },
      <MyComponent>Hello</MyComponent>
    );
    // Assert focus-specific behavior
  });
});
```

### Running tests

```bash
# All tests
pnpm test

# Watch mode
pnpm test:watch

# Specific package
pnpm test -- packages/core

# Specific file
pnpm test -- packages/components/src/button/Button.test.tsx
```

---

## Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <description>
```

### Types

| Type | When to use |
|---|---|
| `feat` | New feature or component |
| `fix` | Bug fix |
| `docs` | Documentation changes |
| `test` | Adding or updating tests |
| `refactor` | Code change that doesn't fix a bug or add a feature |
| `style` | Formatting, whitespace (not CSS changes) |
| `chore` | Build config, dependencies, tooling |
| `perf` | Performance improvement |

### Scopes

Use the package name: `core`, `components`, `cli`, `tailwind`, `docs`.

### Examples

```
feat(components): add Accordion component
fix(core): correct motion detection on Safari
docs(docs): add color vision guide
test(components): add Dialog keyboard navigation tests
refactor(core): simplify SensoryProfile defaults
```

---

## Pull Requests

### Before opening a PR

- [ ] Code compiles: `pnpm typecheck`
- [ ] Linting passes: `pnpm lint`
- [ ] All tests pass: `pnpm test`
- [ ] New code has tests
- [ ] Formatting is consistent: `pnpm format:check`

### PR format

**Title:** Short and descriptive, following commit conventions (e.g., `feat(components): add Accordion component`).

**Body:**

```markdown
## Summary

Brief description of what this PR does and why.

## Changes

- Bullet points of specific changes

## Sensory Adaptations

- List which sensory profile dimensions this change addresses
- e.g., "Respects motion: 'none' by disabling collapse animation"

## Testing

- How you tested the changes
- Which profiles you tested against

## Related Issues

Closes #123
```

### Review process

1. All PRs require at least one review.
2. CI must pass (lint, typecheck, tests).
3. New components need tests for all sensory adaptations they support.
4. Accessibility claims must be verifiable — don't claim WCAG compliance without testing it.

---

## Reporting Bugs

[Open an issue](https://github.com/neuroui/neuroui/issues/new) with:

- **Title:** Clear, specific description of the problem
- **Environment:** OS, browser, React version, NeuroUI version
- **Steps to reproduce:** Minimal code or sequence of actions
- **Expected behavior:** What should happen
- **Actual behavior:** What actually happens
- **Sensory profile:** If relevant, which profile settings trigger the bug
- **Screenshots/recordings:** If it's a visual issue

---

## Requesting Features

[Open an issue](https://github.com/neuroui/neuroui/issues/new) with:

- **What** you want added
- **Why** it matters for accessibility
- **Who** benefits (which user groups or conditions)
- **How** it might work (optional, but helpful)

Reference [W3C COGA design patterns](https://www.w3.org/TR/coga-usable/) if applicable.

---

## Lived-Experience Feedback

**If you are neurodivergent, your feedback is the most important contribution to this project.**

You don't need to write code. You don't need to understand React. If something doesn't work for you — if a component is confusing, if an animation makes you uncomfortable, if the timing feels wrong — that is a bug, and we want to hear about it.

### How to share feedback

- [Open an issue](https://github.com/neuroui/neuroui/issues/new) with the label `lived-experience`
- Describe what you were trying to do, what happened, and how it felt
- You don't need to suggest a fix — just telling us what's wrong is enough

### What kind of feedback helps

- "This animation makes me dizzy even with reduced motion on"
- "I can't tell which field has an error"
- "The toast disappears before I can read it"
- "This works great for me with the calm preset"
- "I wish the focus ring was more visible"

Every piece of feedback from someone who actually lives with these challenges is worth more than a hundred synthetic tests. Your experience shapes this project.

---

## License

By contributing to NeuroUI, you agree that your contributions will be licensed under the [MIT License](./LICENSE).
