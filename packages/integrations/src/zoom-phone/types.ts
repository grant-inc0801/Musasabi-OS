// Zoom Phone連携の型定義。Security Bible 第4章によりクレデンシャルはコミットせず、
// 環境変数から読み込む(ZoomPhoneCredentials は値そのものを保持するのみ)。

export interface ZoomPhoneCredentials {
  accountId: string;
  clientId: string;
  clientSecret: string;
}

export type ZoomCallResult =
  | "Call connected"
  | "No Answer"
  | "Busy"
  | "Voicemail"
  | "Call Failed"
  | "Missed";

export interface ZoomCallLogEntry {
  id: string;
  callerNumber: string;
  calleeNumber: string;
  direction: "inbound" | "outbound";
  durationSeconds: number;
  result: ZoomCallResult;
  /** ISO 8601 */
  dateTime: string;
}

export interface ZoomPhoneAdapter {
  listCallLogs(from: Date, to: Date): Promise<ZoomCallLogEntry[]>;
}
