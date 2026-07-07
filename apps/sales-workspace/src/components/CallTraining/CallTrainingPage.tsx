import { useEffect, useState } from "react";
import {
  MockCallAdapter,
  startTestCall,
  addHumanTurn,
  endTestCall,
  addFeedback,
  canPlaceRealCall,
  CALL_MODE_LABEL_JA,
  AUTOCALL_GATE_LABEL_JA,
  AUTOCALL_GATES,
  TALK_FEEDBACK_CATEGORY_LABEL_JA,
  LOCKED_GATE_REASON_JA,
  isGateLocked,
  satisfiedGates,
  setGateSatisfied,
} from "@musasabi/call-training";
import { addWorkLogEntry, listWorkLogEntries } from "@musasabi/call-training";
import type {
  AutoCallGate,
  CallMode,
  GateState,
  TestCallSession,
  TalkFeedbackCategory,
  WorkLogEntry,
} from "@musasabi/call-training";
import { generateCallMinutes } from "@musasabi/voice-analysis";
import { appLogger } from "../../lib/appLogger";
import { loadEmployeeSettings } from "../../lib/employeeSettings";
import { loadWorkLog, saveWorkLog } from "../../lib/workLogStorage";
import { saveSessionToCallLog } from "../../lib/callLogStorage";
import { recordMemory } from "../../lib/memoryStorage";
import { loadGateState, saveGateState } from "../../lib/gateStorage";

// コールトレーニング画面(Directive D-20260705-003)。
// Learning → Test → AutoCall の三段階。現フェーズは Test Mode を Mock で実装し、
// AutoCall 本番実行は無効(準備中/承認待ち表示)。実架電・実音声接続はしない。
// 既定モードは設定画面(EmployeeSettingsPanel)の値に従う(D-20260706-001)。

const adapter = new MockCallAdapter();

const MODE_ORDER: CallMode[] = ["learning", "test", "autocall"];

