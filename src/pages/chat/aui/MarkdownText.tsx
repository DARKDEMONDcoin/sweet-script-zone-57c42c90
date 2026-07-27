// markdown.css was removed from @assistant-ui/react-markdown@0.14+; styles live in app CSS.
import { MarkdownTextPrimitive, useIsMarkdownCodeBlock } from "@assistant-ui/react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import { makePrismAsyncLightSyntaxHighlighter } from "@assistant-ui/react-syntax-highlighter";
import { PrismAsyncLight as PrismAsync } from "react-syntax-highlighter";
import { coldarkDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { Check, Copy } from "lucide-react";
import { memo, useState } from "react";

/**
 * assistant-ui smooth-streaming markdown component.
 *
 * يستعمل MarkdownTextPrimitive من @assistant-ui/react-markdown — يعمل
 * smooth token-by-token rendering أثناء التدفق (بدل الـ flicker مع
 * react-markdown العادي). يمرر نفس الـ remark/rehype plugins المستعملة
 * في ChatMessage (GFM, breaks, math, KaTeX).
 *
 * جاهز كأداة قابلة للاستعمال مع MessagePrimitive.Parts (MarkdownText
 * كـ Text component). لا يتم فرضه على ChatMessage الحالي حتى لا يتغير
 * التصميم.
 */

const SyntaxHighlighter = makePrismAsyncLightSyntaxHighlighter({
  Prism: PrismAsync,
  style: coldarkDark,
  customStyle: { margin: 0, borderTopLeftRadius: 0, borderTopRightRadius: 0 },
});

function CodeHeader({ language, code }: { language?: string; code?: string }) {
  const [copied, setCopied] = useState(false);
  const onCopy = async () => {
    if (!code) return;
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* noop */
    }
  };
  return (
    <div className="flex items-center justify-between rounded-t-lg bg-zinc-900 px-3 py-1 text-xs font-mono text-zinc-300">
      <span className="lowercase">{language ?? "text"}</span>
      <button
        type="button"
        onClick={onCopy}
        className="inline-flex items-center gap-1 opacity-70 hover:opacity-100 transition"
        aria-label="copy code"
      >
        {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
        {copied ? "copied" : "copy"}
      </button>
    </div>
  );
}

const PreComponent = ({
  children,
  ...rest
}: React.HTMLAttributes<HTMLPreElement>) => {
  const isCodeBlock = useIsMarkdownCodeBlock();
  if (!isCodeBlock) return <pre {...rest}>{children}</pre>;
  return <>{children}</>;
};

export const MarkdownText = memo(function MarkdownText() {
  return (
    <MarkdownTextPrimitive
      remarkPlugins={[remarkGfm, remarkBreaks, remarkMath]}
      rehypePlugins={[rehypeKatex]}
      components={{
        SyntaxHighlighter,
        CodeHeader,
        pre: PreComponent,
      }}
      className="aui-md"
    />
  );
});

export default MarkdownText;
