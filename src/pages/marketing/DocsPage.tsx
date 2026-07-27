/** @doc Comprehensive, auto-updating Megsy AI documentation — clean black iOS-style reference. */
import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { PrefetchLink as Link } from "@/components/common/PrefetchLink";
import { ArrowLeft, Search, ChevronRight, Copy, Check, Link as LinkIcon } from "lucide-react";
import {
  DOC_PAGES,
  DOC_EDGE_FUNCTIONS,
  DOC_REGISTRY_STATS,
  type DocEntry,
} from "@/lib/docsRegistry";
import { CHANGELOG } from "@/data/changelog";

// ── Group metadata (title + one-line intent) ─────────────────────────────
const GROUP_META: Record<string, { title: string; blurb: string }> = {
  root: { title: "Core", blurb: "The main app surfaces users touch every day." },
  chat: { title: "Chat", blurb: "Conversations, threads, composer and streaming." },
  auth: { title: "Auth", blurb: "Sign in, sign up, invites, MFA and callbacks." },
  settings: { title: "Settings", blurb: "Every preference, capability and account switch." },
  billing: { title: "Billing", blurb: "Plans, top-ups, invoices, referrals and payouts." },
  library: { title: "Library", blurb: "Everything you've ever made, searchable." },
  workspace: { title: "Workspaces", blurb: "Team spaces, members and shared context." },
  integrations: { title: "Integrations", blurb: "Connectors that bring outside tools in." },
  agent: { title: "Agents", blurb: "Autonomous operators, traces and approvals." },
  apps: { title: "Apps", blurb: "First-party mini apps built on top of Megsy." },
  marketing: { title: "Marketing", blurb: "Landing surfaces, policies and public pages." },
  seo: { title: "Discover", blurb: "Auto-generated hubs, comparisons and model pages." },
  referral: { title: "Referrals", blurb: "Invite links, tiers and reward flows." },
  landings: { title: "Landings", blurb: "Bespoke service and campaign landings." },
  "landing-gallery": { title: "Gallery", blurb: "Curated gallery of landing templates." },
  misc: { title: "Misc", blurb: "Everything else." },
  edge: { title: "Edge functions", blurb: "Server-side workers that power the product." },
};

interface Group {
  id: string;
  title: string;
  blurb: string;
  entries: DocEntry[];
}

function buildGroups(): Group[] {
  const byGroup = new Map<string, DocEntry[]>();
  for (const p of DOC_PAGES) {
    const arr = byGroup.get(p.group) ?? [];
    arr.push(p);
    byGroup.set(p.group, arr);
  }
  byGroup.set("edge", DOC_EDGE_FUNCTIONS);
  const groups: Group[] = [];
  for (const [id, entries] of byGroup) {
    const meta = GROUP_META[id] ?? { title: id, blurb: "" };
    groups.push({
      id,
      title: meta.title,
      blurb: meta.blurb,
      entries: entries.sort((a, b) => a.title.localeCompare(b.title)),
    });
  }
  // Preferred ordering.
  const order = [
    "root",
    "chat",
    "auth",
    "settings",
    "billing",
    "library",
    "workspace",
    "integrations",
    "agent",
    "apps",
    "marketing",
    "seo",
    "referral",
    "landings",
    "landing-gallery",
    "edge",
    "misc",
  ];
  return groups.sort(
    (a, b) => (order.indexOf(a.id) + 1000 * (order.indexOf(a.id) < 0 ? 1 : 0)) -
      (order.indexOf(b.id) + 1000 * (order.indexOf(b.id) < 0 ? 1 : 0)),
  );
}

function relativeDate(iso: string): string {
  const then = new Date(iso).getTime();
  const days = Math.round((Date.now() - then) / 86_400_000);
  if (days <= 0) return "today";
  if (days === 1) return "yesterday";
  if (days < 30) return `${days}d ago`;
  if (days < 365) return `${Math.round(days / 30)}mo ago`;
  return `${Math.round(days / 365)}y ago`;
}

