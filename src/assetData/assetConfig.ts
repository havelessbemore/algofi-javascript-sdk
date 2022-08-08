// IMPORTS

// global
import { Network } from "./../globals"

// INTERFACE

export default class AssetConfig {
  public name: string
  public assetId: number
  public decimals: number
  public defaultPrice: number

  /**
   * Constructor for the asset config class.
   * 
   * @param name - asset name
   * @param assetId - asset id
   * @param decimals - asset decimals
   */
  constructor(name: string, assetId: number, decimals: number, defaultPrice: number) {
    this.name = name
    this.assetId = assetId
    this.decimals = decimals
    this.defaultPrice = defaultPrice
  }
}

export const AssetConfigs = {
  [Network.MAINNET]: {
    1: new AssetConfig("ALGO", 1, 6, undefined),
    818179690: new AssetConfig("AF-BANK-ALGO-STANDARD", 818179690, 6, undefined),
    31566704: new AssetConfig("USDC", 31566704, 6, undefined),
    818182311: new AssetConfig("AF-BANK-USDC-STANDARD", 818182311, 6, undefined),
    386192725: new AssetConfig("goBTC", 386192725, 8, undefined),
    818184214: new AssetConfig("AF-BANK-GOBTC-STANDARD", 818184214, 6, undefined),
    386195940: new AssetConfig("goETH", 386195940, 8, undefined),
    818188553: new AssetConfig("AF-BANK-GOETH-STANDARD", 818188553, 6, undefined),
    312769: new AssetConfig("USDT", 312769, 6, undefined),
    818190568: new AssetConfig("AF-BANK-USDT-STANDARD", 818190568, 6, undefined),
    // v1 staking assets
    465865291 : new AssetConfig("STBL", 465865291, 6, undefined),
    470842789 : new AssetConfig("DEFLY", 470842789, 6, undefined),
    283820866 : new AssetConfig("XET", 283820866, 9, undefined),
    287867876 : new AssetConfig("OPUL", 287867876, 10, undefined),
    444035862 : new AssetConfig("ZONE", 444035862, 6, undefined),
    467020179 : new AssetConfig("TM-STBL-USDC-v1-LP", 467020179, 6, 1.0),
    552737686 : new AssetConfig("TM-STBL-USDC-v1.1-LP", 552737686, 6, 1.0),
    607645566 : new AssetConfig("AF-STBL-ALGO-0.25%-LP", 607645566, 6, undefined),
    609172718 : new AssetConfig("AF-STBL-USDC-0.25%-LP", 609172718, 6, undefined),
    658337286 : new AssetConfig("AF-STBL-USDC-NANO-LP", 658337286, 6, undefined),
    659678778 : new AssetConfig("AF-USDC-USDT-NANO-LP", 659678778, 6, undefined),
    659677515 : new AssetConfig("AF-STBL-USDT-NANO-LP", 659677515, 6, undefined),
    635256863 : new AssetConfig("AF-STBL-XET-0.75%-LP", 635256863, 6, undefined),
    647801343 : new AssetConfig("AF-STBL-ZONE-0.75%-LP", 647801343, 6, undefined),
    624956449 : new AssetConfig("AF-STBL-DEFLY-0.75%-LP", 624956449, 6, undefined),
    635846733 : new AssetConfig("AF-STBL-goBTC-0.25%-LP", 635846733, 6, undefined),
    635854339 : new AssetConfig("AF-STBL-goETH-0.25%-LP", 635854339, 6, undefined),
    637802380 : new AssetConfig("AF-STBL-OPUL-0.75%-LP", 637802380, 6, undefined),
  },
  [Network.TESTNET]: {
    1: new AssetConfig("ALGO", 1, 6, undefined),
  }
}