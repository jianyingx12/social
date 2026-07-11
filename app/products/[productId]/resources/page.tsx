import { WorkspaceRoutePage } from "@/components/marketing-copilot/WorkspaceRoutePage";

export const dynamic = "force-dynamic";

type ProductResourcesPageProps = {
  params: Promise<{
    productId: string;
  }>;
};

export default async function ProductResourcesPage({ params }: ProductResourcesPageProps) {
  const { productId } = await params;

  return <WorkspaceRoutePage productId={productId} tab="resources" />;
}
