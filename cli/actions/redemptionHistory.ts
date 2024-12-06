import chalk from 'chalk';
import Table from 'cli-table3';

import {
  getAdminDevice,
  getClientDevice,
  handleCurlCommand,
  cliConsole,
  promptUser,
} from '../utils';
import { client } from '../index';

export async function getRedemptionHistory() {
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
    `/v2/giftcard?device_id=${clientDeviceId}`,
    'GET',
    undefined,
    { isAdminRequest: true },
  );
  if (shouldShowCurl) return;

  try {
    const { Links } = await cliConsole.withSuppressedLogs(() =>
      client.getRedemptionHistory(clientDeviceId),
    );
    cliConsole.info(chalk.green('Redemption history fetched successfully! 📜'));

    if (Links.length === 0) {
      cliConsole.info(
        chalk.yellow('No redemption history found for this device.'),
      );
      return;
    }

    const table = new Table({
      head: ['Date', 'Type', 'Amount', 'Description'],
      colWidths: [15, 10, 10, 50],
    });

    Links.forEach(({ amount, currency, createdDate, url }) => {
      const date = new Date(createdDate).toLocaleDateString();
      const symbol = currency === 'credit' ? '+' : '-';
      table.push([date, symbol, `$${amount}`, url]);
    });

    cliConsole.info(table.toString());
  } catch (error) {
    cliConsole.error(chalk.red('Failed to fetch redemption history:'), error);
  }
}
