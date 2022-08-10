// IMPORTS

// external
import algosdk, {
  Algodv2,
  Transaction,
  getApplicationAddress,
  encodeUint64,
  decodeUint64,
  SuggestedParams,
  assignGroupID,
  bytesToBigInt
} from "algosdk"

// global
import {
  FIXED_3_SCALE_FACTOR,
  FIXED_6_SCALE_FACTOR,
  FIXED_12_SCALE_FACTOR,
  FIXED_18_SCALE_FACTOR,
  ALGO_ASSET_ID,
  SECONDS_PER_YEAR,
  PERMISSIONLESS_SENDER_LOGIC_SIG,
  TEXT_ENCODER
} from "../../globals"
import { Base64Encoder } from "../../encoder"
import { decodeBytes, parseAddressBytes } from "../../utils"
import { getApplicationGlobalState, getLocalStates, getAccountBalances } from "../../stateUtils"
import { getParams, getPaymentTxn } from "../../transactionUtils"
import AlgofiUser from "../../algofiUser"
import { roundUp, roundDown } from "../../utils"

// assetData
import AssetAmount from "../../assetData/assetAmount"
import AssetDataClient from "../../assetData/assetDataClient"

// local
import { PoolType, POOL_STRINGS, getSwapFee } from "./ammConfig"
import PoolConfig from "./poolConfig"
import AMMClient from "./ammClient"
import { getD, getY } from "./stableswapMath"

// HELPER CLASSES

export enum PoolQuoteType {
  EMPTY_POOL = 0,
  POOL = 1,
  BURN = 2,
  SWAP_EXACT_FOR = 3,
  SWAP_FOR_EXACT = 4,
  ZAP = 5
}

export class PoolQuote {
  public quoteType: PoolQuoteType
  public asset1Delta: number
  public asset2Delta: number
  public lpDelta: number
  public iterations: number
  public zapAsset1Swap: number
  public zapAsset2Swap: number
  
  constructor(
    quoteType: PoolQuoteType,
    asset1Delta: number,
    asset2Delta: number,
    lpDelta: number,
    iterations: number,
    zapAsset1Swap: number = 0,
    zapAsset2Swap: number = 0
  ) {
    this.quoteType = quoteType
    this.asset1Delta = asset1Delta
    this.asset2Delta = asset2Delta
    this.lpDelta = lpDelta
    this.iterations = iterations
    this.zapAsset1Swap = zapAsset1Swap
    this.zapAsset2Swap = zapAsset2Swap
  }
}

// INTERFACE

export default class Pool {
  // static
  public algod: Algodv2
  public ammClient: AMMClient
  public assetDataClient: AssetDataClient
  public appId: number
  public asset1Id: number
  public asset2Id: number
  public poolType: PoolType
  
  public address: string

  public managerAppId: number
  public lpAssetId: number
  public balance1: number
  public balance2: number
  public lpCirculation: number

  // nano
  public initialAmplificationFactor: number
  public futureAmplificationFactor: number
  public initialAmplificationFactorTime: number
  public futureAmplificationFactorTime: number
  public ramp_amplification_factor: number
  
  // moving ratio nano
  public targetRatioAdjustmentStartTime: number
  public targetRatioAdjustmentEndTime: number
  public initialTargetAsset1ToAsset2Ratio: number
  public currentTargetAsset1ToAsset2Ratio: number
  public goalTargetAsset1ToAsset2Ratio: number
  
  //
  public swapFee: number

  constructor(algod: Algodv2, ammClient: AMMClient, poolConfig: PoolConfig) {
    this.algod = algod
    this.ammClient = ammClient
    this.assetDataClient = ammClient.algofiClient.assetData
    this.appId = poolConfig.appId
    this.asset1Id = poolConfig.asset1Id
    this.asset2Id = poolConfig.asset2Id
    this.poolType = poolConfig.poolType

    this.address = getApplicationAddress(this.appId)
  }

