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
  FIXED_18_SCALE_FACTOR,
  ALGO_ASSET_ID,
  SECONDS_PER_YEAR,
  PERMISSIONLESS_SENDER_LOGIC_SIG,
  TEXT_ENCODER
} from "../globals"
import { Base64Encoder } from "../encoder"
import { decodeBytes, parseAddressBytes, composeTransactions } from "../utils"
import { getApplicationGlobalState, getLocalStates, getAccountBalances } from "../stateUtils"
import { getParams, getPaymentTxn } from "../transactionUtils"
import AlgofiClient from "../algofiClient"
import AlgofiUser from "../algofiUser"
import { roundUp, roundDown } from "../utils"

// assetData
import AssetAmount from "../assetData/assetAmount"
import AssetDataClient from "../assetData/assetDataClient"

// lending
import Market from "../lending/v2/market"

// amm
import Pool, { PoolQuote, PoolQuoteType } from "../amm/v1/pool"
import { PoolType } from "../amm/v1/ammConfig"

// local
import LendingPoolInterfaceConfig, { LENDING_POOL_INTERFACE_STRINGS } from "./lendingPoolInterfaceConfig"

// CONSTANTS

// HELPER CLASSES

// INTERFACE

export default class LendingPoolInterface {
  // static
  public algofiClient: AlgofiClient
  public algod: Algodv2
  public appId: number
  public market1AppId: number
  public market2AppId: number
  public lpMarketAppId: number
  public poolAppId: number
  public opFarmAppId: number
  
  // derived
  public address: string

  // classes
  public market1: Market
  public market2: Market
  public lpMarket: Market
  public pool: Pool

  constructor(algofiClient: AlgofiClient, config: LendingPoolInterfaceConfig) {
    this.algofiClient = algofiClient
    this.algod = this.algofiClient.algod
    this.appId = config.appId
    this.market1AppId = config.market1AppId
    this.market2AppId = config.market2AppId
    this.lpMarketAppId = config.lpMarketAppId
    this.poolAppId = config.poolAppId
    this.opFarmAppId = config.opFarmAppId
    
    this.address = getApplicationAddress(this.appId)
  }
  
  async loadState() {
    this.market1 = this.algofiClient.lending.v2.markets[this.market1AppId]
    this.market2 = this.algofiClient.lending.v2.markets[this.market2AppId]
    this.lpMarket = this.algofiClient.lending.v2.markets[this.lpMarketAppId]
    this.pool = this.algofiClient.amm.v1.pools[this.poolAppId]
    await this.pool.loadState()
  }

  // QUOTES

  getEmptyPoolQuote(asset1Amount: number, asset2Amount: number): PoolQuote {
    let bAsset1PooledAmount = this.market1.underlyingToBAsset(this.algofiClient.assetData.getAsset(asset1Amount, this.market1.underlyingAssetId)).amount
    let bAsset2PooledAmount = this.market2.underlyingToBAsset(this.algofiClient.assetData.getAsset(asset2Amount, this.market2.underlyingAssetId)).amount
    let poolQuote = this.pool.getEmptyPoolQuote(bAsset1PooledAmount, bAsset2PooledAmount)
    let lpsIssued = poolQuote.lpDelta
    let numIter =poolQuote.iterations

    return new PoolQuote(PoolQuoteType.POOL, -1 * asset1Amount, -1 * asset2Amount, lpsIssued, numIter)
  }

