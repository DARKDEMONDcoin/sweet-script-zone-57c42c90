/** @doc Legal imprint — required by German TMG §5 and EU e-commerce law. */
import LegalPageLayout, { LegalSection } from "@/components/landing/LegalPageLayout";

const sections: LegalSection[] = [
  {
    heading: "Company Information (Angaben gemäß § 5 TMG)",
    paragraphs: [
      "Megsy for Digital Platforms Development and E-Commerce LLC (a limited liability company incorporated in the Arab Republic of Egypt).",
      "Registered office: 58 El-Hegaz Street, Amoun Tower, Unit 84, Floor 8, Sheraton Al-Matar, Al-Nozha District, Cairo Governorate, Arab Republic of Egypt.",
      "Commercial Registry (Sijill Tijari): 284691. Tax Identification Number: 774034785.",
    ],
  },
  {
    heading: "Represented By",
    paragraphs: [
      "The company is legally represented by its authorised managing director as recorded with the Egyptian Commercial Registry.",
    ],
  },
  {
    heading: "Contact",
    paragraphs: [
      "General inquiries: support@megsyai.com",
      "Legal notices, service of process, and rights notifications: legal@megsyai.com",
      "Data protection / privacy: privacy@megsyai.com",
      "Security disclosures: security@megsyai.com",
    ],
  },
  {
    heading: "Responsible for Content (Verantwortlich für den Inhalt nach § 55 Abs. 2 RStV)",
    paragraphs: [
      "The managing director of Megsy LLC, at the address listed above, is responsible for editorial and platform content published by Megsy AI.",
    ],
  },
  {
    heading: "EU Online Dispute Resolution",
    paragraphs: [
      "The European Commission provides a platform for online dispute resolution (ODR) available at https://ec.europa.eu/consumers/odr. We are neither obliged nor willing to participate in dispute-resolution proceedings before a consumer arbitration board.",
    ],
  },
  {
    heading: "VAT / Tax",
    paragraphs: [
      "As an Egyptian entity, Megsy LLC is registered for VAT with the Egyptian Tax Authority under Tax ID 774034785. For customers in the European Union, United Kingdom, and other jurisdictions, applicable indirect taxes may be added at checkout in accordance with local law.",
    ],
  },
  {
    heading: "Liability for Content & Links",
    paragraphs: [
      "As a service provider, we are responsible for our own content on these pages in accordance with general laws. We are however not obliged to monitor transmitted or stored third-party information. Obligations to remove or block the use of information under general laws remain unaffected. Our offer contains links to external websites of third parties over which we have no influence; the respective provider or operator of the linked pages is always responsible for their content.",
    ],
  },
];

const ImprintPage = () => (
  <LegalPageLayout
    eyebrow="Legal"
    title="Imprint / Impressum"
    subtitle="Statutory disclosures about the legal entity operating Megsy AI, provided in accordance with EU and German transparency requirements."
    lastUpdated="July 27, 2026"
    sections={sections}
    seoTitle="Imprint / Impressum — Megsy AI"
    seoDescription="Legal imprint and statutory company information for Megsy for Digital Platforms Development and E-Commerce LLC, operator of Megsy AI."
    canonicalPath="/legal/imprint"
    heroVariant="cairo"
  />
);

export default ImprintPage;
