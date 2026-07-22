import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import {
  AdminAuthError,
  constantTimeTextEqual,
  createAdminSession,
  hasAdminSession,
  revokeAdminSession,
  setPrivateNoStore,
} from "../auth.server";
import { bindings } from "../bindings.server";
import { consumeRateLimit } from "../rate-limit.server";

const loginSchema = z.object({
  passcode: z.string().min(1).max(256),
});

export const loginAdmin = createServerFn({ method: "POST" })
  .validator(loginSchema)
  .handler(async ({ data }): Promise<{ ok: true }> => {
    setPrivateNoStore();
    const { DB, ADMIN_PASSCODE } = bindings();
    if (!DB) throw new AdminAuthError("로그인에 실패했습니다.");

    const withinLimit = await consumeRateLimit(DB, "admin-login");
    const configuredPasscode = ADMIN_PASSCODE ?? "__missing_admin_passcode__";
    const matches = await constantTimeTextEqual(data.passcode, configuredPasscode);
    if (!withinLimit || !ADMIN_PASSCODE || !matches) {
      throw new AdminAuthError("로그인에 실패했습니다.");
    }

    await createAdminSession(DB);
    return { ok: true };
  });

export const adminSessionStatus = createServerFn({ method: "GET" }).handler(
  async (): Promise<{ authenticated: boolean }> => {
    setPrivateNoStore();
    const { DB } = bindings();
    return { authenticated: DB ? await hasAdminSession(DB) : false };
  },
);

export const logoutAdmin = createServerFn({ method: "POST" }).handler(
  async (): Promise<{ ok: true }> => {
    setPrivateNoStore();
    await revokeAdminSession(bindings().DB);
    return { ok: true };
  },
);