  async loadState() {
    let state = await getApplicationGlobalState(this.algod, this.appId)

    // parameters
    this.managerAppId = state[POOL_STRINGS.manager_app_id]
    this.lpAssetId = state[POOL_STRINGS.lp_id]
    this.balance1 = state[POOL_STRINGS.balance_1]
    this.balance2 = state[POOL_STRINGS.balance_2]
    this.lpCirculation = state[POOL_STRINGS.lp_circulation]
    if (this.poolType == PoolType.NANO || this.poolType == PoolType.MOVING_RATIO_NANO) {
      this.initialAmplificationFactor = state[POOL_STRINGS.initial_amplification_factor]
      this.futureAmplificationFactor = state[POOL_STRINGS.future_amplification_factor]
      this.initialAmplificationFactorTime = state[POOL_STRINGS.initial_amplification_factor_time]
      this.futureAmplificationFactorTime = state[POOL_STRINGS.future_amplification_factor_time]
      this.ramp_amplification_factor = state[POOL_STRINGS.ramp_amplification_factor]
    }
    if (this.poolType == PoolType.MOVING_RATIO_NANO) {
      this.targetRatioAdjustmentStartTime = state[POOL_STRINGS.target_ratio_adjustment_start_time]
      this.targetRatioAdjustmentEndTime = state[POOL_STRINGS.target_ratio_adjustment_end_time]
      this.initialTargetAsset1ToAsset2Ratio = state[POOL_STRINGS.initial_target_asset1_to_asset2_ratio]
      this.currentTargetAsset1ToAsset2Ratio = state[POOL_STRINGS.current_target_asset1_to_asset2_ratio]
      this.goalTargetAsset1ToAsset2Ratio = state[POOL_STRINGS.goal_target_asset1_to_asset2_ratio]
    }
    
    this.swapFee = getSwapFee(this.poolType)
  }
  
  // HELPER FUNCTIONS
  
  getAmplificationFactor(): number {
    let now = Math.floor(Date.now() / 1000)
    if (now < this.futureAmplificationFactorTime) {
      return Math.floor(this.initialAmplificationFactor +
       (this.futureAmplificationFactor - this.initialAmplificationFactor) * (now - this.initialAmplificationFactor)
       / (this.futureAmplificationFactorTime- this.initialAmplificationFactorTime))
    }
    return this.futureAmplificationFactor
  }
  
  getTargetRatio(): number {
    let now = Math.floor(Date.now() / 1000)
    if (now < this.targetRatioAdjustmentEndTime) {
      return this.initialTargetAsset1ToAsset2Ratio +
        (this.goalTargetAsset1ToAsset2Ratio - this.initialTargetAsset1ToAsset2Ratio) * (now - this.targetRatioAdjustmentStartTime)
        / (this.targetRatioAdjustmentEndTime - this.targetRatioAdjustmentStartTime)
    }
    return this.currentTargetAsset1ToAsset2Ratio
  }
  
  isNanoPool(): boolean {
    return (this.poolType == PoolType.NANO || this.poolType == PoolType.MOVING_RATIO_NANO)
  }
  
  scaleAsset1(input: number): number {
    if (this.poolType == PoolType.MOVING_RATIO_NANO) {
      return Math.floor(input * this.getTargetRatio() / FIXED_12_SCALE_FACTOR)
    } else {
      return input
    }
  }
  
  unscaleAsset1(input: number): number {
    if (this.poolType == PoolType.MOVING_RATIO_NANO) {
      return Math.floor(input * FIXED_12_SCALE_FACTOR / this.getTargetRatio())
    } else {
      return input
    }
  }
  
  binarySearch(lower, upper, objective) {
    if (lower > upper) return lower
    let mid = Math.floor(lower + (upper - lower) / 2)
    let midVal = objective(mid)
    let upperVal = objective(upper)
    let lowerVal = objective(lower)
    
    if (midVal < 0) {
      return this.binarySearch(mid + 1, upper, objective)
    } else if (midVal > 0) {
      return this.binarySearch(lower, mid - 1, objective)
    } else {
      return mid
    }
  }
  
  // QUOTE FUNCTIONS

  getEmptyPoolQuote(asset1PooledAmount: number, asset2PooledAmount: number): PoolQuote {
    let lpsIssued = 0
    let numIter = 0
    if (this.isNanoPool()) {
      [lpsIssued, numIter] = getD([this.scaleAsset1(asset1PooledAmount), asset2PooledAmount], this.getAmplificationFactor())
    } else if (asset1PooledAmount * asset2PooledAmount > 2 ** 64 - 1) {
      [lpsIssued, numIter] = [Math.sqrt(asset1PooledAmount) * Math.sqrt(asset2PooledAmount), 0]
    } else {
      [lpsIssued, numIter]  = [Math.sqrt(asset1PooledAmount * asset2PooledAmount), 0]
    }
    
    return new PoolQuote(PoolQuoteType.EMPTY_POOL, -1 * asset1PooledAmount, -1 * asset2PooledAmount, Number(lpsIssued), numIter)
  }
  