export default function DocsPage() {
  const { groupId, sectionId } = useParams();
  const navigate = useNavigate();
  const groups = useMemo(buildGroups, []);
  const [query, setQuery] = useState("");
  const [copied, setCopied] = useState<string | null>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  // Keyboard: ⌘K / Ctrl+K focuses the search input.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        searchRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Scroll a deep-linked section into view.
  useEffect(() => {
    if (!groupId) return;
    const id = sectionId ? `entry-${groupId}-${sectionId}` : `group-${groupId}`;
    const el = document.getElementById(id);
    if (el) {
      requestAnimationFrame(() => el.scrollIntoView({ behavior: "smooth", block: "start" }));
    }
  }, [groupId, sectionId]);

  const q = query.trim().toLowerCase();
  const filtered = useMemo(() => {
    if (!q) return groups;
    return groups
      .map((g) => ({
        ...g,
        entries: g.entries.filter(
          (e) =>
            e.title.toLowerCase().includes(q) ||
            e.description.toLowerCase().includes(q) ||
            e.id.toLowerCase().includes(q),
        ),
      }))
      .filter((g) => g.entries.length > 0);
  }, [groups, q]);

  const totalEntries = DOC_REGISTRY_STATS.pageCount + DOC_REGISTRY_STATS.edgeFunctionCount;

  const copyLink = async (hash: string) => {
    const url = `${window.location.origin}${window.location.pathname}#${hash}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(hash);
      window.setTimeout(() => setCopied((c) => (c === hash ? null : c)), 1200);
    } catch {
      /* ignore */
    }
  };

  return (
    <div className="docs-root">
      <style>{css}</style>

      {/* Top bar */}
      <div className="docs-topbar">
        <button
          type="button"
          aria-label="Back"
          className="docs-back"
          onClick={() => (window.history.length > 1 ? navigate(-1) : navigate("/"))}
        >
          <ArrowLeft size={20} />
        </button>
        <div className="docs-topbar-title">Docs</div>
        <div className="docs-topbar-spacer" />
      </div>

      <main className="docs-main">
        {/* Hero */}
        <header className="docs-hero">
          <div className="docs-eyebrow">Reference · v4.12</div>
          <h1 className="docs-title">Everything Megsy can do,<br />in one place.</h1>
          <p className="docs-subtitle">
            A living index of every page, setting and server function in the product.
            Auto-generated from the source — always current.
          </p>

          <div className="docs-search-wrap">
            <Search size={16} className="docs-search-icon" aria-hidden />
            <input
              ref={searchRef}
              type="search"
              className="docs-search"
              placeholder="Search the docs…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label="Search documentation"
            />
            <kbd className="docs-kbd">⌘K</kbd>
          </div>

          <div className="docs-stats">
            <div className="docs-stat">
              <div className="docs-stat-num">{DOC_REGISTRY_STATS.pageCount}</div>
              <div className="docs-stat-label">Pages</div>
            </div>
            <div className="docs-stat">
              <div className="docs-stat-num">{DOC_REGISTRY_STATS.edgeFunctionCount}</div>
              <div className="docs-stat-label">Functions</div>
            </div>
            <div className="docs-stat">
              <div className="docs-stat-num">{totalEntries}</div>
              <div className="docs-stat-label">Total</div>
            </div>
          </div>
        </header>

        {/* Groups */}
        <section className="docs-groups">
          {filtered.length === 0 ? (
            <div className="docs-empty">No matches for “{query}”.</div>
          ) : (
            filtered.map((g) => (
              <section key={g.id} id={`group-${g.id}`} className="docs-group">
                <div className="docs-group-head">
                  <div className="docs-group-heading">
                    <h2 className="docs-group-title">{g.title}</h2>
                    <button
                      type="button"
                      className="docs-anchor"
                      aria-label={`Copy link to ${g.title}`}
                      onClick={() => copyLink(`group-${g.id}`)}
                    >
                      {copied === `group-${g.id}` ? <Check size={14} /> : <LinkIcon size={14} />}
                    </button>
                  </div>
                  {g.blurb && <p className="docs-group-blurb">{g.blurb}</p>}
                </div>

                <ul className="docs-list">
                  {g.entries.map((e) => {
                    const sec = e.id.split("/").pop() ?? e.id;
                    const hash = `entry-${g.id}-${sec}`;
                    return (
                      <li key={e.filePath} id={hash} className="docs-item">
                        <div className="docs-item-body">
                          <div className="docs-item-title">{e.title}</div>
                          <div className="docs-item-desc">{e.description}</div>
                          <div className="docs-item-path">{e.filePath}</div>
                        </div>
                        <button
                          type="button"
                          className="docs-anchor docs-anchor-item"
                          aria-label={`Copy link to ${e.title}`}
                          onClick={() => copyLink(hash)}
                        >
                          {copied === hash ? <Check size={14} /> : <LinkIcon size={14} />}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </section>
            ))
          )}
        </section>

        {/* Changelog */}
        <section className="docs-changelog">
          <div className="docs-group-head">
            <div className="docs-group-heading">
              <h2 className="docs-group-title">Changelog</h2>
            </div>
            <p className="docs-group-blurb">Recent product updates, freshest on top.</p>
          </div>

          <ol className="docs-timeline">
            {CHANGELOG.map((entry) => (
              <li key={entry.date + entry.title} className="docs-change">
                <div className="docs-change-meta">
                  <time className="docs-change-date">{entry.date}</time>
                  <span className="docs-change-ago">{relativeDate(entry.date)}</span>
                  {entry.tag && <span className={`docs-tag docs-tag-${entry.tag}`}>{entry.tag}</span>}
                </div>
                <h3 className="docs-change-title">{entry.title}</h3>
                <ul className="docs-change-bullets">
                  {entry.bullets.map((b, i) => (
                    <li key={i}>{b}</li>
                  ))}
                </ul>
              </li>
            ))}
          </ol>
        </section>

        {/* Footer */}
        <footer className="docs-footer">
          <div className="docs-footer-links">
            <Link to="/support">Support</Link>
            <span className="docs-dot">·</span>
            <Link to="/contact">Contact</Link>
            <span className="docs-dot">·</span>
            <Link to="/privacy">Privacy</Link>
            <span className="docs-dot">·</span>
            <Link to="/terms">Terms</Link>
          </div>
          <div className="docs-footer-meta">
            Docs auto-generated from source · {totalEntries} entries indexed
          </div>
        </footer>

        {/* Placeholder to keep react-router / ChevronRight referenced without visible clutter */}
        <span className="sr-only" aria-hidden>
          <ChevronRight size={0} />
        </span>
      </main>
    </div>
  );
}

const css = `
.docs-root {
  min-height: 100vh;
  background: #000;
  color: #f5f5f7;
  font-family: "DM Sans", -apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif;
  -webkit-font-smoothing: antialiased;
}
.docs-topbar {
  position: sticky;
  top: 0;
  z-index: 20;
  display: grid;
  grid-template-columns: 44px 1fr 44px;
  align-items: center;
  padding: 10px 12px;
  background: rgba(0,0,0,0.85);
  backdrop-filter: saturate(140%) blur(14px);
  -webkit-backdrop-filter: saturate(140%) blur(14px);
  border-bottom: 1px solid rgba(255,255,255,0.06);
}
.docs-back {
  width: 40px; height: 40px;
  display: inline-flex; align-items: center; justify-content: center;
  border-radius: 12px;
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.08);
  color: #f5f5f7;
  cursor: pointer;
  transition: transform .15s ease, background .15s ease;
}
.docs-back:active { transform: scale(0.94); background: rgba(255,255,255,0.08); }
.docs-topbar-title {
  text-align: center;
  font-family: "Space Grotesk", system-ui, sans-serif;
  font-weight: 600;
  letter-spacing: -0.01em;
  font-size: 16px;
  color: #f5f5f7;
}
.docs-topbar-spacer { width: 40px; }

.docs-main {
  max-width: 780px;
  margin: 0 auto;
  padding: 24px 20px 96px;
}

.docs-hero { padding: 20px 4px 8px; }
.docs-eyebrow {
  font-size: 11px;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: rgba(255,255,255,0.42);
  margin-bottom: 14px;
}
.docs-title {
  font-family: "Space Grotesk", system-ui, sans-serif;
  font-weight: 600;
  letter-spacing: -0.03em;
  font-size: clamp(30px, 6vw, 44px);
  line-height: 1.05;
  color: #fff;
  margin: 0 0 14px;
}
.docs-subtitle {
  font-size: 15px;
  line-height: 1.55;
  color: rgba(255,255,255,0.62);
  margin: 0 0 22px;
  max-width: 560px;
}
.docs-search-wrap {
  position: relative;
  display: flex; align-items: center;
  background: #0a0a0a;
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 14px;
  padding: 0 12px;
  transition: border-color .15s ease, background .15s ease;
}
.docs-search-wrap:focus-within {
  border-color: rgba(255,255,255,0.22);
  background: #0d0d0d;
}
.docs-search-icon { color: rgba(255,255,255,0.42); flex: none; }
.docs-search {
  flex: 1;
  background: transparent;
  border: 0;
  outline: none;
  color: #f5f5f7;
  font: inherit;
  font-size: 15px;
  padding: 14px 10px;
}
.docs-search::placeholder { color: rgba(255,255,255,0.36); }
.docs-kbd {
  font-family: "SF Mono", ui-monospace, monospace;
  font-size: 11px;
  color: rgba(255,255,255,0.55);
  background: rgba(255,255,255,0.06);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 6px;
  padding: 3px 6px;
}

.docs-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
  margin-top: 20px;
}
.docs-stat {
  background: #0a0a0a;
  border: 1px solid rgba(255,255,255,0.06);
  border-radius: 14px;
  padding: 14px;
  text-align: center;
}
.docs-stat-num {
  font-family: "Space Grotesk", system-ui, sans-serif;
  font-weight: 600;
  font-size: 22px;
  letter-spacing: -0.02em;
  color: #fff;
}
.docs-stat-label {
  margin-top: 4px;
  font-size: 11px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: rgba(255,255,255,0.44);
}

