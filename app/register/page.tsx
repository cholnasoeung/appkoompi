import { auth } from "@/auth";
import AuthForm from "@/components/AuthForm";
import { redirect } from "next/navigation";

type RegisterPageProps = {
  searchParams: Promise<{
    callbackUrl?: string;
  }>;
};

export default async function RegisterPage({
  searchParams,
}: RegisterPageProps) {
  const session = await auth();

  if (session?.user) {
    redirect("/");
  }

  const params = await searchParams;

  return (
    <AuthForm
      mode="register"
      callbackUrl={params.callbackUrl || "/"}
      githubEnabled={Boolean(
        process.env.GITHUB_ID && process.env.GITHUB_SECRET
      )}
    />
  );
}
