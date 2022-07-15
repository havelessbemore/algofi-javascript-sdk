// external
import algosdk, {
  Algodv2,
  Account,
  Transaction,
  getApplicationAddress,
  encodeUint64,
  SuggestedParams,
  assignGroupID,
  makePaymentTxnWithSuggestedParamsFromObject,
  makeAssetTransferTxnWithSuggestedParamsFromObject,
  makeApplicationOptInTxnFromObject,
  makeApplicationNoOpTxnFromObject,
  bytesToBigInt,
  bigIntToBytes
} from "algosdk"

// global
import { Base64Encoder } from "./../encoder"
import { getApplicationGlobalState, getLocalStates, getAccountBalances } from "./../stateUtils"
import { getParams, getPaymentTxn } from "./../transactionUtils"
import AlgofiUser from "./../algofiUser"
import { decodeBytes, parseAddressBytes, formatPrefixState } from "./../utils"

// local
import { V1_STAKING_STRINGS } from "./v1_stakingConfig"
import V1StakingClient from "./v1_stakingClient"
import V1StakingConfig from "./v1_stakingConfig"

// INTERFACE
export default class V1Staking {
  // static
  public algod: Algodv2
  public stakingClient: V1StakingClient
  public managerAppId: number
  public marketAppId: number
  public oracleAppId: number
  public managerAddress: string
  public marketAddress: string
  public assetId: number
  public latestTime: number

  // market state
  public totalStaked: number
  
  // rewards state
  public rewardsProgramNumber: number
  public rewardsCoefficient: number
  public rewardsAmount: number
  public rewardsAssetId: number
  public rewardsPerSecond: number
  public rewardsSecondaryAssetId: number
  public rewardsSecondaryRatio: number
  

  constructor(algod: Algodv2, stakingClient: V1StakingClient, stakingConfig: V1StakingConfig) {
    this.algod = algod
    this.stakingClient = stakingClient
    this.managerAppId = stakingConfig.managerAppId
    this.marketAppId = stakingConfig.marketAppId
    this.managerAddress = getApplicationAddress(this.managerAppId)
    this.marketAddress = getApplicationAddress(this.marketAppId)
    this.assetId = stakingConfig.assetId
  }

  async loadState() {
    // loading in global state staking specific
    const managerGlobalState = await getApplicationGlobalState(this.algod, this.managerAppId)
    const marketGlobalState = await getApplicationGlobalState(this.algod, this.marketAppId)

    this.oracleAppId = marketGlobalState[V1_STAKING_STRINGS.oracle_app_id]

    this.totalStaked = marketGlobalState[V1_STAKING_STRINGS.total_staked]

    this.rewardsProgramNumber = managerGlobalState[V1_STAKING_STRINGS.rewards_program_number]
    this.rewardsCoefficient = managerGlobalState[V1_STAKING_STRINGS.rewards_coefficient]
    this.rewardsAmount = managerGlobalState[V1_STAKING_STRINGS.rewards_amount]
    this.rewardsAssetId = managerGlobalState[V1_STAKING_STRINGS.rewards_asset_id]
    this.rewardsPerSecond = managerGlobalState[V1_STAKING_STRINGS.rewards_per_second]
    this.rewardsSecondaryAssetId = managerGlobalState[V1_STAKING_STRINGS.rewards_secondary_asset_id]
    this.rewardsSecondaryRatio = managerGlobalState[V1_STAKING_STRINGS.rewards_secondary_ratio]
  }
  
  async getOptInTxns(user: AlgofiUser, storageAccount: Account): Promise<Transaction[]> {
    const params = await getParams(this.algod)
    
    let txns = []

    // fund storage account
    txns.push(
      makePaymentTxnWithSuggestedParamsFromObject({
        from: user.address,
        amount: 700000,
        to: storageAccount.addr,
        suggestedParams: params,
        closeRemainderTo: undefined,
        rekeyTo: undefined
      })
    )
  
    // opt in storage account
    txns.push(
      makeApplicationOptInTxnFromObject({
        from: storageAccount.addr,
        appIndex: this.marketAppId,
        suggestedParams: params,
        accounts: undefined,
        foreignApps: undefined,
        foreignAssets: undefined,
        rekeyTo: undefined
      })
    )
  
    // opt user into manager
    txns.push(
      makeApplicationOptInTxnFromObject({
        from: user.address,
        appIndex: this.managerAppId,
        suggestedParams: params,
        foreignApps: [this.marketAppId],
        accounts: undefined,
        foreignAssets: undefined,
        rekeyTo: undefined
      })
    )
  
    // opt storage account into manager
    txns.push(
      makeApplicationOptInTxnFromObject({
        from: storageAccount.addr,
        appIndex: this.managerAppId,
        suggestedParams: params,
        rekeyTo: this.managerAddress,
        foreignApps: undefined,
        accounts: undefined,
        foreignAssets: undefined
      })
    )
    
    return assignGroupID(txns)
  }

