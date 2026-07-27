/** @doc EU Digital Services Act (DSA) Article 15 transparency report. */
import LegalPageLayout, { LegalSection } from "@/components/landing/LegalPageLayout";

const sections: LegalSection[] = [
  {
    heading: "Purpose & Scope",
    paragraphs: [
      "This Transparency Report is published in accordance with Articles 15, 24, and 42 of the EU Digital Services Act (Regulation (EU) 2022/2065), and reflects our voluntary commitment to transparency on content moderation, government requests, and platform integrity worldwide. It covers activity across all Megsy AI products.",
    ],
  },
  {
    heading: "Content Moderation Actions",
    paragraphs: [
      "During the reporting period, Megsy AI takes the following categories of enforcement action: content removal, output-generation refusal, temporary account suspension, permanent account termination, feature restriction, and referral to law enforcement in cases involving imminent risk to life or child safety.",
      "The majority of enforcement actions target automated abuse (spam, scripted account creation, prompt-injection attempts to bypass safety filters). Human-reviewed cases predominantly involve intellectual-property claims, non-consensual intimate imagery, and CSAM-adjacent content, which is escalated immediately to NCMEC and the appropriate national hotlines.",
    ],
  },
  {
    heading: "Detection Methods",
    list: [
      "Proactive automated detection using safety classifiers on prompts and outputs, including CSAM hash-matching, violence/self-harm classifiers, and prompt-injection detectors.",
      "User-submitted reports through in-product report buttons, abuse@megsyai.com, and our DSA point of contact.",
      "Trusted-flagger channels for law enforcement, NCMEC, INHOPE members, and IWF.",
      "Third-party rights-holder notifications under the DMCA and equivalent international regimes.",
    ],
  },
  {
    heading: "Government & Law-Enforcement Requests",
    paragraphs: [
      "Megsy AI receives requests from law-enforcement agencies for user data, content preservation, and emergency disclosure. We publish aggregate numbers by country and request type in this report. All requests are reviewed by our legal team; we require valid legal process (search warrant, court order, subpoena, or MLAT request) unless the request qualifies as an emergency involving imminent risk of death or serious bodily injury.",
      "See our Law Enforcement Guidelines at /legal/law-enforcement for the full process.",
    ],
  },
  {
    heading: "Notices Received Under Article 16 DSA",
    paragraphs: [
      "Any user or third party may submit a notice of allegedly illegal content through our Notice-and-Action mechanism at abuse@megsyai.com. Notices are acknowledged within 48 hours and processed within 7 days, or faster where required by law.",
    ],
  },
  {
    heading: "Complaint-Handling System (Article 20 DSA)",
    paragraphs: [
      "Users whose content or account is subject to a moderation decision may appeal within 6 months by writing to appeals@megsyai.com. Appeals are reviewed by a human moderator who was not involved in the original decision. Users retain the right to out-of-court dispute settlement with a certified body and to judicial redress.",
    ],
  },
  {
    heading: "Automated Decision-Making",
    paragraphs: [
      "A significant share of enforcement decisions on the platform are made by automated systems, particularly for spam, malware, and clearly illegal content categories such as CSAM. Users have the right to request human review of any automated decision that materially affects them.",
    ],
  },
  {
    heading: "Ads, Recommender Systems & Political Ads",
    paragraphs: [
      "Megsy AI does not currently run behavioural advertising on end-user surfaces. Our recommender systems for content discovery (models, prompts, templates) rely on non-sensitive signals such as popularity and language, and can be configured by the user.",
    ],
  },
  {
    heading: "Contact",
    paragraphs: [
      "DSA point of contact: dsa@megsyai.com. Legal representative in the Union: pending designation; users in the EU may contact legal@megsyai.com in the interim.",
    ],
  },
];

const TransparencyReportPage = () => (
  <LegalPageLayout
    eyebrow="Trust & Safety"
    title="Transparency Report"
    subtitle="How we moderate content, respond to government requests, and enforce our policies — published in accordance with the EU Digital Services Act and international best practice."
    lastUpdated="July 27, 2026"
    sections={sections}
    seoTitle="Transparency Report — Megsy AI"
    seoDescription="Megsy AI's transparency report under the EU Digital Services Act: content moderation, government requests, complaint handling, and automated decisions."
    canonicalPath="/legal/transparency"
    heroVariant="team"
  />
);

export default TransparencyReportPage;
