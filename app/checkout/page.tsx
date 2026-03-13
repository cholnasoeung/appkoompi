import { auth } from "@/auth";
import CheckoutClient from "@/components/CheckoutClient";
import { getCurrentUserCart } from "@/lib/cart";
import { connectToDatabase } from "@/lib/mongodb";
import User from "@/models/User";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function CheckoutPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/checkout");
  }

  const [cart] = await Promise.all([getCurrentUserCart(), connectToDatabase()]);
  const user = await User.findById(session.user.id).lean();
  const defaultAddress = user?.addresses.find((address) => address.isDefault) ?? user?.addresses[0];

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,_#fffaf0_0%,_#f8fafc_100%)] px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <CheckoutClient
          initialItems={cart?.items ?? []}
          defaultEmail={session.user.email ?? ""}
          defaultAddress={{
            fullName: defaultAddress?.fullName ?? session.user.name ?? "",
            phone: defaultAddress?.phone ?? "",
            street: defaultAddress?.street ?? "",
            city: defaultAddress?.city ?? "",
            state: defaultAddress?.state ?? "",
            postalCode: defaultAddress?.postalCode ?? "",
            country: defaultAddress?.country ?? "",
          }}
        />
      </div>
    </main>
  );
}
