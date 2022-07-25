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
    // v1 staking assets
    465865291 : new AssetConfig("STBL Staking", 465865291, 6),
    470842789 : new AssetConfig("DEFLY Staking", 470842789, 6),
    287867876 : new AssetConfig("OPUL Staking", 287867876, 10),
    467020179 : new AssetConfig("Tinyman v1 STBL-USDC LP Staking", 467020179, 6),
    552737686 : new AssetConfig("Tinyman v1.1 STBL-USDC LP Staking", 552737686, 6),
    607645566 : new AssetConfig("Algofi STBL-ALGO LP Staking", 607645566, 6),
    609172718 : new AssetConfig("Algofi STBL-USDC LP Staking", 609172718, 6),
    658337286 : new AssetConfig("Algofi STBL-USDC Nano LP Staking", 658337286, 6),
    659678778 : new AssetConfig("Algofi USDC-USDT Nano LP Staking", 659678778, 6),
    659677515 : new AssetConfig("Algofi STBL-USDT Nano LP Staking", 659677515, 6),
    635256863 : new AssetConfig("Algofi STBL-XET LP Staking", 635256863, 6),
    647801343 : new AssetConfig("Algofi STBL-ZONE LP Staking", 647801343, 6),
    624956449 : new AssetConfig("Algofi STBL-DEFLY LP Staking", 624956449, 6),
    635846733 : new AssetConfig("Algofi STBL-goBTC LP Staking", 635846733, 6),
    635854339 : new AssetConfig("Algofi STBL-goETH LP Staking", 635854339, 6),
    637802380 : new AssetConfig("Algofi STBL-OPUL LP Staking", 637802380, 6),
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