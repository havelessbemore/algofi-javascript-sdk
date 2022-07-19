// IMPORTS

// external
import { Algodv2, getApplicationAddress, makeApplicationNoOpTxnFromObject, Transaction } from "algosdk"
import AlgofiUser from "../algofiUser"

// global
import { getApplicationGlobalState } from "../stateUtils"
import { getParams } from "../transactionUtils"

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

  constructor(governanceClient: GovernanceClient) {
    this.governanceClient = governanceClient
    this.algod = this.governanceClient.algod
    this.adminAppId = governanceClient.governanceConfig.votingEscrowAppId
    this.proposalFactoryAppId = governanceClient.governanceConfig.proposalFactoryAppId
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
    // Put this in config (fixed)
    this.govToken = globalStateProposalFactory[PROPOSAL_FACTORY_STRINGS.gov_token]
    this.proposalTemplateId = globalStateProposalFactory[PROPOSAL_FACTORY_STRINGS.proposal_template]
    this.minimumVeBankToPropose = globalStateProposalFactory[PROPOSAL_FACTORY_STRINGS.minimum_ve_bank_to_propose]

    // TODO get created apps from account info
    const proposalFactoryAddressInfo = await this.algod.accountInformation(this.proposalFactoryAddress).do()
    // TODO get add them to the dictionary for proposals
  }

  async getUpdateVeBankDataTxns() {}
  async getVoteTxns() {}
  async getDelegateTxns() {}
  async getValidateTxns() {}
  async getUndelegateTxns() {}
  async getDelegatedVoteTxns() {}
  async getCloseOutFromProposalTxns() {}
  async getSetOpenToDelegationTxns(user: AlgofiUser): Promise<Transaction[]> {
    const params = await getParams(this.algod)
    const txns = []
    const enc = new TextEncoder()
    const openToDelegationTxn = makeApplicationNoOpTxnFromObject({
      from:user.address,
      appIndex:this.adminAppId,
      appArgs:[enc.encode(ADMIN_STRINGS.set_open_to_delegation)],
      foreignApps:undefined,
      suggestedParams:params,
      accounts:[user],
      foreignAssets:,
      rekeyTo:
    })
    txns.push(openToDelegationTxn)
    return txns
  }
  async getSetNotOpenToDelegationTxns() {}
}
