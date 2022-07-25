// IMPORTS

// external
import algosdk, {
  Algodv2,
  Transaction,
  getApplicationAddress,
  encodeUint64,
  SuggestedParams,
  assignGroupID,
  makeAssetTransferTxnWithSuggestedParamsFromObject,
  makeApplicationNoOpTxnFromObject,
  bytesToBigInt,
  bigIntToBytes
} from "algosdk"

// global
import { Base64Encoder } from "../../encoder"
import { getApplicationGlobalState, getLocalStates, getAccountBalances } from "../../stateUtils"
import { getParams, getPaymentTxn } from "../../transactionUtils"
import { STAKING_STRINGS } from "./stakingConfig"
import AlgofiUser from "../../algofiUser"
import { decodeBytes, parseAddressBytes, formatPrefixState } from "../../utils"

// local
import StakingClient from "./stakingClient"
import StakingConfig from "./stakingConfig"
import RewardsProgramState from "./rewardsProgramState"

// INTERFACE
export default class Staking {
  // static
  public algod: Algodv2
  public stakingClient: StakingClient
  public name: string
  public appId: number
  public address: string
  public assetId: number
  public latestTime: number

  public rewardsEscrowAccount: string
  public boostMultiplierAppId: number
  public totalStaked: number
  public scaledTotalStaked: number
  public rewardsManagerAppId: number
  public rewardsProgramCount: number
  public rewardsProgramStates: { [key: number]: RewardsProgramState }

  /**
   * Constructor for the staking object. 
   * 
   * @param algod - algod client
   * @param stakingClient - staking client
   * @param rewardsManagerAppId - rewards manager app id
   * @param stakingConfig - stakingConfig object with information on the staking
   */
  constructor(algod: Algodv2, stakingClient: StakingClient, rewardsManagerAppId: number, stakingConfig: StakingConfig) {
    this.algod = algod
    this.stakingClient = stakingClient
    this.name = stakingConfig.name
    this.appId = stakingConfig.appId
    this.address = getApplicationAddress(this.appId)
    this.assetId = stakingConfig.assetId
    this.rewardsManagerAppId = rewardsManagerAppId
  }

  /**
   * Loads in the global state of the specific staking contract and sets relevant
   * fields on the class.
   */
  async loadState() {
    // loading in global state staking specific
    const globalState = await getApplicationGlobalState(this.algod, this.appId)

    this.latestTime = globalState[STAKING_STRINGS.latest_time]
    this.rewardsEscrowAccount = parseAddressBytes(globalState[STAKING_STRINGS.rewards_escrow_account])
    this.boostMultiplierAppId = globalState[STAKING_STRINGS.boost_multiplier_app_id]
    this.totalStaked = globalState[STAKING_STRINGS.total_staked]
    this.scaledTotalStaked = globalState[STAKING_STRINGS.scaled_total_staked]
    this.rewardsManagerAppId = globalState[STAKING_STRINGS.rewards_manager_app_id]
    this.rewardsProgramCount = globalState[STAKING_STRINGS.rewards_program_count]
    this.rewardsProgramStates = {}

    // loading in rewards program specific state
    const formattedState = formatPrefixState(globalState)

    for (let i = 0; i < this.rewardsProgramCount; ++i) {
      this.rewardsProgramStates[i] = new RewardsProgramState(formattedState, i)
    }
  }


  /**
   * Constructs a series of transactions that opt a user into the staking
   * contract.
   * 
   * @param user - user who is opting in 
   * @returns a series of transactions that opt a user into the staking
   * contract.
   */
  async getUserOptInTxns(user: AlgofiUser): Promise<Transaction[]> {
    const params = await getParams(this.algod)
    const enc = new TextEncoder()

    // unstake transaction
    const txn0 = algosdk.makeApplicationOptInTxnFromObject({
      from: user.address,
      appIndex: this.appId,
      suggestedParams: params,
      appArgs: undefined,
      accounts: undefined,
      foreignApps: undefined,
      foreignAssets: undefined,
      rekeyTo: undefined
    })

    return [txn0]
  }

  /**
   * Constructs a series of transactions that opt a user into the staking
   * contract.
   * 
   * @param user - user who is opting in 
   * @returns a series of transactions that opt a user into the staking
   * contract.
   */
  async getUserCloseOutTxns(user: AlgofiUser): Promise<Transaction[]> {
    const params = await getParams(this.algod)
    const enc = new TextEncoder()

    // unstake transaction
    const txn0 = algosdk.makeApplicationCloseOutTxnFromObject({
      from: user.address,
      appIndex: this.appId,
      suggestedParams: params,
      appArgs: [encodeUint64(0)], // don't ignore unclaimed rewards
      accounts: undefined,
      foreignApps: undefined,
      foreignAssets: undefined,
      rekeyTo: undefined
    })

    return [txn0]
  }

