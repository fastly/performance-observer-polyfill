import PerformanceObserverTaskQueue from "./task-queue";
import EntryList from "./entry-list";

const VALID_TYPES: readonly string[] = [
  "mark",
  "measure",
  "navigation",
  "resource"
];
const ERRORS = {
  "no-entry-types": `Failed to execute 'observe' on 'PerformanceObserver': either an 'entryTypes' or 'type' member must be present.`,
  "both-entry-types": `Failed to execute 'observe' on 'PerformanceObserver': either an 'entryTypes' or 'type' member must be present, not both.`
};
const WARNINGS = {
  "no-valid-entry-types": `Aborting 'observe' on 'PerformanceObserver': no valid entry types present in either 'entryTypes' or 'type' member.`,
  "entry-types-removed": `Invalid or unsupported entry types provided to 'observe' on 'PerformanceObserver'.`
};

const isValidType = (type: string): boolean =>
  VALID_TYPES.some((t): boolean => type === t);

const globalTaskQueue = new PerformanceObserverTaskQueue();

interface PollingPerformanceObserver extends PerformanceObserver {
  buffer: Set<PerformanceEntry>;
  callback: PerformanceObserverCallback;
  entryTypes: string[];
}

class PerformanceObserver implements PollingPerformanceObserver {
  public callback: PerformanceObserverCallback;
  public buffer: Set<PerformanceEntry>;
  public entryTypes: string[] = [];
  public static readonly supportedEntryTypes = VALID_TYPES;
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
    if (!options) {
      throw new Error(ERRORS["no-entry-types"]);
    }

    if (options.entryTypes && options.type) {
      throw new Error(ERRORS["both-entry-types"]);
    }

    let rawEntryTypes: string[];
    if (options.entryTypes) {
      rawEntryTypes = options.entryTypes;
    } else if (options.type) {
      rawEntryTypes = [options.type];
    } else {
      throw new Error(ERRORS["no-entry-types"]);
    }

    const entryTypes: string[] = rawEntryTypes.filter(isValidType);

    if (entryTypes.length > 0 && entryTypes.length !== rawEntryTypes.length) {
      console.warn(WARNINGS["entry-types-removed"]);
    }

    if (!entryTypes.length) {
      console.warn(WARNINGS["no-valid-entry-types"]);
      return;
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
