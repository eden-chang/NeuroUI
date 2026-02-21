import chalk from 'chalk';
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

interface ComponentEntry {
  name: string;
  files: string[];
  dependencies: string[];
}

interface Registry {
  components: ComponentEntry[];
}

function getRegistryPath(): string {
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  return path.resolve(__dirname, '../src/registry/components.json');
}

function loadRegistry(): Registry {
  const registryPath = getRegistryPath();
  // Try multiple locations for the registry
  const candidates = [
    registryPath,
    path.resolve(path.dirname(fileURLToPath(import.meta.url)), './registry/components.json'),
    path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../registry/components.json'),
  ];

  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) {
      return fs.readJsonSync(candidate) as Registry;
    }
  }

  // Fallback: inline registry
  return {
    components: [
      { name: 'button', files: ['button/button.tsx', 'button/index.ts'], dependencies: ['@neuroui/core'] },
      { name: 'input', files: ['input/input.tsx', 'input/index.ts'], dependencies: ['@neuroui/core'] },
      { name: 'card', files: ['card/card.tsx', 'card/index.ts'], dependencies: ['@neuroui/core'] },
      { name: 'dialog', files: ['dialog/dialog.tsx', 'dialog/index.ts'], dependencies: ['@neuroui/core'] },
      { name: 'toast', files: ['toast/toast.tsx', 'toast/toast-context.tsx', 'toast/toaster.tsx', 'toast/use-toast.ts', 'toast/index.ts'], dependencies: ['@neuroui/core'] },
      { name: 'select', files: ['select/select.tsx', 'select/index.ts'], dependencies: ['@neuroui/core'] },
      { name: 'checkbox', files: ['checkbox/checkbox.tsx', 'checkbox/index.ts'], dependencies: ['@neuroui/core'] },
      { name: 'radio', files: ['radio/radio.tsx', 'radio/index.ts'], dependencies: ['@neuroui/core'] },
      { name: 'tabs', files: ['tabs/tabs.tsx', 'tabs/index.ts'], dependencies: ['@neuroui/core'] },
      { name: 'accordion', files: ['accordion/accordion.tsx', 'accordion/index.ts'], dependencies: ['@neuroui/core'] },
      { name: 'alert', files: ['alert/alert.tsx', 'alert/index.ts'], dependencies: ['@neuroui/core'] },
      { name: 'badge', files: ['badge/badge.tsx', 'badge/index.ts'], dependencies: ['@neuroui/core'] },
      { name: 'tooltip', files: ['tooltip/tooltip.tsx', 'tooltip/index.ts'], dependencies: ['@neuroui/core'] },
      { name: 'navigation', files: ['navigation/navigation.tsx', 'navigation/index.ts'], dependencies: ['@neuroui/core'] },
      { name: 'table', files: ['table/table.tsx', 'table/index.ts'], dependencies: ['@neuroui/core'] },
    ],
  };
}

async function loadConfig(): Promise<{ componentsDir: string } | null> {
  const configPath = path.resolve('neuroui.config.ts');
  if (!await fs.pathExists(configPath)) {
    return null;
  }
  // Simple config extraction - read file and parse componentsDir
  const content = await fs.readFile(configPath, 'utf-8');
  const match = content.match(/"componentsDir":\s*"([^"]+)"/);
  if (match?.[1]) {
    return { componentsDir: match[1] };
  }
  return { componentsDir: './src/components/ui' };
}

export async function addCommand(componentName: string, options: { all?: boolean }): Promise<void> {
  const config = await loadConfig();
  const componentsDir = config?.componentsDir ?? './src/components/ui';

  const registry = loadRegistry();

  const componentsToAdd = options.all || componentName === 'all'
    ? registry.components
    : registry.components.filter((c) => c.name === componentName);

  if (componentsToAdd.length === 0) {
    console.log(chalk.red(`Component "${componentName}" not found in registry.`));
    console.log(chalk.dim('Available components:'));
    for (const c of registry.components) {
      console.log(chalk.dim(`  - ${c.name}`));
    }
    return;
  }

  // Find source directory (the @neuroui/components package)
  const sourceBase = findComponentsSource();
  if (!sourceBase) {
    console.log(chalk.red('Could not find @neuroui/components source files.'));
    console.log(chalk.dim('Make sure @neuroui/components is installed.'));
    return;
  }

  for (const component of componentsToAdd) {
    console.log(chalk.blue(`Adding ${component.name}...`));

    for (const file of component.files) {
      const sourcePath = path.join(sourceBase, file);
      const destPath = path.resolve(componentsDir, file);

      await fs.ensureDir(path.dirname(destPath));

      if (await fs.pathExists(sourcePath)) {
        await fs.copy(sourcePath, destPath);
        console.log(chalk.dim(`  ✓ ${file}`));
      } else {
        console.log(chalk.yellow(`  ⚠ ${file} not found in source`));
      }
    }
  }

  // Collect unique dependencies
  const deps = new Set<string>();
  for (const c of componentsToAdd) {
    for (const dep of c.dependencies) {
      deps.add(dep);
    }
  }

  if (deps.size > 0) {
    console.log(chalk.dim(`\nRequired dependencies: ${[...deps].join(', ')}`));
    console.log(chalk.dim('Install with: pnpm add ' + [...deps].join(' ')));
  }

  console.log(chalk.green(`\n✓ Added ${componentsToAdd.length} component(s) to ${componentsDir}`));
}

function findComponentsSource(): string | null {
  // Try node_modules
  const nmPath = path.resolve('node_modules/@neuroui/components/src');
  if (fs.existsSync(nmPath)) return nmPath;

  // Try monorepo sibling
  const monoPath = path.resolve(__dirname, '../../components/src');
  if (fs.existsSync(monoPath)) return monoPath;

  // Try relative to cwd
  const cwdPath = path.resolve('packages/components/src');
  if (fs.existsSync(cwdPath)) return cwdPath;

  return null;
}

const __dirname = path.dirname(fileURLToPath(import.meta.url));
