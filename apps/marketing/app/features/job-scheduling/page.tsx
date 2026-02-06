import Link from "next/link";

export const metadata = {
  title: "Job Scheduling Software for Service Teams | Strata",
  description:
    "Schedule jobs, assign staff, and manage workloads with Strata’s job scheduling tools built for service operations."
};

export default function JobSchedulingPage() {
  return (
    <section className="pt-28 pb-16 md:pt-32 md:pb-20 lg:pt-36 lg:pb-28">
      <div className="container">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="mb-4 text-3xl font-bold text-black dark:text-white sm:text-4xl">
            Job Scheduling That Keeps Teams Aligned
          </h1>
          <p className="text-base text-body-color sm:text-lg">
            Strata helps service businesses plan, assign, and manage jobs efficiently — without spreadsheets or guesswork.
          </p>
        </div>

        <div className="mt-12 grid gap-8 lg:grid-cols-2">
          <div className="rounded-sm bg-white p-6 shadow-three dark:bg-gray-dark">
            <h2 className="mb-3 text-2xl font-semibold text-black dark:text-white">
              Assign Jobs with Confidence
            </h2>
            <p className="text-body-color">
              Allocate work to the right people at the right time.
            </p>
            <ul className="mt-4 list-disc space-y-2 pl-5 text-body-color">
              <li>Clear job ownership</li>
              <li>Centralised scheduling</li>
              <li>Reduced scheduling conflicts</li>
            </ul>
          </div>

          <div className="rounded-sm bg-white p-6 shadow-three dark:bg-gray-dark">
            <h2 className="mb-3 text-2xl font-semibold text-black dark:text-white">
              Balance Workloads Across Teams
            </h2>
            <p className="text-body-color">
              See who’s busy, who’s available, and where capacity exists.
            </p>
            <ul className="mt-4 list-disc space-y-2 pl-5 text-body-color">
              <li>Avoid overloading staff</li>
              <li>Improve delivery timelines</li>
              <li>Support growing teams</li>
            </ul>
          </div>

          <div className="rounded-sm bg-white p-6 shadow-three dark:bg-gray-dark lg:col-span-2">
            <h2 className="mb-3 text-2xl font-semibold text-black dark:text-white">
              Keep Everyone in Sync
            </h2>
            <p className="text-body-color">
              All job updates, changes, and progress live in one system — visible to managers and staff.
            </p>
          </div>
        </div>

        <div className="mt-12 rounded-sm bg-gray-light p-6 dark:bg-gray-dark">
          <h3 className="text-xl font-semibold text-black dark:text-white">FAQ</h3>
          <p className="mt-3 text-body-color">
            <strong>Is Strata suitable for teams managing multiple jobs daily?</strong> Yes. Strata is designed specifically for high-volume, job-based service teams.
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
            See Time Tracking
          </Link>
        </div>
      </div>
    </section>
  );
}
