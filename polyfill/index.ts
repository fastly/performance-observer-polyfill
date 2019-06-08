import PerformanceObserver from "../src/index";
const ctx = window || self;
if (!ctx.PerformanceObserver) ctx.PerformanceObserver = PerformanceObserver;
