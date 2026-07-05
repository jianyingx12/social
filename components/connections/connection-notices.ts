export type ConnectionNotice = {
  tone: "success" | "warning" | "error";
  message: string;
};

export function getInitialTikTokResult() {
  if (typeof window === "undefined") {
    return null;
  }

  const searchParams = new URLSearchParams(window.location.search);
  const status = searchParams.get("tiktok");

  if (!status) {
    return null;
  }

  return {
    status,
    reason: searchParams.get("reason"),
  };
}

export function getTikTokConnectionNotice(result: {
  status: string;
  reason: string | null;
}): ConnectionNotice {
  if (result.status === "connected") {
    return {
      tone: "success",
      message: "TikTok connected successfully.",
    };
  }

  if (result.status === "invalid-state") {
    return {
      tone: "warning",
      message: "TikTok sent the app back, but the login session expired. Try connecting again.",
    };
  }

  if (result.status === "denied") {
    return {
      tone: "warning",
      message: "TikTok connection was canceled before approval.",
    };
  }

  if (result.reason === "token-exchange") {
    return {
      tone: "error",
      message:
        "TikTok approved the login, but the app could not exchange the code for a token. Check the Vercel logs for the TikTok error code.",
    };
  }

  if (result.reason === "user-info") {
    return {
      tone: "error",
      message:
        "TikTok issued a token, but the app could not read the TikTok profile. Check the Login Kit scopes and Vercel logs.",
    };
  }

  return {
    tone: "error",
    message: "TikTok login finished, but the app could not save the connection.",
  };
}
