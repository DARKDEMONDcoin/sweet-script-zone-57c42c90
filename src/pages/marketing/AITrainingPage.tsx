/** @doc AI Training & Model Use Notice — EU AI Act, copyright, and opt-out. */
import LegalPageLayout, { LegalSection } from "@/components/landing/LegalPageLayout";

const sections: LegalSection[] = [
  {
    heading: "Our Approach to Training",
    paragraphs: [
      "Megsy AI routes user requests to a mix of proprietary and third-party foundation models. This notice describes how — and whether — the content you send to Megsy may be used for model training and evaluation, and how you can opt out. It is aligned with the EU AI Act, the EU Copyright Directive (Article 4), and comparable transparency requirements worldwide.",
    ],
  },
  {
    heading: "We Do Not Train on Paid-Plan Content by Default",
    paragraphs: [
      "Prompts, uploads, and generated outputs from paid plans (Pro, Elite, Business, Ultimate, Enterprise) are not used to train Megsy's models or shared with upstream providers for training, unless you explicitly opt in from Settings → Data Controls.",
    ],
  },
  {
    heading: "Free-Plan Content",
    paragraphs: [
      "For free-tier accounts, we may use de-identified prompts and outputs to improve safety classifiers and evaluate model quality. You can opt out at any time in Settings → Data Controls; the opt-out applies prospectively.",
    ],
  },
  {
    heading: "Upstream Model Providers",
    paragraphs: [
      "When we route requests to third-party providers, those requests are governed by the provider's data-processing terms. We only use providers who contractually agree not to train on customer data by default. Aggregated abuse-monitoring logs may be retained by upstream providers for a limited period as required by their policies.",
    ],
  },
  {
    heading: "Training-Data Sources",
    paragraphs: [
      "The foundation models we use are trained by their respective providers on a mix of publicly available internet data, licensed datasets, and human-feedback data. Megsy does not itself scrape the open web for model training. We honour the tdmrep protocol, robots.txt directives, and machine-readable copyright opt-outs under Article 4(3) of the EU CDSM Directive on any first-party training we conduct.",
    ],
  },
  {
    heading: "Copyright Opt-Out for Rights-Holders",
    paragraphs: [
      "Rights-holders who wish to reserve their content from any training we undertake may submit a machine-readable opt-out via robots.txt, ai.txt, or the TDM Reservation Protocol, or file a formal notice at legal@megsyai.com identifying the works and the URLs or fingerprints concerned. We honour valid reservations prospectively.",
    ],
  },
  {
    heading: "Provenance & Watermarking",
    paragraphs: [
      "Where practicable, AI-generated outputs carry provenance metadata (C2PA) or invisible watermarks (SynthID-style). Removing or obscuring these markers is a violation of the Terms and, in several jurisdictions, of law.",
    ],
  },
  {
    heading: "High-Risk AI Systems (EU AI Act)",
    paragraphs: [
      "Megsy AI is a general-purpose AI system. It is not marketed or intended for high-risk uses listed in Annex III of the EU AI Act (biometric identification, critical infrastructure, education admissions, employment, law-enforcement, migration, justice). Deployers who nonetheless integrate Megsy into a high-risk system are the providers of that system and must independently comply with the Act.",
    ],
  },
  {
    heading: "Contact",
    paragraphs: [
      "Model / training inquiries: ai@megsyai.com. Copyright reservation notices: legal@megsyai.com.",
    ],
  },
];

const AITrainingPage = () => (
  <LegalPageLayout
    eyebrow="AI"
    title="AI Training & Model Use Notice"
    subtitle="How Megsy AI uses (and doesn't use) your content for training, our approach to upstream model providers, and how rights-holders can opt out."
    lastUpdated="July 27, 2026"
    sections={sections}
    seoTitle="AI Training & Model Use — Megsy AI"
    seoDescription="Megsy AI's training-data notice under the EU AI Act and Copyright Directive: default no-training on paid content, opt-outs, and rights-holder reservations."
    canonicalPath="/legal/ai-training"
    heroVariant="engineer"
  />
);

export default AITrainingPage;
