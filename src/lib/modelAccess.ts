/**
 * @doc Server-authoritative model access & quota.
 *
 * `src/lib/subscriptionGating.ts` is **advisory only** — it decides what the UI
 * shows/greys out. It can be bypassed by anyone calling the backend directly.
 *
 * The authority lives in Postgres (SECURITY DEFINER, `search_path = public`):
 *   - `model_requires_paid_plan(model_id)` — reads the models catalogue
 *     (`chat_models.tier`, `image_models.is_premium`) and fails closed on
 *     unknown models.
 *   - `assert_model_access(model_id)`      — plan check for `auth.uid()`.
 *   - `consume_model_use(...)`             — plan check + daily free allowance
 *     or credit charge, atomically, in one round-trip.
 *
 * Any server-side generation path (edge functions / server code) MUST call
 * `consume_model_use` before doing paid work.
 */

import { supabase } from "@/integrations/supabase/client";

export type ModelAccessResult = {
  allowed: boolean;
  reason?: "not_authenticated" | "plan_required" | string;
  model?: string;
};

export type ConsumeResult = {
  success: boolean;
  charged?: boolean;
  remaining_free?: number;
  error?: string;
};

/** Ask the database whether the signed-in user may use this model. */
export async function assertModelAccess(modelId: string): Promise<ModelAccessResult> {
  const { data, error } = await supabase.rpc("assert_model_access" as never, {
    _model_id: modelId,
  } as never);
  if (error) return { allowed: false, reason: error.message };
  return (data as unknown as ModelAccessResult) ?? { allowed: false, reason: "unknown" };
}

/**
 * Plan check + quota consumption in a single atomic call.
 * `freePerDay` is the free-tier daily allowance for `feature`; when it is
 * exhausted, `cost` credits are deducted instead.
 */
export async function consumeModelUse(opts: {
  modelId: string;
  feature: string;
  freePerDay?: number;
  cost?: number;
  description?: string;
}): Promise<ConsumeResult> {
  const { data, error } = await supabase.rpc("consume_model_use" as never, {
    _model_id: opts.modelId,
    _feature: opts.feature,
    _free_per_day: opts.freePerDay ?? 0,
    _cost: opts.cost ?? 1,
    _description: opts.description ?? null,
  } as never);
  if (error) return { success: false, error: error.message };
  return (data as unknown as ConsumeResult) ?? { success: false, error: "unknown" };
}
