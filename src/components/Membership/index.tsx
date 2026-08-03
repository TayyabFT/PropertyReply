"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import PlanCard from "./PlanCard";
import { plans } from "./plans";
import { useAuth } from "@/lib/auth";
import { authApi, billingApi, ApiRequestError } from "@/lib/api";

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
        // Reconcile directly from the Stripe session — works even if the
        // webhook hasn't been delivered yet (e.g. no local webhook forwarding).
        await confirmViaSession();
        if (cancelled) return;

        // Always refresh from /auth/me — this is what actually syncs the
        // logged-in user object (and its subscriptionStatus) held in AuthContext.
        // Skipping this left the app thinking the user was still unsubscribed
        // even after a successful checkout, bouncing them right back here.
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
    if (!token || planId !== "premium") return;

    const planName = "Premium";
    setError("");
    setCheckoutLoadingPlan(planId);

    try {
      const response = await billingApi.checkout(token, planName);
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

  return (
    <section className="section section-alt" id="membership">
      <div className="container text-center">
        <div className="section-header center">
          <div className="section-eyebrow" style={{ justifyContent: "center" }}>
            Membership Plans
          </div>
          <h2>Choose Your Access Level</h2>
          <p className="muted">
            Upgrade to unlock full deal data, contact details, and advanced
            analysis.
          </p>
        </div>

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
          {plans.map((plan) => (
            <PlanCard
              key={plan.id}
              plan={plan}
              isCurrent={plan.id === currentPlanId}
              loading={checkoutLoadingPlan === plan.id}
              onSelect={
                plan.comingSoon || plan.id !== "premium"
                  ? undefined
                  : () => handleSelect(plan.id)
              }
            />
          ))}
        </div>

        {Boolean(currentPlanId) && (
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
          All plans billed monthly. Cancel anytime. Membership renewal reminders
          sent 7 days before each billing date.
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