  getPoolQuote(assetId: number, assetAmount: number): PoolQuote {
    if (this.lpCirculation === 0) {
      throw new Error("Error: pool is empty")
    }

    let asset1PooledAmount = 0
    let asset2PooledAmount = 0
    let lpsIssued = 0
    let numIter = 0

    if (assetId == this.asset1Id) {
      asset1PooledAmount = assetAmount
      asset2PooledAmount = Math.ceil(asset1PooledAmount * this.balance2 / this.balance1)
    } else {
      asset2PooledAmount = assetAmount
      asset1PooledAmount = Math.ceil(asset2PooledAmount * this.balance1 / this.balance2)
    }
    
    if (this.isNanoPool()) {
      let [D0, numIterD0] = getD([this.scaleAsset1(this.balance1), this.balance2], this.getAmplificationFactor())
      let [D1, numIterD1] = getD([this.scaleAsset1(asset1PooledAmount + this.balance1), asset2PooledAmount + this.balance2], this.getAmplificationFactor())
      lpsIssued = Math.floor(this.lpCirculation * Number((D1 - D0) / D0))
      numIter = numIterD0 + numIterD1
    } else {
      lpsIssued = Math.floor((asset1PooledAmount * this.lpCirculation) / (this.balance1))
    }

    return new PoolQuote(PoolQuoteType.POOL, -1 * asset1PooledAmount, -1 * asset2PooledAmount, lpsIssued, numIter)
  }

  // burn quote
  getBurnQuote(lpAmount: number): PoolQuote {
    if (this.lpCirculation === 0) {
      throw new Error("Error: pool is empty")
    }

    if (this.lpCirculation < lpAmount) {
      throw new Error("Error: cannot burn more lp tokens than are in circulation")
    }

    let asset1Amount = Math.floor((lpAmount * this.balance1) / this.lpCirculation)
    let asset2Amount = Math.floor((lpAmount * this.balance2) / this.lpCirculation)

    return new PoolQuote(PoolQuoteType.BURN, asset1Amount, asset2Amount, -1 * lpAmount, 0)
  }

  // swap_exact_for quote
  getSwapExactForQuote(swapInAssetId: number, swapInAmount: number): PoolQuote {
    if (this.lpCirculation === 0) {
      throw new Error("Error: pool is empty")
    }
    
    let swapInAmountLessFees = swapInAmount - (Math.floor(swapInAmount * this.swapFee) + 1)
    let swapOutAmount = 0
    let numIter = 0

    if (swapInAssetId === this.asset1Id) {
      if (this.isNanoPool()) {
        let [D, numIterD] = getD([this.scaleAsset1(this.balance1), this.balance2], this.getAmplificationFactor())
        let [y, numIterY] = getY(0, 1, this.scaleAsset1(this.balance1 + swapInAmountLessFees), [this.scaleAsset1(this.balance1), this.balance2], D, this.getAmplificationFactor())
        swapOutAmount = this.balance2 - Number(y) - 1
        numIter = numIterD + numIterY
      } else {
        swapOutAmount = Math.floor(
          (this.balance2 * swapInAmountLessFees) / (this.balance1 + swapInAmountLessFees)
        )
      }
      return new PoolQuote(PoolQuoteType.SWAP_EXACT_FOR, -1 * swapInAmount, swapOutAmount, 0, numIter)
    } else {
      if (this.isNanoPool()) {
        let [D, numIterD] = getD([this.scaleAsset1(this.balance1), this.balance2], this.getAmplificationFactor())
        let [y, numIterY] = getY(1, 0, this.balance2 + swapInAmountLessFees, [this.scaleAsset1(this.balance1), this.balance2], D, this.getAmplificationFactor())
        swapOutAmount = this.balance1 - this.unscaleAsset1(y) - 1
        numIter = numIterD + numIterY
      } else {
        swapOutAmount = Math.floor(
          (this.balance1 * swapInAmountLessFees) / (this.balance2 + swapInAmountLessFees)
        )
      }
      return new PoolQuote(PoolQuoteType.SWAP_EXACT_FOR, swapOutAmount, -1 * swapInAmount, 0, numIter)
    }
  }

