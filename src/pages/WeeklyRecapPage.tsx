import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Flame, MessageSquare, Snowflake, Sparkles, Trophy } from "lucide-react";
import { readStreak, type StreakState } from "@/lib/streaks";
import { supabase } from "@/integrations/supabase/client";

interface WeeklyStats {
  messages: number;
  conversations: number;
  activeDays: number;
}

/**
 * Weekly Recap — an engagement/growth loop page summarising the user's
 * activity in the last 7 days: streak, days active, messages, conversations.
 * Purely additive; no backend changes required.
 */
export default function WeeklyRecapPage() {
  const [streak, setStreak] = useState<StreakState>(() => readStreak());
  const [stats, setStats] = useState<WeeklyStats>({ messages: 0, conversations: 0, activeDays: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setStreak(readStreak());
    let cancelled = false;
    (async () => {
      try {
        const { data: userRes } = await supabase.auth.getUser();
        const uid = userRes?.user?.id;
        if (!uid) { setLoading(false); return; }
        const since = new Date(Date.now() - 7 * 86_400_000).toISOString();
        const [{ count: msgCount }, { data: convs }] = await Promise.all([
          supabase.from("messages").select("id", { count: "exact", head: true })
            .eq("user_id", uid).gte("created_at", since),
          supabase.from("conversations").select("id, updated_at")
            .eq("user_id", uid).gte("updated_at", since),
        ]);
        if (cancelled) return;
        setStats({
          messages: msgCount || 0,
          conversations: convs?.length || 0,
          activeDays: readStreak().daysThisWeek.length,
        });
      } catch { /* ignore */ }
      finally { if (!cancelled) setLoading(false); }
    })();
    return () => { cancelled = true; };
  }, []);

  const highlight = useMemo(() => {
    if (streak.count >= 7) return "أسبوع كامل بدون ما تفوّت يوم — إنت في حالة تركيز خرافية ✨";
    if (streak.count >= 3) return "ماشي بثبات — كمّل عشان تفتح Freeze جديد كل ٧ أيام.";
    if (stats.messages > 20) return "شغل كتير الأسبوع ده — لو نظّمناه في محادثات مقسّمة هيبقى أوضح.";
    return "بدايتك حلوة — أول ٧ أيام هي الأصعب، وإنت جوّاها.";
  }, [streak.count, stats.messages]);

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 md:py-10">
      <div className="mb-6 flex items-center gap-3">
        <Link to="/chat" className="rounded-full p-2 hover:bg-muted"><ArrowLeft className="h-4 w-4" /></Link>
        <h1 className="text-2xl font-semibold">ملخّص أسبوعك</h1>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Card icon={<Flame className="h-5 w-5 text-orange-500" />} label="Streak" value={streak.count.toString()} sub={`أفضل: ${streak.best}`} />
        <Card icon={<Sparkles className="h-5 w-5 text-primary" />} label="أيام نشطة" value={stats.activeDays.toString()} sub="آخر ٧ أيام" />
        <Card icon={<MessageSquare className="h-5 w-5 text-emerald-500" />} label="رسائل" value={stats.messages.toString()} sub="هذا الأسبوع" />
        <Card icon={<Trophy className="h-5 w-5 text-amber-500" />} label="محادثات" value={stats.conversations.toString()} sub="نشطة" />
      </div>

      <div className="mt-6 rounded-2xl border border-border/60 bg-card/40 p-5">
        <h2 className="mb-2 text-lg font-semibold">أبرز ملاحظة</h2>
        <p className="text-sm text-muted-foreground">{loading ? "جاري الحساب…" : highlight}</p>
      </div>

      <div className="mt-4 flex items-center gap-3 rounded-2xl border border-border/60 bg-card/40 p-4 text-sm">
        <Snowflake className="h-5 w-5 text-sky-400" />
        <div>
          <div className="font-medium">Freezes متاحة: {streak.freezes}</div>
          <div className="text-xs text-muted-foreground">تُستخدم تلقائياً لو فوّتّ يوم — بتحصل على واحدة كل ٧ أيام.</div>
        </div>
      </div>
    </div>
  );
}

function Card({ icon, label, value, sub }: { icon: React.ReactNode; label: string; value: string; sub: string }) {
  return (
    <div className="rounded-2xl border border-border/60 bg-card/40 p-4">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-xs text-muted-foreground">{label}</span>
        {icon}
      </div>
      <div className="text-2xl font-semibold">{value}</div>
      <div className="mt-1 text-[11px] text-muted-foreground">{sub}</div>
    </div>
  );
}
