import { Suspense } from "react";
import SubmitListing from "@/components/SubmitListing";

export default function SubmitPage() {
  return (
    <Suspense fallback={<p className="muted">Loading submissions…</p>}>
      <SubmitListing />
    </Suspense>
  );
}
