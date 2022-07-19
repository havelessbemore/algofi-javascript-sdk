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
    // Set proposal local state
    const proposalLocalStates: { [key: string]: {} } = await getLocalStates(this.algod, this.address)
    for (const [key, value] of Object.entries(proposalLocalStates)) {
      const appId = parseInt(key)
      if (appId == this.govClient.admin.adminAppId) {
        this.votesFor = value[ADMIN_STRINGS.votes_for]
        this.votesAgainst = value[ADMIN_STRINGS.votes_against]
      }
    }
    // Set proposal global state
    const globalState = await getApplicationGlobalState(this.algod, this.appId)
    this.title = globalState[PROPOSAL_STRINGS.title]
    this.link = globalState[PROPOSAL_STRINGS.link]
  }
}
