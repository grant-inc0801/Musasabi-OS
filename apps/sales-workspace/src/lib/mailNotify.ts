// メール通知(SMTP・本番実装・無料枠)。
// パスワードは Secret Center(OS資格情報ストア・Rust側)にのみ保存し、
// localStorage・リポジトリ・フロントエンドへは一切出さない(存在確認のみ可能)。
// デスクトップ(Tauri)専用。未設定なら送信は一切発生しない。

export interface MailSettings {
  enabled: boolean;
  host: string;
  port: number;
  user: string;
  from: string;
  to: string;
  useTls: boolean;
}

const KEY = "musasabi.mailNotify";
const SECRET_KEY = "smtp-password";

export const DEFAULT_MAIL_SETTINGS: MailSettings = {
  enabled: false,
  host: "smtp.gmail.com",
  port: 587,
  user: "",
  from: "",
  to: "",
  useTls: true,
};

export function loadMailSettings(): MailSettings {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { ...DEFAULT_MAIL_SETTINGS };
    return { ...DEFAULT_MAIL_SETTINGS, ...(JSON.parse(raw) as Partial<MailSettings>) };
  } catch {
    return { ...DEFAULT_MAIL_SETTINGS };
  }
}

export function saveMailSettings(settings: MailSettings): void {
  localStorage.setItem(KEY, JSON.stringify(settings));
}

export function isMailSupported(): boolean {
  return typeof window !== "undefined" && "__TAURI_INTERNALS__" in window;
}

/** パスワードを Secret Center(OS資格情報ストア)へ保存する。 */
export async function setMailPassword(password: string): Promise<void> {
  const { invoke } = await import("@tauri-apps/api/core");
  await invoke("secret_set", { key: SECRET_KEY, value: password });
}

export async function hasMailPassword(): Promise<boolean> {
  if (!isMailSupported()) return false;
  try {
    const { invoke } = await import("@tauri-apps/api/core");
    return await invoke<boolean>("secret_exists", { key: SECRET_KEY });
  } catch {
    return false;
  }
}

export async function clearMailPassword(): Promise<void> {
  const { invoke } = await import("@tauri-apps/api/core");
  await invoke("secret_delete", { key: SECRET_KEY });
}

/** メールを実送信する(パスワードは Rust 側で Secret Center から読む)。 */
export async function sendMail(subject: string, body: string): Promise<void> {
  if (!isMailSupported()) throw new Error("メール送信はデスクトップ版のみ対応です");
  const s = loadMailSettings();
  if (s.host === "" || s.user === "" || s.from === "" || s.to === "") {
    throw new Error("SMTP設定(ホスト/ユーザー/from/to)が未入力です");
  }
  const { invoke } = await import("@tauri-apps/api/core");
  await invoke("send_mail", {
    host: s.host,
    port: s.port,
    user: s.user,
    from: s.from,
    to: s.to,
    subject,
    body,
    useTls: s.useTls,
    secretKey: SECRET_KEY,
  });
}

/** 通知チャネル用: 有効時のみ送信(未設定・失敗は静かにスキップ)。送れたら true。 */
export async function sendMailNotification(subject: string, body: string): Promise<boolean> {
  const s = loadMailSettings();
  if (!s.enabled || !isMailSupported()) return false;
  try {
    await sendMail(subject, body.slice(0, 2000));
    return true;
  } catch {
    return false;
  }
}
