import { actions } from './actions';

export interface Answers {
  useKey?: boolean;
  printCurl?: boolean;
  key?: string;
  customerId?: string;
  token?: string;
  deviceKey?: string;
  deviceId?: string;
  action?: keyof typeof actions | 'exit';
}

export interface RedeemAnswers extends Answers {
  confirm: boolean;
}
