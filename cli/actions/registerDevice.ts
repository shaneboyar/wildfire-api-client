import chalk from 'chalk';

import { promptUser, Spinner, cliConsole, getClientDevice } from '../utils';
import { client } from '../index';

export async function registerDevice() {
  const clientDevice = await getClientDevice();
  if (!clientDevice) return;

  const { customerId } = await promptUser([
    {
      type: 'input',
      name: 'customerId',
      message: 'Enter customer ID to register:',
      prefix: '(ESC to go back)',
      validate: (input) => (input ? true : 'Customer ID is required'),
    },
  ]);

  if (!customerId) return;

  const spinner = new Spinner('Registering device...');
  spinner.start();

  try {
    await client.registerDevice(
      customerId,
      clientDevice.deviceToken,
      false, // Always false for client device
    );
    spinner.succeed(chalk.green('Device registered successfully! 🎉'));
    cliConsole.info(chalk.dim('\nDevice Details:'));
    cliConsole.info(chalk.dim('Customer ID: ') + chalk.cyan(customerId));
    cliConsole.info(
      chalk.dim('Device ID: ') + chalk.cyan(clientDevice.deviceId),
    );
  } catch (error) {
    spinner.fail(chalk.red('Failed to register device'));
    if (error instanceof Error) {
      cliConsole.error(chalk.red('\nError details:'));
      cliConsole.error(chalk.red(error.message));
    }
    throw error;
  }
}
