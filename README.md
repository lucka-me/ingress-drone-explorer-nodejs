# Ingress Drone Explorer - Node.js

[![CI](https://github.com/lucka-me/ingress-drone-explorer-nodejs/actions/workflows/ci.yml/badge.svg)](https://github.com/lucka-me/ingress-drone-explorer-nodejs/actions/workflows/ci.yml "CI Workflow")
[![Lines of code][nodejs-loc]][nodejs-repo]

An offline CLI tool to analyze reachable Portals for Ingress Drone Mark I.

Implementations in different languages are listed and compared in [Benchmark](#benchmark).

The CI workflow builds x64 and arm64 binary for macOS, Windows and Linux, the files are available as artifacts.

## Build from Source

### Requirements

- Node 18 (Backporting should be possible and easy)

### Build

```sh
$ npm init
$ npm run build
$ npm run package # Package an executable with pkg
```

Please notice the [`pkg`](https://github.com/vercel/pkg) will download necessary binary files to `~/.pkg-cache`, it may be overriden by environment variable `PKG_CACHE_PATH`:

```sh
$ export PKG_CACHE_PATH=./.pkg-cache
$ npm run package
```

## Exploration Guide

### Prepare Files

All the files should be JSON.

1. Portal list file(s), should be an array of:
    ```jsonc
    {
        "guid": "GUID of Portal",
        "title": "Title of Portal",
        "lngLat": {
            "lng": 90.0,    // Longitude
            "lat": 45.0     // Latitude
        }
    }
    ```
2. Portal Key list file, should be an array of GUID (Not required but strongly recommended)

Maybe an IITC plugin like [this](https://github.com/lucka-me/toolkit/tree/master/Ingress/Portal-List-Exporter) helps.

### Usage

```
$ ingress-drone-explorer <portal-list-file> -s <longitude,latitude> [options...]
```

#### Options

Explore with key list:
```sh
$ ... -k <path-to-key-list-file>
```

Output cells JSON for IITC Draw tools:
```sh
$ ... --output-drawn-items <path-to-output>
```

Help information:
```sh
$ ingress-drone-explorer -h
```

## Benchmark

### Sample Data

- Area: Shenzhen downtown and Hong Kong
- Portals: 34,041 Portals in 13,451 cells
- Keys: 11 matched
- Start Point: Shenzhen Bay Sports Center
- Result: 30,462 Portals and 11,342 cells are reachable

### Result

Average exploration time consumed of 100 executions on MacBook Air (M2).

|         Implementation | Lines of Code   |  Commit                             | Consumed
| ---------------------: | :-------------: | :---------------------------------: | :---
| [Node.js][nodejs-repo] | ![][nodejs-loc] | `Current`                           | 1.295 s
|        [C++][cpp-repo] | ![][cpp-loc]    | [`db5a976`][cpp-benchmark-commit]   | 0.583 s
|    [Swift][swift-repo] | ![][swift-loc]  | [`68ae1b4`][swift-benchmark-commit] | 3.000 s

The results of other implementations may be outdated, please check their repositories for latest results.

[nodejs-repo]: https://github.com/lucka-me/ingress-drone-explorer-nodejs
[nodejs-loc]: https://img.shields.io/tokei/lines/github/lucka-me/ingress-drone-explorer-nodejs

[cpp-repo]: https://github.com/lucka-me/ingress-drone-explorer-cpp
[cpp-loc]: https://img.shields.io/tokei/lines/github/lucka-me/ingress-drone-explorer-cpp
[cpp-benchmark-commit]: https://github.com/lucka-me/ingress-drone-explorer-cpp/commit/db5a976

[swift-repo]: https://github.com/lucka-me/ingress-drone-explorer-swift
[swift-loc]: https://img.shields.io/tokei/lines/github/lucka-me/ingress-drone-explorer-swift
[swift-benchmark-commit]: https://github.com/lucka-me/ingress-drone-explorer-swift/commit/68ae1b4