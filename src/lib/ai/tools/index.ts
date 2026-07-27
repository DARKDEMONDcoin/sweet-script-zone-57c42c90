/**
 * Barrel — importing this file registers every tool into the shared registry.
 * Import it once from the agent runtime entry (server) AND from the client
 * bootstrap so the frontend bus knows the action names.
 */

import "./backend/coreTools";
import "./frontend/uiActions";

export * from "./registry";
export * from "./frontendBus";
