import { WorkspaceRoutePage } from "@/components/marketing-copilot/WorkspaceRoutePage";

export const dynamic = "force-dynamic";

type ProductChatPageProps = {
  params: Promise<{
    productId: string;
  }>;
};

export default async function ProductChatPage({ params }: ProductChatPageProps) {
  const { productId } = await params;

  return <WorkspaceRoutePage productId={productId} tab="chat" />;
}
