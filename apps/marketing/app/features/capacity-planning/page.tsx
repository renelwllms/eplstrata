import Link from "next/link";

export const metadata = {
  title: "Capacity Planning & Staff Load Tracking Software | Strata",
  description:
    "Track staff workload, availability, and capacity in real time. Strata helps service businesses balance work, prevent overload, and deliver jobs on time."
};

export default function CapacityPlanningPage() {
  return (
    <section className="pt-28 pb-16 md:pt-32 md:pb-20 lg:pt-36 lg:pb-28">
      <div className="container">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="mb-4 text-3xl font-bold text-black dark:text-white sm:text-4xl">
            Capacity Planning &amp; Staff Load Tracking for Service Teams
          </h1>
          <p className="text-base text-body-color sm:text-lg">
            Strata’s capacity planning tools give service businesses real-time visibility
            into who is working on what, how busy each team member is, and whether
            upcoming work can realistically be delivered on time.
          </p>
          <p className="mt-4 text-base text-body-color sm:text-lg">
            Instead of guessing or relying on spreadsheets, managers can see team utilisation,
            availability, and workload risks in one connected view.
          </p>
        </div>

        <div className="mt-12 grid gap-8 lg:grid-cols-2">
          <div className="rounded-sm bg-white p-6 shadow-three dark:bg-gray-dark">
            <h2 className="mb-3 text-2xl font-semibold text-black dark:text-white">
              See Team Capacity at a Glance
            </h2>
            <p className="text-body-color">
              Understand your team’s workload instantly with a live capacity overview.
            </p>
            <ul className="mt-4 list-disc space-y-2 pl-5 text-body-color">
              <li>Team utilisation percentages</li>
              <li>Available vs allocated hours</li>
              <li>Overloaded and underutilised staff</li>
              <li>Unassigned work and capacity gaps</li>
            </ul>
          </div>

          <div className="rounded-sm bg-white p-6 shadow-three dark:bg-gray-dark">
            <h2 className="mb-3 text-2xl font-semibold text-black dark:text-white">
              Track Staff Load in Real Time
            </h2>
            <p className="text-body-color">
              Strata shows exactly how work is distributed across individuals and teams.
            </p>
            <ul className="mt-4 list-disc space-y-2 pl-5 text-body-color">
              <li>Active jobs per person</li>
              <li>Allocated hours vs capacity</li>
              <li>Clear indicators for overload risk</li>
              <li>Visibility across teams and roles</li>
            </ul>
          </div>

          <div className="rounded-sm bg-white p-6 shadow-three dark:bg-gray-dark">
            <h2 className="mb-3 text-2xl font-semibold text-black dark:text-white">
              Plan Ahead with Confidence
            </h2>
            <p className="text-body-color">
              Capacity planning isn’t just about today — Strata helps you look forward.
            </p>
            <ul className="mt-4 list-disc space-y-2 pl-5 text-body-color">
              <li>Forecast workload for upcoming weeks</li>
              <li>Identify future capacity constraints</li>
              <li>Decide when to hire, reschedule, or decline work</li>
              <li>Avoid over-committing your team</li>
            </ul>
          </div>

          <div className="rounded-sm bg-white p-6 shadow-three dark:bg-gray-dark">
            <h2 className="mb-3 text-2xl font-semibold text-black dark:text-white">
              Connected to Jobs, Time Tracking &amp; Scheduling
            </h2>
            <p className="text-body-color">
              Capacity planning in Strata is fully integrated — not a standalone tool.
            </p>
            <ul className="mt-4 list-disc space-y-2 pl-5 text-body-color">
              <li>Job scheduling</li>
              <li>Time tracking &amp; timesheets</li>
              <li>Job estimates and remaining work</li>
              <li>Reporting &amp; dashboards</li>
            </ul>
          </div>

          <div className="rounded-sm bg-white p-6 shadow-three dark:bg-gray-dark lg:col-span-2">
            <h2 className="mb-3 text-2xl font-semibold text-black dark:text-white">
              Identify Risks Before Deadlines Are Missed
            </h2>
            <p className="text-body-color">
              Strata highlights workload issues automatically so managers can act early.
            </p>
            <ul className="mt-4 list-disc space-y-2 pl-5 text-body-color">
              <li>Overallocated staff</li>
              <li>Jobs without assigned capacity</li>
              <li>Work scheduled beyond available hours</li>
              <li>Bottlenecks across teams</li>
            </ul>
          </div>

          <div className="rounded-sm bg-white p-6 shadow-three dark:bg-gray-dark lg:col-span-2">
            <h2 className="mb-3 text-2xl font-semibold text-black dark:text-white">
              Designed for Growing Service Businesses
            </h2>
            <p className="text-body-color">
              Whether you manage a small team or a multi-department operation, Strata scales with you.
            </p>
            <ul className="mt-4 list-disc space-y-2 pl-5 text-body-color">
              <li>No spreadsheets or manual planning</li>
              <li>Clear visibility as job volume grows</li>
              <li>Flexible capacity rules for part-time and leave</li>
              <li>One system for operations and planning</li>
            </ul>
          </div>
        </div>

        <div className="mt-12 rounded-sm bg-gray-light p-6 dark:bg-gray-dark">
          <h3 className="text-xl font-semibold text-black dark:text-white">FAQ</h3>
          <div className="mt-3 space-y-3 text-body-color">
            <p>
              <strong>What is capacity planning in job management software?</strong> Capacity planning helps
              businesses understand staff availability, workload, and future capacity so jobs can be
              scheduled realistically.
            </p>
            <p>
              <strong>Can Strata show when staff are overloaded?</strong> Yes. Strata highlights overallocated
              team members and shows utilisation percentages in real time.
            </p>
            <p>
              <strong>Is capacity planning linked to job scheduling?</strong> Yes. Capacity planning works directly
              with job scheduling, time tracking, and reporting in Strata.
            </p>
            <p>
              <strong>Who should use capacity planning features?</strong> Capacity planning is ideal for managers,
              operations teams, and business owners overseeing multiple jobs and staff.
            </p>
          </div>
        </div>

        <div className="mt-12 rounded-sm bg-white p-6 text-center shadow-three dark:bg-gray-dark">
          <h2 className="mb-3 text-2xl font-semibold text-black dark:text-white">
            Plan Workloads Without Guesswork
          </h2>
          <p className="text-body-color">
            Stop reacting to overload after it happens. Use real-time capacity insights to plan
            work smarter and deliver consistently.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-4">
            <Link href="/contact" className="text-primary hover:underline">
              Book a Demo
            </Link>
            <Link href="/features" className="text-primary hover:underline">
              See All Features
            </Link>
          </div>
        </div>

        <div className="mt-10 flex flex-wrap items-center gap-4">
          <Link href="/features/job-scheduling" className="text-primary hover:underline">
            Capacity planning works best when combined with job scheduling.
          </Link>
          <Link href="/features/time-tracking" className="text-primary hover:underline">
            Capacity planning works best when combined with time tracking.
          </Link>
          <Link href="/features/reporting-dashboards" className="text-primary hover:underline">
            Connect capacity planning to reporting and dashboards.
          </Link>
          <Link href="/pricing" className="text-primary hover:underline">
            View Pricing
          </Link>
        </div>
      </div>
    </section>
  );
}
