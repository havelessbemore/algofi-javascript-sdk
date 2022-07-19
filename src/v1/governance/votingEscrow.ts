// IMPORTS

import { Algod, Algodv2 } from "algosdk"
import GovernanceClient from "./governanceClient"
import GovernanceConfig from "./governanceConfig"
import { getApplicationGlobalState } from "../stateUtils"
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
  async getUpdateVeBankDataTxns() {}
  // TODO implement this
  async getLockTxns() {}
  // TODO implement this
  async getExtendLockTxns() {}
  // TODO implement this
  async getIncreaseLockAmountTxns() {}
  // TODO implement this
  async getClaimTxns() {}
}
