import Link from "next/link";
import SectionTitle from "../Common/SectionTitle";

const FAQTeaser = () => {
  return (
    <section id="faq" className="py-16 md:py-20 lg:py-28">
      <div className="container">
        <SectionTitle
          title="Frequently Asked Questions"
          paragraph="Quick answers to common questions about Strata."
          center
        />

        <div className="mx-auto grid max-w-[900px] grid-cols-1 gap-4 text-base text-body-color">
          <div className="rounded-sm bg-gray-light px-6 py-4 dark:bg-gray-dark">
            <p className="font-semibold text-black dark:text-white">
              What is job and workflow management software?
            </p>
            <p className="mt-2 text-sm text-body-color">
              It helps service businesses plan, track, and deliver work efficiently by managing jobs, teams, time tracking, and invoicing in one system.
            </p>
          </div>
          <div className="rounded-sm bg-gray-light px-6 py-4 dark:bg-gray-dark">
            <p className="font-semibold text-black dark:text-white">
              Who is Strata designed for?
            </p>
            <p className="mt-2 text-sm text-body-color">
              Strata is built for service-based businesses that manage multiple jobs, projects, or clients and need better operational visibility and control.
            </p>
          </div>
          <div className="rounded-sm bg-gray-light px-6 py-4 dark:bg-gray-dark">
            <p className="font-semibold text-black dark:text-white">
              Does Strata support time tracking and invoicing?
            </p>
            <p className="mt-2 text-sm text-body-color">
              Yes. Strata includes built-in time tracking, timesheets, quoting, and invoicing to streamline operations and billing.
            </p>
          </div>
          <div className="rounded-sm bg-gray-light px-6 py-4 dark:bg-gray-dark">
            <p className="font-semibold text-black dark:text-white">
              Can Strata replace spreadsheets and multiple tools?
            </p>
            <p className="mt-2 text-sm text-body-color">
              Absolutely. Strata replaces spreadsheets, emails, and disconnected apps with a single, structured workflow platform.
            </p>
          </div>
          <div className="rounded-sm bg-gray-light px-6 py-4 dark:bg-gray-dark">
            <p className="font-semibold text-black dark:text-white">
              Is Strata suitable for growing teams?
            </p>
            <p className="mt-2 text-sm text-body-color">
              Yes. Strata scales with your business, making it suitable for small teams through to larger service organisations.
            </p>
          </div>
        </div>

        <div className="mt-8 flex items-center justify-center">
          <Link
            href="#contact"
            className="rounded-sm border border-black px-8 py-4 text-base font-semibold text-black duration-300 ease-in-out hover:bg-black hover:text-white dark:border-white dark:text-white dark:hover:bg-white dark:hover:text-black"
          >
            Request a Demo
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FAQTeaser;
