import chalk from 'chalk';

import {
  getAdminDevice,
  getClientDevice,
  handleCurlCommand,
  cliConsole,
  promptUser,
} from '../utils';
import { client } from '../index';

export async function redeem() {
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
    `/v2/giftcard`,
    'POST',
    { deviceID: clientDeviceId },
    { isAdminRequest: true },
  );
  if (shouldShowCurl) return;

  try {
    const redemption = await cliConsole.withSuppressedLogs(() =>
      client.redeemGiftCard(clientDeviceId),
    );
    cliConsole.info(chalk.green('Gift card redeemed successfully! 🎉'));
    cliConsole.info(chalk.cyan(`Redeemed Amount: ${redemption.amount}`));
  } catch (error) {
    cliConsole.error(chalk.red('Failed to redeem gift card:'), error);
  }
}
