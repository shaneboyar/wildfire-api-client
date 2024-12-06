import chalk from 'chalk';

import { promptUser, Spinner, cliConsole, cacheDeviceInfo } from '../utils';
import { client } from '../index';

export async function createDevice() {
  const { useKey, isAdminDevice } = await promptUser([
    {
      type: 'confirm',
      name: 'useKey',
      message: 'Would you like to specify a device key?',
      default: false,
      prefix: '(ESC to go back)',
    },
    {
      type: 'confirm',
      name: 'isAdminDevice',
      message: 'Create as admin device?',
      default: false,
      prefix: '(ESC to go back)',
    },
  ]);

  let deviceKey: string | undefined;
  if (useKey) {
    const { key } = await promptUser([
      {
        type: 'input',
        name: 'key',
        message: 'Enter device key:',
      },
    ]);
    deviceKey = key;
  }

  const spinner = new Spinner('Creating device...');
  spinner.start();

  try {
    const device = await cliConsole.withSuppressedLogs(() =>
      client.createDevice(deviceKey, undefined, isAdminDevice),
    );
    spinner.succeed(chalk.green('Device created successfully! 🎉'));
    cliConsole.info(chalk.cyan(JSON.stringify(device, null, 2)));

    await cacheDeviceInfo({
      deviceId: device.DeviceID,
      deviceKey: device.DeviceKey,
      deviceToken: device.DeviceToken,
      isAdminDevice,
    });

    cliConsole.info(chalk.dim('Device info cached for future use'));
    return device;
  } catch (error) {
    spinner.fail(chalk.red('Failed to create device'));
    console.error(chalk.red('❌ Error:'), error);
    return null;
  }
}
