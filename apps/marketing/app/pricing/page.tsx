import Link from "next/link";

export const metadata = {
  title: "Strata Pricing – Job & Workflow Management Software Plans",
  description:
    "View Strata pricing plans for job and workflow management software. Flexible plans for service businesses with time tracking, invoicing, reporting, and integrations."
};

const pricingPlans = [
  {
    name: "Starter",
    tagline: "Best for small teams getting organised",
    price: "$19.99 / user / month",
    cta: "Get Started",
    ctaHref: "/contact",
    features: [
      "Job & project management",
      "Time tracking & timesheets",
      "Basic quoting & invoicing",
      "Team & job assignment",
      "Standard reporting dashboards",
      "Email support"
    ]
  },
  {
    name: "Professional",
    tagline: "For growing service teams that need full visibility",
    price: "$39.99 / user / month",
    cta: "Book a Demo",
    ctaHref: "/contact",
    highlight: "Most Popular",
    features: [
      "Everything in Starter, plus:",
      "Advanced quoting & estimating",
      "Job scheduling & workload planning",
      "Job costing & profitability tracking",
      "Advanced reporting & dashboards",
      "Integrations with accounting tools",
      "Priority support"
    ]
  },
  {
    name: "Enterprise",
    tagline: "For larger organisations with complex workflows",
    price: "Contact us",
    cta: "Talk to Sales",
    ctaHref: "/contact",
    features: [
      "Everything in Professional, plus:",
      "Custom workflows & permissions",
      "Advanced integrations & API access",
      "Dedicated onboarding & training",
      "Custom reporting & dashboards",
      "SLA & priority support"
    ]
  }
];

