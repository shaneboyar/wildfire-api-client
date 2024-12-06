import fetch, { Response } from 'node-fetch';
import CryptoJS from 'crypto-js';

import { generateWildfireAuthHeaders } from '../utils/auth';
import { WildfireApiError } from '../errors/WildfireApiError';

import type {
  WildfireDevice,
  WildfireErrorResponse,
  WildfireRedeemableAmountResponse,
  WildfireRedemptionHistoryResponse,
  WildfireCloudProfile,
  WildfireRedeemResponse,
} from '../types';

/**
 * WildfireClient is responsible for interacting with the Wildfire API.
 * It provides methods to create and register devices, fetch cloud profiles,
 * and manage gift card balances and transactions.
 */
export class WildfireClient {
  private readonly baseUrl: string;
  private adminDevice: WildfireDevice | undefined;

  private constructor() {
    this.baseUrl = 'https://api.wfi.re';
  }

  static async create(): Promise<WildfireClient> {
    const client = new WildfireClient();
    client.adminDevice = await client.getAdminDevice();
    return client;
  }

  getAdminDevice = async (): Promise<WildfireDevice> => {
    console.debug('🔍 Checking if Admin Device already exists');
    if (this.adminDevice) {
      console.debug('✅ Admin Device already exists');
      return this.adminDevice;
    } else {
      console.debug('❌ Admin Device not found');
      console.debug('🔑 Generating Admin Device');
      const newAdminDevice = await this.createInitialDevice(undefined, true);
      console.debug('✅ Admin Device generated');
      return newAdminDevice;
    }
  };

  /**
   * Creates initial device registration using v2 endpoint.
   * @param deviceKey - Optional device identifier.
   * @param isAdminDevice - Indicates if the device is an admin device.
   * @returns Device registration details.
   * @throws WildfireApiError - If the API request fails.
   */
  private async createInitialDevice(
    deviceKey?: string,
    isAdminDevice = false,
  ): Promise<WildfireDevice> {
    console.debug(
      `🔑 Generating initial device for ${
        isAdminDevice ? 'Admin' : 'Client'
      } Device creation`,
    );
    const headers = generateWildfireAuthHeaders(undefined, isAdminDevice);
    const url = `${this.baseUrl}/v2/device`;

    console.debug('📤 Making initial device request:', {
      url,
      method: 'POST',
      deviceKey: deviceKey || 'none',
    });

    const response: Response = await fetch(url, {
      method: 'POST',
      headers: {
        ...headers,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(deviceKey ? { DeviceKey: deviceKey } : {}),
    });

    console.debug('📥 Initial device response status:', response.status);

    if (!response.ok) {
      const error = (await response.json()) as WildfireErrorResponse;
      console.error('❌ Initial device creation failed:', {
        status: response.status,
        error,
      });
      throw new WildfireApiError(
        error.ErrorMessage || 'Failed to create initial device',
        response.status,
        error,
        url,
        'POST',
      );
    }

    const device = await response.json() as WildfireDevice;
    console.debug(
      `✅ Initial ${
        isAdminDevice ? 'Admin' : 'Client'
      } Device created successfully:`,
      device,
    );
    return device;
  }

  /**
   * Creates a new device registration.
   * @param deviceKey - Optional device identifier.
   * @param deviceToken - Optional device token.
   * @param isAdminDevice - Indicates if the device is an admin device.
   * @returns Device registration details.
   * @throws WildfireApiError - If the API request fails.
   */
  async createDevice(
    deviceKey?: string,
    deviceToken?: string,
    isAdminDevice = false,
  ): Promise<WildfireDevice> {
    console.debug(`📱 Creating ${isAdminDevice ? 'Admin' : 'Client'} Device:`, {
      deviceKey: deviceKey || 'none',
      hasDeviceToken: Boolean(deviceToken),
      version: deviceToken ? 'v3' : 'v2',
    });

    if (!deviceToken) {
      return this.createInitialDevice(deviceKey, isAdminDevice);
    }

    console.debug('🔑 Generating auth headers with device token');
    const headers = generateWildfireAuthHeaders(deviceToken, isAdminDevice);
    const url = `${this.baseUrl}/v3/device`;

    console.debug('📤 Making device creation request:', {
      url,
      method: 'POST',
      deviceKey: deviceKey || 'none',
    });

    const response: Response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(deviceKey ? { DeviceKey: deviceKey } : {}),
    });

    if (!response.ok) {
      const error = (await response.json()) as WildfireErrorResponse;
      console.error('❌ Device creation failed:', error);
      throw new WildfireApiError(
        error.ErrorMessage || 'Failed to create device',
        response.status,
        error,
        url,
        'POST',
      );
    }

