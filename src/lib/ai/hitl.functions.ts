import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";
import { decideHitlApproval } from "./hitl.server";

const InputSchema = z.object({
  id: z.string().uuid(),
  approve: z.boolean(),
  editedInput: z.unknown().optional(),
});

export const decideApproval = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => InputSchema.parse(input))
  .handler(async ({ data, context }) => {
    const ctx = context as { supabase: import("@supabase/supabase-js").SupabaseClient };
    await decideHitlApproval(ctx.supabase, {
      id: data.id,
      approve: data.approve,
      editedInput: data.editedInput,
    });
    return { ok: true };
  });
