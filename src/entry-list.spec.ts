import EntryList from "./entry-list";
import entries from "./fixtures/entries";

const entriesFixture = entries as PerformanceEntry[];

describe("EntryList", (): void => {
  it("should return a class", (): void => {
    const list = new EntryList(entriesFixture);
    expect(list).toBeInstanceOf(EntryList);
  });

  describe("#getEntries", (): void => {
    it("should return an array", (): void => {
      const list = new EntryList(entriesFixture);
      expect(list.getEntries()).toBeInstanceOf(Array);
    });

    it("should return all entries in the list", (): void => {
      const list = new EntryList(entriesFixture);
      expect(list.getEntries()).toHaveLength(28);
      expect(list.getEntries()).toEqual(entriesFixture);
    });
  });

  describe("#getEntriesByType", (): void => {
    it("should return an array", (): void => {
      const type = "resource";
      const list = new EntryList(entriesFixture);
      expect(list.getEntriesByType(type)).toBeInstanceOf(Array);
    });

    it("should return all entries in the list matching the given type", (): void => {
      const type = "resource";
      const list = new EntryList(entriesFixture);
      expect(list.getEntriesByType(type)).toHaveLength(25);
    });
  });

  describe("#getEntriesByName", (): void => {
    it("should return an array", (): void => {
      const name = entriesFixture[0].name;
      const list = new EntryList(entriesFixture);
      expect(list.getEntriesByName(name)).toBeInstanceOf(Array);
    });

    it("should return all entries in the list matching the given name", (): void => {
      const name = entriesFixture[0].name;
      const list = new EntryList(entriesFixture);
      const result = list.getEntriesByName(name);
      expect(result).toHaveLength(1);
      expect(result).toEqual([entriesFixture[0]]);
    });

    it("should return all entries in the list matching the given name and type", (): void => {
      const name = entriesFixture[1].name;
      const type = entriesFixture[1].entryType;
      const list = new EntryList(entriesFixture);
      const result = list.getEntriesByName(name, type);
      expect(result).toHaveLength(1);
      expect(result).toEqual([entriesFixture[1]]);
    });
  });
});
