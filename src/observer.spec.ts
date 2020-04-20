import PerformanceObserver from "./observer";
import PerformanceObserverTaskQueue from "./task-queue";

const mockTaskQueueAdd = jest.fn();
const mockTaskQueueRemove = jest.fn();
jest.mock(
  "./task-queue",
  (): jest.Mock => {
    return jest.fn().mockImplementation((): any => {
      return {
        add: mockTaskQueueAdd,
        remove: mockTaskQueueRemove
      };
    });
  }
);

// eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
const callbackFixture = (entires: PerformanceObserverEntryList): void => {};

describe("PerformanceObserver", (): void => {
  it("should return a class", (): void => {
    const observer = new PerformanceObserver(callbackFixture);
    expect(observer).toBeInstanceOf(PerformanceObserver);
  });

  it("should accept a callback parameter and assign it a property", (): void => {
    const observer = new PerformanceObserver(callbackFixture);
    expect(observer).toHaveProperty("callback");
    expect(typeof observer.callback).toBe("function");
  });

  it("should instantiate an entryTypes property", (): void => {
    const observer = new PerformanceObserver(callbackFixture);
    expect(observer).toHaveProperty("entryTypes");
    expect(observer.entryTypes).toBeInstanceOf(Array);
    expect(observer.entryTypes).toHaveLength(0);
  });

  it("should instantiate a buffer", (): void => {
    const observer = new PerformanceObserver(callbackFixture);
    expect(observer).toHaveProperty("buffer");
    expect(observer.buffer).toBeInstanceOf(Set);
  });

  it("should default to using the global task queue", (): void => {
    const observer = new PerformanceObserver(callbackFixture);
    expect(observer).toHaveProperty("taskQueue");
  });

  describe("#observe", (): void => {
    const originalWarn = console.warn;
    let consoleOutput: string[] = [];
    const mockedWarn = (output: string): number => consoleOutput.push(output);

    beforeEach((): void => {
      mockTaskQueueAdd.mockClear();
      consoleOutput = [];
      console.warn = mockedWarn;
    });
    afterEach((): void => {
      console.warn = originalWarn;
    });

    it("should throw if no entryTypes or type are supplied", (): void => {
      const observer = new PerformanceObserver(
        callbackFixture,
        new PerformanceObserverTaskQueue()
      );
      expect(observer.observe).toThrow();
      expect((): void => observer.observe({ buffered: false })).toThrow();
    });

    it("should throw if both entryTypes and type are supplied", (): void => {
      const observer = new PerformanceObserver(
        callbackFixture,
        new PerformanceObserverTaskQueue()
      );
      expect((): void =>
        observer.observe({ entryTypes: ["resource"], type: "resource" })
      ).toThrow();
    });

    it("should validate entryTypes and ignore any invalid types", (): void => {
      const observer = new PerformanceObserver(
        callbackFixture,
        new PerformanceObserverTaskQueue()
      );
      observer.observe({ entryTypes: ["resource", "mark", "bad"] });
      expect(observer.entryTypes).toHaveLength(2);
      expect(observer.entryTypes).toEqual(["resource", "mark"]);
    });

    it("should warn if invalid entryTypes are supplied", (): void => {
      const observer = new PerformanceObserver(
        callbackFixture,
        new PerformanceObserverTaskQueue()
      );
      observer.observe({ entryTypes: ["resource", "mark", "bad"] });
      expect(consoleOutput).toHaveLength(1);
    });

    it("should abort if no valid entryTypes are supplied", (): void => {
      const observer = new PerformanceObserver(
        callbackFixture,
        new PerformanceObserverTaskQueue()
      );

      observer.observe({ entryTypes: ["invalid"] });
      expect(consoleOutput).toHaveLength(1);
      expect(mockTaskQueueAdd).toHaveBeenCalledTimes(0);
    });

    it("should queue observer with valid entryTypes", (): void => {
      const fixture = { entryTypes: ["resource"] };
      const observer = new PerformanceObserver(
        callbackFixture,
        new PerformanceObserverTaskQueue()
      );
      observer.observe(fixture);
      expect(mockTaskQueueAdd).toHaveBeenCalledTimes(1);
      expect(mockTaskQueueAdd).toHaveBeenCalledWith(observer);
    });

    it("should queue observer with valid type", (): void => {
      const fixture = { type: "resource" };
      const observer = new PerformanceObserver(
        callbackFixture,
        new PerformanceObserverTaskQueue()
      );
      observer.observe(fixture);
      expect(mockTaskQueueAdd).toHaveBeenCalledTimes(1);
      expect(mockTaskQueueAdd).toHaveBeenCalledWith(observer);
    });
  });

  describe("#disconnect", (): void => {
    beforeEach((): void => mockTaskQueueRemove.mockClear());

    it("should remove observer from the task queue", (): void => {
      const observer = new PerformanceObserver(
        callbackFixture,
        new PerformanceObserverTaskQueue()
      );
      observer.disconnect();
      expect(mockTaskQueueRemove).toHaveBeenCalledTimes(1);
      expect(mockTaskQueueRemove).toHaveBeenCalledWith(observer);
    });
  });

  describe("#takeRecords", (): void => {
    it("should return a copy of the buffer as an EntryList", (): void => {
      const observer = new PerformanceObserver(callbackFixture);
      const result = observer.takeRecords();
      expect(result).toBeInstanceOf(Array);
      expect(result).toHaveLength(0);
    });
  });
});