  getPoolQuote(assetId: number, amount: number): PoolQuote {
    let asset1PooledAmount = 0
    let bAsset1PooledAmount = 0
    let asset2PooledAmount = 0
    let bAsset2PooledAmount = 0
    let lpsIssued = 0
    let numIter = 0

    let assetAmount = this.algofiClient.assetData.getAsset(amount, assetId)

    if (assetId == this.market1.underlyingAssetId) {
      asset1PooledAmount = assetAmount.amount
      bAsset1PooledAmount = this.market1.underlyingToBAsset(assetAmount).amount
      let poolQuote = this.pool.getPoolQuote(this.market1.bAssetId, bAsset1PooledAmount)
      bAsset2PooledAmount = -1 * poolQuote.asset2Delta
      asset2PooledAmount = this.market2.bAssetToUnderlying(bAsset2PooledAmount).amount
      lpsIssued = poolQuote.lpDelta
      numIter =poolQuote.iterations
    } else {
      asset2PooledAmount = assetAmount.amount
      bAsset2PooledAmount = this.market2.underlyingToBAsset(assetAmount).amount
      let poolQuote = this.pool.getPoolQuote(this.market2.bAssetId, bAsset2PooledAmount)
      bAsset1PooledAmount = -1 * poolQuote.asset1Delta
      asset1PooledAmount = this.market1.bAssetToUnderlying(bAsset1PooledAmount).amount
      lpsIssued = poolQuote.lpDelta
      numIter =poolQuote.iterations
    }

    return new PoolQuote(PoolQuoteType.POOL, -1 * asset1PooledAmount, -1 * asset2PooledAmount, lpsIssued, numIter)
  }

  getBurnQuote(amount: number): PoolQuote {
    let lpsBurned = amount
    let poolBurnQuote = this.pool.getBurnQuote(amount)
    let bAsset1BurnedAmount = poolBurnQuote.asset1Delta
    let bAsset2BurnedAmount = poolBurnQuote.asset2Delta
    let numIter = poolBurnQuote.iterations
    let asset1BurnedAmount = this.market1.bAssetToUnderlying(bAsset1BurnedAmount).amount
    let asset2BurnedAmount = this.market2.bAssetToUnderlying(bAsset1BurnedAmount).amount
    return new PoolQuote(PoolQuoteType.BURN, asset1BurnedAmount, asset2BurnedAmount, -1 * lpsBurned, numIter)
  }

  getSwapExactForQuote(swapInAssetId: number, swapInAmount: number): PoolQuote {
    let asset1SwapAmount = 0
    let bAsset1SwapAmount = 0
    let asset2SwapAmount = 0
    let bAsset2SwapAmount = 0
    let numIter = 0
    
    let swapInAssetAmount = this.algofiClient.assetData.getAsset(swapInAmount, swapInAssetId)
    
    if (swapInAssetId == this.market1.underlyingAssetId) {
      asset1SwapAmount = -1 * swapInAmount
      bAsset1SwapAmount = this.market1.underlyingToBAsset(swapInAssetAmount).amount
      let poolQuote = this.pool.getSwapExactForQuote(this.market1.bAssetId, bAsset1SwapAmount)
      bAsset2SwapAmount = poolQuote.asset2Delta
      asset2SwapAmount = this.market2.bAssetToUnderlying(bAsset2SwapAmount).amount
      numIter = poolQuote.iterations
    } else {
      asset2SwapAmount = -1 * swapInAmount
      bAsset2SwapAmount = this.market2.underlyingToBAsset(swapInAssetAmount).amount
      let poolQuote = this.pool.getSwapExactForQuote(this.market2.bAssetId, bAsset2SwapAmount)
      bAsset1SwapAmount = poolQuote.asset1Delta
      asset1SwapAmount = this.market1.bAssetToUnderlying(bAsset1SwapAmount).amount
      numIter = poolQuote.iterations
    }
    
    return new PoolQuote(PoolQuoteType.SWAP_EXACT_FOR, asset1SwapAmount, asset2SwapAmount, 0, numIter)
  }
  
