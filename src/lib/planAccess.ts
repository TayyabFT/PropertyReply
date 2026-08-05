import type { ApiUser } from "./api";

export const PUBLISH_REQUIRES_MEMBERSHIP_MESSAGE =
  "Your free trial has ended. To publish your property and reach buyers, choose a membership.";

/** Whether the user can use plan-gated app features right now */
export function userHasPlanAccess(user: ApiUser | null | undefined): boolean {
  if (!user) return false;
  if (user.role === "admin") return true;
  if (!user.plan) return false;

  if (user.onTrial) return true;

  if (
    user.subscriptionStatus === "trialing" &&
    user.trialEndsAt &&
    new Date(user.trialEndsAt) > new Date()
  ) {
    return true;
  }

  if (user.subscriptionStatus === "active") return true;

  return false;
}

/** Paid membership required to publish listings */
export function userHasPaidSubscription(
  user: ApiUser | null | undefined,
): boolean {
  if (!user) return false;
  if (user.role === "admin") return true;
  return user.subscriptionStatus === "active" && Boolean(user.plan) && !user.onTrial;
}
