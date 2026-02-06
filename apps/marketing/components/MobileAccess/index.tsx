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

        <div className="mt-12 grid gap-10 lg:grid-cols-2 lg:items-center">
          <div className="space-y-4 text-base text-body-color">
            <p>
              Modern service businesses aren’t tied to desks — and neither is Strata.
              Every Strata feature is fully usable on mobile, giving your team real-time
              access to jobs, schedules, time tracking, and updates while on the move.
            </p>
            <p>No stripped-down “mobile version”. No waiting to get back to a computer.</p>
            <p className="font-semibold text-black">Just full functionality, anywhere.</p>
            <ul className="mt-4 space-y-2">
              <li>View and update jobs on the go</li>
              <li>Track time directly from your phone</li>
              <li>Check schedules and assignments instantly</li>
              <li>See team workload and job status in real time</li>
              <li>Access quotes, job details, and notes anywhere</li>
            </ul>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {[
              "/images/mobile/mobile-1.jpg",
              "/images/mobile/mobile-2.jpg",
              "/images/mobile/mobile-3.jpg",
              "/images/mobile/mobile-4.jpg"
            ].map((src, index) => (
              <div
                key={src}
                className="overflow-hidden rounded-2xl border border-sand-200 bg-white shadow-three"
              >
                <Image
                  src={src}
                  alt={`Strata mobile screen ${index + 1}`}
                  width={520}
                  height={1040}
                  className="h-56 w-full object-cover sm:h-64"
                />
              </div>
            ))}
          </div>
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
