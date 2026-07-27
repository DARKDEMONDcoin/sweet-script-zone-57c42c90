/** @doc Compiles a Coder-generated React/Vite project into a single self-contained HTML page that actually runs in the browser (Babel Standalone + esm.sh + import maps). This is what powers real "publish" and "preview" for React projects. */

import type { ProjectFile } from "./extractProjectFiles";

const CDN = {
  react: "https://esm.sh/react@18.3.1",
  reactDom: "https://esm.sh/react-dom@18.3.1",
  reactDomClient: "https://esm.sh/react-dom@18.3.1/client",
  jsxRuntime: "https://esm.sh/react@18.3.1/jsx-runtime",
  jsxDevRuntime: "https://esm.sh/react@18.3.1/jsx-dev-runtime",
  router: "https://esm.sh/react-router-dom@6.26.2?deps=react@18.3.1,react-dom@18.3.1",
  lucide: "https://esm.sh/lucide-react@0.462.0?deps=react@18.3.1",
  clsx: "https://esm.sh/clsx@2.1.1",
  tailwindMerge: "https://esm.sh/tailwind-merge@2.5.4",
  cva: "https://esm.sh/class-variance-authority@0.7.1",
  framer: "https://esm.sh/framer-motion@11.11.9?deps=react@18.3.1,react-dom@18.3.1",
  reactHookForm: "https://esm.sh/react-hook-form@7.53.0?deps=react@18.3.1",
  zod: "https://esm.sh/zod@3.23.8",
  hookformResolvers: "https://esm.sh/@hookform/resolvers@3.9.0?deps=react@18.3.1,zod@3.23.8",
  reactQuery: "https://esm.sh/@tanstack/react-query@5.56.2?deps=react@18.3.1",
  sonner: "https://esm.sh/sonner@1.5.0?deps=react@18.3.1,react-dom@18.3.1",
  radixSlot: "https://esm.sh/@radix-ui/react-slot@1.1.0?deps=react@18.3.1,react-dom@18.3.1",
  supabaseJs: "https://esm.sh/@supabase/supabase-js@2.45.4",
  dateFns: "https://esm.sh/date-fns@3.6.0",
  recharts: "https://esm.sh/recharts@2.12.7?deps=react@18.3.1,react-dom@18.3.1",
};

/** Pinned React version → used to build ?deps= for peer-dep-sensitive packages. */
const REACT_PIN = "react@18.3.1,react-dom@18.3.1";

/** Build an esm.sh URL for a bare npm package, adding ?deps= for peer-dep-sensitive ones. */
function esmUrl(pkg: string, version?: string): string {
  const spec = version ? `${pkg}@${version}` : pkg;
  const needsDeps = /^(@radix-ui\/|@tanstack\/|framer-motion|lucide-react|sonner|react-router|react-hook-form|@hookform\/|recharts|react-day-picker|cmdk|vaul|embla-carousel|@floating-ui\/react)/.test(pkg);
  return `https://esm.sh/${spec}${needsDeps ? `?deps=${REACT_PIN}` : ""}`;
}

const IMPORT_MAP: Record<string, string> = {
  react: CDN.react,
  "react/": `${CDN.react}/`,
  "react-dom": CDN.reactDom,
  "react-dom/": `${CDN.reactDom}/`,
  "react-dom/client": CDN.reactDomClient,
  "react/jsx-runtime": CDN.jsxRuntime,
  "react/jsx-dev-runtime": CDN.jsxDevRuntime,
  "react-router-dom": CDN.router,
  "lucide-react": CDN.lucide,
  clsx: CDN.clsx,
  "tailwind-merge": CDN.tailwindMerge,
  "class-variance-authority": CDN.cva,
  "framer-motion": CDN.framer,
  "react-hook-form": CDN.reactHookForm,
  zod: CDN.zod,
  "@hookform/resolvers/zod": `${CDN.hookformResolvers}/zod`,
  "@tanstack/react-query": CDN.reactQuery,
  sonner: CDN.sonner,
  "@radix-ui/react-slot": CDN.radixSlot,
  "@supabase/supabase-js": CDN.supabaseJs,
  "date-fns": CDN.dateFns,
  recharts: CDN.recharts,
};

