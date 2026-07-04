import type { CredentialDraft, IntegrationId } from "./types";

/**
 * 認証情報「保存インターフェース」。実API接続を実装するフェーズで、OSキーチェーン等を
 * 使う RealCredentialStore に差し替える想定(Security Bible 第4章)。
 */
export interface CredentialStore {
  save(integrationId: IntegrationId, draft: CredentialDraft): void;
  get(integrationId: IntegrationId): CredentialDraft | null;
  clear(integrationId: IntegrationId): void;
}

/**
 * 現フェーズで使う唯一の実装。メモリ上にのみ保持し、ディスクやネットワークには一切
 * 書き込まない。アプリを再起動すれば内容は失われる。ユーザー指示(2026-07-04)
 * 「実APIキーやOAuthトークンは保存しない」を満たすため、ここには必ずダミー値のみを
 * 渡すこと(UI側で明示的に警告する)。
 */
export class MockCredentialStore implements CredentialStore {
  private readonly drafts = new Map<IntegrationId, CredentialDraft>();

  save(integrationId: IntegrationId, draft: CredentialDraft): void {
    this.drafts.set(integrationId, { ...draft });
  }

  get(integrationId: IntegrationId): CredentialDraft | null {
    return this.drafts.get(integrationId) ?? null;
  }

  clear(integrationId: IntegrationId): void {
    this.drafts.delete(integrationId);
  }
}
