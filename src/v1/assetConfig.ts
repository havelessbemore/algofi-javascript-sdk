// IMPORTS

import { Network } from "./globals"

// INTERFACE

export default class AssetConfig {
  public name : string
  public assetId : number
  public decimals : number
  
  constructor(
    name: string,
    assetId: number,
    decimals: number) {
      this.name = name
      this.assetId = assetId
      this.decimals = decimals
    }
}

export const AssetConfigs = {
  [Network.MAINNET] : {
    1 : new AssetConfig("ALGO", 1, 6)
  },
    [Network.MAINNET_CLONE] : {
    1 : new AssetConfig("ALGO", 1, 6),
    753117075 : new AssetConfig("AF-BANK-ALGO-STANDARD", 91638233, 6),
    753101315 : new AssetConfig("USDC", 91634316, 6),
    753119272 : new AssetConfig("AF-BANK-USDC-STANDARD", 91638306, 6),
    753101485 : new AssetConfig("USDT", 91634828, 6),
    753119789 : new AssetConfig("AF-BANK-USDT-STANDARD", 91638392, 6),
    753102180 : new AssetConfig("GOBTC", 91634454, 8),
    753120742 : new AssetConfig("AF-BANK-GOBTC-STANDARD", 91638538, 6),
    753102376 : new AssetConfig("GOETH", 91634487, 8),
    753121086 : new AssetConfig("AF-BANK-GOETH-STANDARD", 91638603, 6),
    753103963 : new AssetConfig("WETH", 91634534, 6),
    753121726 : new AssetConfig("AF-BANK-WETH-STANDARD", 91638687, 6),
    753103642 : new AssetConfig("WBTC", 91634562, 6),
    753121416 : new AssetConfig("AF-BANK-WBTC-STANDARD", 91638794, 6),
    753104158 : new AssetConfig("WSOL", 91634691, 6),
    753122003 : new AssetConfig("AF-BANK-WSOL-STANDARD", 91638864, 6),
    753122631 : new AssetConfig("AF-BANK-ALGO-VAULT", 91639146, 6),
    753101784 : new AssetConfig("STBL", 91634578, 6),
    753120193 : new AssetConfig("AF-BANK-STBL-STBL", 91638952, 6),
    753104718 : new AssetConfig("BANK", 91634736, 6),
    753122293 : new AssetConfig("AF-BANK-BANK-STANDARD", 91639074, 6),
  },
    [Network.TESTNET] : {
    1 : new AssetConfig("ALGO", 1, 6),
    91638233 : new AssetConfig("AF-BANK-ALGO-STANDARD", 91638233, 6),
    91634316 : new AssetConfig("USDC", 91634316, 6),
    91638306 : new AssetConfig("AF-BANK-USDC-STANDARD", 91638306, 6),
    91634828 : new AssetConfig("USDT", 91634828, 6),
    91638392 : new AssetConfig("AF-BANK-USDT-STANDARD", 91638392, 6),
    91634454 : new AssetConfig("GOBTC", 91634454, 8),
    91638538 : new AssetConfig("AF-BANK-GOBTC-STANDARD", 91638538, 6),
    91634487 : new AssetConfig("GOETH", 91634487, 8),
    91638603 : new AssetConfig("AF-BANK-GOETH-STANDARD", 91638603, 6),
    91634534 : new AssetConfig("WETH", 91634534, 6),
    91638687 : new AssetConfig("AF-BANK-WETH-STANDARD", 91638687, 6),
    91634562 : new AssetConfig("WBTC", 91634562, 6),
    91638794 : new AssetConfig("AF-BANK-WBTC-STANDARD", 91638794, 6),
    91634691 : new AssetConfig("WSOL", 91634691, 6),
    91638864 : new AssetConfig("AF-BANK-WSOL-STANDARD", 91638864, 6),
    91639146 : new AssetConfig("AF-BANK-ALGO-VAULT", 91639146, 6),
    91634578 : new AssetConfig("STBL", 91634578, 6),
    91638952 : new AssetConfig("AF-BANK-STBL-STBL", 91638952, 6),
    91634736 : new AssetConfig("BANK", 91634736, 6),
    91639074 : new AssetConfig("AF-BANK-BANK-STANDARD", 91639074, 6),
  }
}