  async getPreambleTxns(user: AlgofiUser): Promise<Transaction[]> {
    const params = await getParams(this.algod)
    const txns = []
    const enc = new TextEncoder()

    txns.push(
      makeApplicationNoOpTxnFromObject({
        from: user.address,
        appIndex: this.managerAppId,
        foreignApps: [this.marketAppId],
        appArgs: [enc.encode(V1_STAKING_STRINGS.fetch_market_variables)],
        suggestedParams: params,
        accounts: undefined,
        foreignAssets: undefined,
        rekeyTo: undefined
      })
    )

    params.fee = 2000
    txns.push(
      makeApplicationNoOpTxnFromObject({
        from: user.address,
        appIndex: this.managerAppId,
        foreignApps: [this.oracleAppId],
        appArgs: [enc.encode(V1_STAKING_STRINGS.update_prices)],
        suggestedParams: params,
        accounts: undefined,
        foreignAssets: undefined,
        rekeyTo: undefined
      })
    )
    
    params.fee = 1000
    txns.push(
      makeApplicationNoOpTxnFromObject({
        from: user.address,
        appIndex: this.managerAppId,
        foreignApps: [this.marketAppId],
        appArgs: [enc.encode(V1_STAKING_STRINGS.update_protocol_data)],
        accounts: [user.v1Staking.userStakingStates[this.managerAppId].storageAddress],
        suggestedParams: params,
        foreignAssets: undefined,
        rekeyTo: undefined
      })
    )
    
    for (let i = 0; i < 9; i++) {
      txns.push(
        makeApplicationNoOpTxnFromObject({
          from: user.address,
          appIndex: this.managerAppId,
          foreignApps: undefined,
          appArgs: [enc.encode("dummy_" + i.toString())],
          suggestedParams: params,
          accounts: undefined,
          foreignAssets: undefined,
          rekeyTo: undefined
        })
      )
    }
    
    return txns
  }

  async getStakeTxns(user: AlgofiUser, amount: number): Promise<Transaction[]> {
    const params = await getParams(this.algod)
    const enc = new TextEncoder()

    const txns = await this.getPreambleTxns(user)

    txns.push(
      algosdk.makeApplicationNoOpTxnFromObject({
        from: user.address,
        appIndex: this.managerAppId,
        appArgs: [enc.encode(V1_STAKING_STRINGS.stake)],
        suggestedParams: params,
        accounts: undefined,
        foreignApps: undefined,
        foreignAssets: undefined,
        rekeyTo: undefined
      })
    )

    txns.push(
      makeApplicationNoOpTxnFromObject({
        from: user.address,
        appIndex: this.marketAppId,
        foreignApps: [this.managerAppId],
        appArgs: [enc.encode(V1_STAKING_STRINGS.stake)],
        accounts: [user.v1Staking.userStakingStates[this.managerAppId].storageAddress],
        suggestedParams: params,
        foreignAssets: undefined,
        rekeyTo: undefined
      })
    )

    // sending staking asset
    txns.push(
      makeAssetTransferTxnWithSuggestedParamsFromObject({
        from: user.address,
        to: this.marketAddress,
        assetIndex: this.assetId,
        amount: amount,
        suggestedParams: params,
        rekeyTo: undefined,
        revocationTarget: undefined
      })
    )

    return assignGroupID(txns)
  }

  async getUnstakeTxns(user: AlgofiUser, amount: number): Promise<Transaction[]> {
    const params = await getParams(this.algod)
    const enc = new TextEncoder()

    const txns = await this.getPreambleTxns(user)

    txns.push(
      algosdk.makeApplicationNoOpTxnFromObject({
        from: user.address,
        appIndex: this.managerAppId,
        appArgs: [enc.encode(V1_STAKING_STRINGS.unstake), encodeUint64(amount)],
        suggestedParams: params,
        accounts: undefined,
        foreignApps: undefined,
        foreignAssets: undefined,
        rekeyTo: undefined
      })
    )

    params.fee = 2000
    txns.push(
      makeApplicationNoOpTxnFromObject({
        from: user.address,
        appIndex: this.marketAppId,
        foreignApps: [this.managerAppId],
        appArgs: [enc.encode(V1_STAKING_STRINGS.unstake), encodeUint64(amount)],
        accounts: [user.v1Staking.userStakingStates[this.managerAppId].storageAddress],
        suggestedParams: params,
        foreignAssets: [this.assetId],
        rekeyTo: undefined
      })
    )

    return assignGroupID(txns)
  }

  async getClaimTxns(user: AlgofiUser): Promise<Transaction[]> {
    const params = await getParams(this.algod)
    const enc = new TextEncoder()

    const txns = await this.getPreambleTxns(user)

    params.fee = 3000
    txns.push(
      makeApplicationNoOpTxnFromObject({
        from: user.address,
        appIndex: this.managerAppId,
        foreignApps: [this.marketAppId],
        appArgs: [enc.encode(V1_STAKING_STRINGS.claim_rewards)],
        accounts: [user.v1Staking.userStakingStates[this.managerAppId].storageAddress],
        suggestedParams: params,
        foreignAssets: [this.rewardsAssetId, this.rewardsSecondaryAssetId],
        rekeyTo: undefined
      })
    )

    return assignGroupID(txns)
  }

}
