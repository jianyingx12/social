import { NextRequest } from "next/server";
import { getTikTokVerificationFile } from "@/lib/auth/site-verification";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ filename: string }> },
) {
  const { filename } = await params;

  return getTikTokVerificationFile(filename);
}
