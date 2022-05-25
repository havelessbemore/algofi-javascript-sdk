// IMPORTS

// global
import { Network } from "./../globals"

// local
import { MarketType } from "./lendingConfig"

// INTERFACE

export default class MarketConfig {
  public appId : number
  public underlyingAssetId : number
  public bAssetId : number
  public marketType : MarketType
  
  constructor(
    appId : number,
    underlyingAssetId : number,
    bAssetId : number,
    marketType : MarketType) {
      this.appId = appId
      this.underlyingAssetId = underlyingAssetId
      this.bAssetId = bAssetId
      this.marketType = marketType
    }
}

export const MarketConfigs = {
  [Network.MAINNET] : [
    new MarketConfig(0, 1, 0, MarketType.STANDARD) // ALGO
  ],
  [Network.MAINNET_CLONE] : [
    new MarketConfig(753107352, 1, 753117075, MarketType.STANDARD), // ALGO
    new MarketConfig(753108247, 753101315, 753119272, MarketType.STANDARD), // USDC
    new MarketConfig(753108576, 753101485, 753119789, MarketType.STANDARD), // USDT
    new MarketConfig(753109347, 753101784, 753120193, MarketType.STANDARD), // STBL
    new MarketConfig(753110308, 753102180, 753120742, MarketType.STANDARD), // GOBTC
    new MarketConfig(753110704, 753102376, 753121086, MarketType.STANDARD), // GOETH
    new MarketConfig(753110470, 753103642, 753121416, MarketType.STANDARD), // WBTC
    new MarketConfig(753110943, 753103963, 753121726, MarketType.STANDARD), // WETH
    new MarketConfig(753111321, 753104158, 753122003, MarketType.STANDARD), // WSOL
    new MarketConfig(753111740, 753104718, 753122293, MarketType.STANDARD), // BANK
    new MarketConfig(753112308, 1, 753122631, MarketType.STANDARD), // vALGO
  ],
  [Network.TESTNET] : [
    new MarketConfig(91635808, 1, 91638233, MarketType.STANDARD),
    new MarketConfig(91636097, 91634316, 91638306, MarketType.STANDARD),
    new MarketConfig(91636162, 91634828, 91638392, MarketType.STANDARD),
    new MarketConfig(91636638, 91634454, 91638538, MarketType.STANDARD),
    new MarketConfig(91636680, 91634487, 91638603, MarketType.STANDARD),
    new MarketConfig(91636742, 91634534, 91638687, MarketType.STANDARD),
    new MarketConfig(91636787, 91634562, 91638794, MarketType.STANDARD),
    new MarketConfig(91636896, 91634691, 91638864, MarketType.STANDARD),
    new MarketConfig(91637209, 1, 91639146, MarketType.VAULT),
    new MarketConfig(91637110, 91634578, 91638952, MarketType.STBL),
    new MarketConfig(91636998, 91634736, 91639074, MarketType.STANDARD),
  ]
}