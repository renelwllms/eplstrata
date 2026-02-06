import Image from "next/image";
import SectionTitle from "../Common/SectionTitle";

const AboutSectionTwo = () => {
  return (
    <section id="value" className="py-16 md:py-20 lg:py-28">
      <div className="container">
        <div className="-mx-4 flex flex-wrap items-center">
          <div className="w-full px-4 lg:w-1/2">
            <div
              className="wow fadeInUp relative mx-auto mb-12 aspect-[25/24] max-w-[500px] text-center lg:m-0"
              data-wow-delay=".15s"
            >
              <Image
                src="/images/about/about-image-2.jpg"
                alt="Strata dashboard preview"
                fill
                className="rounded-2xl object-cover drop-shadow-three"
                sizes="(min-width: 1024px) 500px, 90vw"
                priority
              />
            </div>
          </div>
          <div className="w-full px-4 lg:w-1/2">
            <div className="wow fadeInUp max-w-[470px]" data-wow-delay=".2s">
              <SectionTitle
                title="Why Choose Strata Over Traditional Job Management Tools?"
                paragraph="Strata gives you control without complexity."
                mb="32px"
              />
              <ul className="space-y-4 text-base font-medium text-body-color sm:text-lg">
                <li>One unified workflow instead of disconnected systems</li>
                <li>Built for service operations, not generic task lists</li>
                <li>Clear visibility across jobs, time, and finances</li>
                <li>Designed to scale as your team and workload grow</li>
                <li>Modern, flexible, and automation-ready</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSectionTwo;
