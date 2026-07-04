import { NextResponse } from "next/server";

const tiktokVerificationFilenamePattern = /^tiktok([A-Za-z0-9]+)\.txt$/;

export function getTikTokVerificationFile(filename: string) {
  const expectedFilename = process.env.TIKTOK_VERIFICATION_FILENAME;
  const content = process.env.TIKTOK_VERIFICATION_CONTENT;

  if (expectedFilename && content && filename === expectedFilename) {
    return createTextResponse(content);
  }

  const tiktokVerificationMatch = filename.match(tiktokVerificationFilenamePattern);

  if (tiktokVerificationMatch) {
    return createTextResponse(
      `tiktok-developers-site-verification=${tiktokVerificationMatch[1]}`,
    );
  }

  return NextResponse.json({ error: "Not found" }, { status: 404 });
}

function createTextResponse(content: string) {
  return new NextResponse(content, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}
