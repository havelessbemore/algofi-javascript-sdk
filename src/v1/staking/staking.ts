// external
import algosdk, {
  Algodv2,
  Transaction,
  getApplicationAddress,
  encodeUint64,
  SuggestedParams,
  assignGroupID
} from "algosdk"

// global
import { Base64Encoder } from "./../encoder"
import { getApplicationGlobalState, getLocalStates, getAccountBalances } from "./../stateUtils"
import { getParams, getPaymentTxn } from "./../transactionUtils"


// local
import StakingClient from "./stakingClient"
import StakingConfig from "./stakingConfig"


// INTERFACE

export default class Staking {
  // static
  public algod: Algodv2
  public lendingClient: LendingClient
  public managerAppId: number
  public appId: number
  public address: string
	public assetId: number
	public stakingClient: StakingClient
  
  constructor(algod: Algodv2, stakingClient: StakingClient, rewardsManagerAppId: number, stakingConfig: StakingConfig) {
    this.algod = algod
    this.stakingClient = stakingClient
    this.managerAppId = managerAppId
    this.appId = stakingConfig.appId
    this.address = getApplicationAddress(this.appId)
    this.assetId = stakingConfig.assetId
  }
  
  async loadState() {
    let state = await getApplicationGlobalState(this.algod, this.appId)
	}
}
