// マルチエージェント協調(部署AI会議・本番実装・無課金)。
// 部署ごとに別人格(システムプロンプト)を持つエージェントが同じ議題について
// 順番に発言し、互いの発言を踏まえて議論した後、司会(AI CEO)が結論をまとめる。
// 頭脳は LlmProvider(ローカルLLM or ルールベース)を共有(すべて端末内・外部送信なし)。

import type { LlmMessage, LlmProvider } from "./llm";

export interface DiscussionPersona {
  id: string;
  /** 表示名(例: 営業部長AI)。 */
  name: string;
  /** 人格・観点(システムプロンプトに使用)。 */
  stance: string;
}

export interface DiscussionTurn {
  round: number;
  personaId: string;
  personaName: string;
  content: string;
}

export interface DiscussionResult {
  topic: string;
  turns: DiscussionTurn[];
  conclusion: string;
  brainName: string;
}

/** 既定の会議メンバー(部署代表AI)。 */
export function defaultPersonas(): DiscussionPersona[] {
  return [
    { id: "sales", name: "営業部長AI", stance: "顧客の反応と売上への影響を最優先で考える。具体的な顧客像と価格感を必ず述べる。" },
    { id: "research", name: "市場調査部長AI", stance: "データとリスクの観点で冷静に評価する。競合状況と根拠のない楽観を指摘する。" },
    { id: "marketing", name: "マーケティング部長AI", stance: "訴求メッセージとチャネル戦略を考える。誰にどう届けるかを必ず提案する。" },
  ];
}

function transcriptText(turns: readonly DiscussionTurn[]): string {
  return turns.map((t) => `${t.personaName}: ${t.content}`).join("\n");
}

/**
 * 部署AI会議を実行する。各ラウンドで全員が(それまでの発言を踏まえて)発言し、
 * 最後に司会(AI CEO)が結論をまとめる。
 */
export async function runDiscussion(
  provider: LlmProvider,
  topic: string,
  personas: readonly DiscussionPersona[] = defaultPersonas(),
  rounds = 2,
): Promise<DiscussionResult> {
  const turns: DiscussionTurn[] = [];
  for (let round = 1; round <= rounds; round++) {
    for (const persona of personas) {
      const prior = transcriptText(turns);
      const messages: LlmMessage[] = [
        {
          role: "system",
          content:
            `あなたは Musasabi OS の「${persona.name}」です。${persona.stance}\n` +
            "発言は2〜3文の簡潔な日本語。他メンバーの発言に言及してよい。",
        },
        {
          role: "user",
          content:
            `[DISCUSS] 議題: ${topic}\n` +
            (prior === "" ? "あなたが最初の発言者です。" : `これまでの発言:\n${prior}\n`) +
            `第${round}ラウンドの発言をしてください。`,
        },
      ];
      const content = await provider.chat(messages);
      turns.push({ round, personaId: persona.id, personaName: persona.name, content });
    }
  }
  const conclusion = await provider.chat([
    {
      role: "system",
      content: "あなたは Musasabi OS の AI CEO(司会)です。会議の結論を簡潔にまとめます。",
    },
    {
      role: "user",
      content: `[CONCLUDE] 議題: ${topic}\n発言記録:\n${transcriptText(turns)}\n結論(決定事項・次のアクション)を3行以内でまとめてください。`,
    },
  ]);
  return { topic, turns, conclusion, brainName: provider.name };
}
