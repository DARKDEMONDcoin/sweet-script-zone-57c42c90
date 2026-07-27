/** @doc Screenshot → Code — turns a design mockup into a Coder prompt with the image embedded as a data URL. */
import { compressImageToDataUrl } from "@/lib/compressImage";

/**
 * Build a Coder prompt that embeds a screenshot as a data URL. The kimi-coder
 * edge function relays the prompt to a vision-capable model, which reads the
 * image and generates matching React + Tailwind code.
 */
export async function buildScreenshotToCodePrompt(file: File, extra?: string): Promise<string> {
  if (!file.type.startsWith("image/")) {
    throw new Error("Please upload an image (PNG, JPG, WEBP).");
  }
  const { dataUrl } = await compressImageToDataUrl(file);
  const instruction = [
    "Rebuild this UI design as a production-quality React + TypeScript + Tailwind CSS app.",
    "Match the layout, spacing, typography, colors and hierarchy exactly.",
    "Use semantic HTML, responsive design (mobile-first), and accessible controls.",
    "If interactive elements are shown, add reasonable local state.",
    extra?.trim() ? `Additional guidance: ${extra.trim()}` : "",
    "",
    "Design reference:",
    `![design](${dataUrl})`,
  ].filter(Boolean).join("\n");
  return instruction;
}
