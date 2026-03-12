import NextAuth from "next-auth";
import {
  authConfigurationError,
  authEnabled,
  authOptions,
} from "@/auth";

const handler = NextAuth(authOptions);

function authMisconfiguredResponse() {
  return Response.json(
    {
      message:
        authConfigurationError ??
        "Authentication is not configured on the server.",
    },
    { status: 503 }
  );
}

export async function GET(request: Request, context: unknown) {
  if (!authEnabled) {
    return authMisconfiguredResponse();
  }

  return handler(request, context);
}

export async function POST(request: Request, context: unknown) {
  if (!authEnabled) {
    return authMisconfiguredResponse();
  }

  return handler(request, context);
}
