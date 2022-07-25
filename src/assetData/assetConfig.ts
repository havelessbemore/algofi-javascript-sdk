// IMPORTS

// global
import { Network } from "./../globals"

// INTERFACE

export default class AssetConfig {
  public name: string
  public assetId: number
  public decimals: number

  /**
   * Constructor for the asset config class.
   * 
   * @param name - asset name
   * @param assetId - asset id
   * @param decimals - asset decimals
   */
  constructor(name: string, assetId: number, decimals: number) {
    this.name = name
    this.assetId = assetId
    this.decimals = decimals
  }
}

export const AssetConfigs = {
  [Network.MAINNET]: {
    1: new AssetConfig("ALGO", 1, 6),
    818179690: new AssetConfig("AF-BANK-ALGO-STANDARD", 818179690, 6),
    31566704: new AssetConfig("USDC", 31566704, 6),
    818182311: new AssetConfig("AF-BANK-USDC-STANDARD", 812916935, 6),
    386192725: new AssetConfig("goBTC", 386192725, 8),
    818184214: new AssetConfig("AF-BANK-GOBTC-STANDARD", 818184214, 6),
    386195940: new AssetConfig("goETH", 386195940, 8),
    818188553: new AssetConfig("AF-BANK-GOETH-STANDARD", 818188553, 6),
    312769: new AssetConfig("USDT", 312769, 6),
    818190568: new AssetConfig("AF-BANK-USDT-STANDARD", 818190568, 6),
  },
  [Network.MAINNET_CLONE3]: {
    1: new AssetConfig("ALGO", 1, 6),
    812910520: new AssetConfig("AF-BANK-ALGO-STANDARD", 812910520, 6),
    812915205: new AssetConfig("USDC", 812915205, 6),
    812916935: new AssetConfig("AF-BANK-USDC-STANDARD", 812916935, 6),
    812930638: new AssetConfig("USDT", 812930638, 6),
    812931295: new AssetConfig("AF-BANK-USDT-STANDARD", 812931295, 6),
    812919854: new AssetConfig("goBTC", 812919854, 8),
    812920370: new AssetConfig("AF-BANK-GOBTC-STANDARD", 812920370, 6),
    812922836: new AssetConfig("goETH", 812922836, 8),
    812924856: new AssetConfig("AF-BANK-GOETH-STANDARD", 812924856, 6),
    812932283: new AssetConfig("STBL2", 812932283, 6),
    812936076: new AssetConfig("AF-BANK-STBL-STBL2", 812936076, 6),
    812928844: new AssetConfig("AF-BANK-BANK-STANDARD", 812928844, 6),
  }
}