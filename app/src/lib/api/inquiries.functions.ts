import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireAdmin } from "../auth.server";
import { bindings } from "../bindings.server";
import { consumeRateLimit } from "../rate-limit.server";

const MINIMUM_COMPLETION_MS = 1_500;
const MAXIMUM_COMPLETION_MS = 2 * 60 * 60 * 1_000;
const GENERIC_SUBMISSION_ERROR = "상담 신청을 처리하지 못했습니다. 잠시 후 다시 시도해 주세요.";

const inquirySchema = z.object({
  name: z.string().trim().min(1, "이름을 입력해 주세요").max(40),
  phone: z
    .string()
    .trim()
    .min(9, "연락처를 정확히 입력해 주세요")
    .max(20)
    .regex(/^[0-9+\-\s()]+$/, "연락처 형식을 확인해 주세요"),
  studentType: z.string().trim().max(20).default(""),
  goal: z.string().trim().max(60).default(""),
  preferredDays: z.string().trim().max(60).default(""),
  message: z.string().trim().max(1000).default(""),
  privacyAcknowledged: z.literal(true),
  website: z.string().max(200).default(""),
  startedAt: z.number().int().positive(),
});

export type InquiryInput = z.infer<typeof inquirySchema>;

async function purgeExpiredInquiries(): Promise<void> {
  const { DB } = bindings();
  if (!DB) return;
  await DB.prepare(
    `DELETE FROM inquiries
     WHERE id IN (
       SELECT i.id
       FROM inquiries AS i
       LEFT JOIN inquiry_completions AS c ON c.inquiry_id = i.id
       WHERE (i.status = 'done' AND COALESCE(c.completed_at, i.created_at) < datetime('now', '-90 days'))
          OR (i.status != 'done' AND i.created_at < datetime('now', '-1 year'))
     )`,
  ).run();
}

export const submitInquiry = createServerFn({ method: "POST" })
  .validator(inquirySchema)
  .handler(async ({ data }): Promise<{ ok: true }> => {
    if (data.website) return { ok: true };

    const elapsed = Date.now() - data.startedAt;
    if (elapsed < MINIMUM_COMPLETION_MS || elapsed > MAXIMUM_COMPLETION_MS) {
      throw new Error(GENERIC_SUBMISSION_ERROR);
    }

    const { DB } = bindings();
    if (!DB) throw new Error(GENERIC_SUBMISSION_ERROR);

    if (!(await consumeRateLimit(DB, "public-inquiry"))) {
      throw new Error(GENERIC_SUBMISSION_ERROR);
    }
    await purgeExpiredInquiries();

    await DB.prepare(
      "INSERT INTO inquiries (name, phone, student_type, goal, preferred_days, message) VALUES (?, ?, ?, ?, ?, ?)",
    )
      .bind(data.name, data.phone, data.studentType, data.goal, data.preferredDays, data.message)
      .run();
    return { ok: true };
  });

export const listInquiries = createServerFn({ method: "POST" }).handler(
  async (): Promise<{
    inquiries: Array<{
      id: number;
      name: string;
      phone: string;
      student_type: string;
      goal: string;
      preferred_days: string;
      message: string;
      status: string;
      created_at: string;
      completed_at: string | null;
    }>;
  }> => {
    await requireAdmin();
    const { DB } = bindings();
    if (!DB) throw new Error("DB가 연결되어 있지 않습니다.");
    await purgeExpiredInquiries();
    const { results } = await DB.prepare(
      `SELECT i.id, i.name, i.phone, i.student_type, i.goal,
              i.preferred_days, i.message, i.status, i.created_at,
              c.completed_at
       FROM inquiries AS i
       LEFT JOIN inquiry_completions AS c ON c.inquiry_id = i.id
       ORDER BY i.created_at DESC
       LIMIT 200`,
    ).all<{
      id: number;
      name: string;
      phone: string;
      student_type: string;
      goal: string;
      preferred_days: string;
      message: string;
      status: string;
      created_at: string;
      completed_at: string | null;
    }>();
    return { inquiries: results ?? [] };
  },
);

export const markInquiryDone = createServerFn({ method: "POST" })
  .validator(z.object({ id: z.number().int().positive() }))
  .handler(async ({ data }): Promise<{ ok: true }> => {
    await requireAdmin();
    const { DB } = bindings();
    if (!DB) throw new Error("DB가 연결되어 있지 않습니다.");
    await DB.batch([
      DB.prepare("UPDATE inquiries SET status = 'done' WHERE id = ?").bind(data.id),
      DB.prepare(
        `INSERT OR IGNORE INTO inquiry_completions (inquiry_id, completed_at)
         SELECT id, datetime('now') FROM inquiries WHERE id = ?`,
      ).bind(data.id),
    ]);
    return { ok: true };
  });
