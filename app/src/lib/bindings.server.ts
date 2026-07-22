// Request-scoped access to this app's server bindings. `src/server.ts` stores
// the environment passed to each fetch call, which works both in Cloudflare's
// Worker runtime and in Vite's Node-based dev/preview server. Bindings are
// optional because local preview intentionally runs without production data.
import { AsyncLocalStorage } from "node:async_hooks";

// Import binding types directly instead of adding them to tsconfig's global
// `types` list, which would clobber DOM globals used by React code.
import type {
  D1Database,
  DurableObjectNamespace,
  KVNamespace,
  R2Bucket,
} from "@cloudflare/workers-types";

export type AppEnv = {
  DB?: D1Database;
  STORAGE?: R2Bucket;
  KV?: KVNamespace;
  // Present only when the matching resource is provisioned by the platform.
  CONTAINER?: DurableObjectNamespace;
  HF_ENV?: string;
  APP_SLUG?: string;
  ADMIN_PASSCODE?: string;
};

const bindingStorage = new AsyncLocalStorage<AppEnv>();

export function withBindings<T>(env: unknown, callback: () => T): T {
  return bindingStorage.run((env ?? {}) as AppEnv, callback);
}

export function bindings(): AppEnv {
  return bindingStorage.getStore() ?? {};
}
