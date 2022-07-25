// IMPORTS

// global
import { Network } from "../../globals"

// local
import { MarketType } from "./lendingConfig"

// INTERFACE

export default class MarketConfig {
  public appId: number
  public underlyingAssetId: number
  public bAssetId: number
  public marketType: MarketType

  /**
   * Constructor for the market config class
   * 
   * @param appId - market app id
   * @param underlyingAssetId - underlying asset id
   * @param bAssetId - b asset id
   * @param marketType - market type
   */
  constructor(appId: number, underlyingAssetId: number, bAssetId: number, marketType: MarketType) {
    this.appId = appId
    this.underlyingAssetId = underlyingAssetId
    this.bAssetId = bAssetId
    this.marketType = marketType
  }
}

export const MarketConfigs = {
  [Network.MAINNET]: [
    new MarketConfig(818179346, 1, 818179690, MarketType.STANDARD), // ALGO
    new MarketConfig(818182048, 31566704, 818182311, MarketType.STANDARD), // USDC
    new MarketConfig(818183964, 386192725, 818184214, MarketType.STANDARD), // goBTC
    new MarketConfig(818188286, 386195940, 818188553, MarketType.STANDARD), // goETH
    new MarketConfig(818190205, 312769, 818190568, MarketType.STANDARD), // USDT
  ],
  [Network.MAINNET_CLONE3]: [
    new MarketConfig(812905712, 1, 812910520, MarketType.STANDARD), // ALGO
    new MarketConfig(812916046, 812915205, 812916935, MarketType.STANDARD), // USDC
    new MarketConfig(812930890, 812930638, 812931295, MarketType.STANDARD), // USDT
    new MarketConfig(812935796, 812932283, 812936076, MarketType.STBL), // STBL2
    new MarketConfig(812919965, 812919854, 812920370, MarketType.STANDARD), // GOBTC
    new MarketConfig(812923132, 812922836, 812924856, MarketType.STANDARD), // GOETH
    new MarketConfig(812928007, 1, 812928844, MarketType.VAULT) // vALGO
  ],
}
