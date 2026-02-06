import Image from "next/image";
import Link from "next/link";

export const metadata = {
  title: "Mobile-First Job Management Software | Strata",
  description:
    "Strata is fully mobile friendly. Manage jobs, time, schedules, and updates from anywhere with a mobile-first experience."
};

export default function MobileAccessPage() {
  return (
    <section className="pt-28 pb-16 md:pt-32 md:pb-20 lg:pt-36 lg:pb-28">
      <div className="container">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="mb-4 text-3xl font-bold text-black dark:text-white sm:text-4xl">
            Mobile-First Job Management
          </h1>
          <h2 className="text-xl font-semibold text-black dark:text-white">
            Run Your Entire Operation — From Anywhere
          </h2>
          <p className="mt-4 text-base text-body-color sm:text-lg">
            Strata is built to work seamlessly on mobile, tablet, and desktop — so your team
            can manage jobs, time, and updates wherever the work happens.
          </p>
          <p className="mt-4 text-base text-body-color sm:text-lg">
            Modern service businesses aren’t tied to desks — and neither is Strata. Every Strata
            feature is fully usable on mobile, giving your team real-time access to jobs,
            schedules, time tracking, and updates while on the move.
          </p>
          <p className="mt-4 text-base text-body-color sm:text-lg">
            No stripped-down “mobile version”. No waiting to get back to a computer. Just full
            functionality, anywhere.
          </p>
        </div>

        <div className="mt-12 grid gap-8 lg:grid-cols-2">
          <div className="rounded-sm bg-white p-6 shadow-three dark:bg-gray-dark">
            <h3 className="mb-3 text-2xl font-semibold text-black dark:text-white">
              Your Team Stays Productive — Even Outside the Office
            </h3>
            <ul className="mt-4 list-disc space-y-2 pl-5 text-body-color">
              <li>View and update jobs on the go</li>
              <li>Track time directly from your phone</li>
              <li>Check schedules and assignments instantly</li>
              <li>See team workload and job status in real time</li>
              <li>Access quotes, job details, and notes anywhere</li>
            </ul>
          </div>

          <div className="rounded-sm bg-white p-6 shadow-three dark:bg-gray-dark">
            <h3 className="mb-3 text-2xl font-semibold text-black dark:text-white">
              Why This Matters
            </h3>
            <p className="text-body-color">
              Field teams, managers, and business owners all work differently — Strata adapts
              to how you work, not the other way around.
            </p>
            <ul className="mt-4 list-disc space-y-2 pl-5 text-body-color">
              <li>Faster job updates</li>
              <li>Less forgotten admin</li>
              <li>Better communication</li>
              <li>More accurate data</li>
            </ul>
          </div>
        </div>

        <div className="mt-12 rounded-sm bg-gray-light p-6 dark:bg-gray-dark">
          <h3 className="text-xl font-semibold text-black dark:text-white">
            Designed for Mobile — Not Just Shrunk to Fit
          </h3>
          <p className="mt-3 text-body-color">
            Strata’s interface automatically adapts to smaller screens, making it easy to use
            on phones and tablets without losing clarity or control. Below are real examples of
            Strata in action on mobile.
          </p>
          <p className="mt-2 text-sm text-body-color">
            Use real screenshots from your app once ready. These placeholder visuals are just
            to guide layout and intent.
          </p>

          <div className="mt-8 space-y-10">
            {[
              {
                title: "Job Status at a Glance",
                description:
                  "See what’s scheduled, in progress, or overdue without digging through spreadsheets.",
                src: "/images/mobile/mobile-5.jpg",
                alt: "Strata mobile job status screen"
              },
              {
                title: "Fast Field Updates",
                description:
                  "Capture notes, photos, and progress while you’re on site so everyone stays aligned.",
                src: "/images/mobile/mobile-6.jpg",
                alt: "Strata mobile field update screen"
              },
              {
                title: "Accurate Time, Instantly",
                description:
                  "Start and stop timers on the job to keep billing and reporting clean.",
                src: "/images/mobile/mobile-7.jpg",
                alt: "Strata mobile time tracking screen"
              }
            ].map((item, index) => (
              <div
                key={item.title}
                className={`grid gap-8 lg:grid-cols-2 lg:items-center ${
                  index % 2 === 1 ? "lg:[&>div:first-child]:order-2" : ""
                }`}
              >
                <div className="space-y-4 text-base text-body-color">
                  <p className="text-sm font-semibold uppercase tracking-[0.3em] text-primary">
                    Mobile Workflow
                  </p>
                  <h4 className="text-2xl font-bold text-black dark:text-white">
                    {item.title}
                  </h4>
                  <p>{item.description}</p>
                </div>

                <div className="rounded-2xl border border-sand-200 bg-white p-3 shadow-three">
                  <Image
                    src={item.src}
                    alt={item.alt}
                    width={560}
                    height={1120}
                    className="h-auto w-full object-contain"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-8 rounded-sm bg-white p-6 text-center shadow-three dark:bg-gray-dark">
          <p className="text-base text-body-color">
            Your data stays in sync across all devices — so updates made on mobile are instantly
            visible to the whole team.
          </p>
        </div>

        <div className="mt-12 rounded-sm bg-white p-6 text-center shadow-three dark:bg-gray-dark">
          <h2 className="mb-3 text-2xl font-semibold text-black dark:text-white">
            Work Doesn’t Stop — Neither Does Strata
          </h2>
          <p className="text-body-color">
            Whether you’re in the office or on the job site, Strata keeps your entire workflow
            in your pocket.
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
      </div>
    </section>
  );
}
