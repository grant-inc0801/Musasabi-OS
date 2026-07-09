import { useState } from "react";
import {
  MONO_EYE_STATES,
  MOTION_CATALOG,
  MODEL_SPEC,
  COLOR_PALETTE,
  TRIPO_FLOW,
  LIGHT_ANIMATION_LABEL_JA,
  controlsForEmotion,
  emotionStatePayload,
  buildTripoPrompt,
  buildTripoRequest,
  summarizeAndroidSpecJa,
  type AndroidEmotion,
} from "@musasabi/avatar-android";

// Musasabi OS アバター制作 指示書(完全版)。
// Musasabi Android のモノアイ発光カラー・制御パラメータ・モーション・3Dモデル仕様・
// カラーパレット・Tripo3D 連携フロー(Mock)を可視化する。
// 実モデル生成(Tripo3D API)は APIキー+人間承認が必要なため未実行(決定論プロンプト/テンプレートのみ)。

function MonoEyeVisor({ color, light }: { color: string; light: string }) {
  const anim =
    light === "scan"
      ? "android-eye-scan 1.8s linear infinite"
      : light === "blink"
        ? "android-eye-blink 0.7s steps(1,end) infinite"
        : light === "slow_blink"
          ? "android-eye-blink 2.4s ease-in-out infinite"
          : "none";
  return (
    <div className="android-eye" style={{ ["--eye" as string]: color }} aria-hidden>
      <span className="android-eye-glow" style={{ background: color, boxShadow: `0 0 10px 2px ${color}`, animation: anim }} />
    </div>
  );
}

