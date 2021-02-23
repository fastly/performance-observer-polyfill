import { mocked } from "ts-jest/utils";
import PerformanceObserver from "./observer";
import PerformanceObserverTaskQueue from "./task-queue";

jest.mock(
  "./task-queue",
  (): jest.Mock =>
    jest.fn().mockImplementation((): any => {
      return {
        add: jest.fn(),
        remove: jest.fn()
      };
    })
);

const callbackFixture = jest.fn();

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
    const mockedConsoleWarn = jest.fn();
    const mockTaskQueue = mocked(new PerformanceObserverTaskQueue(), true);
    beforeAll((): void => {
      console.warn = mockedConsoleWarn;
    });
    afterEach((): void => {
      jest.resetAllMocks();
    });
    afterAll((): void => {
      console.warn = originalWarn;
    });

    it("should throw if no entryTypes or type are supplied", (): void => {
      const observer = new PerformanceObserver(callbackFixture, mockTaskQueue);
      expect(observer.observe).toThrow();
      expect((): void => observer.observe({ buffered: false })).toThrow();
    });

    it("should throw if both entryTypes and type are supplied", (): void => {
      const observer = new PerformanceObserver(callbackFixture, mockTaskQueue);
      expect((): void =>
        observer.observe({ entryTypes: ["resource"], type: "resource" })
      ).toThrow();
    });

    it("should validate entryTypes and ignore any invalid types", (): void => {
      const observer = new PerformanceObserver(callbackFixture, mockTaskQueue);
      observer.observe({ entryTypes: ["resource", "mark", "bad"] });
      expect(observer.entryTypes).toHaveLength(2);
      expect(observer.entryTypes).toEqual(["resource", "mark"]);
    });

    it("should warn if invalid entryTypes are supplied", (): void => {
      const observer = new PerformanceObserver(callbackFixture, mockTaskQueue);
      observer.observe({ entryTypes: ["resource", "mark", "bad"] });
      expect(mockedConsoleWarn).toHaveBeenCalledTimes(1);
    });

    it("should abort if no valid entryTypes are supplied", (): void => {
      const observer = new PerformanceObserver(callbackFixture, mockTaskQueue);
      observer.observe({ entryTypes: ["invalid"] });
      expect(mockedConsoleWarn).toHaveBeenCalledTimes(1);
      expect(mockTaskQueue.add).toHaveBeenCalledTimes(0);
    });

    it("should queue observer with valid entryTypes", (): void => {
      const fixture = { entryTypes: ["resource"] };
      const observer = new PerformanceObserver(callbackFixture, mockTaskQueue);
      observer.observe(fixture);
      expect(mockTaskQueue.add).toHaveBeenCalledTimes(1);
      expect(mockTaskQueue.add).toHaveBeenCalledWith(observer);
    });

    it("should queue observer with valid type", (): void => {
      const fixture = { type: "resource" };
      const observer = new PerformanceObserver(callbackFixture, mockTaskQueue);
      observer.observe(fixture);
      expect(mockTaskQueue.add).toHaveBeenCalledTimes(1);
      expect(mockTaskQueue.add).toHaveBeenCalledWith(observer);
    });
  });

  describe("#disconnect", (): void => {
    const mockTaskQueue = mocked(new PerformanceObserverTaskQueue(), true);
    afterEach((): void => {
      jest.resetAllMocks();
    });

    it("should remove observer from the task queue", (): void => {
      const observer = new PerformanceObserver(callbackFixture, mockTaskQueue);
      observer.disconnect();
      expect(mockTaskQueue.remove).toHaveBeenCalledTimes(1);
      expect(mockTaskQueue.remove).toHaveBeenCalledWith(observer);
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
