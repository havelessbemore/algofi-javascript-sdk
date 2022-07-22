// IMPORTS

// global
import { parseAddressBytes } from "../../utils"

// local
import GovernanceClient from "./governanceClient"
import { ADMIN_STRINGS, PROPOSAL_STRINGS } from "./governanceConfig"

export default class UserAdminState {
  public storageAddress: string
  public openToDelegation: number
  public delegatorCount: number
  public delegatingTo: string
  public userProposalStates: { [key: number]: UserProposalState } = {}

  /**
   * Constructor for the user admin state class.
   * 
   * @param storageAddress - the address of the storage account for the user
   * @param userStorageLocalStates - list of local states for the user's storage account
   * @param governanceClient - a governance client
   */
  constructor(
    storageAddress: string,
    userStorageLocalStates: { [key: string]: {} },
    governanceClient: GovernanceClient
  ) {
    const proposals = Object.keys(governanceClient.admin.proposals).map(appId => parseInt(appId))
    this.storageAddress = storageAddress
    // Loop through to get storage account's local state on admin
    for (const [key, value] of Object.entries(userStorageLocalStates)) {
      const appId = parseInt(key)
      // Case when we have the storage account's local state with admin contract
      if (appId == governanceClient.admin.adminAppId) {
        this.openToDelegation = value[ADMIN_STRINGS.open_to_delegation]
        this.delegatorCount = value[ADMIN_STRINGS.delegator_count]
        this.delegatingTo = parseAddressBytes(value[ADMIN_STRINGS.delegating_to])
      }
      // If we have a proposal that the storage account is opted into
      if (proposals.includes(appId)) {
        this.userProposalStates[appId] = new UserProposalState(value)
      }
    }
  }
}
export class UserProposalState {
  public forOrAgainst: number
  public votingAmount: number
  /**
   * Constructor for the user proposal state object.
   *
   * @param storageProposalLocalState - an dictionary representing the local
   * state of the proposal contract with the admin contract.
   */
  constructor(storageProposalLocalState: {}) {
    this.forOrAgainst = storageProposalLocalState[PROPOSAL_STRINGS.for_or_against]
    this.votingAmount = storageProposalLocalState[PROPOSAL_STRINGS.voting_amount]
  }
}
