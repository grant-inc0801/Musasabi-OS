import { Component, type ErrorInfo, type ReactNode } from "react";
import { appLogger } from "../lib/appLogger";

// 製品化フェーズ(Phase β-002 優先順位①)のエラー画面。
// レンダリング中の想定外の例外を捕捉し、白画面(クラッシュ)ではなく日本語の
// エラー画面を表示する。エラー内容は appLogger に記録し、ログ画面から参照できる。

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  override componentDidCatch(error: Error, info: ErrorInfo): void {
    appLogger.error("uncaught UI error", {
      message: error.message,
      stack: error.stack,
      componentStack: info.componentStack ?? undefined,
    });
  }

  private handleReload = (): void => {
    // Tauri/ブラウザいずれでもウィンドウを再読み込みして復帰を試みる。
    if (typeof window !== "undefined") {
      window.location.reload();
    }
  };

  override render(): ReactNode {
    const { error } = this.state;
    if (error === null) {
      return this.props.children;
    }
    return (
      <main style={{ fontFamily: "sans-serif", padding: "2rem", maxWidth: "40rem" }}>
        <h1>予期しないエラーが発生しました</h1>
        <p>
          申し訳ありません。画面の表示中に問題が発生しました。下のボタンから再読み込みを
          お試しください。問題が続く場合は、設定のログ画面の内容を添えてお問い合わせください。
        </p>
        <p style={{ color: "var(--warn)", fontFamily: "monospace", fontSize: "0.9rem" }}>
          {error.message}
        </p>
        <button type="button" onClick={this.handleReload}>
          再読み込み
        </button>
      </main>
    );
  }
}
