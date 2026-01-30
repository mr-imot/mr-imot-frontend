import type { Transformation } from "@imagekit/next";

export const IK_URL_ENDPOINT = "https://ik.imagekit.io/ts59gf2ul";

/**
 * Extract the ImageKit file path from a full URL or path.
 * Strips the ImageKit id segment (ts59gf2ul) and any existing tr:... segment
 * so buildIkUrl can add fresh transformations. Returns path with no leading slash.
 * Example: https://ik.imagekit.io/ts59gf2ul/uploads/projects/foo.jpg → uploads/projects/foo.jpg
 */
export function toIkPath(input: string | null | undefined): string {
  if (!input) return "";
  const trimmed = input.trim();

  // Helper: normalize a path (no query, no leading slash)
  const normalizePath = (p: string) => p.split("?")[0].replace(/^\/+/, "");

  // URL case
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    try {
      const u = new URL(trimmed);
      const segments = u.pathname.split("/").filter(Boolean);

      // If it's ImageKit, URL path is: /<imagekitId>/<optional tr:...>/<file path...>
      if (u.hostname === "ik.imagekit.io") {
        // Remove imagekitId if present
        if (segments.length && segments[0] === "ts59gf2ul") segments.shift();

        // Remove existing transformation segment if present
        if (segments.length && segments[0].startsWith("tr:")) segments.shift();
      }

      return normalizePath(segments.join("/"));
    } catch {
      return normalizePath(trimmed);
    }
  }

  // Non-URL path case
  const pathOnly = normalizePath(trimmed);

  // If someone passed a path that starts with tr:..., strip it
  const segs = pathOnly.split("/").filter(Boolean);
  if (segs.length && segs[0].startsWith("tr:")) segs.shift();

  // If someone passed ts59gf2ul/... as a path, strip it too
  if (segs.length && segs[0] === "ts59gf2ul") segs.shift();

  return segs.join("/");
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
  const slashPath = path ? `/${path}` : "";
  const tr = transformation
    ?.map(serializeTransformation)
    .filter(Boolean)
    .join(":");
  if (tr && tr.length > 0) {
    return `${IK_URL_ENDPOINT}/tr:${tr}${slashPath}`;
  }
  return `${IK_URL_ENDPOINT}${slashPath}`;
}