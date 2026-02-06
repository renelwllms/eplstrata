import Link from "next/link";

export const metadata = {
  title: "Workflow Software Integrations | Strata",
  description:
    "Connect Strata with your accounting, finance, and operational tools for a fully integrated workflow."
};

export default function IntegrationsPage() {
  return (
    <section className="pt-28 pb-16 md:pt-32 md:pb-20 lg:pt-36 lg:pb-28">
      <div className="container">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="mb-4 text-3xl font-bold text-black dark:text-white sm:text-4xl">
            Integrations That Fit Into Your Workflow
          </h1>
          <p className="text-base text-body-color sm:text-lg">
            Strata is designed to work alongside the tools service businesses already rely on — reducing duplication and improving data flow.
          </p>
        </div>

        <div className="mt-12 grid gap-8 lg:grid-cols-2">
          <div className="rounded-sm bg-white p-6 shadow-three dark:bg-gray-dark">
            <h2 className="mb-3 text-2xl font-semibold text-black dark:text-white">
              Accounting &amp; Finance Tools
            </h2>
            <p className="text-body-color">
              Integrate job and invoice data with accounting systems to streamline financial workflows.
            </p>
            <ul className="mt-4 list-disc space-y-2 pl-5 text-body-color">
              <li>Cleaner invoicing</li>
              <li>Fewer reconciliation issues</li>
              <li>Improved financial accuracy</li>
            </ul>
          </div>

          <div className="rounded-sm bg-white p-6 shadow-three dark:bg-gray-dark">
            <h2 className="mb-3 text-2xl font-semibold text-black dark:text-white">
              Flexible &amp; Automation-Ready
            </h2>
            <p className="text-body-color">
              Strata is built with future integrations and automation in mind.
            </p>
            <ul className="mt-4 list-disc space-y-2 pl-5 text-body-color">
              <li>Scalable architecture</li>
              <li>API-ready workflows</li>
              <li>Support for custom integrations</li>
            </ul>
          </div>

          <div className="rounded-sm bg-white p-6 shadow-three dark:bg-gray-dark lg:col-span-2">
            <h2 className="mb-3 text-2xl font-semibold text-black dark:text-white">
              Reduce Tool Sprawl
            </h2>
            <p className="text-body-color">
              Keep your core operations in Strata while syncing data where needed.
            </p>
          </div>
        </div>

        <div className="mt-12 rounded-sm bg-gray-light p-6 dark:bg-gray-dark">
          <h3 className="text-xl font-semibold text-black dark:text-white">FAQ</h3>
          <p className="mt-3 text-body-color">
            <strong>Does Strata integrate with accounting software?</strong> Strata supports integration with accounting and finance tools to streamline billing and reporting workflows.
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
