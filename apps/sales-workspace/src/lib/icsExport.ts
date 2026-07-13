// カレンダー書き出し(.ics・本番実装・無課金)。
// エージェント定例実行スケジュールを iCalendar 形式で書き出し、
// Outlook / Google カレンダーへ取り込める(OAuth不要・完全ローカル・外部送信なし)。

import type { AgentSchedule } from "./agentSchedule";
import { nextRunMs } from "./agentSchedule";

function icsDate(ms: number): string {
  return new Date(ms).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
}

function escapeText(s: string): string {
  return s.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\n/g, "\\n");
}

function rrule(intervalMinutes: number): string {
  if (intervalMinutes <= 60) return "FREQ=HOURLY";
  if (intervalMinutes <= 1440) return "FREQ=DAILY";
  return "FREQ=WEEKLY";
}

/** 定例実行スケジュールを iCalendar(VCALENDAR)文字列へ変換する。 */
export function buildIcs(schedules: readonly AgentSchedule[], nowMs = Date.now()): string {
  const lines: string[] = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Musasabi OS//Agent Scheduler//JA",
    "CALSCALE:GREGORIAN",
  ];
  for (const s of schedules) {
    if (!s.enabled) continue;
    const start = Math.max(nextRunMs(s), nowMs);
    lines.push(
      "BEGIN:VEVENT",
      `UID:${s.id}@musasabi-os`,
      `DTSTAMP:${icsDate(nowMs)}`,
      `DTSTART:${icsDate(start)}`,
      `DTEND:${icsDate(start + 15 * 60 * 1000)}`,
      `RRULE:${rrule(s.intervalMinutes)}`,
      `SUMMARY:${escapeText(`🐿 Musasabi 定例実行: ${s.title}`)}`,
      `DESCRIPTION:${escapeText(`Musasabi OS のエージェントが自動実行します(事前承認: ${s.autoApprove ? "有効" : "無効"})。`)}`,
      "END:VEVENT",
    );
  }
  lines.push("END:VCALENDAR");
  return lines.join("\r\n") + "\r\n";
}
