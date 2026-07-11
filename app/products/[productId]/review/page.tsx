import { WorkspaceRoutePage } from "@/components/marketing-copilot/WorkspaceRoutePage";

export const dynamic = "force-dynamic";

type ProductReviewPageProps = {
  params: Promise<{
    productId: string;
  }>;
};

export default async function ProductReviewPage({ params }: ProductReviewPageProps) {
  const { productId } = await params;

  return <WorkspaceRoutePage productId={productId} tab="review" />;
}
