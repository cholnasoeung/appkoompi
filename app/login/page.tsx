import { auth, githubAuthEnabled } from "@/auth";
import AuthForm from "@/components/AuthForm";
import { redirect } from "next/navigation";

type LoginPageProps = {
  searchParams: Promise<{
    callbackUrl?: string;
    error?: string;
  }>;
};

function getLoginError(error?: string) {
  if (error === "CredentialsSignin") {
    return "Invalid email or password.";
  }

  return null;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const session = await auth();

  if (session?.user) {
    redirect("/");
  }

  const params = await searchParams;

  return (
    <AuthForm
      mode="login"
      callbackUrl={params.callbackUrl || "/"}
      initialError={getLoginError(params.error)}
      githubEnabled={githubAuthEnabled}
    />
  );
}