export function CallTrainingPage() {
  const [mode, setMode] = useState<CallMode>(() => loadEmployeeSettings().defaultCallMode);
  const [contact, setContact] = useState("");
  const [session, setSession] = useState<TestCallSession | null>(null);
  const [humanText, setHumanText] = useState("");
  const [fbComment, setFbComment] = useState("");
  const [fbCategory, setFbCategory] = useState<TalkFeedbackCategory>("tone");

  // セッションの更新(発話・指摘・終了)をこの端末のローカル履歴へ自動保存する。
  // 保存された履歴は Sales Brain の共通ナレッジ・履歴一覧へ反映される(外部送信なし)。
  useEffect(() => {
    if (session) {
      saveSessionToCallLog(session);
    }
  }, [session]);

  function handleStart(): void {
    try {
      const s = startTestCall(contact, adapter, Date.now());
      setSession(s);
      appLogger.info("test call started (mock, no real dialing)", { contact: s.contact });
      recordMemory({
        category: "work",
        actor: "MUSA-101",
        action: "テストコール開始",
        detail: `連絡先: ${s.contact}(Mock架電)`,
        tags: ["call-training", "test-mode"],
      });
    } catch (error) {
      appLogger.warn("failed to start test call", { error: String(error) });
      alert(String(error));
    }
  }

  function handleSend(): void {
    if (!session || humanText.trim() === "") return;
    setSession(addHumanTurn(session, humanText, adapter, Date.now()));
    setHumanText("");
  }

  function handleEnd(): void {
    if (!session) return;
    setSession(endTestCall(session, Date.now()));
    recordMemory({
      category: "work",
      actor: "MUSA-101",
      action: "テストコール終了",
      detail: `連絡先: ${session.contact} / 発話 ${session.turns.length}件`,
      tags: ["call-training", "test-mode"],
    });
    // 議事録は保存済みセッションから決定的に再生成できるため、Memoryには要約のみ残す。
    const minutes = generateCallMinutes(session.id, session.turns);
    recordMemory({
      category: "work",
      actor: "MUSA-101",
      action: "議事録を自動作成",
      detail: minutes.analysis.summary,
      tags: ["call-training", "minutes"],
    });
  }

  function handleAddFeedback(): void {
    if (!session || fbComment.trim() === "") return;
    setSession(
      addFeedback(session, {
        turnIndex: null,
        comment: fbComment,
        category: fbCategory,
        nowMs: Date.now(),
      }),
    );
    recordMemory({
      category: "short_term",
      actor: "user",
      action: "トーク指摘を登録",
      detail: `[${TALK_FEEDBACK_CATEGORY_LABEL_JA[fbCategory]}] ${fbComment}`,
      tags: ["call-training", "feedback"],
    });
    setFbComment("");
  }

  // 安全ゲートの充足状態(ローカル保存)。real_account_link はロック(充足不可)の
  // ため、管理者が他の全ゲートを充足しても本番架電は構造的に有効化できない。
  const [gateState, setGateState] = useState<GateState>(() => loadGateState());

  function handleGateToggle(gate: AutoCallGate): void {
    const nextValue = !gateState[gate];
    try {
      const next = setGateSatisfied(gateState, gate, nextValue);
      setGateState(next);
      saveGateState(next);
      recordMemory({
        category: "company",
        actor: "user",
        action: nextValue ? "AutoCall安全ゲートを充足" : "AutoCall安全ゲートを解除",
        detail: `ゲート: ${AUTOCALL_GATE_LABEL_JA[gate]}`,
        tags: ["autocall", "safety-gate"],
      });
    } catch (error) {
      appLogger.warn("gate toggle rejected", { gate, error: String(error) });
      alert(String(error instanceof Error ? error.message : error));
    }
  }

  const autoCallAllowed = canPlaceRealCall("autocall", satisfiedGates(gateState));

  return (
    <section aria-label="コールトレーニング">
      <h2>コールトレーニング</h2>
      <nav style={{ marginBottom: "1rem", display: "flex", gap: "0.5rem" }}>
        {MODE_ORDER.map((m) => (
          <button key={m} type="button" onClick={() => setMode(m)} disabled={mode === m}>
            {CALL_MODE_LABEL_JA[m]}
          </button>
        ))}
      </nav>

      {mode === "learning" && <LearningModeView />}
      {mode === "test" && (
        <TestModeView
          contact={contact}
          setContact={setContact}
          session={session}
          humanText={humanText}
          setHumanText={setHumanText}
          fbComment={fbComment}
          setFbComment={setFbComment}
          fbCategory={fbCategory}
          setFbCategory={setFbCategory}
          onStart={handleStart}
          onSend={handleSend}
          onEnd={handleEnd}
          onAddFeedback={handleAddFeedback}
        />
      )}
      {mode === "autocall" && (
        <AutoCallModeView allowed={autoCallAllowed} gateState={gateState} onToggle={handleGateToggle} />
      )}
    </section>
  );
}

