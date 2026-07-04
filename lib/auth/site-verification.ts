import { NextResponse } from "next/server";

export function getTikTokVerificationFile(filename: string) {
  const expectedFilename = process.env.TIKTOK_VERIFICATION_FILENAME;
  const content = process.env.TIKTOK_VERIFICATION_CONTENT;

  if (!expectedFilename || !content || filename !== expectedFilename) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return new NextResponse(content, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}
