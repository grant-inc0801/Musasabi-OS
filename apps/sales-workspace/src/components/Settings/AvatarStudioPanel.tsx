import { useEffect, useRef, useState } from "react";
import { VRM_EXPRESSION_PRESETS } from "@musasabi/avatar-3d";
import type { VrmExpressionPreset } from "@musasabi/avatar-3d";
import type { ThreeVrmRenderer } from "../../avatar3d/ThreeVrmRenderer";
import {
  DEFAULT_AVATAR_APPEARANCE,
  loadAvatarAppearance,
  notifyVrmUpdated,
  saveAvatarAppearance,
} from "../../lib/avatarAppearance";
import type { AvatarAppearance } from "../../lib/avatarAppearance";
import { loadVrmBlob, saveVrmBlob } from "../../lib/vrmStore";
import { recordMemory } from "../../lib/memoryStorage";

// アバター作成(設定画面)。3Dプレビューでカラー調整・感情モーション確認・
// VRM取り込みができ、「保存して反映」で右下の常駐アバターへ反映される。
// VRM/設定はこの端末内のみに保存(外部送信なし)。

const EXPRESSION_LABEL_JA: Record<VrmExpressionPreset, string> = {
  neutral: "通常",
  happy: "喜び",
  angry: "怒り",
  sad: "悲しみ",
  relaxed: "リラックス",
  surprised: "驚き",
};

const PREVIEW_SIZE = 220;

