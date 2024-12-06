import CryptoJS from 'crypto-js';

import type { WildfireAuthHeaders } from '../types';

/**
 * Generates authentication headers for Wildfire API requests
 * @param appId - The application ID
 * @param appSecret - The application secret
 * @param deviceToken - Optional device token for authenticated requests
 * @returns Object containing required auth headers
 */
export function generateWildfireAuthHeaders(
  deviceToken = '',
  isAdminRequest = false,
): WildfireAuthHeaders {
  console.log(
    `🔐 Generating Wildfire ${
      isAdminRequest ? 'admin' : 'client'
    } device auth headers`,
  );

  const appId = isAdminRequest
    ? process.env.WILDFIRE_ADMIN_APP_ID
    : process.env.WILDFIRE_APP_ID;
  const appSecret = isAdminRequest
    ? process.env.WILDFIRE_ADMIN_APP_SECRET
    : process.env.WILDFIRE_APP_SECRET;

  if (!appId || !appSecret) {
    throw new Error('Missing Wildfire app ID or secret');
  }

  // Generate timestamp in ISO format
  const timestamp = new Date().toISOString();

  // Empty for external partners
  const senderToken = '';

  // Create string to sign (same format for all requests)
  const stringToSign = [timestamp, deviceToken, senderToken].join('\n') + '\n';

  console.log('📝 Generating signature with:', {
    timestamp,
    hasDeviceToken: Boolean(deviceToken),
    stringToSign,
  });

  const signature = CryptoJS.HmacSHA256(stringToSign, appSecret).toString(
    CryptoJS.enc.Hex,
  );

  // Build auth parts - empty parts will be included as empty strings
  const authParts = [appId, signature, deviceToken, senderToken];

  console.log(
    `✅ ${isAdminRequest ? 'Admin' : 'Client'} device auth headers generated`,
  );

  return {
    Authorization: `WFAV1 ${authParts.join(':')}`,
    'X-WF-DateTime': timestamp,
    'Content-Type': 'application/json',
    'User-Agent': 'Wildfire API Client',
  };
}