.docs-groups { margin-top: 40px; display: flex; flex-direction: column; gap: 36px; }
.docs-group { scroll-margin-top: 72px; }
.docs-group-head { padding: 0 4px 14px; }
.docs-group-heading {
  display: flex; align-items: center; gap: 8px;
}
.docs-group-title {
  font-family: "Space Grotesk", system-ui, sans-serif;
  font-weight: 600;
  font-size: 20px;
  letter-spacing: -0.02em;
  color: #fff;
  margin: 0;
}
.docs-group-blurb {
  margin: 6px 0 0;
  color: rgba(255,255,255,0.5);
  font-size: 13.5px;
  line-height: 1.55;
}
.docs-anchor {
  width: 26px; height: 26px;
  display: inline-flex; align-items: center; justify-content: center;
  border-radius: 8px;
  background: transparent;
  border: 1px solid rgba(255,255,255,0.06);
  color: rgba(255,255,255,0.5);
  cursor: pointer;
  opacity: 0;
  transition: opacity .15s ease, color .15s ease, background .15s ease;
}
.docs-group-heading:hover .docs-anchor,
.docs-item:hover .docs-anchor-item { opacity: 1; }
.docs-anchor:hover { color: #fff; background: rgba(255,255,255,0.05); }

.docs-list {
  list-style: none;
  margin: 0; padding: 0;
  background: #0a0a0a;
  border: 1px solid rgba(255,255,255,0.06);
  border-radius: 18px;
  overflow: hidden;
}
.docs-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 16px 18px;
  border-bottom: 1px solid rgba(255,255,255,0.05);
  scroll-margin-top: 72px;
}
.docs-item:last-child { border-bottom: 0; }
.docs-item-body { flex: 1; min-width: 0; }
.docs-item-title {
  font-family: "Space Grotesk", system-ui, sans-serif;
  font-weight: 500;
  font-size: 15px;
  letter-spacing: -0.01em;
  color: #f5f5f7;
}
.docs-item-desc {
  margin-top: 3px;
  font-size: 13.5px;
  line-height: 1.5;
  color: rgba(255,255,255,0.58);
}
.docs-item-path {
  margin-top: 6px;
  font-family: "SF Mono", ui-monospace, monospace;
  font-size: 11px;
  color: rgba(255,255,255,0.28);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.docs-empty {
  padding: 40px 20px;
  text-align: center;
  color: rgba(255,255,255,0.5);
  background: #0a0a0a;
  border: 1px solid rgba(255,255,255,0.06);
  border-radius: 18px;
}

.docs-changelog { margin-top: 56px; }
.docs-timeline {
  list-style: none;
  margin: 0; padding: 0;
  display: flex; flex-direction: column; gap: 14px;
}
.docs-change {
  background: #0a0a0a;
  border: 1px solid rgba(255,255,255,0.06);
  border-radius: 18px;
  padding: 18px 20px;
}
.docs-change-meta {
  display: flex; align-items: center; gap: 10px;
  font-size: 12px;
  color: rgba(255,255,255,0.44);
}
.docs-change-date {
  font-family: "SF Mono", ui-monospace, monospace;
  color: rgba(255,255,255,0.7);
}
.docs-change-ago::before { content: "· "; opacity: 0.5; }
.docs-tag {
  margin-left: auto;
  font-size: 10px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  padding: 3px 8px;
  border-radius: 999px;
  border: 1px solid rgba(255,255,255,0.1);
  color: rgba(255,255,255,0.75);
}
.docs-tag-new      { color: #b7f0c1; border-color: rgba(120,220,150,0.28); background: rgba(120,220,150,0.06); }
.docs-tag-improved { color: #cfe0ff; border-color: rgba(140,175,255,0.28); background: rgba(140,175,255,0.06); }
.docs-tag-fixed    { color: #ffd7b0; border-color: rgba(255,180,110,0.28); background: rgba(255,180,110,0.06); }
.docs-tag-security { color: #ffb0b0; border-color: rgba(255,120,120,0.28); background: rgba(255,120,120,0.06); }
.docs-change-title {
  font-family: "Space Grotesk", system-ui, sans-serif;
  font-weight: 600;
  font-size: 17px;
  letter-spacing: -0.015em;
  color: #fff;
  margin: 10px 0 8px;
}
.docs-change-bullets {
  margin: 0; padding-left: 18px;
  color: rgba(255,255,255,0.62);
  font-size: 13.5px;
  line-height: 1.6;
}
.docs-change-bullets li { margin: 2px 0; }

.docs-footer {
  margin-top: 56px;
  padding-top: 24px;
  border-top: 1px solid rgba(255,255,255,0.06);
  text-align: center;
}
.docs-footer-links {
  display: flex; justify-content: center; align-items: center; gap: 8px;
  font-size: 13px;
  color: rgba(255,255,255,0.6);
}
.docs-footer-links a { color: rgba(255,255,255,0.75); text-decoration: none; }
.docs-footer-links a:hover { color: #fff; }
.docs-dot { color: rgba(255,255,255,0.25); }
.docs-footer-meta {
  margin-top: 10px;
  font-size: 12px;
  color: rgba(255,255,255,0.35);
}

.sr-only { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); }
`;
