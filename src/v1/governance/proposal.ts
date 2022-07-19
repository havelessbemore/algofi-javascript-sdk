// IMPORTS

// external
import { Algodv2, getApplicationAddress } from "algosdk"
import { getApplicationGlobalState, getLocalStates } from "../stateUtils"

// local
import GovernanceClient from "./governanceClient"
import GovernanceConfig, { ProposalConfig } from "./governanceConfig"
import { PROPOSAL_STRINGS } from "./governanceConfig"

export default class Proposal {
  public govClient: GovernanceClient
  public algod: Algodv2
  public appId: number
  public address: string
  public votesFor: number
  public votesAgainst: number
  public title: string
  public link: string
  // To get local state for votes for and against
  public adminAppId: number
  constructor(govClient: GovernanceClient, proposalConfig: ProposalConfig, governanceConfig: GovernanceConfig) {
    this.govClient = govClient
    this.algod = this.govClient.algod
    this.appId = proposalConfig.appId
    this.adminAppId = governanceConfig.adminAppId
    this.address = getApplicationAddress(this.appId)
  }

  async loadState() {
    // Proposal should only be opted into the admin contract
    const proposalLocalStates = getLocalStates(this.algod, this.address)
    // TODO, from here we should just need to access the votes for and against fields on the proposal's local state with the admin contract
    const globalState = getApplicationGlobalState(this.algod, this.appId)
    this.title = globalState[PROPOSAL_STRINGS.title]
    this.link = globalState[PROPOSAL_STRINGS.link]
  }
}
