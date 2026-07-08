import { useMemo, useState } from "react";
import {
  NOTIFICATION_LEVEL_COLOR,
  buildNotifications,
  unreadNotifications,
} from "@musasabi/ai-company";
import { loadReadIds, saveReadIds } from "../../lib/notificationStorage";

// D-018 Notifications & Alerts: 全社の通知(承認待ち・エラー・注意)を一覧表示し、
// 既読管理を行う。既読は localStorage に永続化(すべてローカル・外部送信なし)。

export function NotificationsPage() {
  const items = useMemo(() => buildNotifications(), []);
  const [readIds, setReadIds] = useState<Set<string>>(() => loadReadIds());
  const [showRead, setShowRead] = useState(false);

  const visible = showRead ? items : unreadNotifications(items, readIds);
  const unreadCount = unreadNotifications(items, readIds).length;

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
      <section aria-label="通知概要">
        <div style={{ display: "flex", alignItems: "center", gap: "1rem", flexWrap: "wrap" }}>
          <h3 style={{ margin: 0 }}>通知センター(Notifications & Alerts)</h3>
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
          承認待ち・エラー・容量注意などを一元表示します(すべてMock・外部送信なし)。
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
