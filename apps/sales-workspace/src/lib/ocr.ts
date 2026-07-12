// 実OCR(tesseract.js・WASM・完全ローカル・無課金)。
// 言語データ(jpn/eng)・ワーカー・WASMコアはすべてアプリに同梱しており、
// 画像はこの端末内でのみ処理される(外部送信なし・オフライン動作)。

import { createWorker } from "tesseract.js";

export interface OcrResult {
  text: string;
  /** 平均信頼度(0〜100)。 */
  confidence: number;
  elapsedMs: number;
}

/** 画像(File/Blob/dataURL)から文字を認識する。日本語+英語。 */
export async function recognizeImage(image: File | Blob | string): Promise<OcrResult> {
  const started = Date.now();
  const worker = await createWorker(["jpn", "eng"], 1, {
    workerPath: "/tesseract/worker.min.js",
    corePath: "/tesseract/tesseract-core-simd-lstm.wasm.js",
    langPath: "/tessdata",
  });
  try {
    const { data } = await worker.recognize(image);
    return {
      text: data.text.trim(),
      confidence: data.confidence,
      elapsedMs: Date.now() - started,
    };
  } finally {
    await worker.terminate();
  }
}
