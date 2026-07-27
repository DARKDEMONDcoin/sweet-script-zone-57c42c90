/** @doc Children's Privacy Notice — COPPA + UK Age-Appropriate Design Code. */
import LegalPageLayout, { LegalSection } from "@/components/landing/LegalPageLayout";

const sections: LegalSection[] = [
  {
    heading: "Age Requirement",
    paragraphs: [
      "Megsy AI is a general-audience product intended for users aged 18 or older. We do not knowingly permit anyone under 18 to create an account or use the Service. In jurisdictions where a lower minimum digital-consent age applies (for example 13 under COPPA, 16 under GDPR default, or as lowered by a specific EU Member State), a parent or legal guardian must create and supervise the account, and accept these terms on the user's behalf.",
    ],
  },
  {
    heading: "No Knowing Collection From Children",
    paragraphs: [
      "We do not knowingly collect personal information from children under the applicable minimum age. If we become aware that we have inadvertently collected such information without verifiable parental consent, we will delete it as soon as practicable. Parents or guardians who believe a child has provided us information may contact privacy@megsyai.com; we will act within 30 days.",
    ],
  },
  {
    heading: "Parental Rights",
    list: [
      "Review the personal information we have collected about their child.",
      "Direct us to delete the child's information and account.",
      "Refuse further collection or use of the child's information.",
      "Receive a copy of the information in a portable format.",
    ],
  },
  {
    heading: "UK Age-Appropriate Design Code",
    paragraphs: [
      "For users in the United Kingdom who are, or may be, under 18, we apply the standards of the ICO's Age-Appropriate Design Code: privacy settings default to high, geolocation is off by default, profiling for advertising is disabled, nudge techniques that undermine privacy are avoided, and children's data is not used against their best interests.",
    ],
  },
  {
    heading: "Safety Features",
    list: [
      "Age-gated adult content is disabled by default and cannot be enabled without additional identity verification.",
      "Safety classifiers on prompts and outputs are always active; they cannot be disabled by minors.",
      "Reports of grooming, sexual solicitation, or CSAM are escalated immediately to NCMEC, INHOPE, and Egyptian authorities.",
      "AI tools that modify human faces, voices, or bodies cannot be applied to identifiable minors under any circumstances.",
    ],
  },
  {
    heading: "Educational Use",
    paragraphs: [
      "Schools and educators wishing to deploy Megsy AI in classroom or curricular settings must contact enterprise@megsyai.com to sign a Student Data Privacy Addendum compliant with FERPA (U.S.), the UK Data Protection Act, and other applicable education-sector regulations. Consumer accounts are not suitable for classroom use.",
    ],
  },
  {
    heading: "Contact",
    paragraphs: [
      "Parents, guardians, schools, and regulators may contact us at privacy@megsyai.com or by post at Megsy LLC, 58 El-Hegaz St., Amoun Tower, Unit 84, Floor 8, Sheraton Al-Matar, Cairo, Egypt.",
    ],
  },
];

const ChildrenPrivacyPage = () => (
  <LegalPageLayout
    eyebrow="Privacy"
    title="Children's Privacy Notice"
    subtitle="How Megsy AI protects minors, complies with COPPA and the UK Age-Appropriate Design Code, and supports parental rights."
    lastUpdated="July 27, 2026"
    sections={sections}
    seoTitle="Children's Privacy — Megsy AI"
    seoDescription="Megsy AI is intended for users aged 18+. Learn how we protect minors, respect parental rights, and comply with COPPA and the UK Age-Appropriate Design Code."
    canonicalPath="/legal/children"
    heroVariant="portrait"
  />
);

export default ChildrenPrivacyPage;
