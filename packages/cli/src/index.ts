import { Command } from 'commander';
import { initCommand } from './commands/init.js';
import { addCommand } from './commands/add.js';

const program = new Command();

program
  .name('neuroui')
  .description('CLI for adding NeuroUI components to your project')
  .version('0.5.0');

program
  .command('init')
  .description('Initialize NeuroUI in your project')
  .action(initCommand);

program
  .command('add')
  .description('Add a component to your project')
  .argument('<component>', 'Component name to add (or "all" for all components)')
  .option('--all', 'Add all components')
  .action(addCommand);

program.parse();