  getSwapForExactQuote(swapOutAssetId: number, swapOutAmount: number): PoolQuote {
    let asset1SwapAmount = 0
    let bAsset1SwapAmount = 0
    let asset2SwapAmount = 0
    let bAsset2SwapAmount = 0
    let numIter = 0
    
    let swapOutAssetAmount = this.algofiClient.assetData.getAsset(swapOutAmount, swapOutAssetId)
    
    if (swapOutAssetId == this.market1.underlyingAssetId) {
      asset1SwapAmount = swapOutAmount
      bAsset1SwapAmount = this.market1.underlyingToBAsset(swapOutAssetAmount).amount
      let poolQuote = this.pool.getSwapForExactQuote(this.market1.bAssetId, bAsset1SwapAmount)
      bAsset2SwapAmount = poolQuote.asset2Delta
      asset2SwapAmount = this.market2.bAssetToUnderlying(bAsset2SwapAmount).amount
      numIter = poolQuote.iterations
    } else {
      asset2SwapAmount = swapOutAmount
      bAsset2SwapAmount = this.market2.underlyingToBAsset(swapOutAssetAmount).amount
      let poolQuote = this.pool.getSwapForExactQuote(this.market2.bAssetId, bAsset2SwapAmount)
      bAsset1SwapAmount = poolQuote.asset1Delta
      asset1SwapAmount = this.market1.bAssetToUnderlying(bAsset1SwapAmount).amount
      numIter = poolQuote.iterations
    }
    
    return new PoolQuote(PoolQuoteType.SWAP_FOR_EXACT, asset1SwapAmount, asset2SwapAmount, 0, numIter)
  }

  getZapQuote(asset1Amount: number, asset2Amount: number): PoolQuote {
    let bAsset1Amount = this.market1.underlyingToBAsset(this.algofiClient.assetData.getAsset(asset1Amount, this.market1.underlyingAssetId)).amount
    let bAsset2Amount = this.market2.underlyingToBAsset(this.algofiClient.assetData.getAsset(asset2Amount, this.market2.underlyingAssetId)).amount
    let quote = this.pool.getZapQuote(bAsset1Amount, bAsset2Amount)

    return new PoolQuote(
      PoolQuoteType.ZAP,
      this.market1.bAssetToUnderlying(quote.asset1Delta).amount,
      this.market2.bAssetToUnderlying(quote.asset2Delta).amount,
      quote.lpDelta,
      quote.iterations,
      this.market1.bAssetToUnderlying(quote.zapAsset1Swap).amount,
      this.market2.bAssetToUnderlying(quote.zapAsset2Swap).amount,
    )
  }

  // TRANSACTION GETTERS

