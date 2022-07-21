// IMPORTS

// external
import {
  Algodv2,
  assignGroupID,
  encodeUint64,
  getApplicationAddress,
  makeApplicationCloseOutTxnFromObject,
  makeApplicationNoOpTxnFromObject,
  makePaymentTxnWithSuggestedParamsFromObject,
  Transaction
} from "algosdk"
import AlgofiUser from "../algofiUser"

// global
import { getApplicationGlobalState } from "../stateUtils"
import { getParams } from "../transactionUtils"

// local
import GovernanceClient from "./governanceClient"
import { ADMIN_STRINGS, PROPOSAL_FACTORY_STRINGS } from "./governanceConfig"
import Proposal from "./proposal"

export default class Admin {
  // General
  public governanceClient: GovernanceClient
  public algod: Algodv2

  // Admin specific
  public adminAppId: number
  public adminAddress: string
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
  public proposals: { [key: number]: Proposal } = {}

  /**
   * This is a constructor for the Admin class. It represents the admin
   * contract on the protocol.  From the admin we can vote, delegate, validate
   * proposals, undelegate, delegated vote, close out from proposals, set open
   * to delegation, set not open to delegation, and create proposals.
   * 
   * @param governanceClient - an Algofi Governance Client 
   */
  constructor(governanceClient: GovernanceClient) {
    this.governanceClient = governanceClient
    this.algod = this.governanceClient.algod
    this.adminAppId = governanceClient.governanceConfig.adminAppId
    this.proposalFactoryAppId = governanceClient.governanceConfig.proposalFactoryAppId
    this.proposalFactoryAddress = getApplicationAddress(this.proposalFactoryAppId)
    this.adminAddress = getApplicationAddress(this.adminAppId)
  }

  /**
   * This is an asynchronous function which will refresh and load all of the
   * global and local state we need to keep track of on the admin, including all
   * of the proposals that hvae been created as well.
   */
  async loadState() {
    // Setting state for admin
    const globalStateAdmin = await getApplicationGlobalState(this.algod, this.adminAppId)
    this.quorumValue = globalStateAdmin[ADMIN_STRINGS.quorum_value] || 0
    this.superMajority = globalStateAdmin[ADMIN_STRINGS.super_majority] || 0
    this.proposalDuration = globalStateAdmin[ADMIN_STRINGS.proposal_duration] || 0
    this.proposalExecutionDelay = globalStateAdmin[ADMIN_STRINGS.proposal_execution_delay] || 0

    // Setting state for proposal factory
    const globalStateProposalFactory = await getApplicationGlobalState(this.algod, this.proposalFactoryAppId)

    // Put this in config (fixed)
    this.govToken = globalStateProposalFactory[PROPOSAL_FACTORY_STRINGS.gov_token] || 0
    this.proposalTemplateId = globalStateProposalFactory[PROPOSAL_FACTORY_STRINGS.proposal_template] || 0
    this.minimumVeBankToPropose = globalStateProposalFactory[PROPOSAL_FACTORY_STRINGS.minimum_ve_bank_to_propose] || 0

    // Creating the proposal dictionary
    const proposalFactoryAddressInfo = await this.algod.accountInformation(this.proposalFactoryAddress).do()
    for (const appObject of proposalFactoryAddressInfo["created-apps"]) {
      this.proposals[appObject["id"]] = new Proposal(this.governanceClient, appObject["id"])
      this.proposals[appObject["id"]].loadState()
    }
  }

  /**
   * This will return the transactions we need to update a target user's vebank
   * through the admin contract.
   * 
   * @param userCalling - the user who is calling the transaction
   * @param userUpdating - the user who is being updated
   * @returns a list of transactions that when executed will update a target
   * user's vebank.
   */
  async getUpdateUserVeBankDataTxns(userCalling: AlgofiUser, userUpdating: AlgofiUser): Promise<Transaction[]> {
    const params = await getParams(this.algod)
    const enc = new TextEncoder()

    // TODO figure out correct amount
    params.fee = 5000
    const updateUserVebankDataTxn = makeApplicationNoOpTxnFromObject({
      from: userCalling.address,
      appIndex: this.adminAppId,
      appArgs: [enc.encode(ADMIN_STRINGS.update_user_vebank)],
      foreignApps: [this.governanceClient.votingEscrow.appId],
      suggestedParams: params,
      accounts: [userUpdating.address, userUpdating.governance.userAdminState.storageAddress],
      foreignAssets: undefined,
      rekeyTo: undefined
    })

    return [updateUserVebankDataTxn]
  }

