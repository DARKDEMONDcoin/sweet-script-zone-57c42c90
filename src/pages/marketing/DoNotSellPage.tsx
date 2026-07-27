/** @doc CCPA/CPRA "Do Not Sell or Share My Personal Information" notice. */
import LegalPageLayout, { LegalSection } from "@/components/landing/LegalPageLayout";

const sections: LegalSection[] = [
  {
    heading: "Your Right Under California Law",
    paragraphs: [
      "The California Consumer Privacy Act, as amended by the California Privacy Rights Act (collectively, the \"CCPA/CPRA\"), gives California residents the right to opt out of the \"sale\" or \"sharing\" of their personal information, and to limit the use and disclosure of \"sensitive personal information.\" Similar rights exist under Colorado (CPA), Connecticut (CTDPA), Virginia (VCDPA), Utah (UCPA), Texas (TDPSA), Oregon (OCPA), and other U.S. state privacy laws.",
    ],
  },
  {
    heading: "Do We Sell or Share Personal Information?",
    paragraphs: [
      "Megsy AI does not sell personal information for money. However, under the broad CCPA/CPRA definitions, some analytics and advertising cookies used on our marketing pages may constitute \"sharing\" for cross-context behavioural advertising. You can opt out at any time using the controls below.",
    ],
  },
  {
    heading: "How to Opt Out",
    list: [
      "Click the \"Cookie Preferences\" link in our website footer and disable Advertising and Analytics categories.",
      "Enable the Global Privacy Control (GPC) signal in your browser — we honour GPC automatically for visitors we can identify as California residents.",
      "Email privacy@megsyai.com with the subject \"Do Not Sell or Share My Info\" and include the email address associated with your account.",
      "Submit a verifiable consumer request through our Privacy Request form linked in the Privacy Policy.",
    ],
  },
  {
    heading: "Limit the Use of Sensitive Personal Information",
    paragraphs: [
      "You may direct us to limit the use and disclosure of your sensitive personal information (such as precise geolocation, government-ID numbers, or contents of your private messages) to what is necessary to provide the Service. Send a request to privacy@megsyai.com with the subject \"Limit Use of Sensitive Info.\"",
    ],
  },
  {
    heading: "Authorised Agents",
    paragraphs: [
      "You may designate an authorised agent to submit a request on your behalf. We will require written proof of authorisation and verification of your identity before acting on the request.",
    ],
  },
  {
    heading: "Non-Discrimination",
    paragraphs: [
      "We will not deny goods or services, charge different prices, provide a different level or quality of service, or retaliate against you for exercising your privacy rights.",
    ],
  },
  {
    heading: "Contact",
    paragraphs: [
      "Questions about this notice or your rights: privacy@megsyai.com. Postal: Megsy LLC, 58 El-Hegaz St., Amoun Tower, Unit 84, Floor 8, Sheraton Al-Matar, Cairo, Egypt.",
    ],
  },
];

const DoNotSellPage = () => (
  <LegalPageLayout
    eyebrow="Privacy Rights"
    title="Do Not Sell or Share My Personal Information"
    subtitle="Your rights under the California Consumer Privacy Act (CCPA/CPRA) and equivalent U.S. state privacy laws, and how to exercise them."
    lastUpdated="July 27, 2026"
    sections={sections}
    seoTitle="Do Not Sell or Share My Info — Megsy AI"
    seoDescription="Opt out of the sale or sharing of your personal information and limit the use of sensitive personal information under CCPA/CPRA."
    canonicalPath="/legal/do-not-sell"
    heroVariant="lake"
  />
);

export default DoNotSellPage;
