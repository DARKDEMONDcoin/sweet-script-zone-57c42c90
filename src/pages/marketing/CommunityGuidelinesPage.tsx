/** @doc Community Guidelines — user-behaviour rules for shared surfaces. */
import LegalPageLayout, { LegalSection } from "@/components/landing/LegalPageLayout";

const sections: LegalSection[] = [
  {
    heading: "Our Community Principles",
    paragraphs: [
      "Megsy AI includes shared surfaces where users interact with each other: shared conversations, published apps, comments, referral pages, and community showcases. These guidelines describe what behaviour is welcome on those surfaces. They apply in addition to the Acceptable Use Policy and the Terms of Service.",
    ],
  },
  {
    heading: "Respect Other People",
    list: [
      "No harassment, hate speech, threats, doxxing, or targeted intimidation based on race, ethnicity, national origin, religion, disability, gender, gender identity, sexual orientation, age, or serious illness.",
      "No non-consensual sexual content, sexualised depictions of minors, or content that promotes self-harm, suicide, or eating disorders.",
      "No coordinated harassment campaigns, brigading, or use of the Service to organise real-world violence.",
    ],
  },
  {
    heading: "Respect Truth & Elections",
    list: [
      "No deceptive synthetic media of real people, especially candidates for public office, in a way likely to mislead voters.",
      "No coordinated inauthentic behaviour, fake accounts, or artificial amplification designed to manipulate public opinion.",
      "No health, medical, or safety-critical misinformation likely to cause real-world harm.",
    ],
  },
  {
    heading: "Respect Intellectual Property",
    list: [
      "Do not publish content that infringes copyright, trademark, patent, trade-secret, or right-of-publicity of others.",
      "Attribute sources when quoting or paraphrasing, and comply with the licences of any open-source assets you use.",
      "Do not remove Megsy provenance markers, C2PA metadata, or AI-content watermarks.",
    ],
  },
  {
    heading: "Respect the Platform",
    list: [
      "No spam, scams, phishing, malware distribution, or unauthorised advertising.",
      "No attempts to bypass safety filters, rate limits, or moderation systems.",
      "No scraping, mass-downloading, or building competing datasets from Megsy content or outputs.",
    ],
  },
  {
    heading: "How We Enforce",
    paragraphs: [
      "Enforcement is proportionate: a first infraction may result in a warning, content removal, or feature restriction; repeated or serious violations lead to suspension or permanent termination and, where the law requires, referral to authorities. Full detail is in the Content Moderation Policy at /legal/moderation-full.",
    ],
  },
  {
    heading: "Reporting & Appeals",
    paragraphs: [
      "Report violations in-product via the Report button, or by email to abuse@megsyai.com. Appeal moderation decisions within 6 months by writing to appeals@megsyai.com; a human moderator not involved in the original decision will review.",
    ],
  },
];

const CommunityGuidelinesPage = () => (
  <LegalPageLayout
    eyebrow="Community"
    title="Community Guidelines"
    subtitle="The behaviour standards we expect on shared Megsy surfaces — for a safer, more useful, and more creative community."
    lastUpdated="July 27, 2026"
    sections={sections}
    seoTitle="Community Guidelines — Megsy AI"
    seoDescription="Behaviour rules for Megsy AI's shared surfaces: respect for people, truth, intellectual property, and platform integrity, with reporting and appeal channels."
    canonicalPath="/legal/community"
    heroVariant="team"
  />
);

export default CommunityGuidelinesPage;
