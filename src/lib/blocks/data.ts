import { blocksClient } from "./client";

export type DataRecord = Record<string, unknown> & { itemId?: string };

export type ListResult<T> = { items: T[]; totalCount: number };

function normalizeList<T>(response: unknown, queryName: string): ListResult<T> {
  const record = response as {
    data?: { getProducts?: unknown; items?: T[]; totalCount?: number } & Record<string, unknown>;
    items?: T[];
    totalCount?: number;
  };
  const gateway = (record.data?.[queryName] ?? record.data?.getProducts) as { items?: T[]; totalCount?: number } | undefined;
  const fallbackItems = (record.data?.items ?? record.items ?? []) as T[];
  const items = gateway?.items ?? fallbackItems;
  const totalCount = gateway?.totalCount ?? record.data?.totalCount ?? record.totalCount ?? items.length;
  return { items, totalCount };
}

export type CollectionListOptions = {
  filter?: Record<string, unknown>;
  pageNo?: number;
  pageSize?: number;
  sort?: Record<string, unknown>;
};

// Thin typed wrapper over the SDK's generic data collection helper. Every
// schema access in this app goes through here so field selection, paging and
// mutation shapes stay consistent.
export function collection<T extends DataRecord>(schemaName: string, fields?: string[]) {
  const base = blocksClient.data.collection<T>(schemaName, fields ? { fields } : undefined);
  const queryName = `get${schemaName}s`;
  return {
    async list(options: CollectionListOptions = {}): Promise<ListResult<T>> {
      const query: Record<string, unknown> = {};
      if (options.filter && Object.keys(options.filter).length) query.filter = options.filter;
      if (options.sort) query.sort = options.sort;
      const response = await base.list({
        pageNo: options.pageNo ?? 1,
        pageSize: options.pageSize ?? 25,
        ...query
      } as never);
      return normalizeList<T>(response, queryName);
    },
    // The SDK's `get` runs the same list query with an ItemId filter, so the
    // single record is the first item of that list response.
    async get(itemId: string): Promise<T | undefined> {
      const response = await base.get(itemId);
      return normalizeList<T>(response, queryName).items[0];
    },
    create(payload: Partial<T>): Promise<unknown> {
      return base.create(payload);
    },
    update(itemId: string, payload: Partial<T>): Promise<unknown> {
      return base.update(itemId, payload);
    },
    delete(itemId: string): Promise<unknown> {
      return base.delete(itemId);
    }
  };
}

export function recordId(record: DataRecord | undefined): string {
  if (!record) throw new Error("Record is missing its identifier.");
  const id = record.itemId ?? (record.id as string | undefined);
  if (!id) throw new Error("Record is missing its identifier.");
  return String(id);
}
