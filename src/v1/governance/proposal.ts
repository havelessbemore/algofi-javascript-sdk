// IMPORTS

// external
import { Algodv2, getApplicationAddress } from "algosdk"
import { getApplicationGlobalState, getLocalStates } from "../stateUtils"

// local
import GovernanceClient from "./governanceClient"
import GovernanceConfig, { ADMIN_STRINGS, ProposalConfig } from "./governanceConfig"
import { PROPOSAL_STRINGS } from "./governanceConfig"

export default class Proposal {
  public govClient: GovernanceClient
  public algod: Algodv2
  public appId: number
  public address: string
  public votesFor: number
  public votesAgainst: number
  public voteCloseTime: number
  public executionTime: number
  public executed: number
  public canceledByEmergencyDao: number
  public title: string
  public link: string
  // To get local state for votes for and against
  public adminAppId: number
  constructor(govClient: GovernanceClient, proposalAppId) {
    this.govClient = govClient
    this.algod = this.govClient.algod
    this.appId = proposalAppId
    this.adminAppId = govClient.governanceConfig.adminAppId
    this.address = getApplicationAddress(this.appId)
  }

  async loadState() {
    // Set proposal local state
    const proposalLocalStates: { [key: string]: {} } = await getLocalStates(this.algod, this.address)
    for (const [key, value] of Object.entries(proposalLocalStates)) {
      const appId = parseInt(key)
      if (appId == this.govClient.admin.adminAppId) {
        this.votesFor = value[ADMIN_STRINGS.votes_for]
        this.votesAgainst = value[ADMIN_STRINGS.votes_against]
        this.voteCloseTime = value[ADMIN_STRINGS.vote_close_time] || 0
        this.executionTime = value[ADMIN_STRINGS.execution_time] || 0
        this.executed = value[ADMIN_STRINGS.executed] || 0
        this.canceledByEmergencyDao = value[ADMIN_STRINGS.canceled_by_emergency_dao] || 0
      }
    }
    // Set proposal global state
    const globalState = await getApplicationGlobalState(this.algod, this.appId)
    this.title = globalState[PROPOSAL_STRINGS.title]
    this.link = globalState[PROPOSAL_STRINGS.link]
  }
}
