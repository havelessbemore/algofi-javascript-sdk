// IMPORTS

// external
import { Algodv2, getApplicationAddress } from "algosdk"
import { getApplicationGlobalState, getLocalStates } from "../stateUtils"

// local
import GovernanceClient from "./governanceClient"
import { ADMIN_STRINGS, PROPOSAL_STRINGS } from "./governanceConfig"

export default class Proposal {
  public governanceClient: GovernanceClient
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

  /**
   * Constructor for the proposal class.
   * 
   * @param governanceClient - a governance client
   * @param proposalAppId - the app id of the proposal 
   */
  constructor(governanceClient: GovernanceClient, proposalAppId: number) {
    this.governanceClient = governanceClient
    this.algod = this.governanceClient.algod
    this.appId = proposalAppId
    this.adminAppId = governanceClient.governanceConfig.adminAppId
    this.address = getApplicationAddress(this.appId)
  }

  /**
   * Function that will update the data on the proposal object with the global
   * and local data of the proposal contract on chain.
   */
  async loadState() {
    // Set proposal local state
    const proposalLocalStates: { [key: string]: {} } = await getLocalStates(this.algod, this.address)
    for (const [key, value] of Object.entries(proposalLocalStates)) {
      const appId = parseInt(key)
      if (appId == this.governanceClient.admin.adminAppId) {
        this.votesFor = value[ADMIN_STRINGS.votes_for] || 0
        this.votesAgainst = value[ADMIN_STRINGS.votes_against] || 0
        this.voteCloseTime = value[ADMIN_STRINGS.vote_close_time] || 0
        this.executionTime = value[ADMIN_STRINGS.execution_time] || 0
        this.executed = value[ADMIN_STRINGS.executed] || 0
        this.canceledByEmergencyDao = value[ADMIN_STRINGS.canceled_by_emergency_dao] || 0
      }
    }
    // Set proposal global state
    const globalState = await getApplicationGlobalState(this.algod, this.appId)
    this.title = atob(globalState[PROPOSAL_STRINGS.title])
    this.link = atob(globalState[PROPOSAL_STRINGS.link])
  }
}