    const device = await response.json() as WildfireDevice;
    console.debug(
      `✅ ${isAdminDevice ? 'Admin' : 'Client'} Device created successfully:`,
      device,
    );
    return device;
  }

  /**
   * Registers a device with a customer ID.
   * @param mlCustomerId - The customer ID.
   * @param deviceToken - The device token.
   * @param isAdminDevice - Indicates if the device is an admin device.
   * @returns Resolves when the device is registered.
   * @throws WildfireApiError - If the API request fails.
   */
  async registerDevice(
    mlCustomerId: string,
    deviceToken: string,
    isAdminDevice = false,
  ): Promise<void> {
    console.debug('📝 Registering device:', {
      mlCustomerId,
      hasDeviceToken: !!deviceToken,
    });

    console.debug('🔑 Generating auth headers for device registration');
    const headers = generateWildfireAuthHeaders(deviceToken, isAdminDevice);
    const url = `${this.baseUrl}/v3/sender/auth/partner`;

    console.debug('📤 Making registration request');
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        code: mlCustomerId,
      }),
    });

    console.debug('📥 Registration response status:', response.status);

    if (!response.ok) {
      const error = (await response.json()) as WildfireErrorResponse;
      console.error('❌ Device registration failed:', {
        status: response.status,
        error,
      });
      throw new WildfireApiError(
        error.ErrorMessage || 'Failed to register device',
        response.status,
        error,
        url,
        'POST',
      );
    }

    console.debug('✅ Device registered successfully');
  }

  /**
   * Fetches the Wildfire Cloud Profile for a given device key.
   * 🚨 There is a brief window of time after registering a device
   * 🚨 where the cloud profile may not be available and you will receive a 404.
   * @param deviceKey - The device key.
   * @returns The cloud profile details.
   * @throws WildfireApiError - If the API request fails.
   */
  async getCloudProfile(deviceKey: string): Promise<WildfireCloudProfile> {
    console.debug('☁️ Fetching cloud profile:', { deviceKey });
    const deviceKeyHash = CryptoJS.SHA1(deviceKey).toString();
    const cloudProfileUrl = `https://storage.googleapis.com/wfdp/v3/${deviceKeyHash}.json`;
    const response = await fetch(cloudProfileUrl);

    if (!response.ok) {
      console.error('❌ Failed to fetch cloud profile:', response.status);
      const error = await response.json();
      throw new WildfireApiError(
        'Failed to fetch cloud profile',
        response.status,
        error,
        cloudProfileUrl,
        'GET',
      );
    }

    const cloudProfile = await response.json();
    console.debug('✅ Cloud profile fetched successfully');
    return cloudProfile as WildfireCloudProfile;
  }

  /**
   * Gets the redeemable amount for a device.
   * @param deviceId - The device ID.
   * @returns The redeemable amount.
   * @throws WildfireApiError - If the API request fails.
   */
  async getRedeemableAmount(
    deviceId: string,
  ): Promise<WildfireRedeemableAmountResponse> {
    console.debug('💰 Getting redeemable amount:', { deviceId });
    const adminDevice = await this.getAdminDevice();
    const headers = generateWildfireAuthHeaders(adminDevice.DeviceToken, true);
    const url = `${this.baseUrl}/v2/giftcard/${deviceId}/redeemable`;

    const response = await fetch(url, {
      headers: {
        ...headers,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = (await response.json()) as WildfireErrorResponse;
      throw new WildfireApiError(
        error.ErrorMessage || 'Failed to get redeemable amount',
        response.status,
        error,
        url,
        'GET',
      );
    }

    const redeemableAmount =
      await response.json() as WildfireRedeemableAmountResponse;
    console.debug(
      '🔥 Redeemable amount fetched successfully:',
      JSON.stringify(redeemableAmount, null, 2),
    );
    return redeemableAmount;
  }

  /**
   * Gets the redemption history for a device.
   * @param deviceId - The device ID.
   * @returns The redemption history.
   * @throws WildfireApiError - If the API request fails.
   */
  async getRedemptionHistory(
    deviceId: string,
  ): Promise<WildfireRedemptionHistoryResponse> {
    console.debug('📜 Getting redemption history:', { deviceId });

    const adminDevice = await this.getAdminDevice();
    const headers = generateWildfireAuthHeaders(adminDevice.DeviceToken, true);
    const url = `${this.baseUrl}/v2/giftcard?device_id=${deviceId}`;

    const response = await fetch(url, { headers });

    if (!response.ok) {
      const error = (await response.json()) as WildfireErrorResponse;
      throw new WildfireApiError(
        error.ErrorMessage || 'Failed to get redemption history',
        response.status,
        error,
        url,
        'GET',
      );
    }

    const redemptionHistory =
      await response.json() as WildfireRedemptionHistoryResponse;

    console.debug(
      '🔥 Redemption history fetched successfully:',
      JSON.stringify(redemptionHistory, null, 2),
    );

    return redemptionHistory;
  }

  /**
   * Redeems the gift card balance for a device.
   * @param deviceId - The device ID.
   * @returns The remaining balance after redemption.
   * @throws WildfireApiError - If the API request fails.
   */
  async redeemGiftCard(deviceId: string): Promise<WildfireRedeemResponse> {
    console.debug('💳 Redeeming gift card:', { deviceId });
    const adminDevice = await this.getAdminDevice();
    const headers = generateWildfireAuthHeaders(adminDevice.DeviceToken, true);
    const url = `${this.baseUrl}/v2/giftcard`;

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify({ deviceID: deviceId }),
    });

    if (!response.ok) {
      const error = await response.json() as WildfireErrorResponse;
      console.debug('🚀 ~ WildfireClient ~ error:', error);
      throw new WildfireApiError(
        error.ErrorMessage || 'Failed to redeem gift card',
        response.status,
        error,
        url,
        'POST',
      );
    }

    const redeemData = await response.json() as WildfireRedeemResponse;
    console.debug(
      '🔥 Gift card redeemed successfully:',
      JSON.stringify(redeemData, null, 2),
    );
    return redeemData;
  }
}
