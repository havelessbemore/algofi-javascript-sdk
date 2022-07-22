// IMPORTS

// external
import algosdk, {
  encodeUint64,
  decodeUint64,
  bytesToBigInt
} from "algosdk"

// global
import { FIXED_18_SCALE_FACTOR } from "./../globals"
import AssetAmount from "./../assetAmount"

// local
import { MarketType, MARKET_STRINGS } from "./lendingConfig"
import Market from "./market"

// HELPER CLASSES

export class UserMarketRewardsState {
  public programNumber: number
  public assetID: number
  public latestIndex: bigint
  public unclaimed: bigint
  
  public realUnclaimed: number
  public rewardsPerYear: number
  
  constructor(marketState: { string: any }, market: Market, bAssetCollateral: number, borrowShares: number, programIndex: number) {
    this.programNumber = marketState?.[MARKET_STRINGS.user_rewards_program_number_prefix + String.fromCharCode.apply(null, encodeUint64(programIndex))] || 0
    this.assetID = market.rewardsPrograms[programIndex].assetID
    
    if (this.programNumber == market.rewardsPrograms[programIndex].programNumber) {
      let rawRewardsIndexBytes = new Uint8Array(Buffer.from(marketState[MARKET_STRINGS.user_latest_rewards_index_prefix + String.fromCharCode.apply(null, encodeUint64(programIndex))], "base64"))
      this.latestIndex = bytesToBigInt(rawRewardsIndexBytes)
      let rawUnclaimedRewardsBytes = new Uint8Array(Buffer.from(marketState[MARKET_STRINGS.user_unclaimed_rewards_prefix + String.fromCharCode.apply(null, encodeUint64(programIndex))], "base64"))
      this.unclaimed = bytesToBigInt(rawUnclaimedRewardsBytes)
    } else {
      this.latestIndex = BigInt(0)
      this.unclaimed = BigInt(0)
    }
    
    // calculate real unclaimed rewards
    this.realUnclaimed = Number(this.unclaimed / FIXED_18_SCALE_FACTOR)
    
    let userTotal = 0
    let globalTotal = 0
    if (market.marketType == MarketType.VAULT) {
      userTotal = bAssetCollateral
      globalTotal = market.bAssetCirculation
    } else {
      userTotal = borrowShares
      globalTotal = market.borrowShareCirculation
    }
    this.realUnclaimed += Number((market.rewardsPrograms[programIndex].index - this.latestIndex) * BigInt(userTotal) / FIXED_18_SCALE_FACTOR)
    
    // calculate rewards per year at current reate
    this.rewardsPerYear = market.rewardsPrograms[programIndex].rewardsPerSecond *(365*24*60*60) * userTotal / globalTotal
  }
}

// INTERFACE

export default class UserMarketState {
  public bAssetCollateral: number
  public borrowShares: number

  public suppliedAmount: AssetAmount
  public borrowedAmount: AssetAmount

  public rewardsProgramStates = []

  constructor(marketState: { string: any }, market: Market) {
    this.bAssetCollateral = marketState?.[MARKET_STRINGS.user_active_b_asset_collateral] || 0
    this.borrowShares = marketState?.[MARKET_STRINGS.user_borrow_shares] || 0
    this.suppliedAmount = market.bAssetToAssetAmount(this.bAssetCollateral)
    this.borrowedAmount = market.borrowSharesToAssetAmount(this.borrowShares)
    
    this.rewardsProgramStates = []
    this.rewardsProgramStates.push(new UserMarketRewardsState(marketState, market, this.bAssetCollateral, this.borrowShares, 0))
    this.rewardsProgramStates.push(new UserMarketRewardsState(marketState, market, this.bAssetCollateral, this.borrowShares, 1))
  }
}
