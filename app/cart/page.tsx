import { auth } from "@/auth";
import CartManager from "@/components/CartManager";
import { getCurrentUserCart } from "@/lib/cart";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function CartPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/cart");
  }

  const cart = await getCurrentUserCart();

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,_#fffaf0_0%,_#f8fafc_100%)] px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <CartManager initialItems={cart?.items ?? []} />
      </div>
    </main>
  );
}