export function AvatarAndroidPage() {
  const [selected, setSelected] = useState<AndroidEmotion>("thinking");
  const controls = controlsForEmotion(selected);
  const payload = emotionStatePayload(selected);
  const req = buildTripoRequest();

  return (
    <>
      <section aria-label="Musasabi Android 概要">
        <h2>Musasabi Android — アバター制作仕様(完全版)</h2>
        <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", maxWidth: "52rem" }}>
          自立型AIアシスタントOSの公式アバター(ムササビ)。モノアイ発光・感情モーション・3Dモデル仕様を
          宣言的に定義し、既存レンダラー(Three.js/Tauri)へ組み込みます。
          <strong> 実モデル生成(Tripo3D API)は APIキー+人間承認が必要なため未実行</strong>で、
          本ページは仕様の確定と決定論的なプロンプト/テンプレート生成のみを行います。
        </p>
        <p style={{ color: "var(--accent, #6c8cff)", fontSize: "0.85rem" }}>🐿️ {summarizeAndroidSpecJa()}</p>
      </section>

      <section aria-label="感情ごとのライトカラー(モノアイ)">
        <h3>感情ごとのライトカラー(モノアイ)</h3>
        <div className="android-eye-grid">
          {MONO_EYE_STATES.map((s) => (
            <button
              key={s.id}
              type="button"
              aria-label={`モノアイ: ${s.labelJa}`}
              aria-pressed={selected === s.id}
              className={`card android-eye-card${selected === s.id ? " is-active" : ""}`}
              onClick={() => setSelected(s.id)}
            >
              <MonoEyeVisor color={s.eyeColor} light={s.light} />
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: "0.4rem" }}>
                <strong>{s.labelJa}</strong>
                <span style={{ color: "var(--text-muted)", fontSize: "0.72rem" }}>{s.labelEn}</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "0.72rem", marginTop: "0.15rem" }}>
                <span style={{ fontFamily: "monospace", color: s.eyeColor }}>{s.eyeColor}</span>
                <span className="badge" style={{ fontSize: "0.66rem" }}>{LIGHT_ANIMATION_LABEL_JA[s.light]}</span>
              </div>
              <div style={{ color: "var(--text-muted)", fontSize: "0.72rem", marginTop: "0.2rem" }}>{s.note}</div>
            </button>
          ))}
        </div>
      </section>

      <section aria-label="モノアイ制御パラメータ">
        <h3>モノアイ制御パラメータ({MONO_EYE_STATES.find((s) => s.id === selected)?.labelJa})</h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(15rem, 1fr))", gap: "0.6rem", maxWidth: "48rem" }}>
          <div className="card" style={{ padding: "0.6rem 0.8rem" }}>
            <div style={{ fontSize: "0.78rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}><span>色(Color)</span><span style={{ fontFamily: "monospace", color: controls.color }}>{controls.color}</span></div>
              <Meter label="明るさ(Brightness)" value={controls.brightness} color={controls.color} />
              <Meter label="点滅(Blink)" value={controls.blink} color={controls.color} />
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: "0.3rem" }}>
                <span>スキャン(Scan)</span>
                <span className="badge" style={{ fontSize: "0.7rem" }}>{controls.scan ? "ON" : "OFF"}</span>
              </div>
            </div>
          </div>
          <div className="card" style={{ padding: "0.6rem 0.8rem" }}>
            <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", marginBottom: "0.3rem" }}>Emotion State(モーション制御)</div>
            <pre style={{ margin: 0, fontSize: "0.72rem", overflowX: "auto", whiteSpace: "pre-wrap" }}>{JSON.stringify(payload, null, 2)}</pre>
          </div>
        </div>
      </section>

      <section aria-label="モーションカタログ">
        <h3>感情+動作アニメーション一式(自動モーション対応)</h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(11rem, 1fr))", gap: "0.5rem" }}>
          {MOTION_CATALOG.map((m) => (
            <div key={m.id} className="card" style={{ padding: "0.45rem 0.65rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <strong style={{ fontSize: "0.85rem" }}>{m.labelJa}</strong>
                <span className="badge" style={{ marginLeft: "auto", fontSize: "0.64rem" }}>
                  {m.category === "emotion" ? "感情" : m.category === "variation" ? "動作" : "待機"}
                </span>
              </div>
              <div style={{ color: "var(--text-muted)", fontSize: "0.7rem", marginTop: "0.15rem" }}>
                <code>{m.id}</code> — {m.note}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section aria-label="3Dモデル制作仕様">
        <h3>3Dモデル制作仕様(必須)</h3>
        <ul style={{ listStyle: "none", paddingLeft: 0, fontSize: "0.82rem", maxWidth: "48rem" }}>
          {MODEL_SPEC.map((m) => (
            <li key={m.key} style={{ display: "flex", gap: 10, padding: "0.2rem 0", borderBottom: "1px solid var(--border)" }}>
              <strong style={{ minWidth: "8rem" }}>{m.labelJa}</strong>
              <span style={{ color: "var(--text-muted)" }}>{m.value}</span>
            </li>
          ))}
        </ul>
      </section>

      <section aria-label="カラー参照">
        <h3>カラー参照(参考値)</h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(9rem, 1fr))", gap: "0.4rem", maxWidth: "48rem" }}>
          {COLOR_PALETTE.map((c) => (
            <div key={c.key} className="card" style={{ padding: "0.4rem 0.55rem", display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ width: 22, height: 22, borderRadius: 5, background: c.hex, border: "1px solid var(--border)", boxShadow: `0 0 6px ${c.hex}55`, flexShrink: 0 }} aria-hidden />
              <div style={{ fontSize: "0.74rem" }}>
                <div>{c.labelJa}</div>
                <div style={{ fontFamily: "monospace", color: "var(--text-muted)" }}>{c.hex}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section aria-label="Tripo3D 連携フロー">
        <h3>Tripo3D API 連携フロー(実生成はロック 🔒)</h3>
        <p style={{ color: "var(--text-muted)", fontSize: "0.8rem", maxWidth: "48rem" }}>
          実モデル生成は <strong>APIキー+人間承認</strong> が必要なため未実行です。プロンプト生成と実装は Mock で確定済み。
        </p>
        <ol style={{ fontSize: "0.82rem", maxWidth: "48rem" }}>
          {TRIPO_FLOW.map((f) => (
            <li key={f.id} style={{ padding: "0.2rem 0" }}>
              <strong>{f.labelJa}</strong>（{f.tool}）
              <span className="badge" style={{ marginLeft: 8, fontSize: "0.66rem" }}>{f.gated ? "🔒 承認待ち" : "Mock可"}</span>
              <div style={{ color: "var(--text-muted)", fontSize: "0.74rem" }}>{f.note}</div>
            </li>
          ))}
        </ol>

        <h4 style={{ marginBottom: "0.3rem" }}>生成プロンプト(Tripo3D用テンプレート・決定論)</h4>
        <pre style={{ fontSize: "0.72rem", overflowX: "auto", background: "var(--bg-panel, #1a1d22)", padding: "0.6rem 0.75rem", borderRadius: 8, whiteSpace: "pre-wrap" }}>{buildTripoPrompt()}</pre>

        <h4 style={{ marginBottom: "0.3rem" }}>リクエスト・テンプレート(未送信・APIキーは参照名のみ)</h4>
        <pre style={{ fontSize: "0.7rem", overflowX: "auto", background: "var(--bg-panel, #1a1d22)", padding: "0.6rem 0.75rem", borderRadius: 8, whiteSpace: "pre-wrap" }}>{JSON.stringify(req, null, 2)}</pre>
        <p style={{ fontSize: "0.8rem", fontWeight: "bold", color: "#EF4444" }}>
          ⚠ 実生成・外部接続・課金は人間承認が明示されるまで一切行いません(APIキーはコミットしません)。
        </p>
      </section>
    </>
  );
}

function Meter({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div style={{ marginTop: "0.3rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.72rem" }}>
        <span>{label}</span>
        <span>{value}%</span>
      </div>
      <div style={{ height: 8, borderRadius: 4, background: "var(--border)", overflow: "hidden", marginTop: 2 }}>
        <div style={{ width: `${value}%`, height: "100%", background: color }} />
      </div>
    </div>
  );
}
