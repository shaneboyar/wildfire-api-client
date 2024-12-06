import chalk from 'chalk';

import { Spinner, cliConsole, getClientDevice } from '../utils';
import { client } from '../index';

export async function getCloudProfile() {
  const clientDevice = await getClientDevice();
  if (!clientDevice) return;

  const spinner = new Spinner('Fetching cloud profile...');
  spinner.start();

  try {
    const profile = await cliConsole.withSuppressedLogs(() =>
      client.getCloudProfile(clientDevice.deviceKey),
    );
    spinner.succeed(chalk.green('Cloud profile fetched successfully! ☁️'));
    cliConsole.info(chalk.cyan(JSON.stringify(profile, null, 2)));
  } catch (error) {
    spinner.fail(chalk.red('Failed to fetch cloud profile'));
    console.error(chalk.red('❌ Error:'), error);
  }
}
