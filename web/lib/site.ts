const FALLBACK_SITE_URL = "https://sona-clean.vercel.app";

function withProtocol(value: string) {
  return value.startsWith("http://") || value.startsWith("https://")
    ? value
    : `https://${value}`;
}

export function getSiteUrl() {
  const envUrl =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.VERCEL_PROJECT_PRODUCTION_URL ||
    process.env.VERCEL_URL;

  if (!envUrl) {
    return new URL(FALLBACK_SITE_URL);
  }

  return new URL(withProtocol(envUrl));
}

export function getAbsoluteUrl(path = "/") {
  return new URL(path, getSiteUrl());
}
