"use client";

import { useState } from "react";
import { withCsrfHeaders } from "../../../lib/csrf";

const initialForm = {
  name: "",
  email: "",
  company: "",
  phone: "",
  teamSize: "",
  interest: "Book a Demo",
  message: "",
};

const ContactPageForm = () => {
  const [form, setForm] = useState(initialForm);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus("loading");
    setError(null);

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: withCsrfHeaders(),
        body: JSON.stringify(form),
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        throw new Error(payload?.error || "Unable to send your message.");
      }

      setStatus("success");
      setForm(initialForm);
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Something went wrong.");
    }
  };

  return (
    <section className="pt-28 pb-20 md:pt-32 md:pb-24 lg:pt-36 lg:pb-28">
      <div className="container">
        <div className="mx-auto max-w-4xl text-center">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-primary">
            Contact Us
          </p>
          <h1 className="mb-4 text-3xl font-bold text-black dark:text-white sm:text-4xl">
            Book a Demo or Send an Enquiry
          </h1>
          <p className="text-base text-body-color sm:text-lg">
            Tell us about your team and workflows. We’ll follow up with the right Strata plan, pricing, and next steps.
          </p>
        </div>

        <div className="mt-12 grid gap-10 lg:grid-cols-[1.1fr_1fr]">
          <div className="rounded-md border border-primary/10 bg-white p-8 shadow-three dark:border-dark/40 dark:bg-gray-dark">
            <h2 className="text-2xl font-semibold text-black dark:text-white">
              Let’s Talk About Your Workflow
            </h2>
            <p className="mt-3 text-body-color">
              Strata helps service businesses manage jobs, teams, time tracking, invoicing, and reporting in one system.
              Share a few details and we’ll tailor the demo to your needs.
            </p>

            <div className="mt-6 space-y-4 text-sm text-body-color">
              <div>
                <p className="font-semibold text-black dark:text-white">Email</p>
                <p>support@edgepoint.co.nz</p>
              </div>
              <div>
                <p className="font-semibold text-black dark:text-white">Phone</p>
                <p>0800 334 376</p>
              </div>
              <div>
                <p className="font-semibold text-black dark:text-white">Location</p>
                <p>EdgePoint, New Zealand</p>
              </div>
            </div>

            <div className="mt-6 rounded-md bg-gray-light p-5 text-sm text-body-color dark:bg-dark">
              <p className="font-semibold text-black dark:text-white">What happens next?</p>
              <ul className="mt-3 space-y-2">
                <li>We review your request within 1 business day.</li>
                <li>We schedule a demo or answer your questions.</li>
                <li>You receive a tailored Strata plan recommendation.</li>
              </ul>
            </div>
          </div>

          <form
            onSubmit={handleSubmit}
            className="rounded-md border border-primary/10 bg-white p-8 shadow-three dark:border-dark/40 dark:bg-gray-dark"
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="mb-2 block text-sm font-semibold text-black dark:text-white">
                  I’m interested in
                </label>
                <select
                  name="interest"
                  value={form.interest}
                  onChange={handleChange}
                  className="w-full rounded-sm border border-body-color/20 bg-transparent px-4 py-3 text-sm text-body-color outline-none transition focus:border-primary"
                >
                  <option>Book a Demo</option>
                  <option>Pricing & Plans</option>
                  <option>Product Questions</option>
                  <option>Partnerships</option>
                  <option>Support</option>
                </select>
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-black dark:text-white">
                  Full name
                </label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  required
                  className="w-full rounded-sm border border-body-color/20 bg-transparent px-4 py-3 text-sm text-body-color outline-none transition focus:border-primary"
                  placeholder="Your name"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-black dark:text-white">
                  Work email
                </label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                  className="w-full rounded-sm border border-body-color/20 bg-transparent px-4 py-3 text-sm text-body-color outline-none transition focus:border-primary"
                  placeholder="you@company.com"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-black dark:text-white">
                  Company
                </label>
                <input
                  type="text"
                  name="company"
                  value={form.company}
                  onChange={handleChange}
                  className="w-full rounded-sm border border-body-color/20 bg-transparent px-4 py-3 text-sm text-body-color outline-none transition focus:border-primary"
                  placeholder="Company name"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-black dark:text-white">
                  Phone (optional)
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  className="w-full rounded-sm border border-body-color/20 bg-transparent px-4 py-3 text-sm text-body-color outline-none transition focus:border-primary"
                  placeholder="+64 21 000 000"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="mb-2 block text-sm font-semibold text-black dark:text-white">
                  Team size
                </label>
                <select
                  name="teamSize"
                  value={form.teamSize}
                  onChange={handleChange}
                  className="w-full rounded-sm border border-body-color/20 bg-transparent px-4 py-3 text-sm text-body-color outline-none transition focus:border-primary"
                >
                  <option value="">Select team size</option>
                  <option value="1-5">1-5</option>
                  <option value="6-15">6-15</option>
                  <option value="16-50">16-50</option>
                  <option value="51-100">51-100</option>
                  <option value="100+">100+</option>
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className="mb-2 block text-sm font-semibold text-black dark:text-white">
                  How can we help?
                </label>
                <textarea
                  name="message"
                  value={form.message}
                  onChange={handleChange}
                  rows={5}
                  className="w-full resize-none rounded-sm border border-body-color/20 bg-transparent px-4 py-3 text-sm text-body-color outline-none transition focus:border-primary"
                  placeholder="Tell us about your workflow, key challenges, or what you want to see in a demo."
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={status === "loading"}
              className="mt-6 inline-flex w-full items-center justify-center rounded-sm bg-primary px-6 py-3 text-sm font-semibold text-white transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {status === "loading" ? "Sending..." : "Submit Request"}
            </button>

            {status === "success" ? (
              <p className="mt-4 text-sm text-emerald-600">
                Thanks! Your message has been sent. We’ll be in touch shortly.
              </p>
            ) : null}
            {status === "error" ? (
              <p className="mt-4 text-sm text-red-500">
                {error || "Something went wrong. Please try again."}
              </p>
            ) : null}
          </form>
        </div>
      </div>
    </section>
  );
};

export default ContactPageForm;
