import type {
  FileMakerAdapter,
  FileMakerCredentials,
  FileMakerFieldData,
  FileMakerFindQuery,
  FileMakerRecord,
} from "./types";

interface FileMakerApiRecord {
  recordId: string;
  modId: string;
  fieldData: FileMakerFieldData;
}

function toRecord(raw: FileMakerApiRecord): FileMakerRecord {
  return { recordId: raw.recordId, modId: raw.modId, fieldData: raw.fieldData };
}

/**
 * FileMaker Data API v1 準拠のHTTPクライアント。
 * クレデンシャルは呼び出し側が環境変数等から読み込んで渡す(このクラス内でハードコードしない)。
 * 実サーバーへの接続はクレデンシャルが無いこの開発環境では検証できていない
 * (docs/ARCHITECTURE.md Phase 4)。
 */
export class RealFileMakerDataApiAdapter implements FileMakerAdapter {
  private token: string | null = null;

  constructor(private readonly credentials: FileMakerCredentials) {}

  private get baseUrl(): string {
    return `${this.credentials.host}/fmi/data/v1/databases/${encodeURIComponent(this.credentials.database)}`;
  }

  private async login(): Promise<string> {
    const basicAuth = Buffer.from(`${this.credentials.username}:${this.credentials.password}`).toString(
      "base64",
    );
    const res = await fetch(`${this.baseUrl}/sessions`, {
      method: "POST",
      headers: {
        Authorization: `Basic ${basicAuth}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({}),
    });
    if (!res.ok) {
      throw new Error(`FileMaker login failed: HTTP ${res.status}`);
    }
    const body = (await res.json()) as { response: { token: string } };
    this.token = body.response.token;
    return this.token;
  }

  private async request<T>(path: string, init: RequestInit, retryOn401 = true): Promise<T> {
    const token = this.token ?? (await this.login());
    const res = await fetch(`${this.baseUrl}${path}`, {
      ...init,
      headers: {
        ...init.headers,
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (res.status === 401 && retryOn401) {
      this.token = null;
      return this.request<T>(path, init, false);
    }
    if (!res.ok) {
      throw new Error(`FileMaker Data API request failed: HTTP ${res.status} ${path}`);
    }
    return (await res.json()) as T;
  }

  async find(request: FileMakerFindQuery): Promise<FileMakerRecord[]> {
    const body = (await this.request<{ response: { data: FileMakerApiRecord[] } }>(
      `/layouts/${encodeURIComponent(request.layout)}/_find`,
      { method: "POST", body: JSON.stringify({ query: request.query }) },
    ));
    return body.response.data.map(toRecord);
  }

  async create(layout: string, fieldData: FileMakerFieldData): Promise<FileMakerRecord> {
    const body = await this.request<{ response: { recordId: string; modId: string } }>(
      `/layouts/${encodeURIComponent(layout)}/records`,
      { method: "POST", body: JSON.stringify({ fieldData }) },
    );
    return { recordId: body.response.recordId, modId: body.response.modId, fieldData };
  }

  /**
   * FileMaker Serverのセッションを解放する。呼び出し側は使い終わったら必ず呼ぶこと。
   * セッションを解放しないまま長時間稼働するプロセスがアダプタを作り続けると、
   * FileMaker Server側の同時セッション数上限に達し、以降のログインが失敗する。
   */
  async close(): Promise<void> {
    if (!this.token) {
      return;
    }
    const token = this.token;
    this.token = null;
    await fetch(`${this.baseUrl}/sessions/${encodeURIComponent(token)}`, { method: "DELETE" });
  }

  async update(layout: string, recordId: string, fieldData: FileMakerFieldData): Promise<void> {
    await this.request(
      `/layouts/${encodeURIComponent(layout)}/records/${encodeURIComponent(recordId)}`,
      { method: "PATCH", body: JSON.stringify({ fieldData }) },
    );
  }
}
