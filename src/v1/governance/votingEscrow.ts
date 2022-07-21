// IMPORTS

// external
import {
  Algod,
  Algodv2,
  assignGroupID,
  encodeUint64,
  getApplicationAddress,
  makeApplicationNoOpTxnFromObject,
  makeAssetTransferTxnWithSuggestedParamsFromObject,
  Transaction
} from "algosdk"

// global
import { getApplicationGlobalState } from "../stateUtils"
import { getParams } from "../transactionUtils"
import AlgofiUser from "../algofiUser"

// local
import GovernanceClient from "./governanceClient"
import { VOTING_ESCROW_STRINGS } from "./governanceConfig"

export default class VotingEscrow {
  public governanceClient: GovernanceClient
  public algod: Algodv2
  public appId: number
  public totalLocked: number
  public totalVebank: number
  public assetId: number
  public votingEscrowMaxTimeLockSeconds: number
  public votingEscrowMinTimeLockSeconds: number

  /**
   * The constructor for the VotingEscrow object
   * 
   * @param governanceClient - a governance client
   */
  constructor(governanceClient: GovernanceClient) {
    this.governanceClient = governanceClient
    this.algod = this.governanceClient.algod
    this.appId = governanceClient.governanceConfig.votingEscrowAppId
    this.votingEscrowMaxTimeLockSeconds = governanceClient.governanceConfig.votingEscrowMaxTimeLockSeconds
    this.votingEscrowMinTimeLockSeconds = governanceClient.governanceConfig.votingEscrowMinTimeLockSeconds
  }

  /**
   * A function which when called will update the data on the voting escrow
   * object to match that of the global state of the voting escrow contract.
   */
  async loadState() {
    const globalState = await getApplicationGlobalState(this.algod, this.appId)

    this.totalLocked = globalState[VOTING_ESCROW_STRINGS.total_locked] || 0
    this.totalVebank = globalState[VOTING_ESCROW_STRINGS.total_vebank] || 0
    this.assetId = globalState[VOTING_ESCROW_STRINGS.asset_id] || 0
  }

  /**
   * Constructs a series of transactions to update a target user's vebank.
   * 
   * @param userCalling - user who is calling the udpate transaction
   * @param userUpdating - user whose vebank is actually being updated
   * @returns a series of transactions to update a target user's vebank
   */
  async getUpdateVeBankDataTxns(userCalling: AlgofiUser, userUpdating: AlgofiUser): Promise<Transaction[]> {
    const params = await getParams(this.algod)
    const enc = new TextEncoder()

    const updateUserVebankDataTxn = makeApplicationNoOpTxnFromObject({
      from: userCalling.address,
      appIndex: this.appId,
      appArgs: [enc.encode(VOTING_ESCROW_STRINGS.update_vebank_data)],
      suggestedParams: params,
      accounts: [userUpdating.address],
      foreignAssets: undefined,
      foreignApps: undefined,
      rekeyTo: undefined
    })

    return [updateUserVebankDataTxn]
  }

  /**
   * Constructs a series of transactions that lock a user's BANK to get veBANK.
   * 
   * @param user - user who is locking
   * @param amount - amount they are locking
   * @param durationSeconds - amount of time they are locking for 
   * @returns a series of transactions that lock a user's BANK to get veBANK.
   */
  async getLockTxns(user: AlgofiUser, amount: number, durationSeconds: number): Promise<Transaction[]> {
    const params = await getParams(this.algod)
    const enc = new TextEncoder()
    const txns = []

    const govTokenTxn = makeAssetTransferTxnWithSuggestedParamsFromObject({
      from: user.address,
      to: getApplicationAddress(this.appId),
      assetIndex: this.governanceClient.governanceConfig.governanceToken,
      amount: amount,
      suggestedParams: params,
      rekeyTo: undefined,
      revocationTarget: undefined
    })

    const lockTxn = makeApplicationNoOpTxnFromObject({
      from: user.address,
      appIndex: this.appId,
      appArgs: [enc.encode(VOTING_ESCROW_STRINGS.lock), encodeUint64(durationSeconds)],
      suggestedParams: params,
      accounts: undefined,
      foreignAssets: undefined,
      foreignApps: undefined,
      rekeyTo: undefined
    })

    txns.push(govTokenTxn, lockTxn)
    return assignGroupID(txns)
  }

  /**
   * Constructs a series of transactions that extend a user's lock on their BANK.
   * 
   * @param user - user who is locking
   * @param durationSeconds - amount of time they are extending for
   * @returns a series of transactions that extend a user's lock on their BANK.
   */
  async getExtendLockTxns(user: AlgofiUser, durationSeconds: number): Promise<Transaction[]> {
    const params = await getParams(this.algod)
    const enc = new TextEncoder()

    const extendLockTxn = makeApplicationNoOpTxnFromObject({
      from: user.address,
      appIndex: this.appId,
      appArgs: [enc.encode(VOTING_ESCROW_STRINGS.extend_lock), encodeUint64(durationSeconds)],
      suggestedParams: params,
      accounts: undefined,
      foreignAssets: undefined,
      foreignApps: undefined,
      rekeyTo: undefined
    })

    return [extendLockTxn]
  }

  /**
   * Constructs a series of transactions that increase a user's lock amount.
   * 
   * @param user - user who is locking
   * @param amount - amount they are increasing their lock for
   * @returns a series of transactions that increase a user's lock amount.
   */
  async getIncreaseLockAmountTxns(user: AlgofiUser, amount: number): Promise<Transaction[]> {
    const params = await getParams(this.algod)
    const enc = new TextEncoder()
    const txns = []

    const govTokenTxn = makeAssetTransferTxnWithSuggestedParamsFromObject({
      from: user.address,
      to: getApplicationAddress(this.appId),
      assetIndex: this.governanceClient.governanceConfig.governanceToken,
      amount: amount,
      suggestedParams: params,
      rekeyTo: undefined,
      revocationTarget: undefined
    })

    const increaseLockAmountTxns = makeApplicationNoOpTxnFromObject({
      from: user.address,
      appIndex: this.appId,
      appArgs: [enc.encode(VOTING_ESCROW_STRINGS.increase_lock_amount)],
      suggestedParams: params,
      accounts: undefined,
      foreignAssets: undefined,
      foreignApps: undefined,
      rekeyTo: undefined
    })

    txns.push(govTokenTxn, increaseLockAmountTxns)
    return assignGroupID(txns)
  }

  async getClaimTxns(user: AlgofiUser): Promise<Transaction[]> {
    const params = await getParams(this.algod)
    const enc = new TextEncoder()
    params.fee = 2000

    const claimTxn = makeApplicationNoOpTxnFromObject({
      from: user.address,
      appIndex: this.appId,
      appArgs: [enc.encode(VOTING_ESCROW_STRINGS.claim)],
      suggestedParams: params,
      foreignAssets: [this.governanceClient.governanceConfig.governanceToken],
      accounts: undefined,
      foreignApps: undefined,
      rekeyTo: undefined
    })

    return [claimTxn]
  }
}
