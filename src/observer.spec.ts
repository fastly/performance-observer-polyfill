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
    beforeEach((): void => mockTaskQueueAdd.mockClear());

    it("should throw if no entryTypes are supplied", (): void => {
      const observer = new PerformanceObserver(
        callbackFixture,
        new PerformanceObserverTaskQueue()
      );
      expect(observer.observe).toThrow();
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

    it("should throw if no vaild entryTypes are supplied", (): void => {
      const observer = new PerformanceObserver(
        callbackFixture,
        new PerformanceObserverTaskQueue()
      );
      expect((): void => observer.observe({ entryTypes: ["invalid"] })).toThrow;
    });

    it("should queue observer", (): void => {
      const fixture = { entryTypes: ["resource"] };
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
