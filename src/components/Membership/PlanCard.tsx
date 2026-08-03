import type { CSSProperties } from "react";

export type PlanFeature = {
  included: boolean;
  text: string;
};

export type Plan = {
  id: string;
  cardClass: string;
  badge?: string;
  tagClass: string;
  tagLabel: string;
  price: string;
  priceNote?: string;
  desc: string;
  features: PlanFeature[];
  buttonClass: string;
  buttonStyle: CSSProperties;
  buttonLabel: string;
  comingSoon?: boolean;
};

type PlanCardProps = {
  plan: Plan;
  isCurrent?: boolean;
  loading?: boolean;
  onSelect?: () => void;
};

export default function PlanCard({
  plan,
  isCurrent = false,
  loading = false,
  onSelect,
}: PlanCardProps) {
  const label = plan.comingSoon
    ? "Coming Soon"
    : isCurrent
      ? "Current Plan"
      : loading
        ? "Please wait…"
        : plan.buttonLabel;

  return (
    <div
      className={`${plan.cardClass}${plan.comingSoon ? " is-coming-soon" : ""}`}
    >
      {plan.badge && <div className="plan-badge">{plan.badge}</div>}
      {plan.comingSoon && (
        <div className="plan-coming-soon-badge">Coming Soon</div>
      )}
      <div className={plan.tagClass}>{plan.tagLabel}</div>
      <div className={`plan-price${plan.comingSoon ? " plan-blurred" : ""}`}>
        {plan.price}
        <span>/mo</span>
      </div>
      {plan.priceNote && (
        <p
          className={`muted${plan.comingSoon ? " plan-blurred" : ""}`}
          style={{ fontSize: ".78rem", marginTop: "-8px" }}
        >
          {plan.priceNote}
        </p>
      )}
      <p className={`plan-desc${plan.comingSoon ? " plan-blurred" : ""}`}>
        {plan.desc}
      </p>
      <ul className={`plan-features${plan.comingSoon ? " plan-blurred" : ""}`}>
        {plan.features.map((feature, index) => (
          <li key={`${plan.id}-feature-${index}`}>
            <span className={feature.included ? "check" : "cross"}>
              {feature.included ? "✓" : "✗"}
            </span>{" "}
            {feature.text}
          </li>
        ))}
      </ul>
      <button
        type="button"
        className={
          plan.comingSoon || isCurrent ? "btn btn-outline" : plan.buttonClass
        }
        style={plan.buttonStyle}
        onClick={onSelect}
        disabled={plan.comingSoon || isCurrent || loading || !onSelect}
      >
        {label}
      </button>
    </div>
  );
}
