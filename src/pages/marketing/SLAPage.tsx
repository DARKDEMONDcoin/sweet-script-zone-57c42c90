/** @doc Service Level Agreement — uptime, credits, and support commitments. */
import LegalPageLayout, { LegalSection } from "@/components/landing/LegalPageLayout";

const sections: LegalSection[] = [
  {
    heading: "Who This SLA Covers",
    paragraphs: [
      "This Service Level Agreement (\"SLA\") applies to paid Megsy AI plans (Pro, Elite, Business, Ultimate, and Enterprise). Free-tier usage is provided on a best-effort basis without SLA guarantees.",
    ],
  },
  {
    heading: "Uptime Commitment",
    paragraphs: [
      "Megsy AI targets the following monthly uptime for the core Service (authentication, chat completions, and dashboard):",
    ],
    list: [
      "Pro & Elite: 99.5% monthly uptime.",
      "Business & Ultimate: 99.9% monthly uptime.",
      "Enterprise: 99.95% monthly uptime with a custom-negotiated SLA available.",
    ],
  },
  {
    heading: "Service Credits",
    paragraphs: [
      "If we fail to meet the applicable uptime target in a given calendar month, you may request a service credit against your next invoice, calculated on the monthly recurring fee for the affected Service:",
    ],
    list: [
      "Uptime < target but ≥ 99.0% : 10% credit.",
      "Uptime < 99.0% but ≥ 95.0% : 25% credit.",
      "Uptime < 95.0% : 50% credit.",
      "Maximum credit per month: 100% of the monthly recurring fee.",
    ],
  },
  {
    heading: "How to Claim a Credit",
    paragraphs: [
      "Submit a written claim to billing@megsyai.com within 30 days of the end of the affected month, including your account identifier, the incident timeline, and the impact you experienced. Credits are applied to future invoices and are not refundable in cash except where required by law.",
    ],
  },
  {
    heading: "Exclusions",
    paragraphs: [
      "The SLA does not apply to downtime caused by: (a) factors outside our reasonable control, including force majeure and internet backbone outages; (b) actions or inactions of you or a third party (including model providers, payment processors, or connectors); (c) your equipment, software, or network; (d) scheduled maintenance announced at least 48 hours in advance; (e) suspension or termination for breach of the Terms; (f) beta, preview, or early-access features.",
    ],
  },
  {
    heading: "Support Response Times",
    list: [
      "Pro & Elite: email support within 2 business days (Sun–Thu, Cairo time).",
      "Business & Ultimate: email support within 1 business day; priority routing for critical outages.",
      "Enterprise: 24/7 priority channel; response within 1 hour for Severity-1 issues (Service unavailable in production).",
    ],
  },
  {
    heading: "Maintenance & Incident Communication",
    paragraphs: [
      "Scheduled maintenance windows are announced at status.megsyai.com and by email at least 48 hours in advance where practicable. Incidents affecting production are posted to the status page and, for Business+ plans, escalated by email or the customer's designated Slack channel.",
    ],
  },
];

const SLAPage = () => (
  <LegalPageLayout
    eyebrow="Enterprise"
    title="Service Level Agreement (SLA)"
    subtitle="Our uptime targets, service credits, and support response commitments for paid Megsy AI plans."
    lastUpdated="July 27, 2026"
    sections={sections}
    seoTitle="Service Level Agreement — Megsy AI"
    seoDescription="Megsy AI SLA: uptime commitments, service credits, exclusions, and support response times for Pro, Business, and Enterprise plans."
    canonicalPath="/legal/sla"
    heroVariant="team"
  />
);

export default SLAPage;