  /**
   * This will return the transactions needed for a user to vote on a proposal.
   * 
   * @param user - user who is voting
   * @param proposal - proposal being voted on
   * @returns a list of transactions that when executed will vote for a specific
   * proposal on behalf of a user.
   */
  async getVoteTxns(user: AlgofiUser, proposal: Proposal, forOrAgainst: number): Promise<Transaction[]> {
    const params = await getParams(this.algod)
    const enc = new TextEncoder()
    const txns = []

    // User calling update vebank on themselves
    const updateUserVebankDataTxn = await this.getUpdateUserVeBankDataTxns(user, user)
    params.fee = 2000
    const voteTxn = makeApplicationNoOpTxnFromObject({
      from: user.address,
      appIndex: this.adminAppId,
      appArgs: [enc.encode(ADMIN_STRINGS.vote), encodeUint64(forOrAgainst)],
      foreignApps: [proposal.appId],
      suggestedParams: params,
      accounts: [user.governance.userAdminState.storageAddress, getApplicationAddress(proposal.appId)],
      foreignAssets: undefined,
      rekeyTo: undefined
    })

    return assignGroupID([...updateUserVebankDataTxn, voteTxn])
  }

  /**
   * This will return the transactions needed for a user to delegate to another
   * user.
   * 
   * @param user - user who is delegating
   * @param delegatee - user who is being delegated to
   * @returns a list of transactions that when executed will delegate the a
   * users votes to the delegatee passed in.
   */
  async getDelegateTxns(user: AlgofiUser, delegatee: AlgofiUser): Promise<Transaction[]> {
    const params = await getParams(this.algod)
    const enc = new TextEncoder()
    const txns = []

    // We assume that delegatee has loaded state so they have a storage account
    const delegateTxn = makeApplicationNoOpTxnFromObject({
      from: user.address,
      appIndex: this.adminAppId,
      appArgs: [enc.encode(ADMIN_STRINGS.delegate)],
      suggestedParams: params,
      accounts: [user.governance.userAdminState.storageAddress, delegatee.governance.userAdminState.storageAddress],
      foreignApps: undefined,
      foreignAssets: undefined,
      rekeyTo: undefined
    })
    return [delegateTxn]
  }

  /**
   * This will return the transactions needed for a user to validate a proposal.
   * 
   * @param user - user who is trying to validate a proposal
   * @param proposal - the proposal to validate
   * @returns a list of transactions that when executed will attempt to validate
   * the proposal passed in with the admin contract.
   */
  async getValidateTxns(user: AlgofiUser, proposal: Proposal): Promise<Transaction[]> {
    const params = await getParams(this.algod)
    const enc = new TextEncoder()
    const txns = []

    const validateTxn = makeApplicationNoOpTxnFromObject({
      from: user.address,
      appIndex: this.adminAppId,
      appArgs: [enc.encode(ADMIN_STRINGS.validate)],
      foreignApps: [proposal.appId],
      suggestedParams: params,
      accounts: [getApplicationAddress(proposal.appId)],
      foreignAssets: undefined,
      rekeyTo: undefined
    })

    return [validateTxn]
  }

  /**
   * This will return the transactions needed for a user undelegate their votes.
   * 
   * @param user - user who is undelegating
   * @returns a list of transactions that when executed will undelegate the user
   * passed in from anyone who they are currently delegating to.
   */
  async getUndelegateTxns(user: AlgofiUser): Promise<Transaction[]> {
    const params = await getParams(this.algod)
    const enc = new TextEncoder()
    const txns = []

    const undelegateTxn = makeApplicationNoOpTxnFromObject({
      from: user.address,
      appIndex: this.adminAppId,
      appArgs: [enc.encode(ADMIN_STRINGS.undelegate)],
      suggestedParams: params,
      accounts: [user.governance.userAdminState.storageAddress, user.governance.userAdminState.delegatingTo],
      foreignApps: undefined,
      foreignAssets: undefined,
      rekeyTo: undefined
    })

    return [undelegateTxn]
  }

  /**
   * This will return the transactions needed for a user to vote to call a
   * delegated vote transaction on another user.
   * 
   * @param callingUser - user who is calling the delegated vote transaction
   * @param votingUser - user who is voting
   * @param proposal - proposal being voted on
   * @returns a list of transactions that when executed will attempt to push a
   * user who has delegated to vote as their delegatee has on a certain
   * proposal.
   */
  async getDelegatedVoteTxns(
    callingUser: AlgofiUser,
    votingUser: AlgofiUser,
    proposal: Proposal
  ): Promise<Transaction[]> {
    const params = await getParams(this.algod)
    const enc = new TextEncoder()
    const txns = []

    const updateUserVebankDataTxn = await this.getUpdateUserVeBankDataTxns(callingUser, votingUser)
    const delegatedVoteTxn = makeApplicationNoOpTxnFromObject({
      from: callingUser.address,
      appIndex: this.adminAppId,
      appArgs: [enc.encode(ADMIN_STRINGS.delegated_vote)],
      foreignApps: [proposal.appId, this.governanceClient.votingEscrow.appId],
      suggestedParams: params,
      accounts: [
        votingUser.address,
        votingUser.governance.userAdminState.storageAddress,
        votingUser.governance.userAdminState.delegatingTo,
        getApplicationAddress(proposal.appId)
      ],
      foreignAssets: undefined,
      rekeyTo: undefined
    })

    return assignGroupID([...updateUserVebankDataTxn, delegatedVoteTxn])
  }

