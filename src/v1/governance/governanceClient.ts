// IMPORTS

// external
import {
  Account,
  Algodv2,
  assignGroupID,
  makeApplicationOptInTxnFromObject,
  makePaymentTxnWithSuggestedParamsFromObject,
  Transaction
} from "algosdk"

// global
import AlgofiClient from "./../algofiClient"
import { Network } from "./../globals"
import AlgofiUser from "../algofiUser"
import { getParams } from "../transactionUtils"

// local
import GovernanceConfig, { ADMIN_STRINGS, GovernanceConfigs, REWARDS_MANAGER_STRINGS } from "./governanceConfig"
import VotingEscrow from "./votingEscrow"
import governanceUser from "./governanceUser"
import Admin from "./admin"
import RewardsManager from "./rewardsManager"

export default class GovernanceClient {
  public algofiClient: AlgofiClient
  public algod: Algodv2
  public network: Network
  public admin: Admin
  public votingEscrow: VotingEscrow
  public rewardsManager: RewardsManager
  public governanceConfig: GovernanceConfig

  /**
   * Constructor for the algofi governance client.
   * 
   * @param algofiClient - an instance of an algofi client
   */
  constructor(algofiClient: AlgofiClient) {
    this.algofiClient = algofiClient
    this.algod = this.algofiClient.algod
    this.network = this.algofiClient.network
    this.governanceConfig = GovernanceConfigs[this.network]
  }
  /**
   * Creates new admin, voting escrow, and rewards managers on the algofi client 
   * object and loads their state.
   */
  async loadState() {
    // Creating new Admin + Proposal Factory and filling in state
    this.admin = new Admin(this)
    this.admin.loadState()

    // Creating new Voting Escrow and filling in state
    this.votingEscrow = new VotingEscrow(this)
    this.votingEscrow.loadState()

    // Put in empty load state function
    this.rewardsManager = new RewardsManager(this, this.governanceConfig)
  }

  /**
   * Gets an algofi governance user given an address.
   * 
   * @param address - the address of the user we are interested in.
   * @returns an algofi governance user.
   */
  getUser(address: string) {
    return new governanceUser(this, address)
  }

  /**
   * Constructs a series of transactions to opt the user and their storage
   * account into all of the necessary applications for governance including the
   * admin, the voting escrow, and the rewards manager.
   * 
   * @param user - user we are opting into the contracts
   * @param storageAccount - a newly created account that will serve as the
   * storage account for the user on the protocol
   * @returns a series of transactions to opt the user and their storage
   * account into all of the necessary applications for governance including the
   * admin, the voting escrow, and the rewards manager.
   */
  async getOptInTxns(user: AlgofiUser, storageAccount: Account): Promise<Transaction[]> {
    const params = await getParams(this.algod)
    const txns = []
    const enc = new TextEncoder()

    // Fund storage account
    const fundStorageAccountTxn = makePaymentTxnWithSuggestedParamsFromObject({
      from: user.address,
      // TODO figure out exact amount
      amount: 1_000_000,
      to: storageAccount.addr,
      suggestedParams: params,
      closeRemainderTo: undefined,
      rekeyTo: undefined
    })

    // Opt storage account into admin
    const optStorageAccountIntoAdminTxn = makeApplicationOptInTxnFromObject({
      from: storageAccount.addr,
      appIndex: this.admin.adminAppId,
      suggestedParams: params,
      appArgs: [enc.encode(ADMIN_STRINGS.storage_account_opt_in)],
      accounts: [user.address],
      foreignApps: undefined,
      foreignAssets: undefined,
      rekeyTo: this.admin.adminAddress
    })

    // Opt the primary account into the admin contract
    const optPrimaryAccountIntoAdminTxn = makeApplicationOptInTxnFromObject({
      from: user.address,
      appIndex: this.admin.adminAppId,
      suggestedParams: params,
      appArgs: [enc.encode(ADMIN_STRINGS.user_opt_in)],
      accounts: [storageAccount.addr],
      foreignApps: undefined,
      foreignAssets: undefined,
      rekeyTo: undefined
    })

    // Opt primary account into voting escrow
    const optPrimaryAccountIntoVotingEscrowTxn = makeApplicationOptInTxnFromObject({
      from: user.address,
      appIndex: this.votingEscrow.appId,
      suggestedParams: params,
      foreignApps: [this.rewardsManager.appId],
      appArgs: undefined,
      accounts: undefined,
      foreignAssets: undefined,
      rekeyTo: undefined
    })

    // Opt primary account into rewards manager
    const optPrimaryAccountIntoRewardsManager = makeApplicationOptInTxnFromObject({
      from: user.address,
      appIndex: this.rewardsManager.appId,
      suggestedParams: params,
      foreignApps: [this.votingEscrow.appId],
      appArgs: [enc.encode(REWARDS_MANAGER_STRINGS.user_opt_in)],
      accounts: undefined,
      foreignAssets: undefined,
      rekeyTo: undefined
    })

    txns.push(
      fundStorageAccountTxn,
      optStorageAccountIntoAdminTxn,
      optPrimaryAccountIntoAdminTxn,
      optPrimaryAccountIntoVotingEscrowTxn,
      optPrimaryAccountIntoRewardsManager
    )

    return assignGroupID(txns)
  }
}
