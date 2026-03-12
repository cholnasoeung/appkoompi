import { auth, authConfigurationError, githubAuthEnabled } from "@/auth";
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
      initialError={authConfigurationError}
      githubEnabled={githubAuthEnabled}
    />
  );
}