export default function PricingPage() {
  return (
    <section className="pt-28 pb-20 md:pt-32 md:pb-24 lg:pt-36 lg:pb-28">
      <div className="container">
        <div className="mx-auto max-w-3xl text-center">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-primary">
            Strata Pricing
          </p>
          <h1 className="mb-4 text-3xl font-bold text-black dark:text-white sm:text-4xl">
            Simple, Scalable Pricing for Service Businesses
          </h1>
          <p className="text-base text-body-color sm:text-lg">
            Choose a Strata plan that fits your team today — and scales as your jobs, clients, and workflows grow.
            No hidden fees. No unnecessary complexity.
          </p>
        </div>

        <div className="mt-12 grid gap-8 lg:grid-cols-3">
          {pricingPlans.map((plan) => (
            <div
              key={plan.name}
              className={`relative rounded-md border bg-white p-8 shadow-three dark:border-dark/40 dark:bg-gray-dark ${
                plan.highlight ? "border-primary/60" : "border-transparent"
              }`}
            >
              {plan.highlight ? (
                <span className="absolute -top-4 right-6 rounded-full bg-primary px-4 py-1 text-xs font-semibold uppercase tracking-wide text-white">
                  {plan.highlight}
                </span>
              ) : null}
              <h2 className="text-2xl font-semibold text-black dark:text-white">
                {plan.name}
              </h2>
              <p className="mt-2 text-sm text-body-color">{plan.tagline}</p>
              <p className="mt-6 text-3xl font-bold text-black dark:text-white">
                {plan.price}
              </p>
              <Link
                href={plan.ctaHref}
                className={`mt-6 inline-flex w-full items-center justify-center rounded-sm px-5 py-3 text-sm font-semibold transition ${
                  plan.highlight
                    ? "bg-primary text-white hover:bg-primary/90"
                    : "border border-primary/30 text-primary hover:border-primary/60"
                }`}
              >
                {plan.cta}
              </Link>
              <ul className="mt-6 space-y-3 text-sm text-body-color">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                    <span className="mt-1 h-2 w-2 flex-shrink-0 rounded-full bg-primary/70" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-16 rounded-md bg-gray-light p-8 dark:bg-gray-dark">
          <div className="mx-auto max-w-4xl text-center">
            <h2 className="text-2xl font-semibold text-black dark:text-white">
              Everything You Need to Run Jobs End-to-End
            </h2>
            <p className="mt-3 text-body-color">
              All Strata plans are built around the same core workflow, so your team never outgrows the platform.
            </p>
          </div>
          <div className="mt-8 grid gap-4 text-sm text-body-color md:grid-cols-2 lg:grid-cols-3">
            <div>Job & project tracking</div>
            <div>Time tracking and timesheets</div>
            <div>Quoting, estimating, and invoicing</div>
            <div>Team and resource management</div>
            <div>Reporting and operational visibility</div>
            <div>Secure cloud-based access</div>
          </div>
        </div>

        <div className="mt-16 rounded-md border border-primary/20 bg-white p-8 shadow-three dark:border-dark/40 dark:bg-gray-dark md:p-10">
          <div className="mx-auto max-w-4xl text-center">
            <h2 className="text-2xl font-semibold text-black dark:text-white">
              How Strata Pricing Works
            </h2>
            <p className="mt-3 text-body-color">
              Unlike legacy job management software, Strata pricing is:
            </p>
          </div>
          <div className="mt-8 grid gap-4 text-sm text-body-color md:grid-cols-2">
            {[
              "Per-user, not per-feature lock-in",
              "Transparent and predictable",
              "Designed to scale with team growth",
              "Free from hidden setup or upgrade fees"
            ].map((item) => (
              <div key={item} className="flex items-start gap-3">
                <span className="mt-1 h-2 w-2 flex-shrink-0 rounded-full bg-primary/70" />
                <span>{item}</span>
              </div>
            ))}
          </div>
          <div className="mt-6 h-px w-full bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
          <p className="mt-6 text-sm text-body-color">
            This makes Strata ideal for service businesses comparing options like WorkflowMax or other job management platforms.
          </p>
        </div>

        <div className="mt-16 rounded-md bg-gray-light p-8 dark:bg-gray-dark">
          <div className="mx-auto max-w-4xl text-center">
            <h2 className="text-2xl font-semibold text-black dark:text-white">
              Pricing &amp; Billing FAQs
            </h2>
          </div>
          <div className="mt-8 grid gap-6 text-sm text-body-color md:grid-cols-2">
            <div>
              <p className="font-semibold text-black dark:text-white">
                How does Strata pricing work?
              </p>
              <p>
                Strata uses a per-user pricing model, allowing you to pay only for the team members who need access.
              </p>
            </div>
            <div>
              <p className="font-semibold text-black dark:text-white">
                Is there a minimum contract length?
              </p>
              <p>No long-term lock-in. Plans are flexible and designed to grow with your business.</p>
            </div>
            <div>
              <p className="font-semibold text-black dark:text-white">
                Does pricing include time tracking and invoicing?
              </p>
              <p>
                Yes. Time tracking, timesheets, quoting, and invoicing are included based on your selected plan.
              </p>
            </div>
            <div>
              <p className="font-semibold text-black dark:text-white">
                Can we upgrade or downgrade our plan later?
              </p>
              <p>Yes. You can change plans as your business needs evolve.</p>
            </div>
            <div>
              <p className="font-semibold text-black dark:text-white">
                Is onboarding or setup included?
              </p>
              <p>
                Professional and Enterprise plans include guided onboarding. Enterprise plans offer dedicated implementation support.
              </p>
            </div>
            <div>
              <p className="font-semibold text-black dark:text-white">
                How does Strata compare to WorkflowMax pricing?
              </p>
              <p>
                Strata offers modern, flexible pricing with a unified workflow, reducing the need for add-ons and external tools.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-16 rounded-md border border-transparent bg-white p-8 shadow-three dark:bg-gray-dark">
          <div className="mx-auto max-w-4xl text-center">
            <h2 className="text-2xl font-semibold text-black dark:text-white">
              Built for Growing Service Businesses
            </h2>
            <p className="mt-3 text-body-color">
              Whether you manage a handful of jobs or hundreds of active projects, Strata pricing is designed to support sustainable growth without operational bottlenecks.
            </p>
          </div>
        </div>

        <div className="mt-16 text-center">
          <h2 className="text-2xl font-semibold text-black dark:text-white">
            Ready to See Strata in Action?
          </h2>
          <p className="mt-3 text-body-color">
            Explore how Strata simplifies job management, improves visibility, and reduces admin overhead — all at a predictable cost.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/contact"
              className="rounded-sm bg-primary px-8 py-3 text-sm font-semibold text-white transition hover:bg-primary/90"
            >
              Book a Demo
            </Link>
            <Link
              href="/contact"
              className="rounded-sm border border-primary/40 px-8 py-3 text-sm font-semibold text-primary transition hover:border-primary/70"
            >
              Talk to Our Team
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
