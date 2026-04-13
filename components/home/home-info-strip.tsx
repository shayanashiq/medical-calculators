import { SITE_BRAND, SITE_DOMAIN } from "@/lib/site-brand";

export function HomeInfoStrip() {
  return (
    <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
      <div className="glass-panel rounded-3xl border border-slate-200 p-6 sm:p-8">
        <h2 className="text-2xl font-bold text-slate-900">
          {SITE_BRAND} for every goal — {SITE_DOMAIN}
        </h2>
        <p className="mt-4 text-sm leading-7 text-slate-700">
          Medical calculator tools for daily wellness and clinical planning. Every calculator runs in
          your browser with instant results and no signup.
        </p>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div className="card-elevated rounded-2xl border border-emerald-100/80 bg-emerald-50/90 p-5">
            <h3 className="font-semibold text-emerald-900">Most Popular Calculators</h3>
            <ul className="mt-3 space-y-2 text-sm text-emerald-900/90">
              <li>— BMI, BMR, TDEE and body composition tools</li>
              <li>— Water intake and target heart rate calculators</li>
              <li>— Creatinine clearance, anion gap and MAP tools</li>
            </ul>
          </div>
          <div className="card-elevated rounded-2xl border border-sky-100/80 bg-sky-50/90 p-5">
            <h3 className="font-semibold text-sky-900">Key Features</h3>
            <ul className="mt-3 space-y-2 text-sm text-sky-900/90">
              <li>— 100% frontend-only with instant response</li>
              <li>— Mobile-friendly and clean professional UI</li>
              <li>— Reusable component-based architecture</li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
