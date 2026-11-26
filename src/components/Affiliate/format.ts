import type { AffiliateReport } from "@/lib/api";

const gbp = new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" });

export function formatGBP(value: number): string {
  return gbp.format(value);
}

export function formatDate(value: string | null | undefined): string {
  return value ? new Date(value).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "—";
}

type Commission = AffiliateReport["referrals"][number]["commission"];

export function commissionBadge(commission: Commission): { label: string; className: string } {
  if (!commission) return { label: "Not subscribed yet", className: "tag" };
  if (commission.status === "paid") return { label: `${formatGBP(commission.amountGBP)} paid`, className: "tag badge-green" };
  if (commission.status === "void") return { label: "Cancelled", className: "tag badge-red" };
  return { label: `${formatGBP(commission.amountGBP)} unpaid`, className: "tag badge-amber" };
}

export function affiliateMetrics(report: Pick<AffiliateReport, "clicks" | "signups" | "payingCustomers" | "pendingGBP" | "paidGBP">) {
  return [
    { label: "Link clicks", value: report.clicks.toLocaleString("en-GB") },
    { label: "Signups", value: report.signups.toLocaleString("en-GB") },
    { label: "Paying customers", value: report.payingCustomers.toLocaleString("en-GB") },
    { label: "Unpaid commission", value: formatGBP(report.pendingGBP) },
    { label: "Paid out", value: formatGBP(report.paidGBP) },
  ];
}
