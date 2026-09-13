export const MOBILE_PATTERN = /^(\+91)?[6-9]\d{9}$/;
export const OTP_PATTERN = /^\d{6}$/;

export function isValidMobile(value: string): boolean {
  return MOBILE_PATTERN.test(value);
}

export function isValidOtp(value: string): boolean {
  return OTP_PATTERN.test(value);
}
