/**
 * Frontend tools bus — bridge between AI SDK tool calls and client-side UI actions.
 *
 * The agent runtime returns `{ _frontend: true, action, input }` for
 * tools without a server-side execute. The chat UI subscribes here and
 * dispatches the action to whichever component owns it.
 */

type FrontendHandler = (input: unknown) => void | Promise<unknown>;

const handlers = new Map<string, Set<FrontendHandler>>();

export function registerFrontendHandler(action: string, handler: FrontendHandler): () => void {
  if (!handlers.has(action)) handlers.set(action, new Set());
  handlers.get(action)!.add(handler);
  return () => handlers.get(action)?.delete(handler);
}

export async function dispatchFrontendTool(action: string, input: unknown): Promise<unknown> {
  const set = handlers.get(action);
  if (!set || set.size === 0) {
    return { ok: false, error: `No handler registered for action "${action}"` };
  }
  const results = await Promise.all(
    Array.from(set).map(async (h) => {
      try {
        return await h(input);
      } catch (error) {
        return { error: error instanceof Error ? error.message : String(error) };
      }
    }),
  );
  return results.length === 1 ? results[0] : results;
}
