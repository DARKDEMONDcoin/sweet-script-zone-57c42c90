import type { ChatMode } from "../chatConstants";

/**
 * @doc dbModeToChatMode — the single inverse of `modeToDbMode`.
 *
 * The sidebar lists conversations from EVERY service (chat, research, slides,
 * images, videos, code, learning, shopping) and opens all of them through
 * ChatPage. Without a complete inverse map, opening an images/video/code
 * record silently fell back to "normal", so the record rendered with the wrong
 * composer, model picker and card renderers.
 *
 * Keep this in sync with `modeToDbMode` in `conversationApi.ts`.
 */
export function dbModeToChatMode(dbMode: string | null | undefined): ChatMode {
  switch (dbMode) {
    case "research":
      return "deep-research";
    case "learning":
      return "learning";
    case "shopping":
      return "shopping";
    case "slides":
      return "slides";
    case "slides-images":
      return "slides-images";
    case "images":
      return "images";
    case "videos":
    case "video":
      return "video";
    case "music":
      return "music";
    case "code":
    case "coding":
    case "website":
      return "code";
    case "operator":
      return "operator";
    default:
      return "normal";
  }
}

export default dbModeToChatMode;
