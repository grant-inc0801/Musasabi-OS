// アプリ実イベントストア(本番・完全ローカル)。
// エージェント完了・承認待ち・定例実行・的中率更新などの実イベントを localStorage へ
// 記録し、通知センターで一覧・既読管理する。OSトースト(osNotify)と同じ発生源から
// 記録されるため、トーストを見逃してもここで追える。外部送信なし。

export type AppEventLevel = "info" | "warn" | "error";

export interface AppEvent {
  id: string;
  level: AppEventLevel;
  title: string;
  detail: string;
  atMs: number;
  read: boolean;
}

const KEY = "musasabi.appEvents";
/** 保持する実イベントの上限(古いものから破棄)。 */
const MAX_EVENTS = 100;

export function loadAppEvents(): AppEvent[] {
  try {
    const raw = localStorage.getItem(KEY);
    const parsed = raw ? (JSON.parse(raw) as AppEvent[]) : [];
    return Array.isArray(parsed) ? parsed.filter((e) => e && typeof e.id === "string") : [];
  } catch {
    return [];
  }
}

function save(events: readonly AppEvent[]): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(events.slice(0, MAX_EVENTS)));
  } catch {
    /* 容量超過等は通知記録をあきらめる(業務を止めない) */
  }
}

/** 実イベントを記録する(新しい順)。 */
export function pushAppEvent(input: {
  level?: AppEventLevel;
  title: string;
  detail: string;
}): AppEvent {
  const event: AppEvent = {
    id: `ev-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    level: input.level ?? "info",
    title: input.title.slice(0, 120),
    detail: input.detail.slice(0, 300),
    atMs: Date.now(),
    read: false,
  };
  save([event, ...loadAppEvents()]);
  return event;
}

export function markAppEventRead(id: string): AppEvent[] {
  const next = loadAppEvents().map((e) => (e.id === id ? { ...e, read: true } : e));
  save(next);
  return next;
}

export function markAllAppEventsRead(): AppEvent[] {
  const next = loadAppEvents().map((e) => (e.read ? e : { ...e, read: true }));
  save(next);
  return next;
}

export function clearAppEvents(): void {
  save([]);
}

export function unreadAppEventCount(events = loadAppEvents()): number {
  return events.filter((e) => !e.read).length;
}
