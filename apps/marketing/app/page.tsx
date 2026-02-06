import AboutSectionOne from "@/components/About/AboutSectionOne";
import AboutSectionTwo from "@/components/About/AboutSectionTwo";
import Brands from "@/components/Brands";
import ScrollUp from "@/components/Common/ScrollUp";
import Contact from "@/components/Contact";
import Features from "@/components/Features";
import Hero from "@/components/Hero";
import Industries from "@/components/Industries";
import Pricing from "@/components/Pricing";
import Testimonials from "@/components/Testimonials";
import WhyChoose from "@/components/WhyChoose";
import FAQTeaser from "@/components/FAQTeaser";
import MobileAccess from "@/components/MobileAccess";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Strata – Job & Workflow Management Software for Service Businesses",
  description:
    "Strata is an all-in-one job and workflow management software for service businesses. Manage jobs, teams, time tracking, invoicing, and reporting in one powerful system.",
  keywords: [
    "job management software",
    "workflow management system",
    "service business software",
    "project invoicing software",
    "job tracking software",
    "time tracking and invoicing",
  ],
};

export default function Home() {
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "What is job and workflow management software?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Job and workflow management software helps service businesses plan, track, and deliver work efficiently by managing jobs, teams, time tracking, and invoicing in one system.",
        },
      },
      {
        "@type": "Question",
        name: "Who is Strata designed for?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Strata is built for service-based businesses that manage multiple jobs, projects, or clients and need better operational visibility and control.",
        },
      },
      {
        "@type": "Question",
        name: "Does Strata support time tracking and invoicing?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes. Strata includes built-in time tracking, timesheets, quoting, and invoicing to streamline operations and billing.",
        },
      },
      {
        "@type": "Question",
        name: "Can Strata replace spreadsheets and multiple tools?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Absolutely. Strata is designed to replace spreadsheets, emails, and disconnected apps with a single, structured workflow platform.",
        },
      },
      {
        "@type": "Question",
        name: "Is Strata suitable for growing teams?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes. Strata scales with your business, making it suitable for small teams through to larger service organisations.",
        },
      },
    ],
  };

  const softwareSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "EdgePoint Strata",
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    description:
      "Job and workflow management software for service businesses to manage jobs, time, teams, quoting, invoicing, and reporting in one platform.",
  };

  return (
    <>
      <ScrollUp />
      <Hero />
      <Brands />
      <AboutSectionOne />
      <AboutSectionTwo />
      <Features />
      <Industries />
      <WhyChoose />
      <MobileAccess />
      <Testimonials />
      <Pricing />
      <FAQTeaser />
      <Contact />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }}
      />
    </>
  );
}
