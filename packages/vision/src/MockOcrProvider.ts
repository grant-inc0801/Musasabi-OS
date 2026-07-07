// OCRプロバイダ(Development Bible 第11章「OCR」)。
// 実OCRエンジン(Tesseract / Windows OCR 等)への接続は未実装・未承認のため、
// voice-engine の Mock プロバイダと同じパターンでインターフェースと Mock のみ提供する。
// Mock は決定的で、画像データは解釈せずメタ情報から固定文言を返す。

export interface OcrRequest {
  /** 画像の識別子(ファイル名など。画像本体はローカルに留める)。 */
  imageId: string;
  widthPx: number;
  heightPx: number;
}

export interface OcrResult {
  imageId: string;
  /** 抽出テキスト(行単位)。 */
  lines: string[];
  /** 使用エンジン名。 */
  engine: string;
}

export interface OcrProvider {
  readonly name: string;
  recognize(request: OcrRequest): OcrResult;
}

/** Mock OCR。実画像解析はせず、決定的なプレースホルダ結果を返す。 */
export class MockOcrProvider implements OcrProvider {
  readonly name = "mock-ocr";

  recognize(request: OcrRequest): OcrResult {
    return {
      imageId: request.imageId,
      lines: [
        `[Mock OCR] ${request.imageId}(${request.widthPx}x${request.heightPx})`,
        "実OCRエンジンは未接続です(承認後に接続)。",
      ],
      engine: this.name,
    };
  }
}