  /**
   * This will return the transactions needed for a user to close out from a proposal.
   * 
   * @param userCalling - user who is calling the transaction
   * @param userClosingOut - user who is closing out
   * @param proposal - proposal being closed out of 
   * @returns a list of transactions that when executed will close out a target
   * user from a target proposal.
   */
  async getCloseOutFromProposalTxns(
    userCalling: AlgofiUser,
    userClosingOut: AlgofiUser,
    proposal: Proposal
  ): Promise<Transaction[]> {
    const params = await getParams(this.algod)
    const enc = new TextEncoder()

    params.fee = 3000
    const closeOutFromProposalTxn = await makeApplicationNoOpTxnFromObject({
      from: userCalling.address,
      appIndex: this.adminAppId,
      suggestedParams: params,
      appArgs: [enc.encode(ADMIN_STRINGS.close_out_from_proposal)],
      accounts: [getApplicationAddress(proposal.appId), userClosingOut.governance.userAdminState.storageAddress],
      foreignApps: [proposal.appId],
      foreignAssets: undefined,
      rekeyTo: undefined
    })

    return [closeOutFromProposalTxn]
  }

  /**
   * This will set the user passed in to be open to delegation.
   * 
   * @param user - user who is setting themselves open to delegation
   * @returns a list of transactions that when executed will set the passed in
   * user to be open to delegation.
   */
  async getSetOpenToDelegationTxns(user: AlgofiUser): Promise<Transaction[]> {
    const params = await getParams(this.algod)
    const txns = []
    const enc = new TextEncoder()

    const setOpenToDelegationTxn = makeApplicationNoOpTxnFromObject({
      from: user.address,
      appIndex: this.adminAppId,
      appArgs: [enc.encode(ADMIN_STRINGS.set_open_to_delegation)],
      suggestedParams: params,
      accounts: [user.governance.userAdminState.storageAddress],
      foreignAssets: undefined,
      foreignApps: undefined,
      rekeyTo: undefined
    })

    return [setOpenToDelegationTxn]
  }

  /**
   * This will set the user passed in to be not open to delegation.
   * 
   * @param user - user who is setting themselves not open to delegation
   * @returns a list of transactions that when executed will set the passed in
   * user to be not open to delegation.
   */
  async getSetNotOpenToDelegationTxns(user: AlgofiUser): Promise<Transaction[]> {
    const params = await getParams(this.algod)
    const txns = []
    const enc = new TextEncoder()

    const setNotOpenToDelegationTxn = makeApplicationNoOpTxnFromObject({
      from: user.address,
      appIndex: this.adminAppId,
      appArgs: [enc.encode(ADMIN_STRINGS.set_not_open_to_delegation)],
      suggestedParams: params,
      accounts: [user.governance.userAdminState.storageAddress],
      foreignAssets: undefined,
      foreignApps: undefined,
      rekeyTo: undefined
    })

    return [setNotOpenToDelegationTxn]
  }

  /**
   * This will create a proposal.
   * 
   * @param user - user who is trying to create the transaction.
   * @param title - title of the proposal to be created
   * @param link - link of the proposal to be created
   * @returns a list of transactions that when executed will create a proposal
   * with the title and link passed in on behalf of the user passed in.
   */
  async getCreateProposalTxns(user: AlgofiUser, title: string, link: string): Promise<Transaction[]> {
    const params = await getParams(this.algod)
    const txns = []
    const enc = new TextEncoder()

    // TODO figure out correct funding
    const fundAppTxn = makePaymentTxnWithSuggestedParamsFromObject({
      from: user.address,
      amount: 4000000,
      to: this.proposalFactoryAddress,
      suggestedParams: params,
      closeRemainderTo: undefined,
      rekeyTo: undefined
    })

    const validateUserAccountsTxn = makeApplicationNoOpTxnFromObject({
      from: user.address,
      appIndex: this.proposalFactoryAppId,
      appArgs: [enc.encode(PROPOSAL_FACTORY_STRINGS.validate_user_account)],
      suggestedParams: params,
      accounts: undefined,
      foreignAssets: undefined,
      foreignApps: undefined,
      rekeyTo: undefined
    })

    // TODO figure out if this fee is correct
    params.fee = 6000
    const proposalCreationTxn = makeApplicationNoOpTxnFromObject({
      from: user.address,
      appIndex: this.proposalFactoryAppId,
      appArgs: [enc.encode(PROPOSAL_FACTORY_STRINGS.create_proposal), enc.encode(title), enc.encode(link)],
      suggestedParams: params,
      accounts: [user.address],
      foreignAssets: undefined,
      foreignApps: [this.governanceClient.votingEscrow.appId, this.proposalTemplateId, this.adminAppId],
      rekeyTo: undefined
    })

    txns.push(fundAppTxn, validateUserAccountsTxn, proposalCreationTxn)
    return assignGroupID(txns)
  }
}
