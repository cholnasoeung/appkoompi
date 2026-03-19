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
const paymentProvider = process.env.PAYMENT_PROVIDER;
const paymentApiKey =
  process.env.BARAY_API_KEY ?? process.env.NEXT_PUBLIC_PAYMENT_PUBLIC_KEY;
const paymentSecretKey =
  process.env.BARAY_SECRET_KEY ?? process.env.PAYMENT_ENCRYPTION_KEY;
const paymentIv = process.env.BARAY_IV ?? process.env.PAYMENT_CYPHER_KEY;
const paymentSuccessUrl = process.env.PAYMENT_SUCCESS_URL;
const paymentWebhookUrl = process.env.PAYMENT_WEBHOOK_URL;

export const environmentStatus = {
  authSecretConfigured: hasRealEnvValue(authSecret),
  githubConfigured:
    hasRealEnvValue(githubClientId) && hasRealEnvValue(githubClientSecret),
  mongodbConfigured: hasRealEnvValue(mongoUri),
  paymentConfigured:
    hasRealEnvValue(paymentProvider) &&
    hasRealEnvValue(paymentApiKey) &&
    hasRealEnvValue(paymentSecretKey) &&
    hasRealEnvValue(paymentIv) &&
    hasRealEnvValue(paymentSuccessUrl) &&
    hasRealEnvValue(paymentWebhookUrl),
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

export function getPaymentEnvironmentError() {
  if (!environmentStatus.paymentConfigured) {
    return "Payment is not configured. Set the Baray keys and URLs in .env.local or Vercel.";
  }

  return null;
}

export function getAppConfigurationError() {
  return getAuthConfigurationError() ?? getDatabaseConfigurationError();
}
