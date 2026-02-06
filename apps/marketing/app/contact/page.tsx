import ContactPageForm from "@/components/Contact/ContactPageForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact Strata | Book a Demo",
  description:
    "Contact Strata to book a demo or ask a question about job management, time tracking, invoicing, and reporting."
};

const ContactPage = () => {
  return <ContactPageForm />;
};

export default ContactPage;
