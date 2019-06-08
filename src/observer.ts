import PerformanceObserverTaskQueue from "./task-queue";
import EntryList from "./entry-list";

const VALID_TYPES = ["mark", "measure", "navigation", "resource"];
const ERRORS = {
  "no-entry-types": `Failed to execute 'observe' on 'PerformanceObserver': required member entryTypes is undefined.`,
  "invalid-entry-types": `Failed to execute 'observe' on 'PerformanceObserver': A Performance Observer MUST have at least one valid entryType in its entryTypes attribute.`
};

const isValidType = (type: string): boolean =>
  VALID_TYPES.some((t): boolean => type === t);

const globalTaskQueue = new PerformanceObserverTaskQueue();

class PerformanceObserver implements PollingPerformanceObserver {
  public callback: PerformanceObserverCallback;
  public buffer: Set<PerformanceEntry>;
  public entryTypes: string[] = [];
  private taskQueue: PerformanceObserverTaskQueue;

  public constructor(
    callback: PerformanceObserverCallback,
    taskQueue = globalTaskQueue
  ) {
    this.callback = callback;
    this.buffer = new Set();
    this.taskQueue = taskQueue;
  }

  public observe(options?: PerformanceObserverInit): void {
    if (!options || !options.entryTypes) {
      throw new Error(ERRORS["no-entry-types"]);
    }

    const entryTypes: string[] = options.entryTypes.filter(isValidType);

    if (!entryTypes.length) {
      throw new Error(ERRORS["invalid-entry-types"]);
    }

    this.entryTypes = entryTypes;

    this.taskQueue.add(this);
  }

  public disconnect(): void {
    this.taskQueue.remove(this);
  }

  public takeRecords(): PerformanceEntryList {
    const entries = Array.from(this.buffer);
    return new EntryList(entries);
  }
}

export default PerformanceObserver;
