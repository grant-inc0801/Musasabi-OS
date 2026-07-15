import { useMemo, useState } from "react";
import {
  NOTIFICATION_LEVEL_COLOR,
  buildNotifications,
  unreadNotifications,
} from "@musasabi/ai-company";
import { loadReadIds, saveReadIds } from "../../lib/notificationStorage";
import {
  clearAppEvents,
  loadAppEvents,
  markAllAppEventsRead,
  markAppEventRead,
  unreadAppEventCount,
  type AppEvent,
  type AppEventLevel,
} from "../../lib/appEvents";

// D-018 Notifications & Alerts: 全社の通知を一覧表示し既読管理を行う。
// 上段は実イベント(エージェント完了・承認待ち・定例実行・的中率更新などの本番データ)、
// 下段はMockのシステム通知。すべてローカル・外部送信なし。

const EVENT_LEVEL_COLOR: Record<AppEventLevel, string> = {
  info: "#22C55E",
  warn: "#F59E0B",
  error: "#EF4444",
};

const EVENT_LEVEL_JA: Record<AppEventLevel, string> = {
  info: "情報",
  warn: "要対応",
  error: "エラー",
};

export function NotificationsPage() {
  const items = useMemo(() => buildNotifications(), []);
  const [readIds, setReadIds] = useState<Set<string>>(() => loadReadIds());
  const [showRead, setShowRead] = useState(false);
  const [events, setEvents] = useState<AppEvent[]>(() => loadAppEvents());
  const [showReadEvents, setShowReadEvents] = useState(false);
  const [levelFilter, setLevelFilter] = useState<"all" | AppEventLevel>("all");

  const visible = showRead ? items : unreadNotifications(items, readIds);
  const unreadCount = unreadNotifications(items, readIds).length;
  const visibleEvents = (showReadEvents ? events : events.filter((e) => !e.read)).filter(
    (e) => levelFilter === "all" || e.level === levelFilter,
  );
  const unreadEvents = unreadAppEventCount(events);

  function markRead(id: string): void {
    const next = new Set(readIds);
    next.add(id);
    setReadIds(next);
    saveReadIds(next);
  }

  function markAllRead(): void {
    const next = new Set(items.map((i) => i.id));
    setReadIds(next);
    saveReadIds(next);
  }

  return (
    <>
      <section aria-label="実イベント">
        <div style={{ display: "flex", alignItems: "center", gap: "1rem", flexWrap: "wrap" }}>
          <h3 style={{ margin: 0 }}>
            実イベント <span className="badge" style={{ fontSize: "0.64rem" }}>実データ</span>
          </h3>
          <span className="card" style={{ padding: "0.2rem 0.7rem", fontWeight: 700 }} aria-label="実イベント未読件数">
            未読 {unreadEvents}件
          </span>
          <button type="button" onClick={() => setEvents(markAllAppEventsRead())} disabled={unreadEvents === 0}>
            すべて既読にする
          </button>
          <label style={{ display: "flex", alignItems: "center", gap: "0.35rem", fontSize: "0.85rem" }}>
            <input type="checkbox" checked={showReadEvents} onChange={(e) => setShowReadEvents(e.target.checked)} />
            既読も表示
          </label>
          <select
            aria-label="実イベントのレベルで絞り込み"
            value={levelFilter}
            onChange={(e) => setLevelFilter(e.target.value as "all" | AppEventLevel)}
          >
            <option value="all">すべてのレベル</option>
            <option value="info">情報のみ</option>
            <option value="warn">要対応のみ</option>
            <option value="error">エラーのみ</option>
          </select>
          {events.length > 0 && (
            <button
              type="button"
              onClick={() => {
                clearAppEvents();
                setEvents([]);
              }}
            >
              履歴を消去
            </button>
          )}
        </div>
        <p style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>
          エージェント完了・承認待ち・定例実行・的中率更新などの<strong>実イベント</strong>を記録します
          (OSトーストと同じ発生源・見逃してもここで追える・外部送信なし)。
        </p>
        {visibleEvents.length === 0 ? (
          <p style={{ color: "var(--text-muted)" }}>
            {events.length === 0
              ? "実イベントはまだありません。エージェント実行や定例実行で記録されます。"
              : levelFilter !== "all"
                ? "条件に合う実イベントはありません(絞り込みを解除すると表示されます)。"
                : "未読の実イベントはありません。"}
          </p>
        ) : (
          <ul style={{ listStyle: "none", paddingLeft: 0 }}>
            {visibleEvents.map((e) => (
              <li
                key={e.id}
                className="card"
                style={{ margin: "0.4rem 0", display: "flex", alignItems: "center", gap: "0.6rem", opacity: e.read ? 0.6 : 1 }}
              >
                <span
                  className="dept-lamp"
                  style={{ background: EVENT_LEVEL_COLOR[e.level], boxShadow: `0 0 6px ${EVENT_LEVEL_COLOR[e.level]}` }}
                />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700 }}>
                    [{EVENT_LEVEL_JA[e.level]}] {e.title}
                  </div>
                  <div style={{ color: "var(--text-muted)", fontSize: "0.82rem" }}>
                    {e.detail} — {new Date(e.atMs).toLocaleString("ja-JP")}
                  </div>
                </div>
                {!e.read && (
                  <button type="button" onClick={() => setEvents(markAppEventRead(e.id))}>
                    既読
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section aria-label="通知概要">
        <div style={{ display: "flex", alignItems: "center", gap: "1rem", flexWrap: "wrap" }}>
          <h3 style={{ margin: 0 }}>システム通知(Mock)</h3>
          <span
            className="card"
            style={{ padding: "0.2rem 0.7rem", fontWeight: 700 }}
            aria-label="未読件数"
          >
            未読 {unreadCount}件
          </span>
          <button type="button" onClick={markAllRead} disabled={unreadCount === 0}>
            すべて既読にする
          </button>
          <label style={{ display: "flex", alignItems: "center", gap: "0.35rem", fontSize: "0.85rem" }}>
            <input type="checkbox" checked={showRead} onChange={(e) => setShowRead(e.target.checked)} />
            既読も表示
          </label>
        </div>
        <p style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>
          承認待ち・エラー・容量注意などを一元表示します(このセクションはMock・外部送信なし)。
        </p>
      </section>

      <section aria-label="通知一覧">
        {visible.length === 0 ? (
          <p style={{ color: "var(--text-muted)" }}>
            {items.length === 0 ? "通知はありません。" : "未読の通知はありません。"}
          </p>
        ) : (
          <ul style={{ listStyle: "none", paddingLeft: 0 }}>
            {visible.map((n) => {
              const isRead = readIds.has(n.id);
              return (
                <li
                  key={n.id}
                  className="card"
                  style={{
                    margin: "0.4rem 0",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.6rem",
                    opacity: isRead ? 0.6 : 1,
                  }}
                >
                  <span
                    className="dept-lamp"
                    style={{
                      background: NOTIFICATION_LEVEL_COLOR[n.level],
                      boxShadow: `0 0 6px ${NOTIFICATION_LEVEL_COLOR[n.level]}`,
                    }}
                  />
                  <span aria-hidden="true">{n.icon}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700 }}>
                      [{n.level}] {n.title}
                    </div>
                    <div style={{ color: "var(--text-muted)", fontSize: "0.82rem" }}>{n.detail}</div>
                  </div>
                  {!isRead && (
                    <button type="button" onClick={() => markRead(n.id)}>
                      既読
                    </button>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </>
  );
}
