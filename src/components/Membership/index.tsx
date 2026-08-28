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
  const [showAllPlans, setShowAllPlans] = useState(false);
  const [error, setError] = useState("");
  const [banner, setBanner] = useState<{
    type: "success" | "info";
    text: string;
  } | null>(null);

  const checkoutParam = searchParams.get("checkout");
  const sessionId = searchParams.get("session_id");
  const inviteFromUrl = searchParams.get("invite") || "";

  const [inviteCode, setInviteCode] = useState(inviteFromUrl);
  const [showInviteBox, setShowInviteBox] = useState(Boolean(inviteFromUrl));

  const canStartTrial = userCanStartTrial(user);
  const trialEnded = userTrialHasEnded(user);
  const onTrial = Boolean(user?.onTrial);
  const onCommercial = Boolean(user?.onCommercial || user?.plan === "Commercial");
  const hasPaid = userHasPaidSubscription(user);
  const showTrialCard = !user || canStartTrial;

  useEffect(() => {
    if (inviteFromUrl) {
      setInviteCode(inviteFromUrl);
      setShowInviteBox(true);
    }
  }, [inviteFromUrl]);

  const allPlans = useMemo(() => {
    // Hide Founders Club card when already on Commercial
    const base = onCommercial
      ? plans.filter((p) => p.id !== "commercial")
      : plans;
    if (showTrialCard) return [freeTrialPlan, ...base];
    return base;
  }, [showTrialCard, onCommercial]);

  // Default: 3 cards. Expand with "See all plans".
  const displayPlans = useMemo(() => {
    if (showAllPlans) return allPlans;
    return allPlans.slice(0, 3);
  }, [allPlans, showAllPlans]);

  const hasMorePlans = allPlans.length > 3;

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

    if (planId === "commercial") {
      if (!token) {
        router.push(`/login?next=${encodeURIComponent("/app/membership?invite=" + (inviteCode || ""))}`);
        return;
      }
      setShowInviteBox(true);
      if (!inviteCode.trim()) {
        setError("Enter your Founders Club invite code to continue.");
        return;
      }
      setError("");
      setCheckoutLoadingPlan("commercial");
      try {
        const response = await billingApi.commercialCheckout(
          token,
          inviteCode.trim(),
        );
        window.location.href = response.data.url;
      } catch (err) {
        setError(
          err instanceof ApiRequestError
            ? err.message
            : "Unable to start Founders Club checkout.",
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
  const paidCurrentPlanId =
    onTrial || user?.subscriptionStatus === "trialing"
      ? ""
      : currentPlanId === "commercial"
        ? "commercial"
        : currentPlanId;

  const handleCommercialInviteSubmit = async () => {
    await handleSelect("commercial");
  };

  return (
    <section className="section section-alt" id="membership">
      <div className="container text-center">
        <div className="section-header center">
          <div className="section-eyebrow" style={{ justifyContent: "center" }}>
            Membership Plans
          </div>
          <h2>Choose Your Access Level</h2>
          <p className="muted">
            Start with a 7-day free Premium trial, subscribe to Premium, or join
            Founders Club with an invite (£25/mo, no listing fees, 5% success
            fee). Standard publishing has a £10 listing fee.
          </p>
        </div>

        {user && onCommercial && (
          <div
            className="alert alert-info"
            style={{ margin: "16px auto", maxWidth: "560px" }}
          >
            <span>i</span>
            <span>
              You&apos;re on <strong>Founders Club</strong>
              {user.commercialPartnershipEndsAt
                ? ` until ${new Date(user.commercialPartnershipEndsAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}`
                : ""}
              . Listing fees are waived; success fee is 5% on completed deals.
            </span>
          </div>
        )}

        {user && onTrial && trialEndsLabel && (
          <div
            className="alert alert-info"
            style={{ margin: "16px auto", maxWidth: "520px" }}
          >
            <span>i</span>
            <span>
              You&apos;re on a free trial until{" "}
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

        {(showInviteBox || inviteFromUrl) && !onCommercial && (
          <div
            style={{
              margin: "16px auto 8px",
              maxWidth: "480px",
              padding: "16px",
              border: "1px solid rgba(0,0,0,.08)",
              borderRadius: "12px",
              textAlign: "left",
              background: "var(--white)",
            }}
          >
            <p style={{ fontWeight: 600, marginBottom: "8px" }}>
              Founders Club invite
            </p>
            <p className="muted" style={{ fontSize: ".85rem", marginBottom: "12px" }}>
              Enter the invite code from Property Reply to unlock £25/mo
              Commercial Partnership checkout.
            </p>
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              <input
                type="text"
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                placeholder="FC-XXXXXX"
                style={{ flex: 1, minWidth: "160px", padding: "10px 12px" }}
              />
              <button
                type="button"
                className="btn btn-gold btn-sm"
                disabled={checkoutLoadingPlan === "commercial"}
                onClick={handleCommercialInviteSubmit}
              >
                {checkoutLoadingPlan === "commercial"
                  ? "Please wait…"
                  : "Activate →"}
              </button>
            </div>
          </div>
        )}

        <div className="membership-grid" style={{ marginTop: "8px" }}>
          {displayPlans.map((plan) => {
            const isSelectable =
              !plan.comingSoon &&
              (plan.id === "trial" ||
                plan.id === "premium" ||
                plan.id === "commercial");

            return (
              <PlanCard
                key={plan.id}
                plan={
                  plan.id === "premium" && showTrialCard
                    ? { ...plan, cardClass: "plan-card" }
                    : plan.id === "commercial" && onCommercial
                      ? { ...plan, buttonLabel: "Current Plan" }
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

        {hasMorePlans && (
          <button
            type="button"
            className="btn btn-outline"
            style={{ marginTop: "20px" }}
            onClick={() => setShowAllPlans((v) => !v)}
          >
            {showAllPlans ? "Show fewer plans" : "See all plans"}
          </button>
        )}

        {Boolean(paidCurrentPlanId) && hasPaid && (
          <button
            type="button"
            className="btn btn-outline"
            style={{ marginTop: "20px", marginLeft: hasMorePlans ? "10px" : 0 }}
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
