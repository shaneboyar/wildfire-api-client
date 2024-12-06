import chalk from 'chalk';

import {
  getAdminDevice,
  getClientDevice,
  handleCurlCommand,
  cliConsole,
  promptUser,
} from '../utils';
import { client } from '../index';

export async function getRedeemableAmount() {
  const adminDeviceInfo = await getAdminDevice();
  const clientDeviceInfo = await getClientDevice();
  if (!adminDeviceInfo || !clientDeviceInfo) return;

  const { useCachedDeviceId } = await promptUser([
    {
      type: 'confirm',
      name: 'useCachedDeviceId',
      message: 'Use cached client device ID?',
      default: true,
      prefix: '(ESC to go back)',
    },
  ]);

  let clientDeviceId = clientDeviceInfo.deviceId;
  if (!useCachedDeviceId) {
    const { deviceId } = await promptUser([
      {
        type: 'input',
        name: 'deviceId',
        message: 'Enter client device ID:',
      },
    ]);
    clientDeviceId = deviceId;
  }

  const shouldShowCurl = await handleCurlCommand(
    `/v2/giftcard/${clientDeviceId}/redeemable`,
    'GET',
    undefined,
    { isAdminRequest: true },
  );
  if (shouldShowCurl) return;

  try {
    const { Amount, Currency } = await cliConsole.withSuppressedLogs(() =>
      client.getRedeemableAmount(clientDeviceId),
    );
    cliConsole.info(chalk.green('Redeemable amount fetched successfully! 💰'));
    cliConsole.info(chalk.cyan(`${Currency} ${Amount}`));
  } catch (error) {
    cliConsole.error(chalk.red('Failed to fetch redeemable amount:'), error);
  }
}
