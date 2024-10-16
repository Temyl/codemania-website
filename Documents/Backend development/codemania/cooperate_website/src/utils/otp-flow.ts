import { prefixedKey } from './prefixed-key';
import crypto from 'crypto';

export enum OtpFlow {
  LOGIN = 'login',
  VERIFY_PHONE = 'verify_phone',
  VERIFY_EMAIL = 'verify_email',
  RESET_PASSWORD = 'reset_password',
}

export function otpFlowKey(flow: OtpFlow, key: string) {
  return prefixedKey(flow, key);
}

export async function genOtpIdxKey(flow: OtpFlow, otp: string) {
  return crypto.createHmac('sha256', flow).update(otp).digest('hex');
}
