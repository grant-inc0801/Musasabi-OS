import { useEffect, useState } from "react";
import { buildAssistantSummaryJa } from "@musasabi/ai-company";
import type { CommandDepartment } from "@musasabi/ai-company";
import mascot from "../../assets/mascot.png";

// 右下アバター+吹き出し(D-20260706-007)。可愛い3D風ムササビ(公式イメージの
// 静止画プレースホルダー)。吹き出しで承認待ち・エラー原因・解決策・全体進行を要約。
// 詳細パネル表示中は操作を妨げないよう吹き出しを自動的に閉じる(アバタークリックで再表示)。

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
  return (
    <div className="assistant-avatar" aria-label="Musasabiアシスタント">
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
        onClick={() => setOpen((v) => !v)}
        title="クリックで状況サマリーを表示"
      />
    </div>
  );
}
