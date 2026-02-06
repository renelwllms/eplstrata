import Image from "next/image";
import Link from "next/link";

const MobileAccess = () => {
  return (
    <section className="bg-gray-light py-16 md:py-20 lg:py-28">
      <div className="container">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-primary">
            Mobile First
          </p>
          <h2 className="mt-4 text-3xl font-bold text-black sm:text-4xl">
            Run Your Entire Operation — From Anywhere
          </h2>
          <p className="mt-4 text-base text-body-color sm:text-lg">
            Strata is built to work seamlessly on mobile, tablet, and desktop — so
            your team can manage jobs, time, and updates wherever the work happens.
          </p>
        </div>

        <div className="mt-12 space-y-10">
          {[
            {
              title: "Job Overview, Instantly",
              description:
                "A live view of each job’s status, priority, and next action so crews know what matters most the moment they open the app.",
              src: "/images/mobile/mobile-1.jpg",
              alt: "Strata mobile job overview screen"
            },
            {
              title: "Time Tracking in Seconds",
              description:
                "Start, pause, and submit time on the spot — no back-office catch-up needed to keep billing accurate.",
              src: "/images/mobile/mobile-2.jpg",
              alt: "Strata mobile time tracking screen"
            },
            {
              title: "Field Updates Without Friction",
              description:
                "Capture notes, photos, and progress updates while you’re on-site so the office and customers stay in sync.",
              src: "/images/mobile/mobile-3.jpg",
              alt: "Strata mobile field update screen"
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
                <h3 className="text-2xl font-bold text-black">{item.title}</h3>
                <p>{item.description}</p>
              </div>

              <div className="overflow-hidden rounded-2xl border border-sand-200 bg-white shadow-three">
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

        <div className="mt-12 rounded-2xl bg-white p-6 text-center shadow-three">
          <p className="text-base text-body-color">
            Your data stays in sync across all devices — so updates made on mobile are
            instantly visible to the whole team.
          </p>
        </div>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <Link href="/contact" className="text-primary hover:underline">
            Book a Demo
          </Link>
          <Link href="/features" className="text-primary hover:underline">
            See All Features
          </Link>
        </div>
      </div>
    </section>
  );
};

export default MobileAccess;
