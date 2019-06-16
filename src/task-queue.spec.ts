import PollingPerformanceObserverTaskQueue from "./task-queue";
import PerformanceObserverEntryList from "./entry-list";
import PollingPerformanceObserver from "./observer";
import entries from "./fixtures/entries";

const entriesFixture = entries as PerformanceEntry[];
const mockGetEntries = jest.fn().mockReturnValue(entriesFixture);
Object.defineProperty(window, "performance", {
  configurable: true,
  get(): object {
    return {
      getEntries: mockGetEntries
    };
  }
});

const observersFixture = new Set([
  ({
    entryTypes: ["resource"],
    buffer: new Set(),
    callback: jest.fn()
  } as any) as PollingPerformanceObserver,
  ({
    entryTypes: ["mark"],
    buffer: new Set(),
    callback: jest.fn()
  } as any) as PollingPerformanceObserver,
  ({
    entryTypes: ["resource"],
    buffer: new Set(),
    callback: jest.fn()
  } as any) as PollingPerformanceObserver
]);

describe("PerformanceObserverTaskQueue", (): void => {
  beforeEach((): void => mockGetEntries.mockClear());

  it("should return a class", (): void => {
    const taskQueue = new PollingPerformanceObserverTaskQueue();
    expect(taskQueue).toBeInstanceOf(PollingPerformanceObserverTaskQueue);
  });

  describe("#getNewEntries", (): void => {
    it("should return an Array", (): void => {
      const taskQueue = new PollingPerformanceObserverTaskQueue();
      expect(taskQueue.getNewEntries()).toBeInstanceOf(Array);
    });

    it("should call the context performance.getEntries() method", (): void => {
      const taskQueue = new PollingPerformanceObserverTaskQueue();
      taskQueue.getNewEntries();
      expect(mockGetEntries).toHaveBeenCalledTimes(1);
    });

    it("should only return new entries", (): void => {
      const mockProcessedEntries: Set<PerformanceEntry> = new Set();
      const taskQueue = new PollingPerformanceObserverTaskQueue({
        processedEntries: mockProcessedEntries
      });
      mockProcessedEntries.add(entriesFixture[0]);
      const result = taskQueue.getNewEntries();
      expect(result).toHaveLength(27);
    });
  });

  describe("#getObserversForType", (): void => {
    it("should return an array", (): void => {
      const taskQueue = new PollingPerformanceObserverTaskQueue();
      const result = taskQueue.getObserversForType(
        observersFixture,
        "resource"
      );
      expect(result).toBeInstanceOf(Array);
    });

    it("should filter observers list by entryType", (): void => {
      const taskQueue = new PollingPerformanceObserverTaskQueue();
      const result = taskQueue.getObserversForType(
        observersFixture,
        "resource"
      );
      expect(result).toHaveLength(2);
    });
  });

  describe("#processBuffer", (): void => {
    const [fixture] = Array.from(observersFixture);
    const entryListFixture = new PerformanceObserverEntryList(entriesFixture);

    beforeEach((): void => {
      fixture.buffer = new Set(entriesFixture);
      (fixture.callback as jest.Mock).mockClear();
    });

    afterEach((): void => fixture.buffer.clear());

    it("should instantiate new EntryList from the observers buffer", (): void => {
      const taskQueue = new PollingPerformanceObserverTaskQueue();
      taskQueue.processBuffer(fixture);
      const list = (fixture.callback as jest.Mock).mock.calls[0][0];
      expect(list).toBeInstanceOf(PerformanceObserverEntryList);
      expect(list).toEqual(entryListFixture);
    });

    it("should clear the observers buffer", (): void => {
      const taskQueue = new PollingPerformanceObserverTaskQueue();
      taskQueue.processBuffer(fixture);
      const buffer = Array.from(fixture.buffer);
      expect(buffer).toHaveLength(0);
    });

    it("should call the observers callback method", (): void => {
      const taskQueue = new PollingPerformanceObserverTaskQueue();
      taskQueue.processBuffer(fixture);
      expect(fixture.callback).toHaveBeenCalledTimes(1);
      expect(fixture.callback).toHaveBeenLastCalledWith(
        entryListFixture,
        fixture
      );
    });

    it("shouldn't call the observer callback method if the buffer is empty", (): void => {
      const taskQueue = new PollingPerformanceObserverTaskQueue();
      fixture.buffer.clear();
      taskQueue.processBuffer(fixture);
      expect(fixture.callback).not.toHaveBeenCalled();
    });
  });

  describe("#processEntries", (): void => {
    const mockProcessedEntries: Set<PerformanceEntry> = new Set();
    const taskQueue = new PollingPerformanceObserverTaskQueue({
      processedEntries: mockProcessedEntries
    });

    beforeAll((): void => {
      jest.spyOn(taskQueue, "getNewEntries");
      jest.spyOn(taskQueue, "getObserversForType");
      jest.spyOn(taskQueue, "processBuffer");
    });

    beforeEach((): void => {
      observersFixture.forEach((o): void => taskQueue.add(o));
    });

    afterEach((): void => {
      observersFixture.forEach((o): void => taskQueue.remove(o));
      mockProcessedEntries.clear();
      (taskQueue.getNewEntries as jest.Mock).mockClear();
      (taskQueue.getObserversForType as jest.Mock).mockClear();
      (taskQueue.processBuffer as jest.Mock).mockClear();
    });

    it("should call getNewEntries to fetch new entires", (): void => {
      taskQueue.processEntries();
      expect(taskQueue.getNewEntries).toHaveBeenCalled();
    });

    it("should get the interested observers for each entry", (): void => {
      taskQueue.processEntries();
      expect(taskQueue.getObserversForType).toHaveBeenCalledTimes(28);
    });

    it("should add each entry to each interested observers buffer", (): void => {
      const [fixture1, fixture2, fixture3] = Array.from(observersFixture);
      taskQueue.processEntries();
      expect(fixture1.buffer.size).toEqual(25);
      expect(fixture2.buffer.size).toEqual(0);
      expect(fixture3.buffer.size).toEqual(25);
    });

    it("should mark each entry as processed", (): void => {
      taskQueue.processEntries();
      expect(mockProcessedEntries.size).toEqual(28);
    });

    it("should schedule a task to call processBuffer for each observer", (): void => {
      jest.useFakeTimers();
      jest
        .spyOn(window, "requestAnimationFrame")
        .mockImplementation((cb): number => {
          cb(1);
          return 1;
        });
      taskQueue.processEntries();
      jest.runAllTicks();
      expect(taskQueue.processBuffer).toHaveBeenCalledTimes(3);
      (window.requestAnimationFrame as jest.Mock).mockRestore();
    });
  });

  describe("#add", (): void => {
    const [fixture] = Array.from(observersFixture);
    const mockRegisteredObservers: Set<PollingPerformanceObserver> = new Set();
    const taskQueue = new PollingPerformanceObserverTaskQueue({
      registeredObservers: mockRegisteredObservers
    });

    beforeAll((): void => {
      jest.spyOn(taskQueue, "observe");
    });

    afterEach((): void => {
      mockRegisteredObservers.clear();
      (taskQueue.observe as jest.Mock).mockClear();
    });

    it("should add the observer to list of registeredObservers", (): void => {
      expect(mockRegisteredObservers.has(fixture)).toBeFalsy();
      taskQueue.add(fixture);
      expect(mockRegisteredObservers.has(fixture)).toBeTruthy();
    });

    it("should call the observe method if it is the first observer", (): void => {
      taskQueue.add(fixture);
      expect(taskQueue.observe).toHaveBeenCalledTimes(1);
    });

    it("shouldn't call the observe method if it is not the first observer", (): void => {
      const [, fixture2] = Array.from(observersFixture);
      mockRegisteredObservers.add(fixture2);
      taskQueue.add(fixture);
      expect(taskQueue.observe).not.toHaveBeenCalled();
    });
  });

  describe("#remove", (): void => {
    const [fixture] = Array.from(observersFixture);
    const mockRegisteredObservers: Set<PollingPerformanceObserver> = new Set();
    const taskQueue = new PollingPerformanceObserverTaskQueue({
      registeredObservers: mockRegisteredObservers
    });

    beforeAll((): void => {
      jest.spyOn(taskQueue, "disconnect");
    });

    beforeEach((): void => {
      mockRegisteredObservers.add(fixture);
    });

    afterEach((): void => {
      mockRegisteredObservers.clear();
      (taskQueue.disconnect as jest.Mock).mockClear();
    });

    it("should remove the observer from the list of registeredObservers", (): void => {
      expect(mockRegisteredObservers.has(fixture)).toBeTruthy();
      taskQueue.remove(fixture);
      expect(mockRegisteredObservers.has(fixture)).toBeFalsy();
    });

    it("should call the disconnect method if it was the last observer", (): void => {
      taskQueue.remove(fixture);
      expect(taskQueue.disconnect).toHaveBeenCalledTimes(1);
    });

    it("shouldn't call the disconnect method if it was not the last observer", (): void => {
      const [, fixture2] = Array.from(observersFixture);
      mockRegisteredObservers.add(fixture2);
      taskQueue.remove(fixture);
      expect(taskQueue.disconnect).not.toHaveBeenCalled();
    });
  });

  describe("#observe", (): void => {
    it("should invoke #processEntires within a setInterval loop", (): void => {
      jest.useFakeTimers();
      const taskQueue = new PollingPerformanceObserverTaskQueue({
        interval: 0
      });
      jest.spyOn(taskQueue, "processEntries");
      expect(taskQueue.processEntries).not.toHaveBeenCalled();
      taskQueue.observe();
      jest.runOnlyPendingTimers();
      expect(taskQueue.processEntries).toHaveBeenCalled();
    });
  });

  describe("#disconnect", (): void => {
    it("should clear the intervalId", (): void => {
      jest.spyOn(window, "clearInterval");
      const taskQueue = new PollingPerformanceObserverTaskQueue();
      expect(window.clearInterval).not.toHaveBeenCalled();
      taskQueue.disconnect();
      expect(window.clearInterval).toHaveBeenCalledTimes(1);
      (window.clearInterval as jest.Mock).mockRestore();
    });
  });
});
