import { useState } from "react";
import {
  markStepComplete,
  nextIncompleteStep,
  type SetupState,
  type SetupStepId,
} from "@musasabi/shared";
import { loadSetupState, saveSetupState } from "../../lib/setupStorage";
import { appLogger } from "../../lib/appLogger";

// 初回セットアップウィザード(Phase β-002 優先順位①)。
// 実 credential・実API接続は扱わず、初回起動時の案内と進捗フラグ管理のみを行う。
// 実際の連携設定やアバター設定は、セットアップ完了後の設定画面(優先順位④)で行う。

interface StepContent {
  title: string;
  body: string;
  nextLabel: string;
}

const STEP_CONTENT: Record<SetupStepId, StepContent> = {
  welcome: {
    title: "Musasabi OS へようこそ",
    body:
      "AI社員があなたの営業業務を支援するデスクトップアプリです。かんたんな初期設定を" +
      "行います。設定はあとから設定画面でいつでも変更できます。",
    nextLabel: "はじめる",
  },
  avatar: {
    title: "MUSA アバター",
    body:
      "デスクトップに常駐する AI アバター「MUSA」が業務をサポートします。VRoid Studio で" +
      "作成した VRM アバターの読み込みには対応予定です。今はこのまま進めてください。",
    nextLabel: "次へ",
  },
  integrations: {
    title: "外部連携(準備のみ)",
    body:
      "FileMaker や Zoom Phone との連携は、設定画面で準備できます。この段階では実際の" +
      "アカウント接続は行いません。あとで設定画面から準備してください。",
    nextLabel: "次へ",
  },
  done: {
    title: "準備完了",
    body: "初期設定が完了しました。Sales Workspace をお使いいただけます。",
    nextLabel: "はじめる",
  },
};

export function FirstRunSetup({ onComplete }: { onComplete: () => void }) {
  const [state, setState] = useState<SetupState>(() => loadSetupState());
  const currentStep = nextIncompleteStep(state) ?? "done";
  const content = STEP_CONTENT[currentStep];

  function handleNext(): void {
    const updated = markStepComplete(state, currentStep);
    saveSetupState(updated);
    setState(updated);
    appLogger.info("setup step completed", { step: currentStep });
    if (nextIncompleteStep(updated) === null) {
      onComplete();
    }
  }

  return (
    <main style={{ fontFamily: "sans-serif", padding: "2rem", maxWidth: "36rem" }}>
      <p style={{ color: "#666", fontSize: "0.85rem" }}>初回セットアップ</p>
      <h1>{content.title}</h1>
      <p style={{ lineHeight: 1.7 }}>{content.body}</p>
      <button type="button" onClick={handleNext}>
        {content.nextLabel}
      </button>
    </main>
  );
}
