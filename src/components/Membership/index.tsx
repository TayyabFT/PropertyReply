"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import PlanCard from "./PlanCard";
import { freeTrialPlan, plans } from "./plans";
import { useAuth } from "@/lib/auth";
import { authApi, billingApi, ApiRequestError } from "@/lib/api";
import {
  userCanStartTrial,
  userHasPaidSubscription,
  userTrialHasEnded,
} from "@/lib/planAccess";

function MembershipContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, token, updateUser } = useAuth();

  const [checkoutLoadingPlan, setCheckoutLoadingPlan] = useState<string | null>(
    null,
  );
  const [portalLoading, setPortalLoading] = useState(false);
  const [error, setError] = useState("");
  const [banner, setBanner] = useState<{
    type: "success" | "info";
    text: string;
  } | null>(null);

  const checkoutParam = searchParams.get("checkout");
  const sessionId = searchParams.get("session_id");

  const canStartTrial = userCanStartTrial(user);
  const trialEnded = userTrialHasEnded(user);
  const onTrial = Boolean(user?.onTrial);
  const hasPaid = userHasPaidSubscription(user);

  const displayPlans = useMemo(() => {
    // Show free-trial card for logged-out visitors (CTA → register)
    // and for logged-in users who are still eligible.
    if (!user || canStartTrial) {
      return [freeTrialPlan, ...plans];
    }
    return plans;
  }, [user, canStartTrial]);

  useEffect(() => {
    if (!checkoutParam || !token) return;

    if (checkoutParam === "cancelled") {
      setBanner({ type: "info", text: "Checkout was cancelled — no changes were made." });
      router.replace("/app/membership", { scroll: false });
      return;
    }

    if (checkoutParam === "success") {
      let cancelled = false;

      const refreshUser = async () => {
        try {
          const response = await authApi.me(token);
          if (!cancelled) updateUser(response.data.user);
          return response.data.user.plan;
        } catch {
          return null;
        }
      };

      const confirmViaSession = async () => {
        if (!sessionId) return null;
        try {
          const response = await billingApi.confirmCheckout(token, sessionId);
          return response.data.plan;
        } catch {
          return null;
        }
      };

      const run = async () => {
        await confirmViaSession();
        if (cancelled) return;

        const finalPlan = await refreshUser();
        if (cancelled) return;

        setBanner({
          type: finalPlan ? "success" : "info",
          text: finalPlan
            ? `You're now on the ${finalPlan} plan!`
            : "Checkout completed, but we couldn't confirm your new plan yet. It should update within a minute — refresh this page if not.",
        });

        if (finalPlan) {
          router.replace("/app/dashboard");
        } else {
          router.replace("/app/membership", { scroll: false });
        }
      };

      run();
      return () => {
        cancelled = true;
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [checkoutParam, sessionId, token]);

  const handleSelect = async (planId: string) => {
    if (planId === "trial") {
      if (!token) {
        router.push("/register");
        return;
      }
      setError("");
      setCheckoutLoadingPlan("trial");
      try {
        const response = await billingApi.startTrial(token);
        updateUser(response.data.user);
        setBanner({
          type: "success",
          text: "Your 7-day free Premium trial has started. Enjoy browsing deals!",
        });
        router.replace("/app/dashboard");
      } catch (err) {
        setError(
          err instanceof ApiRequestError
            ? err.message
            : "Unable to start your free trial. Please try again.",
        );
        setCheckoutLoadingPlan(null);
      }
      return;
    }

    if (planId !== "premium") return;

    if (!token) {
      router.push("/register");
      return;
    }

    setError("");
    setCheckoutLoadingPlan(planId);

    try {
      const response = await billingApi.checkout(token, "Premium");
      window.location.href = response.data.url;
    } catch (err) {
      setError(
        err instanceof ApiRequestError
          ? err.message
          : "Unable to start checkout. Is the API running?",
      );
      setCheckoutLoadingPlan(null);
    }
  };

  const handleManageBilling = async () => {
    if (!token) return;
    setError("");
    setPortalLoading(true);

    try {
      const response = await billingApi.portal(token);
      window.location.href = response.data.url;
    } catch (err) {
      setError(
        err instanceof ApiRequestError
          ? err.message
          : "Unable to open billing portal.",
      );
      setPortalLoading(false);
    }
  };

  const currentPlanId = (user?.plan || "").toLowerCase();
  const trialEndsLabel = user?.trialEndsAt
    ? new Date(user.trialEndsAt).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : null;
  // Trial users should still be able to buy Premium (don't treat as "Current Plan")
  const paidCurrentPlanId =
    onTrial || user?.subscriptionStatus === "trialing" ? "" : currentPlanId;

  return (
    <section className="section section-alt" id="membership">
      <div className="container text-center">
        <div className="section-header center">
          <div className="section-eyebrow" style={{ justifyContent: "center" }}>
            Membership Plans
          </div>
          <h2>Choose Your Access Level</h2>
          <p className="muted">
            Start with a 7-day free Premium trial to browse deals and prepare
            listings, or subscribe now. Publishing requires a paid membership —
            each listing has a £10 fee.
          </p>
        </div>

        {user && onTrial && trialEndsLabel && (
          <div
            className="alert alert-info"
            style={{ margin: "16px auto", maxWidth: "520px" }}
          >
            <span>i</span>
            <span>
              You&apos;re on a free Premium trial until{" "}
              <strong>{trialEndsLabel}</strong>. Subscribe before it ends to keep
              browsing deals — you can upgrade anytime below.
            </span>
          </div>
        )}

        {user && trialEnded && (
          <div
            className="alert alert-error"
            style={{ margin: "16px auto", maxWidth: "520px" }}
          >
            <span>!</span>
            <span>
              Your free trial has ended. Choose a plan below to continue using
              PropertyReply.
            </span>
          </div>
        )}

        {banner && (
          <div
            className={
              banner.type === "success" ? "alert alert-success" : "alert alert-info"
            }
            style={{ margin: "16px auto", maxWidth: "480px" }}
          >
            <span>{banner.type === "success" ? "✓" : "i"}</span>
            <span>{banner.text}</span>
          </div>
        )}

        {error && (
          <div
            className="alert alert-error"
            style={{ margin: "16px auto", maxWidth: "480px" }}
          >
            <span>!</span>
            <span>{error}</span>
          </div>
        )}

        <div className="membership-grid" style={{ marginTop: "8px" }}>
          {displayPlans.map((plan) => {
            const isSelectable =
              !plan.comingSoon &&
              (plan.id === "trial" || plan.id === "premium");

            return (
              <PlanCard
                key={plan.id}
                plan={
                  plan.id === "premium" && (canStartTrial || !user)
                    ? { ...plan, cardClass: "plan-card" }
                    : plan.id === "trial"
                      ? plan
                      : plan.id === "premium" && onTrial
                        ? {
                            ...plan,
                            cardClass: "plan-card featured",
                            buttonLabel: "Upgrade to Premium →",
                          }
                        : plan
                }
                isCurrent={plan.id === paidCurrentPlanId}
                loading={checkoutLoadingPlan === plan.id}
                onSelect={
                  isSelectable ? () => handleSelect(plan.id) : undefined
                }
              />
            );
          })}
        </div>

        {Boolean(paidCurrentPlanId) && hasPaid && (
          <button
            type="button"
            className="btn btn-outline"
            style={{ marginTop: "20px" }}
            onClick={handleManageBilling}
            disabled={portalLoading}
          >
            {portalLoading ? "Opening billing portal…" : "Manage Billing"}
          </button>
        )}

        <p
          style={{
            marginTop: "24px",
            fontSize: ".82rem",
            color: "var(--slate)",
          }}
        >
          One free 7-day trial per account. Publish listings after you
          subscribe — £10 listing fee per property. Plans billed monthly;
          cancel anytime.
        </p>
      </div>
    </section>
  );
}

export default function Membership() {
  return (
    <Suspense fallback={null}>
      <MembershipContent />
    </Suspense>
  );
}
