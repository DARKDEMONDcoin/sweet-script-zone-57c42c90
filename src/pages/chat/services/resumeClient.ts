/**
 * جلب ذيل (tail) البث المتوقف من endpoint chat-alibaba مع action=resume-tail.
 * يُستخدم كخيار fallback عندما ينقطع الاتصال أثناء البث: العميل يُخزّن
 * `resumeId` الحالي، ويسأل السيرفر عن الجزء المُخزَّن بعد offset معيّن،
 * ثم يُلحقه بمحتوى الرسالة الحالية بدون بدء توليد جديد.
 *
 * إذا كان `done=true` فالبث اكتمل ولا حاجة لتوليد جديد.
 * إذا كان `done=false` فالجيل توقف — العميل قد يعرض زر "استكمال" الذي
 * يبدأ توليد جديد باستكمال طبيعي (client-side continuation).
 */

import { supabase } from "@/integrations/supabase/client";

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat-alibaba`;

export interface ResumeTailResult {
  tail: string;
  length: number;
  done: boolean;
  interrupted: boolean;
  updated_at: string;
}

export async function fetchResumeTail(
  resumeId: string,
  offset = 0,
): Promise<ResumeTailResult | null> {
  if (!resumeId) return null;
  try {
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;
    if (!token) return null;
    const url = new URL(CHAT_URL);
    url.searchParams.set("action", "resume-tail");
    url.searchParams.set("id", resumeId);
    url.searchParams.set("offset", String(offset));
    const r = await fetch(url.toString(), {
      method: "GET",
      headers: {
        apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
        Authorization: `Bearer ${token}`,
      },
    });
    if (!r.ok) return null;
    const j = (await r.json()) as ResumeTailResult;
    return j;
  } catch {
    return null;
  }
}
