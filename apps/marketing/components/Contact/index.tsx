const Contact = () => {
  return (
    <section id="contact" className="overflow-hidden py-16 md:py-20 lg:py-28">
      <div className="container">
        <div className="-mx-4 flex flex-wrap items-center justify-center">
          <div className="w-full px-4">
            <div
              className="wow fadeInUp shadow-three dark:bg-gray-dark rounded-sm bg-white px-8 py-12 text-center sm:p-[55px]"
              data-wow-delay=".15s"
            >
              <h2 className="mb-4 text-2xl font-bold text-black dark:text-white sm:text-3xl lg:text-4xl">
                Take Control of Your Jobs and Workflows
              </h2>
              <p className="mx-auto mb-8 max-w-[640px] text-base font-medium text-body-color sm:text-lg">
                Stop managing work across spreadsheets, emails, and disconnected systems.
                Run your entire operation from one powerful workflow platform.
              </p>
              <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
                <a
                  href="/contact"
                  className="rounded-sm bg-primary px-8 py-4 text-base font-semibold text-white duration-300 ease-in-out hover:bg-primary/80"
                >
                  Request a Demo
                </a>
                <a
                  href="/contact"
                  className="rounded-sm border border-black px-8 py-4 text-base font-semibold text-black duration-300 ease-in-out hover:bg-black hover:text-white dark:border-white dark:text-white dark:hover:bg-white dark:hover:text-black"
                >
                  Talk to Our Team
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
