// IMPORTS

// external
import { Algodv2, getApplicationAddress } from "algosdk"

// global
import { getApplicationGlobalState } from "../stateUtils"

// local
import GovernanceClient from "./governanceClient"
import GovernanceConfig, { GovernanceConfigs, ADMIN_STRINGS, PROPOSAL_FACTORY_STRINGS } from "./governanceConfig"
import Proposal from "./proposal"

export default class Admin {
  // General
  public governanceClient: GovernanceClient
  public algod: Algodv2
  // Admin specific
  public adminAppId: number
  public quorumValue: number
  public superMajority: number
  public proposalDuration: number
  public proposalExecutionDelay: number
  // Proposal factory specific
  public proposalFactoryAppId: number
  public proposalFactoryAddress: string
  public govToken: number
  public proposalTemplateId: number
  public minimumVeBankToPropose: number
  public proposals: { [key: number]: Proposal }

  constructor(governanceClient: GovernanceClient, governanceConfig: GovernanceConfig) {
    this.governanceClient = governanceClient
    this.algod = this.governanceClient.algod
    this.adminAppId = governanceConfig.votingEscrowAppId
    this.proposalFactoryAppId = governanceConfig.proposalFactoryAppId
    this.proposalFactoryAddress = getApplicationAddress(this.proposalFactoryAppId)
  }

  async loadState() {
    // Setting state for admin
    const globalStateAdmin = await getApplicationGlobalState(this.algod, this.adminAppId)
    this.quorumValue = globalStateAdmin[ADMIN_STRINGS.quorum_value]
    this.superMajority = globalStateAdmin[ADMIN_STRINGS.super_majority]
    this.proposalDuration = globalStateAdmin[ADMIN_STRINGS.proposal_duration]
    this.proposalExecutionDelay = globalStateAdmin[ADMIN_STRINGS.proposal_execution_delay]

    // Setting state for proposal factory
    const globalStateProposalFactory = await getApplicationGlobalState(this.algod, this.proposalFactoryAppId)
    this.govToken = globalStateProposalFactory[PROPOSAL_FACTORY_STRINGS.gov_token]
    this.proposalTemplateId = globalStateProposalFactory[PROPOSAL_FACTORY_STRINGS.proposal_template]
    this.minimumVeBankToPropose = globalStateProposalFactory[PROPOSAL_FACTORY_STRINGS.minimum_ve_bank_to_propose]

    // TODO get created apps from account info
    const proposalFactoryAddressInfo = await this.algod.accountInformation(this.proposalFactoryAddress).do()
    // TODO get add them to the dictionary for proposals
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
  // TODO implement this
  async getCreateProposalTxns() {}
  // TODO implement this
  async canUserPropose() {}
}
