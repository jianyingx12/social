import type { Metadata } from "next";
import { LegalPage } from "@/components/legal/LegalPage";
import { legalUpdatedAt, termsSections } from "@/lib/legal-content";

export const metadata: Metadata = {
  title: "Terms of Service | OrganicReach",
  description: "Terms of Service for OrganicReach.",
};

export default function TermsPage() {
  return (
    <LegalPage
      title="Terms of Service"
      updatedAt={legalUpdatedAt}
      intro="These terms describe the basic rules for using OrganicReach while it is in early development."
      sections={termsSections}
    />
  );
}
