import chalk from 'chalk';
import CryptoJS from 'crypto-js';

import { promptUser } from './promptUser';

interface CurlCommandOptions {
  isAdminRequest?: boolean;
  deviceToken?: string;
}

export function generateCurlCommand(
  endpoint: string,
  method = 'GET',
  data?: object,
  options: CurlCommandOptions = {},
) {
  const baseUrl = 'https://api.wfi.re';
  const timestamp = new Date().toISOString();

  const appId = options.isAdminRequest
    ? process.env.WILDFIRE_ADMIN_APP_ID
    : process.env.WILDFIRE_APP_ID;
  const appSecret = options.isAdminRequest
    ? process.env.WILDFIRE_ADMIN_APP_SECRET
    : process.env.WILDFIRE_APP_SECRET;

  // Construct signature similar to auth.ts
  const stringToSign = options.isAdminRequest
    ? `${timestamp}\n`
    : `${timestamp}\n${options.deviceToken || ''}\n\n`;

  const signature = CryptoJS.HmacSHA256(
    stringToSign,
    appSecret || '',
  ).toString();
  const authParts = options.isAdminRequest
    ? [appId, signature]
    : [appId, signature, options.deviceToken || '', ''];

  const headers = {
    Authorization: `WFAV1 ${authParts.join(':')}`,
    'X-WF-DateTime': timestamp,
    'Content-Type': 'application/json',
    'User-Agent': 'Wildfire API Client',
  };

  const headerString = Object.entries(headers)
    .map(([key, value]) => `-H '${key}: ${value}'`)
    .join(' ');

  const dataString = data ? `-d '${JSON.stringify(data)}'` : '';

  return `curl -X ${method} ${headerString} ${dataString} '${baseUrl}${endpoint}'`;
}

export async function handleCurlCommand(
  endpoint: string,
  method: string,
  data?: object,
  options?: CurlCommandOptions,
) {
  const { printCurl } = await promptUser([
    {
      type: 'confirm',
      name: 'printCurl',
      message: 'Would you like to see the curl command?',
      default: false,
      prefix: '(ESC to go back)',
    },
  ]);

  if (printCurl) {
    console.log(chalk.blue('\nCurl command:'));
    console.log(generateCurlCommand(endpoint, method, data, options));
    return true;
  }
  return false;
}
