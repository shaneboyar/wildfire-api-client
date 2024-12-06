import chalk from 'chalk';

import { promptUser, cliConsole, clearDeviceCache } from '../utils';

export async function clearCache() {
  try {
    const { clearType } = await promptUser([
      {
        type: 'list',
        name: 'clearType',
        message: 'Which device cache would you like to clear?',
        choices: [
          { name: 'Both devices', value: 'both' },
          { name: 'Client device only', value: 'client' },
          { name: 'Admin device only', value: 'admin' },
        ],
        prefix: '(ESC to go back)',
      },
    ]);

    if (!clearType) {
      cliConsole.info(chalk.yellow('Operation cancelled'));
      return;
    }

    const { confirmed } = await promptUser([
      {
        type: 'confirm',
        name: 'confirmed',
        message: chalk.yellow(
          `Are you sure you want to clear the ${
            clearType === 'both' ? 'device caches' : `${clearType} device cache`
          }?`,
        ),
        default: false,
        prefix: '⚠️ ',
      },
    ]);

    if (!confirmed) {
      cliConsole.info(chalk.yellow('Operation cancelled'));
      return;
    }

    if (clearType === 'both') {
      await clearDeviceCache();
      cliConsole.info(
        chalk.green('All device caches cleared successfully! 🧹'),
      );
    } else {
      await clearDeviceCache(clearType);
      cliConsole.info(
        chalk.green(`${clearType} device cache cleared successfully! 🧹`),
      );
    }
  } catch (error) {
    cliConsole.error(chalk.red('Failed to clear cache:'), error);
  }
}
