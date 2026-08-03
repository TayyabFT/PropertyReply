import { redirect } from "next/navigation";

type PageProps = {
  searchParams?: Record<string, string | string[] | undefined>;
};

export default function DashboardKycRedirect({ searchParams }: PageProps) {
  const params = new URLSearchParams();
  const reason = searchParams?.reason;
  if (typeof reason === "string") params.set("reason", reason);
  const query = params.toString();
  redirect(query ? `/app/kyc?${query}` : "/app/kyc");
}
