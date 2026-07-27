import { MessagePrimitive } from "@assistant-ui/react";
import { MarkdownText } from "./MarkdownText";
import { ToolFallback } from "./ToolFallback";

/**
 * Renderer مبني على MessagePrimitive.Parts من assistant-ui. يعرض:
 *  - النصوص عبر MarkdownText (smooth streaming + KaTeX + code copy)
 *  - أجزاء tool-call عبر UIs المسجّلة (WebSearch, ImageGen, …) أو
 *    ToolFallback لأي أداة غير معرّفة.
 *
 * غير مُلحق تلقائيًا بـ ChatMessage حتى لا يتغيّر التصميم الحالي. يمكن
 * استعماله في أي شاشة جديدة (مثال: composer preview أو thread runtime
 * كامل) بمجرد استيراده ولفّه داخل <MessagePrimitive.Root>.
 */
export function MessagePartsRenderer() {
  return (
    <MessagePrimitive.Parts
      components={{
        Text: MarkdownText,
        tools: { Fallback: ToolFallback },
      }}
    />
  );
}

export default MessagePartsRenderer;
