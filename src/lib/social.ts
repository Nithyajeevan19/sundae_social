export const INSTAGRAM_URL = "https://www.instagram.com/sundaesocial.in?igsh=eHJ4ejZ1aWJ1cjFz";
export const INSTAGRAM_HANDLE = "@sundaesocial.in";
export const GOOGLE_REVIEW_URL = "https://g.page/r/sundaesocial/review";

import { toPng } from "html-to-image";

export async function shareStory(node: HTMLElement, caption: string) {
  try {
    const dataUrl = await toPng(node, {
      pixelRatio: 3,
      cacheBust: true,
    });
    const blob = await (await fetch(dataUrl)).blob();
    const file = new File([blob], "sundae-social-story.png", {
      type: "image/png",
    });

    const nav = navigator as Navigator & {
      canShare?: (data: ShareData) => boolean;
    };

    if (nav.canShare?.({ files: [file] })) {
      await nav.share({
        files: [file],
        title: "Sundae Social",
        text: caption,
      });
      return "shared";
    }

    // Fallback: download image and open Instagram so user can post manually
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = "sundae-social-story.png";
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.open(INSTAGRAM_URL, "_blank");
    return "downloaded";
  } catch (err) {
    console.error("Story share failed", err);
    window.open(INSTAGRAM_URL, "_blank");
    return "error";
  }
}
