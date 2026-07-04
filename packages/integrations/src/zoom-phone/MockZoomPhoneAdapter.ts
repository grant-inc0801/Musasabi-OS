import type { ZoomCallLogEntry, ZoomPhoneAdapter } from "./types";

/**
 * インメモリのZoom Phoneアダプタ実装。実サーバーが無い開発・テスト環境で
 * ZoomPhoneAdapter インターフェースの契約を検証するために使う。
 */
export class MockZoomPhoneAdapter implements ZoomPhoneAdapter {
  private logs: ZoomCallLogEntry[] = [];

  seed(entries: ZoomCallLogEntry[]): void {
    this.logs.push(...entries);
  }

  async listCallLogs(from: Date, to: Date): Promise<ZoomCallLogEntry[]> {
    const fromMs = from.getTime();
    const toMs = to.getTime();
    return this.logs.filter((entry) => {
      const t = new Date(entry.dateTime).getTime();
      return t >= fromMs && t <= toMs;
    });
  }
}
