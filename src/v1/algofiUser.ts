// IMPORTS

// external
import algosdk, {
  Algodv2,
  encodeAddress,
  LogicSigAccount,
  Transaction,
  getApplicationAddress,
  encodeUint64,
  decodeUint64,
  bytesToBigInt,
  OnApplicationComplete,
  SuggestedParams
} from "algosdk"

// local
import { getLocalStates, getAccountBalances, getAccountMinBalance } from "./stateUtils"
import AlgofiClient from "./algofiClient"

// lending
import LendingUser from "./lending/lendingUser"

// staking
import StakingUser from "./staking/stakingUser"

// v1Staking
import V1StakingUser from "./v1_staking/v1_stakingUser"

// governance
import GovernanceUser from "./governance/governanceUser"

// INTERFACE

export default class AlgofiUser {
  public algofiClient: AlgofiClient
  public algod: Algodv2
  public address: string

  // state
  public balances = {}
  public minBalance: number

  // protcol users
  public lending: LendingUser

  public staking: StakingUser

  public v1Staking: V1StakingUser

  public governance: GovernanceUser

  /**
   * This is a constructor for the AlgofiUser class. It represents a user on the
   * Algofi protocol.
   * 
   * @param algofiClient - an instance of an {@link AlgofiClient}
   * @returns address - a public address for a user
   */
  constructor(algofiClient: AlgofiClient, address: string) {
    this.algofiClient = algofiClient
    this.algod = this.algofiClient.algod
    this.address = address

    // lending
    this.lending = this.algofiClient.lending.getUser(this.address)

    // staking
    this.staking = this.algofiClient.staking.getUser(this.address)

    // v1staking
    this.v1Staking = this.algofiClient.v1Staking.getUser(this.address)

    // governance
    this.governance = this.algofiClient.governance.getUser(this.address)
  }

  /**
   * This function will asynchronously update the state of an {@link AlgofiUser}
   * object.  It will load its states for lending, staking, and governance.
   */
  async loadState() {
    // load balance state
    this.balances = await getAccountBalances(this.algod, this.address)
    this.minBalance = await getAccountMinBalance(this.algod, this.address)

    // load local states
    let localStates = await getLocalStates(this.algod, this.address)

    // update protocol user classes
    await this.lending.loadState(localStates)

    // update user staking state
    await this.staking.loadState(localStates)

    // update user v1 staking state
    await this.v1Staking.loadState(localStates)

    // update user v1 governance state
    await this.governance.loadState(localStates)
  }

  isOptedInToAsset(assetId: number): boolean {
    if (assetId in this.balances) {
      return true
    } else {
      return false
    }
  }
}
