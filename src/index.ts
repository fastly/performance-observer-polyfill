/* global PerformanceObserver */
import PollingPerformanceObserver from "./observer";
const isSupported =
  "PerformanceObserver" in self && typeof PerformanceObserver === "function";

export default isSupported ? PerformanceObserver : PollingPerformanceObserver;
