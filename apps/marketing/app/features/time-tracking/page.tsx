import Link from "next/link";

export const metadata = {
  title: "Time Tracking Software for Service Teams | Strata",
  description:
    "Track time against jobs accurately with Strata’s built-in time tracking and timesheets. Improve productivity, billing accuracy, and job profitability."
};

export default function TimeTrackingPage() {
  return (
    <section className="pt-28 pb-16 md:pt-32 md:pb-20 lg:pt-36 lg:pb-28">
      <div className="container">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="mb-4 text-3xl font-bold text-black dark:text-white sm:text-4xl">
            Time Tracking Software Built for Job-Based Work
          </h1>
          <p className="text-base text-body-color sm:text-lg">
            Strata’s time tracking tools help service businesses capture time accurately, reduce admin overhead, and ensure every billable hour is accounted for — all directly linked to jobs and projects.
          </p>
        </div>

        <div className="mt-12 grid gap-8 lg:grid-cols-2">
          <div className="rounded-sm bg-white p-6 shadow-three dark:bg-gray-dark">
            <h2 className="mb-3 text-2xl font-semibold text-black dark:text-white">
              Track Time Where the Work Happens
            </h2>
            <p className="text-body-color">
              Log time directly against jobs, tasks, or projects. No disconnected timesheets, no lost hours.
            </p>
            <ul className="mt-4 list-disc space-y-2 pl-5 text-body-color">
              <li>Job-based time capture</li>
              <li>Centralised timesheets</li>
              <li>Real-time visibility for managers</li>
            </ul>
          </div>

          <div className="rounded-sm bg-white p-6 shadow-three dark:bg-gray-dark">
            <h2 className="mb-3 text-2xl font-semibold text-black dark:text-white">
              Accurate Timesheets &amp; Billing
            </h2>
            <p className="text-body-color">
              Strata converts tracked time into clean, reliable timesheets that flow directly into quoting, invoicing, and reporting.
            </p>
            <ul className="mt-4 list-disc space-y-2 pl-5 text-body-color">
              <li>Reduce billing disputes</li>
              <li>Improve invoice accuracy</li>
              <li>Eliminate manual reconciliation</li>
            </ul>
          </div>

          <div className="rounded-sm bg-white p-6 shadow-three dark:bg-gray-dark lg:col-span-2">
            <h2 className="mb-3 text-2xl font-semibold text-black dark:text-white">
              Improve Productivity &amp; Profitability
            </h2>
            <p className="text-body-color">
              Understand how long work actually takes and where time is being spent.
            </p>
            <ul className="mt-4 list-disc space-y-2 pl-5 text-body-color">
              <li>Identify inefficiencies</li>
              <li>Compare estimated vs actual time</li>
              <li>Improve future quoting accuracy</li>
            </ul>
          </div>
        </div>

        <div className="mt-12 rounded-sm bg-gray-light p-6 dark:bg-gray-dark">
          <h3 className="text-xl font-semibold text-black dark:text-white">FAQ</h3>
          <p className="mt-3 text-body-color">
            <strong>Does Strata include built-in time tracking?</strong> Yes. Time tracking and timesheets are native features, fully connected to jobs and billing.
          </p>
        </div>

        <div className="mt-10 flex flex-wrap items-center gap-4">
          <Link href="/features" className="text-primary hover:underline">
            Back to Features
          </Link>
          <Link href="/pricing" className="text-primary hover:underline">
            View Pricing
          </Link>
          <Link href="/features/reporting-dashboards" className="text-primary hover:underline">
            See Reporting &amp; Dashboards
          </Link>
        </div>
      </div>
    </section>
  );
}
