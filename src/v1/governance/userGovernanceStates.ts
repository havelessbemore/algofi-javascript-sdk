import { parseAddressBytes } from "../utils"
import { ADMIN_STRINGS, PROPOSAL_STRINGS, VOTING_ESCROW_STRINGS } from "./governanceConfig"
import Proposal from "./proposal"

export class UserVotingEscrowState {
  public amountLocked: number
  public lockStartTime: number
  public lockDuration: number
  public amountVeBank: number
  public boostMultiplier: number
  constructor(userLocalState: {}) {
    this.amountLocked = userLocalState[VOTING_ESCROW_STRINGS.user_amount_locked]
    this.lockStartTime = userLocalState[VOTING_ESCROW_STRINGS.user_lock_start_time]
    this.lockDuration = userLocalState[VOTING_ESCROW_STRINGS.user_lock_duration]
    this.amountVeBank = userLocalState[VOTING_ESCROW_STRINGS.user_amount_vebank]
    this.boostMultiplier = userLocalState[VOTING_ESCROW_STRINGS.user_boost_multiplier]
  }
}

// Make each kind of state their own file
export class UserAdminState {
  public storageAddress: string
  public openToDelegation: number
  public delegatorCount: number
  public delegatingTo: string
  public userProposalStates: { [key: number]: UserProposalState } = {}
  constructor(
    storageAddress: string,
    userStorageLocalStates: { [key: string]: {} },
    proposalList: string[],
    adminAppId: number
  ) {
    // TODO Fix name
    // pass in governance client instead of proposal list
    const proposalListNumbers = proposalList.map(proposal => parseInt(proposal))
    this.storageAddress = storageAddress
    // Loop through to get storage account's local state on admin
    for (const [key, value] of Object.entries(userStorageLocalStates)) {
      const appId = parseInt(key)
      // Case when we have the storage account's local state with admin contract
      if (appId == adminAppId) {
        this.openToDelegation = value[ADMIN_STRINGS.open_to_delegation]
        this.delegatorCount = value[ADMIN_STRINGS.delegator_count]
        this.delegatingTo = value[ADMIN_STRINGS.delegating_to]
      }
      // If we have a proposal that the storage account is opted into
      if (proposalListNumbers.includes(appId)) {
        this.userProposalStates[appId] = new UserProposalState(value)
      }
    }
  }
}

export class UserRewardsManagerState {}

export class UserProposalState {
  public forOrAgainst
  public votingAmount
  constructor(storageProposalLocalState: {}) {
    this.forOrAgainst = storageProposalLocalState[PROPOSAL_STRINGS.for_or_against]
    this.votingAmount = storageProposalLocalState[PROPOSAL_STRINGS.voting_amount]
  }
}
