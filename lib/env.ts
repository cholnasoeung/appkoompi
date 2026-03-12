function hasRealEnvValue(value: string | undefined) {
  if (!value) {
    return false;
  }

  const normalizedValue = value.trim().toLowerCase();

  return (
    normalizedValue.length > 0 &&
    !normalizedValue.startsWith("your-") &&
    !normalizedValue.startsWith("your_") &&
    !normalizedValue.includes("connection-string") &&
    !normalizedValue.includes("generate-a-long-random-secret") &&
    !normalizedValue.includes("client_id_here") &&
    !normalizedValue.includes("client_secret_here")
  );
}

const authSecret = process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET;
const githubClientId = process.env.GITHUB_ID;
const githubClientSecret = process.env.GITHUB_SECRET;
const mongoUri = process.env.MONGODB_URI;

export const environmentStatus = {
  authSecretConfigured: hasRealEnvValue(authSecret),
  githubConfigured:
    hasRealEnvValue(githubClientId) && hasRealEnvValue(githubClientSecret),
  mongodbConfigured: hasRealEnvValue(mongoUri),
};

export function getAuthConfigurationError() {
  if (!environmentStatus.authSecretConfigured) {
    return "Authentication is not configured. Set AUTH_SECRET or NEXTAUTH_SECRET in Vercel.";
  }

  return null;
}

export function getDatabaseConfigurationError() {
  if (!environmentStatus.mongodbConfigured) {
    return "Database is not configured. Set MONGODB_URI in Vercel.";
  }

  return null;
}

export function getAppConfigurationError() {
  return getAuthConfigurationError() ?? getDatabaseConfigurationError();
}
