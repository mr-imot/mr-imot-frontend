/**
 * Custom next/image loader. Prevents ImageKit and other remote images from
 * going through Vercel /_next/image (saves transformations and cache churn).
 *
 * Three branches:
 * - Local (src starts with /): return src as-is so SSR and client match (no origin);
 *   the browser resolves it relative to current origin.
 * - ImageKit: build transformed URL (width, quality, webp) via ImageKit.
 * - Other remote (http/https, not ImageKit): return src unchanged (passthrough).
 */
import { toIkPath, buildIkUrl } from "./imagekit";

export default function imageLoader({
  src,
  width,
  quality,
}: {
  src: string;
  width: number;
  quality?: number;
}): string {
  // Local path: return as-is to avoid hydration mismatch (server vs client origin).
  // Browser resolves relative to current origin.
  if (src.startsWith("/")) {
    return src;
  }

  // ImageKit: build transformed URL so ImageKit does the work, not Vercel
  if (src.includes("ik.imagekit.io")) {
    const path = toIkPath(src);
    return buildIkUrl(path, [
      {
        width,
        quality: quality ?? 75,
        format: "webp",
        focus: "auto",
      },
    ]);
  }

  // Other remote (e.g. Unsplash, OG images, future CDNs): return as-is.
  // Do not prefix origin or rewrite; that would break URLs.
  if (src.startsWith("http://") || src.startsWith("https://")) {
    return src;
  }

  // Fallback: relative path without leading slash; normalize to path (same on server and client)
  return src.startsWith("/") ? src : "/" + src;
}
