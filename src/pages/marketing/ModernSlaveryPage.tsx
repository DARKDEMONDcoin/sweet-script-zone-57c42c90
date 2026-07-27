/** @doc Modern Slavery & Human Trafficking Statement — UK/AU/CA requirements. */
import LegalPageLayout, { LegalSection } from "@/components/landing/LegalPageLayout";

const sections: LegalSection[] = [
  {
    heading: "Our Commitment",
    paragraphs: [
      "Megsy for Digital Platforms Development and E-Commerce LLC (\"Megsy\") is committed to combating modern slavery, human trafficking, forced labour, and child labour in every part of our business and supply chain. This statement is published in the spirit of the UK Modern Slavery Act 2015, the Australian Modern Slavery Act 2018, the California Transparency in Supply Chains Act, and the German Supply Chain Due Diligence Act, and applies globally to our operations.",
    ],
  },
  {
    heading: "Our Business",
    paragraphs: [
      "Megsy operates a cloud-based AI platform. Our workforce is small, primarily engineering and design personnel, and our supply chain consists chiefly of cloud infrastructure, AI model providers, payment processors, and professional services vendors. We do not operate manufacturing, mining, agricultural, or extractive activities.",
    ],
  },
  {
    heading: "Risk Assessment",
    paragraphs: [
      "Given our sector and supplier profile, we assess the direct risk of modern slavery within our operations as low. We recognise that indirect risks may exist further down the technology supply chain (for example, in device manufacture or content-moderation contractor networks) and address them through supplier due diligence.",
    ],
  },
  {
    heading: "Policies",
    list: [
      "Zero-tolerance for slavery, servitude, forced or compulsory labour, human trafficking, and child labour in any form.",
      "Employees, contractors, and interns are engaged on lawful terms with written contracts, market-rate compensation, and the right to end the engagement freely.",
      "Suppliers are required to comply with all applicable labour laws and, on request, to certify the absence of modern-slavery practices in their operations.",
      "A confidential grievance channel is available at ethics@megsyai.com; reports are investigated and retaliation is prohibited.",
    ],
  },
  {
    heading: "Due Diligence",
    paragraphs: [
      "We conduct proportionate due diligence on new material suppliers, including a review of publicly available modern-slavery disclosures and (for high-risk categories) supplier questionnaires. Where a supplier fails to meet our expectations, we work with them to remediate or terminate the relationship.",
    ],
  },
  {
    heading: "Training & Awareness",
    paragraphs: [
      "Employees involved in procurement, HR, and trust-and-safety receive periodic training on identifying and responding to modern-slavery risks.",
    ],
  },
  {
    heading: "Reporting Concerns",
    paragraphs: [
      "Anyone with information about actual or suspected modern-slavery practices connected to Megsy or our supply chain may report confidentially to ethics@megsyai.com or by post to the address below. In an emergency, contact local law enforcement.",
    ],
  },
  {
    heading: "Approval",
    paragraphs: [
      "This statement is approved by the managing director of Megsy for Digital Platforms Development and E-Commerce LLC and reviewed annually.",
    ],
  },
];

const ModernSlaveryPage = () => (
  <LegalPageLayout
    eyebrow="Ethics"
    title="Modern Slavery & Human Trafficking Statement"
    subtitle="Megsy's commitment to combating modern slavery, forced labour, and human trafficking across our operations and supply chain, worldwide."
    lastUpdated="July 27, 2026"
    sections={sections}
    seoTitle="Modern Slavery Statement — Megsy AI"
    seoDescription="Megsy AI's global modern-slavery and human-trafficking statement, published in line with UK, Australian, Californian, and German due-diligence laws."
    canonicalPath="/legal/modern-slavery"
    heroVariant="nature"
  />
);

export default ModernSlaveryPage;
