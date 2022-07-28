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
    818182311: new AssetConfig("AF-BANK-USDC-STANDARD", 818182311, 6),
    386192725: new AssetConfig("goBTC", 386192725, 8),
    818184214: new AssetConfig("AF-BANK-GOBTC-STANDARD", 818184214, 6),
    386195940: new AssetConfig("goETH", 386195940, 8),
    818188553: new AssetConfig("AF-BANK-GOETH-STANDARD", 818188553, 6),
    312769: new AssetConfig("USDT", 312769, 6),
    818190568: new AssetConfig("AF-BANK-USDT-STANDARD", 818190568, 6),
    // v1 staking assets
    465865291 : new AssetConfig("STBL", 465865291, 6),
    470842789 : new AssetConfig("DEFLY", 470842789, 6),
    283820866 : new AssetConfig("XET", 283820866, 9),
    287867876 : new AssetConfig("OPUL", 287867876, 10),
    444035862 : new AssetConfig("ZONE", 444035862, 6),
    467020179 : new AssetConfig("TM-STBL-USDC-v1-LP", 467020179, 6),
    552737686 : new AssetConfig("TM-STBL-USDC-v1.1-LP", 552737686, 6),
    607645566 : new AssetConfig("AF-STBL-ALGO-0.25%-LP", 607645566, 6),
    609172718 : new AssetConfig("AF-STBL-USDC-0.25%-LP", 609172718, 6),
    658337286 : new AssetConfig("AF-STBL-USDC-NANO-LP", 658337286, 6),
    659678778 : new AssetConfig("AF-USDC-USDT-NANO-LP", 659678778, 6),
    659677515 : new AssetConfig("AF-STBL-USDT-NANO-LP", 659677515, 6),
    635256863 : new AssetConfig("AF-STBL-XET-0.75%-LP", 635256863, 6),
    647801343 : new AssetConfig("AF-STBL-ZONE-0.75%-LP", 647801343, 6),
    624956449 : new AssetConfig("AF-STBL-DEFLY-0.75%-LP", 624956449, 6),
    635846733 : new AssetConfig("AF-STBL-goBTC-0.25%-LP", 635846733, 6),
    635854339 : new AssetConfig("AF-STBL-goETH-0.25%-LP", 635854339, 6),
    637802380 : new AssetConfig("AF-STBL-OPUL-0.75%-LP", 637802380, 6),
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