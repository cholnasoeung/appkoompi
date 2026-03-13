import { auth } from "@/auth";
import { getCurrentUserCartCount } from "@/lib/cart";
import { getStorefrontCategories } from "@/lib/storefront";
import NavbarClient from "@/components/NavbarClient";

export default async function Navbar() {
  const [session, categories] = await Promise.all([auth(), getStorefrontCategories()]);
  const cartCount = session?.user?.id ? await getCurrentUserCartCount() : 0;
  const user = session?.user ?? null;
  const userLabel = user?.name?.trim() || user?.email || "User";

  return (
    <NavbarClient
      cartCount={cartCount}
      categories={categories.map((category) => ({ name: category.name, slug: category.slug }))}
      user={
        user
          ? {
              name: user.name ?? null,
              email: user.email ?? null,
              role: user.role,
            }
          : null
      }
      userLabel={userLabel}
    />
  );
}
