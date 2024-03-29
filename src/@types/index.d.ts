declare namespace PollingPerformanceObserver {
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
}

// eslint-disable-next-line no-redeclare
declare const PollingPerformanceObserver: typeof PerformanceObserver;

export default PollingPerformanceObserver;
