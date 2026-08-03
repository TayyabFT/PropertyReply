import { Suspense } from "react";
import DealAnalysis from "@/components/DealAnalysis";

export default function DealAnalysisPage() {
  return (
    <Suspense
      fallback={
        <section className="section" id="deal-analysis">
          <div className="container">
            <div className="page-head">
              <h1>Deal Analysis</h1>
              <p>Loading analysis…</p>
            </div>
          </div>
        </section>
      }
    >
      <DealAnalysis />
    </Suspense>
  );
}
