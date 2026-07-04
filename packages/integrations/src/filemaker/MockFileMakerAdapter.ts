import type { FileMakerAdapter, FileMakerFieldData, FileMakerFindQuery, FileMakerRecord } from "./types";

function matchesQuery(fieldData: FileMakerFieldData, query: Array<Record<string, string>>): boolean {
  // FileMaker find query はOR条件の配列。各要素内はAND条件(部分一致)。
  return query.some((clause) =>
    Object.entries(clause).every(([field, value]) =>
      String(fieldData[field] ?? "").includes(value),
    ),
  );
}

/**
 * インメモリのFileMakerアダプタ実装。実サーバーが無い開発・テスト環境で
 * FileMakerAdapter インターフェースの契約を検証するために使う。
 */
export class MockFileMakerAdapter implements FileMakerAdapter {
  private recordsByLayout = new Map<string, FileMakerRecord[]>();
  private nextId = 1;

  seed(layout: string, records: FileMakerFieldData[]): void {
    const existing = this.recordsByLayout.get(layout) ?? [];
    const seeded = records.map((fieldData) => ({
      recordId: String(this.nextId++),
      modId: "0",
      fieldData,
    }));
    this.recordsByLayout.set(layout, [...existing, ...seeded]);
  }

  async find(request: FileMakerFindQuery): Promise<FileMakerRecord[]> {
    const records = this.recordsByLayout.get(request.layout) ?? [];
    if (request.query.length === 0) {
      return records;
    }
    return records.filter((record) => matchesQuery(record.fieldData, request.query));
  }

  async create(layout: string, fieldData: FileMakerFieldData): Promise<FileMakerRecord> {
    const record: FileMakerRecord = { recordId: String(this.nextId++), modId: "0", fieldData };
    const existing = this.recordsByLayout.get(layout) ?? [];
    this.recordsByLayout.set(layout, [...existing, record]);
    return record;
  }

  async update(layout: string, recordId: string, fieldData: FileMakerFieldData): Promise<void> {
    const records = this.recordsByLayout.get(layout) ?? [];
    const index = records.findIndex((r) => r.recordId === recordId);
    if (index === -1) {
      throw new Error(`FileMaker mock: record ${recordId} not found on layout ${layout}`);
    }
    records[index] = {
      ...records[index],
      fieldData: { ...records[index].fieldData, ...fieldData },
      modId: String(Number(records[index].modId) + 1),
    };
  }

  async close(): Promise<void> {
    // インメモリ実装にセッションは無いため何もしない。
  }
}
