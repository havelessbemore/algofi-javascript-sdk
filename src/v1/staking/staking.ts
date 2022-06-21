// external
import algosdk, {
  Algodv2,
  Transaction,
  getApplicationAddress,
  encodeUint64,
  SuggestedParams,
  assignGroupID,
	makeAssetTransferTxnWithSuggestedParamsFromObject,
	makeApplicationNoOpTxnFromObject

} from "algosdk"

// global
import { Base64Encoder } from "./../encoder"
import { getApplicationGlobalState, getLocalStates, getAccountBalances } from "./../stateUtils"
import { getParams, getPaymentTxn } from "./../transactionUtils"
import { STAKING_STRINGS } from "./stakingConfig"
import AlgofiUser from "./../algofiUser"
import { formatPrefixState } from "./../utils"

// local
import StakingClient from "./stakingClient"
import StakingConfig from "./stakingConfig"
import RewardsProgramState from "./rewardsProgramState"


// INTERFACE
export default class Staking {
  // static
  public algod: Algodv2
  public stakingClient: StakingClient
  public appId: number
  public address: string
	public assetId: number
	public latestTime: number

	public boostMultiplierAppId: number
	public totalStaked: number
	public scaledTotalStaked: number
	public rewardsManagerAppId: number
	public rewardsProgramCount: number
	public rewardsProgramStates: { [key: number]: RewardsProgramState}
  
  constructor(algod: Algodv2, stakingClient: StakingClient, rewardsManagerAppId: number, stakingConfig: StakingConfig) {
    this.algod = algod
    this.stakingClient = stakingClient
    this.appId = stakingConfig.appId
    this.address = getApplicationAddress(this.appId)
    this.assetId = stakingConfig.assetId
		this.rewardsManagerAppId = rewardsManagerAppId
  }

  async loadState() {

		// loading in global state staking specific
    const globalState = await getApplicationGlobalState(this.algod, this.appId)

		this.latestTime = globalState[STAKING_STRINGS.latest_time]
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

	async getStakeTxns(
		user: AlgofiUser,
		amount: number
	) : Promise<Transaction[]> {
    const params = await getParams(this.algod)
    const txns = []
		const enc = new TextEncoder()

		// sending staking asset
		const stakeAssetTransferTxn = makeAssetTransferTxnWithSuggestedParamsFromObject({
			from: user.address,
			to: this.address,
			assetIndex: this.assetId,
			amount: amount,
			suggestedParams: params,
			rekeyTo: undefined,
			revocationTarget: undefined
		})

		// stake transaction
		const stakeTxn = makeApplicationNoOpTxnFromObject({
			from: user.address,
			appIndex: this.address,
			appArgs: [enc.encode(STAKING_STRINGS.stake)],
			suggestedParams: params,
			accounts: undefined,
			foreignAssets: undefined,
			foreignApps: undefined,
			rekeyTo: undefined
		})

		txns.push(stakeAssetTransferTxn, stakeTxn)

		return assignGroupID(txns)
	}

	async getUnstakeTxns(
		user: AlgofiUser,
		amount: number
	) : Promise<Transaction[]> {
    const params = await getParams(this.algod)
		const enc = new TextEncoder()

		// unstake transaction
		const unstakeTxn = algosdk.makeApplicationNoOpTxnFromObject({
			from: user.address,
			appIndex: this.appId,
			appArgs: [enc.encode(STAKING_STRINGS.unstake), encodeUint64(amount)],
			foreignAssets: [this.assetId],
			suggestedParams: params,
			foreignApps: undefined,
			accounts: undefined,
			rekeyTo: undefined
		})

		return [unstakeTxn]
	}

//	// TODO
//	async getClaimTxn(sender: string, rewardsProgramIndex: number): Promise<Transaction> {
//		const params = await getParams(this.algod)
//		const enc = new TextEncoder()
//		const stakingAssetId = await this.getAssetId()
//
//		// claim transaction
//		const claimTxn = makeApplicationNoOpTxnFromObject({
//			from: sender,
//			appIndex: this.stakingAppId,
//			appArgs: [enc.encode(STAKING_STRINGS.claim_rewards), encodeUint64(rewardsProgramIndex)],
//			foreignAssets: [formattedState[STAKING_STRINGS.rewards_asset_id_prefix + rewardsProgramIndex.toString()]],
//			suggestedParams: params
//		})
//
//		return claimTxn
//	}

	async getUserOptInTxns(
		user: AlgofiUser
	) : Promise<Transaction[]> {
    const params = await getParams(this.algod)
		const enc = new TextEncoder()

		// unstake transaction
    const optInTxn = algosdk.makeApplicationOptInTxnFromObject({
      from: user.address,
      appIndex: this.appId,
      suggestedParams: params,
      appArgs: undefined,
			accounts: undefined,
      foreignApps: undefined,
      foreignAssets: undefined,
      rekeyTo: undefined
    })

		return [optInTxn]
	}
}
