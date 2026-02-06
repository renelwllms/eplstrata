import Link from "next/link";

export const metadata = {
  title: "Job Reporting & Dashboards for Service Businesses | Strata",
  description:
    "Gain real-time visibility into jobs, performance, and profitability with Strata’s reporting and dashboards."
};

export default function ReportingDashboardsPage() {
  return (
    <section className="pt-28 pb-16 md:pt-32 md:pb-20 lg:pt-36 lg:pb-28">
      <div className="container">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="mb-4 text-3xl font-bold text-black dark:text-white sm:text-4xl">
            Real-Time Reporting for Better Decisions
          </h1>
          <p className="text-base text-body-color sm:text-lg">
            Strata turns operational data into clear insights so business owners and managers can make informed decisions faster.
          </p>
        </div>

        <div className="mt-12 grid gap-8 lg:grid-cols-2">
          <div className="rounded-sm bg-white p-6 shadow-three dark:bg-gray-dark">
            <h2 className="mb-3 text-2xl font-semibold text-black dark:text-white">
              Job Performance at a Glance
            </h2>
            <p className="text-body-color">
              Track job status, progress, and outcomes across your entire operation.
            </p>
            <ul className="mt-4 list-disc space-y-2 pl-5 text-body-color">
              <li>Active vs completed jobs</li>
              <li>Delays and bottlenecks</li>
              <li>Delivery performance</li>
            </ul>
          </div>

          <div className="rounded-sm bg-white p-6 shadow-three dark:bg-gray-dark">
            <h2 className="mb-3 text-2xl font-semibold text-black dark:text-white">
              Understand Profitability
            </h2>
            <p className="text-body-color">
              See how time, costs, and revenue come together on each job.
            </p>
            <ul className="mt-4 list-disc space-y-2 pl-5 text-body-color">
              <li>Job costing visibility</li>
              <li>Margin analysis</li>
              <li>Better forecasting</li>
            </ul>
          </div>

          <div className="rounded-sm bg-white p-6 shadow-three dark:bg-gray-dark lg:col-span-2">
            <h2 className="mb-3 text-2xl font-semibold text-black dark:text-white">
              One Source of Truth
            </h2>
            <p className="text-body-color">
              No exporting, no spreadsheets, no manual reporting.
            </p>
            <ul className="mt-4 list-disc space-y-2 pl-5 text-body-color">
              <li>Live dashboards</li>
              <li>Centralised data</li>
              <li>Accurate insights</li>
            </ul>
          </div>
        </div>

        <div className="mt-12 rounded-sm bg-gray-light p-6 dark:bg-gray-dark">
          <h3 className="text-xl font-semibold text-black dark:text-white">FAQ</h3>
          <p className="mt-3 text-body-color">
            <strong>Can Strata show job profitability and performance?</strong> Yes. Reporting connects time, costs, and revenue to give a complete picture.
          </p>
        </div>

        <div className="mt-10 flex flex-wrap items-center gap-4">
          <Link href="/features" className="text-primary hover:underline">
            Back to Features
          </Link>
          <Link href="/pricing" className="text-primary hover:underline">
            View Pricing
          </Link>
          <Link href="/features/time-tracking" className="text-primary hover:underline">
            Learn how tracked time feeds directly into job profitability reports.
          </Link>
        </div>
      </div>
    </section>
  );
}
