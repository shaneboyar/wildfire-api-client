#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import figlet from 'figlet';

import {
  promptUser,
  clearScreen,
  cliConsole,
  displayDeviceInfo,
  cacheDeviceInfo,
} from './utils';
import { mainMenuChoices } from './menu';
import { actions, type ActionType } from './actions';

import { WildfireClient } from '../src/client/WildfireClient';

const program = new Command();

program
  .name('wildfire')
  .description('CLI tool for interacting with Wildfire API')
  .option('-v, --verbose', 'enable verbose logging')
  .parse();

const options = program.opts();
cliConsole.setVerbose(options.verbose || false);

export let client: WildfireClient;

async function mainMenu() {
  client = await cliConsole.withSuppressedLogs(() => WildfireClient.create());
  const initialAdminDevice = await cliConsole.withSuppressedLogs(() =>
    client.getAdminDevice(),
  );
  cacheDeviceInfo({
    deviceId: initialAdminDevice.DeviceID,
    deviceKey: initialAdminDevice.DeviceKey,
    deviceToken: initialAdminDevice.DeviceToken,
    isAdminDevice: true,
  });
  clearScreen();

  const wildfireText = figlet
    .textSync('WILDFIRE', {
      font: 'Standard',
      horizontalLayout: 'default',
      verticalLayout: 'default',
    })
    .split('\n');

  wildfireText.forEach((line) => cliConsole.log(chalk.magenta(line)));

  await displayDeviceInfo();

  cliConsole.info(chalk.blue.bold('\n🔥 Welcome to the Wildfire CLI!\n'));
  cliConsole.info(
    chalk.gray('Use arrow keys to navigate, Enter to select, ESC to go back\n'),
  );

  while (true) {
    try {
      const { action } = await promptUser([
        {
          type: 'list',
          name: 'action',
          message: 'What would you like to do?',
          prefix: '→',
          pageSize: 12,
          choices: mainMenuChoices,
        },
      ]);

      if (action === 'exit') {
        cliConsole.info(chalk.yellow('\n👋 Thanks for using Wildfire CLI!\n'));
        process.exit(0);
      }

      clearScreen();
      const actionFn = actions[action as ActionType];

      if (typeof actionFn === 'function') {
        await actionFn();
        cliConsole.info('\nPress enter to continue...');
        await promptUser([
          {
            type: 'input',
            name: 'continue',
            prefix: '',
            message: '',
          },
        ]);

        clearScreen();
        await displayDeviceInfo();
        cliConsole.info(chalk.blue.bold('\n🔥 Welcome to the Wildfire CLI!\n'));
        cliConsole.info(
          chalk.gray(
            'Use arrow keys to navigate, Enter to select, ESC to go back\n',
          ),
        );
      } else {
        cliConsole.error(`Action '${action}' is not implemented yet`);
      }
    } catch (error) {
      cliConsole.error('An error occurred:', error);
      cliConsole.info(chalk.yellow('\nPress enter to return to main menu...'));
      await promptUser([
        {
          type: 'input',
          name: 'continue',
          prefix: '',
          message: '',
        },
      ]);
      clearScreen();
    }
  }
}

process.on('unhandledRejection', (error) => {
  cliConsole.error(chalk.red('Unhandled rejection:'), error);
  process.exit(1);
});

mainMenu().catch((error) => {
  cliConsole.error(chalk.red('Fatal error:'), error);
  process.exit(1);
});
