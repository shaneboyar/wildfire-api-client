/* eslint-disable @typescript-eslint/no-explicit-any */
import fetch, { Response } from 'node-fetch';
import CryptoJS from 'crypto-js';

import { WildfireClient } from '../src/client/WildfireClient';

import { generateWildfireAuthHeaders } from '../src/utils/auth';
import { WildfireApiError } from '../src/errors/WildfireApiError';

jest.mock('node-fetch');
jest.mock('../src/utils/auth');
jest.mock('crypto-js');

const createMockResponse = (data: any, options: Partial<Response> = {}) =>
  ({
    ok: true,
    status: 200,
    statusText: 'OK',
    headers: new Map(),
    json: jest.fn().mockResolvedValue(data),
    ...options,
  }) as Response;

const createErrorResponse = (status = 400, errorMessage = 'Error') =>
  createMockResponse(
    { ErrorMessage: errorMessage },
    { ok: false, status, statusText: 'Error' },
  );

describe('WildfireClient', () => {
  let client: WildfireClient;
  const mockFetch = fetch as jest.MockedFunction<typeof fetch>;
  const mockAuthHeaders = generateWildfireAuthHeaders as jest.Mock;

  beforeEach(async () => {
    jest.clearAllMocks();
    mockFetch.mockResolvedValue(
      createMockResponse({ DeviceToken: 'admin-token', DeviceId: 'admin-id' }),
    );
    mockAuthHeaders.mockReturnValue({ Authorization: 'Bearer mock-token' });
    client = await WildfireClient.create();
  });

  describe('Admin Device Management', () => {
    it('creates and caches admin device on initialization', async () => {
      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.wfi.re/v2/device',
        expect.any(Object),
      );
    });

    it('reuses cached admin device', async () => {
      const initialCalls = mockFetch.mock.calls.length;
      await client.getAdminDevice();
      expect(mockFetch.mock.calls).toHaveLength(initialCalls);
    });

    it('creates new admin device if cache is cleared', async () => {
      (client as any).adminDevice = undefined;
      await client.getAdminDevice();
      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.wfi.re/v2/device',
        expect.any(Object),
      );
    });
  });

  describe('Device Operations', () => {
    describe('createDevice', () => {
      it('creates initial device without token', async () => {
        mockFetch.mockResolvedValueOnce(
          createMockResponse({ deviceId: 'new' }),
        );
        await client.createDevice('key123');
        expect(mockFetch).toHaveBeenCalledWith(
          'https://api.wfi.re/v2/device',
          expect.any(Object),
        );
      });

      it('creates device with token using v3 endpoint', async () => {
        mockFetch.mockResolvedValueOnce(
          createMockResponse({ deviceId: 'new' }),
        );
        await client.createDevice('key123', 'token123');
        expect(mockFetch).toHaveBeenCalledWith(
          'https://api.wfi.re/v3/device',
          expect.any(Object),
        );
      });

      it('handles creation errors', async () => {
        mockFetch.mockResolvedValueOnce(createErrorResponse());
        await expect(client.createDevice('key123')).rejects.toThrow(
          WildfireApiError,
        );
      });
    });

    describe('registerDevice', () => {
      it('registers device successfully', async () => {
        mockFetch.mockResolvedValueOnce(createMockResponse({}));
        await client.registerDevice('customer123', 'token123', false);
        expect(mockFetch).toHaveBeenCalledWith(
          'https://api.wfi.re/v3/sender/auth/partner',
          expect.objectContaining({
            body: JSON.stringify({ code: 'customer123' }),
          }),
        );
      });

      it('handles registration errors', async () => {
        mockFetch.mockResolvedValueOnce(createErrorResponse());
        await expect(
          client.registerDevice('customer123', 'token123', false),
        ).rejects.toThrow(WildfireApiError);
      });
    });
  });

  describe('Profile and Balance Operations', () => {
    describe('getCloudProfile', () => {
      it('fetches cloud profile', async () => {
        const mockHash = 'hashed123';
        (CryptoJS.SHA1 as jest.Mock).mockReturnValue({
          toString: () => mockHash,
        });
        mockFetch.mockResolvedValueOnce(
          createMockResponse({ data: 'profile' }),
        );

        await client.getCloudProfile('key123');
        expect(mockFetch).toHaveBeenCalledWith(
          `https://storage.googleapis.com/wfdp/v3/${mockHash}.json`,
        );
      });
    });

    describe('getRedeemableAmount', () => {
      it('fetches redeemable amount', async () => {
        mockFetch.mockResolvedValueOnce(createMockResponse({ amount: 100 }));
        const result = await client.getRedeemableAmount('device123');
        expect(result).toEqual({ amount: 100 });
      });
    });

    describe('getRedemptionHistory', () => {
      it('fetches redemption history', async () => {
        mockFetch.mockResolvedValueOnce(
          createMockResponse({ transactions: [] }),
        );
        await client.getRedemptionHistory('device123');
        expect(mockFetch).toHaveBeenCalledWith(
          expect.stringContaining('/v2/giftcard?device_id=device123'),
          expect.any(Object),
        );
      });
    });

    describe('redeemGiftCard', () => {
      it('redeems gift card successfully', async () => {
        mockFetch.mockResolvedValueOnce(
          createMockResponse({ remainingBalance: 50 }),
        );
        const result = await client.redeemGiftCard('device123');
        expect(result).toEqual({ remainingBalance: 50 });
      });

      it('handles redemption errors', async () => {
        mockFetch.mockResolvedValueOnce(
          createErrorResponse(403, 'Insufficient balance'),
        );
        await expect(client.redeemGiftCard('device123')).rejects.toThrow(
          WildfireApiError,
        );
      });
    });
  });

  describe('Error Handling', () => {
    it('handles network errors', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network failed'));
      await expect(client.getRedeemableAmount('device123')).rejects.toThrow(
        'Network failed',
      );
    });

    it('includes request details in errors', async () => {
      mockFetch.mockResolvedValueOnce(
        createErrorResponse(403, 'Invalid permissions'),
      );
      let error;
      try {
        await client.redeemGiftCard('device123');
      } catch (err) {
        error = err;
      }
      expect(error).toBeInstanceOf(WildfireApiError);
      if (error instanceof WildfireApiError) {
        expect(error.status).toBe(403);
        expect(error.url).toContain('/v2/giftcard');
      }
    });
  });
});
