export default class EntryList implements PerformanceObserverEntryList {
  private _entries: PerformanceEntry[];

  public constructor(entries: PerformanceEntry[]) {
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
