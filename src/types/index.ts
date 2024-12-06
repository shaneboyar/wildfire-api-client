export interface WildfireDevice {
  DeviceID: number;
  DeviceKey: string;
  DeviceToken: string;
}

export interface WildfireErrorResponse {
  ErrorMessage: string;
}

export interface WildfireAuthHeaders extends Record<string, string> {
  Authorization: string;
  'X-WF-DateTime': string;
  'Content-Type': 'application/json';
}

export interface WildfireRedeemableAmountResponse {
  Amount: string;
  Currency: string;
}

export interface WildfireRedemptionHistoryResponse {
  Links: WildfireRedeemResponse[];
}

export interface WildfireRedeemResponse {
  senderID: number;
  url: string;
  amount: string;
  currency: string;
  createdDate: string;
}

export interface WildfireAmount {
  Amount: string;
  Currency: string;
}

export interface WildfireCommissionStatsSummary {
  PendingAmount: WildfireAmount;
  ReadyAmount: WildfireAmount;
  PaidAmount: WildfireAmount;
}

export interface WildfireCommissionDetail {
  ID: number;
  CommissionIDs: number[];
  Date: string;
  Amount: WildfireAmount;
  Status: string;
  Merchant: string;
}

export interface WildfireCloudProfileMetadata {
  PaypalConnected: boolean;
  Created: string;
}

export interface WildfireCloudProfile {
  CommissionStatsSummary: WildfireCommissionStatsSummary;
  CommissionStatsDetail: WildfireCommissionDetail[];
  Notifications: string; // Can be more specific if needed
  Metadata: WildfireCloudProfileMetadata;
}
