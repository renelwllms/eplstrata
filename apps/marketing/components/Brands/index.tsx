const Brands = () => {
  return (
    <section id="trust" className="pt-16">
      <div className="container">
        <div className="-mx-4 flex flex-wrap">
          <div className="w-full px-4">
            <div
              className="wow fadeInUp bg-gray-light dark:bg-gray-dark flex flex-col items-center justify-center gap-3 rounded-sm px-8 py-8 text-center sm:px-10 md:px-[50px] md:py-[40px] xl:p-[50px] 2xl:px-[70px] 2xl:py-[60px]"
              data-wow-delay=".1s"
            >
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-body-color">
                Built for growing service teams
              </p>
              <div className="grid gap-2 text-base font-semibold text-black dark:text-white sm:grid-cols-2">
                <span>Job-based businesses</span>
                <span>Project-driven teams</span>
                <span>Operations-heavy organisations</span>
                <span>Companies replacing spreadsheets, emails, and disconnected tools</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Brands;
