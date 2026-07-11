import { WorkspaceRoutePage } from "@/components/marketing-copilot/WorkspaceRoutePage";

export const dynamic = "force-dynamic";

type ProductIdeasPageProps = {
  params: Promise<{
    productId: string;
  }>;
};

export default async function ProductIdeasPage({ params }: ProductIdeasPageProps) {
  const { productId } = await params;

  return <WorkspaceRoutePage productId={productId} tab="ideas" />;
}
