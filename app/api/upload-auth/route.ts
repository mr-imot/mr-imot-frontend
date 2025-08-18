import { getUploadAuthParams } from "@imagekit/next/server";

export async function GET() {
  const privateKey = process.env.IMAGEKIT_PRIVATE_KEY as string;
  const publicKey = process.env.IMAGEKIT_PUBLIC_KEY as string;

  if (!privateKey || !publicKey) {
    return new Response(
      JSON.stringify({ message: "ImageKit keys are not configured" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }

  const { token, expire, signature } = getUploadAuthParams({
    privateKey,
    publicKey,
  });

  return Response.json({ token, expire, signature, publicKey });
}


