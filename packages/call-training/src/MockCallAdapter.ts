import type { TestCallTurn } from "./types";

// Mock Call Adapter(Directive D-20260705-003)。
// 実際の外部架電は行わず、決定論的なルールベースでAIの応答を生成する。
// 実架電API接続は Pending。CallAdapter インターフェースにより将来差し替え可能にする。

/** テスト架電のAI応答を生成するアダプタ。実装は Mock のみ(実架電はしない)。 */
export interface CallAdapter {
  /** 架電開始時のAIの最初の発話を返す。 */
  startCall(contact: string): TestCallTurn;
  /** 人間(顧客役)の発話に対するAIの応答を返す。 */
  respond(humanText: string, timestampMs: number): TestCallTurn;
}

/**
 * 決定論的なルールベースの Mock 架電アダプタ。LLM も外部APIも使わない。
 * キーワードに応じて切り返しトークを返す(テストモードのロールプレイ用)。
 */
export class MockCallAdapter implements CallAdapter {
  startCall(contact: string): TestCallTurn {
    return {
      speaker: "ai",
      text: `お世話になっております。Musasabi OSのご案内でお電話いたしました。${contact}様、少しだけお時間よろしいでしょうか。`,
      timestampMs: 0,
    };
  }

  respond(humanText: string, timestampMs: number): TestCallTurn {
    return {
      speaker: "ai",
      text: this.composeReply(humanText),
      timestampMs,
    };
  }

  /** 顧客役の発話から切り返しトークを決定論的に選ぶ。 */
  private composeReply(humanText: string): string {
    if (/高い|予算|コスト|費用/.test(humanText)) {
      return "ご予算のご懸念、承知いたしました。費用対効果の面で、導入後に工数削減できた事例をご紹介させてください。";
    }
    if (/興味|検討|いいですね|良さそう/.test(humanText)) {
      return "ありがとうございます。ぜひ具体的な活用イメージを、御社の状況に合わせてご提案させてください。";
    }
    if (/忙しい|時間|今は|あとで/.test(humanText)) {
      return "お忙しいところ恐れ入ります。3分ほどで要点だけお伝えできますので、改めてご都合の良いお時間を伺えますか。";
    }
    return "ありがとうございます。もう少し詳しくお聞かせいただけますか。御社の課題に合わせてご案内いたします。";
  }
}
