import PlanCard from "./PlanCard";
import { plans } from "./plans";

export default function Membership() {
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

        <div className="membership-grid" style={{ marginTop: "8px" }}>
          {plans.map((plan) => (
            <PlanCard key={plan.id} plan={plan} />
          ))}
        </div>

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
