// IMPORTS

// global
import { Network } from "./../globals"

// INTERFACE

export default class AssetConfig {
  public name: string
  public unitName: string
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
  constructor(name: string, unitName: string, assetId: number, decimals: number, defaultPrice: number) {
    this.name = name
    this.unitName = unitName
    this.assetId = assetId
    this.decimals = decimals
    this.defaultPrice = defaultPrice
  }
}

export const AssetConfigs = {
  [Network.MAINNET]: {
    1: new AssetConfig("ALGO", "ALGO", 1, 6, undefined),
    818179690: new AssetConfig("AF-BANK-ALGO-STANDARD", "AF-BANK", 818179690, 6, undefined),
    31566704: new AssetConfig("USDC", "USDC", 31566704, 6, undefined),
    818182311: new AssetConfig("AF-BANK-USDC-STANDARD", "AF-BANK", 818182311, 6, undefined),
    386192725: new AssetConfig("goBTC", "goBTC", 386192725, 8, undefined),
    818184214: new AssetConfig("AF-BANK-GOBTC-STANDARD", "AF-BANK", 818184214, 6, undefined),
    386195940: new AssetConfig("goETH", "goETH", 386195940, 8, undefined),
    818188553: new AssetConfig("AF-BANK-GOETH-STANDARD", "AF-BANK", 818188553, 6, undefined),
    312769: new AssetConfig("USDT", "USDT", 312769, 6, undefined),
    818190568: new AssetConfig("AF-BANK-USDT-STANDARD", "AF-BANK", 818190568, 6, undefined),
    841126810: new AssetConfig("STBL2", "STBL2", 841126810, 6, undefined),
    841157954: new AssetConfig("AF-BANK_STBL2-STABLE", "AF-BANK", 841157954, 6, undefined),
    // LP collateral
    841171328: new AssetConfig("AF-USDC-STBL2-NANO-LP", "AF-POOL", 841171328, 6, undefined), // bUSDC bSTBL2 LP
    841462373: new AssetConfig("AF-BANK-AF-POOL-LP", "AF-BANK", 841462373, 6, undefined), // bank bUSDC bSTBL2 LP
    // v1 staking assets
    465865291 : new AssetConfig("STBL", "STBL", 465865291, 6, undefined),
    470842789 : new AssetConfig("DEFLY", "DEFLY", 470842789, 6, undefined),
    283820866 : new AssetConfig("XET", "XET", 283820866, 9, undefined),
    287867876 : new AssetConfig("OPUL", "OPUL", 287867876, 10, undefined),
    444035862 : new AssetConfig("ZONE", "ZONE", 444035862, 6, undefined),
    467020179 : new AssetConfig("TM-STBL-USDC-v1-LP", "TM1POOL", 467020179, 6, 1.0),
    552737686 : new AssetConfig("TM-STBL-USDC-v1.1-LP", "TMPOOL11", 552737686, 6, 1.0),
    607645566 : new AssetConfig("AF-STBL-ALGO-0.25%-LP", "AF-BANK", 607645566, 6, undefined),
    609172718 : new AssetConfig("AF-STBL-USDC-0.25%-LP", "AF-BANK", 609172718, 6, undefined),
    658337286 : new AssetConfig("AF-STBL-USDC-NANO-LP", "AF-BANK", 658337286, 6, undefined),
    659678778 : new AssetConfig("AF-USDC-USDT-NANO-LP", "AF-BANK", 659678778, 6, undefined),
    659677515 : new AssetConfig("AF-STBL-USDT-NANO-LP", "AF-BANK", 659677515, 6, undefined),
    635256863 : new AssetConfig("AF-STBL-XET-0.75%-LP", "AF-BANK", 635256863, 6, undefined),
    647801343 : new AssetConfig("AF-STBL-ZONE-0.75%-LP", "AF-BANK", 647801343, 6, undefined),
    624956449 : new AssetConfig("AF-STBL-DEFLY-0.75%-LP", "AF-BANK", 624956449, 6, undefined),
    635846733 : new AssetConfig("AF-STBL-goBTC-0.25%-LP", "AF-BANK", 635846733, 6, undefined),
    635854339 : new AssetConfig("AF-STBL-goETH-0.25%-LP", "AF-BANK", 635854339, 6, undefined),
    637802380 : new AssetConfig("AF-STBL-OPUL-0.75%-LP", "AF-BANK", 637802380, 6, undefined),
  },
  [Network.TESTNET]: {
    1: new AssetConfig("ALGO", "ALGO", 1, 6, undefined),
    104193939: new AssetConfig("AF-BANK-ALGO-STANDARD", "AF-BANK", 104193939, 6, undefined),
    104194013: new AssetConfig("USDC", "USDC", 104194013, 6, undefined),
    104207173: new AssetConfig("AF-BANK-USDC-STANDARD", "AF-BANK", 104207173, 6, undefined),
    104207287: new AssetConfig("goBTC", "goBTC", 104207287, 8, undefined),
    104207503: new AssetConfig("AF-BANK-GOBTC-STANDARD", "AF-BANK", 104207503, 6, undefined),
    104207533: new AssetConfig("goETH", "goETH", 104207533, 8, undefined),
    104207983: new AssetConfig("AF-BANK-GOETH-STANDARD", "AF-BANK", 104207983, 6, undefined),
    104208050: new AssetConfig("USDT", "USDT", 104208050, 6, undefined),
    104222974: new AssetConfig("AF-BANK-USDT-STANDARD", "AF-BANK", 104222974, 6, undefined),
    104210500: new AssetConfig("STBL2", "STBL2", 104210500, 6, undefined),
    104217422: new AssetConfig("AF-BANK-STBL2-STABLE", "AF-BANK", 104217422, 6, undefined),
    104228491: new AssetConfig("AF-bUSDC-bSTBL2-NANO-LP", "AF-POOL", 104228491, 6, undefined),
    104238470: new AssetConfig("AF-BANK-AF-bUSDC-bSTBL2-NANO-LP-LP", "AF-BANK", 104238470, 6, undefined),
  }
}