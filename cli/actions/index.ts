import { createDevice } from './createDevice';
import { registerDevice } from './registerDevice';
import { getCloudProfile } from './cloudProfile';
import { getRedeemableAmount } from './redeemableAmount';
import { getRedemptionHistory } from './redemptionHistory';
import { clearCache } from './clearCache';
import { redeem } from './redeem';

export const actions = {
  createDevice,
  registerDevice,
  cloudProfile: getCloudProfile,
  redeemableAmount: getRedeemableAmount,
  redemptionHistory: getRedemptionHistory,
  clearCache,
  redeem,
} as const;

export type ActionType = keyof typeof actions;
