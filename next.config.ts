import type { NextConfig } from "next";

// Base44 preview only: Next gates dev assets/HMR by Origin, so allow the
// proxied preview origin. Inert unless BASE44_PREVIEW_MODE === "1".
const previewOverrides =
  process.env.BASE44_PREVIEW_MODE === "1" && process.env.BASE44_PUBLIC_HOST_SUFFIX
    ? { allowedDevOrigins: [`3000-${process.env.BASE44_PUBLIC_HOST_SUFFIX}`] }
    : {};

const nextConfig: NextConfig = {
  ...previewOverrides,
};

export default nextConfig;
