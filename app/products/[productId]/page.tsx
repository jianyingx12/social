import { redirect } from "next/navigation";

type ProductPageProps = {
  params: Promise<{
    productId: string;
  }>;
};

export default async function ProductPage({ params }: ProductPageProps) {
  const { productId } = await params;

  redirect(`/products/${encodeURIComponent(productId)}/chat`);
}
