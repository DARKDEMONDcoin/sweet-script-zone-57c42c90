/** @doc Apply search/replace patch blocks so Coder can edit large files without rewriting them entirely. */
import type { ProjectFile } from "@/lib/extractProjectFiles";

export interface PatchBlock {
  path: string;
  search: string;
  replace: string;
}

/**
 * Parses fenced blocks of the form:
 *
 * ```patch src/App.tsx
 * <<<<<<< SEARCH
 * old text
 * =======
 * new text
 * >>>>>>> REPLACE
 * ```
 *
 * Multiple SEARCH/REPLACE pairs inside one block are supported.
 */
export function extractPatchBlocks(content: string): PatchBlock[] {
  if (!content) return [];
  const fence = /```(?:patch|diff)[ \t]+([\w./-]+)[ \t]*\n([\s\S]*?)```/g;
  const out: PatchBlock[] = [];
  let m: RegExpExecArray | null;
  while ((m = fence.exec(content)) !== null) {
    const path = m[1].trim();
    const body = m[2];
    const pair = /<{5,}\s*SEARCH\s*\n([\s\S]*?)\n={5,}\s*\n([\s\S]*?)\n>{5,}\s*REPLACE/g;
    let p: RegExpExecArray | null;
    while ((p = pair.exec(body)) !== null) {
      out.push({ path, search: p[1], replace: p[2] });
    }
  }
  return out;
}

export interface ApplyResult {
  files: ProjectFile[];
  applied: number;
  failed: PatchBlock[];
}

export function applyPatchBlocks(files: ProjectFile[], patches: PatchBlock[]): ApplyResult {
  if (patches.length === 0) return { files, applied: 0, failed: [] };
  const map = new Map(files.map((f) => [f.path, { ...f }]));
  const failed: PatchBlock[] = [];
  let applied = 0;
  for (const patch of patches) {
    const file = map.get(patch.path);
    if (!file) { failed.push(patch); continue; }
    const idx = file.content.indexOf(patch.search);
    if (idx === -1) { failed.push(patch); continue; }
    // Use manual splice to avoid String.replace's $-backreference interpretation
    // (which would mangle any replacement containing $1, $&, $$, etc.).
    file.content = file.content.slice(0, idx) + patch.replace + file.content.slice(idx + patch.search.length);
    applied += 1;
  }
  return { files: Array.from(map.values()), applied, failed };
}
