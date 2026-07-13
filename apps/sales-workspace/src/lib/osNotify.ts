// OSトースト通知(本番実装・無課金・外部送信なし)。
// デスクトップ(Tauri)では Windows 通知センターへ、ブラウザでは Web Notification API へ表示。
// エージェント完了・承認待ちなど、アプリを見ていなくても気づけるようにする。
// 権限が無い/拒否された場合は静かに何もしない(業務を止めない)。

import { appLogger } from "./appLogger";

export async function notifyOs(title: string, body: string): Promise<boolean> {
  try {
    if (typeof window !== "undefined" && "__TAURI_INTERNALS__" in window) {
      const { isPermissionGranted, requestPermission, sendNotification } = await import(
        "@tauri-apps/plugin-notification"
      );
      let granted = await isPermissionGranted();
      if (!granted) {
        granted = (await requestPermission()) === "granted";
      }
      if (!granted) return false;
      sendNotification({ title, body: body.slice(0, 200) });
      return true;
    }
    if (typeof Notification !== "undefined") {
      if (Notification.permission === "default") {
        await Notification.requestPermission();
      }
      if (Notification.permission !== "granted") return false;
      new Notification(title, { body: body.slice(0, 200) });
      return true;
    }
    return false;
  } catch (e) {
    appLogger.warn("os notification failed", { error: String(e) });
    return false;
  }
}
