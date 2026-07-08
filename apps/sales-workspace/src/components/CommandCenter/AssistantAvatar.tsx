import { useEffect, useMemo, useState } from "react";
import { buildAssistantSummaryJa } from "@musasabi/ai-company";
import type { CommandDepartment } from "@musasabi/ai-company";
import { deriveEmotionFromSignals, emotionMotionMap } from "@musasabi/avatar-2d";
import mascot from "../../assets/mascot.png";

// 右下アバター+吹き出し(D-20260706-007)。可愛い3D風ムササビ(公式イメージの
// 静止画プレースホルダー)。吹き出しで承認待ち・エラー原因・解決策・全体進行を要約。
// 詳細パネル表示中は操作を妨げないよう吹き出しを自動的に閉じる(アバタークリックで再表示)。
// AV-MOTION-001(#272): 部署状態から感情を導出し、常駐アバターのモーションへ反映する。

export function AssistantAvatar({
  departments,
  detailOpen = false,
}: {
  departments: readonly CommandDepartment[];
  detailOpen?: boolean;
}) {
  const [open, setOpen] = useState(true);

  useEffect(() => {
    if (detailOpen) {
      setOpen(false);
    }
  }, [detailOpen]);
  const summary = buildAssistantSummaryJa(departments);

  // 部署状態 → 感情モーション(エラー>承認待ち>作業中>全完了>待機)。
  const motion = useMemo(() => {
    const emotion = deriveEmotionFromSignals({
      hasError: departments.some((d) => d.status === "error"),
      hasApproval: departments.some((d) => d.status === "waiting_approval"),
      hasWorking: departments.some((d) => d.status === "working"),
      allDone: departments.length > 0 && departments.every((d) => d.status === "done"),
    });
    return emotionMotionMap[emotion];
  }, [departments]);

  return (
    <div className="assistant-avatar" aria-label="Musasabiアシスタント" data-emotion={motion.expression}>
      {open && (
        <div className="assistant-bubble" onClick={() => setOpen(false)} title="クリックで閉じる">
          {summary.split("\n").map((line, i) => (
            <p key={i} style={{ margin: i === 0 ? 0 : "0.3rem 0 0" }}>
              {line}
            </p>
          ))}
        </div>
      )}
      <img
        src={mascot}
        alt="Musasabiアシスタント"
        className="assistant-mascot"
        data-motion={motion.motion}
        onClick={() => setOpen((v) => !v)}
        title="クリックで状況サマリーを表示"
      />
    </div>
  );
}