function LearningModeView() {
  const [entries, setEntries] = useState<WorkLogEntry[]>(() => loadWorkLog());
  const [text, setText] = useState("");

  function handleAdd(): void {
    const next = addWorkLogEntry(entries, {
      departmentId: "dept-sales",
      text,
      nowMs: Date.now(),
    });
    if (next.length !== entries.length) {
      setEntries(next);
      saveWorkLog(next);
      recordMemory({
        category: "long_term",
        actor: "user",
        action: "作業内容を学習登録",
        detail: text,
        tags: ["learning-mode", "work-log"],
      });
      setText("");
    }
  }

  const listed = listWorkLogEntries(entries);

  return (
    <div>
      <h3>ラーニングモード</h3>
      <p style={{ maxWidth: "40rem", lineHeight: 1.7 }}>
        人間の営業トーク・過去の架電履歴・成功/失敗パターン・切り返し・話し方を学習し、
        全AI社員共通のナレッジへ反映します。テストモードで蓄積した指摘もここに集約されます
        (実データ学習は次フェーズ)。
      </p>

      <h4>日々の作業内容を学習させる(手動登録)</h4>
      <p style={{ color: "#9aa3ba", fontSize: "0.85rem", maxWidth: "40rem" }}>
        今日行った作業・気づき・うまくいった切り返しなどを登録すると、AI社員共通の
        学習素材として蓄積されます(保存はこの端末内のみ。外部送信はしません)。
      </p>
      <div style={{ marginBottom: "0.75rem" }}>
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleAdd();
          }}
          placeholder="例: 「高い」と言われたら導入事例→数値の順で返すと通りやすかった"
          style={{ width: "28rem" }}
        />{" "}
        <button type="button" onClick={handleAdd}>
          学習させる
        </button>
      </div>
      {listed.length === 0 ? (
        <p style={{ color: "#9aa3ba" }}>まだ登録がありません。</p>
      ) : (
        <ul>
          {listed.map((entry) => (
            <li key={entry.id} style={{ margin: "0.3rem 0" }}>
              {entry.text}{" "}
              <span style={{ color: "#7d8598", fontSize: "0.8rem" }}>
                ({new Date(entry.timestampMs).toLocaleString("ja-JP")})
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

interface TestModeProps {
  contact: string;
  setContact: (v: string) => void;
  session: TestCallSession | null;
  humanText: string;
  setHumanText: (v: string) => void;
  fbComment: string;
  setFbComment: (v: string) => void;
  fbCategory: TalkFeedbackCategory;
  setFbCategory: (v: TalkFeedbackCategory) => void;
  onStart: () => void;
  onSend: () => void;
  onEnd: () => void;
  onAddFeedback: () => void;
}

function TestModeView(props: TestModeProps) {
  const { session } = props;
  const inProgress = session?.status === "in_progress";
  return (
    <div>
      <h3>テストモード(Mock架電)</h3>
      <p style={{ color: "#f0883e", fontSize: "0.9rem", maxWidth: "40rem" }}>
        実際の外部架電は行いません(Mock Call Adapter)。連絡先はテスト用のダミー値を
        入力してください。
      </p>
      <div style={{ marginBottom: "0.75rem" }}>
        <label>
          連絡先(テスト用)
          <br />
          <input
            type="text"
            value={props.contact}
            onChange={(e) => props.setContact(e.target.value)}
            placeholder="例: テスト太郎 / 03-0000-0000(ダミー)"
            disabled={inProgress}
          />
        </label>{" "}
        <button type="button" onClick={props.onStart} disabled={inProgress}>
          テストコール開始
        </button>
      </div>

      {session && (
        <div style={{ border: "1px solid rgba(151,168,205,0.16)", padding: "0.75rem", maxWidth: "48rem" }}>
          <p style={{ margin: "0 0 0.5rem", color: "#9aa3ba" }}>
            連絡先: {session.contact} / 状態: {inProgress ? "通話中" : "終了"}
          </p>
          <div style={{ maxHeight: "16rem", overflowY: "auto", marginBottom: "0.5rem" }}>
            {session.turns.map((turn, i) => (
              <p key={i} style={{ margin: "0.25rem 0" }}>
                <strong>{turn.speaker === "ai" ? "AI" : "あなた"}:</strong> {turn.text}
              </p>
            ))}
          </div>
          {inProgress && (
            <div style={{ marginBottom: "0.5rem" }}>
              <input
                type="text"
                value={props.humanText}
                onChange={(e) => props.setHumanText(e.target.value)}
                placeholder="顧客役として入力"
                style={{ width: "24rem" }}
              />{" "}
              <button type="button" onClick={props.onSend}>
                送信
              </button>{" "}
              <button type="button" onClick={props.onEnd}>
                通話終了
              </button>
            </div>
          )}

          <h4>指摘(トーク修正)</h4>
          <div style={{ marginBottom: "0.5rem" }}>
            <select
              value={props.fbCategory}
              onChange={(e) => props.setFbCategory(e.target.value as TalkFeedbackCategory)}
            >
              {(Object.keys(TALK_FEEDBACK_CATEGORY_LABEL_JA) as TalkFeedbackCategory[]).map((c) => (
                <option key={c} value={c}>
                  {TALK_FEEDBACK_CATEGORY_LABEL_JA[c]}
                </option>
              ))}
            </select>{" "}
            <input
              type="text"
              value={props.fbComment}
              onChange={(e) => props.setFbComment(e.target.value)}
              placeholder="例: もっと明るい声で / 切り返しを丁寧に"
              style={{ width: "20rem" }}
            />{" "}
            <button type="button" onClick={props.onAddFeedback}>
              指摘を追加
            </button>
          </div>
          <ul>
            {session.feedback.map((fb) => (
              <li key={fb.id}>
                [{TALK_FEEDBACK_CATEGORY_LABEL_JA[fb.category]}] {fb.comment}
              </li>
            ))}
          </ul>
          <p style={{ color: "#9aa3ba", fontSize: "0.85rem" }}>
            指摘内容は全AI社員共通の改善ナレッジへ反映される設計です(集約は次フェーズで永続化)。
          </p>

          {session.status === "completed" && <CallMinutesView session={session} />}
        </div>
      )}
    </div>
  );
}

/** 通話終了後の議事録(Development Bible 第10章)。保存済みターンから決定的に生成。 */
function CallMinutesView({ session }: { session: TestCallSession }) {
  const minutes = generateCallMinutes(session.id, session.turns);
  return (
    <div style={{ marginTop: "0.75rem", borderTop: "1px solid rgba(151,168,205,0.16)", paddingTop: "0.75rem" }}>
      <h4>議事録(自動生成)</h4>
      <p style={{ margin: "0.25rem 0" }}>{minutes.analysis.summary}</p>
      <p style={{ margin: "0.25rem 0", color: "#9aa3ba", fontSize: "0.85rem" }}>
        参加者: {minutes.participants.join(" / ")} ・ トーク比率(担当者):{" "}
        {Math.round(minutes.analysis.talkRatio.rep * 100)}%
      </p>
      <strong style={{ fontSize: "0.9rem" }}>決定事項</strong>
      {minutes.decisions.length === 0 ? (
        <p style={{ margin: "0.2rem 0", color: "#9aa3ba" }}>なし</p>
      ) : (
        <ul style={{ margin: "0.2rem 0" }}>
          {minutes.decisions.map((d) => (
            <li key={d}>{d}</li>
          ))}
        </ul>
      )}
      <strong style={{ fontSize: "0.9rem" }}>宿題・フォローアップ</strong>
      {minutes.actionItems.length === 0 ? (
        <p style={{ margin: "0.2rem 0", color: "#9aa3ba" }}>なし</p>
      ) : (
        <ul style={{ margin: "0.2rem 0" }}>
          {minutes.actionItems.map((a) => (
            <li key={a}>{a}</li>
          ))}
        </ul>
      )}
      <p style={{ color: "#9aa3ba", fontSize: "0.8rem", margin: "0.4rem 0 0" }}>
        議事録は保存済みの会話から決定的に生成されます(LLM推論・外部送信なし)。
      </p>
    </div>
  );
}

function AutoCallModeView({
  allowed,
  gateState,
  onToggle,
}: {
  allowed: boolean;
  gateState: GateState;
  onToggle: (gate: AutoCallGate) => void;
}) {
  const satisfiedCount = satisfiedGates(gateState).length;
  return (
    <div>
      <h3>オートコールモード(準備中・承認待ち)</h3>
      <p style={{ color: "#f0883e", fontWeight: "bold" }}>
        本番架電は無効です。現フェーズではオートコールを開始できません。
      </p>
      <p style={{ maxWidth: "40rem" }}>
        以下の安全ゲートがすべて揃うまで、オートコールは有効化されません。 管理者は各ゲートの
        充足状態を切り替えられます(充足 {satisfiedCount}/{AUTOCALL_GATES.length})。 ゲートの
        変更は Company Brain の Memory に監査記録されます。
      </p>
      <ul style={{ listStyle: "none", paddingLeft: 0, maxWidth: "40rem" }}>
        {AUTOCALL_GATES.map((gate) => {
          const locked = isGateLocked(gate);
          const satisfied = gateState[gate];
          return (
            <li key={gate} style={{ margin: "0.35rem 0" }}>
              <label style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <input
                  type="checkbox"
                  checked={satisfied}
                  disabled={locked}
                  onChange={() => onToggle(gate)}
                />
                <span style={{ color: satisfied ? "#3fb950" : undefined }}>
                  {AUTOCALL_GATE_LABEL_JA[gate]}({satisfied ? "充足" : "未充足"})
                </span>
                {locked && (
                  <span style={{ color: "#f0883e", fontSize: "0.8rem" }}>
                    🔒 {LOCKED_GATE_REASON_JA}
                  </span>
                )}
              </label>
            </li>
          );
        })}
      </ul>
      <button type="button" disabled={!allowed}>
        {allowed ? "オートコール開始" : "オートコール開始(承認待ち)"}
      </button>
      <p style={{ color: "#9aa3ba", fontSize: "0.85rem", maxWidth: "40rem" }}>
        実アカウント連携ゲートは未実装のためロックされており、本フェーズでは
        全ゲート充足に到達できません(本番架電は構造的に不可)。
      </p>
    </div>
  );
}
