const REFERRAL_COOKIE = "pr_ref";
/** How long a referral link click is remembered before signup */
const REFERRAL_DAYS = 30;

export function readReferralCode(): string {
  if (typeof document === "undefined") return "";
  const match = document.cookie.match(new RegExp(`(?:^|; )${REFERRAL_COOKIE}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : "";
}

export function saveReferralCode(code: string) {
  document.cookie = `${REFERRAL_COOKIE}=${encodeURIComponent(code)}; Max-Age=${REFERRAL_DAYS * 86400}; Path=/; SameSite=Lax`;
}

export function clearReferralCode() {
  document.cookie = `${REFERRAL_COOKIE}=; Max-Age=0; Path=/; SameSite=Lax`;
}
