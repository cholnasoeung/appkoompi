import ProductDetailClient from "@/components/ProductDetailClient";
import StorefrontProductCard from "@/components/StorefrontProductCard";
import { getStorefrontProductBySlug } from "@/lib/storefront";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

type ProductPageProps = {
  params: Promise<{ slug: string }>;
};

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const { product, relatedProducts } = await getStorefrontProductBySlug(slug);

  if (!product) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-[#f3f3f3] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-12">
        <ProductDetailClient product={product} />

        <section>
          <div className="border-t border-slate-300 pt-4">
            <h2 className="text-2xl font-black uppercase tracking-[-0.04em] text-black">
              Similar Items
            </h2>
          </div>

          <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {relatedProducts.map((relatedProduct) => (
              <StorefrontProductCard key={relatedProduct._id} product={relatedProduct} compact />
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
