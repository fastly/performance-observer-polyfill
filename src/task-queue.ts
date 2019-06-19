import EntryList from "./entry-list";
import PollingPerformanceObserver from "./observer";

interface PerformanceObserverTaskQueueOptions {
  registeredObservers?: Set<PollingPerformanceObserver>;
  processedEntries?: Set<PerformanceEntry>;
  interval?: number;
  context?: any;
}

class PollingPerformanceObserverTaskQueue {
  private registeredObservers: Set<PollingPerformanceObserver>;
  private processedEntries: Set<PerformanceEntry>;
  private interval: number;
  private intervalId: number | null;
  private context: any;

  public constructor({
    registeredObservers = new Set(),
    processedEntries = new Set(),
    interval = 100,
    context = self
  }: PerformanceObserverTaskQueueOptions = {}) {
    this.registeredObservers = registeredObservers;
    this.processedEntries = processedEntries;
    this.interval = interval;
    this.context = context;
    this.intervalId = null;
  }

  public getNewEntries(): PerformanceEntry[] {
    const entries = this.context.performance.getEntries();
    return entries.filter(
      (entry: PerformanceEntry): boolean => !this.processedEntries.has(entry)
    );
  }

  public getObserversForType(
    observers: Set<PollingPerformanceObserver>,
    type: string
  ): PollingPerformanceObserver[] {
    return Array.from(observers).filter(
      (observer: PollingPerformanceObserver): boolean => {
        return observer.entryTypes.some((t): boolean => t === type);
      }
    );
  }

  public processBuffer(observer: PollingPerformanceObserver): void {
    const entries = Array.from(observer.buffer);
    const entryList = new EntryList(entries);
    observer.buffer.clear();

    if (entries.length && observer.callback) {
      observer.callback.call(undefined, entryList, observer);
    }
  }

  public processEntries(): void {
    const entries = this.getNewEntries();

    entries.forEach((entry): void => {
      const { entryType } = entry;
      const observers = this.getObserversForType(
        this.registeredObservers,
        entryType
      );
      // Add the entry to observer buffer
      observers.forEach((observer): void => {
        observer.buffer.add(entry);
      });
      // Mark the entry as processed
      this.processedEntries.add(entry);
    });

    // Queue task to process all observer buffers
    const task = (): void =>
      this.registeredObservers.forEach(this.processBuffer);
    if ("requestAnimationFrame" in this.context) {
      this.context.requestAnimationFrame(task);
    } else {
      this.context.setTimeout(task, 0);
    }
  }

  public add(observer: PollingPerformanceObserver): void {
    this.registeredObservers.add(observer);

    if (this.registeredObservers.size === 1) {
      this.observe();
    }
  }

  public remove(observer: PollingPerformanceObserver): void {
    this.registeredObservers.delete(observer);

    if (!this.registeredObservers.size) {
      this.disconnect();
    }
  }

  public observe(): void {
    this.intervalId = this.context.setInterval(
      this.processEntries.bind(this),
      this.interval
    );
  }

  public disconnect(): void {
    this.intervalId = this.context.clearInterval(this.intervalId);
  }
}

export default PollingPerformanceObserverTaskQueue;
