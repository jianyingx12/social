import type { Metadata } from "next";
import { LegalPage } from "@/components/legal/LegalPage";
import { legalUpdatedAt, privacySections } from "@/lib/legal-content";

export const metadata: Metadata = {
  title: "Privacy Policy | OrganicReach",
  description: "Privacy Policy for OrganicReach.",
};

export default function PrivacyPage() {
  return (
    <LegalPage
      title="Privacy Policy"
      updatedAt={legalUpdatedAt}
      intro="This policy explains what OrganicReach collects, why it is used, and how connected social account data is handled."
      sections={privacySections}
    />
  );
}
