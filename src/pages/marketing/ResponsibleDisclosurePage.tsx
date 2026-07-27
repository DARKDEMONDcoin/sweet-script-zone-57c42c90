/** @doc Responsible security disclosure policy — RFC 9116 compatible. */
import LegalPageLayout, { LegalSection } from "@/components/landing/LegalPageLayout";

const sections: LegalSection[] = [
  {
    heading: "Our Commitment",
    paragraphs: [
      "Megsy AI welcomes reports from security researchers who help us keep our users safe. If you follow these guidelines when reporting a vulnerability, we will not pursue civil or criminal action against you, and we will work with you to understand and fix the issue quickly.",
    ],
  },
  {
    heading: "In Scope",
    list: [
      "megsyai.com and all subdomains operated by Megsy LLC.",
      "Megsy AI mobile applications (iOS and Android) published under our developer accounts.",
      "Our public APIs and OAuth endpoints.",
      "Infrastructure services under our administrative control.",
    ],
  },
  {
    heading: "Out of Scope",
    list: [
      "Third-party services, including model providers, payment processors, hosting providers, and connectors, unless the vulnerability directly compromises Megsy user data.",
      "Denial-of-service, volumetric, or resource-exhaustion attacks.",
      "Social engineering of employees, contractors, or customers.",
      "Physical attacks against offices or hardware.",
      "Reports from automated scanners without proof of exploitability.",
      "Missing security headers or best-practice recommendations without demonstrated impact.",
    ],
  },
  {
    heading: "How to Report",
    paragraphs: [
      "Email security@megsyai.com with a detailed description of the vulnerability, reproduction steps, proof-of-concept code or screenshots, and your contact information. Encrypt sensitive reports with our PGP key, published at /.well-known/security.txt.",
      "We acknowledge reports within 3 business days and provide a substantive update within 10 business days. Critical issues are typically remediated within 30 days; lower-severity issues within 90 days.",
    ],
  },
  {
    heading: "Safe-Harbor Rules of Engagement",
    list: [
      "Test only against accounts and data you own or have explicit written permission to test.",
      "Do not access, modify, or delete data belonging to other users. If you inadvertently access user data, stop immediately, delete any copies, and include this in your report.",
      "Do not perform testing that degrades the Service for other users.",
      "Do not publicly disclose the vulnerability before we have had a reasonable opportunity to remediate (typically 90 days, or as coordinated with our team).",
      "Comply with all applicable laws, including the Egyptian Anti-Cybercrime Law and equivalent laws in your jurisdiction.",
    ],
  },
  {
    heading: "Recognition & Rewards",
    paragraphs: [
      "We maintain a public Hall of Fame for researchers who report qualifying vulnerabilities. Monetary bounties are awarded at our discretion for high-impact issues; contact security@megsyai.com for details.",
    ],
  },
  {
    heading: "security.txt",
    paragraphs: [
      "In accordance with RFC 9116, our machine-readable disclosure metadata is available at https://megsyai.com/.well-known/security.txt.",
    ],
  },
];

const ResponsibleDisclosurePage = () => (
  <LegalPageLayout
    eyebrow="Security"
    title="Responsible Disclosure Policy"
    subtitle="How to report a security vulnerability to Megsy AI safely, and the safe-harbor commitments we make to researchers who follow these rules."
    lastUpdated="July 27, 2026"
    sections={sections}
    seoTitle="Responsible Disclosure — Megsy AI"
    seoDescription="Report security vulnerabilities to Megsy AI under our coordinated disclosure policy, with safe-harbor protections for good-faith researchers."
    canonicalPath="/legal/responsible-disclosure"
    heroVariant="engineer"
  />
);

export default ResponsibleDisclosurePage;