/** Extend the base import map with anything declared in the project's package.json. */
function importMapFromPackageJson(files: ProjectFile[]): Record<string, string> {
  const pkgFile = files.find((f) => /(^|\/)package\.json$/i.test(f.path));
  if (!pkgFile) return {};
  try {
    const pkg = JSON.parse(pkgFile.content);
    const deps = { ...(pkg.dependencies || {}), ...(pkg.peerDependencies || {}) } as Record<string, string>;
    const extra: Record<string, string> = {};
    for (const [name, ver] of Object.entries(deps)) {
      if (IMPORT_MAP[name]) continue;
      if (/^(vite|@vitejs\/|typescript|eslint|prettier|tailwindcss|postcss|autoprefixer|@types\/)/.test(name)) continue;
      const clean = String(ver || "").replace(/^[\^~>=<\s]+/, "").split(" ")[0] || undefined;
      extra[name] = esmUrl(name, clean);
    }
    return extra;
  } catch {
    return {};
  }
}

const RUNNABLE_EXTS = [".tsx", ".ts", ".jsx", ".js", ".mjs"];

function normalize(path: string): string {
  const parts = path.replace(/^\.?\/+/, "").split("/");
  const out: string[] = [];
  for (const p of parts) {
    if (p === "." || p === "") continue;
    if (p === "..") out.pop();
    else out.push(p);
  }
  return out.join("/");
}

function stripExt(p: string): string {
  return p.replace(/\.(tsx|ts|jsx|js|mjs)$/i, "");
}

/** True if we can execute this file (JS/TS variants). */
function isRunnable(f: ProjectFile): boolean {
  return RUNNABLE_EXTS.some((e) => f.path.toLowerCase().endsWith(e));
}

/** Resolve `spec` (import specifier) from `fromPath` against the file list. */
function resolveSpec(spec: string, fromPath: string, files: Map<string, ProjectFile>): string | null {
  let target: string | null = null;
  if (spec.startsWith("@/")) target = "src/" + spec.slice(2);
  else if (spec.startsWith("./") || spec.startsWith("../")) {
    const dir = fromPath.split("/").slice(0, -1).join("/");
    target = normalize((dir ? dir + "/" : "") + spec);
  } else if (spec.startsWith("/")) target = spec.slice(1);
  else return null; // bare package → resolved via import map

  // Try exact, then with each extension, then /index.<ext>
  const candidates = [target];
  for (const e of RUNNABLE_EXTS) candidates.push(target + e);
  for (const e of RUNNABLE_EXTS) candidates.push(target + "/index" + e);
  candidates.push(target + ".css"); // css imports (we swallow them)
  for (const c of candidates) if (files.has(c)) return c;
  // Also allow the caller to have written the extension in the map key differently
  const withoutExt = stripExt(target);
  for (const e of RUNNABLE_EXTS) if (files.has(withoutExt + e)) return withoutExt + e;
  return null;
}

