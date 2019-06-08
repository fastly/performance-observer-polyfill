export default class EntryList extends Array<PerformanceEntry>
  implements PerformanceEntryList {
  private _entries: PerformanceEntry[];

  public constructor(entries: PerformanceEntry[]) {
    super(...entries);
    this._entries = entries;
  }

  public getEntries(): PerformanceEntry[] {
    return this._entries;
  }

  public getEntriesByType(type: string): PerformanceEntry[] {
    return this._entries.filter((e): boolean => e.entryType === type);
  }

  public getEntriesByName(name: string, type?: string): PerformanceEntry[] {
    return this._entries
      .filter((e): boolean => e.name === name)
      .filter((e): boolean => (type ? e.entryType === type : true));
  }
}
