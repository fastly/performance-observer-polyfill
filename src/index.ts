/* global PerformanceObserver */
import PollingPerformanceObserver from "./observer";
const isSupported =
  "PerformanceObserver" in window && typeof PerformanceObserver === "function";

export default isSupported ? PerformanceObserver : PollingPerformanceObserver;
