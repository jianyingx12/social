import { WorkspaceRoutePage } from "@/components/marketing-copilot/WorkspaceRoutePage";

export const dynamic = "force-dynamic";

type ProductResearchPageProps = {
  params: Promise<{
    productId: string;
  }>;
};

export default async function ProductResearchPage({ params }: ProductResearchPageProps) {
  const { productId } = await params;

  return <WorkspaceRoutePage productId={productId} tab="opportunities" />;
}
