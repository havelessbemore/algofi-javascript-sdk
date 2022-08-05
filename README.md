# algofi-javascript-sdk

[![CircleCI](https://dl.circleci.com/status-badge/img/gh/Algofiorg/algofi-javascript-sdk/tree/main.svg?style=svg)](https://dl.circleci.com/status-badge/redirect/gh/Algofiorg/algofi-javascript-sdk/tree/main)

Official JavaScript SDK for the Algofi Protocol

## Documentation
https://algofiorg.github.io/algofi-javascript-sdk

## Design Goal
This SDK is useful for developers who want to programatically interact with the Algofi Protocol.

## Status
This SDK is currently under active early development and should not be considered stable.

## Installation

### [Node.js](https://nodejs.org/en/download/)

```
git clone git@github.com:Algofiorg/algofi-javascript-sdk.git && cd algofi-javascript-sdk
npm install
cd test && npm install && cd ..
```

## Generate Documentation

To generate docs, cd into the root folder and run

```
npx typedoc src/index.ts
```