  async getPoolTxns(
    user: AlgofiUser,
    quote: PoolQuote,
    maximumSlippage: number,
    addToUserCollateral: boolean = true
  ): Promise<Transaction[]> {
    const params  = await getParams(this.algod)
    const transactions = []
    
    let additionalPermissionlessFees = 27000 + quote.iterations * 1000 + (addToUserCollateral ? 3000 : 1000)
    
    // OPT IN TO LP (optional)
    if (!user.isOptedInToAsset(this.lpMarket.underlyingAssetId)) {
      transactions.push(getPaymentTxn(params, user.address, user.address, this.lpMarket.underlyingAssetId, 0))
    }
    
    // SEND ASSET 1
    transactions.push(getPaymentTxn(params, user.address, this.address, this.market1.underlyingAssetId, -1 * quote.asset1Delta))
    
    // SEND ASSET 2
    transactions.push(getPaymentTxn(params, user.address, this.address, this.market2.underlyingAssetId, -1 * quote.asset2Delta))
    
    // POOL STEP 1
    params.fee = 1000 + additionalPermissionlessFees
    transactions.push(
      algosdk.makeApplicationNoOpTxnFromObject({
        from: user.address,
        appIndex: this.appId,
        suggestedParams: params,
        appArgs: [
          TEXT_ENCODER.encode(LENDING_POOL_INTERFACE_STRINGS.pool_step_1),
          encodeUint64(quote.iterations)
        ],
        accounts: [],
        foreignApps: [this.opFarmAppId],
        foreignAssets: [],
        rekeyTo: undefined
      })
    )

    // POOL STEP 2 (permissionless) # 1000 + 3000
    params.fee = 0
    transactions.push(
      algosdk.makeApplicationNoOpTxnFromObject({
        from: PERMISSIONLESS_SENDER_LOGIC_SIG.lsig.address(),
        appIndex: this.appId,
        suggestedParams: params,
        appArgs: [
          TEXT_ENCODER.encode(LENDING_POOL_INTERFACE_STRINGS.pool_step_2)
        ],
        accounts: [this.market1.address],
        foreignApps: [this.market1AppId, this.market1.managerAppId],
        foreignAssets: [this.market1.underlyingAssetId, this.market1.bAssetId],
        rekeyTo: undefined
      })
    )
    
    // POOL STEP 3 (permissionless) # 1000 + 3000
    params.fee = 0
    transactions.push(
      algosdk.makeApplicationNoOpTxnFromObject({
        from: PERMISSIONLESS_SENDER_LOGIC_SIG.lsig.address(),
        appIndex: this.appId,
        suggestedParams: params,
        appArgs: [
          TEXT_ENCODER.encode(LENDING_POOL_INTERFACE_STRINGS.pool_step_3)
        ],
        accounts: [this.market2.address],
        foreignApps: [this.market2AppId, this.market2.managerAppId],
        foreignAssets: [this.market2.underlyingAssetId, this.market2.bAssetId],
        rekeyTo: undefined
      })
    )
    
    // POOL STEP 4 (permissionless) # 1000 + 8000 + iters * 1000
    params.fee = 0
    transactions.push(
      algosdk.makeApplicationNoOpTxnFromObject({
        from: PERMISSIONLESS_SENDER_LOGIC_SIG.lsig.address(),
        appIndex: this.appId,
        suggestedParams: params,
        appArgs: [
          TEXT_ENCODER.encode(LENDING_POOL_INTERFACE_STRINGS.pool_step_4),
          encodeUint64(maximumSlippage)
        ],
        accounts: [this.pool.address],
        foreignApps: [this.pool.appId, this.pool.managerAppId],
        foreignAssets: [this.pool.asset1Id, this.pool.asset2Id, this.pool.lpAssetId],
        rekeyTo: undefined
      })
    )
    
    // POOL STEP 5 (permissionless) # 1000 + (1000/3000)
    params.fee = 0
    transactions.push(
      algosdk.makeApplicationNoOpTxnFromObject({
        from: PERMISSIONLESS_SENDER_LOGIC_SIG.lsig.address(),
        appIndex: this.appId,
        suggestedParams: params,
        appArgs: [
          TEXT_ENCODER.encode(LENDING_POOL_INTERFACE_STRINGS.pool_step_5),
          addToUserCollateral ? encodeUint64(1) : encodeUint64(0)
        ],
        accounts: [user.address, user.lending.v2.storageAddress, this.lpMarket.address],
        foreignApps: [this.lpMarket.appId, this.lpMarket.managerAppId],
        foreignAssets: [this.lpMarket.underlyingAssetId],
        rekeyTo: undefined
      })
    )

    // POOL STEP 6 (permissionless) # 1000 + 3000? + 1000
    params.fee = 0
    transactions.push(
      algosdk.makeApplicationNoOpTxnFromObject({
        from: PERMISSIONLESS_SENDER_LOGIC_SIG.lsig.address(),
        appIndex: this.appId,
        suggestedParams: params,
        appArgs: [
          TEXT_ENCODER.encode(LENDING_POOL_INTERFACE_STRINGS.pool_step_6)
        ],
        accounts: [user.address, this.market1.address],
        foreignApps: [this.market1AppId, this.market1.managerAppId],
        foreignAssets: [this.market1.underlyingAssetId, this.market1.bAssetId],
        rekeyTo: undefined
      })
    )
    
    // POOL STEP 7 (permissionless) # 1000 + 3000? + 1000
    params.fee = 0
    transactions.push(
      algosdk.makeApplicationNoOpTxnFromObject({
        from: PERMISSIONLESS_SENDER_LOGIC_SIG.lsig.address(),
        appIndex: this.appId,
        suggestedParams: params,
        appArgs: [
          TEXT_ENCODER.encode(LENDING_POOL_INTERFACE_STRINGS.pool_step_7)
        ],
        accounts: [user.address, this.market2.address],
        foreignApps: [this.market2AppId, this.market2.managerAppId],
        foreignAssets: [this.market2.underlyingAssetId, this.market2.bAssetId],
        rekeyTo: undefined
      })
    )

    return assignGroupID(transactions)
  }


