export type ConnectionNotice = {
  tone: "success" | "warning" | "error";
  message: string;
};

export function getInitialTikTokResult() {
  if (typeof window === "undefined") {
    return null;
  }

  return new URLSearchParams(window.location.search).get("tiktok");
}

export function getTikTokConnectionNotice(result: string): ConnectionNotice {
  if (result === "connected") {
    return {
      tone: "success",
      message: "TikTok connected successfully.",
    };
  }

  if (result === "invalid-state") {
    return {
      tone: "warning",
      message: "TikTok sent the app back, but the login session expired. Try connecting again.",
    };
  }

  if (result === "denied") {
    return {
      tone: "warning",
      message: "TikTok connection was canceled before approval.",
    };
  }

  return {
    tone: "error",
    message: "TikTok login finished, but the app could not save the connection.",
  };
}
