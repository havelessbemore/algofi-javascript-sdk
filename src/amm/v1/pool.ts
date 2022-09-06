// IMPORTS

// external
import algosdk, {
  Algodv2,
  Transaction,
  LogicSigAccount,
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
import { decodeBytes, parseAddressBytes, composeTransactions } from "../../utils"
import { getApplicationGlobalState, getLocalStates, getAccountBalances } from "../../stateUtils"
import { getParams, getPaymentTxn } from "../../transactionUtils"
import AlgofiUser from "../../algofiUser"
import { roundUp, roundDown } from "../../utils"

// assetData
import AssetAmount from "../../assetData/assetAmount"
import AssetDataClient from "../../assetData/assetDataClient"

// local
import { generateLogicSig } from "./logicSigGenerator"
import {
  PoolType,
  POOL_STRINGS,
  getSwapFee,
  getValidatorIndex,
  getPoolApprovalProgram,
  getPoolClearStateProgram
} from "./ammConfig"
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
  public zapBonus: number
  
  constructor(
    quoteType: PoolQuoteType,
    asset1Delta: number,
    asset2Delta: number,
    lpDelta: number,
    iterations: number,
    zapAsset1Swap: number = 0,
    zapAsset2Swap: number = 0,
    zapBonus: number = 0
  ) {
    this.quoteType = quoteType
    this.asset1Delta = asset1Delta
    this.asset2Delta = asset2Delta
    this.lpDelta = lpDelta
    this.iterations = iterations
    this.zapAsset1Swap = zapAsset1Swap
    this.zapAsset2Swap = zapAsset2Swap
    this.zapBonus = zapBonus
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
  
  public logicSig: LogicSigAccount
  public address: string

  public managerAppId: number
  public lpAssetId: number
  public balance1: number
  public balance2: number
  public lpCirculation: number

  public tvl: number
  public apr: number

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

  constructor(algod: Algodv2, ammClient: AMMClient, poolConfig: PoolConfig, tvl: number=0, apr: number=0) {
    this.algod = algod
    this.ammClient = ammClient
    this.assetDataClient = ammClient.algofiClient.assetData
    this.appId = poolConfig.appId
    this.asset1Id = poolConfig.asset1Id
    this.asset2Id = poolConfig.asset2Id
    this.poolType = poolConfig.poolType
    this.tvl = tvl
    this.apr = apr
  }

  async loadState() {
    // attempt to load app id if missing
    if (this.appId == 0) {
      let managerAppId: number = this.ammClient.managerAppId
      
      this.logicSig = new LogicSigAccount(
        generateLogicSig(
          this.asset1Id,
          this.asset2Id,
          managerAppId,
          getValidatorIndex(this.poolType)
        )
      )
      
      let logicSigStates = getLocalStates(this.algod, this.logicSig.address())
      if (managerAppId in logicSigStates) {
        this.appId = logicSigStates[managerAppId][POOL_STRINGS.registered_pool_id]
      } else {
        return
      }
    }
    
    this.address = getApplicationAddress(this.appId)
    
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
  
  // GETTERS
  
  getTVL(): number {
    return this.tvl
  }

  getAPR(): number {
    return this.apr
  }
  
  // HELPER FUNCTIONS
  
  isCreated(): boolean {
    return this.appId != 0
  }
  
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
  
  getZapQuote(assetAID: number, assetAAmount: number, assetBAmount: number=0) {
    let asset1Amount = Math.floor(((assetAID == this.asset1Id) ? assetAAmount : assetBAmount) * 0.995)
    let asset2Amount = Math.floor(((assetAID == this.asset1Id) ? assetBAmount : assetAAmount) * 0.995)
    if (asset1Amount == 0 && asset2Amount == 0) {
      return new PoolQuote(PoolQuoteType.ZAP, 0, 0, 0, 0)
    }
    
    let asset1ImpliedLPTokens = Math.floor(asset1Amount * this.lpCirculation / this.balance1)
    let asset2ImpliedLPTokens = Math.floor(asset2Amount * this.lpCirculation / this.balance2)

    // calculate swap amounts
    if (asset1ImpliedLPTokens > asset2ImpliedLPTokens) {
      let objective = function (dy) {
        let dx = -1 * this.getSwapForExactQuote(this.asset2Id, dy).asset1Delta
        return (asset2Amount + dy) / (this.balance2 - dy) - (asset1Amount - dx) / (this.balance1 + dx) // new ratio must equal new input ratio
      }.bind(this)
      let swapOutAmt = this.binarySearch(0, Math.min(Math.floor(asset1Amount*this.balance2/this.balance1), this.balance2), objective)
      let swapQuote = this.getSwapForExactQuote(this.asset2Id, swapOutAmt)
      let swapInAmt = swapQuote.asset1Delta
      let asset1PoolQuote = this.getPoolQuote(this.asset1Id, asset1Amount - (-1 * swapInAmt) - 10)
      let asset2PoolQuote = this.getPoolQuote(this.asset2Id, asset2Amount + swapOutAmt - 10)
      let poolQuote = (asset1PoolQuote.lpDelta < asset2PoolQuote.lpDelta) ? asset1PoolQuote : asset2PoolQuote
      poolQuote.quoteType = PoolQuoteType.ZAP
      poolQuote.zapAsset1Swap = swapInAmt
      poolQuote.zapAsset2Swap = swapOutAmt
      poolQuote.iterations += swapQuote.iterations
      if (this.poolType === PoolType.NANO || this.poolType == PoolType.MOVING_RATIO_NANO) {
        let initialLPPrice = (this.balance1 + this.balance2) / this.lpCirculation
        let actualLPPrice = (asset1Amount + asset2Amount) / poolQuote.lpDelta
        poolQuote.zapBonus = (initialLPPrice - actualLPPrice) / initialLPPrice
      }
      return poolQuote
    } else {
      let objective = function (dx) {
        let dy = -1 * this.getSwapForExactQuote(this.asset1Id, dx).asset2Delta
        return (asset1Amount + dx) / (this.balance1 - dx) - (asset2Amount - dy) / (this.balance2 + dy) // new ratio must equal new input ratio
      }.bind(this)
      let swapOutAmt = this.binarySearch(0, Math.min(Math.floor(asset2Amount*this.balance1/this.balance2), this.balance1), objective)
      let swapQuote = this.getSwapForExactQuote(this.asset1Id, swapOutAmt)
      let swapInAmt = swapQuote.asset2Delta
      let asset1PoolQuote = this.getPoolQuote(this.asset1Id, asset1Amount + swapOutAmt - 10)
      let asset2PoolQuote = this.getPoolQuote(this.asset2Id, asset2Amount - (-1 * swapInAmt) - 10)
      let poolQuote = (asset1PoolQuote.lpDelta < asset2PoolQuote.lpDelta) ? asset1PoolQuote : asset2PoolQuote
      poolQuote.quoteType = PoolQuoteType.ZAP
      poolQuote.zapAsset2Swap = swapInAmt
      poolQuote.zapAsset1Swap = swapOutAmt
      poolQuote.iterations += swapQuote.iterations
      if (this.poolType === PoolType.NANO || this.poolType == PoolType.MOVING_RATIO_NANO) {
        let initialLPPrice = (this.balance1 + this.balance2) / this.lpCirculation
        let actualLPPrice = (asset1Amount + asset2Amount) / poolQuote.lpDelta
        poolQuote.zapBonus = (initialLPPrice - actualLPPrice) / initialLPPrice
      }
      return poolQuote
    }
  }
  
  // TRANSACTION GETTERS
  
  async getCreatePoolTxns(
    user: AlgofiUser
  ): Promise<Transaction[]> {
    if (this.isCreated()) {
      throw new Error("Pool already active cannot generate create pool txn")
    }
    if (this.poolType === PoolType.NANO || this.poolType == PoolType.MOVING_RATIO_NANO || this.poolType == PoolType.LOW_FEE_LENDING) {
      throw new Error("Nanoswap or Lending pool cannot generate create pool txn")
    }
    const params  = await getParams(this.algod)
    const transactions = []

    let approvalProgram = getPoolApprovalProgram(this.ammClient.network, this.poolType)
    let clearStateProgram = getPoolClearStateProgram(this.ammClient.network)

    transactions.push(
      algosdk.makeApplicationCreateTxnFromObject({
        from: user.address,
        suggestedParams: params,
        approvalProgram: approvalProgram,
        clearProgram: clearStateProgram,
        numLocalInts: 0,
        numLocalByteSlices: 0,
        numGlobalInts: 60,
        numGlobalByteSlices: 4,
        extraPages: 3,
        onComplete: algosdk.OnApplicationComplete.NoOpOC,
        appArgs: [
          encodeUint64(this.asset1Id),
          encodeUint64(this.asset2Id),
          encodeUint64(getValidatorIndex(this.poolType))
        ],
        accounts: undefined,
        foreignApps: [this.managerAppId],
        foreignAssets: undefined,
        rekeyTo: undefined
      })
    )

    return assignGroupID(transactions)
  }
  
  async getInitializePoolTxns(
    user: AlgofiUser,
    poolAppId: number
  ): Promise<Transaction[]> {
    if (this.isCreated()) {
      throw new Error("Pool already active cannot generate initialize pool txn")
    }
    const params  = await getParams(this.algod)
    const transactions = []

    // fund manager
    transactions.push(getPaymentTxn(params, user.address, getApplicationAddress(this.managerAppId), ALGO_ASSET_ID, 400000))

    // fund logic sig
    transactions.push(getPaymentTxn(params, user.address, this.logicSig.address(), ALGO_ASSET_ID, 450000))

    // opt logic sig into manager
    params.fee = 2000
    transactions.push(
      algosdk.makeApplicationOptInTxnFromObject({
        from: this.logicSig.address(),
        appIndex: this.managerAppId,
        suggestedParams: params,
        appArgs: [
          encodeUint64(this.asset1Id),
          encodeUint64(this.asset2Id),
          encodeUint64(getValidatorIndex(this.poolType))
        ],
        accounts: [
          getApplicationAddress(poolAppId)
        ],
        foreignApps: [
          poolAppId
        ],
        foreignAssets: undefined,
        rekeyTo: undefined
      })
    )
    
    // initialize pool
    params.fee = 4000
    transactions.push(
      algosdk.makeApplicationNoOpTxnFromObject({
        from: user.address,
        appIndex: poolAppId,
        suggestedParams: params,
        appArgs: [TEXT_ENCODER.encode(POOL_STRINGS.initialize_pool)],
        accounts: undefined,
        foreignApps: [this.managerAppId],
        foreignAssets: this.asset1Id === 1 ? [this.asset2Id] : [this.asset1Id, this.asset2Id],
        rekeyTo: undefined
      })
    )

    return assignGroupID(transactions)
  }
  
  async getPoolTxns(
    user: AlgofiUser,
    quote: PoolQuote,
    maximumSlippage: number,
    addToUserCollateral: boolean = true
  ): Promise<Transaction[]> {
    const params  = await getParams(this.algod)
    const transactions = []
    
    if (!user.isOptedInToAsset(this.lpAssetId)) {
      transactions.push(getPaymentTxn(params, user.address, user.address, this.lpAssetId, 0))
    }
    
    transactions.push(getPaymentTxn(params, user.address, this.address, this.asset1Id, -1 * quote.asset1Delta))
    
    transactions.push(getPaymentTxn(params, user.address, this.address, this.asset2Id, -1 * quote.asset2Delta))
    
    params.fee = 3000 + 1000 * quote.iterations
    transactions.push(
      algosdk.makeApplicationNoOpTxnFromObject({
        from: user.address,
        appIndex: this.appId,
        suggestedParams: params,
        appArgs: [
          TEXT_ENCODER.encode(POOL_STRINGS.pool),
          encodeUint64(maximumSlippage)
        ],
        accounts: undefined,
        foreignApps: [this.managerAppId],
        foreignAssets: [this.lpAssetId],
        rekeyTo: undefined
      })
    )
    
    params.fee = 1000
    transactions.push(
      algosdk.makeApplicationNoOpTxnFromObject({
        from: user.address,
        appIndex: this.appId,
        suggestedParams: params,
        appArgs: [
          TEXT_ENCODER.encode(POOL_STRINGS.redeem_pool_asset1_residual),
        ],
        accounts: undefined,
        foreignApps: [this.managerAppId],
        foreignAssets: undefined,
        rekeyTo: undefined
      })
    )
    
    params.fee = 1000
    transactions.push(
      algosdk.makeApplicationNoOpTxnFromObject({
        from: user.address,
        appIndex: this.appId,
        suggestedParams: params,
        appArgs: [
          TEXT_ENCODER.encode(POOL_STRINGS.redeem_pool_asset2_residual),
        ],
        accounts: undefined,
        foreignApps: undefined,
        foreignAssets: [this.asset2Id],
        rekeyTo: undefined
      })
    )
    
    return assignGroupID(transactions)
  }
  
  async getBurnTxns(
    user: AlgofiUser,
    quote: PoolQuote
  ): Promise<Transaction[]> {
    const params  = await getParams(this.algod)
    const transactions = []
    
    if (!user.isOptedInToAsset(this.asset1Id)) {
      transactions.push(getPaymentTxn(params, user.address, user.address, this.asset1Id, 0))
    }
    
    if (!user.isOptedInToAsset(this.asset2Id)) {
      transactions.push(getPaymentTxn(params, user.address, user.address, this.asset2Id, 0))
    }
    
    transactions.push(getPaymentTxn(params, user.address, this.address, this.lpAssetId, -1 * quote.lpDelta))
    
    params.fee = 2000 + 1000 * quote.iterations
    transactions.push(
      algosdk.makeApplicationNoOpTxnFromObject({
        from: user.address,
        appIndex: this.appId,
        suggestedParams: params,
        appArgs: [
          TEXT_ENCODER.encode(POOL_STRINGS.burn_asset1_out),
        ],
        accounts: undefined,
        foreignApps: [this.managerAppId],
        foreignAssets: [this.asset1Id],
        rekeyTo: undefined
      })
    )
    
    params.fee = 2000
    transactions.push(
      algosdk.makeApplicationNoOpTxnFromObject({
        from: user.address,
        appIndex: this.appId,
        suggestedParams: params,
        appArgs: [
          TEXT_ENCODER.encode(POOL_STRINGS.burn_asset2_out),
        ],
        accounts: undefined,
        foreignApps: undefined,
        foreignAssets: [this.asset2Id],
        rekeyTo: undefined
      })
    )
    
    return assignGroupID(transactions)
  }
  
  async getSwapTxns(
    user: AlgofiUser,
    quote: PoolQuote,
    maxSlippage: number = 0.005
  ): Promise<Transaction[]> {
    const params  = await getParams(this.algod)
    const transactions = []
    
    let inputIsAsset1 = quote.asset1Delta < 0
    let inputAmount = inputIsAsset1 ? quote.asset1Delta : quote.asset2Delta
    let inputAssetId = inputIsAsset1 ? this.asset1Id : this.asset2Id
    let outputAssetId = inputIsAsset1 ? this.asset2Id : this.asset1Id
    let minOutputAmount = inputIsAsset1 ? quote.asset2Delta : quote.asset1Delta
    
    if (quote.quoteType == PoolQuoteType.SWAP_EXACT_FOR) {
      minOutputAmount = Math.floor(minOutputAmount * (1 - maxSlippage))
    } else {
      inputAmount = Math.ceil(inputAmount * (1 + maxSlippage))
    }
    
    if (!user.isOptedInToAsset(outputAssetId)) {
      transactions.push(getPaymentTxn(params, user.address, user.address, outputAssetId, 0))
    }
    
    transactions.push(getPaymentTxn(params, user.address, this.address, inputAssetId, -1 * inputAmount))
    
    params.fee = 2000 + 1000 * quote.iterations
    transactions.push(
      algosdk.makeApplicationNoOpTxnFromObject({
        from: user.address,
        appIndex: this.appId,
        suggestedParams: params,
        appArgs: [
          quote.quoteType == PoolQuoteType.SWAP_EXACT_FOR ?
            TEXT_ENCODER.encode(POOL_STRINGS.swap_exact_for) :
            TEXT_ENCODER.encode(POOL_STRINGS.swap_for_exact),
          encodeUint64(minOutputAmount)
        ],
        accounts: undefined,
        foreignApps: [this.managerAppId],
        foreignAssets: [outputAssetId],
        rekeyTo: undefined
      })
    )
    
    if (quote.quoteType == PoolQuoteType.SWAP_FOR_EXACT) {
      params.fee = 2000
      transactions.push(
        algosdk.makeApplicationNoOpTxnFromObject({
          from: user.address,
          appIndex: this.appId,
          suggestedParams: params,
          appArgs: [
            TEXT_ENCODER.encode(POOL_STRINGS.redeem_swap_residual),
          ],
          accounts: undefined,
          foreignApps: undefined,
          foreignAssets: [inputAssetId],
          rekeyTo: undefined
        })
      )
    }

    return assignGroupID(transactions)
  }
  
  async getZapTxns(
    user: AlgofiUser,
    quote: PoolQuote,
    maxSlippage: number = 0.005,
    addToUserCollateral: boolean = true
  ): Promise<Transaction[]> {
    let swapQuote = new PoolQuote(
      PoolQuoteType.SWAP_FOR_EXACT,
      quote.zapAsset1Swap,
      quote.zapAsset2Swap,
      0,
      Math.ceil(quote.iterations / 2)
    ) 
    let swapTxns = await this.getSwapTxns(user, swapQuote, maxSlippage)
   
    let poolQuote = new PoolQuote(PoolQuoteType.POOL, quote.asset1Delta, quote.asset2Delta, quote.lpDelta, Math.floor(quote.iterations / 2))
    let poolMaxSlippage = Math.floor(1000000 * maxSlippage)
    let poolTxns = await this.getPoolTxns(user, poolQuote, poolMaxSlippage, addToUserCollateral)

    return composeTransactions([swapTxns, poolTxns])
  }
}