/** @doc Screenshot → Code button — pick a design image, convert it into a Coder prompt, and route it through the composer bridge. */
import { useRef, useState } from "react";
import { Image as ImageIcon, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { buildScreenshotToCodePrompt } from "@/lib/coderVision";
import { cn } from "@/lib/utils";

interface Props {
  className?: string;
  label?: string;
  /** Optional extra text prepended so Coder knows what to build. */
  extraContext?: string;
}

export default function ScreenshotToCoderButton({ className, label = "Screenshot → Code", extraContext }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  const handlePick = () => inputRef.current?.click();

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = ""; // allow same file again
    if (!file) return;
    setBusy(true);
    try {
      const prompt = await buildScreenshotToCodePrompt(file, extraContext);
      window.dispatchEvent(new CustomEvent("megsy:prefill-composer", { detail: { text: prompt, autoSend: false } }));
      toast.success("Design ready — press send to generate code");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not read image");
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={handlePick}
        disabled={busy}
        className={cn(
          "inline-flex items-center gap-1.5 h-8 px-3 rounded-full text-[12px] font-medium border border-white/15 bg-white/5 hover:bg-white/10 text-white/80 transition disabled:opacity-50",
          className,
        )}
      >
        {busy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ImageIcon className="w-3.5 h-3.5" />}
        {label}
      </button>
      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
    </>
  );
}
