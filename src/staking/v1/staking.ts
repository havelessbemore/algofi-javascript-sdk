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
import { Base64Encoder } from "../../encoder"
import { getApplicationGlobalState, getLocalStates, getAccountBalances } from "../../stateUtils"
import { getParams, getPaymentTxn } from "../../transactionUtils"
import AlgofiUser from "../../algofiUser"
import { decodeBytes, parseAddressBytes, formatPrefixState } from "../../utils"
import { SECONDS_PER_YEAR } from "../../globals"

// asset data
import AssetDataClient from "../../assetData/assetDataClient"
import AssetAmount from "../../assetData/assetAmount"

// local
import { STAKING_STRINGS } from "./stakingConfig"
import StakingClient from "./stakingClient"
import StakingConfig from "./stakingConfig"

// INTERFACE
export default class Staking {
  // static
  public algod: Algodv2
  public stakingClient: StakingClient
  public assetDataClient: AssetDataClient
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
  

  /**
   * Constructor for the staking object.
   * 
   * @param algod - algod client
   * @param stakingClient - staking client
   * @param stakingConfig - stakingConfig object with information on the staking
   * contract
   */
  constructor(algod: Algodv2, stakingClient: StakingClient, stakingConfig: StakingConfig) {
    this.algod = algod
    this.stakingClient = stakingClient
    this.assetDataClient = stakingClient.algofiClient.assetData
    this.managerAppId = stakingConfig.managerAppId
    this.marketAppId = stakingConfig.marketAppId
    this.managerAddress = getApplicationAddress(this.managerAppId)
    this.marketAddress = getApplicationAddress(this.marketAppId)
    this.assetId = stakingConfig.assetId
  }

  /**
   * Function to load in global state into the relevant fields on the class.
   */
  async loadState() {
    // loading in global state staking specific
    const managerGlobalState = await getApplicationGlobalState(this.algod, this.managerAppId)
    const marketGlobalState = await getApplicationGlobalState(this.algod, this.marketAppId)

    this.oracleAppId = marketGlobalState[STAKING_STRINGS.oracle_app_id]

    this.totalStaked = marketGlobalState[STAKING_STRINGS.total_staked]

    this.rewardsProgramNumber = managerGlobalState[STAKING_STRINGS.rewards_program_number]
    this.rewardsCoefficient = managerGlobalState[STAKING_STRINGS.rewards_coefficient]
    this.rewardsAmount = managerGlobalState[STAKING_STRINGS.rewards_amount]
    this.rewardsAssetId = managerGlobalState[STAKING_STRINGS.rewards_asset_id]
    this.rewardsPerSecond = managerGlobalState[STAKING_STRINGS.rewards_per_second]
    this.rewardsSecondaryAssetId = managerGlobalState[STAKING_STRINGS.rewards_secondary_asset_id]
    this.rewardsSecondaryRatio = managerGlobalState[STAKING_STRINGS.rewards_secondary_ratio]
  }

  // GETTERS (require assetData to be loaded)
  getTotalStaked(): AssetAmount {
    return this.assetDataClient.getAsset(this.totalStaked, this.assetId)
  }

  getRewardsAPR(): number {
    if (this.rewardsAssetId == 0) {
      return 0
    }
    const annualRewards = this.assetDataClient.getAsset(this.rewardsPerSecond * SECONDS_PER_YEAR, this.rewardsAssetId)
    return annualRewards.toUSD() / (this.getTotalStaked().toUSD() || 1)
  }

  getSecondaryRewardsAPR(): number {
    if (this.rewardsSecondaryAssetId == 0) {
      return 0
    }
    const annualSecondaryRewards = this.assetDataClient.getAsset(Math.floor(this.rewardsPerSecond * SECONDS_PER_YEAR * this.rewardsSecondaryRatio / 1000), this.rewardsSecondaryAssetId)
    return annualSecondaryRewards.toUSD() / (this.getTotalStaked().toUSD() || 1)
  }

  /**
   * Constructs a series of transactions to opt a user into the staking
   * contract.
   * 
   * @param user - user opting in
   * @param storageAccount - storage account for user opting in
   * @returns a series of transactions to opt a user into the staking
   * contract.
   */
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

  /**
   * Constructs a series of transactions to put before many of the transactions
   * in staking on the Algofi protocol.
   * 
   * @param user - user to get preamble transactions for 
   * @returns a series of transactions to put before many of the transactions
   * in staking on the Algofi protocol.
   */
  async getPreambleTxns(user: AlgofiUser): Promise<Transaction[]> {
    const params = await getParams(this.algod)
    const txns = []
    const enc = new TextEncoder()

    txns.push(
      makeApplicationNoOpTxnFromObject({
        from: user.address,
        appIndex: this.managerAppId,
        foreignApps: [this.marketAppId],
        appArgs: [enc.encode(STAKING_STRINGS.fetch_market_variables)],
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
        appArgs: [enc.encode(STAKING_STRINGS.update_prices)],
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
        appArgs: [enc.encode(STAKING_STRINGS.update_protocol_data)],
        accounts: [user.staking.v1.userStakingStates[this.managerAppId].storageAddress],
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

  /**
   * Constructs a series of transactions to stake a certain amount of an asset for
   * a user.
   * 
   * @param user - user staking
   * @param amount - amount staking
   * @returns a series of transactions to stake a certain amount of an asset for
   * a user.
   */
  async getStakeTxns(user: AlgofiUser, amount: number): Promise<Transaction[]> {
    const params = await getParams(this.algod)
    const enc = new TextEncoder()

    const txns = await this.getPreambleTxns(user)

    txns.push(
      algosdk.makeApplicationNoOpTxnFromObject({
        from: user.address,
        appIndex: this.managerAppId,
        appArgs: [enc.encode(STAKING_STRINGS.stake)],
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
        appArgs: [enc.encode(STAKING_STRINGS.stake)],
        accounts: [user.staking.v1.userStakingStates[this.managerAppId].storageAddress],
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

  /**
   * Constructs a series of transactions to unstake a certain amount for a user on
   * a staking contract.
   * 
   * @param user - user to unstake for
   * @param amount - amount to unstake
   * @returns a series of transactions to unstake a certain amount for a user on
   * a staking contract.
   */
  async getUnstakeTxns(user: AlgofiUser, amount: number): Promise<Transaction[]> {
    const params = await getParams(this.algod)
    const enc = new TextEncoder()

    const txns = await this.getPreambleTxns(user)

    txns.push(
      algosdk.makeApplicationNoOpTxnFromObject({
        from: user.address,
        appIndex: this.managerAppId,
        appArgs: [enc.encode(STAKING_STRINGS.unstake), encodeUint64(amount)],
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
        appArgs: [enc.encode(STAKING_STRINGS.unstake), encodeUint64(amount)],
        accounts: [user.staking.v1.userStakingStates[this.managerAppId].storageAddress],
        suggestedParams: params,
        foreignAssets: [this.assetId],
        rekeyTo: undefined
      })
    )

    return assignGroupID(txns)
  }

  /**
   * Constructs a series of transactions to claim a user's staked assets.
   * 
   * @param user - user to claim 
   * @returns a series of transactions to claim a user's staked assets.
   */
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
        appArgs: [enc.encode(STAKING_STRINGS.claim_rewards)],
        accounts: [user.staking.v1.userStakingStates[this.managerAppId].storageAddress],
        suggestedParams: params,
        foreignAssets: [this.rewardsAssetId, this.rewardsSecondaryAssetId],
        rekeyTo: undefined
      })
    )

    return assignGroupID(txns)
  }

}
