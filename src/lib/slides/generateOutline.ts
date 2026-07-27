import { streamChat } from "@/lib/streamChat";
import { parseSlidesOutline, type SlidesOutline } from "@/lib/slidesOutlineParser";

/**
 * Asks the chat model for a structured slide-by-slide plan before generation.
 * Returns both the raw text (shown as the assistant message) and the parsed
 * outline used by SlidesOutlineCard. Never throws — returns null on failure.
 */
export async function generateSlidesOutline(params: {
  topic: string;
  slideCount?: number;
  language?: "ar" | "en";
  userId?: string;
  signal?: AbortSignal;
}): Promise<{ text: string; outline: SlidesOutline } | null> {
  const count = params.slideCount ?? 8;
  const ar = params.language === "ar";

  const prompt = ar
    ? `اعمل مخطط عرض تقديمي عن: "${params.topic}".
اكتب ${count} سلايد بالتنسيق التالي بالحرف، بدون أي مقدمات أو خواتيم:

Slide 1: عنوان السلايد
- نقطة قصيرة
- نقطة قصيرة
- نقطة قصيرة

Slide 2: عنوان السلايد
- نقطة قصيرة
...

قواعد: كل سلايد له عنوان واضح و2-4 نقاط قصيرة (كل نقطة أقل من 12 كلمة). لا تكتب أي شرح خارج القائمة.`
    : `Create a presentation outline about: "${params.topic}".
Write ${count} slides in exactly this format, with no intro or closing text:

Slide 1: Slide title
- short bullet
- short bullet
- short bullet

Slide 2: Slide title
- short bullet
...

Rules: each slide has a clear title and 2-4 short bullets (max 12 words each). Output nothing except the list.`;

  let text = "";
  try {
    await new Promise<void>((resolve, reject) => {
      void streamChat({
        messages: [{ role: "user", content: prompt }],
        chatMode: "chat",
        user_id: params.userId,
        signal: params.signal,
        onDelta: (d) => {
          text += d;
        },
        onDone: () => resolve(),
        onError: (e) => reject(new Error(e)),
      }).catch(reject);
    });
  } catch {
    return null;
  }

  const trimmed = text.trim();
  if (!trimmed) return null;
  const outline = parseSlidesOutline(trimmed);
  if (!outline.steps.length) return null;
  return { text: trimmed, outline };
}
