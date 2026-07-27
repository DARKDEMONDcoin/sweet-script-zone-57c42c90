/** @doc Beta / Preview Feature Terms — supplemental terms for pre-release features. */
import LegalPageLayout, { LegalSection } from "@/components/landing/LegalPageLayout";

const sections: LegalSection[] = [
  {
    heading: "What Counts as Beta",
    paragraphs: [
      "From time to time Megsy AI makes features available on a pre-release basis, labelled \"Beta\", \"Preview\", \"Experimental\", \"Alpha\", \"Early Access\", \"Insider\", or similar (collectively, \"Beta Features\"). These supplemental terms apply to your use of any Beta Feature, in addition to the Terms of Service and the AI Disclaimer.",
    ],
  },
  {
    heading: "Provided \"As Is\"",
    paragraphs: [
      "Beta Features are provided \"as is\" and \"as available\" for testing and feedback purposes. They may be unstable, incomplete, inaccurate, or produce unexpected results. Beta Features are not covered by the SLA and may be modified, throttled, suspended, or discontinued at any time without notice or liability.",
    ],
  },
  {
    heading: "Confidentiality",
    paragraphs: [
      "Access credentials, unreleased documentation, non-public roadmaps, error messages that reveal internal structure, and any information marked \"confidential\" in connection with a Beta Feature are Megsy Confidential Information. You may not publish screenshots, benchmarks, or demonstrations of a Beta Feature externally without our prior written consent, unless the feature has been publicly announced.",
    ],
  },
  {
    heading: "Feedback Licence",
    paragraphs: [
      "Any feedback, suggestions, ideas, bug reports, or improvements you provide about a Beta Feature (\"Feedback\") are provided without expectation of compensation. You grant Megsy a perpetual, irrevocable, worldwide, royalty-free licence to use, modify, and incorporate the Feedback into any product or service without attribution or restriction.",
    ],
  },
  {
    heading: "Data & Retention",
    paragraphs: [
      "Data you submit to a Beta Feature may be stored separately, retained for shorter periods, or handled with different logging than the general Service, to allow debugging. Do not submit production, regulated, or sensitive personal data to Beta Features unless the feature's specific documentation permits it.",
    ],
  },
  {
    heading: "No Warranty & Limitation",
    paragraphs: [
      "TO THE MAXIMUM EXTENT PERMITTED BY LAW, MEGSY DISCLAIMS ALL WARRANTIES WITH RESPECT TO BETA FEATURES AND WILL NOT BE LIABLE FOR ANY DAMAGES ARISING OUT OF YOUR USE OF THEM. THE LIMITATION-OF-LIABILITY PROVISIONS OF THE TERMS OF SERVICE APPLY WITH FULL FORCE.",
    ],
  },
  {
    heading: "Termination",
    paragraphs: [
      "We may withdraw Beta access from any user at any time. On withdrawal, you will lose access to the Beta Feature and any content stored exclusively within it; you are responsible for exporting anything you need to keep before the withdrawal takes effect.",
    ],
  },
];

const BetaTermsPage = () => (
  <LegalPageLayout
    eyebrow="Legal"
    title="Beta & Preview Feature Terms"
    subtitle="Supplemental terms that apply when you use pre-release Megsy AI features labelled Beta, Preview, Experimental, or Early Access."
    lastUpdated="July 27, 2026"
    sections={sections}
    seoTitle="Beta & Preview Terms — Megsy AI"
    seoDescription="Supplemental terms governing beta, preview, and experimental features on Megsy AI, including confidentiality, feedback licence, and no-warranty provisions."
    canonicalPath="/legal/beta"
    heroVariant="engineer"
  />
);

export default BetaTermsPage;
