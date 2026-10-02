import type { ApiUser } from "./api";

export const PUBLISH_REQUIRES_MEMBERSHIP_MESSAGE =
  "Your free trial has ended. To publish your property and reach buyers, choose a membership.";

/** Short label for sidebar / profile (e.g. "Free Trial", "Premium Member") */
export function userPlanLabel(user: ApiUser | null | undefined): string {
  if (!user) return "No Plan";
  if (user.role === "admin") return "Admin";
  if (user.plan === "InvitedPartner") return userHasPlanAccess(user) ? "Invited Partner" : "Invited Partner · Ended";
  if (user.onCommercial || user.plan === "Commercial") return "Founders Club";
  if (user.onTrial || (user.plan && !user.hasPaidPlan && user.subscriptionStatus === "trialing")) {
    return "Free Trial";
  }
  // Complimentary Premium without Stripe must not look like a paid membership
  if (user.plan && !user.hasPaidPlan) {
    if (
      user.trialEndsAt &&
      new Date(user.trialEndsAt) > new Date()
    ) {
      return "Free Trial";
    }
    if (user.subscriptionStatus === "trialing") return "Free Trial";
  }
  if (user.hasPaidPlan && user.plan === "Commercial") return "Founders Club";
  if (user.hasPaidPlan && user.plan) return `${user.plan} Member`;
  if (user.plan && user.subscriptionStatus === "active" && user.hasPaidPlan) {
    return `${user.plan} Member`;
  }
  return "No Plan";
}

/** Whether the user can use plan-gated app features right now */
export function userHasPlanAccess(user: ApiUser | null | undefined): boolean {
  if (!user) return false;
  if (user.role === "admin") return true;
  if (user.plan === "InvitedPartner") return Boolean(user.subscriptionStatus === "active" && user.invitedPartnerEndsAt && new Date(user.invitedPartnerEndsAt) > new Date());
  if (user.invitedPartnerStartedAt) return Boolean(user.hasPaidPlan && user.subscriptionStatus === "active");
  if (user.onCommercial || user.plan === "Commercial") return true;
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
  if (user.plan === "InvitedPartner") return userHasPlanAccess(user);
  if (typeof user.hasPaidPlan === "boolean") return user.hasPaidPlan;
  if (user.onCommercial || user.plan === "Commercial") return true;
  return user.subscriptionStatus === "active" && Boolean(user.plan) && !user.onTrial;
}

/** One-time free trial still available */
export function userCanStartTrial(user: ApiUser | null | undefined): boolean {
  if (!user || user.role === "admin") return false;
  if (user.invitedPartnerStartedAt) return false;
  if (typeof user.canStartTrial === "boolean") return user.canStartTrial;
  if (user.onTrial || userHasPaidSubscription(user)) return false;
  return !user.trialEndsAt;
}

/** Trial was used and has ended (logged-in users only) */
export function userTrialHasEnded(user: ApiUser | null | undefined): boolean {
  if (!user || user.role === "admin") return false;
  if (user.onTrial || userHasPlanAccess(user)) return false;
  return Boolean(user.trialEndsAt);
}
