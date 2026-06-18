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
  desc: string;
  features: PlanFeature[];
  buttonClass: string;
  buttonStyle: CSSProperties;
  buttonLabel: string;
};

export default function PlanCard({ plan }: { plan: Plan }) {
  return (
    <div className={plan.cardClass}>
      {plan.badge && <div className="plan-badge">{plan.badge}</div>}
      <div className={plan.tagClass}>{plan.tagLabel}</div>
      <div className="plan-price">
        {plan.price}
        <span>/mo</span>
      </div>
      <p className="plan-desc">{plan.desc}</p>
      <ul className="plan-features">
        {plan.features.map((feature, index) => (
          <li key={`${plan.id}-feature-${index}`}>
            <span className={feature.included ? "check" : "cross"}>
              {feature.included ? "✓" : "✗"}
            </span>{" "}
            {feature.text}
          </li>
        ))}
      </ul>
      <button className={plan.buttonClass} style={plan.buttonStyle}>
        {plan.buttonLabel}
      </button>
    </div>
  );
}
