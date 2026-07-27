/** @doc Data Retention Schedule — GDPR Article 5(1)(e) and Article 30 record. */
import LegalPageLayout, { LegalSection } from "@/components/landing/LegalPageLayout";

const sections: LegalSection[] = [
  {
    heading: "Principle",
    paragraphs: [
      "We retain personal data only for as long as necessary to provide the Service, comply with legal obligations, resolve disputes, and enforce our agreements. When a retention period expires, data is deleted or irreversibly anonymised. This schedule is our published summary of retention periods and supports our Record of Processing Activities under GDPR Article 30.",
    ],
  },
  {
    heading: "Account & Profile Data",
    list: [
      "Email, display name, hashed password, profile settings: for the life of the account, plus 30 days after deletion for backup rotation.",
      "Payment method tokens (stored by our PCI-DSS-compliant processor, not by us): controlled by the processor's retention rules; typically until you remove the payment method.",
      "Invoices, tax records, and billing history: 5 years after the end of the calendar year of issuance (Egyptian Tax Authority requirement) or longer where applicable local law requires (up to 10 years in some jurisdictions).",
    ],
  },
  {
    heading: "Conversations, Prompts & Generated Content",
    list: [
      "Saved conversations, generated images, videos, documents: until you delete them, or until account deletion.",
      "Temporary generation buffers: purged within 24 hours of completion.",
      "Deleted items in trash: 30 days, then permanent deletion from live systems and 90 days from backups.",
    ],
  },
  {
    heading: "Trust & Safety Data",
    list: [
      "Content classified as CSAM or terrorist content: hash preserved indefinitely for detection; content removed and reported to authorities as required by law.",
      "Records of enforcement actions (warnings, suspensions, terminations): 3 years for appeal and regulatory purposes.",
      "Abuse reports and appeals: 3 years.",
    ],
  },
  {
    heading: "Logs, Telemetry & Analytics",
    list: [
      "Web-server and API access logs: 90 days.",
      "Security event logs (authentication, admin actions): 12 months.",
      "Aggregated analytics without personal identifiers: retained indefinitely.",
      "Crash reports and diagnostic telemetry: 90 days.",
    ],
  },
  {
    heading: "Communications & Support",
    list: [
      "Support tickets and email correspondence: 3 years after case closure.",
      "Marketing consent records: for the life of the subscription plus 3 years after withdrawal, to demonstrate lawful basis under GDPR Article 7.",
    ],
  },
  {
    heading: "Legal Holds",
    paragraphs: [
      "Where we receive a preservation order, subpoena, or reasonable notice of pending litigation, we may retain otherwise-deletable data for the duration of the legal hold. Users are notified where legally permitted.",
    ],
  },
  {
    heading: "Backup Systems",
    paragraphs: [
      "Backups are retained for up to 90 days for disaster-recovery purposes. Deleted data may persist in backups until natural backup rotation completes; it is not restored except in a disaster-recovery event.",
    ],
  },
  {
    heading: "Anonymisation",
    paragraphs: [
      "Where data is retained for statistical or product-improvement purposes beyond its operational lifetime, it is aggregated or irreversibly anonymised so that individuals can no longer be identified.",
    ],
  },
];

const DataRetentionPage = () => (
  <LegalPageLayout
    eyebrow="Privacy"
    title="Data Retention Schedule"
    subtitle="How long Megsy AI keeps different categories of personal data, and when we delete or anonymise them."
    lastUpdated="July 27, 2026"
    sections={sections}
    seoTitle="Data Retention Schedule — Megsy AI"
    seoDescription="Megsy AI's published data-retention periods for account data, conversations, logs, billing records, and trust-and-safety data, under GDPR Article 30."
    canonicalPath="/legal/retention"
    heroVariant="lake"
  />
);

export default DataRetentionPage;
