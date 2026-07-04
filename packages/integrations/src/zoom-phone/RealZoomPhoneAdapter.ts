import type { ZoomCallLogEntry, ZoomCallResult, ZoomPhoneAdapter, ZoomPhoneCredentials } from "./types";

interface ZoomApiCallLog {
  id: string;
  caller_number: string;
  callee_number: string;
  direction: "inbound" | "outbound";
  duration: number;
  result: ZoomCallResult;
  date_time: string;
}

function toCallLogEntry(raw: ZoomApiCallLog): ZoomCallLogEntry {
  return {
    id: raw.id,
    callerNumber: raw.caller_number,
    calleeNumber: raw.callee_number,
    direction: raw.direction,
    durationSeconds: raw.duration,
    result: raw.result,
    dateTime: raw.date_time,
  };
}

const TOKEN_URL = "https://zoom.us/oauth/token";
const API_BASE_URL = "https://api.zoom.us/v2";
const TOKEN_EXPIRY_MARGIN_SECONDS = 60;

/**
 * Zoom Phone(Server-to-Server OAuth)向けHTTPクライアント。
 * クレデンシャルは呼び出し側が環境変数等から読み込んで渡す。
 * 実サーバーへの接続はクレデンシャルが無いこの開発環境では検証できていない
 * (docs/ARCHITECTURE.md Phase 5)。
 */
export class RealZoomPhoneAdapter implements ZoomPhoneAdapter {
  private accessToken: string | null = null;
  private tokenExpiresAtMs = 0;

  constructor(private readonly credentials: ZoomPhoneCredentials) {}

  private async getAccessToken(): Promise<string> {
    if (this.accessToken && Date.now() < this.tokenExpiresAtMs) {
      return this.accessToken;
    }

    const basicAuth = Buffer.from(`${this.credentials.clientId}:${this.credentials.clientSecret}`).toString(
      "base64",
    );
    const params = new URLSearchParams({
      grant_type: "account_credentials",
      account_id: this.credentials.accountId,
    });
    const res = await fetch(`${TOKEN_URL}?${params.toString()}`, {
      method: "POST",
      headers: { Authorization: `Basic ${basicAuth}` },
    });
    if (!res.ok) {
      throw new Error(`Zoom OAuth token request failed: HTTP ${res.status}`);
    }
    const body = (await res.json()) as { access_token: string; expires_in: number };
    this.accessToken = body.access_token;
    this.tokenExpiresAtMs = Date.now() + (body.expires_in - TOKEN_EXPIRY_MARGIN_SECONDS) * 1000;
    return this.accessToken;
  }

  async listCallLogs(from: Date, to: Date): Promise<ZoomCallLogEntry[]> {
    const token = await this.getAccessToken();
    const params = new URLSearchParams({
      from: from.toISOString().slice(0, 10),
      to: to.toISOString().slice(0, 10),
      page_size: "100",
    });
    const res = await fetch(`${API_BASE_URL}/phone/call_logs?${params.toString()}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) {
      throw new Error(`Zoom call_logs request failed: HTTP ${res.status}`);
    }
    const body = (await res.json()) as { call_logs: ZoomApiCallLog[] };
    return body.call_logs.map(toCallLogEntry);
  }
}
