interface PollingPerformanceObserver extends PerformanceObserver {
  buffer: Set<PerformanceEntry>;
  callback: PerformanceObserverCallback;
  entryTypes: string[];
}

interface PerformanceObserverTaskQueueOptions {
  registeredObservers?: Set<PollingPerformanceObserver>;
  processedEntries?: Set<PerformanceEntry>;
  interval?: number;
  context?: any;
}
