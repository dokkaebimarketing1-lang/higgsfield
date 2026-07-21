import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { bindings } from "../bindings.server";

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
});

export type InquiryInput = z.infer<typeof inquirySchema>;

export const submitInquiry = createServerFn({ method: "POST" })
  .inputValidator(inquirySchema)
  .handler(async ({ data }) => {
    const { DB } = bindings();
    if (!DB) {
      throw new Error("상담 신청 접수가 일시적으로 불가합니다. 카카오톡으로 문의해 주세요.");
    }
    await DB.prepare(
      "INSERT INTO inquiries (name, phone, student_type, goal, preferred_days, message) VALUES (?, ?, ?, ?, ?, ?)",
    )
      .bind(
        data.name,
        data.phone,
        data.studentType,
        data.goal,
        data.preferredDays,
        data.message,
      )
      .run();
    return { ok: true as const };
  });

export const listInquiries = createServerFn({ method: "POST" })
  .inputValidator(z.object({ passcode: z.string().min(1) }))
  .handler(async ({ data }) => {
    const { DB, ADMIN_PASSCODE } = bindings();
    if (!DB) throw new Error("DB가 연결되어 있지 않습니다.");
    if (!ADMIN_PASSCODE || data.passcode !== ADMIN_PASSCODE) {
      throw new Error("비밀번호가 올바르지 않습니다.");
    }
    const { results } = await DB.prepare(
      "SELECT id, name, phone, student_type, goal, preferred_days, message, status, created_at FROM inquiries ORDER BY created_at DESC LIMIT 200",
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
    }>();
    return { inquiries: results ?? [] };
  });

export const markInquiryDone = createServerFn({ method: "POST" })
  .inputValidator(z.object({ passcode: z.string().min(1), id: z.number().int() }))
  .handler(async ({ data }) => {
    const { DB, ADMIN_PASSCODE } = bindings();
    if (!DB) throw new Error("DB가 연결되어 있지 않습니다.");
    if (!ADMIN_PASSCODE || data.passcode !== ADMIN_PASSCODE) {
      throw new Error("비밀번호가 올바르지 않습니다.");
    }
    await DB.prepare("UPDATE inquiries SET status = 'done' WHERE id = ?")
      .bind(data.id)
      .run();
    return { ok: true as const };
  });
