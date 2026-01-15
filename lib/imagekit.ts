import type { Transformation } from "@imagekit/next";

export const IK_URL_ENDPOINT = "https://ik.imagekit.io/ts59gf2ul";

export function toIkPath(url: string | null | undefined): string {
  if (!url) return "";
  const withoutQuery = url.split("?")[0];
  const matchedDomain = /^https?:\/\/ik\.imagekit\.io\/[^/]+/i.test(withoutQuery);
  if (!matchedDomain) return withoutQuery;
  const withoutDomain = withoutQuery.replace(/^https?:\/\/ik\.imagekit\.io\/[^/]+/i, "");
  return withoutDomain.startsWith("/") ? withoutDomain : `/${withoutDomain}`;
}

export function buildSocialPath(path: string, opts?: { width?: number; height?: number; quality?: number }) {
  const width = opts?.width ?? 1200;
  const height = opts?.height ?? 630;
  const quality = opts?.quality ?? 85;
  return {
    src: toIkPath(path),
    transformation: [
      {
        width,
        height,
        quality,
        format: "webp",
        focus: "auto",
      },
    ],
  };
}

type SerializableTransformation = Partial<
  Pick<Transformation, "width" | "height" | "quality" | "format" | "focus">
> & { progressive?: boolean };

function serializeTransformation(t: SerializableTransformation): string | null {
  const parts: string[] = [];
  if (t.width) parts.push(`w-${t.width}`);
  if (t.height) parts.push(`h-${t.height}`);
  if (t.quality) parts.push(`q-${t.quality}`);
  if (t.format) parts.push(`f-${t.format}`);
  if (t.focus) parts.push(`fo-${t.focus}`);
  if (typeof t.progressive === "boolean") parts.push(`pr-${t.progressive ? "true" : "false"}`);
  if (!parts.length) return null;
  return parts.join(",");
}

export function buildIkUrl(src: string, transformation?: SerializableTransformation[]) {
  const path = toIkPath(src);
  const tr = transformation
    ?.map(serializeTransformation)
    .filter(Boolean)
    .join(":");
  if (tr && tr.length > 0) {
    return `${IK_URL_ENDPOINT}/tr:${tr}${path}`;
  }
  return `${IK_URL_ENDPOINT}${path}`;
}