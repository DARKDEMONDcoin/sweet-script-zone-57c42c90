/** @doc Per-user Pipedream tool preferences — user picks which connected apps the AI may call. */
import { useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import { supabase } from "@/integrations/supabase/client";
import { integrations } from "@/lib/integrationsData";
import { loadIntegrationConnections } from "@/lib/integrationBackend";
import { Switch } from "@/components/ui/switch";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "@/hooks/use-toast";

interface Row {
  app: string;
  name: string;
  category: string;
  enabled: boolean;
}

export default function PipedreamToolsPage() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const snap = await loadIntegrationConnections(integrations);
        const { data: auth } = await supabase.auth.getUser();
        const user = auth?.user;
        if (!user) throw new Error("Sign in required");
        const { data: prefs } = await supabase
          .from("pipedream_tool_settings")
          .select("app_slug,enabled")
          .eq("user_id", user.id);
        const map = new Map<string, boolean>();
        (prefs || []).forEach((p: any) => map.set(p.app_slug, !!p.enabled));

        const connected = integrations
          .filter((i) => i.type === "pipedream" && snap.connectedApps[i.app])
          .map((i) => ({
            app: i.app,
            name: i.name,
            category: i.category,
            enabled: map.has(i.app) ? !!map.get(i.app) : true,
          }));

        if (!cancelled) setRows(connected);
      } catch (e: any) {
        toast({ title: "تعذر تحميل الأدوات", description: e.message, variant: "destructive" });
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  async function toggle(app: string, next: boolean) {
    setSaving(app);
    const prev = rows;
    setRows((r) => r.map((x) => (x.app === app ? { ...x, enabled: next } : x)));
    try {
      const { data: auth } = await supabase.auth.getUser();
      const user = auth?.user;
      if (!user) throw new Error("Sign in required");
      const { error } = await supabase
        .from("pipedream_tool_settings")
        .upsert(
          { user_id: user.id, app_slug: app, enabled: next, updated_at: new Date().toISOString() },
          { onConflict: "user_id,app_slug" },
        );
      if (error) throw error;
    } catch (e: any) {
      setRows(prev);
      toast({ title: "فشل الحفظ", description: e.message, variant: "destructive" });
    } finally {
      setSaving(null);
    }
  }

  const grouped = useMemo(() => {
    const g: Record<string, Row[]> = {};
    rows.forEach((r) => {
      (g[r.category] ||= []).push(r);
    });
    return g;
  }, [rows]);

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 text-foreground">
      <Helmet>
        <title>أدوات Pipedream · Megsy AI</title>
      </Helmet>
      <h1 className="text-2xl font-bold">أدوات Pipedream</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        اختر أي التطبيقات المربوطة يُسمح للـ AI باستخدامها تلقائياً داخل الشات.
      </p>

      {loading ? (
        <div className="mt-8 flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <Spinner className="h-4 w-4" />
          تحميل
        </div>
      ) : rows.length === 0 ? (
        <div className="mt-8 rounded-lg border border-border/50 p-6 text-center text-sm text-muted-foreground">
          لا توجد تطبيقات Pipedream مربوطة بحسابك.{" "}
          <a href="/settings/integrations" className="underline">اربط تطبيقاً</a>
        </div>
      ) : (
        <div className="mt-6 space-y-6">
          {Object.entries(grouped).map(([cat, list]) => (
            <section key={cat}>
              <h2 className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                {cat}
              </h2>
              <div className="rounded-lg border border-border/50 divide-y divide-border/50">
                {list.map((r) => (
                  <div key={r.app} className="flex items-center justify-between px-4 py-3">
                    <div className="text-sm">{r.name}</div>
                    <Switch
                      checked={r.enabled}
                      disabled={saving === r.app}
                      onCheckedChange={(v) => toggle(r.app, v)}
                    />
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
