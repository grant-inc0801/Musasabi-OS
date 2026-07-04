import type { ConfidenceLevel, Lead, RecommendedAction } from "./types";

function confidenceFromScore(score: number): ConfidenceLevel {
  if (score >= 70) return "high";
  if (score >= 40) return "medium";
  return "low";
}

function isCallbackDue(lead: Lead, now: Date): boolean {
  return Boolean(lead.nextCallbackAt) && new Date(lead.nextCallbackAt as string).getTime() <= now.getTime();
}

/**
 * AI Employee Bible 第6章: 推奨アクションと自信度。ルールベースの決定的ロジックのみを用い、
 * LLM推論は行わない(Development Bible: Deterministic behavior before LLM behavior)。
 * negotiating は Sales Playbook のエスカレーションルール(値引き承認)に合わせ、
 * 上位者確認を推奨する。
 */
export function recommendActions(leads: Lead[], now: Date = new Date()): RecommendedAction[] {
  const actions: RecommendedAction[] = [];

  for (const lead of leads) {
    switch (lead.status) {
      case "new":
        actions.push({
          leadId: lead.id,
          action: "初回架電を行う",
          confidence: confidenceFromScore(lead.priorityScore),
          reason: "未接触のリードのため初回コンタクトを推奨",
        });
        break;
      case "callback":
        if (isCallbackDue(lead, now)) {
          actions.push({
            leadId: lead.id,
            action: "コールバックを実施する",
            confidence: "high",
            reason: "コールバック予定時刻が到来",
          });
        }
        break;
      case "contacted":
        actions.push({
          leadId: lead.id,
          action: "フォローアップの連絡を行う",
          confidence: "medium",
          reason: "接触済みだが次のアクションが未実施",
        });
        break;
      case "interested":
        actions.push({
          leadId: lead.id,
          action: "資料送付とフォローアップ",
          confidence: "medium",
          reason: "興味を示しているため関心の維持が必要",
        });
        break;
      case "negotiating":
        actions.push({
          leadId: lead.id,
          action: "条件を確認のうえ上位者に承認を仰ぐ",
          confidence: "medium",
          reason: "交渉中の条件確定にはPlaybook上、上位者承認が必要",
        });
        break;
      case "appointment":
        actions.push({
          leadId: lead.id,
          action: "アポイントメント準備を行う",
          confidence: "high",
          reason: "アポイントメント確定済み",
        });
        break;
      case "lost":
        break;
      default: {
        // LeadStatus に新しい値を追加した際、このswitchの更新漏れをコンパイルエラーで検出する。
        const exhaustiveCheck: never = lead.status;
        void exhaustiveCheck;
      }
    }
  }

  return actions;
}
