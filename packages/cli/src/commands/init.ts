import chalk from 'chalk';
import prompts from 'prompts';
import fs from 'fs-extra';
import path from 'path';

export async function initCommand(): Promise<void> {
  console.log(chalk.bold('\n🧠 NeuroUI Setup\n'));

  const response = await prompts([
    {
      type: 'text',
      name: 'componentsDir',
      message: 'Where should components be installed?',
      initial: './src/components/ui',
    },
    {
      type: 'select',
      name: 'preset',
      message: 'Default sensory preset:',
      choices: [
        { title: 'Default', value: 'default' },
        { title: 'Calm', value: 'calm' },
        { title: 'Focus', value: 'focus' },
        { title: 'Safe', value: 'safe' },
        { title: 'Color Safe', value: 'colorSafe' },
      ],
      initial: 0,
    },
  ]);

  if (!response.componentsDir) {
    console.log(chalk.red('Setup cancelled.'));
    return;
  }

  const config = {
    $schema: 'https://neuroui.dev/schema.json',
    componentsDir: response.componentsDir as string,
    preset: response.preset as string,
  };

  const configPath = path.resolve('neuroui.config.ts');
  const configContent = `import type { NeuroUIConfig } from '@neuroui/cli';

const config: NeuroUIConfig = ${JSON.stringify(config, null, 2)};

export default config;
`;

  await fs.writeFile(configPath, configContent, 'utf-8');
  console.log(chalk.green(`\n✓ Created ${configPath}`));
  console.log(chalk.dim('\nNext steps:'));
  console.log(chalk.dim('  1. Install @neuroui/core: pnpm add @neuroui/core'));
  console.log(chalk.dim('  2. Add components: npx neuroui add button'));
  console.log();
}

export interface NeuroUIConfig {
  $schema?: string;
  componentsDir: string;
  preset: string;
}