/** Rewrite import/export specifiers in one file's source. */
function rewriteImports(code: string, fromPath: string, files: Map<string, ProjectFile>): string {
  // Handle: import ... from '...';  export ... from '...';  import('...')
  const re = /((?:^|[\s;{}()])(?:import|export)\s*(?:[^'"`;]*?\bfrom\s*)?|import\s*\()\s*(['"])([^'"]+)\2/g;
  return code.replace(re, (full, head, quote, spec) => {
    if (spec.endsWith(".css") || spec.endsWith(".scss")) {
      // Drop CSS imports — Tailwind is loaded globally.
      return head.trim().startsWith("import(") ? `${head}${quote}data:text/javascript,${quote}` : `/* css: ${spec} */`;
    }
    const resolved = resolveSpec(spec, fromPath, files);
    if (resolved) return `${head}${quote}virtual:${resolved}${quote}`;
    return full; // bare specifier → handled by import map
  });
}

/** Best-effort entry file for a Vite/React project. */
function pickEntry(files: ProjectFile[]): ProjectFile | null {
  const byPath = new Map(files.map((f) => [f.path, f]));
  const preferred = [
    "src/main.tsx",
    "src/main.jsx",
    "src/main.ts",
    "src/index.tsx",
    "src/index.jsx",
    "main.tsx",
    "index.tsx",
    "src/App.tsx",
    "src/App.jsx",
    "App.tsx",
    "App.jsx",
  ];
  for (const p of preferred) if (byPath.has(p)) return byPath.get(p)!;
  return files.find(isRunnable) || null;
}

/** True when the project looks like a bundler-required React/Vite app. */
export function isReactProject(files: ProjectFile[]): boolean {
  return files.some(
    (f) => /\.(tsx|jsx)$/i.test(f.path) || /package\.json$/i.test(f.path),
  );
}

/**
 * Build a fully self-contained runnable HTML for a React/Vite project.
 * Uses Babel Standalone (in-browser TS/JSX transform) + import maps to load
 * npm dependencies from esm.sh — no bundler, no build step needed.
 */
/** Common helper files LLMs import but sometimes forget to emit. We shim them so imports resolve. */
const SHIMS: Record<string, string> = {
  "src/lib/utils.ts":
    `import { clsx, type ClassValue } from "clsx";\nimport { twMerge } from "tailwind-merge";\nexport function cn(...inputs: ClassValue[]) { return twMerge(clsx(inputs)); }\n`,
};

export function buildReactRuntimeHtml(files: ProjectFile[], title = "Megsy Project"): string {
  const runnable = files.filter(isRunnable);
  const map = new Map(runnable.map((f) => [f.path, f]));

  // Inject shims for common helpers only when the project didn't already provide them.
  for (const [path, code] of Object.entries(SHIMS)) {
    const base = stripExt(path);
    const hasIt = runnable.some((f) => stripExt(f.path) === base);
    if (!hasIt) {
      const shim = { path, content: code, lang: "ts" } as ProjectFile;
      runnable.push(shim);
      map.set(path, shim);
    }
  }

  const entry = pickEntry(runnable);

  // Pre-rewrite each file's specifiers so relative imports point to `virtual:<path>`.
  const rewritten: Array<{ path: string; code: string }> = runnable.map((f) => ({
    path: f.path,
    code: rewriteImports(f.content, f.path, map),
  }));

  const extraPkg = importMapFromPackageJson(files);
  const importMapImports: Record<string, string> = { ...IMPORT_MAP, ...extraPkg };
  const filesPayload = JSON.stringify(rewritten);
  const entryPath = entry?.path || "src/main.tsx";

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>${title.replace(/[<>&"]/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", '"': "&quot;" }[c]!))}</title>
<script src="https://cdn.tailwindcss.com"></script>
<script src="https://unpkg.com/es-module-shims@1.10.0/dist/es-module-shims.js"></script>
<script src="https://unpkg.com/@babel/standalone@7.25.6/babel.min.js"></script>
<script type="importmap">
${JSON.stringify({ imports: importMapImports }, null, 2)}
</script>
<style>
  html,body,#root{margin:0;padding:0;min-height:100vh;background:#0a0a0a;color:#f5f5f5;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",system-ui,sans-serif}
  #__megsy_err{position:fixed;inset:0;padding:0;background:rgba(10,10,10,.96);z-index:9999;display:none;flex-direction:column}
  #__megsy_err header{display:flex;align-items:center;justify-content:space-between;padding:14px 20px;border-bottom:1px solid rgba(255,255,255,.08)}
  #__megsy_err h3{margin:0;font:600 14px -apple-system,system-ui,sans-serif;color:#fca5a5}
  #__megsy_err button{appearance:none;border:1px solid rgba(255,255,255,.14);background:#111;color:#fff;padding:6px 12px;border-radius:8px;font:600 12px system-ui;cursor:pointer}
  #__megsy_err pre{margin:0;padding:20px;color:#fca5a5;font-family:ui-monospace,Menlo,monospace;font-size:12.5px;line-height:1.55;white-space:pre-wrap;overflow:auto;flex:1}
  #__megsy_boot{position:fixed;inset:0;display:flex;align-items:center;justify-content:center;color:#a3a3a3;font-size:13px;z-index:9998}
</style>
</head>
<body>
<div id="root"></div>
<div id="__megsy_boot">Starting project…</div>
<div id="__megsy_err"><header><h3>Runtime error</h3><button onclick="location.reload()">Reload</button></header><pre id="__megsy_err_body"></pre></div>
<script>
window.__megsyShowError = function(msg){
  var el = document.getElementById('__megsy_err');
  el.style.display='flex';
  document.getElementById('__megsy_err_body').textContent = String(msg);
  var b = document.getElementById('__megsy_boot'); if(b) b.remove();
  try { parent.postMessage({ type: 'megsy:runtime-error', message: String(msg) }, '*'); } catch(_) {}
};
window.addEventListener('error', function(e){ window.__megsyShowError(e.message + '\\n' + (e.error && e.error.stack || '')); });
window.addEventListener('unhandledrejection', function(e){ window.__megsyShowError('Unhandled: ' + (e.reason && (e.reason.stack||e.reason.message||e.reason) || e.reason)); });
// Forward console.error/warn to parent so the chat can surface them for "Fix with AI".
['error','warn'].forEach(function(level){
  var orig = console[level];
  console[level] = function(){
    try {
      var args = Array.prototype.slice.call(arguments).map(function(a){
        if (a instanceof Error) return a.stack || a.message;
        if (typeof a === 'object') { try { return JSON.stringify(a); } catch(_) { return String(a); } }
        return String(a);
      });
      parent.postMessage({ type: 'megsy:runtime-console', level: level, message: args.join(' ') }, '*');
    } catch(_) {}
    return orig.apply(console, arguments);
  };
});
try { parent.postMessage({ type: 'megsy:runtime-ready' }, '*'); } catch(_) {}
</script>
<script>
(function(){
  var FILES = ${filesPayload};
  var ENTRY = ${JSON.stringify(entryPath)};
  var extraImports = {};

  function transform(path, code){
    try{
      var out = Babel.transform(code, {
        filename: path,
        presets: [
          ['env', { modules: false, targets: { esmodules: true } }],
          'react',
          'typescript'
        ],
        sourceMaps: 'inline'
      }).code;
      return out;
    }catch(e){
      throw new Error('Babel failed for ' + path + ': ' + e.message);
    }
  }

  FILES.forEach(function(f){
    var js = transform(f.path, f.code);
    var blob = new Blob([js], { type: 'application/javascript' });
    extraImports['virtual:' + f.path] = URL.createObjectURL(blob);
  });

  // Inject extra imports into the shim import map.
  var mapScript = document.createElement('script');
  mapScript.type = 'importmap-shim';
  mapScript.textContent = JSON.stringify({ imports: Object.assign({}, ${JSON.stringify(importMapImports)}, extraImports) });
  document.head.appendChild(mapScript);

  // Kick off the entry.
  var loader = document.createElement('script');
  loader.type = 'module-shim';
  loader.textContent = 'import("virtual:' + ENTRY + '").then(function(){var b=document.getElementById("__megsy_boot"); if(b) b.remove();}).catch(function(e){ window.__megsyShowError((e && (e.stack||e.message)) || String(e)); });';
  document.body.appendChild(loader);
})();
</script>
</body>
</html>`;
}
