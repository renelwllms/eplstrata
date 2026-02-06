import Link from "next/link";

export const metadata = {
  title: "Quoting & Estimating Software for Service Businesses | Strata",
  description:
    "Create accurate quotes and estimates, then convert them into jobs and invoices seamlessly with Strata."
};

export default function QuotingEstimatingPage() {
  return (
    <section className="pt-28 pb-16 md:pt-32 md:pb-20 lg:pt-36 lg:pb-28">
      <div className="container">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="mb-4 text-3xl font-bold text-black dark:text-white sm:text-4xl">
            Quoting &amp; Estimating Without the Admin Headache
          </h1>
          <p className="text-base text-body-color sm:text-lg">
            Strata simplifies quoting and estimating by connecting quotes directly to jobs, time tracking, and invoicing — eliminating rework and errors.
          </p>
        </div>

        <div className="mt-12 grid gap-8 lg:grid-cols-2">
          <div className="rounded-sm bg-white p-6 shadow-three dark:bg-gray-dark">
            <h2 className="mb-3 text-2xl font-semibold text-black dark:text-white">
              Create Clear, Professional Quotes
            </h2>
            <p className="text-body-color">
              Generate quotes that reflect real costs and realistic timelines.
            </p>
            <ul className="mt-4 list-disc space-y-2 pl-5 text-body-color">
              <li>Job-based estimates</li>
              <li>Cost and time visibility</li>
              <li>Consistent pricing structure</li>
            </ul>
          </div>

          <div className="rounded-sm bg-white p-6 shadow-three dark:bg-gray-dark">
            <h2 className="mb-3 text-2xl font-semibold text-black dark:text-white">
              Convert Quotes Into Jobs Instantly
            </h2>
            <p className="text-body-color">
              Once accepted, quotes flow straight into active jobs — no double handling.
            </p>
            <ul className="mt-4 list-disc space-y-2 pl-5 text-body-color">
              <li>Faster job setup</li>
              <li>No lost details</li>
              <li>Smooth handover from sales to delivery</li>
            </ul>
          </div>

          <div className="rounded-sm bg-white p-6 shadow-three dark:bg-gray-dark lg:col-span-2">
            <h2 className="mb-3 text-2xl font-semibold text-black dark:text-white">
              Improve Accuracy Over Time
            </h2>
            <p className="text-body-color">
              Use historical data from completed jobs to refine future estimates.
            </p>
            <ul className="mt-4 list-disc space-y-2 pl-5 text-body-color">
              <li>Learn from actual job costs</li>
              <li>Reduce underquoting</li>
              <li>Protect margins</li>
            </ul>
          </div>
        </div>

        <div className="mt-12 rounded-sm bg-gray-light p-6 dark:bg-gray-dark">
          <h3 className="text-xl font-semibold text-black dark:text-white">FAQ</h3>
          <p className="mt-3 text-body-color">
            <strong>Can accepted quotes turn into jobs automatically?</strong> Yes. Strata converts approved quotes directly into jobs with full data continuity.
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
