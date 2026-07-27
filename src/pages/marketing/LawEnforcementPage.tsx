/** @doc Law-enforcement guidelines — how governments request data or content. */
import LegalPageLayout, { LegalSection } from "@/components/landing/LegalPageLayout";

const sections: LegalSection[] = [
  {
    heading: "Who This Page Is For",
    paragraphs: [
      "These guidelines are intended for law-enforcement authorities, government agencies, courts, and civil litigants seeking user data, content preservation, or removal from Megsy AI. Members of the public should not use these channels; use privacy@megsyai.com or abuse@megsyai.com instead.",
    ],
  },
  {
    heading: "Legal Process We Require",
    list: [
      "Subscriber / basic account information: valid subpoena, court order, or equivalent legal process from a jurisdiction with authority over Megsy LLC.",
      "Non-content records (IP logs, session metadata): court order under 18 U.S.C. § 2703(d) or equivalent.",
      "Content of communications (prompts, generated outputs, private messages): search warrant based on probable cause, or equivalent judicial authorisation.",
      "Foreign requests: served via the Mutual Legal Assistance Treaty (MLAT) between the requesting country and the Arab Republic of Egypt, or through a recognised international letter rogatory.",
      "Preservation requests: written request to legal@megsyai.com; we preserve for 90 days, renewable once.",
    ],
  },
  {
    heading: "Emergency Disclosure",
    paragraphs: [
      "We may voluntarily disclose information without legal process where we have a good-faith belief that an emergency involving imminent risk of death or serious bodily injury requires disclosure. Submit emergency requests to emergency@megsyai.com from an official government email domain, with contact information for a supervising officer and details of the emergency.",
    ],
  },
  {
    heading: "How to Serve Legal Process",
    paragraphs: [
      "Formal service of process must be made on Megsy for Digital Platforms Development and E-Commerce LLC at: 58 El-Hegaz Street, Amoun Tower, Unit 84, Floor 8, Sheraton Al-Matar, Cairo Governorate, Egypt.",
      "Courtesy copies may be emailed to legal@megsyai.com. Email courtesy copies do not by themselves constitute valid service.",
    ],
  },
  {
    heading: "Notice to Users",
    paragraphs: [
      "Consistent with our commitment to user rights, we will notify users of legal requests for their information before disclosure unless prohibited by law (for example, by a non-disclosure order, statutory gag, or where notice would create a risk of injury, death, evidence destruction, or witness intimidation).",
    ],
  },
  {
    heading: "What We Do Not Do",
    list: [
      "We do not provide direct government access to our systems, backdoors, or wholesale data feeds.",
      "We do not weaken encryption or safety controls at the request of any government.",
      "We do not respond to informal or verbal requests — all requests must be documented and served properly.",
    ],
  },
  {
    heading: "Cost Reimbursement",
    paragraphs: [
      "Where permitted by law, we may seek reimbursement of reasonable costs incurred in responding to legal process.",
    ],
  },
];

const LawEnforcementPage = () => (
  <LegalPageLayout
    eyebrow="Legal"
    title="Law Enforcement Guidelines"
    subtitle="How authorities can lawfully request user data, content preservation, or content removal from Megsy AI — and the safeguards we apply to protect our users."
    lastUpdated="July 27, 2026"
    sections={sections}
    seoTitle="Law Enforcement Guidelines — Megsy AI"
    seoDescription="Legal process required to obtain user data or content from Megsy AI, emergency disclosure procedures, and user-notice policy."
    canonicalPath="/legal/law-enforcement"
    heroVariant="engineer"
  />
);

export default LawEnforcementPage;
