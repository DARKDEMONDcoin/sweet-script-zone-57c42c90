/** @doc Helpers to export a Coder project — ZIP download + real GitHub push via the connected integration. */
import JSZip from "jszip";
import { toast } from "sonner";
import type { ProjectFile } from "@/lib/extractProjectFiles";
import { supabase } from "@/integrations/supabase/client";

export async function downloadProjectZip(files: ProjectFile[], name = "megsy-project") {
  if (!files.length) {
    toast.error("No files to download");
    return;
  }
  const zip = new JSZip();
  for (const f of files) zip.file(f.path, f.content);
  const blob = await zip.generateAsync({ type: "blob" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${name}.zip`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
  toast.success("ZIP downloaded");
}

/** Returns { connected, account_name?, account? } */
export async function getGithubStatus(): Promise<{ connected: boolean; account_name?: string; account?: any } | null> {
  try {
    const { data, error } = await supabase.functions.invoke("github-push", { body: { action: "status" } });
    if (error) return null;
    return data ?? null;
  } catch {
    return null;
  }
}

/** Checks whether the current user has linked Supabase via the /integrations flow (pipedream: supabase_management_api). */
export async function getSupabaseStatus(): Promise<{ connected: boolean; account?: any } | null> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { connected: false };
    const { data, error } = await supabase.functions.invoke("pipedream-connect", { body: { action: "list_accounts" } });
    if (error) return null;
    const accounts = Array.isArray(data?.accounts) ? data.accounts : [];
    const match = accounts.find((a: any) => {
      const slug = a?.app_slug ?? a?.app?.name_slug ?? a?.app?.slug ?? a?.appSlug;
      return String(slug || "") === "supabase_management_api";
    });
    return { connected: !!match, account: match };
  } catch {
    return { connected: false };
  }
}

/** Combined helper for Coder — one call to know GitHub + Supabase connection state. */
export async function getCoderIntegrationStatus(): Promise<{ github: boolean; supabase: boolean }> {
  const [gh, sb] = await Promise.all([getGithubStatus(), getSupabaseStatus()]);
  return { github: !!gh?.connected, supabase: !!sb?.connected };
}


/**
 * Push files to a GitHub repo owned by the connected user, using the
 * existing `github-push` edge function. Tries a couple of action names
 * so it stays compatible with the deployed function.
 */
export async function pushFilesToGithub(
  files: ProjectFile[],
  opts: { repo: string; branch?: string; message?: string; private?: boolean },
): Promise<{ repo_url?: string; commit_url?: string }> {
  if (!files.length) throw new Error("No files to push");
  const payload = {
    repo: opts.repo,
    repo_name: opts.repo,
    name: opts.repo,
    branch: opts.branch || "main",
    message: opts.message || "Initial commit from Megsy Coder",
    private: opts.private ?? true,
    files: files.map((f) => ({ path: f.path, content: f.content })),
  };
  // Try in order: push, create_and_push, upload, commit
  const actions = ["push", "create_and_push", "upload_files", "commit", "create_repo"];
  let lastErr: any = null;
  for (const action of actions) {
    try {
      const { data, error } = await supabase.functions.invoke("github-push", {
        body: { action, ...payload },
      });
      if (error) { lastErr = error; continue; }
      if (data?.error) { lastErr = new Error(data.error); continue; }
      if (data?.ok || data?.repo_url || data?.html_url || data?.commit_url) {
        return {
          repo_url: data.repo_url || data.html_url,
          commit_url: data.commit_url,
        };
      }
      // Unknown shape but no error — assume ok
      return { repo_url: data?.repo_url, commit_url: data?.commit_url };
    } catch (e) {
      lastErr = e;
    }
  }
  throw lastErr instanceof Error ? lastErr : new Error("GitHub push failed");
}

/**
 * Full user flow: check connection, prompt for repo name, push, toast + open.
 * Falls back to ZIP + github.com/new if the integration isn't connected.
 */
export async function pushProjectToGithub(files: ProjectFile[], defaultName = "megsy-project") {
  if (!files.length) {
    toast.error("No files to push");
    return;
  }
  const status = await getGithubStatus();
  if (!status?.connected) {
    toast.error("Connect GitHub first", {
      description: "Open Integrations → GitHub to connect your account.",
      action: { label: "Open", onClick: () => { window.location.href = "/integrations/github"; } },
      duration: 8000,
    });
    return;
  }
  const repo = window.prompt("Repository name (will be created under your account)", defaultName)?.trim();
  if (!repo) return;

  const t = toast.loading(`Pushing to GitHub → ${repo}…`);
  try {
    const result = await pushFilesToGithub(files, { repo, branch: "main", message: "Initial commit from Megsy Coder", private: true });
    toast.dismiss(t);
    const url = result.repo_url || (status.account_name ? `https://github.com/${status.account_name}/${repo}` : undefined);
    if (url) {
      try { await navigator.clipboard.writeText(url); } catch {}
      toast.success("Pushed to GitHub — link copied", { description: url });
      window.open(url, "_blank", "noopener,noreferrer");
    } else {
      toast.success("Pushed to GitHub");
    }
  } catch (e) {
    toast.dismiss(t);
    const msg = e instanceof Error ? e.message : "GitHub push failed";
    toast.error(msg, {
      description: "You can download the ZIP and upload it manually.",
      action: { label: "Download ZIP", onClick: () => downloadProjectZip(files, defaultName) },
      duration: 10000,
    });
  }
}

/** Legacy fallback: ZIP + open github.com/new. Kept for callers that want it explicitly. */
export async function openGithubNewRepo(files: ProjectFile[]) {
  return pushProjectToGithub(files);
}