  /**
   * Constructs a series of transactions to stake user's assets in the staking
   * contract.
   * 
   * @param user - user who is staking
   * @param amount - amount they are staking
   * @returns a series of transactions to stake user's assets in the staking
   * contract.
   */
  async getStakeTxns(user: AlgofiUser, amount: number): Promise<Transaction[]> {
    const params = await getParams(this.algod)
    const enc = new TextEncoder()

    // farm ops
    const txn0 = makeApplicationNoOpTxnFromObject({
      from: user.address,
      appIndex: this.appId,
      appArgs: [enc.encode(STAKING_STRINGS.farm_ops)],
      suggestedParams: params,
      accounts: undefined,
      foreignAssets: undefined,
      foreignApps: undefined,
      rekeyTo: undefined
    })

    // sending staking asset
    const txn1 = makeAssetTransferTxnWithSuggestedParamsFromObject({
      from: user.address,
      to: this.address,
      assetIndex: this.assetId,
      amount: amount,
      suggestedParams: params,
      rekeyTo: undefined,
      revocationTarget: undefined
    })

    // stake
    params.fee = 2000
    const txn2 = makeApplicationNoOpTxnFromObject({
      from: user.address,
      appIndex: this.appId,
      appArgs: [enc.encode(STAKING_STRINGS.stake)],
      suggestedParams: params,
      foreignApps: [this.boostMultiplierAppId || 1],
      accounts: undefined,
      foreignAssets: undefined,
      rekeyTo: undefined
    })

    return assignGroupID([txn0, txn1, txn2])
  }

  /**
   * Constructs a series of transactions that unstake a user's current stake
   * from the staking contract.
   * 
   * @param user - user who is unstaking
   * @param amount - amount they are unstaking
   * @returns a series of transactions that unstake a user's current stake
   * from the staking contract.
   */
  async getUnstakeTxns(user: AlgofiUser, amount: number): Promise<Transaction[]> {
    const params = await getParams(this.algod)
    const enc = new TextEncoder()

    // farm ops
    const txn0 = makeApplicationNoOpTxnFromObject({
      from: user.address,
      appIndex: this.appId,
      appArgs: [enc.encode(STAKING_STRINGS.farm_ops)],
      suggestedParams: params,
      accounts: undefined,
      foreignAssets: undefined,
      foreignApps: undefined,
      rekeyTo: undefined
    })

    params.fee = 3000
    // unstake
    const txn1 = algosdk.makeApplicationNoOpTxnFromObject({
      from: user.address,
      appIndex: this.appId,
      appArgs: [enc.encode(STAKING_STRINGS.unstake), encodeUint64(amount)],
      foreignAssets: [this.assetId],
      suggestedParams: params,
      foreignApps: [this.boostMultiplierAppId || 1],
      accounts: undefined,
      rekeyTo: undefined
    })

    return assignGroupID([txn0, txn1])
  }

  /**
   * Constructs a series of transactions that claim a user's staked assets.
   * 
   * @param user - user who is claiming
   * @returns a series of transactions that claim a user's staked assets.
   */
  async getClaimTxns(user: AlgofiUser): Promise<any> {
    const params = await getParams(this.algod)
    const enc = new TextEncoder()

    const txns = []

    // iterate over all rewards programs on this contract
    for (let i = 0; i < this.rewardsProgramCount; ++i) {

      // skip rewards programs with 0 unrealized rewards
      if (user.staking.v2.userStakingStates[this.appId].userRewardsProgramStates[i].userUnrealizedRewards > 0) {
        
        // farm ops
        params.fee = 1000
        const txn0 = makeApplicationNoOpTxnFromObject({
          from: user.address,
          appIndex: this.appId,
          appArgs: [enc.encode(STAKING_STRINGS.farm_ops)],
          suggestedParams: params,
          accounts: undefined,
          foreignAssets: undefined,
          foreignApps: undefined,
          rekeyTo: undefined
        })
        
        // claim rewards
        params.fee = 3000
        const txn1 = makeApplicationNoOpTxnFromObject({
          from: user.address,
          appIndex: this.appId,
          appArgs: [enc.encode(STAKING_STRINGS.claim_rewards), encodeUint64(i)],
          foreignAssets: [this.rewardsProgramStates[i].rewardsAssetId],
          accounts: [this.rewardsEscrowAccount],
          rekeyTo: undefined,
          foreignApps: [this.boostMultiplierAppId || 1],
          suggestedParams: params
        })
        txns.push(txn0, txn1)
      }
    }
    if (txns.length == 0) {
      return []
    } else if (txns.length == 1) {
      return txns
    } else {
      return assignGroupID(txns)
    }
  }
}
