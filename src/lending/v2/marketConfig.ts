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
    new MarketConfig(841145020, 841126810, 841157954, MarketType.STBL), // STBL2
    new MarketConfig(841194726, 841171328, 841462373, MarketType.LP), // bUSDC-bSTBL2 LP
    new MarketConfig(849556509, 842179393, 849576890, MarketType.STBL), // wETH
    new MarketConfig(849556807, 846904356, 849581529, MarketType.STBL), // wUSDC
  ],
  [Network.TESTNET]: [
    new MarketConfig(104193717, 1, 104193939, MarketType.STANDARD), // ALGO
    new MarketConfig(104207076, 104194013, 104207173, MarketType.STANDARD), // USDC
    new MarketConfig(104209685, 104208050, 104222974, MarketType.STANDARD), // USDT
    new MarketConfig(104207403, 104207287, 104207503, MarketType.STANDARD), // goBTC
    new MarketConfig(104207719, 104207533, 104207983, MarketType.STANDARD), // goETH
    new MarketConfig(104213311, 104210500, 104217422, MarketType.STBL), // STBL2
    new MarketConfig(104238373, 104228491, 104238470, MarketType.LP) // bUSDC-bSTBL2 LP
  ],
}
