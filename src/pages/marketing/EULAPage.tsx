/** @doc End-User License Agreement — required as a distinct document by Apple App Store §3.1. */
import LegalPageLayout, { LegalSection } from "@/components/landing/LegalPageLayout";

const sections: LegalSection[] = [
  {
    heading: "About This Agreement",
    paragraphs: [
      "This End-User License Agreement (\"EULA\") governs your use of the Megsy AI software applications, including our web application, iOS app, Android app, desktop app, browser extensions, and any related software (collectively, the \"Software\"). It supplements the Terms of Service; where they conflict on questions of licensing, this EULA controls.",
    ],
  },
  {
    heading: "Grant of License",
    paragraphs: [
      "Subject to your continued compliance with the Terms of Service, Megsy grants you a personal, worldwide, non-exclusive, non-transferable, non-sublicensable, revocable, limited license to install and use the Software on devices you own or control, for personal or internal business use only.",
    ],
  },
  {
    heading: "Restrictions",
    list: [
      "You may not copy, modify, adapt, translate, reverse-engineer, decompile, disassemble, or create derivative works of the Software except to the extent this restriction is prohibited by applicable law.",
      "You may not remove, alter, or obscure any proprietary notices, watermarks, or provenance markers.",
      "You may not use the Software to build a competing product or to train, fine-tune, or evaluate any machine-learning model that competes with Megsy AI.",
      "You may not rent, lease, lend, sell, sublicense, redistribute, or transfer the Software or your license to any third party.",
      "You may not use the Software in violation of the Acceptable Use Policy, the AI Disclaimer, or applicable export-control and sanctions laws.",
    ],
  },
  {
    heading: "Updates & Auto-Updates",
    paragraphs: [
      "The Software may automatically download and install updates, including security patches, feature enhancements, and configuration changes. Updates may add or remove features. Your continued use after an update constitutes acceptance of the updated Software.",
    ],
  },
  {
    heading: "Third-Party Beneficiary (Apple)",
    paragraphs: [
      "If you obtain the Software from the Apple App Store, you acknowledge that Apple Inc. and its subsidiaries are third-party beneficiaries of this EULA, and that Apple has the right (and is deemed to have accepted the right) to enforce this EULA against you. Apple is not responsible for the Software or its content, for any claims relating to the Software, or for providing maintenance or support for the Software.",
    ],
  },
  {
    heading: "Google Play & Other Stores",
    paragraphs: [
      "If you obtain the Software from Google Play, the Amazon Appstore, Huawei AppGallery, Microsoft Store, or another distribution platform, your use is also subject to that platform's terms. In the event of a conflict, the platform-specific terms control only to the extent required by the platform operator.",
    ],
  },
  {
    heading: "Open-Source Components",
    paragraphs: [
      "The Software includes open-source components licensed under their respective licenses. A list of components and their licenses is available on request at legal@megsyai.com. Nothing in this EULA limits your rights under those licenses.",
    ],
  },
  {
    heading: "Termination",
    paragraphs: [
      "This EULA terminates automatically if you breach any of its terms. On termination, you must stop using the Software and delete all copies. Sections that by their nature should survive (including restrictions, disclaimers, and limitations of liability) will survive termination.",
    ],
  },
  {
    heading: "Warranty Disclaimer & Liability",
    paragraphs: [
      "THE SOFTWARE IS PROVIDED \"AS IS\" WITHOUT WARRANTY OF ANY KIND. To the maximum extent permitted by law, Megsy disclaims all warranties, express or implied, including merchantability, fitness for a particular purpose, and non-infringement. Megsy's aggregate liability under this EULA is limited as set out in the Terms of Service.",
    ],
  },
];

const EULAPage = () => (
  <LegalPageLayout
    eyebrow="Legal"
    title="End-User License Agreement (EULA)"
    subtitle="The license terms that apply when you install and use Megsy AI's software applications on your devices."
    lastUpdated="July 27, 2026"
    sections={sections}
    seoTitle="End-User License Agreement — Megsy AI"
    seoDescription="Megsy AI End-User License Agreement (EULA): licence grant, restrictions, updates, and store-specific provisions for iOS, Android, and desktop."
    canonicalPath="/legal/eula"
    heroVariant="engineer"
  />
);

export default EULAPage;
