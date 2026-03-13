import { auth } from "@/auth";
import { getCurrentUserCartCount } from "@/lib/cart";
import NavbarClient from "@/components/NavbarClient";

export default async function Navbar() {
  const session = await auth();
  const cartCount = session?.user?.id ? await getCurrentUserCartCount() : 0;
  const user = session?.user ?? null;
  const userLabel = user?.name?.trim() || user?.email || "User";

  return (
    <NavbarClient
      cartCount={cartCount}
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
