/**
 * Frontend UI action tools — no server execute; dispatched via frontendBus.
 * The agent can call these to steer the app's UI as the user.
 */

import { z } from "zod";
import { registerTool } from "../registry";

registerTool({
  name: "ui_navigate",
  description: "Navigate the user to a route inside the app (e.g. /chat, /settings).",
  category: "ui",
  inputSchema: z.object({
    path: z.string().describe("App-relative path starting with /"),
  }),
  frontendAction: "navigate",
  icon: "arrow-right",
});

registerTool({
  name: "ui_open_settings",
  description: "Open the app settings panel, optionally focused on a section.",
  category: "ui",
  inputSchema: z.object({
    section: z.string().optional(),
  }),
  frontendAction: "openSettings",
  icon: "settings",
});

registerTool({
  name: "ui_focus_composer",
  description: "Focus the chat composer input.",
  category: "ui",
  inputSchema: z.object({}),
  frontendAction: "focusComposer",
  icon: "pencil",
});

registerTool({
  name: "ui_open_uploader",
  description: "Open the file uploader / attachments picker.",
  category: "ui",
  inputSchema: z.object({
    accept: z.string().optional().describe("MIME filter, e.g. image/*"),
  }),
  frontendAction: "openUploader",
  icon: "paperclip",
});

registerTool({
  name: "ui_switch_mode",
  description: "Switch chat mode (chat, research, code, media).",
  category: "ui",
  inputSchema: z.object({
    mode: z.enum(["chat", "research", "code", "media"]),
  }),
  frontendAction: "switchMode",
  icon: "toggle",
});

registerTool({
  name: "ui_toast",
  description: "Show a small notification toast to the user.",
  category: "ui",
  inputSchema: z.object({
    message: z.string(),
    variant: z.enum(["info", "success", "warning", "error"]).optional(),
  }),
  frontendAction: "toast",
  icon: "bell",
});
