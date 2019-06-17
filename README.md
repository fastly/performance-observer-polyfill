<h1 align="center" style="border-bottom: none;">🔎 PerformanceObserver Polyfill</h1>
<p align="center">
  <a href="https://travis-ci.org/fastly/performance-observer-polyfill">
    <img alt="Travis" src="https://img.shields.io/travis/fastly/performance-observer-polyfill/master.svg">
  </a>
  <a href="https://unpkg.com/@fastly/performance-observer-polyfill/polyfill">
    <img src="https://img.badgesize.io/https://unpkg.com/@fastly/performance-observer-polyfill/polyfill/index.js?compression=gzip" alt="gzip size">
  </a>
</p>

The [`PerformanceObserver`](https://developer.mozilla.org/en-US/docs/Web/API/PerformanceObserver) interface is a JavaScript API that can be used to observe the [Performance Timeline](https://www.w3.org/TR/performance-timeline-2/#dfn-performance-timeline) to be notified of new performance metrics as they are recorded.

This polyfill allows consumers to use the `PerformanceObserver` interface within browser environments, which have basic Performance Timeline support (I.e. `window.performance.getEntries()`), but don't have observer support. 

The polyfill works by falling back to polling the Performance Timeline on a given interval and calling all subscribed observers with the resulting set of entires. 

## Quick links
- [Installation](#installation)
- [Usage](#usage)
- [Development](#development)
- [License](#license)

## Installation
```sh
npm install --save @fastly/performance-observer-polyfill
```

## Usage: 

### As a [polyfill](https://ponyfill.com/#polyfill)
This automatically "installs" PerformanceObserverPolyfill as `window.PerformanceObserver()` if it detects PerformanceObserver isn't supported:

```js
import '@fastly/performance-observer-polyfill/polyfill'

// PerformanceObserver is now available globally!
const observer = new PerformanceObserver((list) => {});
observer.observe({entryTypes: ['resource']});
```

### Usage: As a [ponyfill](https://github.com/sindresorhus/ponyfill)

With a module bundler like [rollup](http://rollupjs.org) or [webpack](https://webpack.js.org),
you can import `@fastly/performance-observer-polyfill` to use in your code without modifying any globals:

```js
// using JS Modules:
import PerformanceObserver from '@fastly/performance-observer-polyfill'

// or using CommonJS:
const PerformanceObserver = require('@fastly/performance-observer-polyfill')

// usage:
const observer = new PerformanceObserver((list) => {});
observer.observe({entryTypes: ['resource']})
```

## Caveats
As the polyfill implements the PerformanceObserver interface by falling back to polling the Performance Timeline via a call to `window.performance.getEntries()` we are limited to only expose timeline entry types that are supported by `getEntries()`. Therefore the polyfill can only be used to observe the entry types: `navigation`, `resource` and `mark`. Newer entry types such as `paint` are only exposed by the native PerformanceObserver implementation and thus not polyfillable. 

## Development

### Requirements
- Node.js >= 10a

### Install
```sh
git clone git@github.com:fastly/performance-observer-polyfill.git
cd performance-observer-polyfill
npm install
npm run build
```

## Running
Most actions you'd like to perform whilst developing performance-observer-polyfill are defined as NPM scripts tasks and can be invoked using `npm run {task}`.

A list of all commands and their description can be found below.


| Name      | Description                                                                                                    |
| --------- | -------------------------------------------------------------------------------------------------------------- |
| build     | Compiles the application for production environments                                                           |
| build:dev | Compiles the application for development                                                                       |
| lint      | Lints the source files for style errors using ESLint and automatically formats the source files using prettier |
| test      | Runs the unit test suite                                                                                       |

## License
[MIT](https://github.com/fastly/insights.js/blob/master/LICENSE)
