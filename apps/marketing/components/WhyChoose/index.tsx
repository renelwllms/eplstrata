import SectionTitle from "../Common/SectionTitle";

const WhyChoose = () => {
  return (
    <section id="why" className="py-16 md:py-20 lg:py-28">
      <div className="container">
        <SectionTitle
          title="Why Choose Strata Over Traditional Job Management Tools?"
          paragraph="Strata gives you control without complexity."
          center
        />

        <div className="mx-auto grid max-w-[900px] grid-cols-1 gap-4 text-base text-body-color sm:grid-cols-2">
          <div className="rounded-sm bg-gray-light px-6 py-4 dark:bg-gray-dark">
            One unified workflow instead of disconnected systems
          </div>
          <div className="rounded-sm bg-gray-light px-6 py-4 dark:bg-gray-dark">
            Built for service operations, not generic task lists
          </div>
          <div className="rounded-sm bg-gray-light px-6 py-4 dark:bg-gray-dark">
            Clear visibility across jobs, time, and finances
          </div>
          <div className="rounded-sm bg-gray-light px-6 py-4 dark:bg-gray-dark">
            Designed to scale as your team and workload grow
          </div>
          <div className="rounded-sm bg-gray-light px-6 py-4 dark:bg-gray-dark">
            Modern, flexible, and automation-ready
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhyChoose;
