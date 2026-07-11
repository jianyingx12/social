import { WorkspaceRoutePage } from "@/components/marketing-copilot/WorkspaceRoutePage";

export const dynamic = "force-dynamic";

type ProductBriefPageProps = {
  params: Promise<{
    productId: string;
  }>;
};

export default async function ProductBriefPage({ params }: ProductBriefPageProps) {
  const { productId } = await params;

  return <WorkspaceRoutePage productId={productId} tab="brief" />;
}
