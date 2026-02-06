import SectionTitle from "../Common/SectionTitle";

const Industries = () => {
  return (
    <section id="industries" className="py-16 md:py-20 lg:py-28">
      <div className="container">
        <SectionTitle
          title="Built for Real-World Service Businesses"
          paragraph="If your business manages jobs, people, time, and invoices — Strata fits."
          center
        />

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          <div className="dark:bg-gray-dark rounded-sm bg-white p-8 shadow-three">
            <h3 className="mb-3 text-xl font-bold text-black dark:text-white">
              Trades and field service businesses
            </h3>
            <p className="text-base text-body-color">
              Manage jobs, crews, and invoices with clear visibility.
            </p>
          </div>
          <div className="dark:bg-gray-dark rounded-sm bg-white p-8 shadow-three">
            <h3 className="mb-3 text-xl font-bold text-black dark:text-white">
              Consulting and professional services
            </h3>
            <p className="text-base text-body-color">
              Track jobs, time, and billing across multiple clients.
            </p>
          </div>
          <div className="dark:bg-gray-dark rounded-sm bg-white p-8 shadow-three">
            <h3 className="mb-3 text-xl font-bold text-black dark:text-white">
              Creative and digital agencies
            </h3>
            <p className="text-base text-body-color">
              Keep scopes, tasks, and invoicing aligned to delivery.
            </p>
          </div>
          <div className="dark:bg-gray-dark rounded-sm bg-white p-8 shadow-three">
            <h3 className="mb-3 text-xl font-bold text-black dark:text-white">
              Planning, engineering, and project-based firms
            </h3>
            <p className="text-base text-body-color">
              Manage complex projects with operational visibility.
            </p>
          </div>
          <div className="dark:bg-gray-dark rounded-sm bg-white p-8 shadow-three">
            <h3 className="mb-3 text-xl font-bold text-black dark:text-white">
              Operations-driven teams managing multiple jobs daily
            </h3>
            <p className="text-base text-body-color">
              Centralise workflows and reduce operational noise.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Industries;