  getSwapForExactQuote(swapOutAssetId: number, swapOutAmount: number): PoolQuote {
    if (this.lpCirculation === 0) {
      throw new Error("Error: pool is empty")
    }

    let swapInAmountLessFees = 0
    let numIter = 0
    if (swapOutAssetId === this.asset1Id) {
      if (this.isNanoPool()) {
        let [D, numIterD] = getD([this.scaleAsset1(this.balance1), this.balance2], this.getAmplificationFactor())
        let [y, numIterY] = getY(1, 0, this.scaleAsset1(this.balance1 - swapOutAmount), [this.scaleAsset1(this.balance1), this.balance2], D, this.getAmplificationFactor())
        swapInAmountLessFees = y - this.balance2 + 1
        numIter = numIterD + numIterY
      } else {
        swapInAmountLessFees = Math.floor((this.balance2 * swapOutAmount) / (this.balance1 - swapOutAmount)) - 1
      }
    } else {
      if (this.isNanoPool()) {
        let [D, numIterD] = getD([this.scaleAsset1(this.balance1), this.balance2], this.getAmplificationFactor())
        let [y, numIterY] = getY(0, 1, this.balance2 - swapOutAmount, [this.scaleAsset1(this.balance1), this.balance2], D, this.getAmplificationFactor())
        swapInAmountLessFees = this.unscaleAsset1(y) - this.balance1 + 1
        numIter = numIterD + numIterY
      } else {
        swapInAmountLessFees = Math.floor((this.balance1 * swapOutAmount) / (this.balance2 - swapOutAmount)) - 1
      }
    }

    let swapInAmount = Math.ceil(swapInAmountLessFees / (1 - this.swapFee))

    if (swapOutAssetId === this.asset1Id) {
      return new PoolQuote(PoolQuoteType.SWAP_FOR_EXACT, swapOutAmount, -1 * swapInAmount, 0, numIter)
    } else {
      return new PoolQuote(PoolQuoteType.SWAP_FOR_EXACT, -1 * swapInAmount, swapOutAmount, 0, numIter)
    }
  }
  
  getZapQuote(asset1Amount: number, asset2Amount:number) {
    if (asset1Amount == 0 && asset2Amount == 0) {
      return new PoolQuote(PoolQuoteType.ZAP, 0, 0, 0, 0)
    }
    
    let asset1ImpliedLPTokens = Math.floor(asset1Amount * this.lpCirculation / this.balance1)
    let asset2ImpliedLPTokens = Math.floor(asset2Amount * this.lpCirculation / this.balance2)
    
    let excessAsset1Amount = 0
    let excessAsset2Amount = 0
    
    if (asset1ImpliedLPTokens > asset2ImpliedLPTokens) { // asset2 constrained
      excessAsset1Amount = asset1Amount - Math.floor(asset2ImpliedLPTokens * this.balance1 / this.lpCirculation)
    } else { // asset1 constrained
      excessAsset2Amount = asset2Amount - Math.floor(asset1ImpliedLPTokens * this.balance2 / this.lpCirculation)
    }
    
    // calculate swap amounts
    if (asset1ImpliedLPTokens > asset2ImpliedLPTokens) {
      let objective = function (dx) {
        let dy = this.getSwapExactForQuote(this.asset1Id, dx).asset2Delta
        return  (asset2Amount + dy) / (this.balance2 - dy) - (asset1Amount - dx) / (this.balance1 + dx) // new ratio must equal new input ratio
      }.bind(this)
      let swapInAmt = this.binarySearch(0, asset1Amount, objective)
      let swapQuote = this.getSwapExactForQuote(this.asset1Id, swapInAmt)
      let swapOutAmt = swapQuote.asset2Delta
      let poolQuote = this.getPoolQuote(asset1Amount - swapInAmt, asset2Amount + swapOutAmt)
      poolQuote.quoteType = PoolQuoteType.ZAP
      poolQuote.zapAsset1Swap = -1 * swapInAmt
      poolQuote.zapAsset2Swap = swapOutAmt
      poolQuote.iterations += swapQuote.iterations
      return poolQuote
    } else {
      let objective = function (dy) {
        let dx = this.getSwapExactForQuote(this.asset2Id, dy).asset1Delta
        return (asset1Amount + dx) / (this.balance1 - dx) -  (asset2Amount - dy) / (this.balance2 + dy) // new ratio must equal new input ratio
      }.bind(this)
      let swapInAmt = this.binarySearch(0, asset2Amount, objective)
      let swapQuote = this.getSwapExactForQuote(this.asset2Id, swapInAmt)
      let swapOutAmt = swapQuote.asset1Delta
      let poolQuote = this.getPoolQuote(asset1Amount + swapOutAmt, asset2Amount - swapInAmt)
      poolQuote.quoteType = PoolQuoteType.ZAP
      poolQuote.zapAsset2Swap = -1 * swapInAmt
      poolQuote.zapAsset1Swap = swapOutAmt
      poolQuote.iterations += swapQuote.iterations
      return poolQuote
    }
  }
}