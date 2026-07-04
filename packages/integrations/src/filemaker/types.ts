// FileMaker Data API 連携の型定義。Security Bible 第4章によりクレデンシャルは
// コミットせず、環境変数から読み込む(FileMakerCredentials は値そのものを保持するのみ)。

export interface FileMakerCredentials {
  /** 例: "https://filemaker.example.com" */
  host: string;
  database: string;
  username: string;
  password: string;
}

export type FileMakerFieldData = Record<string, string | number>;

export interface FileMakerRecord {
  recordId: string;
  modId: string;
  fieldData: FileMakerFieldData;
}

export interface FileMakerFindQuery {
  layout: string;
  /** FileMaker Data API の find query([{field: value}] の配列)をそのまま渡す。 */
  query: Array<Record<string, string>>;
}

export interface FileMakerAdapter {
  find(request: FileMakerFindQuery): Promise<FileMakerRecord[]>;
  create(layout: string, fieldData: FileMakerFieldData): Promise<FileMakerRecord>;
  update(layout: string, recordId: string, fieldData: FileMakerFieldData): Promise<void>;
}