  async getBurnTxns(
    user: AlgofiUser,
    quote: PoolQuote,
    removeFromMarket: boolean = true,
    removeMax: boolean = false
  ): Promise<Transaction[]> {
    const params  = await getParams(this.algod)
    const transactions = []
    
    let additionalPermissionlessFees = 18000 + quote.iterations * 1000 

    // OPT IN TO ASSET1 (optional)
    if (!user.isOptedInToAsset(this.market1.underlyingAssetId)) {
      transactions.push(getPaymentTxn(params, user.address, user.address, this.market1.underlyingAssetId, 0))
    }
    
    // OPT IN TO ASSET2 (optional)
    if (!user.isOptedInToAsset(this.market2.underlyingAssetId)) {
      transactions.push(getPaymentTxn(params, user.address, user.address, this.market2.underlyingAssetId, 0))
    }
    
    if (removeFromMarket) {
      let removeFromMarketTransactions = await this.lpMarket.getRemoveUnderlyingCollateralTxns(
        user, this.algofiClient.assetData.getAsset(-1 * quote.lpDelta, this.lpMarket.underlyingAssetId), removeMax)
      for (const txn of removeFromMarketTransactions) {
        txn.group = undefined
        transactions.push(txn)
      }
    }
    
    // SEND LP ASSET
    transactions.push(getPaymentTxn(params, user.address, this.address, this.lpMarket.underlyingAssetId, -1 * quote.lpDelta))
    
    // BURN STEP 1
    params.fee = 1000 + additionalPermissionlessFees
    transactions.push(
      algosdk.makeApplicationNoOpTxnFromObject({
        from: user.address,
        appIndex: this.appId,
        suggestedParams: params,
        appArgs: [
          TEXT_ENCODER.encode(LENDING_POOL_INTERFACE_STRINGS.burn_step_1),
          encodeUint64(quote.iterations)
        ],
        accounts: [],
        foreignApps: [this.opFarmAppId],
        foreignAssets: [],
        rekeyTo: undefined
      })
    )

    // BURN STEP 2 (permissionless) # 5000 + iter * 1000
    params.fee = 0
    transactions.push(
      algosdk.makeApplicationNoOpTxnFromObject({
        from: PERMISSIONLESS_SENDER_LOGIC_SIG.lsig.address(),
        appIndex: this.appId,
        suggestedParams: params,
        appArgs: [
          TEXT_ENCODER.encode(LENDING_POOL_INTERFACE_STRINGS.burn_step_2)
        ],
        accounts: [this.pool.address],
        foreignApps: [this.poolAppId, this.pool.managerAppId],
        foreignAssets: [this.pool.asset1Id, this.pool.asset2Id, this.pool.lpAssetId],
        rekeyTo: undefined
      })
    )
    
    // BURN STEP 3 (permissionless) # 1000 + 3000 + 1000
    params.fee = 0
    transactions.push(
      algosdk.makeApplicationNoOpTxnFromObject({
        from: PERMISSIONLESS_SENDER_LOGIC_SIG.lsig.address(),
        appIndex: this.appId,
        suggestedParams: params,
        appArgs: [
          TEXT_ENCODER.encode(LENDING_POOL_INTERFACE_STRINGS.burn_step_3)
        ],
        accounts: [user.address, this.market1.address],
        foreignApps: [this.market1AppId, this.market1.managerAppId],
        foreignAssets: [this.market1.underlyingAssetId, this.market1.bAssetId],
        rekeyTo: undefined
      })
    )
    
    // BURN STEP 4 (permissionless) # 1000 + 3000 + 1000
    params.fee = 0
    transactions.push(
      algosdk.makeApplicationNoOpTxnFromObject({
        from: PERMISSIONLESS_SENDER_LOGIC_SIG.lsig.address(),
        appIndex: this.appId,
        suggestedParams: params,
        appArgs: [
          TEXT_ENCODER.encode(LENDING_POOL_INTERFACE_STRINGS.burn_step_4)
        ],
        accounts: [user.address, this.market2.address],
        foreignApps: [this.market2AppId, this.market2.managerAppId],
        foreignAssets: [this.market2.underlyingAssetId, this.market2.bAssetId],
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
    
    let additionalPermissionlessFees = (quote.quoteType == PoolQuoteType.SWAP_EXACT_FOR ? 17000 : 24000) + quote.iterations * 1000 

    // OPT IN TO ASSET1 (optional)
    if (!user.isOptedInToAsset(this.market1.underlyingAssetId)) {
      transactions.push(getPaymentTxn(params, user.address, user.address, this.market1.underlyingAssetId, 0))
    }
    
    // OPT IN TO ASSET2 (optional)
    if (!user.isOptedInToAsset(this.market2.underlyingAssetId)) {
      transactions.push(getPaymentTxn(params, user.address, user.address, this.market2.underlyingAssetId, 0))
    }
    
    let inputIsAsset1 = (quote.asset1Delta < 0)
    let inputAsset = inputIsAsset1 ? this.market1.underlyingAssetId : this.market2.underlyingAssetId
    let inputAmount = inputIsAsset1 ? -1 * quote.asset1Delta : -1 * quote.asset2Delta
    let minBAssetOutputAmount = inputIsAsset1 ? 
      this.market2.underlyingToBAsset(this.algofiClient.assetData.getAsset(quote.asset2Delta, this.market2.underlyingAssetId)).amount :
      this.market1.underlyingToBAsset(this.algofiClient.assetData.getAsset(quote.asset1Delta, this.market1.underlyingAssetId)).amount
    
    if (quote.quoteType == PoolQuoteType.SWAP_EXACT_FOR) {
      minBAssetOutputAmount = Math.floor(minBAssetOutputAmount * (1 - maxSlippage))
    } else {
      inputAmount = Math.ceil(inputAmount * (1 + maxSlippage))
    }
    
    // SEND ASSET
    transactions.push(getPaymentTxn(params, user.address, this.address, inputAsset, inputAmount))
    
    // SWAP STEP 1
    params.fee = 1000 + additionalPermissionlessFees
    transactions.push(
      algosdk.makeApplicationNoOpTxnFromObject({
        from: user.address,
        appIndex: this.appId,
        suggestedParams: params,
        appArgs: [
          TEXT_ENCODER.encode(LENDING_POOL_INTERFACE_STRINGS.swap_step_1),
          encodeUint64(quote.iterations)
        ],
        accounts: [],
        foreignApps: [this.opFarmAppId],
        foreignAssets: [],
        rekeyTo: undefined
      })
    )
    
    // SWAP STEP 2 (permissionless) # 1000 + 3000
    params.fee = 0
    transactions.push(
      algosdk.makeApplicationNoOpTxnFromObject({
        from: PERMISSIONLESS_SENDER_LOGIC_SIG.lsig.address(),
        appIndex: this.appId,
        suggestedParams: params,
        appArgs: [
          TEXT_ENCODER.encode(LENDING_POOL_INTERFACE_STRINGS.swap_step_2),
          inputIsAsset1 ? encodeUint64(this.market1.underlyingAssetId) : encodeUint64(this.market2.underlyingAssetId)
        ],
        accounts: inputIsAsset1 ? [user.address, this.market1.address] : [user.address, this.market2.address],
        foreignApps: inputIsAsset1 ? [this.market1AppId, this.market1.managerAppId] : [this.market2AppId, this.market2.managerAppId],
        foreignAssets: inputIsAsset1 ? [this.market1.underlyingAssetId, this.market1.bAssetId] : [this.market2.underlyingAssetId, this.market2.bAssetId],
        rekeyTo: undefined
      })
    )

    // SWAP STEP 3 (permissionless) # 5000 + iter * 1000
    params.fee = 0
    transactions.push(
      algosdk.makeApplicationNoOpTxnFromObject({
        from: PERMISSIONLESS_SENDER_LOGIC_SIG.lsig.address(),
        appIndex: this.appId,
        suggestedParams: params,
        appArgs: [
          TEXT_ENCODER.encode(LENDING_POOL_INTERFACE_STRINGS.swap_step_3),
          inputIsAsset1 ? encodeUint64(this.market1.bAssetId) : encodeUint64(this.market2.bAssetId),
          quote.quoteType == PoolQuoteType.SWAP_EXACT_FOR ?
            TEXT_ENCODER.encode(LENDING_POOL_INTERFACE_STRINGS.swap_exact_for) :
            TEXT_ENCODER.encode(LENDING_POOL_INTERFACE_STRINGS.swap_for_exact),
          encodeUint64(minBAssetOutputAmount)
        ],
        accounts: [this.pool.address],
        foreignApps: [this.poolAppId, this.pool.managerAppId],
        foreignAssets: [this.pool.asset1Id, this.pool.asset2Id, this.pool.lpAssetId],
        rekeyTo: undefined
      })
    )
    
    // SWAP STEP 4 (permissionless) # 1000 + 3000 + 1000
    params.fee = 0
    transactions.push(
      algosdk.makeApplicationNoOpTxnFromObject({
        from: PERMISSIONLESS_SENDER_LOGIC_SIG.lsig.address(),
        appIndex: this.appId,
        suggestedParams: params,
        appArgs: [
          TEXT_ENCODER.encode(LENDING_POOL_INTERFACE_STRINGS.swap_step_4)
        ],
        accounts: [user.address, this.market1.address],
        foreignApps: [this.market1AppId, this.market1.managerAppId],
        foreignAssets: [this.market1.underlyingAssetId, this.market1.bAssetId],
        rekeyTo: undefined
      })
    )
    
    // SWAP STEP 5 (permissionless) # 1000 + 3000 + 1000
    params.fee = 0
    transactions.push(
      algosdk.makeApplicationNoOpTxnFromObject({
        from: PERMISSIONLESS_SENDER_LOGIC_SIG.lsig.address(),
        appIndex: this.appId,
        suggestedParams: params,
        appArgs: [
          TEXT_ENCODER.encode(LENDING_POOL_INTERFACE_STRINGS.swap_step_5)
        ],
        accounts: [user.address, this.market2.address],
        foreignApps: [this.market2AppId, this.market2.managerAppId],
        foreignAssets: [this.market2.underlyingAssetId, this.market2.bAssetId],
        rekeyTo: undefined
      })
    )

    return assignGroupID(transactions)
  }

  async getZapTxns(
    user: AlgofiUser,
    quote: PoolQuote,
    maxSlippage: number = 0.005,
    addToUserCollateral: boolean = true
  ): Promise<Transaction[]> {
    let swapQuote = new PoolQuote(PoolQuoteType.SWAP_EXACT_FOR, quote.zapAsset1Swap, quote.zapAsset2Swap, 0, Math.ceil(quote.iterations / 2)) 
    let swapTxns = await this.getSwapTxns(user, swapQuote, maxSlippage)
   
    let poolQuote = new PoolQuote(PoolQuoteType.POOL, quote.asset1Delta, quote.asset2Delta, quote.lpDelta, Math.floor(quote.iterations / 2))
    let poolMaxSlippage = Math.floor(1000000 * maxSlippage)
    let poolTxns = await this.getPoolTxns(user, poolQuote, poolMaxSlippage, addToUserCollateral)

    return composeTransactions([swapTxns, poolTxns])
  }
}
