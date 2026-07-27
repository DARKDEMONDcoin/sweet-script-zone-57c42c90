/** @doc Data Deletion Instructions — required by Meta OAuth policy and Google API Services User Data Policy. */
import LegalPageLayout, { LegalSection } from "@/components/landing/LegalPageLayout";

const sections: LegalSection[] = [
  {
    heading: "Your Right to Delete",
    paragraphs: [
      "You may request deletion of your Megsy AI account and associated personal data at any time. This page explains the exact steps, what gets deleted, what we may retain, and how long the process takes. It also serves as the User Data Deletion URL required by Meta / Facebook Login, Google OAuth, Apple Sign-In, and similar identity providers.",
    ],
  },
  {
    heading: "In-App Deletion (Recommended)",
    list: [
      "Sign in at megsyai.com.",
      "Open Settings → Account → Delete Account.",
      "Confirm the request. Your account enters a 14-day grace period during which you can restore it by signing in again.",
      "After 14 days, your account is deactivated and deletion is queued.",
    ],
  },
  {
    heading: "Email Deletion Request",
    paragraphs: [
      "If you cannot sign in, email privacy@megsyai.com from the address associated with the account, with the subject line \"Delete My Account.\" We will verify your identity and confirm deletion by return email. If your account is linked to a social identity provider (Google, Facebook, Apple, X), include the provider name so we can also revoke that link.",
    ],
  },
  {
    heading: "What Gets Deleted",
    list: [
      "Profile: email, name, avatar, preferences.",
      "Content: conversations, generated images and videos, documents, uploads, and library items.",
      "Settings: connectors, saved prompts, custom instructions, integrations.",
      "Billing profile: address, tax info, saved payment methods (tokens with our processor are revoked).",
    ],
  },
  {
    heading: "What We Retain (and Why)",
    list: [
      "Invoices, receipts, and tax records: retained for the period required by Egyptian and applicable foreign tax law (typically 5–10 years).",
      "Records required to defend legal claims, comply with court orders, or prevent fraud/abuse: retained for the duration of the applicable limitation period.",
      "Aggregated, irreversibly-anonymised statistics that no longer identify you.",
      "Content classified as CSAM or terrorist material: hashes preserved indefinitely as required by law; original content reported to authorities.",
    ],
  },
  {
    heading: "Timeline",
    paragraphs: [
      "Deletion from live production systems: within 30 days of request confirmation. Deletion from backups: within 90 days as backups naturally rotate. Notification of completion is sent by email.",
    ],
  },
  {
    heading: "Third-Party Identity Providers",
    paragraphs: [
      "Deleting your Megsy account does not automatically delete data held by your identity provider (Google, Facebook, Apple, X, GitHub, Microsoft). To revoke the app from those providers, visit their respective security or app-permission pages after your Megsy account is deleted.",
    ],
  },
  {
    heading: "Contact",
    paragraphs: [
      "privacy@megsyai.com · Megsy LLC, 58 El-Hegaz St., Amoun Tower, Unit 84, Floor 8, Sheraton Al-Matar, Cairo, Egypt.",
    ],
  },
];

const DataDeletionPage = () => (
  <LegalPageLayout
    eyebrow="Privacy"
    title="Data Deletion Instructions"
    subtitle="How to delete your Megsy AI account and personal data — including the exact steps for users who signed in with Google, Facebook, Apple, or another social provider."
    lastUpdated="July 27, 2026"
    sections={sections}
    seoTitle="Delete My Account — Megsy AI"
    seoDescription="Step-by-step instructions to delete your Megsy AI account and personal data, and what we retain for legal and tax purposes."
    canonicalPath="/legal/data-deletion"
    heroVariant="portrait"
  />
);

export default DataDeletionPage;
