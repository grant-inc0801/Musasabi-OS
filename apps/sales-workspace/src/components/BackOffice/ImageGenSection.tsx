import { useEffect, useState } from "react";
import { detectImageGen, generateImage, type GeneratedImage } from "../../lib/imageGen";
import { saveBinaryFile } from "../../lib/saveFile";
import { recordMemory } from "../../lib/memoryStorage";

// マーケティング部: 画像素材生成(ローカルStable Diffusion・本番)。
// AUTOMATIC1111 系 WebUI(http://127.0.0.1:7860)を自動検出。未検出時は導入案内のみ。
// 生成はすべて端末内(GPU性能依存)・無料・外部送信なし。

export function ImageGenSection() {
  const [available, setAvailable] = useState<boolean | null>(null);
  const [prompt, setPrompt] = useState("");
  const [image, setImage] = useState<GeneratedImage | null>(null);
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState<string | null>(null);

  useEffect(() => {
    void detectImageGen().then(setAvailable);
  }, []);

  async function handleGenerate(): Promise<void> {
    const p = prompt.trim();
    if (p === "" || busy) return;
    setBusy(true);
    setNote(null);
    setImage(null);
    try {
      const result = await generateImage(p);
      setImage(result);
      recordMemory({
        category: "work",
        actor: "マーケティング部",
        action: "画像素材をローカル生成",
        detail: p.slice(0, 120),
        tags: ["image-gen"],
      });
    } catch (e) {
      setNote(`生成に失敗しました: ${String(e)}`);
    } finally {
      setBusy(false);
    }
  }

  function base64ToBytes(b64: string): Uint8Array {
    const bin = atob(b64);
    const bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    return bytes;
  }

  return (
    <section aria-label="画像素材生成">
      <h3>画像素材生成(ローカルStable Diffusion・本番)</h3>
      {available === true ? (
        <>
          <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", maxWidth: "50rem" }}>
            ローカルの Stable Diffusion(検出済み ✅)で投稿・バナー素材を実生成します
            (無料・端末内処理・外部送信なし。生成時間はGPU性能に依存)。
          </p>
          <div style={{ display: "flex", gap: "0.5rem", maxWidth: "44rem" }}>
            <input
              aria-label="画像プロンプト"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="例: modern minimal banner, blue gradient, squirrel mascot"
              style={{ flex: 1, fontSize: "0.8rem", background: "var(--bg-card)", color: "var(--text)", border: "1px solid var(--border)", borderRadius: 8, padding: "0.4rem 0.6rem" }}
            />
            <button type="button" onClick={() => void handleGenerate()} disabled={busy}>
              {busy ? "生成中…(GPU性能依存)" : "🎨 生成"}
            </button>
          </div>
          {image && (
            <div className="card" style={{ marginTop: "0.5rem", maxWidth: "34rem" }}>
              <img
                src={`data:image/png;base64,${image.base64}`}
                alt="生成画像"
                style={{ maxWidth: "100%", borderRadius: 8 }}
              />
              <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", marginTop: "0.3rem" }}>
                生成時間 {(image.elapsedMs / 1000).toFixed(1)}秒(Company Brain に記録済み)
              </div>
              <button
                type="button"
                style={{ marginTop: "0.35rem" }}
                onClick={() => void saveBinaryFile(
                  `marketing-image-${Date.now()}.png`,
                  base64ToBytes(image.base64),
                  "PNG",
                  ["png"],
                )}
              >
                📄 PNG をファイル保存
              </button>
            </div>
          )}
          {note && <p style={{ color: "#EF4444", fontSize: "0.8rem", marginTop: "0.4rem" }}>{note}</p>}
        </>
      ) : (
        <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", maxWidth: "50rem" }}>
          ローカル画像生成は未検出です。Stable Diffusion WebUI(AUTOMATIC1111・無料)を
          `--api` オプションつきで起動すると自動で有効になります(http://127.0.0.1:7860)。
          GPU がある PC で利用できます。
        </p>
      )}
    </section>
  );
}