export function AvatarStudioPanel() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rendererRef = useRef<ThreeVrmRenderer | null>(null);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [appearance, setAppearance] = useState<AvatarAppearance>(() => loadAvatarAppearance());
  const [expression, setExpression] = useState<VrmExpressionPreset>("neutral");
  const [vrmFile, setVrmFile] = useState<File | null>(null);
  const [vrmLoadedName, setVrmLoadedName] = useState<string | null>(null);
  const [savedNote, setSavedNote] = useState<string | null>(null);

  // 3Dプレビューの初期化(待機モーションつきレンダーループ)。
  useEffect(() => {
    let disposed = false;
    let raf = 0;
    let renderer: ThreeVrmRenderer | null = null;
    (async () => {
      try {
        const [{ ThreeVrmRenderer }, { computeIdleMotion }] = await Promise.all([
          import("../../avatar3d/ThreeVrmRenderer"),
          import("@musasabi/avatar-3d"),
        ]);
        if (disposed || !canvasRef.current) return;
        renderer = new ThreeVrmRenderer(canvasRef.current);
        renderer.resize(PREVIEW_SIZE);
        renderer.setAppearance(loadAvatarAppearance());
        rendererRef.current = renderer;
        // 保存済みVRMがあればプレビューにも読み込む
        const blob = await loadVrmBlob();
        if (blob && !disposed) {
          const url = URL.createObjectURL(blob);
          await renderer.loadModel(url).catch(() => undefined);
          URL.revokeObjectURL(url);
          if (renderer.hasVrm) setVrmLoadedName("(保存済みVRM)");
        }
        const loop = (t: number) => {
          if (disposed || !renderer) return;
          renderer.applyIdleMotion(computeIdleMotion(t));
          renderer.renderFrame(t);
          raf = requestAnimationFrame(loop);
        };
        raf = requestAnimationFrame(loop);
        setReady(true);
      } catch (e) {
        setError(`3Dプレビューを利用できません: ${String(e)}`);
      }
    })();
    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      renderer?.dispose();
      rendererRef.current = null;
    };
  }, []);

  function updateColor<K extends keyof AvatarAppearance>(key: K, value: string): void {
    const next = { ...appearance, [key]: value };
    setAppearance(next);
    rendererRef.current?.setAppearance(next);
    setSavedNote(null);
  }

  function handleExpression(preset: VrmExpressionPreset): void {
    setExpression(preset);
    rendererRef.current?.setExpression(preset, 1);
  }

  function handleVrmSelect(file: File): void {
    setVrmFile(file);
    setSavedNote(null);
    const url = URL.createObjectURL(file);
    rendererRef.current
      ?.loadModel(url)
      .then(() => setVrmLoadedName(file.name))
      .catch((e) => setError(`VRMの読み込みに失敗しました: ${String(e)}`))
      .finally(() => URL.revokeObjectURL(url));
  }

  async function handleSave(): Promise<void> {
    saveAvatarAppearance(appearance);
    if (vrmFile) {
      try {
        await saveVrmBlob(vrmFile);
      } catch (e) {
        setError(`VRMの保存に失敗しました: ${String(e)}`);
        return;
      }
    }
    notifyVrmUpdated(); // 常駐ウィンドウへ storage イベントで反映を通知
    setSavedNote("保存しました。右下の常駐アバターへ反映されます。");
    recordMemory({
      category: "user",
      actor: "user",
      action: "アバターを保存",
      detail: vrmFile ? `VRM: ${vrmFile.name}` : "カラー設定のみ",
      tags: ["avatar", "settings"],
    });
  }

  function handleReset(): void {
    setAppearance({ ...DEFAULT_AVATAR_APPEARANCE });
    rendererRef.current?.setAppearance(DEFAULT_AVATAR_APPEARANCE);
    setSavedNote(null);
  }

  return (
    <section aria-label="アバター作成" style={{ marginBottom: "1.5rem" }}>
      <h3>アバター作成</h3>
      <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", maxWidth: "44rem" }}>
        カラーを調整し、感情モーションをプレビューで確認できます。VRoid Studio 製の
        VRM も取り込めます。「保存して反映」で右下の常駐アバターへ反映されます
        (保存はこの端末内のみ・外部送信なし)。
      </p>
      {error && <p style={{ color: "var(--danger)" }}>{error}</p>}

      <div style={{ display: "flex", gap: "1.5rem", flexWrap: "wrap" }}>
        <div>
          <canvas
            ref={canvasRef}
            width={PREVIEW_SIZE}
            height={PREVIEW_SIZE}
            style={{
              width: PREVIEW_SIZE,
              height: PREVIEW_SIZE,
              borderRadius: 12,
              border: "1px solid var(--border)",
              background: "linear-gradient(180deg, rgba(255,255,255,0.35), rgba(180,186,196,0.35))",
            }}
          />
          <div style={{ marginTop: "0.5rem", display: "flex", gap: "0.35rem", flexWrap: "wrap" }}>
            {VRM_EXPRESSION_PRESETS.map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => handleExpression(preset)}
                disabled={!ready}
                className={expression === preset ? "active" : undefined}
                style={{ fontSize: "0.8rem", padding: "0.25rem 0.6rem" }}
              >
                {EXPRESSION_LABEL_JA[preset]}
              </button>
            ))}
          </div>
        </div>

        <div style={{ minWidth: "16rem" }}>
          {(
            [
              ["bodyColor", "体色"],
              ["bellyColor", "お腹の色"],
              ["eyeColor", "目・鼻の色"],
            ] as Array<[keyof AvatarAppearance, string]>
          ).map(([key, label]) => (
            <div key={key} style={{ marginBottom: "0.6rem" }}>
              <label style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                <input
                  type="color"
                  value={appearance[key]}
                  onChange={(e) => updateColor(key, e.target.value)}
                  style={{ width: "3rem", height: "2rem", padding: 0 }}
                />
                {label}
                <span style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>{appearance[key]}</span>
              </label>
            </div>
          ))}
          <p style={{ color: "var(--text-muted)", fontSize: "0.8rem", maxWidth: "22rem" }}>
            カラーは標準の3Dムササビに適用されます(VRM取り込み時はVRM側の見た目を優先)。
          </p>

          <div style={{ margin: "0.75rem 0" }}>
            <label className="footer-btn">
              VRMアバターを取り込む(VRoid)
              <br />
              <input
                type="file"
                accept=".vrm"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) handleVrmSelect(f);
                }}
              />
            </label>
            {vrmLoadedName && (
              <p style={{ color: "var(--ok)", fontSize: "0.85rem", margin: "0.25rem 0 0" }}>
                プレビュー中のVRM: {vrmLoadedName}
              </p>
            )}
          </div>

          <button type="button" onClick={() => void handleSave()} disabled={!ready && !vrmFile}>
            保存して反映
          </button>{" "}
          <button type="button" onClick={handleReset}>
            既定のカラーに戻す
          </button>
          {savedNote && <p style={{ color: "var(--ok)", margin: "0.5rem 0 0" }}>{savedNote}</p>}
        </div>
      </div>
    </section>
  );
}
