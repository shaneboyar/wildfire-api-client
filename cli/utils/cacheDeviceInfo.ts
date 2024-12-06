import path from 'path';
import fs from 'fs/promises';
import os from 'os';

import chalk from 'chalk';
import Table from 'cli-table3';

import { cliConsole } from './console';
import { promptUser } from './promptUser';

export type CachedDeviceInfo = {
  deviceId: string;
  deviceKey: string;
  deviceToken: string;
  isAdminDevice: boolean;
  timestamp: string;
};

type DeviceCache = {
  admin?: CachedDeviceInfo;
  client?: CachedDeviceInfo;
};

const getCachePath = () => path.join(os.tmpdir(), '.wildfire-devices-cache');

export const readDeviceCache = async (): Promise<DeviceCache> => {
  try {
    const cachePath = getCachePath();
    const cacheData = await fs.readFile(cachePath, 'utf-8');
    return JSON.parse(cacheData);
  } catch {
    return {};
  }
};

export const cacheDeviceInfo = async (deviceInfo: {
  deviceId: number;
  deviceKey: string;
  deviceToken: string;
  isAdminDevice: boolean;
}) => {
  const existingCache = await readDeviceCache();
  const cache: DeviceCache = {
    ...existingCache,
    [deviceInfo.isAdminDevice ? 'admin' : 'client']: {
      ...deviceInfo,
      timestamp: new Date().toISOString(),
    },
  };

  await fs.writeFile(getCachePath(), JSON.stringify(cache));
};

function formatDeviceInfoForTable(device: CachedDeviceInfo | undefined) {
  if (!device) return ['No device registered', '', ''];
  return [
    device.deviceId,
    device.deviceKey,
    `${device.deviceToken.slice(0, 8)}...`,
  ];
}

export const displayDeviceInfo = async () => {
  const cache = await readDeviceCache();

  const adminInfo = formatDeviceInfoForTable(cache.admin);
  const clientInfo = formatDeviceInfoForTable(cache.client);

  const table = new Table({
    head: ['', 'Admin 👑', 'Client 👤'],
    colWidths: [10, 40, 40],
    wordWrap: true,
  });

  table.push(
    ['ID', adminInfo[0], clientInfo[0]],
    ['Key', adminInfo[1], clientInfo[1]],
    ['Token', adminInfo[2], clientInfo[2]],
  );

  cliConsole.info(chalk.bold(' Device Information'));
  cliConsole.info(table.toString());
  cliConsole.info('');
};

export async function getDeviceInfo() {
  const cache = await readDeviceCache();

  if (!cache.admin && !cache.client) {
    cliConsole.error(
      chalk.red('No devices found in cache. Please create a device first.'),
    );
    return null;
  }

  const deviceChoices: { name: string; value: string }[] = [];
  if (cache.client) {
    deviceChoices.push({ name: 'Client Device', value: 'client' });
  }
  if (cache.admin) deviceChoices.push({ name: 'Admin Device', value: 'admin' });

  const { deviceType } = await promptUser([
    {
      type: 'list',
      name: 'deviceType',
      message: 'Select device:',
      choices: deviceChoices,
      prefix: '(ESC to go back)',
    },
  ]);

  return cache[deviceType as keyof DeviceCache] || null;
}

export async function getClientDevice() {
  const cache = await readDeviceCache();
  if (!cache.client) {
    cliConsole.error(
      chalk.red(
        'No client device found in cache. Please create a client device first.',
      ),
    );
    return null;
  }
  return cache.client;
}

export async function getAdminDevice() {
  const cache = await readDeviceCache();
  if (!cache.admin) {
    cliConsole.error(
      chalk.red(
        'No admin device found in cache. Please create an admin device first.',
      ),
    );
    return null;
  }
  return cache.admin;
}

export async function clearDeviceCache(type?: 'admin' | 'client') {
  const cache = await readDeviceCache();

  if (!type) {
    await fs.writeFile(getCachePath(), JSON.stringify({}));
    return;
  }

  delete cache[type];
  await fs.writeFile(getCachePath(), JSON.stringify(cache));
}
