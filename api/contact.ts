import type { VercelRequest, VercelResponse } from '@vercel/node';
import nodemailer from 'nodemailer';

const hits = new Map<string, number[]>();
const clean = (v: unknown, max: number) => String(v ?? '').replace(/[\r\n]+/g, ' ').trim().slice(0, max);
const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c] as string));

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') return res.status(405).json({ message: 'POST only' });
  const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {};
  if (clean(body.website, 10)) return res.status(200).json({ ok: true }); // honeypot
  const name = clean(body.name, 80), email = clean(body.email, 120);
  const message = String(body.message ?? '').trim().slice(0, 3000);
  if (!name || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email) || message.length < 10) return res.status(400).json({ message: '이름·이메일·메시지(10자 이상)를 확인해 주세요.' });
  const ip = String(req.headers['x-forwarded-for'] || '').split(',')[0].trim() || 'unknown';
  const now = Date.now(); const arr = (hits.get(ip) || []).filter((t) => now - t < 10 * 60_000);
  if (arr.length >= 3) return res.status(429).json({ message: '잠시 후 다시 시도해 주세요.' });
  arr.push(now); hits.set(ip, arr);
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, CONTACT_TO } = process.env;
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS || !CONTACT_TO) return res.status(503).json({ message: '메일 발송이 아직 설정되지 않았습니다. sorlros2047@gmail.com 으로 직접 보내주세요.' });
  try {
    const t = nodemailer.createTransport({ host: SMTP_HOST, port: Number(SMTP_PORT || 587), secure: Number(SMTP_PORT) === 465, auth: { user: SMTP_USER, pass: SMTP_PASS } });
    await t.sendMail({ from: SMTP_USER, to: CONTACT_TO, replyTo: email, subject: `[포트폴리오] ${name}`, text: `${name} <${email}>\n\n${message}`, html: `<p><b>${esc(name)}</b> &lt;${esc(email)}&gt;</p><pre style="white-space:pre-wrap;font-family:inherit">${esc(message)}</pre>` });
    return res.status(200).json({ ok: true });
  } catch { return res.status(500).json({ message: '보내지 못했습니다. 메일로 직접 연락해 주세요.' }); }
}
