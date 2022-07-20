// IMPORTS

import {
  Algod,
  Algodv2,
  getApplicationAddress,
  makeApplicationNoOpTxnFromObject,
  makeAssetTransferTxnWithSuggestedParamsFromObject,
  Transaction
} from "algosdk"
import GovernanceClient from "./governanceClient"
import GovernanceConfig from "./governanceConfig"
import { getApplicationGlobalState } from "../stateUtils"
import { VOTING_ESCROW_STRINGS } from "./governanceConfig"
import AlgofiUser from "../algofiUser"
import { getParams } from "../transactionUtils"

export default class VotingEscrow {
  public governanceClient: GovernanceClient
  public algod: Algodv2
  public appId: number
  public totalLocked: number
  public totalVebank: number
  public assetId: number
  public votingEscrowMaxTimeLockSeconds: number
  public votingEscrowMinTimeLockSeconds: number

  constructor(governanceClient: GovernanceClient) {
    this.governanceClient = governanceClient
    this.algod = this.governanceClient.algod
    this.appId = governanceClient.governanceConfig.votingEscrowAppId
    this.votingEscrowMaxTimeLockSeconds = governanceClient.governanceConfig.votingEscrowMaxTimeLockSeconds
    this.votingEscrowMinTimeLockSeconds = governanceClient.governanceConfig.votingEscrowMinTimeLockSeconds
  }

  async loadState() {
    const globalState = await getApplicationGlobalState(this.algod, this.appId)

    this.totalLocked = globalState[VOTING_ESCROW_STRINGS.total_locked]
    this.totalVebank = globalState[VOTING_ESCROW_STRINGS.total_vebank]
    this.assetId = globalState[VOTING_ESCROW_STRINGS.asset_id]
  }

  // TODO implement this
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

  async getLockTxns(user: AlgofiUser, amount: number): Promise<Transaction[]> {
    const params = await getParams(this.algod)
    const enc = new TextEncoder()

    const govTokenTxn = await makeAssetTransferTxnWithSuggestedParamsFromObject({
      from: user.address,
      to: getApplicationAddress(this.appId),
      assetIndex: this.governanceClient.governanceConfig.governanceToken,
      amount: amount,
      suggestedParams: params,
      rekeyTo: undefined,
      revocationTarget: undefined
    })

    return [govTokenTxn]
  }
  // TODO implement this
  async getExtendLockTxns() {}
  // TODO implement this
  async getIncreaseLockAmountTxns() {}
  // TODO implement this
  async getClaimTxns() {}
}
