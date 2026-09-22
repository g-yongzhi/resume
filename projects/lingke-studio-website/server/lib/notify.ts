import nodemailer from "nodemailer";
import type { ContactPayload } from "./validateContact.js";

function smtpConfigured() {
  return Boolean(
    process.env.SMTP_HOST &&
      process.env.SMTP_USER &&
      process.env.SMTP_PASS &&
      process.env.NOTIFY_TO,
  );
}

export async function notifyNewContact(payload: ContactPayload, submissionId: number) {
  if (!smtpConfigured()) return;

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT ?? 465),
    secure: process.env.SMTP_SECURE !== "false",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  const to = process.env.NOTIFY_TO!;
  const from = process.env.SMTP_FROM ?? process.env.SMTP_USER!;

  await transporter.sendMail({
    from,
    to,
    replyTo: payload.email,
    subject: `【灵壳官网】新咨询 #${submissionId} — ${payload.name}`,
    text: [
      `编号：${submissionId}`,
      `姓名：${payload.name}`,
      `邮箱：${payload.email}`,
      `手机：${payload.phone}`,
      "",
      "合作需求：",
      payload.brief,
    ].join("\n"),
  });
}
