import Link from "next/link";

const features = [
  {
    title: "Time Tracking",
    href: "/features/time-tracking",
    description: "Capture time against jobs accurately with built-in timesheets."
  },
  {
    title: "Quoting & Estimating",
    href: "/features/quoting-estimating",
    description: "Create quotes and convert them into jobs and invoices."
  },
  {
    title: "Job Scheduling",
    href: "/features/job-scheduling",
    description: "Assign work, balance workloads, and keep teams aligned."
  },
  {
    title: "Capacity Planning",
    href: "/features/capacity-planning",
    description: "Track workload, availability, and staff capacity in real time."
  },
  {
    title: "Mobile Access",
    href: "/features/mobile-access",
    description: "Run jobs, time tracking, and updates from any device."
  },
  {
    title: "Reporting & Dashboards",
    href: "/features/reporting-dashboards",
    description: "Real-time visibility into jobs, performance, and profitability."
  },
  {
    title: "Integrations",
    href: "/features/integrations",
    description: "Connect Strata with accounting and operational tools."
  }
];

export const metadata = {
  title: "Strata Features | Job & Workflow Management",
  description:
    "Explore Strata features for job management, time tracking, quoting, scheduling, capacity planning, reporting, and integrations."
};

export default function FeaturesLanding() {
  return (
    <section className="pt-28 pb-16 md:pt-32 md:pb-20 lg:pt-36 lg:pb-28">
      <div className="container">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="mb-4 text-3xl font-bold text-black dark:text-white sm:text-4xl">
            Strata Feature Library
          </h1>
          <p className="text-base text-body-color sm:text-lg">
            Explore the core modules that help service businesses manage jobs, time, invoicing, and reporting in one platform.
          </p>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <Link
              key={feature.href}
              href={feature.href}
              className="rounded-sm border border-transparent bg-white p-6 shadow-three transition hover:border-primary/40 hover:shadow-lg dark:bg-gray-dark"
            >
              <h2 className="mb-2 text-xl font-semibold text-black dark:text-white">
                {feature.title}
              </h2>
              <p className="text-sm text-body-color">{feature.description}</p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
