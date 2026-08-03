import { Suspense } from "react";
import Kyc from "@/components/Kyc";

export default function KycPage() {
  return (
    <Suspense fallback={<p className="muted">Loading verification…</p>}>
      <Kyc />
    </Suspense>
  );
}
